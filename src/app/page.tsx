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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="font-display text-4xl font-light tracking-[0.2em] text-[var(--text-3)]">DIURNA</span>
        <p className="text-[11px] tracking-widest text-[var(--text-3)] uppercase">Briefing available at 01:00 UK time</p>
      </div>
    );
  }

  const categories: Category[] = ['ai', 'tech', 'finance', 'investing', 'politics', 'current-affairs'];
  const dateFormatted = new Date(briefing.date + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <main className="min-h-screen">
      <Header dateFormatted={dateFormatted} allDates={allDates} currentDate={briefing.date} />

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-14">

        {/* Masthead */}
        <section className="border-b border-[var(--border)] pb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-[9px] tracking-[0.3em] text-[var(--text-3)] uppercase">
              Daily Intelligence Briefing
            </div>
            <div className="flex-1 h-px bg-[var(--border)]" />
            <div className="text-[9px] tracking-[0.2em] text-[var(--text-3)]">{briefing.date}</div>
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-light text-[var(--text-1)] leading-none tracking-tight mb-3">
            {new Date(briefing.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long' })}
          </h1>
          <div className="font-display text-lg sm:text-xl text-[var(--text-3)] font-light mb-8">
            {new Date(briefing.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>

          <div className="flex gap-10 pt-6 border-t border-[var(--border)]">
            <div>
              <div className="font-display text-3xl font-light text-[var(--gold)]">{briefing.news.length}</div>
              <div className="text-[9px] tracking-widest text-[var(--text-3)] uppercase mt-1">Stories</div>
            </div>
            <div className="w-px bg-[var(--border)]" />
            <div>
              <div className="font-display text-3xl font-light text-[var(--gold)]">{briefing.categoryAnalyses.length}</div>
              <div className="text-[9px] tracking-widest text-[var(--text-3)] uppercase mt-1">Sectors</div>
            </div>
            <div className="w-px bg-[var(--border)]" />
            <div>
              <div className="font-display text-3xl font-light text-[var(--gold)]">2</div>
              <div className="text-[9px] tracking-widest text-[var(--text-3)] uppercase mt-1">Languages</div>
            </div>
          </div>
        </section>

        {/* Podcast */}
        <section>
          <Label cn="每日播客" en="Audio Briefing" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <AudioPlayer title="每日简报 · 中文版" description={briefing.date} audioSrc={`https://github.com/Wangvinci/diurna/releases/download/audio-${briefing.date}/${briefing.date}-cn.mp3`} lang="cn" />
            <AudioPlayer title="Daily Briefing · English" description={briefing.date} audioSrc={`https://github.com/Wangvinci/diurna/releases/download/audio-${briefing.date}/${briefing.date}-en.mp3`} lang="en" />
          </div>
        </section>

        {/* Category Nav */}
        <nav className="flex flex-wrap gap-x-6 gap-y-2 border-y border-[var(--border)] py-3">
          {categories.map(cat => {
            const label = CATEGORY_LABELS[cat];
            const count = briefing.news.filter(n => n.category === cat).length;
            if (count === 0) return null;
            return (
              <a key={cat} href={`#${cat}`}
                className="text-[9px] tracking-[0.15em] text-[var(--text-3)] hover:text-[var(--gold)] transition-colors uppercase flex items-center gap-2">
                {label.en}
                <span className="text-[var(--text-3)] opacity-50">{count}</span>
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
              <div className="text-[9px] tracking-[0.25em] text-[var(--gold)] uppercase mb-1">{label.en}</div>
              <div className="text-[10px] tracking-wider text-[var(--text-3)] mb-4">{label.cn}</div>
              <div>
                {items.map(item => <NewsCard key={item.id} item={item} />)}
              </div>
            </section>
          );
        })}

        {/* Sector Analysis */}
        <section>
          <Label cn="分类分析" en="Sector Analysis" />
          <div className="mt-2">
            {briefing.categoryAnalyses.map(a => <CategoryAnalysisCard key={a.category} analysis={a} />)}
          </div>
        </section>

        {/* Deep Analysis */}
        <section>
          <Label cn="综合分析" en="Deep Analysis" />
          <div className="mt-6">
            <ComprehensiveAnalysis briefing={briefing} />
          </div>
        </section>

        <footer className="border-t border-[var(--border)] pt-8 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span className="font-display text-sm font-light tracking-[0.15em] text-[var(--text-3)]">DIURNA</span>
          <span className="text-[9px] tracking-wider text-[var(--text-3)] uppercase">
            Updated daily · 01:00 UK · <span className="italic font-display normal-case font-light">Acta diurna, 59 BC</span>
          </span>
        </footer>
      </div>
    </main>
  );
}

function Label({ cn, en }: { cn: string; en: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-1">
      <span className="text-[9px] tracking-[0.25em] text-[var(--gold)] uppercase">{en}</span>
      <span className="text-[var(--text-3)] text-[9px]">·</span>
      <span className="text-[10px] tracking-wider text-[var(--text-3)]">{cn}</span>
    </div>
  );
}
