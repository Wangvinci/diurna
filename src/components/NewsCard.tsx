'use client';

import { useState } from 'react';
import { NewsItem } from '@/lib/types';
import { CategoryBadge } from './CategoryBadge';

export function NewsCard({ item }: { item: NewsItem }) {
  const [speaking, setSpeaking] = useState<'cn' | 'en' | null>(null);

  const speak = (text: string, lang: string, side: 'cn' | 'en') => {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(null);
    setSpeaking(side);
    speechSynthesis.speak(utterance);
  };

  const time = new Date(item.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <article className="group bg-gray-900 rounded-2xl border border-white/6 hover:border-white/12 transition-all duration-200 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-white/5">
        <CategoryBadge category={item.category} />
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-1"
          >
            {item.source}
            <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ) : (
          <span className="text-xs text-gray-500">{item.source}</span>
        )}
        <span className="ml-auto text-[10px] text-gray-700 tabular-nums">{time}</span>
      </div>

      {/* Split content */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
        {/* Chinese */}
        <div className="px-5 py-4">
          <div className="text-[10px] font-bold tracking-widest text-purple-500/70 mb-2">中文</div>
          <h3 className="font-semibold text-sm text-white leading-snug mb-2">{item.title.cn}</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{item.summary.cn}</p>
          <button
            onClick={() => speak(item.title.cn + '。' + item.summary.cn, 'zh-CN', 'cn')}
            className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-600 hover:text-purple-400 transition-colors"
          >
            <svg className="w-3 h-3" fill={speaking === 'cn' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
            </svg>
            {speaking === 'cn' ? '停止' : '朗读'}
          </button>
        </div>

        {/* English */}
        <div className="px-5 py-4">
          <div className="text-[10px] font-bold tracking-widest text-blue-500/70 mb-2">ENGLISH</div>
          <h3 className="font-semibold text-sm text-white leading-snug mb-2">{item.title.en}</h3>
          <p className="text-xs text-gray-400 leading-relaxed">{item.summary.en}</p>
          <button
            onClick={() => speak(item.title.en + '. ' + item.summary.en, 'en-GB', 'en')}
            className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-600 hover:text-blue-400 transition-colors"
          >
            <svg className="w-3 h-3" fill={speaking === 'en' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
            </svg>
            {speaking === 'en' ? 'Stop' : 'Read'}
          </button>
        </div>
      </div>
    </article>
  );
}
