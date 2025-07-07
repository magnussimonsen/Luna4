// Luna4FileDropdownStore.js

import { defineStore } from 'pinia'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import { gzipCompressAsync, gzipDecompressAsync } from '@/utils/compressMe.js'
import { useThemeStore } from '@/stores/Luna4ThemeStore.js'

//import { useThemeStore } from '@/stores/Luna4ThemeStore.js'
// This store is used to manage the dropdown menu in the file menu of the application.
// It contains the options that are displayed in the dropdown menu and the actions that are performed when an option is selected.
export const useFileDropdownStore = defineStore('fileDropdown', {
  state: () => ({
    options: [
      { label: 'New file', shortcut: 'Ctrl + n', value: 'newFile', icon: null },
      { label: 'Open file', shortcut: 'Ctrl + o', value: 'openFile', icon: null },
      {
        label: 'Save all notebooks to the current file',
        shortcut: 'Ctrl + s',
        value: 'saveFile',
        icon: null
      },
      {
        label: 'Save all notebooks as a new file',
        shortcut: 'Ctrl + Shift + s',
        value: 'saveFileAs',
        icon: null
      },
      {
        label: 'Export PDF of selected notebook',
        shortcut: 'Ctrl + e',
        value: 'exportPDF',
        icon: null
      },
      {
        label: 'Export PDF of selected notebook for assignment hand-in',
        shortcut: 'Ctrl + Shift + a',
        value: 'exportPDFAssignment',
        icon: null
      },
      { label: 'Settings', shortcut: 'Ctrl + shift + x', value: 'settings', icon: null },
      { label: ' About', shortcut: '', value: 'about', icon: null },
      { label: 'Quit', shortcut: 'Ctrl + Shift + q', value: 'quit', icon: null }
    ]
  }),
  actions: {
    // Add in the actions section of useFileDropdownStore
    quit() {
      // Show confirmation dialog asking if user wants to save before exiting
      window.electron.ipcRenderer
        .invoke('show-confirm-cancel-dialog', {
          title: 'Quit Luna',
          message: 'Do you want to save your work before exiting?'
        })
        .then((action) => {
          if (action === 'yes') {
            // User clicked "Yes", save the file before exiting
            // First check if the file has been saved before (i.e., has a filename)
            const notebooksAndCellsStore = useNotebooksAndCellsStore()
            if (notebooksAndCellsStore.notebooks[0].fileName) {
              // Save it using normal saveAs() logic and then exit
              return this.saveFile().then(() => {
                console.log('File saved, now exiting...')
                return window.electron.ipcRenderer.invoke('quit-app')
              })
            }
            if (!notebooksAndCellsStore.notebooks[0].fileName) {
              // The file has not been given a filename yet
              notebooksAndCellsStore.isSaved = false
              // Save it using normal saveAs() logic and then exit
              return this.saveFileAs().then(() => {
                console.log('File saved, now exiting...')
                return window.electron.ipcRenderer.invoke('quit-app')
              })
            }
          } else if (action === 'no') {
            // User clicked "No", exit without saving
            console.log('Exiting without saving...')
            return window.electron.ipcRenderer.invoke('quit-app')
          } else {
            // User clicked "Cancel" or closed the dialog
            console.log('Quit cancelled')
            // Do nothing, just return
            return Promise.resolve()
          }
        })
        .catch((err) => {
          console.error('Error during exit:', err)
          // Try to exit anyway if there was an error
          window.electron.ipcRenderer.invoke('quit-app')
        })
    },

    newFile() {
      // Start by opening a modal dialog to ask user if they want to save the current file
      // Use IPC to show a dialog from the main process
      window.electron.ipcRenderer
        .invoke('show-confirm-dialog', {
          title: 'New File',
          message: 'Do you want to save the current file before creating a new one?'
        })
        .then((result) => {
          if (result.response === 0) {
            // User clicked "Yes", so save the file
            this.saveFile()
          }
        })
        .then(() => {
          // Clear the notebooks in the store
          const notebooksAndCellsStore = useNotebooksAndCellsStore()
          // initialize a new notebook array in the normal way
          notebooksAndCellsStore.initializeNewNotebookArray()
        })
        .catch((err) => {
          // Why do I spend so much time on this? Do anyone even care?
          console.error('Failed to confirm new file:', err)
        })
    },

    // Modified to return a Promise that resolves with the file content
    openFile() {
      console.log('Open file clicked')
      return new Promise((resolve, reject) => {
        window.electron.ipcRenderer
          .invoke('show-open-dialog')
          .then((result) => {
            if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
              const filePath = result.filePaths[0]
              // Use IPC to read the file through the main process
              return window.electron.ipcRenderer.invoke('read-file', { filePath })
            } else {
              // User canceled file selection
              resolve(null)
              return null // Add this to prevent chain continuation
            }
          })
          .then((result) => {
            if (result && result.success) {
              console.log('File read successfully:', result.filePath)
              // Decompress the file content
              return gzipDecompressAsync(result.content)
                .then((decompressedContent) => {
                  // Return the result with the decompressed content
                  resolve({
                    ...result,
                    content: decompressedContent
                  })
                })
                .catch((error) => {
                  console.error('Error decompressing file:', error)
                  // If decompression fails, try to use the content as-is
                  // (could be an older uncompressed file format)
                  console.warn('Trying to use file content without decompression')
                  resolve(result)
                })
            } else if (result !== null) {
              resolve(null)
            }
          })
          .catch((err) => {
            console.error('Failed to read file:', err)
            window.electron.ipcRenderer.invoke('show-error-dialog', {
              title: 'Error',
              message: 'Failed to read file'
            })
            reject(err)
          })
      })
    },

    // Save all notebooks as a new file
    saveFileAs() {
      // Use the proper API
      window.electron.ipcRenderer
        .invoke('show-save-dialog')
        .then((result) => {
          if (!result.canceled && result.filePath) {
            const notebooksAndCellsStore = useNotebooksAndCellsStore()
            // Get notebooks (an array of notebook objects) from the store with fallback to empty array
            const allNotebooks = notebooksAndCellsStore?.notebooks ?? []
            if (!allNotebooks || allNotebooks.length === 0) {
              // Use IPC to show error dialog from the main process
              window.electron.ipcRenderer.invoke('show-error-dialog', {
                title: 'Error',
                message: 'No notebooks found to save.'
              })
              throw new Error('Notebooks is empty or undefined in saveFileAs()')
            }
            // All is okay, so set the file path and name in the store before saving
            notebooksAndCellsStore.notebooks[0].filePath = result.filePath
            // Extract just the filename from the file path
            const filePath = result.filePath
            const fileName = filePath.split(/[\\/]/).pop()
            //split(/[\\/]/) breaks the string at every forward slash or backslash
            // Windows result: ["C:", "Users", "magnu", "Documents", "MyNotebook.luna"]
            // Mac/Linux result: ["", "home", "user", "Documents", "MyNotebook.luna"]
            // pop() returns the last element of the array, which is the filename
            notebooksAndCellsStore.notebooks[0].fileName = fileName
            notebooksAndCellsStore.notebooks[0].filePath = filePath
            // Convert the object to a string, no filtering, with 2 spaces for indentation
            const allNotebooksString = JSON.stringify(allNotebooks, null, 2)

            // Compress the allNotebooksString using the async compression function
            return gzipCompressAsync(allNotebooksString).then((compressedContent) => {
              // Use IPC to save the compressed file through the main process
              return window.electron.ipcRenderer.invoke('save-file', {
                filePath: result.filePath,
                content: compressedContent
              })
            })
          }
        })
        .then((result) => {
          if (result && result.success) {
            console.log('File saved successfully at:', result.filePath)
            // Mark as saved
            const notebooksAndCellsStore = useNotebooksAndCellsStore()
            notebooksAndCellsStore.isSaved = true
          }
        })
        .catch((err) => {
          console.error('Failed to save file:', err)
          // Use IPC to show error dialog from the main process
          window.electron.ipcRenderer.invoke('show-error-dialog', {
            title: 'Error',
            message: 'Failed to save file'
          })
        })
    },
    // Save notebooks to existing file, or prompt for location if not previously saved
    saveFile() {
      const notebooksAndCellsStore = useNotebooksAndCellsStore()
      console.log('Current file:', notebooksAndCellsStore.notebooks[0].filePath)
      console.log('Current file:', notebooksAndCellsStore.notebooks[0].fileName)

      // Check if we have a filename already
      if (
        !notebooksAndCellsStore.notebooks ||
        !notebooksAndCellsStore.notebooks[0] ||
        !notebooksAndCellsStore.notebooks[0].fileName
      ) {
        // No filename, so use saveFileAs to prompt for location
        console.log('No existing file found, prompting for save location...')
        return this.saveFileAs()
      }
      // We have a filename, so save to that file
      console.log('Saving to existing file:', notebooksAndCellsStore.notebooks[0].fileName)
      // Get notebooks from the store
      const allNotebooks = notebooksAndCellsStore?.notebooks ?? []
      if (!allNotebooks || allNotebooks.length === 0) {
        window.electron.ipcRenderer.invoke('show-error-dialog', {
          title: 'Error',
          message: 'No notebooks found to save.'
        })
        throw new Error('Notebooks is empty or undefined in saveFile()')
      }
      // Convert notebooks to string
      const allNotebooksString = JSON.stringify(allNotebooks, null, 2)

      // Compress the allNotebooksString using async compression
      return gzipCompressAsync(allNotebooksString)
        .then((compressedContent) => {
          // Use IPC to save the compressed data to existing file
          return window.electron.ipcRenderer.invoke('save-to-existing-file', {
            filePath: notebooksAndCellsStore.notebooks[0].filePath,
            content: compressedContent
          })
        })
        .then((result) => {
          if (result && result.success) {
            console.log('File saved successfully at:', result.filePath)
            // Mark as saved
            const notebooksAndCellsStore = useNotebooksAndCellsStore()
            notebooksAndCellsStore.isSaved = true
          }
        })
        .catch((err) => {
          console.error('Failed to save file:', err)
          // If saving to existing file fails, fall back to saveFileAs
          console.log('Falling back to saveFileAs...')
          return this.saveFileAs()
        })
    },

    exportPDF({ directToDesktop = false } = {}) {
      const notebooksAndCellsStore = useNotebooksAndCellsStore()
      // Import the theme store and set the active theme to light
      const themeStore = useThemeStore()
      const isDarkModeTemp = themeStore.isDarkMode
      if (isDarkModeTemp) {
        themeStore.setActiveTheme('Light')
      }
      // Calculate student name from components
      const firstName = notebooksAndCellsStore.notebooks[0].studentFirstName || ''
      const middleName = notebooksAndCellsStore.notebooks[0].studentMiddleName || ''
      const lastName = notebooksAndCellsStore.notebooks[0].studentLastName || ''
      const assignmentTitle = notebooksAndCellsStore.notebooks[0].assignmentTitle || ''
      const assignmentFileSafeTimestampFormatted =
        notebooksAndCellsStore.notebooks[0].assignmentFileSafeTimestampFormatted || ''

      // Combine name parts, filter out empty parts, and join with spaces
      const fullStudentName =
        [firstName, middleName, lastName].filter((namePart) => namePart.trim()).join('_') ||
        'Unknown_Student'

      // Create a filename-safe version of the student name
      const cleanStudentName = fullStudentName.replace(/[^a-zA-Z_]/g, 'x')
      const cleanAssignmentTitle = assignmentTitle.replace(/[^a-zA-Z0-9_]/g, '_')

      // Standard filename pattern
      const fileName = `${cleanStudentName}_${cleanAssignmentTitle}_${assignmentFileSafeTimestampFormatted}.pdf`

      // If this is a student hand-in and direct to desktop is requested
      if (notebooksAndCellsStore.isHandIn && directToDesktop) {
        // Get the desktop path
        return window.electron.ipcRenderer
          .invoke('get-desktop-path')
          .then((desktopPath) => {
            // Create full path to desktop
            const filePath = `${desktopPath}/${fileName}`
            console.log('Saving directly to desktop:', filePath)
            // Export PDF to that location
            return window.electron.ipcRenderer
              .invoke('export-to-pdf', { filePath })
              .then((result) => {
                if (result && result.success) {
                  console.log('PDF exported successfully to desktop')
                  window.electron.ipcRenderer.invoke('show-info-dialog', {
                    title: 'Success',
                    message: `Assignment PDF saved to your desktop as ${fileName}`
                  })
                } else {
                  console.error('PDF export failed:', result?.error)
                }
                notebooksAndCellsStore.isHandIn = false
                return result
              })
          })
          .catch((err) => {
            console.error('Failed to export PDF to desktop:', err)
            notebooksAndCellsStore.isHandIn = false
            window.electron.ipcRenderer.invoke('show-error-dialog', {
              title: 'Error',
              message: 'Failed to save PDF to desktop'
            })
          })
      }

      // Create dialog options
      const dialogOptions = {}

      // If this is a student hand-in, set a default filename
      if (notebooksAndCellsStore.isHandIn) {
        dialogOptions.defaultPath = fileName
      }

      // Show the save dialog with our options
      return window.electron.ipcRenderer
        .invoke('show-save-dialog-pdf', dialogOptions)
        .then((result) => {
          if (!result.canceled && result.filePath) {
            console.log('Save location selected:', result.filePath)
            // Use the direct PDF export from current window
            return window.electron.ipcRenderer.invoke('export-to-pdf', {
              filePath: result.filePath
            })
          }
        })
        .then((result) => {
          if (result && result.success) {
            console.log('PDF exported successfully at:', result.filePath)
          } else if (result) {
            console.error('PDF export failed:', result.error)
          } else {
            console.log('PDF export cancelled')
          }
          notebooksAndCellsStore.isHandIn = false
        })
        .catch((err) => {
          console.error('Failed to export PDF:', err)
          notebooksAndCellsStore.isHandIn = false
        })
    }
  }
})
