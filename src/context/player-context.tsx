"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Station } from "@/types/station";

// Type definition pro Electron API
declare global {
  interface Window {
    electron?: {
      startMetadataParsing: (stationUrl: string) => void;
      stopMetadataParsing: () => void;
      onMetadataUpdate: (callback: (data: { title: string | null; supported: boolean }) => void) => void;
      onMetadataError: (callback: (data: { error: string }) => void) => void;
      removeAllListeners: () => void;
      isElectron: boolean;
    };
  }
}

interface PlayerContextType {
  isPlaying: boolean;
  currentStation: Station | null;
  nowPlaying: string | null;
  error: string | null;
  togglePlay: () => void;
  playStation: (station: Station) => void;
  volume: number;
  handleVolumeChange: (val: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Setup Electron metadata listeners
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron) {
      console.log('[PlayerContext] Electron detected, setting up metadata listeners');

      window.electron.onMetadataUpdate((data) => {
        console.log('[PlayerContext] Metadata update:', data);
        if (data.supported && data.title) {
          setNowPlaying(data.title);
        } else if (!data.supported) {
          setNowPlaying(null); // Stream nepodporuje metadata
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

  const playStation = (station: Station) => {
    if (!audioRef.current) return;

    setError(null);
    setNowPlaying(null);

    if (currentStation?.id === station.id) {
      togglePlay();
      return;
    }

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

  const togglePlay = () => {
    if (!audioRef.current || !currentStation) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);

      // Stop metadata parsing
      if (typeof window !== 'undefined' && window.electron) {
        window.electron.stopMetadataParsing();
      }
    } else {
      setError(null);

      // Restart metadata parsing
      if (typeof window !== 'undefined' && window.electron) {
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
    <PlayerContext.Provider value={{ isPlaying, currentStation, nowPlaying, error, togglePlay, playStation, volume, handleVolumeChange }}>
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
