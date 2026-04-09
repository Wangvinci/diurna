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
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
    setIsPlaying(v => !v);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !hasAudio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * audioRef.current.duration;
  };

  return (
    <div className="border border-[var(--border)] p-5 hover:border-[var(--gold-dim)] transition-colors duration-300 group">
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="metadata"
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
        />
      )}

      <div className="flex items-center gap-4">
        {/* Play/Pause button */}
        <button
          onClick={toggle}
          className="w-10 h-10 border border-[var(--border)] group-hover:border-[var(--gold-dim)] hover:!border-[var(--gold)] flex items-center justify-center transition-all flex-shrink-0 text-[var(--gold)] relative"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
              <rect x="3" y="2" width="4" height="12" />
              <rect x="9" y="2" width="4" height="12" />
            </svg>
          ) : (
            <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 16 16">
              <polygon points="3,1 14,8 3,15" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] tracking-[0.2em] text-[var(--gold)] uppercase font-medium">
              {lang === 'cn' ? '中文' : 'EN'}
            </span>
            <span className="text-[var(--text-3)] text-[8px]">·</span>
            <span className="text-[10px] text-[var(--text-2)] truncate tracking-wide">{title}</span>
            {/* Waveform indicator while playing */}
            {isPlaying && (
              <div className="ml-auto flex items-end gap-[2px] h-3 flex-shrink-0">
                {[12, 18, 10, 20, 14].map((h, i) => (
                  <span
                    key={i}
                    className="waveform-bar opacity-70"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div
            className="h-[2px] bg-[var(--surface-2)] cursor-pointer relative"
            onClick={seek}
            role="slider"
            aria-valuenow={progress}
          >
            <div
              className="absolute inset-y-0 left-0 bg-[var(--gold)] opacity-75 transition-none"
              style={{ width: `${progress}%` }}
            />
            {/* Scrubber dot */}
            {hasAudio && progress > 0 && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-[var(--gold)] rounded-full -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${progress}%` }}
              />
            )}
          </div>

          {/* Time row */}
          <div className="flex justify-between mt-1.5 text-[9px] text-[var(--text-3)] tabular-nums">
            <span>{fmt(currentTime)}</span>
            {hasAudio
              ? <span>{fmt(duration)}</span>
              : <span className="italic opacity-60">{lang === 'cn' ? '生成中…' : 'Generating…'}</span>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
