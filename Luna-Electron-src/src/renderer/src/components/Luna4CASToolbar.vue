<!-- File: Luna4CASToolbar.vue -->
<template>
  <div
    class="toolbar-base toolbar-base-with-border"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.fontSize || '14px'
    }"
  >
    <button
      class="super-button run-reset-margin-right"
      :class="{ 'run-button': !isRunning, 'disabled-button': isRunning }"
      :disabled="isRunning"
      :title="'Run the code in the selected CAS cell'"
      :style="{
        fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
        fontSize: fontStore.menuFontSize || '14px'
      }"
      @click="handleRunButtonClick"
    >
      Run
    </button>
    <button
      class="super-button run-reset-margin-right"
      :class="{
        'reset-button': true
      }"
      :style="{
        fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
        fontSize: fontStore.menuFontSize || '14px'
      }"
      :disabled="selectedCellId === null"
      :title="'Reset the CAS (sympy) environment in this notebook'"
      @click="handleResetButtonClick"
    >
      Reset
      <span class="spinner">{{ spinnerChar }}</span>
    </button>
    <Luna4SuperButton
      :icon="currentApproxIcon"
      :disabled="!isCellEditable"
      :is-selected="false"
      alt-text="Use decimal numbers"
      :title="'Decimal Mode on/off: Show decimal numbers (not yet implemented)'"
      return-string="DecimalMode"
      class="bigger-button"
      @click="handleButtonClick"
    />
    <Luna4SuperButton
      :icon="currentEqualIcon"
      :disabled="!isCellEditable"
      :is-selected="false"
      alt-text="Use exact values"
      :title="'Excact Mode on/off: Show exact values (not yet implemented)'"
      return-string="ExactMode"
      class="bigger-button"
      @click="handleButtonClick"
    />
    <Luna4SuperButton
      :disabled="!isCellEditable"
      :is-selected="false"
      :alt-text="COMPLEX_SYMBOL"
      :title="`Complex mode on/off: Show Complex values (${COMPLEX_SYMBOL}) (not yet implemented)`"
      return-string="ComplexMode"
      class="bigger-font"
      @click="handleButtonClick"
    />
    <Luna4SuperButton
      :icon="currentArrayBracketsIcon"
      :disabled="!isCellEditable"
      :is-selected="isPrincipalSolution"
      alt-text="Show Principal Solutions (Luna API is using Sympy solve function)"
      :title="'Show Principal Solutions (in development'"
      return-string="PrincipalSolutions"
      class="bigger-button"
      @click="notebooksAndCellsStore.togglePrincipalSolution(selectedCellId)"
    />
    <Luna4SuperButton
      :icon="currentSetBracketsIcon"
      :disabled="!isCellEditable"
      :is-selected="isGeneralSolution"
      alt-text="Show General Solutions"
      :title="'Show General Solutions'"
      return-string="GeneralSolutions"
      class="bigger-button"
      @click="notebooksAndCellsStore.toggleGeneralSolution(selectedCellId)"
    />

    <Luna4SuperButton
      :icon="currentGraphIcon"
      :disabled="!isCellEditable"
      :is-selected="false"
      alt-text="Show Graph"
      :title="'Show Graph of solution (not yet implemented)'"
      return-string="Graph"
      class="bigger-button"
      @click="handleButtonClick"
    />
    <!--
    <Luna4SuperButton
      :icon="currentASCIIIcon"
      :disabled="!isCellEditable"
      :is-selected="false"
      return-string="Latex"
      alt-text="Show LaTeX"
      :title="'ASCII mode on/off (not yet implemented)'"
      @click="handleButtonClick"
    />
  -->
    <Luna4SuperButton
      :icon="currentUnicodeIcon"
      :disabled="!isCellEditable"
      :is-selected="false"
      return-string="Unicode"
      alt-text="Show Unicode"
      :title="'Unicode mode on/off (not yet implemented)'"
      @click="handleButtonClick"
    />

    <Luna4SuperButton
      :icon="currentLatexIcon"
      :disabled="!isCellEditable"
      :is-selected="false"
      return-string="Latex"
      alt-text="Show LaTeX"
      :title="'Show LaTeX (not yet implemented)'"
      class="bigger-button"
      @click="handleButtonClick"
    />
    <Luna4SuperButton
      :icon="currentSympyIcon"
      :disabled="!isCellEditable"
      :is-selected="false"
      alt-text="Show the Sympy code used to generate the solutions (not yet implemented)"
      :title="'Show the Sympy code used to generate the solutions (not yet implemented)'"
      return-string="Sympycode"
      class="bigger-button"
      @click="handleButtonClick"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import { useThemeStore } from '@/stores/Luna4ThemeStore.js'
