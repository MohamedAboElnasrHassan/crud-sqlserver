/**
 * TypeScript definitions for Electron API
 */

interface ElectronAPI {
  // IPC methods for window management
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;

  // Main window methods
  openMainWindow: () => Promise<{
    success: boolean;
    message?: string;
  }>;

  // Database window methods
  openDatabaseWindow: () => Promise<{
    success: boolean;
    message?: string;
  }>;

  closeDatabaseWindow: () => Promise<{
    success: boolean;
    message?: string;
  }>;

  isDatabaseWindowOpen: () => Promise<{
    success: boolean;
    isOpen: boolean;
    message?: string;
  }>;

  // Connection window methods
  closeConnectionWindow: () => Promise<{
    success: boolean;
    message?: string;
  }>;

  // Auto-updater methods (direct access)
  checkForUpdates: () => Promise<{
    success: boolean;
    message?: string;
  }>;

  downloadUpdate: () => Promise<{
    success: boolean;
    message?: string;
  }>;

  installUpdate: () => Promise<{
    success: boolean;
    message?: string;
  }>;

  getVersion: () => Promise<{
    success: boolean;
    version?: string;
    message?: string;
  }>;

  onUpdateEvent: (callback: (data: unknown) => void) => () => void;
  removeUpdateListeners: () => void;

  // Auto-updater methods (nested for compatibility)
  updater: {
    checkForUpdates: () => Promise<{
      success: boolean;
      message?: string;
    }>;

    downloadUpdate: () => Promise<{
      success: boolean;
      message?: string;
    }>;

    installUpdate: () => Promise<{
      success: boolean;
      message?: string;
    }>;

    getVersion: () => Promise<{
      success: boolean;
      version?: string;
      message?: string;
    }>;

    onUpdateEvent: (callback: (event: unknown, data: unknown) => void) => () => void;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
