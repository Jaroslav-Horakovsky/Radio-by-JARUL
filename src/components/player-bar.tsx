"use client";

import { usePlayer } from "@/context/player-context";
import { Play, Pause, Volume2, VolumeX, Music, Radio, Repeat, Repeat1, Shuffle } from "lucide-react";
import { PlayerControls } from "@/components/player-controls";

export function PlayerBar() {
  const {
    currentStation,
    currentLocalTrack,
    currentTrackType,
    isPlaying,
    togglePlay,
    volume,
    handleVolumeChange,
    nowPlaying,
    // Pokročilé ovládání
    currentTime,
    duration,
    currentTrackIndex,
    currentPlaylist,
    playNextTrack,
    playPreviousTrack,
    seekTo,
    seekForward,
    seekBackward,
    // ✅ NOVÉ v0.5.0: Loop a Shuffle
    loopMode,
    shuffleEnabled,
    toggleLoopMode,
    toggleShuffle
  } = usePlayer();

  // Pokud nehraje nic, nezobrazuj player bar
  if (!currentStation && !currentLocalTrack) return null;

  // Určení názvu tracku podle typu
  const trackName = currentTrackType === 'radio'
    ? currentStation?.name
    : currentLocalTrack?.metadata?.title || currentLocalTrack?.name;

  // Určení detailů podle typu
  const trackDetails = currentTrackType === 'radio'
    ? `${currentStation?.frequency} • ${currentStation?.genre}`
    : `${currentLocalTrack?.metadata?.artist} • ${currentLocalTrack?.metadata?.album}`;

  // Ikona podle typu
  const TrackIcon = currentTrackType === 'radio' ? Radio : Music;

  // Určení, zda zobrazit pokročilé kontroly
  const showAdvancedControls = currentTrackType === 'local';

  // Určení, zda jsou k dispozici další/předchozí tracky
  const hasPrevious = currentPlaylist.length > 1;
  const hasNext = currentPlaylist.length > 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/90 backdrop-blur-xl border-t border-zinc-800 z-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4">

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <TrackIcon size={16} className="text-zinc-400 flex-shrink-0" />
              <span className="text-xs text-zinc-500 uppercase">
                {currentTrackType === 'radio' ? 'Radio' : 'Local'}
              </span>
            </div>
            <h3 className="font-bold truncate text-lg text-white">{trackName}</h3>
            <p className="text-sm text-zinc-400 truncate">{trackDetails}</p>

            {/* Now Playing */}
            {isPlaying && nowPlaying && (
              <div className="flex items-center gap-2 mt-1">
                <Music size={14} className="text-blue-400 flex-shrink-0" />
                <p className="text-sm text-blue-400 truncate animate-pulse">
                  {nowPlaying}
                </p>
              </div>
            )}
          </div>

          {/* ✅ AKTUALIZOVÁNO: Kontroly s Loop/Shuffle tlačítky */}
          <div className="flex flex-col items-center gap-3">
            {showAdvancedControls ? (
              // Pokročilé kontroly pro lokální soubory
              <div className="flex flex-col items-center gap-2">
                {/* Hlavní tlačítka */}
                <div className="flex items-center gap-2">
                  {/* Previous Track */}
                  <button
                    onClick={playPreviousTrack}
                    disabled={!hasPrevious}
                    className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Předchozí skladba"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="19 20 9 12 19 4 19 20"></polygon>
                      <line x1="5" y1="19" x2="5" y2="5"></line>
                    </svg>
                  </button>

                  {/* Seek Backward 10s */}
                  <button
                    onClick={() => seekBackward(10)}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                    title="Přetočit o 10s zpět"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 19 2 12 11 5 11 19"></polygon>
                      <polygon points="22 19 13 12 22 5 22 19"></polygon>
                    </svg>
                  </button>

                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-white/10"
                  >
                    {isPlaying ? (
                      <Pause className="fill-current" size={20} />
                    ) : (
                      <Play className="fill-current ml-1" size={20} />
                    )}
                  </button>

                  {/* Seek Forward 10s */}
                  <button
                    onClick={() => seekForward(10)}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                    title="Přetočit o 10s vpřed"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 19 22 12 13 5 13 19"></polygon>
                      <polygon points="2 19 11 12 2 5 2 19"></polygon>
                    </svg>
                  </button>

                  {/* Next Track */}
                  <button
                    onClick={playNextTrack}
                    disabled={!hasNext}
                    className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Další skladba"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 4 15 12 5 20 5 4"></polygon>
                      <line x1="19" y1="5" x2="19" y2="19"></line>
                    </svg>
                  </button>
                </div>

                {/* ✅ NOVÉ v0.5.0: Loop a Shuffle tlačítka */}
                <div className="flex items-center gap-1">
                  {/* Loop Button */}
                  <button
                    onClick={toggleLoopMode}
                    className={`p-2 transition-colors ${
                      loopMode !== 'off' ? 'text-blue-400' : 'text-zinc-400 hover:text-white'
                    }`}
                    title={
                      loopMode === 'off' ? 'Opakování vypnuto' :
                      loopMode === 'playlist' ? 'Opakovat playlist' :
                      'Opakovat skladbu'
                    }
                  >
                    {loopMode === 'one' ? (
                      <Repeat1 size={18} />
                    ) : (
                      <Repeat size={18} />
                    )}
                  </button>

                  {/* Shuffle Button */}
                  <button
                    onClick={toggleShuffle}
                    className={`p-2 transition-colors ${
                      shuffleEnabled ? 'text-blue-400' : 'text-zinc-400 hover:text-white'
                    }`}
                    title={shuffleEnabled ? 'Náhodné pořadí zapnuto' : 'Náhodné pořadí vypnuto'}
                  >
                    <Shuffle size={18} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-[300px] flex items-center gap-2">
                  {/* Current Time */}
                  <span className="text-xs text-zinc-400 font-mono min-w-[35px]">
                    {formatTime(currentTime)}
                  </span>

                  {/* Progress Bar */}
                  <div className="flex-1 relative">
                    <div
                      className="h-1 bg-zinc-700 rounded-full cursor-pointer group relative"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const percentage = clickX / rect.width;
                        const newTime = percentage * duration;
                        seekTo(newTime);
                      }}
                    >
                      {/* Progress Fill */}
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all group-hover:bg-blue-400"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      />

                      {/* Seek Handle */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Total Duration */}
                  <span className="text-xs text-zinc-400 font-mono min-w-[35px]">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>
            ) : (
              // Základní kontroly pro rádio
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-white/10"
              >
                {isPlaying ? (
                  <Pause className="fill-current" size={24} />
                ) : (
                  <Play className="fill-current ml-1" size={24} />
                )}
              </button>
            )}
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
    </div>
  );
}

// Helper funkce pro formatování času (MM:SS)
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