import { lunaSympyAPI } from '@/utils/LunaSympyAPI.js'
import Luna4SuperButton from '@/components/Luna4SuperButton.vue'
import { convertToString } from '../utils/convertToString.js'
// import { aboutLuna } from '../assets/aboutLuna.js'

// Import SVG icons
import LatexIcon from '@/assets/icons/Luna_Latex.svg'
import LatexIconCCCCCC from '@/assets/icons/Luna_Latex_CCCCCC.svg'
import UnicodeIcon from '@/assets/icons/Luna_Unicode_Logo.svg'
import UnicodeIconCCCCCC from '@/assets/icons/Luna_Unicode_Logo_CCCCCC.svg'
import SetBracketsIcon from '@/assets/icons/Luna_Set_Brackets.svg'
import SetBracketsIconCCCCCC from '@/assets/icons/Luna_Set_Brackets_CCCCCC.svg'
import ArrayBracketsIcon from '@/assets/icons/Luna_Array_Brackets.svg'
import ArrayBracketsIconCCCCCC from '@/assets/icons/Luna_Array_Brackets_CCCCCC.svg'
import SympyIcon from '@/assets/icons/Luna_Sympy_Logo.svg'
import SympyIconCCCCCC from '@/assets/icons/Luna_Sympy_Logo_CCCCCC.svg'
import GraphIcon from '@/assets/icons/Luna_Graph.svg'
import GraphIconCCCCCC from '@/assets/icons/Luna_Graph_CCCCCC.svg'
import ApproxIcon from '@/assets/icons/Luna_Approx.svg'
import ApproxIconCCCCCC from '@/assets/icons/Luna_Approx_CCCCCC.svg'
import EqualIcon from '@/assets/icons/Luna_Equal.svg'
import EqualIconCCCCCC from '@/assets/icons/Luna_Equal_CCCCCC.svg'
//import ASCIIIcon from '@/assets/icons/Luna_ASCII.svg'
//import ASCIIIconCCCCCC from '@/assets/icons/Luna_ASCII_CCCCCC.svg'

// Unicode constants
const COMPLEX_SYMBOL = ' ℂ ' // Complex numbers symbol (U+2102)
//const REAL_SYMBOL = ' ℝ ' // Real numbers symbol (U+211D)
//const INTEGER_SYMBOL = ' ℤ ' // Integer numbers symbol (U+2124)

// Access global state via Pinia stores
const fontStore = useFontStore()
const notebooksAndCellsStore = useNotebooksAndCellsStore()
const themeStore = useThemeStore()
// Main state variables
let sympyWorker = null // Sympy worker reference
// Computed properties for accessing store state
const selectedNotebookId = computed(() => notebooksAndCellsStore.selectedNotebookId)
const selectedNotebook = computed(() => notebooksAndCellsStore.selectedNotebook)
const selectedCellId = computed(() => notebooksAndCellsStore.selectedCellId)
const selectedCell = computed(() => notebooksAndCellsStore.selectedCell)
const isDarkMode = computed(() => themeStore.isDarkMode)
const isCellEditable = computed(() => {
  return (
    selectedCell.value?.editable &&
    !selectedCell.value?.isCellReadOnlyForever &&
    selectedCell.value?.type === 'CAS'
  )
})
// Python and lunaSympyAPI execution status with automatic spinner control
const isRunning = computed(() => {
  console.warn(
    'isAnySympyCellRunningInSelectedNotebook',
    selectedNotebook.value?.isAnySympyCellRunningInSelectedNotebook
  )
  console.warn('isLunaSympyApiRunning:', selectedNotebook.value?.isLunaSympyApiRunning)
  return (
    selectedNotebook.value?.isAnySympyCellRunningInSelectedNotebook ||
    selectedNotebook.value?.isLunaSympyApiRunning
  )
})

