'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CalendarNavProps {
  allDates: string[];
  currentDate?: string;
  onClose?: () => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarNav({ allDates, currentDate, onClose }: CalendarNavProps) {
  const dateSet = new Set(allDates);
  const latestDate = allDates[0] || '';

  const initial = latestDate
    ? new Date(latestDate + 'T12:00:00')
    : new Date();

  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth()); // 0-indexed

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const monthLabel = new Date(viewYear, viewMonth, 1)
    .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const prev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const next = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="w-[220px] animate-cal-in">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          onClick={prev}
          className="w-5 h-5 flex items-center justify-center text-[var(--text-3)] hover:text-[var(--gold)] transition-colors text-[10px]"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="text-[9px] tracking-[0.2em] text-[var(--text-2)] uppercase select-none">
          {monthLabel}
        </span>
        <button
          onClick={next}
          className="w-5 h-5 flex items-center justify-center text-[var(--text-3)] hover:text-[var(--gold)] transition-colors text-[10px]"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-[8px] tracking-wider text-[var(--text-3)] py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;

          const mm = String(viewMonth + 1).padStart(2, '0');
          const dd = String(day).padStart(2, '0');
          const dateStr = `${viewYear}-${mm}-${dd}`;
          const hasBriefing = dateSet.has(dateStr);
          const isCurrent = dateStr === currentDate;
          const isLatest = dateStr === latestDate;

          if (!hasBriefing) {
            return (
              <div key={i} className="flex items-center justify-center h-7">
                <span className="text-[10px] text-[var(--text-3)] opacity-40">{day}</span>
              </div>
            );
          }

          const href = isLatest ? '/' : `/archive/${dateStr}`;
          return (
            <Link
              key={i}
              href={href}
              onClick={onClose}
              className={`relative flex flex-col items-center justify-center h-7 group transition-colors ${
                isCurrent ? 'text-[var(--gold)]' : 'text-[var(--text-1)] hover:text-[var(--gold)]'
              }`}
            >
              <span className="text-[10px] font-medium leading-none">{day}</span>
              <span className={`mt-0.5 block w-[3px] h-[3px] rounded-full transition-opacity ${
                isCurrent
                  ? 'bg-[var(--gold)]'
                  : 'bg-[var(--gold)] opacity-40 group-hover:opacity-80'
              }`} />
            </Link>
          );
        })}
      </div>

      {/* Footer count */}
      <div className="mt-3 pt-2 border-t border-[var(--border)] text-center">
        <span className="text-[8px] tracking-[0.15em] text-[var(--text-3)] uppercase">
          {allDates.length} {allDates.length === 1 ? 'edition' : 'editions'}
        </span>
      </div>
    </div>
  );
}
