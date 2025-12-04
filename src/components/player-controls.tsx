"use client";

import React, { useState } from "react";
import { SkipBack, SkipForward, Rewind, FastForward } from "lucide-react";

// ✅ Helper funkce pro formatování času (MM:SS)
export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ✅ Props pro TrackNavigationButtons
interface TrackNavigationButtonsProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function TrackNavigationButtons({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext
}: TrackNavigationButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Previous Track Button */}
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-zinc-400"
        title="Předchozí skladba"
      >
        <SkipBack size={20} />
      </button>

      {/* Next Track Button */}
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-zinc-400"
        title="Další skladba"
      >
        <SkipForward size={20} />
      </button>
    </div>
  );
}

// ✅ Props pro SeekButtons
interface SeekButtonsProps {
  onSeekBackward: () => void;
  onSeekForward: () => void;
}

export function SeekButtons({ onSeekBackward, onSeekForward }: SeekButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Seek Backward 10s */}
      <button
        onClick={onSeekBackward}
        className="p-2 text-zinc-400 hover:text-white transition-colors"
        title="Přetočit o 10s zpět"
      >
        <Rewind size={20} />
      </button>

      {/* Seek Forward 10s */}
      <button
        onClick={onSeekForward}
        className="p-2 text-zinc-400 hover:text-white transition-colors"
        title="Přetočit o 10s vpřed"
      >
        <FastForward size={20} />
      </button>
    </div>
  );
}

// ✅ Props pro TrackProgressBar
interface TrackProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function TrackProgressBar({ currentTime, duration, onSeek }: TrackProgressBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, hoverX / rect.width));
    const time = percentage * duration;
    setHoverTime(time);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  return (
    <div className="w-full">
      {/* Time Display + Progress Bar */}
      <div className="flex items-center gap-3">
        {/* Current Time */}
        <span className="text-xs text-zinc-400 font-mono min-w-[35px]">
          {formatTime(currentTime)}
        </span>

        {/* Progress Bar Container */}
        <div className="flex-1 relative">
          <div
            className="h-1 bg-zinc-700 rounded-full cursor-pointer group relative"
            onClick={handleSeek}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Progress Fill */}
            <div
              className="h-full bg-blue-500 rounded-full transition-all group-hover:bg-blue-400"
              style={{ width: `${progress}%` }}
            />

            {/* Seek Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
            />

            {/* Hover Time Tooltip */}
            {hoverTime !== null && (
              <div
                className="absolute -top-8 bg-zinc-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none"
                style={{
                  left: `${(hoverTime / duration) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>
        </div>

        {/* Total Duration */}
        <span className="text-xs text-zinc-400 font-mono min-w-[35px]">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

// ✅ Hlavní komponenta pro všechny kontroly
interface PlayerControlsProps {
  // Track navigation
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;

  // Seek controls
  onSeekBackward: () => void;
  onSeekForward: () => void;

  // Progress bar
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;

  // Visibility
  showControls: boolean;
}

export function PlayerControls({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onSeekBackward,
  onSeekForward,
  currentTime,
  duration,
  onSeek,
  showControls
}: PlayerControlsProps) {
  if (!showControls) return null;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Navigation + Seek Buttons */}
      <div className="flex items-center justify-center gap-2">
        <TrackNavigationButtons
          onPrevious={onPrevious}
          onNext={onNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        />
        <SeekButtons
          onSeekBackward={onSeekBackward}
          onSeekForward={onSeekForward}
        />
      </div>

      {/* Progress Bar */}
      <TrackProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
      />
    </div>
  );
}