watch(isRunning, (newVal) => {
  console.warn('isRunning changed:', newVal)
  if (newVal) {
    startSpinnerAnimation()
  } else {
    stopSpinnerAnimation()
  }
})

// ---- Computed properties for icons ----
const currentLatexIcon = computed(() => {
  return !isDarkMode.value ? LatexIcon : LatexIconCCCCCC
})
const currentUnicodeIcon = computed(() => {
  return !isDarkMode.value ? UnicodeIcon : UnicodeIconCCCCCC
})
const currentSetBracketsIcon = computed(() => {
  return !isDarkMode.value ? SetBracketsIcon : SetBracketsIconCCCCCC
})
const currentArrayBracketsIcon = computed(() => {
  return !isDarkMode.value ? ArrayBracketsIcon : ArrayBracketsIconCCCCCC
})

const currentSympyIcon = computed(() => {
  return !isDarkMode.value ? SympyIcon : SympyIconCCCCCC
})
const currentGraphIcon = computed(() => {
  return !isDarkMode.value ? GraphIcon : GraphIconCCCCCC
})

const currentApproxIcon = computed(() => {
  return !isDarkMode.value ? ApproxIcon : ApproxIconCCCCCC
})

const currentEqualIcon = computed(() => {
  return !isDarkMode.value ? EqualIcon : EqualIconCCCCCC
})

/*const currentASCIIIcon = computed(() => {
  return !isDarkMode.value ? ASCIIIcon : ASCIIIconCCCCCC
})*/

// ----------------------
// Button click functions
// ----------------------

const isGeneralSolution = computed(() => {
  return selectedCell.value.showGeneralSolution
})

const isPrincipalSolution = computed(() => {
  return selectedCell.value.showPrincipalSolution
})

/*const currentTextOutputMode = computed(() => {
  return selectedCell.value.textOutputMode
})*/

// Function for later to handle button clicks in the toolbar
const handleButtonClick = (returnString) => {
  notebooksAndCellsStore.setCasToolbarButtonClicked({
    cellId: selectedCellId.value,
    buttonName: returnString
  })
  console.log('Button clicked:', returnString)
  console.log('Cell ID: ', selectedCellId.value)
}

// Function to handle reseting the python worker (sympy worker)
const handleResetButtonClick = () => {
  // Show confirmation dialog before terminating the worker
  window.electron.ipcRenderer
    .invoke('show-confirm-dialog', {
      title: 'Reset CAS (sympy) environment in this notebook',
      message:
        'Are you sure you want to reset the CAS environment in this notebook? This will terminate any running CAS cells and clear all CAS variables and functions.'
    })
    .then((shouldTerminate) => {
      if (shouldTerminate) {
        resetSympyWorker()
      }
    })
    .catch((err) => {
      const bugReport = {
        errorType: 'Error',
        source: 'Luna4CASToolbar.vue',
        errorLocation: 'handleResetButtonClick',
        customMessage: 'Error showing confirmation dialog',
        error: convertToString(err)
      }
      notebooksAndCellsStore.addGlobalBugReport(bugReport)
    })
}

const handleRunButtonClick = () => {
  // Run the selectedCell.sympyCode from the notebooksAndCellsStore
  // Split this up into a separate function
  runSympyCode()
}

// ---------------------------------------------------------------------
// Runs the sympy code in the selected cell via the LunaSympyAPI
// ---------------------------------------------------------------------

