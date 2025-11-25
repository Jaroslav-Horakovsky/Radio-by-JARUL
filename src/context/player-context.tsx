"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Station } from "@/types/station";

interface PlayerContextType {
  isPlaying: boolean;
  currentStation: Station | null;
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
  const [volume, setVolume] = useState(0.5);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playStation = (station: Station) => {
    if (!audioRef.current) return;

    setError(null); // Reset error

    if (currentStation?.id === station.id) {
        togglePlay();
        return;
    }

    setCurrentStation(station);
    setIsPlaying(true);

    audioRef.current.src = station.url;
    audioRef.current.load();

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
    } else {
      setError(null);
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
    <PlayerContext.Provider value={{ isPlaying, currentStation, error, togglePlay, playStation, volume, handleVolumeChange }}>
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
