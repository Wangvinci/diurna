'use client';

import { CategoryAnalysis, DailyBriefing } from '@/lib/types';
import { CategoryBadge } from './CategoryBadge';

function MarkdownText({ text }: { text: string }) {
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return null;
        if (line.startsWith('## ')) return (
          <p key={i} className="text-[10px] tracking-[0.18em] text-[var(--gold)] uppercase mt-4 first:mt-0">
            {line.replace('## ', '')}
          </p>
        );
        if (line.startsWith('### ')) return (
          <p key={i} className="text-[10px] tracking-wider text-[var(--text-2)] mt-3">
            {line.replace('### ', '')}
          </p>
        );
        const formatted = line
          .replace(/\*\*(.+?)\*\*/g, '<span style="color:var(--text-1)">$1</span>')
          .replace(/^- /, '— ');
        return (
          <p key={i} className="text-[12px] text-[var(--text-2)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      })}
    </div>
  );
}

export function CategoryAnalysisCard({ analysis }: { analysis: CategoryAnalysis }) {
  return (
    <div className="border-t border-[var(--border)] pt-5 pb-5">
      <div className="mb-4">
        <CategoryBadge category={analysis.category} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        <div>
          <div className="text-[8px] tracking-[0.2em] text-[var(--text-3)] mb-3">中文</div>
          <p className="text-[12px] text-[var(--text-2)] leading-relaxed mb-4">{analysis.analysis.cn}</p>
          <div className="space-y-1.5">
            {analysis.keyTakeaways.map((t, i) => (
              <div key={i} className="flex gap-3 text-[11px] text-[var(--text-2)]">
                <span className="text-[var(--gold)] opacity-60 flex-shrink-0">—</span>
                <span>{t.cn}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="md:border-l md:border-[var(--border)] md:pl-10">
          <div className="text-[8px] tracking-[0.2em] text-[var(--text-3)] mb-3">ENGLISH</div>
          <p className="text-[12px] text-[var(--text-2)] leading-relaxed mb-4">{analysis.analysis.en}</p>
          <div className="space-y-1.5">
            {analysis.keyTakeaways.map((t, i) => (
              <div key={i} className="flex gap-3 text-[11px] text-[var(--text-2)]">
                <span className="text-[var(--gold)] opacity-60 flex-shrink-0">—</span>
                <span>{t.en}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ComprehensiveAnalysis({ briefing }: { briefing: DailyBriefing }) {
  return (
    <div className="space-y-10">
      <div>
        <div className="text-[9px] tracking-[0.2em] text-[var(--gold)] uppercase mb-5">综合分析 · Comprehensive Analysis</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div>
            <div className="text-[8px] tracking-[0.2em] text-[var(--text-3)] mb-3">中文</div>
            <MarkdownText text={briefing.comprehensiveAnalysis.cn} />
          </div>
          <div className="md:border-l md:border-[var(--border)] md:pl-10">
            <div className="text-[8px] tracking-[0.2em] text-[var(--text-3)] mb-3">ENGLISH</div>
            <MarkdownText text={briefing.comprehensiveAnalysis.en} />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-8">
        <div className="text-[9px] tracking-[0.2em] text-[var(--gold)] uppercase mb-5">投资展望 · Investment Outlook</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div>
            <div className="text-[8px] tracking-[0.2em] text-[var(--text-3)] mb-3">中文</div>
            <MarkdownText text={briefing.investmentOutlook.cn} />
          </div>
          <div className="md:border-l md:border-[var(--border)] md:pl-10">
            <div className="text-[8px] tracking-[0.2em] text-[var(--text-3)] mb-3">ENGLISH</div>
            <MarkdownText text={briefing.investmentOutlook.en} />
          </div>
        </div>
      </div>
    </div>
  );
}
