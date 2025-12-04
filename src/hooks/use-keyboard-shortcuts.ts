import { useEffect } from 'react';
import { usePlayer } from '@/context/player-context';

export function useKeyboardShortcuts() {
  const {
    isPlaying,
    togglePlay,
    volume,
    handleVolumeChange,
    seekForward,
    seekBackward,
    currentStation,
    currentLocalTrack,
  } = usePlayer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorovat zkratky pokud je focus na input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Určit typ aktuálního tracku
      const currentTrackType = currentLocalTrack ? 'local' : currentStation ? 'radio' : null;

      switch (e.key) {
        case ' ': // Mezerník
          e.preventDefault();
          togglePlay();
          console.log('[KeyboardShortcuts] Space: toggle play');
          break;

        case 'ArrowUp':
          e.preventDefault();
          const newVolumeUp = Math.min(volume + 0.1, 1.0);
          handleVolumeChange(newVolumeUp);
          console.log('[KeyboardShortcuts] Arrow Up: volume', newVolumeUp.toFixed(2));
          break;

        case 'ArrowDown':
          e.preventDefault();
          const newVolumeDown = Math.max(volume - 0.1, 0.0);
          handleVolumeChange(newVolumeDown);
          console.log('[KeyboardShortcuts] Arrow Down: volume', newVolumeDown.toFixed(2));
          break;

        case 'ArrowRight':
          if (currentTrackType === 'local') {
            e.preventDefault();
            seekForward(10);
            console.log('[KeyboardShortcuts] Arrow Right: seek +10s');
          }
          break;

        case 'ArrowLeft':
          if (currentTrackType === 'local') {
            e.preventDefault();
            seekBackward(10);
            console.log('[KeyboardShortcuts] Arrow Left: seek -10s');
          }
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          // Mute: pokud volume > 0, nastav na 0, jinak nastav na 0.5
          const newVolume = volume === 0 ? 0.5 : 0;
          handleVolumeChange(newVolume);
          console.log('[KeyboardShortcuts] M: mute toggle', newVolume === 0 ? 'muted' : 'unmuted');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, currentStation, currentLocalTrack, isPlaying, togglePlay, handleVolumeChange, seekForward, seekBackward]);
}
