const { contextBridge, ipcRenderer } = require('electron');

// Expose bezpečné API do renderer procesu
contextBridge.exposeInMainWorld('electron', {
  // Radio metadata (existing)
  startMetadataParsing: (stationUrl) => {
    ipcRenderer.send('start-metadata-parsing', stationUrl);
  },
  stopMetadataParsing: () => {
    ipcRenderer.send('stop-metadata-parsing');
  },
  onMetadataUpdate: (callback) => {
    ipcRenderer.on('metadata-update', (event, data) => callback(data));
  },
  onMetadataError: (callback) => {
    ipcRenderer.on('metadata-error', (event, data) => callback(data));
  },
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('metadata-update');
    ipcRenderer.removeAllListeners('metadata-error');
  },

  // ✅ Local files
  selectAudioFiles: () => ipcRenderer.invoke('select-audio-files'),
  getFileUrl: (filePath) => ipcRenderer.invoke('get-file-url', filePath),

  // ✅ NOVÝ: Kopírování souborů do playlistu
  copyTracksToPlaylist: (tracks, playlistId) =>
    ipcRenderer.invoke('copy-tracks-to-playlist', tracks, playlistId),

  // ✅ Playlist management
  getPlaylists: () => ipcRenderer.invoke('get-playlists'),
  getPlaylist: (id) => ipcRenderer.invoke('get-playlist', id),
  createPlaylist: (name, tracks) => ipcRenderer.invoke('create-playlist', name, tracks),
  updatePlaylist: (id, updates) => ipcRenderer.invoke('update-playlist', id, updates),
  deletePlaylist: (id) => ipcRenderer.invoke('delete-playlist', id),

  // ✅ NOVÝ v0.6.0: Odstranění skladby z playlistu
  removeTrack: (trackId, playlistId) => ipcRenderer.invoke('remove-track', trackId, playlistId),

  isElectron: true,
});

console.log('[Preload] Electron API exposed (with track removal support)');
