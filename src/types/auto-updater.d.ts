// Auto-updater types
export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
  files: unknown[];
}

export interface DownloadProgress {
  bytesPerSecond: number;
  percent: number;
  total: number;
  transferred: number;
}

export interface UpdateStatus {
  visible: boolean;
  type: 'checking' | 'available' | 'downloading' | 'downloaded' | 'error' | 'not-available';
  title: string;
  message: string;
}

export interface UpdateEventData {
  type: string;
  data: unknown;
}

// Mock electron-updater types for development
export interface MockAutoUpdater {
  autoDownload: boolean;
  autoInstallOnAppQuit: boolean;
  forceDevUpdateConfig: boolean;
  logger: unknown;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  checkForUpdates: () => void;
  downloadUpdate: () => void;
  quitAndInstall: () => void;
}

export interface MockLogger {
  transports: {
    file: { level: string };
  };
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}
