export interface MetadataUpdate {
  title: string | null;
  supported: boolean;
}

export interface MetadataError {
  error: string;
}

export interface ElectronAPI {
  startMetadataParsing: (stationUrl: string) => void;
  stopMetadataParsing: () => void;
  onMetadataUpdate: (callback: (data: MetadataUpdate) => void) => void;
  onMetadataError: (callback: (data: MetadataError) => void) => void;
  removeAllListeners: () => void;
  isElectron: boolean;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
