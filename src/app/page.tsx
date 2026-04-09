import { getBriefing, getLatestBriefingDate, getAllBriefingDates } from '@/lib/briefings';
import { Category, CATEGORY_LABELS } from '@/lib/types';
import { NewsCard } from '@/components/NewsCard';
import { CategoryAnalysisCard, ComprehensiveAnalysis } from '@/components/AnalysisSection';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Header } from '@/components/Header';

export default function HomePage() {
  const latestDate = getLatestBriefingDate();
  const briefing = getBriefing(latestDate);
  const allDates = getAllBriefingDates();

  if (!briefing) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
          <span className="text-white font-bold">D</span>
        </div>
        <p className="text-gray-500 text-sm">No briefing yet — check back after 01:00 UK time.</p>
      </div>
    );
  }

  const categories: Category[] = ['ai', 'tech', 'finance', 'investing', 'politics', 'current-affairs'];
  const dateFormatted = new Date(briefing.date + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <Header dateFormatted={dateFormatted} allDates={allDates} currentDate={briefing.date} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* Hero date + stats */}
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
          <div>
            <p className="text-xs font-bold tracking-widest text-purple-500/80 uppercase mb-1">Daily Intelligence Briefing</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{briefing.date}</h1>
            <p className="text-sm text-gray-500 mt-1">{dateFormatted}</p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{briefing.news.length}</div>
              <div className="text-[10px] text-gray-600 uppercase tracking-wider">Stories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{briefing.categoryAnalyses.length}</div>
              <div className="text-[10px] text-gray-600 uppercase tracking-wider">Sectors</div>
            </div>
          </div>
        </section>

        {/* Podcast Players */}
        <section>
          <SectionTitle cn="每日播客" en="Daily Podcast" icon="🎙" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <AudioPlayer
              title="每日脉搏 · 中文版"
              description={`${briefing.date} · 语音简报`}
              audioSrc={`/audio/${briefing.date}-cn.mp3`}
              lang="cn"
            />
            <AudioPlayer
              title="Diurna · English"
              description={`${briefing.date} · Voice briefing`}
              audioSrc={`/audio/${briefing.date}-en.mp3`}
              lang="en"
            />
          </div>
        </section>

        {/* Category Nav */}
        <nav className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const label = CATEGORY_LABELS[cat];
            const count = briefing.news.filter(n => n.category === cat).length;
            if (count === 0) return null;
            return (
              <a
                key={cat}
                href={`#${cat}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium text-white ${label.color} hover:opacity-80 transition-opacity flex items-center gap-1.5`}
              >
                <span>{label.cn}</span>
                <span className="opacity-60">/</span>
                <span>{label.en}</span>
                <span className="bg-black/20 rounded-full px-1.5 py-0.5 text-[10px]">{count}</span>
              </a>
            );
          })}
        </nav>

        {/* News by Category */}
        {categories.map(cat => {
          const items = briefing.news.filter(n => n.category === cat);
          if (items.length === 0) return null;
          const label = CATEGORY_LABELS[cat];
          return (
            <section key={cat} id={cat}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-1 h-5 rounded-full ${label.color}`} />
                <h2 className="text-sm font-bold text-white">{label.cn} · {label.en}</h2>
                <span className="text-[10px] text-gray-600">{items.length} stories</span>
              </div>
              <div className="space-y-3">
                {items.map(item => <NewsCard key={item.id} item={item} />)}
              </div>
            </section>
          );
        })}

        {/* Category Analyses */}
        <section>
          <SectionTitle cn="分类分析" en="Sector Analysis" icon="📊" />
          <div className="space-y-3 mt-4">
            {briefing.categoryAnalyses.map(a => (
              <CategoryAnalysisCard key={a.category} analysis={a} />
            ))}
          </div>
        </section>

        {/* Comprehensive Analysis */}
        <section>
          <SectionTitle cn="综合分析 · 投资展望" en="Deep Analysis · Investment Outlook" icon="🔭" />
          <div className="mt-4">
            <ComprehensiveAnalysis briefing={briefing} />
          </div>
        </section>

        <footer className="text-center py-8 border-t border-white/5 text-[11px] text-gray-700 space-y-1">
          <p>Diurna · AI-powered daily intelligence briefing</p>
          <p>Updated daily at 01:00 UK time · <span className="text-gray-600">Acta diurna — Caesar, 59 BC</span></p>
        </footer>
      </div>
    </main>
  );
}

function SectionTitle({ cn, en, icon }: { cn: string; en: string; icon: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base">{icon}</span>
      <h2 className="text-sm font-bold text-white">{cn}</h2>
      <span className="text-gray-700 text-sm">·</span>
      <span className="text-xs text-gray-500">{en}</span>
    </div>
  );
}
