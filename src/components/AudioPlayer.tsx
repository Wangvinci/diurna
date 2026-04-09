'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  title: string;
  description: string;
  audioSrc?: string;
  lang?: 'cn' | 'en';
}

export function AudioPlayer({ title, description, audioSrc, lang = 'en' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasAudio, setHasAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  useEffect(() => {
    if (!audioSrc) return;
    const audio = audioRef.current;
    if (!audio) return;
    const onLoaded = () => { setDuration(audio.duration); setHasAudio(true); };
    const onTime = () => { setCurrentTime(audio.currentTime); setProgress((audio.currentTime / audio.duration) * 100 || 0); };
    const onEnded = () => { setIsPlaying(false); setProgress(0); setCurrentTime(0); };
    const onError = () => setHasAudio(false);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [audioSrc]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause(); else audioRef.current.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !hasAudio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioRef.current.duration;
  };

  return (
    <div className="border border-[var(--border)] p-5 hover:border-[var(--gold-dim)] transition-colors duration-300">
      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="metadata" />}

      <div className="flex items-center gap-5">
        <button onClick={toggle}
          className="w-9 h-9 border border-[var(--border)] hover:border-[var(--gold)] flex items-center justify-center transition-colors flex-shrink-0 text-[var(--gold)]">
          {isPlaying ? (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
              <rect x="3" y="2" width="4" height="12" /><rect x="9" y="2" width="4" height="12" />
            </svg>
          ) : (
            <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 16 16">
              <polygon points="3,1 14,8 3,15" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[9px] tracking-[0.18em] text-[var(--gold)] uppercase">{lang === 'cn' ? '中文' : 'EN'}</span>
            <span className="text-[11px] text-[var(--text-2)] truncate">{title}</span>
          </div>
          <div className="h-px bg-[var(--surface)] cursor-pointer relative" onClick={seek}>
            <div className="absolute inset-y-0 left-0 bg-[var(--gold)]" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-[var(--text-3)] tabular-nums">
            <span>{fmt(currentTime)}</span>
            {hasAudio ? <span>{fmt(duration)}</span> : <span className="italic">{lang === 'cn' ? '生成中…' : 'Generating…'}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
