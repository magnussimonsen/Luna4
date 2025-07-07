<!--
  --------------------------------------------------------------------
  File: Luna4RightToolbarRecycleBin.vue
  --------------------------------------------------------------------
  Summary:
  The Luna4RightToolbarRecycleBin component provides a set of controls for managing 
  cells in the recycle bin notebook. It allows users to:
  - Move selected cells back into other notebooks.
  - Permanently delete individual or all cells in the recycle bin.
  
  Key Features:
  - A dropdown menu to select a target notebook for transferring a cell.
  - Buttons for transferring the selected cell, deleting the selected cell, 
    or deleting all cells from the recycle bin.
  - Conditionally enabled actions based on the selected notebook and cell state.
  - Integration with global stores for theme, fonts, and notebook management.
  
  Structure:
  - Template: Contains a dropdown for target notebook selection and action buttons for 
    transferring or deleting cells, as well as an alert modal for confirming deletion.
  - Script Setup:
    * Imports global stores and theme icons.
    * Uses computed properties to determine icons based on theme and filter out 
      the recycle bin notebook.
    * Provides methods to handle actions (transfer, delete) triggered by user input.
  - Style: Scoped CSS to ensure layout and appearance align with the application’s theme.
-->

<template>
  <!-- ------------------------------------------------
       Template Explanation
       ------------------------------------------------
       The template presents:
       - A dropdown to choose the target notebook for moving cells out of the recycle bin.
       - A button to execute the cell transfer.
       - Buttons to delete the currently selected cell or all cells in the recycle bin.
       - An alert modal for confirming deletion actions.
       
       Action buttons are conditionally enabled or disabled based on computed states.
  -->
  <div
    class="right-toolbar-component"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.fontSize || '14px'
    }"
  >
    <!-- Notebook selection dropdown for transferring a cell out of recycle bin -->
    <div class="right-toolbar-items">
      <label for="notebook-select">Move selected cell to notebook: </label>
      <select
        id="notebook-select"
        v-model="selectedNotebookIdForCellTransfer"
        :disabled="availableNotebooks.length === 0"
      >
        <!-- Display notebooks (excluding recycle bin) in the dropdown -->
        <option v-for="notebook in availableNotebooks" :key="notebook.id" :value="notebook.id">
          {{ notebook.name.length > 20 ? notebook.name.slice(0, 20) + '…' : notebook.name }}
        </option>
      </select>
      <LunaSuperButton
        alt-text="Move cell"
        return-string="moveCellToNotebook"
        :is-selected="false"
        :disabled="!canTransfer"
        @click="transferCellToSelectedNotebook"
      />
      <LunaSuperButton
        alt-text="Move all cells"
        return-string="moveCellToNotebook"
        :is-selected="false"
        :disabled="!canTransfer"
        @click="transferAllCellToSelectedNotebook"
      />

      <!-- Button to delete the currently selected cell in the recycle bin -->
      <LunaSuperButton
        class="delete"
        :icon="currentDeleteIcon"
        alt-text="Delete selected cell"
        return-string="deleteSelectedCell"
        :is-selected="selectedButton === 'deleteSelectedCell'"
        title="Delete selected cell"
        @click="handleButtonClick('deleteSelectedCell')"
      />

      <!-- Button to delete all cells in the recycle bin -->
      <LunaSuperButton
        class="delete"
        :icon="currentDeleteAllIcon"
        alt-text="Delete all cells in recycle bin"
        return-string="deleteAllCellsInRecycleBin"
        :is-selected="selectedButton === 'deleteAllCellsInRecycleBin'"
        title="Delete all cells in recycle bin"
        @click="handleButtonClick('deleteAllCellsInRecycleBin')"
      />
    </div>
    <div class="margin-left-auto"></div>
  </div>

  <!-- Alert modal for confirming delete actions -->
  <AlertModal ref="alertModal" />
</template>

<script setup>
// ------------------------------------------------
// Imports and Dependencies
// ------------------------------------------------
// Import Vue Composition API features and stores.
import { ref, computed } from 'vue'
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useThemeStore } from '@/stores/Luna4ThemeStore.js'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import {
  confirmCellDeletion,
  confirmDeleteAllCellsInRecycleNotebook
} from '../utils/confirmationDialogHelpers'

// Import components and icons.
import LunaSuperButton from '@/components/Luna4SuperButton.vue'
import AlertModal from '@/components/Luna4AlertModal.vue'
import DeleteIcon from '@/assets/icons/Luna_Delete.svg'
import DeleteDarkIcon from '@/assets/icons/Luna_Delete_Dark.svg'
import DeleteAllIcon from '@/assets/icons/Luna_Delete_All.svg'
import DeleteAllDarkIcon from '@/assets/icons/Luna_Delete_All_Dark.svg'

// ------------------------------------------------
// State Variables & References
// ------------------------------------------------
const fontStore = useFontStore()
const themeStore = useThemeStore()
const notebooksAndCellsStore = useNotebooksAndCellsStore()
const alertModal = ref(null)
const selectedButton = ref('')

// Reference for tracking the selected target notebook for cell transfer.
const selectedNotebookIdForCellTransfer = ref('')

