"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Station } from "@/types/station";
import { LocalTrack } from "@/types/electron";

// ✅ AKTUALIZOVÁNO: Rozšířeno o loop a shuffle
interface PlayerContextType {
  isPlaying: boolean;
  currentStation: Station | null;
  currentLocalTrack: LocalTrack | null;
  currentTrackType: 'radio' | 'local' | null;
  nowPlaying: string | null;
  error: string | null;
  togglePlay: () => void;
  playStation: (station: Station) => void;
  playLocalTrack: (track: LocalTrack) => void;
  volume: number;
  handleVolumeChange: (val: number) => void;

  // Pokročilé ovládání
  currentTime: number;
  duration: number;
  currentTrackIndex: number;
  currentPlaylist: LocalTrack[];

  // Track navigation
  playNextTrack: () => void;
  playPreviousTrack: () => void;

  // Seek controls
  seekTo: (time: number) => void;
  seekForward: (seconds: number) => void;
  seekBackward: (seconds: number) => void;

  // Playlist context
  setPlaylistContext: (tracks: LocalTrack[], index: number) => void;

  // ✅ NOVÉ v0.5.0: Loop a Shuffle
  loopMode: 'off' | 'playlist' | 'one';
  shuffleEnabled: boolean;
  toggleLoopMode: () => void;
  toggleShuffle: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [currentLocalTrack, setCurrentLocalTrack] = useState<LocalTrack | null>(null);
  const [currentTrackType, setCurrentTrackType] = useState<'radio' | 'local' | null>(null);
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State pro pokročilé ovládání
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentPlaylist, setCurrentPlaylist] = useState<LocalTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);

  // ✅ NOVÝ v0.5.0: State pro Loop a Shuffle
  const [loopMode, setLoopMode] = useState<'off' | 'playlist' | 'one'>('off');
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Setup Electron metadata listeners (existing)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron) {
      console.log('[PlayerContext] Electron detected, setting up metadata listeners');

      window.electron.onMetadataUpdate((data) => {
        console.log('[PlayerContext] Metadata update:', data);
        if (data.supported && data.title) {
          setNowPlaying(data.title);
        } else if (!data.supported) {
          setNowPlaying(null);
        }
      });

      window.electron.onMetadataError((data) => {
        console.error('[PlayerContext] Metadata error:', data.error);
      });

      return () => {
        window.electron?.removeAllListeners();
      };
    }
  }, []);

  // ✅ AKTUALIZOVÁNO: Audio event listeners s loop logikou
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      console.log('[PlayerContext] Track ended, checking loop/shuffle...');
      // Auto-play pokud je to lokální soubor
      if (currentTrackType === 'local') {
        playNextTrack(); // Už obsahuje loop a shuffle logiku
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, currentPlaylist.length, currentTrackType, loopMode, shuffleEnabled, shuffledOrder]);

  // ✅ NOVÝ v0.5.0: Toggle loop mode (off → playlist → one → off)
  const toggleLoopMode = () => {
    setLoopMode(prev => {
      const nextMode = prev === 'off' ? 'playlist' : prev === 'playlist' ? 'one' : 'off';
      console.log('[PlayerContext] Loop mode changed:', prev, '→', nextMode);
      return nextMode;
    });
  };

  // ✅ NOVÝ v0.5.0: Create shuffled order (Fisher-Yates)
  const createShuffledOrder = (length: number, currentIndex: number): number[] => {
    const indices = Array.from({ length }, (_, i) => i);
    const remainingIndices = indices.filter(i => i !== currentIndex);

    // Fisher-Yates shuffle
    for (let i = remainingIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingIndices[i], remainingIndices[j]] = [remainingIndices[j], remainingIndices[i]];
    }

    return [currentIndex, ...remainingIndices];
  };

  // ✅ NOVÝ v0.5.0: Toggle shuffle mode
  const toggleShuffle = () => {
    if (!shuffleEnabled) {
      // Aktivuj shuffle
      const newOrder = createShuffledOrder(currentPlaylist.length, currentTrackIndex);
      setShuffledOrder(newOrder);
      setShuffleEnabled(true);
      console.log('[PlayerContext] Shuffle enabled, order:', newOrder);
    } else {
      // Deaktivuj shuffle
      setShuffledOrder([]);
      setShuffleEnabled(false);
      console.log('[PlayerContext] Shuffle disabled');
    }
  };

  // Funkce pro nastavení playlist context
  const setPlaylistContext = (tracks: LocalTrack[], index: number) => {
    console.log('[PlayerContext] Setting playlist context:', { tracksCount: tracks.length, index });
    setCurrentPlaylist(tracks);
    setCurrentTrackIndex(index);

    // Reset shuffle při změně playlistu
    if (shuffleEnabled) {
      const newOrder = createShuffledOrder(tracks.length, index);
      setShuffledOrder(newOrder);
      console.log('[PlayerContext] Playlist changed, regenerating shuffle order');
    }
  };

  // ✅ AKTUALIZOVÁNO v0.5.0: Přehrát další skladbu s loop a shuffle podporou
  const playNextTrack = () => {
    if (currentTrackType !== 'local' || currentPlaylist.length === 0) return;

    // Loop One - přehraj stejnou skladbu
    if (loopMode === 'one') {
      console.log('[PlayerContext] Loop One: replaying current track');
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    let nextIndex: number;

    if (shuffleEnabled && shuffledOrder.length > 0) {
      // Shuffle mode
      const currentPosInShuffle = shuffledOrder.indexOf(currentTrackIndex);
      if (currentPosInShuffle < shuffledOrder.length - 1) {
        nextIndex = shuffledOrder[currentPosInShuffle + 1];
        console.log('[PlayerContext] Shuffle: next track', { currentPosInShuffle, nextIndex });
      } else {
        // Konec playlistu
        if (loopMode === 'playlist') {
          nextIndex = shuffledOrder[0]; // Loop na začátek shuffle
          console.log('[PlayerContext] Shuffle + Loop Playlist: restarting from beginning');
        } else {
          console.log('[PlayerContext] Shuffle: end of playlist, stopping');
          setIsPlaying(false);
          return; // Stop přehrávání
        }
      }
    } else {
      // Sequential mode
      if (currentTrackIndex < currentPlaylist.length - 1) {
        nextIndex = currentTrackIndex + 1;
        console.log('[PlayerContext] Sequential: next track', { currentIndex: currentTrackIndex, nextIndex });
      } else {
        // Konec playlistu
        if (loopMode === 'playlist') {
          nextIndex = 0; // Loop na začátek
          console.log('[PlayerContext] Loop Playlist: restarting from beginning');
        } else {
          console.log('[PlayerContext] Sequential: end of playlist, stopping');
          setIsPlaying(false);
          return; // Stop přehrávání
        }
      }
    }

    setCurrentTrackIndex(nextIndex);
    playLocalTrack(currentPlaylist[nextIndex]);
  };

  // ✅ AKTUALIZOVÁNO v0.5.0: Přehrát předchozí skladbu s shuffle podporou
  const playPreviousTrack = () => {
    if (currentTrackType !== 'local' || currentPlaylist.length === 0) return;

    let prevIndex: number;

    if (shuffleEnabled && shuffledOrder.length > 0) {
      // Shuffle mode
      const currentPosInShuffle = shuffledOrder.indexOf(currentTrackIndex);
      if (currentPosInShuffle > 0) {
        prevIndex = shuffledOrder[currentPosInShuffle - 1];
        console.log('[PlayerContext] Shuffle: previous track', { currentPosInShuffle, prevIndex });
      } else {
        // Na začátku playlistu, jdi na konec
        prevIndex = shuffledOrder[shuffledOrder.length - 1];
        console.log('[PlayerContext] Shuffle: wrapping to end');
      }
    } else {
      // Sequential mode
      if (currentTrackIndex > 0) {
        prevIndex = currentTrackIndex - 1;
        console.log('[PlayerContext] Sequential: previous track', { currentIndex: currentTrackIndex, prevIndex });
      } else {
        // Na začátku playlistu, jdi na konec
        prevIndex = currentPlaylist.length - 1;
        console.log('[PlayerContext] Sequential: wrapping to end');
      }
    }

    setCurrentTrackIndex(prevIndex);
    playLocalTrack(currentPlaylist[prevIndex]);
  };

  // Seek na konkrétní čas
  const seekTo = (time: number) => {
    if (!audioRef.current || currentTrackType !== 'local') return;

    // Ošetření hraničních hodnot
    const clampedTime = Math.max(0, Math.min(time, duration));
    audioRef.current.currentTime = clampedTime;
    console.log('[PlayerContext] Seek to:', clampedTime);
  };

  // Seek dopředu o X sekund
  const seekForward = (seconds: number) => {
    if (!audioRef.current || currentTrackType !== 'local') return;
    seekTo(audioRef.current.currentTime + seconds);
  };

  // Seek dozadu o X sekund
  const seekBackward = (seconds: number) => {
    if (!audioRef.current || currentTrackType !== 'local') return;
    seekTo(audioRef.current.currentTime - seconds);
  };

  // Funkce pro přehrávání lokálního souboru - používá storedPath
  const playLocalTrack = async (track: LocalTrack) => {
    if (!audioRef.current) return;

    setError(null);
    setNowPlaying(null);

    // Pokud již hraje stejný track, jen toggle play/pause
    if (currentLocalTrack?.id === track.id && currentTrackType === 'local') {
      togglePlay();
      return;
    }

    // Zastav rádio metadata fetcher pokud běží
    if (typeof window !== 'undefined' && window.electron) {
      window.electron.stopMetadataParsing();
    }

    // Nastav nový lokální track
    setCurrentTrackType('local');
    setCurrentStation(null);  // Clear radio station
    setCurrentLocalTrack(track);
    setIsPlaying(true);

    try {
      // Použij storedPath (cesta v app storage) místo path/originalPath
      const filePath = track.storedPath || track.path;

      if (!filePath) {
        throw new Error('Track has no valid file path');
      }

      // Získej media:// URL pro soubor
      const fileUrl = await window.electron!.getFileUrl(filePath);

      console.log('[PlayerContext] Playing local track:', {
        id: track.id,
        title: track.metadata.title,
        filePath: filePath,
        fileUrl: fileUrl
      });

      // Nastav jako zdroj pro <audio> element
      audioRef.current.src = fileUrl;
      audioRef.current.load();

      // Nastav nowPlaying z metadat
      setNowPlaying(`${track.metadata.title} - ${track.metadata.artist}`);

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("Playback error:", e);
          setIsPlaying(false);
          setError("Nelze přehrát lokální soubor");
        });
      }
    } catch (error) {
      console.error("Failed to play local track:", error);
      setError("Chyba při načítání souboru");
      setIsPlaying(false);
    }
  };

  // playStation nyní zastavuje lokální přehrávání a clearuje playlist context
  const playStation = (station: Station) => {
    if (!audioRef.current) return;

    setError(null);
    setNowPlaying(null);

    // Pokud již hraje stejná stanice, jen toggle play/pause
    if (currentStation?.id === station.id && currentTrackType === 'radio') {
      togglePlay();
      return;
    }

    // Clear playlist context při přepnutí na rádio
    setCurrentPlaylist([]);
    setCurrentTrackIndex(-1);
    setCurrentTime(0);
    setDuration(0);

    // Nastav novou stanici
    setCurrentTrackType('radio');
    setCurrentLocalTrack(null);  // Clear local track
    setCurrentStation(station);
    setIsPlaying(true);

    // Audio stream jde PŘÍMO (ne přes proxy!)
    audioRef.current.src = station.url;
    audioRef.current.load();

    // Start metadata parsing v Electronu (pokud běží)
    if (typeof window !== 'undefined' && window.electron) {
      console.log('[PlayerContext] Starting metadata parsing for:', station.url);
      window.electron.startMetadataParsing(station.url);
    }

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.error("Playback error:", e);
        setIsPlaying(false);
        setError("Nelze přehrát");
      });
    }
  };

  // togglePlay funguje pro OBA typy
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (!currentStation && !currentLocalTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);

      // Stop metadata parsing pouze pokud je to rádio
      if (currentTrackType === 'radio' && typeof window !== 'undefined' && window.electron) {
        window.electron.stopMetadataParsing();
      }
    } else {
      setError(null);

      // Restart metadata parsing pouze pokud je to rádio
      if (currentTrackType === 'radio' && currentStation && typeof window !== 'undefined' && window.electron) {
        window.electron.startMetadataParsing(currentStation.url);
      }

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("Playback error:", e);
          setIsPlaying(false);
          setError("Nelze přehrát");
        });
      }
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
  };

  const handleAudioError = (e: any) => {
    console.error("Audio tag error:", e.currentTarget.error);
    setIsPlaying(false);
    setError("Chyba streamu");
  };

  return (
    <PlayerContext.Provider value={{
      isPlaying,
      currentStation,
      currentLocalTrack,
      currentTrackType,
      nowPlaying,
      error,
      togglePlay,
      playStation,
      playLocalTrack,
      volume,
      handleVolumeChange,
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
      setPlaylistContext,
      // ✅ NOVÉ v0.5.0: Loop a Shuffle
      loopMode,
      shuffleEnabled,
      toggleLoopMode,
      toggleShuffle
    }}>
      {children}
      <audio
        ref={audioRef}
        preload="auto"
        onError={handleAudioError}
        style={{ display: "none" }}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
