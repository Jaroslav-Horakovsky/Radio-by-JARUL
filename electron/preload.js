const { contextBridge, ipcRenderer } = require('electron');

// Expose bezpečné API do renderer procesu
contextBridge.exposeInMainWorld('electron', {
  // Start parsování metadat pro danou stanici
  startMetadataParsing: (stationUrl) => {
    ipcRenderer.send('start-metadata-parsing', stationUrl);
  },

  // Stop parsování metadat
  stopMetadataParsing: () => {
    ipcRenderer.send('stop-metadata-parsing');
  },

  // Poslouchej metadata updates
  onMetadataUpdate: (callback) => {
    ipcRenderer.on('metadata-update', (event, data) => callback(data));
  },

  // Poslouchej metadata errors
  onMetadataError: (callback) => {
    ipcRenderer.on('metadata-error', (event, data) => callback(data));
  },

  // Cleanup listeners
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('metadata-update');
    ipcRenderer.removeAllListeners('metadata-error');
  },

  // Flag pro detekci Electron prostředí
  isElectron: true,
});

console.log('[Preload] Electron API exposed');