function runSympyCode() {
  // Check if a valid CAS cell is selected and that no CAS cell is already running
  if (!selectedCell.value || selectedCell.value.type !== 'CAS' || isRunning.value) {
    // To do: Split up the error messages for better user feedback, and add a bug report?
    console.warn('Error in runSympyCode(): No valid CAS cell selected or CAS cell already running.')
    return
  }
  // Retrieve the code content from the selected cell
  const cellContent = selectedCell.value.content
  const cellId = selectedCellId.value

  notebooksAndCellsStore.updateCellPropValNested(cellId, [
    { key: 'toolbarError', val: '' },
    { key: 'apiErrorString', val: '' },
    { key: 'sympyCodeWrapped', val: '' },
    { key: 'sympyCode', val: '' },
    { key: 'sympyVariablesObject', val: '' },
    { key: 'sympyVariablesObjectString', val: '' },
    { key: 'pythonWorkerStdOutput', val: '' }
  ])

  /* Much of the code below could be done by the main LunaSympy API entry point function. Refactor this*/
  // Check if the selected cell is empty or not a string such that we dont send empty or non-string content to the worker
  if (typeof cellContent != 'string' || cellContent?.trim() === '') {
    notebooksAndCellsStore.setIsLunaSympyApiRunning(selectedNotebookId.value, false)
    notebooksAndCellsStore.updateCellPropVal(selectedCellId.value, [
      {
        key: 'toolbarError',
        val: 'Selected cell is empty.'
      },
      { key: 'content', val: '' }
    ])
    return
  }
  // Cell is not empty. Reset the Python cell props except for the content
  selectedCell.value.sympyCodeWrapped = ''
  selectedCell.value.sympyCode = ''
  selectedCell.value.apiErrorString = ''
  selectedCell.value.sympyVariablesObject = {}
  selectedCell.value.sympyVariablesObjectString = ''

  // ---------------------------------------------------------------------
  // Send cellContent to the LunaSympyAPI to get the sympy code
  // ---------------------------------------------------------------------
  // Set the LunaSympyAPI running flag to true (this also starts the spinner animation)
  notebooksAndCellsStore.setIsLunaSympyApiRunning(selectedNotebookId.value, true)
  let returnObj = {}
  returnObj = lunaSympyAPI(cellId, cellContent)
  notebooksAndCellsStore.setIsLunaSympyApiRunning(selectedNotebookId.value, false)

  // All is ok, update the store with the new output and clear any previous errors
  if (returnObj != undefined && returnObj != null && returnObj.apiErrorString === '') {
    notebooksAndCellsStore.updateCellPropValNested(cellId, [
      { key: 'toolbarError', val: '' },
      { key: 'sympyCodeWrapped', val: returnObj.sympyCodeWrapped },
      { key: 'sympyCode', val: returnObj.sympyCode },
      { key: 'sympyVariablesObject', val: returnObj.sympyVariablesObject },
      { key: 'sympyVariablesObjectString', val: returnObj.sympyVariablesObjectString },
      { key: 'apiErrorString', val: returnObj.apiErrorString }
    ])
  } else if (returnObj.apiErrorString != '') {
    // User input error (TO DO: Reset the cell content)
    notebooksAndCellsStore.updateCellPropVal(cellId, [
      { key: 'toolbarError', val: returnObj.apiErrorString },
      { key: 'apiErrorString', val: returnObj.apiErrorString },
      { key: 'sympyCodeWrapped', val: '' },
      { key: 'sympyCode', val: '' },
      { key: 'sympyVariablesObject', val: {} },
      { key: 'sympyVariablesObjectString', val: '' }
    ])
    return // Quit the function if there is an error
  } else {
    // Returned object is undefined or null
    const errorMsg =
      'LunaSympyAPI returned an undefined or null object. This should not happen. Please report this bug.'
    notebooksAndCellsStore.updateCellPropValNested(cellId, [{ key: 'toolbarError', val: errorMsg }])
    return // Quit the function if there is an error
  }

  // -------------------------------------------------------------------------------------------
  // If we reach this point, the sympy code was generated successfully and the store was updated
  // --------------------------------------------------------------------------------------------
  notebooksAndCellsStore.setIsSympyCellRunning(selectedNotebookId.value, true)
  sympyWorker = notebooksAndCellsStore.getOrCreateSympyWorker(selectedNotebookId.value) // the notebook.sympyWorkerInstance is set here
  if (sympyWorker) {
    sympyWorker.removeEventListener('message', onWorkerMessage)
    sympyWorker.addEventListener('message', onWorkerMessage)
    const messageData = {
      type: 'execute',
      code: selectedCell.value.sympyCodeWrapped || '',
      cellId: selectedCellId.value,
      packages: ['sympy'],
      isDarkMode: isDarkMode.value,
      pythonVariablesObjectString: selectedCell.value.sympyVariablesObjectString
    }
    sympyWorker.postMessage(messageData)
  } else {
    console.error('Error: sympyWorker is null or undefined.')
    notebooksAndCellsStore.setIsSympyCellRunning(selectedNotebookId.value, false)
    notebooksAndCellsStore.updateCellPropVal(cellId, [
      { key: 'toolbarError', val: 'Error: sympyWorker is null or undefined.' }
    ])
  }
}

