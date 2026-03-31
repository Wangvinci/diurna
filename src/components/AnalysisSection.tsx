'use client';

import { CategoryAnalysis, DailyBriefing } from '@/lib/types';
import { CategoryBadge } from './CategoryBadge';
import { SplitView } from './SplitView';

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold mt-3 mb-1">{line.replace('### ', '')}</h3>;
        if (line.startsWith('- **')) {
          const match = line.match(/- \*\*(.+?)\*\*\s*(.*)/);
          if (match) return <p key={i} className="ml-2 mb-1"><strong>{match[1]}</strong> {match[2]}</p>;
        }
        if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.')) {
          return <p key={i} className="ml-4 mb-0.5 text-sm">{line}</p>;
        }
        if (line.trim() === '') return <br key={i} />;
        const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        return <p key={i} className="mb-2 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
    </div>
  );
}

export function CategoryAnalysisCard({ analysis }: { analysis: CategoryAnalysis }) {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-5">
      <div className="mb-3">
        <CategoryBadge category={analysis.category} />
      </div>
      <SplitView
        cn={
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{analysis.analysis.cn}</p>
            <div className="space-y-1">
              {analysis.keyTakeaways.map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500 mt-0.5">&#9679;</span>
                  <span className="text-gray-600 dark:text-gray-400">{t.cn}</span>
                </div>
              ))}
            </div>
          </div>
        }
        en={
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{analysis.analysis.en}</p>
            <div className="space-y-1">
              {analysis.keyTakeaways.map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500 mt-0.5">&#9679;</span>
                  <span className="text-gray-600 dark:text-gray-400">{t.en}</span>
                </div>
              ))}
            </div>
          </div>
        }
      />
    </div>
  );
}

export function ComprehensiveAnalysis({ briefing }: { briefing: DailyBriefing }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
        <SplitView
          cn={<MarkdownText text={briefing.comprehensiveAnalysis.cn} />}
          en={<MarkdownText text={briefing.comprehensiveAnalysis.en} />}
        />
      </div>
      <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/20 rounded-xl p-6">
        <SplitView
          cn={<MarkdownText text={briefing.investmentOutlook.cn} />}
          en={<MarkdownText text={briefing.investmentOutlook.en} />}
        />
      </div>
    </div>
  );
}
