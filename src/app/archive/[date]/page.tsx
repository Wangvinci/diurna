import { getBriefing, getAllBriefingDates } from '@/lib/briefings';
import { Category, CATEGORY_LABELS } from '@/lib/types';
import { NewsCard } from '@/components/NewsCard';
import { CategoryAnalysisCard, ComprehensiveAnalysis } from '@/components/AnalysisSection';
import { AudioPlayer } from '@/components/AudioPlayer';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return getAllBriefingDates().map(date => ({ date }));
}

export default async function ArchivePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const briefing = getBriefing(date);
  const allDates = getAllBriefingDates();

  if (!briefing) {
    notFound();
  }

  const categories: Category[] = ['ai', 'tech', 'finance', 'investing', 'politics', 'current-affairs'];
  const dateFormatted = new Date(briefing.date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                Daily Pulse / 每日脉搏
              </h1>
              <p className="text-xs text-gray-500">{dateFormatted}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                Archive / 往期
              </button>
              <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl min-w-[160px] max-h-60 overflow-auto z-50">
                {allDates.map(d => (
                  <Link
                    key={d}
                    href={d === allDates[0] ? '/' : `/archive/${d}`}
                    className={`block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${d === date ? 'text-purple-600 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    {d} {d === allDates[0] && '(Latest)'}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Podcast Players */}
        <section>
          <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
            Daily Podcast / 每日播客
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AudioPlayer
              title="每日脉搏 - 中文版"
              description={`${briefing.date} | 5-10分钟语音简报`}
              audioSrc={`/audio/${briefing.date}-zh.mp3`}
            />
            <AudioPlayer
              title="Daily Pulse - English"
              description={`${briefing.date} | 5-10 min voice briefing`}
              audioSrc={`/audio/${briefing.date}-en.mp3`}
            />
          </div>
        </section>

        {/* Category Navigation */}
        <nav className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const label = CATEGORY_LABELS[cat];
            const count = briefing.news.filter(n => n.category === cat).length;
            return (
              <a
                key={cat}
                href={`#${cat}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium text-white ${label.color} hover:opacity-80 transition-opacity`}
              >
                {label.cn} / {label.en} ({count})
              </a>
            );
          })}
        </nav>

        {/* News by Category */}
        {categories.map(cat => {
          const items = briefing.news.filter(n => n.category === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat} id={cat}>
              <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${CATEGORY_LABELS[cat].color}`} />
                {CATEGORY_LABELS[cat].cn} / {CATEGORY_LABELS[cat].en}
              </h2>
              <div className="space-y-4">
                {items.map(item => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Category Analyses */}
        <section>
          <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
            Category Analysis / 分类分析
          </h2>
          <div className="space-y-4">
            {briefing.categoryAnalyses.map(a => (
              <CategoryAnalysisCard key={a.category} analysis={a} />
            ))}
          </div>
        </section>

        {/* Comprehensive Analysis */}
        <section>
          <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
            Comprehensive Analysis / 综合分析
          </h2>
          <ComprehensiveAnalysis briefing={briefing} />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-800">
          <p>Daily Pulse / 每日脉搏 - AI-powered daily intelligence briefing</p>
          <p className="mt-1">Updated daily at 01:00 UK time</p>
        </footer>
      </div>
    </main>
  );
}
