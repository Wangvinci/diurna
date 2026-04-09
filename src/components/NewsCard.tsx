'use client';

import { useState } from 'react';
import { NewsItem } from '@/lib/types';
import { CategoryBadge } from './CategoryBadge';

export function NewsCard({ item }: { item: NewsItem }) {
  const [speaking, setSpeaking] = useState<'cn' | 'en' | null>(null);

  const speak = (text: string, lang: string, side: 'cn' | 'en') => {
    if (speaking) { speechSynthesis.cancel(); setSpeaking(null); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = 0.9;
    u.onend = () => setSpeaking(null);
    setSpeaking(side);
    speechSynthesis.speak(u);
  };

  return (
    <article className="border-t border-[var(--border)] pt-4 pb-5 hover:border-[var(--gold-dim)] transition-colors duration-300">
      {/* Meta row */}
      <div className="flex items-center gap-3 mb-3">
        <CategoryBadge category={item.category} />
        <span className="text-[var(--text-3)] text-[9px] tracking-wider">·</span>
        {item.url ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            className="text-[9px] tracking-wider text-[var(--text-3)] hover:text-[var(--gold)] transition-colors uppercase">
            {item.source} ↗
          </a>
        ) : (
          <span className="text-[9px] tracking-wider text-[var(--text-3)] uppercase">{item.source}</span>
        )}
        <span className="ml-auto text-[9px] text-[var(--text-3)] tabular-nums">
          {new Date(item.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Chinese */}
        <div>
          <div className="text-[8px] tracking-[0.2em] text-[var(--text-3)] mb-2">中文</div>
          <h3 className="font-display text-base font-medium text-[var(--text-1)] leading-snug mb-2">
            {item.title.cn}
          </h3>
          <p className="text-[12px] text-[var(--text-2)] leading-relaxed">{item.summary.cn}</p>
          <button onClick={() => speak(item.title.cn + '。' + item.summary.cn, 'zh-CN', 'cn')}
            className="mt-2.5 text-[9px] tracking-wider text-[var(--text-3)] hover:text-[var(--gold)] transition-colors uppercase">
            {speaking === 'cn' ? '■ 停止' : '▶ 朗读'}
          </button>
        </div>

        {/* English */}
        <div className="md:border-l md:border-[var(--border)] md:pl-10">
          <div className="text-[8px] tracking-[0.2em] text-[var(--text-3)] mb-2">ENGLISH</div>
          <h3 className="font-display text-base font-medium text-[var(--text-1)] leading-snug mb-2">
            {item.title.en}
          </h3>
          <p className="text-[12px] text-[var(--text-2)] leading-relaxed">{item.summary.en}</p>
          <button onClick={() => speak(item.title.en + '. ' + item.summary.en, 'en-GB', 'en')}
            className="mt-2.5 text-[9px] tracking-wider text-[var(--text-3)] hover:text-[var(--gold)] transition-colors uppercase">
            {speaking === 'en' ? '■ Stop' : '▶ Read'}
          </button>
        </div>
      </div>
    </article>
  );
}
