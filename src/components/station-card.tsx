"use client";

import { Station } from "@/types/station";
import { usePlayer } from "@/context/player-context";
import { Radio, AlertCircle, Edit2, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface StationCardProps {
  station: Station;
  isEditMode?: boolean;
  onDelete?: (station: Station) => void;
  onEdit?: (station: Station) => void;
  onMoveUp?: (station: Station) => void;
  onMoveDown?: (station: Station) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function StationCard({
  station,
  isEditMode = false,
  onDelete,
  onEdit,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}: StationCardProps) {
  const { currentStation, isPlaying, playStation, togglePlay, error } = usePlayer();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: station.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isCurrent = currentStation?.id === station.id;
  const isActive = isCurrent && isPlaying;
  const isError = isCurrent && error;

  const handleClick = () => {
    if (!isEditMode) {
      if (isCurrent) {
        togglePlay();
      } else {
        playStation(station);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isEditMode) return; // Disable 3D effect in edit mode

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -18; // Increased from 10 to 18 deg
    const rotateY = ((x - centerX) / centerX) * 18; // Increased from 10 to 18 deg

    setTilt({ rotateX, rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button
        {...attributes}
        {...listeners}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isEditMode
            ? undefined
            : `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(var(--scale, 1))`,
          transition: 'transform 0.1s ease-out',
          filter: isHovered && !isEditMode ? 'brightness(1.25)' : 'brightness(1)',
        }}
        className={`w-full text-left group relative overflow-hidden rounded-2xl border-2
        ${isEditMode ? "cursor-grab active:cursor-grabbing transition-all duration-300 ease-out" : "cursor-pointer hover:[--scale:1.1]"}
        ${isError
            ? "border-red-600 bg-red-900/10 backdrop-blur-sm"
            : isCurrent
              ? "border-blue-600 bg-blue-900/10 backdrop-blur-sm hover:border-blue-500 hover:bg-blue-900/30"
              : "border-zinc-700/30 bg-transparent hover:border-zinc-400/70 hover:bg-zinc-800/30 hover:backdrop-blur-sm"}
        hover:shadow-2xl hover:shadow-black/60 hover:z-10
        ${!isEditMode && !isError && !isCurrent ? 'hover:shadow-amber-500/40' : ''}
        ${!isEditMode && isCurrent ? 'hover:shadow-blue-500/50' : ''}`}
      >
        {/* Radial gradient overlay for text readability - only on transparent cards */}
        {!isCurrent && !isError && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 40%, transparent 70%)'
            }}
          />
        )}

        {/* Shine effect overlay - only visible on hover */}
        {!isEditMode && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(120deg, transparent 20%, rgba(255, 255, 255, 0.3) 50%, transparent 80%)',
              animation: 'shine 1.5s ease-in-out',
            }}
          />
        )}

        {/* Glow effect */}
        {!isEditMode && (
          <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none -z-10
            ${isError ? 'bg-red-500/50' : isCurrent ? 'bg-blue-500/50' : 'bg-amber-500/50'}`}
          />
        )}

        {/* Drag Handle - Only visible in edit mode */}
        {isEditMode && (
          <div
            className="absolute top-2 left-2 p-2 bg-zinc-800/50 backdrop-blur-sm rounded-lg hover:bg-zinc-700/70 transition-colors z-10"
          >
            <GripVertical size={20} className="text-zinc-400" />
          </div>
        )}

        <div className="p-6 flex flex-col items-center justify-center gap-4 relative z-10">
          <div className={`p-4 rounded-full transition-all duration-300 backdrop-blur-sm group-hover:rotate-[25deg] group-hover:scale-125
            ${isError
                ? "bg-red-600/70 text-white"
                : isCurrent
                  ? "bg-blue-600/70 text-white shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/60"
                  : "bg-zinc-800/70 text-zinc-500 group-hover:bg-zinc-700/90 group-hover:text-zinc-100 group-hover:shadow-amber-500/40"}`}>
            {isError ? <AlertCircle size={32} /> : <Radio size={32} />}
          </div>
          <div className="text-center space-y-1">
            <h3
              className={`font-bold text-xl transition-all duration-300 group-hover:scale-110 px-3 py-1 rounded-lg ${
                isError
                  ? "text-red-400"
                  : isCurrent
                    ? "text-blue-400 group-hover:text-blue-300"
                    : "text-amber-400 group-hover:text-amber-200"
              }`}
              style={{
                textShadow: isCurrent || isError ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 12px rgba(0, 0, 0, 0.6)'
              }}
            >
              {station.name}
            </h3>
            <p
              className="text-zinc-400 text-sm font-medium transition-colors group-hover:text-zinc-200 px-2 py-0.5 rounded"
              style={{
                textShadow: isCurrent || isError ? 'none' : '0 1px 6px rgba(0, 0, 0, 0.9)'
              }}
            >
              {station.frequency}
            </p>
          </div>
        </div>
        <div className="px-6 pb-6 text-center relative z-10">
          {isError ? (
            <span className="text-red-500 text-sm font-bold animate-pulse">
              {error}
            </span>
          ) : isActive ? (
            <span className="text-blue-500 text-sm font-bold animate-pulse flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
              Hraje se...
            </span>
          ) : (
            <span
              className="text-zinc-200 text-sm font-medium group-hover:text-zinc-50 transition-colors inline-block px-3 py-1 rounded-lg"
              style={{
                textShadow: '0 1px 6px rgba(0, 0, 0, 0.9)'
              }}
            >
              {station.genre}
            </span>
          )}
        </div>
      </button>

      {/* Edit Mode Controls */}
      {isEditMode && (
        <div className="absolute bottom-2 right-2 flex gap-2 z-20">
          {/* Move Up/Down Buttons */}
          <div className="flex flex-col gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp?.(station);
              }}
              disabled={isFirst}
              className={`p-1.5 rounded-lg transition-colors backdrop-blur-sm ${
                isFirst
                  ? "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
                  : "bg-zinc-800/70 text-zinc-400 hover:bg-zinc-700/70 hover:text-white"
              }`}
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown?.(station);
              }}
              disabled={isLast}
              className={`p-1.5 rounded-lg transition-colors backdrop-blur-sm ${
                isLast
                  ? "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
                  : "bg-zinc-800/70 text-zinc-400 hover:bg-zinc-700/70 hover:text-white"
              }`}
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(station);
            }}
            className="p-2 bg-blue-600/70 hover:bg-blue-700/70 backdrop-blur-sm text-white rounded-lg transition-colors"
          >
            <Edit2 size={18} />
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(station);
            }}
            className="p-2 bg-red-600/70 hover:bg-red-700/70 backdrop-blur-sm text-white rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }
      `}</style>
    </div>
  );
}
