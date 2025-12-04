export interface MetadataUpdate {
  title: string | null;
  supported: boolean;
}

export interface MetadataError {
  error: string;
}

export interface LocalTrack {
  id: string;
  name: string;
  originalPath?: string;   // ← Původní cesta (jen při výběru)
  storedPath?: string;      // ← Cesta v app storage
  path?: string;            // ← Deprecated, backward compatibility
  extension: string;        // ← .mp3, .flac, etc.
  size: number;
  type: 'local';
  metadata: {
    title: string;
    artist: string;
    album: string;
    duration: number;
  };
}

export interface Playlist {
  id: string;
  name: string;
  tracks: LocalTrack[];
  createdAt: number;
}

export interface ElectronAPI {
  // Radio metadata
  startMetadataParsing: (stationUrl: string) => void;
  stopMetadataParsing: () => void;
  onMetadataUpdate: (callback: (data: MetadataUpdate) => void) => void;
  onMetadataError: (callback: (data: MetadataError) => void) => void;
  removeAllListeners: () => void;

  // Local files
  selectAudioFiles: () => Promise<LocalTrack[]>;
  getFileUrl: (filePath: string) => Promise<string>;

  // ✅ NOVÝ: Kopírování souborů do playlistu
  copyTracksToPlaylist: (tracks: LocalTrack[], playlistId: string) => Promise<LocalTrack[]>;

  // Playlist management
  getPlaylists: () => Promise<Playlist[]>;
  getPlaylist: (id: string) => Promise<Playlist | null>;
  createPlaylist: (name: string, tracks: LocalTrack[]) => Promise<Playlist>;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => Promise<Playlist | null>;
  deletePlaylist: (id: string) => Promise<void>;

  // ✅ NOVÝ v0.6.0: Odstranění skladby z playlistu
  removeTrack: (trackId: string, playlistId: string) => Promise<{ success: boolean }>;

  isElectron: boolean;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
