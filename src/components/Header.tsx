import Link from 'next/link';

interface HeaderProps {
  dateFormatted: string;
  allDates: string[];
  currentDate?: string;
  showBack?: boolean;
}

export function Header({ dateFormatted, allDates, currentDate, showBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm border-b border-[var(--border)]" style={{ background: 'color-mix(in srgb, var(--bg) 92%, transparent)' }}>
      <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <Link href="/" className="text-[var(--text-3)] hover:text-[var(--gold)] transition-colors text-xs">←</Link>
          )}
          <Link href="/" className="flex items-center gap-3">
            <span className="font-display text-lg font-light tracking-[0.15em] text-[var(--text-1)]">DIURNA</span>
            <span className="text-[var(--text-3)] text-[10px] tracking-widest hidden sm:block">INTELLIGENCE</span>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[var(--text-3)] text-[10px] tracking-wider hidden md:block">{dateFormatted}</span>
          <div className="relative group">
            <button className="text-[10px] tracking-widest text-[var(--text-3)] hover:text-[var(--gold)] transition-colors uppercase">
              Archive
            </button>
            <div className="hidden group-hover:block absolute right-0 top-full mt-2 bg-[var(--surface)] border border-[var(--border)] min-w-[160px] max-h-64 overflow-auto z-50">
              {allDates.map((d, i) => (
                <Link
                  key={d}
                  href={i === 0 ? '/' : `/archive/${d}`}
                  className={`block px-4 py-2.5 text-[10px] tracking-wider hover:text-[var(--gold)] transition-colors border-b border-[var(--border)] last:border-0 ${
                    d === currentDate ? 'text-[var(--gold)]' : 'text-[var(--text-2)]'
                  }`}
                >
                  {d} {i === 0 && <span className="text-[var(--text-3)]">— LATEST</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
