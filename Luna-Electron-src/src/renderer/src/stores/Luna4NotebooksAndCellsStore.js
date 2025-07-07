// ---------------------------------------------------------------------------
// File: C:\Users\magnu\Luna\Luna4\src\renderer\src\stores\Luna4NotebooksAndCellsStore.js
// ---------------------------------------------------------------------------
//
// Summary:
// This Pinia store manages notebooks and their cells, providing a central
// point for creating, renaming, deleting, and reordering both notebooks and
// cells. It also maintains a special "recycle bin" notebook for deleted items.
// Through computed properties, it offers convenient access to the currently
// selected notebook and cell, as well as total counts. The store integrates
// with confirmation dialogs to ensure users can review destructive actions.
//
// Key Features:
// - Maintains a list of notebooks, each containing an array of cells.
// - The first notebook is a dedicated recycle bin for deleted cells/notebooks.
// - Provides actions to create, rename, move, and delete notebooks and cells.
// - Ensures at least one active notebook always exists.
// - Supports selection and navigation between cells and notebooks.
// - Integrates with alert modals for confirming deletion actions.
//
// Structure:
// 1. State Variables & References
// 2. Computed Properties
// 3. Notebook Actions
// 4. Cell Actions
// 6. Lifecycle Hooks (initialization)
// Following this, several helper functions for confirmations are defined.

// TO DO: Give all celltypes an error property called toolbarError, and add it to the cell-components

import { defineStore } from 'pinia'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { generateUniqueId } from '../utils/idGenerator'
import { getCurrentFormattedDate } from '../utils/dateFormatter'
import { useFileDropdownStore } from '@/stores/Luna4FileDropdownStore'
import probabilityDistributionsObject from '@/componentsFiles/probCalcFiles/probDistObj.json'
import _ from 'lodash' // For deep cloning objects