// ---------------------------------------------------------------------
// Handles messages from the Sympy worker
// ---------------------------------------------------------------------
function onWorkerMessage(event) {
  removeEventListener('message', onWorkerMessage)
  notebooksAndCellsStore.setIsSympyCellRunning(selectedNotebookId.value, false)
  let {
    workerError,
    stdout,
    stderr,
    stdoutImages, // Array of images
    stdoutText,
    pythonFunctions, // Array of synpy worker namespace functions
    pythonVariables, // Not yet implemented
    pythonVariablesObjectString, // String with the variables to retrieve from the sympy worker namespace
    cellId
  } = event.data

  // Check if the worker reported an explicit error
  if (workerError && typeof workerError === 'string' && workerError.trim().length > 0) {
    notebooksAndCellsStore.updateCellPropValNested(selectedCellId.value, [
      { key: 'toolbarError', val: JSON.stringify(workerError) },
      { key: 'pythonWorkerStdOutput.workerError', val: JSON.stringify(workerError) },
      { key: 'pythonWorkerStdOutput.stderr', val: JSON.stringify(stderr) } // Add the stderr just in case for development
    ])
    return
  }

  // Validate that the message contains all expected properties
  if (
    //workerError === undefined ||
    stdout === undefined ||
    stderr === undefined ||
    stdoutImages === undefined ||
    stdoutText === undefined ||
    pythonFunctions === undefined ||
    pythonVariables === undefined ||
    pythonVariablesObjectString === undefined ||
    cellId === undefined
  ) {
    console.error('Invalid message received from sympy worker: ', event.data)
    return
  }

  // Validate that the cell ID matches the selected cell
  if (!cellId || cellId != selectedCellId.value) {
    console.error('Cell ID mismatch received from python worker. Cell ID does not match.')
    // TO DO: Give all celltypes an error property called toolbarError, and add it to the cell-components
    selectedCell.value.toolbarError =
      'Cell ID mismatch received from python worker. Cell ID does not match.'
    return
  }
  // -------------------------------------
  // Parse the pythonVariablesObjectString
  // -------------------------------------
  let pythonVariablesObject = JSON.parse(pythonVariablesObjectString)

  // Trim
  if (typeof workerError === 'string') workerError = workerError.trim()
  if (typeof stdout === 'string') stdout = stdout.trim()
  if (typeof stderr === 'string') stderr = stderr.trim()
  if (typeof stdoutText === 'string') stdoutText = stdoutText.trim()
  for (const key in pythonVariablesObject) {
    if (typeof pythonVariablesObject[key] === 'string')
      pythonVariablesObject[key] = pythonVariablesObject[key].trim()
  }
  // Update the store with the new output and clear any previous errors
  notebooksAndCellsStore.updateCellPropValNested(selectedCellId.value, [
    { key: 'toolbarError', val: workerError },
    { key: 'pythonWorkerStdOutput.workerError', val: workerError },
    { key: 'pythonWorkerStdOutput.stdout', val: stdout },
    { key: 'pythonWorkerStdOutput.stderr', val: stderr },
    { key: 'pythonWorkerStdOutput.stdoutImages', val: stdoutImages },
    { key: 'pythonWorkerStdOutput.stdoutText', val: stdoutText },
    { key: 'pythonWorkerStdOutput.pythonVariablesObject', val: pythonVariablesObject },
    { key: 'pythonWorkerStdOutput.pythonVariablesObjectString', val: pythonVariablesObjectString },
    { key: 'sympyVariablesObject', val: pythonVariablesObject }, // Remove sympyVariabelsObjects and only use pythonVariablesObject?
    { key: 'sympyVariablesObjectString', val: pythonVariablesObjectString }
  ])

  // Update notebook-level sympy namespace variables and functions
  notebooksAndCellsStore.updateNotebookPropVal(selectedNotebookId.value, [
    { key: 'sympyFunctions', val: pythonFunctions },
    { key: 'sympyVariables', val: pythonVariables }
  ])
}