// ------------------------------------------------
// Computed Properties
// ------------------------------------------------
/**
 * currentDeleteIcon
 * Selects the appropriate delete icon based on the active theme.
 */
const currentDeleteIcon = computed(() =>
  themeStore.activeTheme === 'Dark' ? DeleteDarkIcon : DeleteIcon
)

/**
 * currentDeleteAllIcon
 * Selects the appropriate "delete all" icon based on the active theme.
 */
const currentDeleteAllIcon = computed(() =>
  themeStore.activeTheme === 'Dark' ? DeleteAllDarkIcon : DeleteAllIcon
)

/**
 * availableNotebooks
 * Returns all notebooks except the first one (which is the recycle bin).
 * Provides a list of valid target notebooks for cell transfer.
 */
const availableNotebooks = computed(() => {
  return notebooksAndCellsStore.notebooks.slice(1)
})

/**
 * canTransfer
 * Determines if a cell can be transferred from the recycle bin to another notebook.
 * Conditions:
 * - The currently selected notebook must be the recycle bin.
 * - The recycle bin must contain at least one cell.
 * - A target notebook must be selected.
 */
const canTransfer = computed(() => {
  const isRecycleNotebook =
    notebooksAndCellsStore.notebooks[0].id === notebooksAndCellsStore.selectedNotebookId &&
    notebooksAndCellsStore.notebooks[0].cells.length > 0

  const targetNotebookSelected = selectedNotebookIdForCellTransfer.value !== ''
  return isRecycleNotebook && targetNotebookSelected
})

// ------------------------------------------------
// Methods   (TO DO: MOVE METHODS TO cellsAndNotebooksStore.js)
// ------------------------------------------------
/**
 * transferCellToSelectedNotebook
 * Moves the currently selected cell from the recycle bin into the chosen target notebook.
 * Ensures the target notebook and selected cell are valid before transferring.
 */
const transferCellToSelectedNotebook = () => {
  if (!canTransfer.value) {
    console.log('Cannot transfer cell.')
    return
  }

  const recycleNotebook = notebooksAndCellsStore.notebooks[0]
  const targetNotebookId = selectedNotebookIdForCellTransfer.value
  const targetNotebook = notebooksAndCellsStore.notebooks.find((nb) => nb.id === targetNotebookId)

  if (!targetNotebook) {
    console.log('Target notebook not found.')
    return
  }

  const cellIdToMove = notebooksAndCellsStore.selectedCellId
  const cellIndexInRecycle = recycleNotebook.cells.findIndex((cell) => cell.id === cellIdToMove)
  if (cellIndexInRecycle === -1) {
    console.log('Selected cell not found in recycle bin.')
    return
  }

  // Remove cell from recycle bin and add it to the target notebook
  const [cellToMove] = recycleNotebook.cells.splice(cellIndexInRecycle, 1)
  cellToMove.editable = true
  targetNotebook.cells.push(cellToMove)

  // Clear the selected cell (no longer in recycle bin)
  notebooksAndCellsStore.selectedCellId = null
  console.log(`Cell ${cellToMove.id} moved to notebook "${targetNotebook.name}".`)
}

const transferAllCellToSelectedNotebook = () => {
  if (!canTransfer.value) {
    console.log('Cannot transfer cell.')
    return
  }
  const recycleNotebook = notebooksAndCellsStore.notebooks[0]
  const targetNotebookId = selectedNotebookIdForCellTransfer.value
  const targetNotebook = notebooksAndCellsStore.notebooks.find((nb) => nb.id === targetNotebookId)
  if (!targetNotebook) {
    console.log('Target notebook not found.')
    return
  }
  function transferCelltoTargetNotebook(cell) {
    targetNotebook.cells.push(cell)
  }
  recycleNotebook.cells.forEach(transferCelltoTargetNotebook)
  recycleNotebook.cells = []
}

/**
 * handleButtonClick
 * Handles delete-related actions when toolbar buttons are clicked.
 * - 'deleteSelectedCell': Confirm and delete the currently selected cell.
 * - 'deleteAllCellsInRecycleBin': Confirm and delete all cells in the recycle bin.
 *
 * @param {string} value - Identifies the action to perform.
 */
const handleButtonClick = async (value) => {
  if (value === 'deleteSelectedCell') {
    await confirmCellDeletion(notebooksAndCellsStore, alertModal.value)
  } else if (value === 'deleteAllCellsInRecycleBin') {
    await confirmDeleteAllCellsInRecycleNotebook(notebooksAndCellsStore, alertModal.value)
  } else {
    console.warn('Unhandled option:', value)
  }
}
</script>

<style scoped>
/* ------------------------------------------------
   Styles
   ------------------------------------------------
   Provides a layout and visual style for the toolbar,
   ensuring consistent alignment and spacing.
*/

.right-toolbar-component {
  display: flex;
  background-color: var(--navbar-bg-color);
  align-items: center;
  justify-content: center;
}

.right-toolbar-items {
  display: flex;
  align-items: center;
  gap: 0.2em;
}

.margin-left-auto {
  margin-left: auto;
}

.delete:hover {
  background-color: red;
}
</style>
