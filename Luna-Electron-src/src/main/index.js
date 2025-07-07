import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import zlib from 'node:zlib'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Register the compression handlers directly here instead of importing them
  registerCompressionHandlers()
}

// Register IPC handlers for compression/decompression
function registerCompressionHandlers() {
  // Handler for compression
  ipcMain.handle('compress-data', async (event, { data }) => {
    return new Promise((resolve, reject) => {
      zlib.gzip(data, (err, result) => {
        if (err) {
          return reject(err)
        }
        // Convert compressed binary data to base64 for safe IPC transport
        resolve(result.toString('base64'))
      })
    })
  })

  // Handler for decompression
  ipcMain.handle('decompress-data', async (event, { data }) => {
    return new Promise((resolve, reject) => {
      // If data is base64 encoded (from file read), convert to buffer first
      let buffer
      if (typeof data === 'string') {
        try {
          // Try to decode base64
          buffer = Buffer.from(data, 'base64')
        } catch (err) {
          // If not base64, use as plain string
          buffer = Buffer.from(data)
        }
      } else {
        // If already a buffer-like object, use as is
        buffer = Buffer.from(data)
      }

      zlib.gunzip(buffer, (err, result) => {
        if (err) {
          return reject(err)
        }
        // Return decompressed data as UTF-8 string
        resolve(result.toString('utf8'))
      })
    })
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  //-------------------------
  // LUNA IPC HANDLERS
  //-------------------------

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Add this with other IPC handlers
  ipcMain.handle('quit-app', async () => {
    app.quit()
    return true
  })

  // Add this to your main process
  ipcMain.handle('get-desktop-path', () => {
    return app.getPath('desktop')
  })

  // This handler will show the error dialog
  ipcMain.handle('show-error-dialog', async (event, opts) => {
    dialog.showErrorBox(opts.title, opts.message)
    return true
  })
  // This handler will show the info dialog
  ipcMain.handle('show-info-dialog', async (event, opts = {}) => {
    const { title = 'Information', message = '' } = opts
    return dialog.showMessageBox({
      type: 'info',
      buttons: ['OK'],
      title,
      message
    })
  })

  // This handler will show the confirm dialog and return the result
  ipcMain.handle('show-confirm-dialog', async (event, opts) => {
    const result = await dialog.showMessageBox({
      type: 'question',
      buttons: ['Yes', 'No'],
      title: opts.title,
      message: opts.message
    })
    return result.response === 0 // Returns true if "Yes" was clicked
  })

  // New handler for Yes/No/Cancel confirmation dialog
  ipcMain.handle('show-confirm-cancel-dialog', async (event, opts) => {
    const result = await dialog.showMessageBox({
      type: 'question',
      buttons: ['Yes', 'No', 'Cancel'],
      title: opts.title || 'Confirm',
      message: opts.message || 'Are you sure?',
      cancelId: 2 // Index of the Cancel button
    })

    // Return a string representing the button clicked
    // This is more explicit than numbers or booleans
    if (result.response === 0) return 'yes'
    if (result.response === 1) return 'no'
    return 'cancel' // response === 2 or dialog was closed
  })

  // This handler will show the open dialog and return the selected file path
  ipcMain.handle('show-open-dialog', async () => {
    const desktopPath = app.getPath('desktop')
    const result = await dialog.showOpenDialog({
      title: 'Open Luna File',
      defaultPath: desktopPath, // Default to desktop
      filters: [{ name: 'Luna Files', extensions: ['luna'] }],
      properties: ['openFile']
    })
    return result
  })

  // This handler will read the file and return the content
  ipcMain.handle('read-file', async (event, { filePath }) => {
    return new Promise((resolve, reject) => {
      // Read file as binary data instead of utf-8
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err)
        } else {
          // Convert binary data to base64 string for safe transport over IPC
          const base64Data = data.toString('base64')
          resolve({
            success: true,
            filePath: filePath,
            content: base64Data,
            encoding: 'base64' // Add encoding info so we know how to handle it
          })
        }
      })
    })
  })

  ipcMain.handle('save-to-existing-file', async (event, opts) => {
    try {
      // Convert base64 string back to binary if needed
      let dataToWrite
      if (typeof opts.content === 'string' && opts.content.match(/^[A-Za-z0-9+/=]+$/)) {
        // Likely base64 encoded binary data
        try {
          dataToWrite = Buffer.from(opts.content, 'base64')
        } catch (err) {
          // Fallback to treating as regular string
          dataToWrite = opts.content
        }
      } else {
        // Regular string or already a buffer
        dataToWrite = opts.content
      }

      fs.writeFileSync(opts.filePath, dataToWrite)
      return {
        success: true,
        filePath: opts.filePath
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  })

  // This handler will show save dialog and return the selected file path
  ipcMain.handle('show-save-dialog', async () => {
    const desktopPath = app.getPath('desktop')
    const result = await dialog.showSaveDialog({
      title: 'Save Luna File',
      defaultPath: join(desktopPath, 'untitled.luna'), // Default to desktop
      filters: [{ name: 'Luna Files', extensions: ['luna'] }],
      properties: ['createDirectory']
    })
    return result
  })

  ipcMain.handle('save-file', async (event, { filePath, content }) => {
    return new Promise((resolve, reject) => {
      // Convert base64 string back to binary if needed
      let dataToWrite
      if (typeof content === 'string' && content.match(/^[A-Za-z0-9+/=]+$/)) {
        // Likely base64 encoded binary data
        try {
          dataToWrite = Buffer.from(content, 'base64')
        } catch (err) {
          // Fallback to treating as regular string
          dataToWrite = content
        }
      } else {
        // Regular string or already a buffer
        dataToWrite = content
      }

      fs.writeFile(filePath, dataToWrite, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve({ success: true, filePath: filePath })
        }
      })
    })
  })

  // PDF Export dialog handler
  ipcMain.handle('show-save-dialog-pdf', async (event, options = {}) => {
    const desktopPath = app.getPath('desktop')
    const defaultFileName = options.defaultPath || 'notebook.pdf'
    const result = await dialog.showSaveDialog({
      title: 'Export Notebook to PDF',
      defaultPath: join(desktopPath, defaultFileName), // Default to desktop
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
      properties: ['createDirectory'] // Keep this line from original
    })
    return result
  })

  // PDF Export handler - simplified approach
  //ipcMain.handle('export-to-pdf', async (event, { filePath, header, footer }) => {
  ipcMain.handle('export-to-pdf', async (event, { filePath }) => {
    try {
      console.log('Starting PDF export to:', filePath)
      // Get the webContents of the CURRENT window
      const webContents = event.sender
      // Wait for any pending renders to complete
      await new Promise((resolve) => setTimeout(resolve, 1000))
      webContents.setZoomFactor(1)
      const pdfData = await webContents.printToPDF({
        pageSize: 'A4',
        printBackground: true, // Include background colors and images
        landscape: false,
        marginsType: 0, // 0 for default margin, 1 for no margin, 2 for minimum margin
        preferCSSPageSize: true
      })

      // Write to file
      await fs.promises.writeFile(filePath, pdfData)
      console.log('PDF file written successfully')

      return { success: true, filePath: filePath }
    } catch (error) {
      console.error('PDF generation error:', error)
      return { success: false, error: error.message }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
