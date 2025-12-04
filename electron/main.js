const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const serve = require('electron-serve');
const { MetadataFetcher } = require('./metadata-fetcher');

const loadURL = serve({ directory: 'out' });

let metadataFetcher;

function createWindow() {
  // Hide the default menu
  Menu.setApplicationMenu(null);

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,       // ← ZMĚNA: bezpečnější
      contextIsolation: true,       // ← ZMĚNA: bezpečnější
      preload: path.join(__dirname, 'preload.js'), // ← NOVÝ
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

  // Inicializuj metadata fetcher
  metadataFetcher = new MetadataFetcher(mainWindow);

  // IPC handlers
  ipcMain.on('start-metadata-parsing', (event, stationUrl) => {
    console.log('[Main] Start metadata parsing:', stationUrl);
    metadataFetcher.startFetching(stationUrl);
  });

  ipcMain.on('stop-metadata-parsing', () => {
    console.log('[Main] Stop metadata parsing');
    metadataFetcher.stopFetching();
  });

  return mainWindow;
}

app.whenReady().then(() => {
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
