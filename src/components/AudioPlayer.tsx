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
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play().catch(() => {}); }
    setIsPlaying(!isPlaying);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !hasAudio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioRef.current.duration;
  };

  const isCn = lang === 'cn';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-white/8 p-5 group hover:border-purple-500/30 transition-all duration-300">
      {/* Decorative glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${isCn ? 'bg-purple-500/5' : 'bg-blue-500/5'}`} />

      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="metadata" />}

      {/* Language tag */}
      <div className={`absolute top-4 right-4 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full ${isCn ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
        {isCn ? '中文' : 'EN'}
      </div>

      <div className="flex items-center gap-4">
        {/* Play button */}
        <button
          onClick={toggle}
          className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
            isPlaying
              ? 'bg-white text-gray-900 scale-95'
              : `${isCn ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'} text-white hover:scale-105`
          }`}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Info + progress */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate pr-10">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>

          <div className="mt-3 space-y-1">
            {/* Progress bar */}
            <div
              className="h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer group/bar"
              onClick={seek}
            >
              <div
                className={`h-full rounded-full transition-all ${isCn ? 'bg-purple-500' : 'bg-blue-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Time */}
            <div className="flex justify-between text-[10px] text-gray-600 tabular-nums">
              <span>{fmt(currentTime)}</span>
              {hasAudio ? <span>{fmt(duration)}</span> : <span className="italic text-gray-700">生成中…</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
