"use client";

import { Station } from "@/types/station";
import { usePlayer } from "@/context/player-context";
import { Radio, AlertCircle, Edit2, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button
        {...attributes}
        {...listeners}
        onClick={handleClick}
        className={`w-full text-left group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ease-out backdrop-blur-xl hover:scale-105 hover:shadow-2xl hover:shadow-black/50 hover:z-10
        ${isEditMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
        ${isError
            ? "border-red-600 bg-red-900/10"
            : isCurrent
              ? "border-blue-600 bg-blue-900/10 hover:border-blue-500 hover:bg-blue-900/20"
              : "border-zinc-700/30 bg-zinc-900/15 hover:border-zinc-400/50 hover:bg-zinc-800/40"}`}
      >
        {/* Drag Handle - Only visible in edit mode */}
        {isEditMode && (
          <div
            className="absolute top-2 left-2 p-2 bg-zinc-800/70 backdrop-blur-md rounded-lg hover:bg-zinc-700/70 transition-colors z-10"
          >
            <GripVertical size={20} className="text-zinc-400" />
          </div>
        )}

        <div className="p-6 flex flex-col items-center justify-center gap-4">
          <div className={`p-4 rounded-full transition-colors backdrop-blur-md
            ${isError
                ? "bg-red-600/70 text-white"
                : isCurrent
                  ? "bg-blue-600/70 text-white shadow-lg shadow-blue-600/20"
                  : "bg-zinc-800/50 text-zinc-500 group-hover:bg-zinc-700/50 group-hover:text-zinc-300"}`}>
            {isError ? <AlertCircle size={32} /> : <Radio size={32} />}
          </div>
          <div className="text-center space-y-1">
            <h3 className={`font-bold text-xl ${isError ? "text-red-400" : isCurrent ? "text-blue-400" : "text-zinc-800"}`}>{station.name}</h3>
            <p className="text-zinc-400 text-sm font-medium">{station.frequency}</p>
          </div>
        </div>
        <div className="px-6 pb-6 text-center">
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
            <span className="text-zinc-500 text-sm font-medium">{station.genre}</span>
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
              className={`p-1.5 rounded-lg transition-colors backdrop-blur-md ${
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
              className={`p-1.5 rounded-lg transition-colors backdrop-blur-md ${
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
            className="p-2 bg-blue-600/70 hover:bg-blue-700/70 backdrop-blur-md text-white rounded-lg transition-colors"
          >
            <Edit2 size={18} />
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(station);
            }}
            className="p-2 bg-red-600/70 hover:bg-red-700/70 backdrop-blur-md text-white rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
