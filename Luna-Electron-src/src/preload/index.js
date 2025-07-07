/**
 * Luna4 Electron Preload Script
 *
 * This file serves as a secure bridge between Electron's main process and renderer process,
 * allowing limited IPC communication while maintaining security boundaries.
 *
 * IMPORTANT: This file must use CommonJS (require) syntax instead of ES modules (import)
 * because preload scripts execute in a Node.js context before the renderer process loads.
 *
 * Security Features:
 * 1. Uses contextBridge to safely expose only specific APIs to the renderer
 * 2. Implements a channel whitelist through validChannels array
 * 3. Explicitly rejects unauthorized IPC channels
 * 4. Properly merges custom APIs with Electron's standard APIs
 *
 * When adding new IPC functionality:
 * 1. Add the channel name to validChannels array
 * 2. Register the corresponding handler in the main process (index.js)
 * 3. Restart the Electron app completely (hot reload is not sufficient)
 */

const { contextBridge, ipcRenderer } = require('electron')
const { electronAPI } = require('@electron-toolkit/preload')

// Custom APIs for renderer
const api = {}

// IPC communication API with channel restrictions
const lunaAPI = {
  ipcRenderer: {
    invoke: (channel, ...args) => {
      // Security: Only allow these specific channels to be used
      const validChannels = [
        'hamdle-copy',
        'decompress-data',
        'compress-data',
        'show-info-dialog',
        'get-desktop-path',
        'quit-app',
        'show-error-dialog',
        'show-confirm-dialog',
        'show-confirm-cancel-dialog', // Add the new channel
        'show-open-dialog',
        'read-file',
        'save-to-existing-file',
        'show-save-dialog',
        'save-file',
        'show-save-dialog-pdf',
        'export-to-pdf'
      ]

      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args)
      }
      return Promise.reject(new Error(`Unauthorized IPC channel: ${channel}`))
    }
  }
}

// Use contextBridge to expose APIs to the renderer process
// contextBridge ensures APIs are available in isolated worlds
if (process.contextIsolated) {
  try {
    // Merge built-in electronAPI with our custom lunaAPI
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      ...lunaAPI
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // Fallback for when context isolation is disabled
  window.electron = {
    ...electronAPI,
    ...lunaAPI
  }
  window.api = api
}

/*  OLD CODE FOR REFERENCE
import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}*/
