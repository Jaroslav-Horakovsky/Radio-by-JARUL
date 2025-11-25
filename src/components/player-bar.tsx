"use client";

import { usePlayer } from "@/context/player-context";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export function PlayerBar() {
  const { currentStation, isPlaying, togglePlay, volume, handleVolumeChange } = usePlayer();

  if (!currentStation) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/90 backdrop-blur-xl border-t border-zinc-800 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        
        {/* Station Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold truncate text-lg text-white">{currentStation.name}</h3>
          <p className="text-sm text-zinc-400 truncate">{currentStation.frequency} • {currentStation.genre}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-white/10"
          >
            {isPlaying ? <Pause className="fill-current" size={24} /> : <Play className="fill-current ml-1" size={24} />}
          </button>
        </div>

        {/* Volume */}
        <div className="hidden sm:flex items-center gap-3 w-48">
          <button 
            onClick={() => handleVolumeChange(volume === 0 ? 0.5 : 0)} 
            className="text-zinc-400 hover:text-white transition-colors"
          >
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white hover:accent-blue-400"
          />
        </div>
      </div>
    </div>
  );
}
