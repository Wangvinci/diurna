'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  title: string;
  description: string;
  audioSrc?: string;
}

export function AudioPlayer({ title, description, audioSrc }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState('0:00');
  const [currentTime, setCurrentTime] = useState('0:00');
  const [hasAudio, setHasAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!audioSrc) return;
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      setDuration(formatTime(audio.duration));
      setHasAudio(true);
    };
    const onTime = () => {
      setCurrentTime(formatTime(audio.currentTime));
      setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnded = () => { setIsPlaying(false); setProgress(0); setCurrentTime('0:00'); };
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
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !hasAudio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  };

  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-5">
      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="metadata" />}
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="w-14 h-14 flex-shrink-0 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-colors"
        >
          {isPlaying ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          {!hasAudio && !audioSrc && (
            <p className="text-xs text-gray-500 mt-1 italic">Audio generating... / 音频生成中...</p>
          )}
          <div
            className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
            onClick={seek}
          >
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="text-xs text-gray-500 flex-shrink-0 tabular-nums">
          {currentTime} / {duration}
        </div>
      </div>
    </div>
  );
}