// ---------------------------------------------------------------------
//  Mounted and unmounted lifecycle hooks
// ---------------------------------------------------------------------

onMounted(() => {
  console.log('Luna4CASToolbar.vue mounted')
})

onUnmounted(() => {
  console.log('Luna4CASToolbar.vue unmounted')
})

// -----------------------------------------------------------------------
// Completely resets the Sympy environment by terminating the worker
// -----------------------------------------------------------------------

function resetSympyWorker() {
  notebooksAndCellsStore.terminateSympyWorker()
  sympyWorker = null
  notebooksAndCellsStore.setIsSympyCellRunning(selectedNotebookId.value, false)
  notebooksAndCellsStore.setIsLunaSympyApiRunning(selectedNotebookId.value, false)
  notebooksAndCellsStore.updateCellPropVal(selectedCellId.value, [
    { key: 'toolbarError', val: 'CAS (Sympy) environment reset' }
  ])
}

//----------------------------------------------------------------------
// UTILITY FUNCTIONS
//----------------------------------------------------------------------

// Spinner animation variables and functions
const spinnerChars = ['|', '/', '-', '\\']
const spinnerChar = ref(spinnerChars[0])
let spinnerInterval = null

/**
 * Starts the spinner animation for visual feedback during CAS execution
 */
function startSpinnerAnimation() {
  let index = 0
  spinnerInterval = setInterval(() => {
    index = (index + 1) % spinnerChars.length
    spinnerChar.value = spinnerChars[index]
  }, 150)
}

/**
 * Stops the spinner animation when CAS execution is complete
 */
function stopSpinnerAnimation() {
  if (spinnerInterval) {
    clearInterval(spinnerInterval)
    spinnerInterval = null
  }
}
</script>

<style scoped>
/* Button styles */
.run-button {
  background-color: green;
  color: var(--run-stop-font-color);
  border: none;
  margin: 0em;
  cursor: pointer;
  border-radius: 4px;
}

/* Make sure all buttons have consistent height */
:deep(.super-button) {
  height: 2.1em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reset-button {
  background-color: var(--no-bg-color);
  color: var(--run-stop-font-color);
  border: none;
  margin: 0em;
  cursor: pointer;
  border-radius: 4px;
  position: relative;
}

.disabled-button {
  background-color: gray;
  color: white;
  border: none;
  margin: 0em;
  border-radius: 4px;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Spinner animation */
.spinner {
  display: inline-block;
  margin-left: 0.5em;
  font-weight: bold;
  font-family: monospace;
}

/* Custom styling for the Sympy logo button */
.bigger-button :deep(img) {
  width: 1.7em !important; /* Increase from default 16px */
  height: 1.7em !important;
}

/* Alternative approach to ensure Unicode character gets larger */
.bigger-font :deep(*) {
  font-size: 1.5em;
}
</style>
