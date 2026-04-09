import Link from 'next/link';

interface HeaderProps {
  dateFormatted: string;
  allDates: string[];
  currentDate?: string;
  showBack?: boolean;
}

export function Header({ dateFormatted, allDates, currentDate, showBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <Link href="/" className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">D</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white leading-none">Diurna</div>
              <div className="text-[10px] text-gray-500 leading-none mt-0.5 truncate">{dateFormatted}</div>
            </div>
          </Link>
        </div>

        {/* Archive */}
        <div className="relative group flex-shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8" />
            </svg>
            往期
          </button>
          <div className="hidden group-hover:block absolute right-0 top-full mt-1.5 bg-gray-900 border border-white/10 rounded-xl shadow-2xl min-w-[160px] max-h-64 overflow-auto z-50">
            {allDates.map((d, i) => (
              <Link
                key={d}
                href={i === 0 ? '/' : `/archive/${d}`}
                className={`flex items-center justify-between px-4 py-2.5 text-xs hover:bg-white/5 transition-colors ${
                  d === currentDate ? 'text-purple-400 font-semibold' : 'text-gray-300'
                }`}
              >
                <span>{d}</span>
                {i === 0 && <span className="text-[10px] text-gray-600 ml-2">最新</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
