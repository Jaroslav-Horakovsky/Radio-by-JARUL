const { Transform } = require('stream');

class IcyMetadataParser extends Transform {
  constructor(icyMetaInt) {
    super();
    this.icyMetaInt = icyMetaInt; // Bytes mezi metadata chunky
    this.buffer = Buffer.alloc(0);
    this.audioBufferSize = 0;
    this.metadataSize = 0;
    this.isParsingMetadata = false;
    this.lastMetadata = null;
  }

  _transform(chunk, encoding, callback) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (this.buffer.length > 0) {
      if (!this.isParsingMetadata) {
        // Fáze 1: Čteme audio data
        const bytesNeeded = this.icyMetaInt - this.audioBufferSize;

        if (this.buffer.length >= bytesNeeded) {
          // Přeskočíme audio data (nejsou nás zajímají)
          this.buffer = this.buffer.slice(bytesNeeded);
          this.audioBufferSize = 0;
          this.isParsingMetadata = true;
        } else {
          // Ještě nemáme dost dat
          this.audioBufferSize += this.buffer.length;
          this.buffer = Buffer.alloc(0);
          break;
        }
      } else {
        // Fáze 2: Čteme metadata
        if (this.metadataSize === 0) {
          // Načteme size byte (první byte metadata)
          if (this.buffer.length < 1) break;

          this.metadataSize = this.buffer[0] * 16; // Size v 16-byte blocks
          this.buffer = this.buffer.slice(1);

          if (this.metadataSize === 0) {
            // Žádná metadata (prázdná změna)
            this.isParsingMetadata = false;
            continue;
          }
        }

        // Načteme metadata data
        if (this.buffer.length >= this.metadataSize) {
          const metadataBuffer = this.buffer.slice(0, this.metadataSize);
          this.buffer = this.buffer.slice(this.metadataSize);

          // Parsuj metadata
          const metadata = this.parseMetadata(metadataBuffer);
          if (metadata && metadata !== this.lastMetadata) {
            this.lastMetadata = metadata;
            this.emit('metadata', metadata);
          }

          // Reset pro další cyklus
          this.metadataSize = 0;
          this.isParsingMetadata = false;
        } else {
          // Ještě nemáme všechna metadata
          break;
        }
      }
    }

    callback();
  }

  parseMetadata(buffer) {
    try {
      // Dekóduj jako UTF-8 (většina moderních streamů)
      let metadataString = buffer.toString('utf8').replace(/\0/g, '').trim();

      // Fallback na Latin1 pokud UTF-8 selže
      if (!metadataString || metadataString.includes('�')) {
        metadataString = buffer.toString('latin1').replace(/\0/g, '').trim();
      }

      // Extrahuj StreamTitle
      const match = metadataString.match(/StreamTitle='([^']*)'/);
      if (match && match[1]) {
        return match[1].trim();
      }

      return null;
    } catch (err) {
      console.error('Metadata parse error:', err);
      return null;
    }
  }
}

module.exports = { IcyMetadataParser };
