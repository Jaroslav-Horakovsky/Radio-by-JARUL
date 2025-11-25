"use client";

import { PlayerProvider } from "@/context/player-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      {children}
    </PlayerProvider>
  );
}
