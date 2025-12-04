const { app, BrowserWindow, Menu, ipcMain, protocol } = require('electron');
const path = require('path');
const serve = require('electron-serve');
const { MetadataFetcher } = require('./metadata-fetcher');
const { FileManager } = require('./file-manager');
const { PlaylistStore } = require('./playlist-store');

const loadURL = serve({ directory: 'out' });

let metadataFetcher;
let fileManager;
let playlistStore;

function createWindow() {
  // Hide the default menu
  Menu.setApplicationMenu(null);

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../build/icon.ico'),
    backgroundColor: '#000000',
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    loadURL(mainWindow);
  }

  // Inicializuj moduly
  metadataFetcher = new MetadataFetcher(mainWindow);
  fileManager = new FileManager(mainWindow);
  playlistStore = new PlaylistStore();

  // IPC handlers - Radio metadata (existing)
  ipcMain.on('start-metadata-parsing', (event, stationUrl) => {
    console.log('[Main] Start metadata parsing:', stationUrl);
    metadataFetcher.startFetching(stationUrl);
  });

  ipcMain.on('stop-metadata-parsing', () => {
    console.log('[Main] Stop metadata parsing');
    metadataFetcher.stopFetching();
  });

  // ✅ IPC handlers - Local files
  ipcMain.handle('select-audio-files', async () => {
    console.log('[Main] Select audio files');
    return await fileManager.selectAudioFiles();
  });

  ipcMain.handle('get-file-url', async (event, filePath) => {
    console.log('[Main] Get file URL:', filePath);
    return await fileManager.getFileUrl(filePath);
  });

  // ✅ NOVÝ: IPC handler pro kopírování souborů
  ipcMain.handle('copy-tracks-to-playlist', async (event, tracks, playlistId) => {
    console.log('[Main] Copy tracks to playlist:', playlistId);
    return await fileManager.copyTracksToPlaylist(tracks, playlistId);
  });

  // ✅ IPC handlers - Playlist management
  ipcMain.handle('get-playlists', () => {
    return playlistStore.getPlaylists();
  });

  ipcMain.handle('get-playlist', (event, id) => {
    return playlistStore.getPlaylist(id);
  });

  ipcMain.handle('create-playlist', (event, name, tracks) => {
    return playlistStore.createPlaylist(name, tracks);
  });

  ipcMain.handle('update-playlist', (event, id, updates) => {
    return playlistStore.updatePlaylist(id, updates);
  });

  // ✅ UPRAVENO: Smazat i soubory playlistu
  ipcMain.handle('delete-playlist', async (event, id) => {
    // Smaž soubory z file systému
    await fileManager.deletePlaylistFiles(id);
    // Smaž metadata z store
    playlistStore.deletePlaylist(id);
  });

  // ✅ NOVÝ v0.6.0: Odstranění skladby z playlistu (včetně souboru z disku)
  ipcMain.handle('remove-track', async (event, trackId, playlistId) => {
    console.log('[Main] Removing track:', { trackId, playlistId });

    try {
      // 1. Načti playlist
      const playlist = playlistStore.getPlaylist(playlistId);
      if (!playlist) {
        throw new Error('Playlist not found');
      }

      // 2. Najdi track
      const track = playlist.tracks.find(t => t.id === trackId);
      if (!track) {
        throw new Error('Track not found');
      }

      // 3. Smaž soubor z disku
      if (track.storedPath) {
        await fileManager.deleteTrackFile(track.storedPath);
      }

      // 4. Odstraň track z playlistu
      const updatedTracks = playlist.tracks.filter(t => t.id !== trackId);
      playlistStore.updatePlaylist(playlistId, { tracks: updatedTracks });

      console.log('[Main] Track removed successfully:', trackId);
      return { success: true };
    } catch (error) {
      console.error('[Main] Failed to remove track:', error);
      throw error;
    }
  });

  return mainWindow;
}

// ✅ NOVÝ: Registruj custom protocol PŘED vytvořením okna
app.whenReady().then(() => {
  // Registruj media:// protocol pro přehrávání lokálních souborů
  protocol.registerFileProtocol('media', (request, callback) => {
    const url = request.url.replace('media://', '');
    const filePath = decodeURIComponent(url);

    console.log('[Main] Media protocol request:', filePath);

    callback({ path: filePath });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (metadataFetcher) {
    metadataFetcher.stopFetching();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});
