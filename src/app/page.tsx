import { getBriefing, getLatestBriefingDate, getAllBriefingDates } from '@/lib/briefings';
import { Category, CATEGORY_LABELS } from '@/lib/types';
import { NewsCard } from '@/components/NewsCard';
import { CategoryAnalysisCard, ComprehensiveAnalysis } from '@/components/AnalysisSection';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Header } from '@/components/Header';
import { ScrollReveal, AnimatedCounter } from '@/components/ScrollReveal';

export default function HomePage() {
  const latestDate = getLatestBriefingDate();
  const briefing = getBriefing(latestDate);
  const allDates = getAllBriefingDates();

  if (!briefing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="font-display text-4xl font-light tracking-[0.2em] text-[var(--text-3)] anim-blur-in">DIURNA</span>
        <p className="text-[11px] tracking-widest text-[var(--text-3)] uppercase anim-fade-in delay-300">
          Briefing available at 01:00 UK time
        </p>
      </div>
    );
  }

  const categories: Category[] = ['ai', 'tech', 'finance', 'investing', 'politics', 'current-affairs'];
  const dateFormatted = new Date(briefing.date + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Build ticker from headlines
  const tickerItems = briefing.news.map(n => `${n.title.en}  ·  ${n.title.cn}`);

  return (
    <main className="min-h-screen">
      <Header dateFormatted={dateFormatted} allDates={allDates} currentDate={briefing.date} />

      {/* Breaking news ticker */}
      <div className="border-b border-[var(--border)] overflow-hidden">
        <div className="flex items-center">
          <div className="flex-shrink-0 px-4 py-2 border-r border-[var(--border)] bg-[var(--surface)]">
            <span className="text-[8px] tracking-[0.25em] text-[var(--gold)] uppercase font-medium">Today</span>
          </div>
          <div className="overflow-hidden flex-1 py-2">
            <div className="ticker-track">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span key={i} className="text-[9px] tracking-wider text-[var(--text-3)]">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-14">

        {/* Masthead */}
        <section className="border-b border-[var(--border)] pb-10">
          <div className="flex items-center gap-4 mb-6 anim-fade-in">
            <div className="text-[9px] tracking-[0.3em] text-[var(--text-3)] uppercase">
              Daily Intelligence Briefing
            </div>
            <div className="flex-1 h-px bg-[var(--border)] anim-line" />
            <div className="text-[9px] tracking-[0.2em] text-[var(--text-3)]">{briefing.date}</div>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-light text-[var(--text-1)] leading-none tracking-tight mb-3 anim-blur-in delay-100">
            {new Date(briefing.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long' })}
          </h1>
          <div className="font-display text-lg sm:text-xl text-[var(--text-3)] font-light mb-8 anim-fade-up delay-200">
            {new Date(briefing.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>

          <div className="flex gap-10 pt-6 border-t border-[var(--border)] anim-fade-up delay-300">
            <div>
              <div className="font-display text-3xl font-light text-[var(--gold)]">
                <AnimatedCounter value={briefing.news.length} />
              </div>
              <div className="text-[9px] tracking-widest text-[var(--text-3)] uppercase mt-1">Stories</div>
            </div>
            <div className="w-px bg-[var(--border)]" />
            <div>
              <div className="font-display text-3xl font-light text-[var(--gold)]">
                <AnimatedCounter value={briefing.categoryAnalyses.length} />
              </div>
              <div className="text-[9px] tracking-widest text-[var(--text-3)] uppercase mt-1">Sectors</div>
            </div>
            <div className="w-px bg-[var(--border)]" />
            <div>
              <div className="font-display text-3xl font-light text-[var(--gold)]">
                <AnimatedCounter value={2} />
              </div>
              <div className="text-[9px] tracking-widest text-[var(--text-3)] uppercase mt-1">Languages</div>
            </div>
          </div>
        </section>

        {/* Podcast */}
        <ScrollReveal>
          <section>
            <Label cn="每日播客" en="Audio Briefing" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              <AudioPlayer
                title="每日简报 · 中文版"
                description={briefing.date}
                audioSrc={`https://github.com/Wangvinci/diurna/releases/download/audio-${briefing.date}/${briefing.date}-cn.mp3`}
                lang="cn"
              />
              <AudioPlayer
                title="Daily Briefing · English"
                description={briefing.date}
                audioSrc={`https://github.com/Wangvinci/diurna/releases/download/audio-${briefing.date}/${briefing.date}-en.mp3`}
                lang="en"
              />
            </div>
          </section>
        </ScrollReveal>

        {/* Category Nav */}
        <ScrollReveal>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 border-y border-[var(--border)] py-3">
            {categories.map(cat => {
              const label = CATEGORY_LABELS[cat];
              const count = briefing.news.filter(n => n.category === cat).length;
              if (count === 0) return null;
              return (
                <a key={cat} href={`#${cat}`}
                  className="text-[9px] tracking-[0.15em] text-[var(--text-3)] hover:text-[var(--gold)] transition-colors uppercase flex items-center gap-2">
                  {label.en}
                  <span className="text-[var(--gold)] opacity-40 text-[8px]">{count}</span>
                </a>
              );
            })}
          </nav>
        </ScrollReveal>

        {/* News by Category */}
        {categories.map(cat => {
          const items = briefing.news.filter(n => n.category === cat);
          if (items.length === 0) return null;
          const label = CATEGORY_LABELS[cat];
          return (
            <section key={cat} id={cat}>
              <ScrollReveal>
                <div className="flex items-center gap-4 mb-5">
                  <div>
                    <div className="text-[9px] tracking-[0.25em] text-[var(--gold)] uppercase">{label.en}</div>
                    <div className="text-[10px] tracking-wider text-[var(--text-3)]">{label.cn}</div>
                  </div>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-[9px] text-[var(--text-3)]">{items.length}</span>
                </div>
              </ScrollReveal>
              <div>
                {items.map((item, idx) => (
                  <ScrollReveal key={item.id} delay={idx * 80}>
                    <NewsCard item={item} />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          );
        })}

        {/* Sector Analysis */}
        <ScrollReveal>
          <section>
            <Label cn="分类分析" en="Sector Analysis" />
            <div className="mt-2">
              {briefing.categoryAnalyses.map((a, i) => (
                <ScrollReveal key={a.category} delay={i * 60}>
                  <CategoryAnalysisCard analysis={a} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Deep Analysis */}
        <ScrollReveal>
          <section>
            <Label cn="综合分析" en="Deep Analysis" />
            <div className="mt-6">
              <ComprehensiveAnalysis briefing={briefing} />
            </div>
          </section>
        </ScrollReveal>

        <footer className="border-t border-[var(--border)] pt-8 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span className="font-display text-sm font-light tracking-[0.15em] text-[var(--text-3)] gold-shimmer">DIURNA</span>
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
