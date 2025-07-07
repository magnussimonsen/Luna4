<!-- File: Luna4PythonToolbar.vue -->
<template>
  <div
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.menuFontSize || '14px'
    }"
  >
    <button
      :class="{
        'run-button': !isAnyPythonCellRunningInSelectedNotebook,
        'disabled-button': isAnyPythonCellRunningInSelectedNotebook
      }"
      :style="{
        fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
        fontSize: fontStore.menuFontSize || '14px'
      }"
      :disabled="isAnyPythonCellRunningInSelectedNotebook"
      :title="'Run the code in the selected Python cell'"
      @click="handleRunButtonClick"
    >
      Run
    </button>
    <button
      :class="{
        'reset-button': true
      }"
      :style="{
        fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
        fontSize: fontStore.menuFontSize || '14px'
      }"
      :disabled="selectedCellId === null"
      :title="'Reset the Python environment in this notebook'"
      @click="handleResetButtonClick"
    >
      Reset
      <span class="spinner">{{ spinnerChar }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import { useThemeStore } from '@/stores/Luna4ThemeStore.js'
import { convertToString } from '../utils/convertToString.js'

// Access global state via Pinia stores
const fontStore = useFontStore()
const notebooksAndCellsStore = useNotebooksAndCellsStore()
const themeStore = useThemeStore()
// Main state variables
let pythonWorker = null // Python worker reference
// Computed properties for accessing store state
const selectedNotebookId = computed(() => notebooksAndCellsStore.selectedNotebookId)
const selectedCellId = computed(() => notebooksAndCellsStore.selectedCellId)
const selectedCell = computed(() => notebooksAndCellsStore.selectedCell)
const isDarkMode = computed(() => themeStore.isDarkMode)
// Python execution status with automatic spinner control
const isAnyPythonCellRunningInSelectedNotebook = computed(() => {
  const isRunning =
    notebooksAndCellsStore.selectedNotebook?.isAnyPythonCellRunningInSelectedNotebook
  if (isRunning && !spinnerInterval) {
    startSpinnerAnimation()
  } else if (!isRunning && spinnerInterval) {
    stopSpinnerAnimation()
  }
  return isRunning
})

//  ----- Handle button clicks -----
const handleRunButtonClick = () => {
  runPythonCode()
}

const handleResetButtonClick = () => {
  // Show confirmation dialog before terminating the worker
  window.electron.ipcRenderer
    .invoke('show-confirm-dialog', {
      title: 'Reset Python environment in this notebook',
      message:
        'Are you sure you want to reset the Python environment in this notebook? This will terminate any running Python code and clear all Python variables and functions.'
    })
    .then((shouldTerminate) => {
      if (shouldTerminate) {
        resetPythonWorker()
      }
    })
    .catch((err) => {
      const bugReport = {
        errorType: 'Error',
        source: 'Luna4PythonToolbar.vue',
        errorLocation: 'handleResetButtonClick',
        customMessage: 'Error showing confirmation dialog',
        error: convertToString(err)
      }
      notebooksAndCellsStore.addGlobalBugReport(bugReport)
    })
}

/**
 *  Runs the Python code in the selected cell
 */

function runPythonCode() {
  // Check if a valid Python cell is selected and that no Python cell is already running
  if (
    !selectedCell.value ||
    selectedCell.value.type !== 'Python' ||
    isAnyPythonCellRunningInSelectedNotebook.value
  ) {
    // To do: Split up the error messages for better user feedback, and add a bug report
    console.warn(
      'Error in runPythonCode(): No valid Python cell selected or CAS cell already running.'
    )
    return
  }
  // Retrieve the code content from the selected cell
  const cellContent = selectedCell.value.content

  // Reset the error message for the selected python cell
  selectedCell.value.toolbarError = ''

  // Check if the selected cell is empty or not a string such that we dont send
  // empty or non-string content to the worker
  if (typeof cellContent != 'string' || cellContent?.trim() === '') {
    notebooksAndCellsStore.updateCellPropValNested(selectedCellId.value, [
      {
        key: 'toolbarError',
        val: 'Please enter some Python code and try again.'
      },
      { key: 'content', val: '' } // in case the cell is not empty, but not a string
      // { key: 'pythonWorkerStdOutput.workerError', val: '' },
      // { key: 'pythonWorkerStdOutput.stderr', val: '' }
    ])
    return
  }

  // Cell is not empty. Reset the Python output and start the spinner animation
  notebooksAndCellsStore.resetCellObject(selectedCellId.value, 'pythonWorkerStdOutput')

  // Obtain or create the Python worker and set message handlers
  pythonWorker = notebooksAndCellsStore.getOrCreatePythonWorker(selectedNotebookId.value)
  if (pythonWorker) {
    pythonWorker.removeEventListener('message', onWorkerMessage)
    pythonWorker.addEventListener('message', onWorkerMessage)
  }

  // ---------------------------------------------------------------------
  // Send the code to the Python worker for execution
  // ---------------------------------------------------------------------  if (pythonWorker) {
  notebooksAndCellsStore.setIsAnyPythonCellRunning(selectedNotebookId.value, true)
  pythonWorker.postMessage({
    type: 'execute',
    code: cellContent,
    cellId: selectedCellId.value,
    // Add the packages that are available in the Python cell by default
    packages: ['numpy', 'matplotlib', 'sympy', 'scipy', 'pandas', 'pillow'],
    isDarkMode: isDarkMode.value,
    pythonVariabelsObject: null
  })
}

/**
 *  Terminates the Python worker
 */
function resetPythonWorker() {
  notebooksAndCellsStore.setIsAnyPythonCellRunning(selectedNotebookId.value, false)
  notebooksAndCellsStore.updateCellPropVal(selectedCellId.value, [
    { key: 'toolbarError', val: 'Python environment reset' }
  ])
  if (pythonWorker) {
    notebooksAndCellsStore.terminatePythonWorker(selectedNotebookId.value)
    pythonWorker = null
  }
}

/**
 * Handles messages from the Python worker
 */
function onWorkerMessage(event) {
  // Stop listening for messages from the Python worker
  pythonWorker.removeEventListener('message', onWorkerMessage)
  notebooksAndCellsStore.setIsAnyPythonCellRunning(selectedNotebookId.value, false)
  // Reset the toolbar error message
  selectedCell.value.toolbarError = null
  console.log('Python worker message:', event.data)
  // Bugsreport vs error handling is an attempt to separate user errors from bugs in the code
  // In the python worker reports a bug, add it to the global bug report and return
  if (event.data.type === 'bugReport') {
    notebooksAndCellsStore.addGlobalBugReport(event.data.bugReport)
    return
  }

  // Check for a cell ID mismatch
  if (event.data.cellId !== selectedCellId.value) {
    notebooksAndCellsStore.updateCellPropVal(selectedCellId.value, [
      {
        key: 'toolbarError',
        val: "Cell ID mismatch received from python worker. Cell ID doesn't match."
      }
    ])
    return
  }
  // Reset the cell output
  notebooksAndCellsStore.resetCellObject(selectedCellId.value, 'pythonWorkerStdOutput')
  // If the python worker reports an error (that might be a user syntax error), reset and update the cell
  if (event.data.type === 'error') {
    notebooksAndCellsStore.updateCellPropValNested(selectedCellId.value, [
      { key: `pythonWorkerStdOutput.workerError`, val: event.data.workerError },
      { key: `pythonWorkerStdOutput.stderr`, val: event.data.stderr }
    ])
    return
  }
  // Extract the output from the Python worker message
  let {
    workerError = '',
    stdout = '',
    stderr = '',
    stdoutImages = [],
    stdoutText = '',
    pythonVariabelsObject = {},
    pythonFunctions = [], //  (global python notebook namespace)
    pythonVariables = [] //  (global python notebook namespace)
    //cellId = null
  } = event.data
  // Update the store with the new output and clear any previous errors
  notebooksAndCellsStore.updateCellPropValNested(selectedCellId.value, [
    { key: 'pythonWorkerStdOutput.workerError', val: workerError },
    { key: 'pythonWorkerStdOutput.stdout', val: stdout },
    { key: 'pythonWorkerStdOutput.stderr', val: stderr },
    { key: 'pythonWorkerStdOutput.stdoutImages', val: stdoutImages },
    { key: 'pythonWorkerStdOutput.stdoutText', val: stdoutText },
    { key: 'pythonWorkerStdOutput.pythonVariables', val: pythonVariabelsObject }
  ])
  // Update the notebook with the new functions and variables
  notebooksAndCellsStore.updateNotebookPropVal(selectedNotebookId.value, [
    { key: 'pythonFunctions', val: pythonFunctions ?? '' },
    { key: 'pythonVariables', val: pythonVariables ?? '' }
  ])
}

// ---------------------------------------------------------------------
//  Mounted and unmounted lifecycle hooks
// ---------------------------------------------------------------------

onMounted(() => {
  console.log('Luna4PythonToolbar.vue mounted')
})

onUnmounted(() => {
  console.log('Luna4PythonToolbar.vue unmounted')
})

//----------------------------------------------------------------------
// UTILITY FUNCTIONS
//----------------------------------------------------------------------

// Spinner animation variables and functions
const spinnerChars = ['|', '/', '-', '\\']
const spinnerChar = ref(spinnerChars[0])
let spinnerInterval = null

/**
 * Starts the spinner animation for visual feedback during Python execution
 */
function startSpinnerAnimation() {
  let index = 0
  spinnerInterval = setInterval(() => {
    index = (index + 1) % spinnerChars.length
    spinnerChar.value = spinnerChars[index]
  }, 150)
}

/**
 * Stops the spinner animation when Python execution is complete
 */
function stopSpinnerAnimation() {
  if (spinnerInterval) {
    clearInterval(spinnerInterval)
    spinnerInterval = null
  }
}
</script>

<style scoped>
/* Spinner animation */
.spinner {
  display: inline-block;
  margin-left: 0.5em;
  font-weight: bold;
  font-family: monospace;
}
</style>
