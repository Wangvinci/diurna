'use client';

import { CategoryAnalysis, DailyBriefing } from '@/lib/types';
import { CategoryBadge } from './CategoryBadge';

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (!line.trim()) return null;
        if (line.startsWith('## ')) return (
          <h2 key={i} className="text-sm font-bold text-white mt-4 first:mt-0">{line.replace('## ', '')}</h2>
        );
        if (line.startsWith('### ')) return (
          <h3 key={i} className="text-xs font-semibold text-gray-300 mt-3">{line.replace('### ', '')}</h3>
        );
        if (line.startsWith('- **')) {
          const match = line.match(/- \*\*(.+?)\*\*\s*(.*)/);
          if (match) return (
            <p key={i} className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-200">{match[1]}</strong>{match[2] ? ` ${match[2]}` : ''}
            </p>
          );
        }
        if (/^\d+\./.test(line)) return (
          <p key={i} className="text-xs text-gray-400 leading-relaxed ml-3">{line}</p>
        );
        const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-200">$1</strong>');
        return (
          <p key={i} className="text-xs text-gray-400 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatted }} />
        );
      })}
    </div>
  );
}

export function CategoryAnalysisCard({ analysis }: { analysis: CategoryAnalysis }) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-white/6 overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-white/5 flex items-center gap-2">
        <CategoryBadge category={analysis.category} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
        <div className="px-5 py-4">
          <div className="text-[10px] font-bold tracking-widest text-purple-500/70 mb-3">中文</div>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">{analysis.analysis.cn}</p>
          <div className="space-y-2">
            {analysis.keyTakeaways.map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                <span className="text-xs text-gray-400 leading-relaxed">{t.cn}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="text-[10px] font-bold tracking-widest text-blue-500/70 mb-3">ENGLISH</div>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">{analysis.analysis.en}</p>
          <div className="space-y-2">
            {analysis.keyTakeaways.map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <span className="text-xs text-gray-400 leading-relaxed">{t.en}</span>
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
    <div className="space-y-4">
      {/* Comprehensive */}
      <div className="bg-gray-900 rounded-2xl border border-purple-500/15 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <span className="text-xs font-semibold text-gray-300">综合分析 · Comprehensive Analysis</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
          <div className="px-5 py-5">
            <div className="text-[10px] font-bold tracking-widest text-purple-500/70 mb-3">中文</div>
            <MarkdownText text={briefing.comprehensiveAnalysis.cn} />
          </div>
          <div className="px-5 py-5">
            <div className="text-[10px] font-bold tracking-widest text-blue-500/70 mb-3">ENGLISH</div>
            <MarkdownText text={briefing.comprehensiveAnalysis.en} />
          </div>
        </div>
      </div>

      {/* Investment Outlook */}
      <div className="bg-gray-900 rounded-2xl border border-amber-500/15 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-xs font-semibold text-gray-300">投资展望 · Investment Outlook</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
          <div className="px-5 py-5">
            <div className="text-[10px] font-bold tracking-widest text-purple-500/70 mb-3">中文</div>
            <MarkdownText text={briefing.investmentOutlook.cn} />
          </div>
          <div className="px-5 py-5">
            <div className="text-[10px] font-bold tracking-widest text-blue-500/70 mb-3">ENGLISH</div>
            <MarkdownText text={briefing.investmentOutlook.en} />
          </div>
        </div>
      </div>
    </div>
  );
}
