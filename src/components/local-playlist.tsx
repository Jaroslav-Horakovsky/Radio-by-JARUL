"use client";

import React, { useState, useEffect } from "react";
import { usePlayer } from "@/context/player-context";
import { LocalTrack, Playlist } from "@/types/electron";
import { Play, Trash2, Music, FolderPlus, Folder, X, Wrench } from "lucide-react";

export function LocalPlaylist() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editMode, setEditMode] = useState(false); // ✅ NOVÝ: Edit mode state

  const {
    playLocalTrack,
    currentLocalTrack,
    isPlaying,
    setPlaylistContext // ✅ NOVÝ: Import setPlaylistContext
  } = usePlayer();

  // Načti playlisty při startu
  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    if (!window.electron) return;

    try {
      const loadedPlaylists = await window.electron.getPlaylists();
      setPlaylists(loadedPlaylists);

      // Pokud není vybraný žádný playlist a existují nějaké, vyber první
      if (!currentPlaylistId && loadedPlaylists.length > 0) {
        setCurrentPlaylistId(loadedPlaylists[0].id);
      }
    } catch (error) {
      console.error('[LocalPlaylist] Failed to load playlists:', error);
    }
  };

  const currentPlaylist = playlists.find(p => p.id === currentPlaylistId);
  const tracks = currentPlaylist?.tracks || [];

  const handleCreatePlaylist = async () => {
    if (!window.electron || !newPlaylistName.trim()) return;

    try {
      const newPlaylist = await window.electron.createPlaylist(newPlaylistName.trim(), []);
      setPlaylists(prev => [...prev, newPlaylist]);
      setCurrentPlaylistId(newPlaylist.id);
      setNewPlaylistName("");
      setShowCreatePlaylist(false);
    } catch (error) {
      console.error('[LocalPlaylist] Failed to create playlist:', error);
      alert('Chyba při vytváření playlistu');
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!window.electron) return;

    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    if (!confirm(`Opravdu chcete smazat playlist "${playlist.name}"?`)) return;

    try {
      await window.electron.deletePlaylist(playlistId);
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));

      // Pokud byl smazán aktuální playlist, vyber jiný
      if (currentPlaylistId === playlistId) {
        const remaining = playlists.filter(p => p.id !== playlistId);
        setCurrentPlaylistId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (error) {
      console.error('[LocalPlaylist] Failed to delete playlist:', error);
      alert('Chyba při mazání playlistu');
    }
  };

  // ✅ UPRAVENO: Implementace kopírování souborů do app storage
  const handleSelectFiles = async () => {
    if (!window.electron || !currentPlaylistId) {
      alert('Nejdříve vytvořte playlist');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Vyber soubory (vrací s originalPath)
      const selectedFiles = await window.electron.selectAudioFiles();
      console.log('[LocalPlaylist] Selected files:', selectedFiles);

      if (selectedFiles.length === 0) {
        setIsLoading(false);
        return;
      }

      // 2. Zkopíruj do app storage (vrací s storedPath)
      const copiedTracks = await window.electron.copyTracksToPlaylist(
        selectedFiles,
        currentPlaylistId
      );
      console.log('[LocalPlaylist] Copied tracks:', copiedTracks);

      // 3. Přidej do playlistu
      const updatedTracks = [...tracks, ...copiedTracks];
      await window.electron.updatePlaylist(currentPlaylistId, {
        tracks: updatedTracks
      });

      // 4. Obnov UI
      await loadPlaylists();
    } catch (error) {
      console.error('[LocalPlaylist] Failed to add tracks:', error);
      alert('Chyba při přidávání skladeb');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ UPRAVENO: Předávání playlist context při přehrávání
  const handlePlayTrack = (track: LocalTrack, index: number) => {
    console.log('[LocalPlaylist] Playing track:', { track, index, totalTracks: tracks.length });

    // Nejdříve nastav celý playlist context
    setPlaylistContext(tracks, index);

    // Pak přehraj konkrétní track
    playLocalTrack(track);
  };

  // ✅ NOVÝ: Odstranění skladby podle trackId (s odstraněním souboru z disku)
  const handleRemoveTrack = async (trackId: string) => {
    if (!window.electron || !currentPlaylistId) return;

    console.log('[LocalPlaylist] Removing track:', trackId);

    try {
      // Zavolat Electron API pro odstranění (smaže soubor z disku)
      await window.electron.removeTrack(trackId, currentPlaylistId);

      // Refresh playlist
      await loadPlaylists();

      // Pokud byla odstraněna aktuálně přehrávaná skladba
      if (currentLocalTrack?.id === trackId) {
        // TODO: Stop přehrávání - bude implementováno v player-context
        console.log('[LocalPlaylist] Currently playing track was removed');
      }
    } catch (error) {
      console.error('[LocalPlaylist] Failed to remove track:', error);
      alert('Chyba při odstraňování skladby');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-8 pb-16">
      <div className="bg-zinc-900/50 rounded-2xl border-2 border-zinc-800 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">Moje hudba</h2>
              <p className="text-sm text-zinc-400 mt-1">
                {playlists.length === 0
                  ? 'Zatím žádné playlisty'
                  : `${playlists.length} ${playlists.length === 1 ? 'playlist' : 'playlistů'}`}
              </p>
            </div>
            {/* ✅ NOVÝ: Edit Mode tlačítko */}
            {currentPlaylist && tracks.length > 0 && (
              <button
                onClick={() => setEditMode(!editMode)}
                className={`p-2 transition-colors rounded-lg ${
                  editMode ? 'text-blue-400 bg-blue-400/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={editMode ? 'Hotovo' : 'Upravit playlist'}
              >
                <Wrench size={20} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreatePlaylist(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors bg-green-600 hover:bg-green-700 text-white"
            >
              <FolderPlus size={20} />
              Vytvořit playlist
            </button>
            <button
              onClick={handleSelectFiles}
              disabled={isLoading || !currentPlaylistId}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Music size={20} />
              {isLoading ? 'Načítání...' : 'Přidat skladby'}
            </button>
          </div>
        </div>

        {/* Create Playlist Dialog */}
        {showCreatePlaylist && (
          <div className="mb-6 p-4 bg-zinc-800 rounded-lg border-2 border-green-600">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                placeholder="Název playlistu..."
                className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg border border-zinc-600 focus:outline-none focus:border-green-500"
                autoFocus
              />
              <button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Vytvořit
              </button>
              <button
                onClick={() => {
                  setShowCreatePlaylist(false);
                  setNewPlaylistName("");
                }}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Playlist Tabs */}
        {playlists.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="relative group">
                <button
                  onClick={() => setCurrentPlaylistId(playlist.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    currentPlaylistId === playlist.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <Folder size={16} />
                  {playlist.name}
                  <span className="text-xs opacity-70">({playlist.tracks.length})</span>
                </button>
                {playlists.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(playlist.id);
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State - No Playlists */}
        {playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <FolderPlus size={32} className="text-zinc-600" />
            </div>
            <p className="text-lg text-zinc-300 mb-2">Žádné playlisty</p>
            <p className="text-sm text-zinc-500">
              Klikni na "Vytvořit playlist" pro vytvoření nového playlistu
            </p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <Music size={32} className="text-zinc-600" />
            </div>
            <p className="text-lg text-zinc-300 mb-2">Playlist je prázdný</p>
            <p className="text-sm text-zinc-500">
              Klikni na "Přidat skladby" pro výběr audio souborů z PC
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* ✅ UPRAVENO: Remove tlačítko zobrazeno pouze v edit mode */}
            {tracks.map((track, index) => {
              const isCurrentTrack = currentLocalTrack?.id === track.id;
              const isCurrentlyPlaying = isCurrentTrack && isPlaying;

              return (
                <div
                  key={track.id}
                  className={`group p-4 rounded-lg transition-all ${
                    isCurrentTrack
                      ? 'bg-blue-600/20 border-2 border-blue-600'
                      : 'bg-zinc-800 hover:bg-zinc-750 border-2 border-transparent'
                  } ${!editMode ? 'cursor-pointer' : ''}`}
                  onClick={() => !editMode && handlePlayTrack(track, index)}
                >
                  <div className="flex items-center gap-4">
                    {/* Play Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      isCurrentTrack ? 'bg-blue-600' : 'bg-zinc-700 group-hover:bg-zinc-600'
                    }`}>
                      {isCurrentlyPlaying ? (
                        <div className="flex gap-1">
                          <div className="w-1 h-4 bg-white animate-pulse"></div>
                          <div className="w-1 h-4 bg-white animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1 h-4 bg-white animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      ) : (
                        <Play size={16} className="text-white ml-0.5" />
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${
                        isCurrentTrack ? 'text-blue-400' : 'text-white'
                      }`}>
                        {track.metadata.title}
                      </h3>
                      <p className="text-sm text-zinc-400 truncate">
                        {track.metadata.artist} • {track.metadata.album}
                      </p>
                    </div>

                    {/* Duration */}
                    {track.metadata.duration > 0 && (
                      <div className="text-sm text-zinc-500">
                        {Math.floor(track.metadata.duration / 60)}:{String(Math.floor(track.metadata.duration % 60)).padStart(2, '0')}
                      </div>
                    )}

                    {/* ✅ UPRAVENO: Remove Button (viditelné v edit mode nebo při hover) */}
                    {editMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTrack(track.id);
                        }}
                        className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Odstranit skladbu"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
