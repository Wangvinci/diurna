'use client';

import { useState } from 'react';
import { NewsItem } from '@/lib/types';
import { CategoryBadge } from './CategoryBadge';
import { SplitView } from './SplitView';

export function NewsCard({ item }: { item: NewsItem }) {
  const [speaking, setSpeaking] = useState(false);

  const speak = (text: string, lang: string) => {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 p-5 hover:border-purple-500/30 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <CategoryBadge category={item.category} />
        <span className="text-xs text-gray-400">{item.source}</span>
        <span className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <SplitView
        cn={
          <div>
            <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">{item.title.cn}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.summary.cn}</p>
            <button
              onClick={() => speak(item.title.cn + '。' + item.summary.cn, 'zh-CN')}
              className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
              </svg>
              {speaking ? '停止' : '朗读'}
            </button>
          </div>
        }
        en={
          <div>
            <h3 className="font-bold text-base mb-2 text-gray-900 dark:text-white">{item.title.en}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.summary.en}</p>
            <button
              onClick={() => speak(item.title.en + '. ' + item.summary.en, 'en-GB')}
              className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
              </svg>
              {speaking ? 'Stop' : 'Read'}
            </button>
          </div>
        }
      />
    </div>
  );
}
