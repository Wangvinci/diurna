'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { CalendarNav } from './CalendarNav';

interface HeaderProps {
  dateFormatted: string;
  allDates: string[];
  currentDate?: string;
  showBack?: boolean;
}

export function Header({ dateFormatted, allDates, currentDate, showBack }: HeaderProps) {
  const [calOpen, setCalOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!calOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setCalOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [calOpen]);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-sm border-b border-[var(--border)]"
      style={{ background: 'color-mix(in srgb, var(--bg) 92%, transparent)' }}
    >
      {/* Scroll progress bar */}
      <ScrollProgress />

      <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <Link href="/" className="text-[var(--text-3)] hover:text-[var(--gold)] transition-colors text-xs">
              ←
            </Link>
          )}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="font-display text-lg font-light tracking-[0.15em] text-[var(--text-1)] gold-shimmer">
              DIURNA
            </span>
            <span className="text-[var(--text-3)] text-[10px] tracking-widest hidden sm:block opacity-60">
              INTELLIGENCE
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[var(--text-3)] text-[10px] tracking-wider hidden md:block">{dateFormatted}</span>

          {/* Archive calendar trigger */}
          <div ref={panelRef} className="relative">
            <button
              onClick={() => setCalOpen(v => !v)}
              className={`text-[10px] tracking-widest uppercase transition-colors flex items-center gap-1.5 ${
                calOpen ? 'text-[var(--gold)]' : 'text-[var(--text-3)] hover:text-[var(--gold)]'
              }`}
            >
              <span>Archive</span>
              <span className={`text-[8px] transition-transform duration-200 ${calOpen ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>

            {calOpen && (
              <div className="absolute right-0 top-full mt-3 bg-[var(--surface)] border border-[var(--border)] p-4 z-50 shadow-xl shadow-black/40">
                <CalendarNav
                  allDates={allDates}
                  currentDate={currentDate}
                  onClose={() => setCalOpen(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Thin gold scroll progress bar at top of viewport
function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrolled = document.documentElement.scrollTop;
      const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setPct(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 h-[1px]">
      <div
        className="h-full bg-[var(--gold)] transition-all duration-100"
        style={{ width: `${pct}%`, opacity: pct > 0 ? 0.7 : 0 }}
      />
    </div>
  );
}
