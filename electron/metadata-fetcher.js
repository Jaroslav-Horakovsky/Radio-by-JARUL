const http = require('http');
const https = require('https');
const { IcyMetadataParser } = require('./icy-metadata-parser');
const { URL } = require('url');

class MetadataFetcher {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.currentRequest = null;
    this.currentParser = null;
  }

  startFetching(stationUrl) {
    // Zastavíme případný běžící fetch
    this.stopFetching();

    try {
      const url = new URL(stationUrl);
      const client = url.protocol === 'https:' ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'Icy-MetaData': '1',
          'User-Agent': 'RadioPlay/1.0',
        },
      };

      console.log('[MetadataFetcher] Starting fetch:', stationUrl);

      this.currentRequest = client.request(options, (res) => {
        console.log('[MetadataFetcher] Response status:', res.statusCode);
        console.log('[MetadataFetcher] Response headers:', res.headers);

        // Zkontroluj, jestli stream podporuje metadata
        const icyMetaInt = parseInt(res.headers['icy-metaint']);

        if (!icyMetaInt || isNaN(icyMetaInt)) {
          console.log('[MetadataFetcher] Stream nepodporuje Icy-Metadata');
          this.mainWindow.webContents.send('metadata-update', {
            title: null,
            supported: false,
          });
          this.stopFetching();
          return;
        }

        console.log('[MetadataFetcher] Icy-MetaInt:', icyMetaInt);

        // Vytvoř parser
        this.currentParser = new IcyMetadataParser(icyMetaInt);

        // Poslouchej metadata události
        this.currentParser.on('metadata', (title) => {
          console.log('[MetadataFetcher] Metadata:', title);
          this.mainWindow.webContents.send('metadata-update', {
            title: title,
            supported: true,
          });
        });

        // Pipe response přes parser
        res.pipe(this.currentParser);
      });

      this.currentRequest.on('error', (err) => {
        console.error('[MetadataFetcher] Request error:', err);
        this.mainWindow.webContents.send('metadata-error', {
          error: err.message,
        });
        this.stopFetching();
      });

      this.currentRequest.end();

    } catch (err) {
      console.error('[MetadataFetcher] Error:', err);
      this.mainWindow.webContents.send('metadata-error', {
        error: err.message,
      });
    }
  }

  stopFetching() {
    if (this.currentRequest) {
      this.currentRequest.destroy();
      this.currentRequest = null;
    }

    if (this.currentParser) {
      this.currentParser.destroy();
      this.currentParser = null;
    }

    console.log('[MetadataFetcher] Stopped');
  }
}

module.exports = { MetadataFetcher };