export const useNotebooksAndCellsStore = defineStore('notebooksAndCellsStore', () => {
  const isDeleteCellModalEnabled = true // turn off delete cell confirmation modal

  /**
   * createNotebooks
   * Creates an array of notebook objects. The first notebook is the recycle bin.
   * @returns {Array} An array of notebook objects.
   */

  const createNotebooks = () => {
    const notebooks = [
      {
        fileName: '', // This is the file name of the entire notebooks array
        assignmentTitle: '', // The assignment title (for future use)
        assignmentFileSafeTimestampFormatted:
          getCurrentFormattedDate({ dateAndTimeFormat: 'useSettingsFileSafe' }) || '',
        assignmentTimeStampFormatted:
          getCurrentFormattedDate({ dateAndTimeFormat: 'useSettings' }) || '',
        studentFirstName: '', // The name of the student
        studentMiddleName: '', // The middle name of the student
        studentLastName: '', // The last name of the student
        id: generateUniqueId(),
        name: 'Recycle Bin Notebook',
        cells: [],
        createdAt: new Date().toISOString(),
        editable: true, // For “move out of recycle bin” logic
        deletable: false, // Cannot delete the recycle bin
        isNotebookReadOnlyForever: false, // For move out of recycle bin” logic
        globalBugReports: [] // Array of bug reports
      }
    ]
    return notebooks
  }

  const loadNotebooksFromFile = async (notebooksFromFile) => {
    // notebooks from file is a string with JSON data
    if (!notebooksFromFile) {
      throw new Error('Failed to open file.')
    }
    try {
      const notebooksFromFileObj = JSON.parse(notebooksFromFile)
      if (notebooksFromFileObj && Array.isArray(notebooksFromFileObj)) {
        if (notebooks.value) {
          // Ask user if they want to replace the current notebooks with the loaded ones
          // Use a yes/no dialog to confirm the action
          const confirmed = await window.electron.ipcRenderer.invoke('show-confirm-dialog', {
            title: 'Replace Notebooks',
            message: 'Do you want to replace the current notebooks with the loaded ones?'
          })
          if (!confirmed) {
            return
          }
        }
        // Clear the current notebooks and load the new ones
        notebooks.value = notebooksFromFileObj
        // Check if the loaded notebooks structure is valid
        // This is complex and needs more work (not now), but we can at least check if the
        // first two notebooks are valid and that they have an id and cells
        const isInvalid =
          !Array.isArray(notebooks.value) ||
          notebooks.value.length < 2 ||
          //!notebooks.value[0]?.fileName ||  // I do not understand why uncommenting this line causes invalid
          !notebooks.value[0]?.id ||
          !notebooks.value[1]?.id ||
          !Array.isArray(notebooks.value[0]?.cells) ||
          !Array.isArray(notebooks.value[1]?.cells)

        // Initialize default notebooks if invalid structure detected
        if (isInvalid) {
          console.error('Invalid notebook structure detected, resetting to defaults')
          notebooks.value = createNotebooks()
          addNotebook('My First Notebook (Double-click to rename)')
          // Select the newly created notebook and its cell
          selectedNotebookId.value = notebooks.value[1].id
          selectedCellId.value = notebooks.value[1].cells[0].id
          return // Exit early since we've set everything up
        }

        // If we get here, the notebook structure is valid (May need more checks)
        // Always select the first user notebook (index 1)
        selectedNotebookId.value = notebooks.value[1].id
        if (notebooks.value[1].cells.length === 0) {
          // No cells found, create a default cell
          const defaultCell = createCell(
            'Markdown',
            '# Welcome to Luna!\n\nThis is a Markdown cell.'
          )
          notebooks.value[1].cells.push(defaultCell)
          selectedCellId.value = defaultCell.id
        } else {
          // Select the first cell in the notebook
          selectedCellId.value = notebooks.value[1].cells[0].id
        }
        // Use nextTick to ensure we run AFTER the watcher has processed changes
        nextTick(() => {
          // Now set the saved state - this happens after the watcher has run
          isCurrentStateSaved.value = true
          lastSavedTimestamp.value = new Date()
          console.log('File loaded and marked as saved')
        })
      } else {
        throw new Error('Loaded file has invalid file format (JSON is corrupted).')
      }
    } catch (error) {
      console.error('Error opening file:', error)
      // Use IPC instead of require
      await window.electron.ipcRenderer.invoke('show-error-dialog', {
        title: 'Error Opening File',
        message: error.message
      })
      return
    }
  }

  // Initialize the reference to the array of notebooks
  const notebooks = ref(createNotebooks())

  // Select the first notebook by default
  const selectedNotebookId = ref(notebooks.value[1]?.id ?? notebooks.value[0]?.id)

  // Keep track of the selected notebook
  const selectedNotebook = computed(
    () => notebooks.value.find((notebook) => notebook.id === selectedNotebookId?.value) || null
  )

  const isGlobalBug = computed(() => {
    return notebooks.value[0]?.globalBugReports?.length > 0
  })

  // Check if the recycle bin notebook is selected
  const isRecycleBinNotebookSelected = computed(
    () => notebooks.value[0]?.id === selectedNotebookId?.value
  )

  // Keep track of the number of notebooks
  const notebookCount = computed(() => notebooks.value?.length ?? 0)

  // Keep track of the selected cell ID
  const selectedCellId = ref(null)

  const resetSelectedCellId = () => {
    selectedCellId.value = null
  }

  // Reference to the cells array of the selected notebook
  const cells = computed(() => selectedNotebook.value?.cells ?? [])

  // Keep track of the number of cells in the selected notebook
  const cellCount = computed(() => cells.value.length)

  // Keep track of the selected cell ID
  const selectedCell = computed(
    () => cells.value.find((cell) => cell.id === selectedCellId.value) || null
  )
  // Keep track of the index of the selected cell
  const selectedCellIndex = computed(() => {
    return cells.value.findIndex((cell) => cell.id === selectedCellId.value) + 1
  })
  // Check if the selected cell is in the selected notebook
  const isSelectedCellInSelectedNotebook = computed(() => {
    return cells.value.some((cell) => cell.id === selectedCellId.value)
  })

  // Check if the selected cell is currently editable
  // To do: Change name to isSelectedCellEditable
  const isCellCurrentlyEditable = computed(() => {
    if (!selectedCell.value) {
      return false // Not editable if no cell is selected
    }
    if (selectedCell.value.isCellReadOnlyForever) {
      return false
    } else if (!selectedCell.value.editable) {
      return false
    } else {
      return true
    }
  })

  const addGlobalBugReport = (bugReport) => {
    // --- BugReport standard object ---
    // id: generateUniqueId(),
    // bugReport: bugReport,
    // createdAt: new Date().toISOString()
    // bugReport.source // file name
    // bugReport.errorType  // error, warning, info
    // bugReport.errorLocation // function name
    // bugReport.customMessage // custom message
    // bugReport.error // error from for example try catch
    // Make sure globalBugReports exists
    if (!notebooks.value[0].globalBugReports) {
      notebooks.value[0].globalBugReports = []
    }
    const bugStandardReportObject = {
      id: generateUniqueId(),
      bugReport: bugReport,
      createdAt: new Date().toISOString()
    }
    notebooks.value[0].globalBugReports.push(bugStandardReportObject)
  }

  const isHandIn = ref(false) // Flag for toggling on student info header in export to pdf
  const isCurrentStateSaved = ref(true)
  const lastSavedTimestamp = ref(null)
  const isSaved = computed({
    get() {
      return isCurrentStateSaved.value && notebooks.value?.[0]?.fileName !== ''
    },
    set(value) {
      isCurrentStateSaved.value = value
      lastSavedTimestamp.value = new Date()
    }
  })

  // Auto-save functionality
  const isAutoSaveEnabled = ref(false) // Can be toggled by a setting
  const autoSaveCounter = ref(0)
  const autoSaveThreshold = ref('off') // Number of changes before triggering auto-save

  // Add a deep watcher to detect changes in notebooks
  watch(
    () => notebooks.value,
    () => {
      // When notebooks change, mark as unsaved
      isCurrentStateSaved.value = false
      // Auto-save logic. String type means auto-save is disabled, 'off'
      if (isAutoSaveEnabled.value && typeof autoSaveThreshold.value !== 'string') {
        autoSaveCounter.value++
        if (autoSaveCounter.value >= autoSaveThreshold.value) {
          autoSaveCounter.value = 0
          console.log(`Auto-saving after ${autoSaveThreshold.value} changes...`)
          isCurrentStateSaved.value = true
          const fileDropdownStore = useFileDropdownStore()
          fileDropdownStore.saveFile()
        }
      }
    },
    { deep: true }
  )

  // Getters and setters for auto-save settings
  const getAutoSaveEnabled = computed(() => isAutoSaveEnabled.value)
  const setAutoSaveEnabled = (value) => {
    isAutoSaveEnabled.value = value
  }

  const getAutoSaveThreshold = computed(() => autoSaveThreshold.value)
  const setAutoSaveThreshold = (value) => {
    autoSaveThreshold.value = value
  }

  watch(
    () => autoSaveThreshold.value,
    (newValue) => {
      console.log('AutoSave Threshold updated to:', newValue)
    }
  )

  /**
   * initAutoSaveSettings
   * Initializes the auto-save settings with default values.
   * By default, auto-save is disabled.
   */
  const initAutoSaveSettings = () => {
    isAutoSaveEnabled.value = false
    autoSaveThreshold.value = 'off'
    autoSaveCounter.value = 0
    console.log('Auto-save settings initialized:', {
      enabled: isAutoSaveEnabled.value,
      threshold: autoSaveThreshold.value
    })
  }

  /**
   * addNotebook
   * Creates a new notebook with an optional name, selects it, and adds a default cell.
   * @param {String} [name] - Optional custom name for the new notebook.
   */
  const addNotebook = (newNotebookName) => {
    const newNotebook = {
      id: generateUniqueId(), // Unique ID for the notebook
      name: newNotebookName || 'Untitled Notebook (Double-click to rename)', // Name of the notebook
      cells: [], // Array of cells in the notebook
      createdAt: new Date().toISOString(), // Date of creation
      editable: true, // Can be edited by the user
      deletable: true, // Can be removed if not the only notebook
      isNotebookReadOnlyForever: false, // Is the notebook permanently read-only?
      pythonFunctions: {}, // Global functions from python worker in this notebook
      pythonVariables: {}, // Global variables from python worker in this notebook (NOT IMPLEMENTED YET)
      pythonWorkerInstance: null, // The python Worker instance for this notebook
      sympyFunctions: {}, // Global functions from sympy worker in this notebook (NOT IMPLEMENTED YET)
      sympyVariables: {}, // Global variables from sympy worker in this notebook (NOT IMPLEMENTED YET)
      sympyWorkerInstance: null, // The sympy Worker instance for this notebook (NOT IMPLEMENTED YET)
      isAnyPythonCellRunningInSelectedNotebook: false, // Is any Python cell in the notebook currently running?
      isAnySympyCellRunningInSelectedNotebook: false, // Is any Sympy cell in the notebook currently running?
      isLunaSympyApiRunning: false, // Is the Luna Sympy API currently running. Usefull for the spinning icon in the toolbar
      runningPythonCellId: null, // The ID of the Python cell currently running
      runningSympyCellId: null, // The ID of the CAS cell currently running
      userCasData: [
        {
          //Example of user defined functions, equations, variables, points and vectors
          type: 'Function',
          lunaUniqueRef: 'f', // Reference to the function in Luna. Must be unique
          lunaFormat: 'f(x):=x^2+x-4',
          sympyUniqueRef: 'f', // Reference to the function in Sympy. Must be unique
          sympyFormat: '', // Sympy code to store the function.
          latex: '',
          rootsSympyFormat: '', // Roots from sympy
          rootsLunaFormat: '', // Roots from Sympy in Luna format? Not needed?
          rootsLaTeXFormat: ''
        },
        {
          type: 'Equation',
          LunaUniqueRef: 'Eq1', // Reference to the equation in Luna. Must be unique
          LunaFormat: '2x+4=6y',
          sympyUniqueRef: 'Eq1', // Reference to the equation in Sympy. Must be unique
          sympyFormat: '', // Sympy code to store the equation
          latex: '',
          solutionsSympyFormat: '', // Solutins from sympy
          solutionsLunaFormat: '', // Solutions from Sympy in Luna format? Not needed?
          solutionsLaTeXFormat: ''
        },
        {
          type: 'Variable',
          lunaUniqueRef: 'x', // Reference to the variable in Luna. Must be unique
          lunaFormat: 'x:=3',
          sympyUniqueRef: 'x', // Reference to the variable in Sympy. Must be unique
          sympyFormat: '',
          latex: '',
          lunaValue: 3,
          sympyValue: 3
        },
        {
          type: 'Point',
          lunaUniqueRef: 'A', // Reference to the point in Luna. Must be unique
          lunaFormat: 'A:=(3,4)',
          sympyUniqueRef: 'A', // Reference to the point in Sympy. Must be unique
          sympyFormat: '', // Sympy code to store the point
          latex: ''
        },
        {
          Type: 'Vector',
          LunaUniqueRef: 'v', // Reference to the vector in Luna. Must be unique
          LunaFormat: 'v:=[3,4]',
          sympyUniqueRef: 'v', // Reference to the vector in Sympy. Must be unique
          sympyFormat: '', // Sympy code to store the vector
          LunaVal: '[3, 4]',
          sympyVal: '[3, 4]',
          Latex: ''
        }
      ] // User-defined CAS data in this notebook
    }
    // Add the new notebook to the array
    notebooks.value?.push(newNotebook)
    // Select the new notebook
    selectedNotebookId.value = newNotebook.id
    addCell('Markdown', '# Welcome to Luna!\n\nThis is a Markdown cell.') // Add a default cell to the new notebook
    // Immediately create the Worker for this new notebook so it is available right away.
    if (!newNotebook.pythonWorkerInstance) {
      getOrCreatePythonWorker(newNotebook.id)
    }

    if (!newNotebook.sympyWorkerInstance) {
      getOrCreateSympyWorker(newNotebook.id)
    }
  }

  /**
   * getNotebook
   * Retrieves a notebook object by its ID.
   * @param {*} notebookId
   * @returns {Object|null} The notebook object if found, or null if not found.
   */

  const getNotebook = (notebookId) => {
    if (!notebooks.value) {
      console.log('MEGA ERROR! No notebooks available.')
      const notebooks = createNotebooks()
      return notebooks
    }
    const notebook = notebooks.value.find((nb) => nb.id === notebookId)
    if (!notebook) {
      console.log(`Notebook with ID ${notebookId} not found.`)
      return
    }
    return notebook
  }

  // ---------------------------------------------------------------------------
  // NOTEBOOK ACTIONS
  // ---------------------------------------------------------------------------

  /**
   * removeNotebook
   * Removes a notebook by its ID (except the recycle bin) and moves its cells to the recycle bin.
   * @param {String} notebookId
   * @returns {void}
   */
  const removeNotebook = (notebookId) => {
    const notebook = getNotebook(notebookId)
    if (notebook === null) {
      return
    }
    // Prevent removing the recycle bin notebook
    const indexToRemove = notebooks.value.findIndex((nb) => nb.id === notebookId)
    if (indexToRemove === -1 || indexToRemove === 0) return
    const notebookToRemove = notebooks.value[indexToRemove]
    // Mark all cells as non-editable before moving them to the recycle bin
    notebookToRemove.cells.forEach((cell) => {
      cell.editable = false
    })
    notebooks.value[0]?.cells?.push(...notebookToRemove.cells) // Move its cells to the recycle bin
    notebooks.value.splice(indexToRemove, 1) // Remove the notebook
    // If the removed notebook was selected, update the selection
    if (selectedNotebookId.value === notebookId) {
      selectedNotebookId.value = notebooks.value[indexToRemove - 1]?.id || notebooks.value[0].id
    }
    // If pythonWorkerInstance exists, terminate it
    if (notebookToRemove.pythonWorkerInstance) {
      notebookToRemove.pythonWorkerInstance.terminate()
      notebookToRemove.pythonWorkerInstance = null // Is this needed?
    }
    // If sympyWorkerInstance exists, terminate it
    if (notebookToRemove.sympyWorkerInstance) {
      notebookToRemove.sympyWorkerInstance.terminate()
      notebookToRemove.sympyWorkerInstance = null // Is this needed?
    }
    // Ensure there's at least one active notebook besides the recycle bin
    if (notebooks.value.length === 1) {
      addNotebook()
    }
  }

  /**
   * setSelectedNotebook
   * Sets the currently selected notebook by its ID.
   * @param {String} notebookId
   */
  const setSelectedNotebook = (notebookId) => {
    const notebook = getNotebook(notebookId)
    if (notebook === null) {
      return
    }
    selectedNotebookId.value = notebookId
  }

  /**
   * moveNotebookUp
   * Moves the selected notebook one position up in the array, if possible.
   */
  const moveNotebookUp = () => {
    if (notebooks.value.length <= 1) return
    const currentIndex = notebooks.value.findIndex((t) => t.id === selectedNotebookId.value)
    if (currentIndex <= 1) return // Cannot move the recycle bin or move above it
    const [notebookToMove] = notebooks.value.splice(currentIndex, 1)
    notebooks.value.splice(currentIndex - 1, 0, notebookToMove)
  }

  /**
   * moveNotebookDown
   * Moves the selected notebook one position down in the array, if possible.
   */
  const moveNotebookDown = () => {
    if (notebooks.value.length <= 1) return
    const currentIndex = notebooks.value.findIndex((t) => t.id === selectedNotebookId.value)
    if (currentIndex < 1 || currentIndex >= notebooks.value.length - 1) return
    const [notebookToMove] = notebooks.value.splice(currentIndex, 1)
    notebooks.value.splice(currentIndex + 1, 0, notebookToMove)
  }

  /**
   * updateNotebookPropVal
   * Updates a notebook property with new content.
   * @param {String} notebookId - The ID of the notebook to update.
   * @param {Array} updates - An array of objects with { property, content }.
   */

  const updateNotebookPropVal = (notebookId, valUpdates) => {
    const notebook = getNotebook(notebookId)
    if (notebook === null) {
      return
    }
    // Loop through each update object
    for (const { key, val } of valUpdates) {
      if (key === undefined || key === null) {
        console.log(`Property ${key} does not exist in the notebook.`)
        return
      }
      if (val === undefined || val === null) {
        console.log(`Content ${val} does not exist in the notebook.`)
        return
      }
      notebook[key] = val
    }
  }

  /**
   * updateNotebookName
   * Renames a notebook. If newName is empty, uses a fallback untitled name with a short ID.
   * @param {String} notebookId
   * @param {String} newName
   */
  const updateNotebookName = (notebookId, newName) => {
    const notebook = getNotebook(notebookId)
    if (notebook === null) {
      return
    }
    const shortId = notebookId.slice(0, 6)
    notebook.name = newName?.trim() ? newName : `Untitled Notebook ${shortId}`
  }
  // update the user defined CAS data in the notebook
  // Arguments: notebookId, an array of objects with { key, val }
  const updateUserCasData = (notebookId, newData, remove) => {
    const notebook = getNotebook(notebookId)
    if (notebook === null) {
      return
    }
    if (remove) {
      notebook.userCasData = notebook.userCasData.filter((item) => item.LunaRef !== newData.LunaRef)
    } else {
      if (notebook.userCasData.find((item) => item.LunaRef === newData.LunaRef)) {
        notebook.userCasData = notebook.userCasData.map((item) =>
          item.LunaRef === newData.LunaRef ? newData : item
        )
      } else notebook.userCasData?.push(newData)
    }
  }

  /**
   * updatePythonContext
   *
   * Merges new context data into the existing `pythonCellsContext` property of a specified notebook.
   * This function finds the notebook by its ID and updates its Python cell context by merging
   * the provided new context object with the existing context.
   *
   * @param {string} notebookId - The ID of the notebook to update.
   * @param {object} newContext - An object containing key-value pairs to merge into the notebook's pythonCellsContext.
   *
   * @example
   * // Usage example:
   * const notebooksStore = useNotebooksAndCellsStore();
   * notebooksStore.updatePythonContext(notebookId, { newVariable: value });
   *
   * // This will locate the notebook with the given notebookId and merge { newVariable: value }
   * // into its existing pythonCellsContext, preserving any previous context data.
   */
  const updatePythonNotebookUserFunctions = (notebookId, stuff) => {
    const notebook = notebooks.value.find((nb) => nb.id === notebookId)
    if (notebook) {
      // Merge or overwrite the existing context as needed
      notebook.pythonNotebookUserFunctions = {
        ...notebook.pythonNotebookUserFunctions,
        ...stuff
      }
    }
  }

  const updatePythonNotebookUserVariables = (notebookId, stuff) => {
    const notebook = notebooks.value.find((nb) => nb.id === notebookId)
    if (notebook) {
      // Merge or overwrite the existing context as needed
      notebook.pythonNotebookUserVariables = {
        ...notebook.pythonNotebookUserVariables,
        ...stuff
      }
    }
  }

  /**
   * getOrCreatePythonWorker
   * Retrieves or creates a Web Worker instance for executing Python code within the selected notebook.
   * If the selected notebook does not already have a Python Worker instance, this function creates one.
   * @returns {Worker|null} - The Web Worker instance associated with the selected notebook, or null if no notebook is selected.
   */

  function getOrCreatePythonWorker(notebookId) {
    const notebook = notebooks.value.find((nb) => nb.id === notebookId)
    if (!notebook) {
      console.log('Returning null from getOrCreatePythonWorker')
      return null
    }

    // Always create a new worker if it doesn't exist or is invalid
    if (
      !notebook.pythonWorkerInstance ||
      typeof notebook.pythonWorkerInstance.postMessage !== 'function'
    ) {
      notebook.pythonWorkerInstance = new Worker(
        new URL('../workers/pyworker.js', import.meta.url),
        { type: 'module' }
      )
    }

    return notebook.pythonWorkerInstance
  }
  // Terminate the Python Worker instance associated with the selected notebook.
  function terminatePythonWorker(notebookId) {
    const notebook = notebooks.value.find((nb) => nb.id === notebookId)
    if (!notebook) return
    if (notebook.pythonWorkerInstance) {
      notebook.pythonWorkerInstance.terminate()
      notebook.pythonWorkerInstance = null
    } else {
      return
    }
  }

  const isAnyPythonCellRunningInSelectedNotebook = (notebookId) => {
    const notebook = notebooks.value.find((nb) => nb.id === notebookId)
    if (notebook) {
      return notebook.isAnyPythonCellRunningInSelectedNotebook
    }
  }

  // Set the state of the Python cell running status in the selected notebook
  const setIsAnyPythonCellRunning = (notebookId, isAnyPythonCellRunningInSelectedNotebook) => {
    const notebook = notebooks.value.find((nb) => nb.id === notebookId)
    if (notebook) {
      notebook.isAnyPythonCellRunningInSelectedNotebook = isAnyPythonCellRunningInSelectedNotebook
    }
  }

  function getOrCreateSympyWorker(notebookId) {
    const notebook = notebooks.value.find((nb) => nb.id === notebookId)
    if (!notebook) {
      console.log('Returning null from getOrCreateSympyWorker')
      return null
    }
    // Always create a new worker if it doesn't exist or is invalid
    if (
      !notebook.sympyWorkerInstance ||
      typeof notebook.sympyWorkerInstance.postMessage !== 'function'
    ) {
      notebook.sympyWorkerInstance = new Worker(
        new URL('../workers/pyworker.js', import.meta.url), // we use the pythonworjer
        { type: 'module' }
      )
    }

    return notebook.sympyWorkerInstance // Add return statement to match getOrCreatePythonWorker
  }

  function terminateSympyWorker() {
    const notebook = selectedNotebook.value
    if (notebook.sympyWorkerInstance) {
      notebook.sympyWorkerInstance.terminate()
      notebook.sympyWorkerInstance = null
      console.log('Sympy Worker terminated from .')
    } else {
      return null
    }
  }

  const setIsSympyCellRunning = (notebookId, bol) => {
    const notebook = notebooks.value.find((nb) => nb.id === notebookId)
    if (notebook) {
      notebook.isAnySympyCellRunningInSelectedNotebook = bol
    } else {
      console.warn('Notebook not found')
    }
  }

  const setIsLunaSympyApiRunning = (notebookId, bol) => {
    const notebook = notebooks.value.find((nb) => nb.id === notebookId)
    if (notebook) {
      notebook.isLunaSympyApiRunning = bol
    }
  }

  // ---------------------------------------------------------------------------
  // 4. CELL ACTIONS
  // ---------------------------------------------------------------------------

  /**
   * addCell
   * Inserts a new cell into the selected notebook, by default after the selected cell, or at the end.
   * @param {String} [type='Text']
   * @param {String} [content='']
   */
  const addCell = (type = 'Markdown', content = '') => {
    if (!selectedNotebook.value) {
      console.log('No selected notebook to add a cell to.')
      return
    }
    if (notebooks.value[0]?.id === selectedNotebookId?.value) {
      console.log('Cannot insert new cells into the recycle bin notebook.')
      return
    }
    const newCell = createCell(type, content)
    const cellsArray = selectedNotebook.value?.cells
    const selectedIndex = cellsArray.findIndex((cell) => cell.id === selectedCellId.value)
    // Insert after selected cell or at the end if no selection
    if (
      cellsArray.length === 0 ||
      selectedIndex === -1 ||
      selectedIndex === cellsArray.length - 1
    ) {
      cellsArray.push(newCell)
    } else {
      cellsArray.splice(selectedIndex + 1, 0, newCell)
    }
    setSelectedCell(newCell.id)
  }

  const toggleSelectedCellEditable = (cellId) => {
    if (!selectedNotebook.value) {
      console.log('No selected notebook @toggleSelectedCellEditable.')
      return
    }
    if (notebooks.value[0]?.id === selectedNotebookId.value) {
      // TO DO: SAYFTY CHECK IF CELL IN RECYCLEBIN HAS PROP EDITABLE === true. IF SO: SET EDITABLE = FALSE
      console.log('Can not toggle cell in recyclebin editable @toggleSelectedCellEditable.')
      return
    }
    if (selectedCellId.value === cellId) {
      selectedCell.value.editable = !selectedCell.value.editable
    }
  }

  /**
   * createCell
   * Creates a new cell object with a specified type and content.
   * @param {String} [type='Text']
   * @param {String} [content='']
   * @returns {Object} Newly created cell object.
   */
  const createCell = (type = 'Markdown', content = 'This is a Markdown cell.') => {
    const validTypes = [
      'Text',
      'Python',
      'CAS',
      'Graph',
      'Spreadsheet',
      'ProbabilityCalculator',
      'Markdown'
    ]

    if (!validTypes.includes(type)) {
      console.log('Unknown cell type:', type)
      return {
        id: generateUniqueId(),
        type: 'unknown',
        content: 'Error: Unknown cell type.',
        editable: false,
        isCellReadOnlyForever: true,
        createdAt: new Date().toISOString()
      }
    }
    const cell = {
      id: generateUniqueId(),
      type,
      content,
      visible: true,
      editable: true, // This should be cjanged to readOnly
      isCellReadOnlyForever: false,
      createdAt: new Date().toISOString(),
      cellViewOptions: ['Simple'], // General default view options (may be overriden by specific cell types)
      selCellViewOpt: 'Simple', // Default selected view option KEY  (Could use index only, but this is more readable in the code where it is used)
      selCellViewOptIndex: 0, // Default index of the selected view option
      undoStack: [], // Stack to store previous states NOT USED
      redoStack: [] // Stack to store redo states NOT USED
    }

    if (type === 'Text') {
      cell.content = ''
    }

    if (type === 'Markdown') {
      cell.content = content
      cell.selCellViewOpt = 'RightSide' // Default selected view option KEY
      cell.cellViewOptions = ['RightSide', 'Top'] // Simple, advanced, and grapical view options
    }

    if (type === 'Python') {
      cell.content = 'print("Hello, Luna!")'
      cell.imageWidthPercent = '100' // Width of images in percent
      cell.toolbarError = '' // Output error from the toolbar
      cell.pythonWorkerStdOutput = {
        // Wrap python output in an object such that it is easier to reset
        workerError: '', // Custom output errors from Python worker
        stdout: '', // Output text from Python worker
        stderr: '', // Output text from Python worker
        stdoutText: '', // Output text from Python worker - stdout minus images, generated by code in the pythonToolbar component.
        stdoutImages: [], // Output text from Python worker generated by code in the pythonToolbar component.
        pythonVariablesObject: {} // Spesific variables (key=variabel name, val = variabel value) to retrieve from the python context after the execution of the python code
      }
    }

    if (type === 'CAS') {
      cell.showPrincipalSolution = true // Show principal solution
      cell.showGeneralSolution = false // Show general solution
      cell.outputModes = ['ASCII', 'LaTeX', 'Unicode'] // Output mode for the CAS cell
      cell.currentTextOutputMode = 'ASCII' // Current output mode for the CAS cell
      cell.outputMode = ['ASCII', 'LaTeX', 'Unicode'] // Output mode for the CAS cell
      cell.showSympyCode = false // Show sympy code in the output
      cell.casToolbarButtonClicked = ''
      cell.content = 'solve x**2 - 4 = 0 for x' // The user input content of the cell
      cell.toolbarError = ''
      cell.imageWidthPercent = '100' // Width of images in percent
      cell.sympyCodeWrapped = '' // The sympy code to be executed wrapped in a try catch block
      cell.sympyCode = '' // Only the sympy code
      cell.sympyVariablesObject = '' // Object with variables to retrieve from the sympy context after the execution of the sympy code
      cell.sympyVariablesObjectString = {} // Stringified version of the sympyVariables
      cell.apiErrorString = '' // Output errors from Luna API
      cell.pythonWorkerStdOutput = {
        workerError: '', // Error message from  pyworker main try catch block
        stdout: '', // Output text from sympy
        stderr: '', // Output text from if Sympy worker
        stdoutText: '', // Output text from Sympy worker (stdout minus images)
        stdoutImages: [], // Output text from Sympy worker (possible sympy plotting)
        solution: '', // Test solution for development
        pythonVariablesObject: {}, // Key-val pairs of variables to retrieve from the python context after the execution of the sympy code
        pythonVariablesObjectString: '' // Stringified version of the pythonVariablesObject
      }
    }

    if (type === 'ProbabilityCalculator') {
      cell.selectedDistribution = 'Normal' // selected distribution
      cell.fallbackDistribution = 'Normal' // Fallback distribution
      cell.cellViewOptions = ['Simple', 'Formula', 'Graphical'] // Simple, advanced, and grapical view options
      cell.selCellViewOpt = 'Simple' // Default selected view option KEY
      // Include the probabilityDistributionsObject as probDistObj
      // (which includes selectedDistribution, Normal, Binomial, etc.)
      // IMPORTANT: We must create a *new* copy of the distribution object for each cell.
      // If we simply do `cell.probDistObj = probabilityDistributionsObject`, all cells will share
      // the same object in memory. Changing the distribution in one cell would then update
      // the distribution for every cell. By deep-cloning, each cell has its own independent copy.
      cell.distObj = JSON.parse(JSON.stringify(probabilityDistributionsObject))
    }
    return cell
  }

  const togglePrincipalSolution = (cellId) => {
    const cell = getCell(cellId)
    if (!cell) {
      console.log('No cell found to toggle principal solution.')
      return
    }
    if (cell.type !== 'CAS') {
      console.log('Cell type does not match.')
      return
    }
    cell.showPrincipalSolution = !cell.showPrincipalSolution
  }

  const toggleGeneralSolution = (cellId) => {
    const cell = getCell(cellId)
    if (!cell) {
      console.log('No cell found to toggle general solution.')
      return
    }
    if (cell.type !== 'CAS') {
      console.log('Cell type does not match.')
      return
    }
    cell.showGeneralSolution = !cell.showGeneralSolution
  }

  const setOutputTextMode = (cellId, outputModeStr) => {
    const cell = getCell(cellId)
    if (!cell) {
      console.log('No cell found to get output mode.')
      return
    }
    if (cell.type !== 'CAS') {
      console.log('Cell type does not match.')
      return
    }
    if (cell.outputMode.includes(outputModeStr)) {
      cell.currentTextOutputMode = outputModeStr
    } else {
      console.log('Output mode not found in cell.')
      return
    }
  }

  const getCellContent = (cellId, cellType) => {
    const cell = getCell(cellId)
    if (!cell) {
      console.log('No cell found to get content.')
      return
    }
    if (cellType.type != cellType) {
      console.log('Cell type does not match.')
      return
    }
    return cell.content
  }

  const setEditable = (cellId, editable) => {
    const cell = getCell(cellId)
    if (!cell) {
      console.log('No cell found to set editable.')
      return
    }
    cell.editable = editable
  }

  const setVisible = (cellId, visible) => {
    const cell = getCell(cellId)
    if (!cell) {
      console.log('No cell found to set visibility.')
      return
    }
    if (visible === false) {
      setEditable(cellId, false)
    }
    console.log('Setting visibility of cell:', cellId, 'to:', visible, 'editable:', cell.editable)
    cell.visible = visible
  }

  const getIsVisible = (cellId) => {
    const cell = getCell(cellId)
    if (!cell) {
      console.log('No cell found to get visibility.')
      return
    }
    return cell.visible
  }

  const toggleSelectedCellVisibility = (cellId) => {
    const cell = getCell(cellId)
    if (!cell) {
      console.log('No cell found to toggle visibility.')
      return
    }
    setVisible(cellId, !cell.visible)
  }

  const setCasToolbarButtonClicked = ({ cellId, buttonName } = {}) => {
    const cell = getCell(cellId)
    if (!cell) {
      console.log('No cell found to set casToolbarButtonClicked.')
      return
    }
    cell.casToolbarButtonClicked = buttonName
  }

  /**
   * resetCellObject
   * Resets all properties in a specified object within a cell to empty arrays
   * @param {String} cellId - The ID of the cell to reset
   * @param {String} objectName - The name of the object to reset (e.g., 'casOutput', 'pythonOutput')
   */
  const resetCellObject = (cellId, objectName) => {
    const cell = getCell(cellId)
    if (!cell || !cell[objectName]) return
    for (const key in cell[objectName]) {
      if (Object.prototype.hasOwnProperty.call(cell[objectName], key)) {
        cell[objectName][key] = null
      }
    }
  }

  /**
   * resetCasOutput
   * Resets all properties in the casOutput object to empty arrays
   * @param {String} cellId - The ID of the cell to reset
   */
  const resetCasOutput = (cellId) => {
    resetCellObject(cellId, 'casOutput')
  }

  /**
   * resetPythonOutput
   * Resets all properties in the pythonOutput object to empty arrays
   * @param {String} cellId - The ID of the cell to reset
   */

  const resetSympyWorkerStdOutput = (cellId) => {
    resetCellObject(cellId, 'sympyWorkerStdOutput')
  }

  /**
   * toggleSelCellVeiwOptIndex
   * Toggles the selected cell view option index between 0 and cell.cellViewOptions.length - 1
   * @param {*} cellId
   * @returns
   */
  const toggleSelCellVeiwOptAndIndex = (cellId) => {
    const cell = getCell(cellId)
    if (cell === null) {
      console.log('No cell found to toggle view options.')
      return
    }
    // Safety check
    if (!cell.selCellViewOptIndex) {
      cell.selCellViewOptIndex = 0
    }
    if (!cell.cellViewOptions ?? cell.cellViewOptions.length === 0) {
      cell.cellViewOptions = ['Default']
    }
    // Toggle the selected view option index
    cell.selCellViewOptIndex = (cell.selCellViewOptIndex + 1) % cell.cellViewOptions.length
    cell.selCellViewOpt = cell.cellViewOptions[cell.selCellViewOptIndex] // This prop makes the code more readable, instead of only using the index
    console.log('Selected view option:', cell.selCellViewOpt)
  }

  const getSelCellViewOpt = (cellId) => {
    const cell = getCell(cellId)
    if (cell === null) {
      console.log('No cell found to get view options.')
      return
    }
    return cell.selCellViewOpt
  }

  /**
   * getCell
   * Retrieves a cell object by its ID.
   * @param {String} cellId
   * @returns {Object|undefined} The cell object if found, or undefined if not found.
   */
  const getCell = (cellId) => {
    const cellInfo = getCellAndIndex(cellId)
    if (!cellInfo) {
      console.log(
        'Cell with ID',
        cellId,
        'not found (getCell()-function in notebooksAndCellsStore).'
      )
      return
    }
    const { cell } = cellInfo // destructure to get the cell
    return cell
  }

  // A helper to find a cell by id searching all notebooks
  const getCellAndIndex = (cellId) => {
    for (const nb of notebooks.value) {
      const index = nb.cells.findIndex((cell) => cell.id === cellId)
      if (index !== -1) {
        return { cell: nb.cells[index], index, notebook: nb }
      }
    }
    return null
  }

  /**
   * updateCellPropVal IMPORTANT FUNCTION!
   * Updates the properties of a cell with new values.
   * Instead of mutating the cell object in place, we update it immutably.
   * This avoids modifying a readonly proxy.
   * @param {String} cellId - The ID of the cell to update.
   * @param {Array} valUpdates - An ARRAY of objects with { key, val } pairs.
   */
  const updateCellPropVal = (cellId, valUpdates) => {
    const cellInfo = getCellAndIndex(cellId)
    if (!cellInfo) return
    const { cell, index, notebook } = cellInfo
    // Create a shallow copy of the cell and update its properties
    const updatedCell = { ...cell }
    for (const { key, val } of valUpdates) {
      if (key === undefined || key === null) {
        console.log(`Key: ${key}, (val: ${val}) does not exist in the cell.`)
        return
      } // Rwmove this? Allow null or undefined values?
      if (val === undefined || val === null) {
        console.log(`Value (key: ${key}), val: ${val} does not exist in the cell.`)
        return
      }
      updatedCell[key] = val
    }

    // Replace the cell in the notebook's cells array
    notebook.cells.splice(index, 1, updatedCell)
  }

  const updateCellPropValNested = (cellId, valUpdates) => {
    // Use example:
    //notebooksAndCellsStore.updateCellPropValNested(selectedCell.value.id, [
    //  {
    //    key: `distObj[${selectedDistribution.value}].selectedIntervalKey`,
    //    val: newSelectedIntervalKey
    //  }
    // if (event.data.type === 'error') {
    //  notebooksAndCellsStore.updateCellPropValNested(selectedCellId.value, [
    //    { key: `pythonOutput.workerMsg`, val: event.data.error }
    //  ])
    //  return
    // }
    const cellInfo = getCellAndIndex(cellId)
    if (!cellInfo) return
    const { cell, index, notebook } = cellInfo
    // Create a shallow copy of the cell
    const updatedCell = JSON.parse(JSON.stringify(cell))
    // Update the nested properties using lodash's set method to handle nested properties
    for (const { key, val } of valUpdates) {
      // key can be like 'distObj.Normal.selectedParameterKey' or 'distObj[Normal].selectedParameterKey'
      _.set(updatedCell, key.replace(/\[(.*?)\]/g, '.$1'), val)
    }
    // Now updatedCell has the nested property updated
    notebook.cells.splice(index, 1, updatedCell)
  }

  /**
   * updatePythonCellRunningState
   * Updates the running state of a Python cell in the selected notebook.
   * @param {String} cellId - The ID of the Python cell to update.
   * @param {Boolean} isCellRunning - The new running state of the cell.
   */
  const updatePythonCellRunningState = (cellId, isCellRunning) => {
    const cell = getCell(cellId)
    if (!cell) {
      return
    }
    cell.isCellRunning = isCellRunning
  }

  /**
   * moveCell
   * Moves a cell up or down within the selected notebook.
   * @param {String} cellId
   * @param {String} direction - 'up' or 'down'
   */
  const moveCell = (cellId, direction) => {
    if (!selectedNotebook.value) {
      console.log('No selected notebook to move cells in.')
      return
    }

    const cellsArray = selectedNotebook.value?.cells
    const index = cellsArray.findIndex((cell) => cell.id === cellId)
    if (index === -1) {
      console.log(`Cell with ID ${cellId} not found.`)
      return
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= cellsArray.length) {
      console.log(`Cannot move cell ${direction} from position ${index}.`)
      return
    }

    const [movedCell] = cellsArray.splice(index, 1)
    cellsArray.splice(newIndex, 0, movedCell)
  }

  /**
   * selectCellAbove
   * Selects the cell immediately above the currently selected cell.
   * @param {String} currentCellId
   */
  const selectCellAbove = (currentCellId) => {
    const cellsArray = selectedNotebook.value?.cells
    const currentIndex = cellsArray.findIndex((cell) => cell.id === currentCellId)
    if (currentIndex > 0) {
      selectedCellId.value = cellsArray[currentIndex - 1].id
    }
  }

  /**
   * selectCellBelow
   * Selects the cell immediately below the currently selected cell.
   * @param {String} currentCellId
   */
  const selectCellBelow = (currentCellId) => {
    const cellsArray = selectedNotebook.value?.cells
    const currentIndex = cellsArray.findIndex((cell) => cell.id === currentCellId)
    if (currentIndex < cellsArray.length - 1) {
      selectedCellId.value = cellsArray[currentIndex + 1].id
    }
  }

  /**
   * ensureCellPropertiesDefined
   * Checks if the properties `editable` and `isCellReadOnlyForever` are defined on the selected cell.
   * If not, initializes them to default values.
   */
  const ensureCellPropertiesDefined = () => {
    if (selectedCell.value) {
      if (selectedCell.value.editable === undefined) {
        selectedCell.value.editable = true
      }
      if (selectedCell.value.isCellReadOnlyForever === undefined) {
        selectedCell.value.isCellReadOnlyForever = false
      }
    } else {
      console.log(
        '(6) No selected cell available to ensure properties @ensureCellPropertiesDefined.'
      )
    }
  }

  /**
   * deleteCellFromNotebook
   * Deletes the currently selected cell from the notebook (not the recycle bin notebook).
   * Ensures the selected cell is contained within the selected notebook
   * Ensures the cell is editable and not permanently read-only before removal.
   */
  const deleteCellFromNotebook = () => {
    // Ensure a notebook is selected before proceeding
    if (!selectedNotebook.value) {
      console.log('No selected notebook to remove a cell from.')
      return
    }
    if (!selectedCellId.value) {
      // Spending so much time on this project is deleting time from my life
      console.log('(1) Cannot delete cell: No selected cell ID @deleteCellFromNotebook.')
      return
    }
    if (isRecycleBinNotebookSelected.value) {
      console.log(
        '(2) Cannot delete cell with this function. Cell is in the recycle bin notebook @deleteCellFromRecycleBin.'
      )
      return
    }

    ensureCellPropertiesDefined()
    // Using computed isCellCurrentlyEditable
    //(!selectedCell.value.editable || selectedCell.value.isCellReadOnlyForever)
    if (!isCellCurrentlyEditable.value) {
      console.log(
        '(3) Cannot delete cell: Cell is not editable or is permanently read-only @deleteCellFromNotebook.'
      )
      return
    }
    // Check if the selected cell is contained within the selected notebook
    if (!isSelectedCellInSelectedNotebook.value) {
      console.log('(4) Cannot delete cell: Cell is not contained in the selected notebook.')
      return
    }
    // All is well, remove cell
    removeCellWithId(selectedCellId.value)
    console.log('(5) Selected cell deleted and moved to recycle bin @deleteCellFromNotebook.')
  }

  /**
   * deleteCellFromRecycleBin
   * Permanently deletes the currently selected cell from the recycle bin notebook.
   */
  const deleteCellFromRecycleBin = () => {
    if (!isRecycleBinNotebookSelected.value) {
      console.log(
        '(1) Cannot delete cell: Not in the recycle bin notebook @deleteCellFromRecycleBin.'
      )
      return
    }
    if (!selectedCellId.value) {
      console.log('(2) Cannot delete cell: No selected cell ID @deleteCellFromRecycleBin.')
      return
    }
    if (!isSelectedCellInSelectedNotebook.value) {
      console.log('(3) Cannot delete cell: Cell is not contained in the selected notebook.')
      return
    }

    removeCellWithId(selectedCellId.value)
    selectedCellId.value = null
    console.log('(4) Selected cell permanently deleted from recycle bin @deleteCellFromRecycleBin.')
  }

  /**
   * removeCellWithId (from a selected notebook)
   * Summary: Moves the specified cell with the given cell ID from the current notebook to the recycle bin.
   * Handles cell removal, recycle bin logic, and updates the selected cell to the next or previous cell if necessary.
   * @param {String} cellId - The ID of the cell to remove.
   */
  const removeCellWithId = (cellId) => {
    if (!selectedNotebook.value) {
      console.log('No selected notebook to remove a cell from.')
      return
    }
    // Get the array of cells in the selected notebook
    const cellsArray = selectedNotebook.value?.cells ?? []
    // Find the index of the cell to remove
    const indexToRemove = cellsArray.findIndex((cell) => cell.id === cellId)
    // If the cell ID is not found, exit the function
    if (indexToRemove === -1) return
    // Remove the cell from the notebook using splice
    // splice method returns an array of removed items—since splice can
    // remove more than one element. By writing:
    const [removedCell] = cellsArray.splice(indexToRemove, 1)
    // we’re using array destructuring to grab just the first (and only)
    // removed element from the returned array and assign it to removedCell.
    // If the cell is not already in the recycle bin, push it to the recycle bin
    if (!isRecycleBinNotebookSelected.value) {
      removedCell.editable = false // Mark the cell as non-editable
      notebooks.value[0]?.cells?.push(removedCell) // Add the cell to the recycle bin
    }
    // Update the selected cell ID to the next or previous cell
    if (selectedCellId.value === cellId) {
      // Set to the next cell if it exists
      if (cellsArray[indexToRemove] && cellsArray[indexToRemove].id) {
        selectedCellId.value = cellsArray[indexToRemove].id
      }
      // Otherwise, set to the previous cell if it exists
      else if (cellsArray[indexToRemove - 1] && cellsArray[indexToRemove - 1].id) {
        selectedCellId.value = cellsArray[indexToRemove - 1].id
      }
      // If neither exists, clear the selected cell ID
      else {
        selectedCellId.value = null
      }
    }
  }

  /**
   * setSelectedCell
   * Sets the currently selected cell.
   * @param {String} cellId
   */
  const setSelectedCell = (cellId) => {
    selectedCellId.value = cellId
  }

  // ---------------------------------------------------------------------------
  // 6. LIFECYCLE HOOKS
  // ---------------------------------------------------------------------------

  const initializeNewNotebookArray = () => {
    // This is not used at the moment
    // TO DO: Use this function to initialize a new notebook array
    notebooks.value = [] // Clear the notebooks array
    notebooks.value = createNotebooks()
    addNotebook('My First Notebook (Double-click to rename)')
    // Select the newly created notebook and its cell
    selectedNotebookId.value = notebooks.value[1].id
    selectedCellId.value = notebooks.value[1].cells[0].id
    isSaved.value = false

    // Run the test function to add some sample bug reports
    // This will add sample error, warning, and info bug reports
    //nextTick(() => {
    //  testAddGlobalBugReport()
    //  console.log('Test bug reports added during initialization')
    //})
  }

  onMounted(() => {
    // Initialize auto-save settings
    initAutoSaveSettings()

    // If we have only the recycle bin, create the first user notebook
    if (notebooks.value.length === 1) {
      addNotebook('My First Notebook (Double-click to rename)')
    }
    // If the selected notebook is empty, add a default text cell with a demo markdown string
    if (selectedNotebook.value && selectedNotebook.value?.cells.length === 0) {
      const demoMarkdown = '# Welcome to Luna!\n\nThis is a Markdown cell.'
      // Add the cell with the Markdown content
      addCell('Markdown', demoMarkdown)
    }
    // Run the test function to add some sample bug reports
    // This will add sample error, warning, and info bug reports
    //nextTick(() => {
    //  testAddGlobalBugReport()
    //})
  })

  // ---------------------------------------------------------------------------
  // RETURNING STATE AND ACTIONS
  // ---------------------------------------------------------------------------

  return {
    // State
    notebooks,
    selectedNotebookId,
    selectedCellId,
    isDeleteCellModalEnabled, // Used to turn off alert modal for deleting cells during dev
    lastSavedTimestamp,
    isHandIn, // flagg to trigger student name and info visibility in the header for pdf export
    isAutoSaveEnabled,
    autoSaveCounter,

    // Computed
    isSaved,
    selectedNotebook,
    notebookCount,
    cells,
    selectedCell,
    cellCount,
    isRecycleBinNotebookSelected,
    selectedCellIndex,
    isSelectedCellInSelectedNotebook,
    isCellCurrentlyEditable, // true if editable === false and isReadOnlyForever === true
    isGlobalBug, // Flag to trigger color of bug button in the left side nav bar

    // Notebook Actions
    initializeNewNotebookArray,
    loadNotebooksFromFile,
    initAutoSaveSettings, // Export the new function
    addNotebook,
    removeNotebook,
    setSelectedNotebook,
    updateNotebookName,
    moveNotebookUp,
    moveNotebookDown,
    updatePythonNotebookUserFunctions,
    updatePythonNotebookUserVariables,
    updateUserCasData, // Main function to update user defined CAS data in the notebook
    getOrCreatePythonWorker,
    isAnyPythonCellRunningInSelectedNotebook,
    setIsAnyPythonCellRunning,
    terminatePythonWorker,
    getOrCreateSympyWorker,
    terminateSympyWorker,
    setIsSympyCellRunning,
    setIsLunaSympyApiRunning,
    updateNotebookPropVal,
    addGlobalBugReport,

    // Cell Actions
    addCell,
    removeCellWithId,
    updatePythonCellRunningState,
    setSelectedCell,
    moveCell,
    deleteCellFromNotebook,
    deleteCellFromRecycleBin,
    createCell,
    selectCellAbove,
    selectCellBelow,
    toggleSelectedCellEditable,
    updateCellPropVal, // Update cell properties not nested (like cell.content)
    updateCellPropValNested, // Update nested properties in a cells object, like cell.distObj.Normal.selectedParameterKey
    toggleSelCellVeiwOptAndIndex,
    getSelCellViewOpt,
    resetCasOutput,
    resetCellObject,
    resetSympyWorkerStdOutput,
    setCasToolbarButtonClicked,
    setVisible,
    getIsVisible,
    toggleSelectedCellVisibility,
    setEditable,
    resetSelectedCellId,
    getCellContent,
    setOutputTextMode,
    togglePrincipalSolution,
    toggleGeneralSolution,

    // Auto-save settings
    getAutoSaveEnabled,
    setAutoSaveEnabled,
    getAutoSaveThreshold,
    setAutoSaveThreshold
  }
})
