/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.ts you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */

import { contextBridge, ipcRenderer } from 'electron';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  // IPC methods for window management
  invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),

  // Main window methods
  openMainWindow: () => ipcRenderer.invoke('open-main-window'),

  // Database window methods
  openDatabaseWindow: () => ipcRenderer.invoke('open-database-window'),
  closeDatabaseWindow: () => ipcRenderer.invoke('close-database-window'),
  isDatabaseWindowOpen: () => ipcRenderer.invoke('is-database-window-open'),

  // Connection window methods
  closeConnectionWindow: () => ipcRenderer.invoke('close-connection-window'),

  // Auto-updater methods (direct access)
  checkForUpdates: () => ipcRenderer.invoke('updater-check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('updater-download-update'),
  installUpdate: () => ipcRenderer.invoke('updater-install-update'),
  getVersion: () => ipcRenderer.invoke('updater-get-version'),

  // Listen to updater events
  onUpdateEvent: (callback: (data: unknown) => void) => {
    const handler = (_event: unknown, data: unknown) => callback(data);
    ipcRenderer.on('auto-updater', handler);
    return () => ipcRenderer.removeListener('auto-updater', handler);
  },

  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('auto-updater');
  },

  // Auto-updater methods (nested for compatibility)
  updater: {
    checkForUpdates: () => ipcRenderer.invoke('updater-check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('updater-download-update'),
    installUpdate: () => ipcRenderer.invoke('updater-install-update'),
    getVersion: () => ipcRenderer.invoke('updater-get-version'),

    // Listen to updater events
    onUpdateEvent: (callback: (event: unknown, data: unknown) => void) => {
      ipcRenderer.on('auto-updater', callback);
      return () => ipcRenderer.removeListener('auto-updater', callback);
    },
  },
});
