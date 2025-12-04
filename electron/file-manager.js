const { dialog, app } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const { parseFile } = require('music-metadata');

class FileManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    // Cesta k music storage
    this.musicDir = path.join(app.getPath('userData'), 'music');
  }

  /**
   * Zajistí existenci složky pro playlist
   */
  async ensureMusicDir(playlistId) {
    const playlistDir = path.join(this.musicDir, playlistId);
    await fs.mkdir(playlistDir, { recursive: true });
    return playlistDir;
  }

  /**
   * Otevře dialog pro výběr audio souborů
   * Vrací soubory s originalPath (ještě nejsou zkopírované)
   */
  async selectAudioFiles() {
    const result = await dialog.showOpenDialog(this.mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'] }
      ]
    });

    if (result.canceled) {
      return [];
    }

    // Pro každý soubor získej metadata, ale ZATÍM nekopíruj
    // Kopírování proběhne až po vybrání playlistu
    const files = await Promise.all(
      result.filePaths.map(async (filePath) => {
        try {
          const stats = await fs.stat(filePath);
          const metadata = await parseFile(filePath, {
            skipCovers: true, // Nezahrnovat obrázky pro rychlejší parsing
            duration: true
          });
          const ext = path.extname(filePath);

          return {
            id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: path.basename(filePath),
            originalPath: filePath,  // ← Původní cesta
            storedPath: null,        // ← Bude nastaveno při kopírování
            extension: ext,          // ← Přípona souboru
            size: stats.size,
            type: 'local',
            metadata: {
              title: metadata.common.title || path.basename(filePath, ext),
              artist: metadata.common.artist || 'Unknown Artist',
              album: metadata.common.album || 'Unknown Album',
              duration: metadata.format.duration || 0,
            }
          };
        } catch (error) {
          console.error(`Failed to read metadata for ${filePath}:`, error);
          // Fallback pokud se nepodaří přečíst metadata
          const stats = await fs.stat(filePath).catch(() => ({ size: 0 }));
          const ext = path.extname(filePath);
          return {
            id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: path.basename(filePath),
            originalPath: filePath,
            storedPath: null,
            extension: ext,
            size: stats.size,
            type: 'local',
            metadata: {
              title: path.basename(filePath, ext),
              artist: 'Unknown',
              album: 'Unknown',
              duration: 0
            }
          };
        }
      })
    );

    return files.filter(f => f !== null);
  }

  /**
   * NOVÁ FUNKCE: Zkopíruj soubor do app storage
   */
  async copyTrackToStorage(track, playlistId) {
    try {
      const playlistDir = await this.ensureMusicDir(playlistId);
      const destFileName = `${track.id}${track.extension}`;
      const destPath = path.join(playlistDir, destFileName);

      // Zkontroluj jestli zdrojový soubor existuje
      try {
        await fs.access(track.originalPath);
      } catch (error) {
        throw new Error(`Source file not found: ${track.originalPath}`);
      }

      // Zkopíruj soubor
      await fs.copyFile(track.originalPath, destPath);

      console.log(`[FileManager] Copied: ${track.originalPath} → ${destPath}`);

      // Vrať track s aktualizovanou cestou
      return {
        ...track,
        storedPath: destPath,
        originalPath: undefined  // Odstraň původní cestu (už ji nepotřebujeme)
      };
    } catch (error) {
      console.error(`[FileManager] Failed to copy ${track.name}:`, error);
      throw error;
    }
  }

  /**
   * NOVÁ FUNKCE: Zkopíruj všechny tracky do playlistu
   */
  async copyTracksToPlaylist(tracks, playlistId) {
    const copiedTracks = [];
    const errors = [];

    for (const track of tracks) {
      try {
        const copied = await this.copyTrackToStorage(track, playlistId);
        copiedTracks.push(copied);
      } catch (error) {
        console.error(`Failed to copy track ${track.name}:`, error);
        errors.push({ track: track.name, error: error.message });
        // Pokračuj s dalšími soubory i když jeden selže
      }
    }

    if (errors.length > 0) {
      console.warn(`[FileManager] Some tracks failed to copy:`, errors);
    }

    return copiedTracks;
  }

  /**
   * ✅ UPRAVENO: Použij media:// protocol místo file://
   * Toto vyřeší bezpečnostní blokování Electronu
   */
  async getFileUrl(filePath) {
    try {
      // Normalizuj cestu pro cross-platform kompatibilitu
      const normalizedPath = path.normalize(filePath);

      // Vrať media:// URL které bude zpracováno custom protocol handlerem
      return `media://${encodeURIComponent(normalizedPath)}`;
    } catch (error) {
      console.error(`Failed to create file URL for ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * NOVÁ FUNKCE: Smazání souborů playlistu
   */
  async deletePlaylistFiles(playlistId) {
    try {
      const playlistDir = path.join(this.musicDir, playlistId);
      await fs.rm(playlistDir, { recursive: true, force: true });
      console.log(`[FileManager] Deleted playlist files: ${playlistDir}`);
    } catch (error) {
      console.error(`[FileManager] Failed to delete playlist files:`, error);
      // Neházej error - i když se nepodaří smazat soubory, playlist se smaže z DB
    }
  }

  /**
   * ✅ NOVÁ FUNKCE: Smazání konkrétního tracku z disku
   */
  async deleteTrackFile(storedPath) {
    try {
      if (!storedPath) {
        console.warn('[FileManager] No storedPath provided, skipping file deletion');
        return;
      }

      // Zkontroluj jestli soubor existuje
      try {
        await fs.access(storedPath);
      } catch (error) {
        console.warn(`[FileManager] File not found: ${storedPath}`);
        return; // Soubor neexistuje, není co mazat
      }

      // Smaž soubor
      await fs.unlink(storedPath);
      console.log(`[FileManager] Deleted track file: ${storedPath}`);
    } catch (error) {
      console.error(`[FileManager] Failed to delete track file ${storedPath}:`, error);
      throw error;
    }
  }
}

module.exports = { FileManager };
