const Store = require('electron-store');

const schema = {
  playlists: {
    type: 'array',
    default: []
  }
};

class PlaylistStore {
  constructor() {
    this.store = new Store({ schema });
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
