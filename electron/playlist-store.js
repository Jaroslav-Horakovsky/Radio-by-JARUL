const Store = require('electron-store');

const schema = {
  appVersion: {
    type: 'string',
    default: '0.0.0'
  },
  playlists: {
    type: 'array',
    default: []
  }
};

class PlaylistStore {
  constructor() {
    this.store = new Store({ schema });
    this.currentVersion = '0.7.3'; // Aktuální verze aplikace

    // Kontrola verze a migrace
    this.checkVersion();
  }

  checkVersion() {
    const storedVersion = this.store.get('appVersion', '0.0.0');

    // Pokud je verze jiná než aktuální, vymaž všechny playlisty pro čistý start
    if (storedVersion !== this.currentVersion) {
      console.log(`[PlaylistStore] Migrating from ${storedVersion} to ${this.currentVersion}`);
      console.log('[PlaylistStore] Clearing all playlists for fresh start');
      this.store.set('playlists', []);
      this.store.set('currentPlaylist', null);
      this.store.set('appVersion', this.currentVersion);
    }
  }

  getPlaylists() {
    return this.store.get('playlists', []);
  }

  getPlaylist(id) {
    const playlists = this.getPlaylists();
    return playlists.find(p => p.id === id);
  }

  createPlaylist(name, tracks = []) {
    const playlists = this.getPlaylists();
    const newPlaylist = {
      id: `playlist-${Date.now()}`,
      name,
      tracks,
      createdAt: Date.now()
    };
    playlists.push(newPlaylist);
    this.store.set('playlists', playlists);
    return newPlaylist;
  }

  updatePlaylist(id, updates) {
    const playlists = this.getPlaylists();
    const index = playlists.findIndex(p => p.id === id);

    if (index >= 0) {
      playlists[index] = { ...playlists[index], ...updates };
      this.store.set('playlists', playlists);
      return playlists[index];
    }

    return null;
  }

  deletePlaylist(id) {
    const playlists = this.getPlaylists();
    const filtered = playlists.filter(p => p.id !== id);
    this.store.set('playlists', filtered);
  }

  getCurrentPlaylist() {
    const currentId = this.store.get('currentPlaylist');
    return currentId ? this.getPlaylist(currentId) : null;
  }

  setCurrentPlaylist(id) {
    this.store.set('currentPlaylist', id);
  }
}

module.exports = { PlaylistStore };
