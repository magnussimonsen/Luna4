/**
 * @file Confirmation Dialog Helpers
 * @description This module provides utility functions for handling confirmation dialogs
 * throughout the Luna4 application, particularly for potentially destructive actions
 * like deleting cells or notebooks.
 * @created 2023-03-09
 * @updated 2023-11-15
 */

// --------------------
// Module Overview
// --------------------
/**
 * This module contains functions that handle different confirmation scenarios:
 * - Cell deletion from notebooks and recycle bin
 * - Mass deletion of cells from the recycle bin
 * - Notebook deletion
 *
 * Each function integrates with the notification system to provide consistent
 * user feedback and confirmation flows.
 */

/**
 * Prompts the user to confirm deleting the currently selected cell.
 * Handles different scenarios including:
 * - Cell in regular notebook -> Moves to recycle bin
 * - Cell in recycle bin -> Permanent deletion
 * - Read-only cells -> Prevents deletion
 *
 * @param {Object} notebooksAndCellsStore - The store instance with notebook and cell state
 * @param {Object} alertModal - Alert modal instance for displaying confirmation dialogs
 * @throws {Error} Implicitly if any modal operations fail
 * @returns {Promise<void>} Resolves when the operation is complete
 * @example
 * // In a component method:
 * import { confirmCellDeletion } from '@/utils/confirmationDialogHelpers';
 *
 * await confirmCellDeletion(notebooksStore, this.$alert);
 */
export const confirmCellDeletion = async (notebooksAndCellsStore, alertModal) => {
  let messageString = ''
  let confirmationOrMessageString = ''
  let confirmed = null

  // --------------------
  // Validation Checks
  // --------------------

  // Validate notebook selection
  if (!notebooksAndCellsStore.selectedNotebook) {
    messageString = `No notebook is selected.`
    confirmationOrMessageString = 'message'
    await alertModal.openModal(messageString, confirmationOrMessageString)
    return
  }

  // Validate cell selection
  if (!notebooksAndCellsStore.selectedCellId) {
    messageString = `No cell is selected.`
    confirmationOrMessageString = 'message'
    await alertModal.openModal(messageString, confirmationOrMessageString)
    return
  }

  // Check if notebook is empty (index is 0-based, but displayed as 1-based)
  if (notebooksAndCellsStore.selectedCellIndex == 0) {
    messageString = `Notebook is empty`
    confirmationOrMessageString = 'message'
    await alertModal.openModal(messageString, confirmationOrMessageString)
    return
  }

  // Check if selected cell belongs to selected notebook
  if (!notebooksAndCellsStore.isSelectedCellInSelectedNotebook) {
    messageString = `Selected cell is not contained within the selected notebook.`
    confirmationOrMessageString = 'message'
    await alertModal.openModal(messageString, confirmationOrMessageString)
    return
  }

  // --------------------
  // Handle Recycle Bin Cell Deletion
  // --------------------
  if (notebooksAndCellsStore.isRecycleBinNotebookSelected) {
    messageString = `Delete cell ${notebooksAndCellsStore.selectedCellIndex} forever?`
    confirmationOrMessageString = 'confirmation'

    // Check if deletion modal is enabled (for testing or development)
    if (notebooksAndCellsStore.isDeleteCellModal) {
      confirmed = await alertModal.openModal(messageString, confirmationOrMessageString)
    } else {
      confirmed = true // Skip confirmation for testing/development
    }

    // Execute deletion if confirmed
    if (confirmed) {
      notebooksAndCellsStore.deleteCellFromRecycleBin()
      console.log(`Cell ${notebooksAndCellsStore.selectedCellIndex} deleted.`)
    } else {
      console.log(`Deletion of cell ${notebooksAndCellsStore.selectedCellIndex} canceled.`)
    }
    return
  }

  // --------------------
  // Handle Regular Notebook Cell Deletion
  // --------------------

  // Check cell editability
  if (!notebooksAndCellsStore.isCellCurrentlyEditable) {
    messageString = `Selected cell is read only `
    confirmationOrMessageString = 'message'
    await alertModal.openModal(messageString, confirmationOrMessageString)
    return
  }

  // All checks passed, confirm and move to recycling bin
  messageString = `Move cell ${notebooksAndCellsStore.selectedCellIndex} to recycling bin?`
  confirmationOrMessageString = 'confirmation'

  // Check if confirmation dialog should be shown
  if (notebooksAndCellsStore.isDeleteCellModalEnabled) {
    confirmed = await alertModal.openModal(messageString, confirmationOrMessageString)
  } else {
    confirmed = true // Skip confirmation if disabled
  }

  // Execute deletion if confirmed
  if (confirmed) {
    notebooksAndCellsStore.deleteCellFromNotebook()
    console.log(`Cell ${notebooksAndCellsStore.selectedCellIndex} moved to recycling bin.`)
  } else {
    console.log(`Deletion of cell ${notebooksAndCellsStore.selectedCellIndex} canceled.`)
  }
}

/**
 * Confirms and handles the mass deletion of all cells in the recycle bin notebook.
 * Provides safety checks to prevent errors and appropriate user feedback.
 *
 * @param {Object} notebooksAndCellsStore - The store with notebook and cell data
 * @param {Object} alertModal - Modal dialog interface for confirmation
 * @returns {Promise<void>} Resolves when operation completes
 * @example
 * // In a component method:
 * import { confirmDeleteAllCellsInRecycleNotebook } from '@/utils/confirmationDialogHelpers';
 *
 * await confirmDeleteAllCellsInRecycleNotebook(notebooksStore, this.$alert);
 */
export const confirmDeleteAllCellsInRecycleNotebook = async (
  notebooksAndCellsStore,
  alertModal
) => {
  let messageString = ''
  let confirmationOrMessageString = ''
  let confirmed = null

  // --------------------
  // Validate Recycle Bin
  // --------------------
  const recycleNotebook = notebooksAndCellsStore.notebooks[0]
  if (!recycleNotebook || recycleNotebook.cells.length === 0) {
    messageString = `Recycle bin notebook is empty or does not exist.`
    confirmationOrMessageString = 'message'
    await alertModal.openModal(messageString, confirmationOrMessageString)
    console.log('Recycle bin notebook is empty or does not exist.')
    return
  }

  // --------------------
  // Confirm & Execute Deletion
  // --------------------
  messageString = `Are you sure you want to delete ALL cells in the recycle bin?`
  confirmationOrMessageString = 'confirmation'
  confirmed = await alertModal.openModal(messageString, confirmationOrMessageString)

  if (confirmed) {
    // Empty the cells array to remove all cells
    recycleNotebook.cells = []
    console.log(`All cells in the recycle bin have been deleted.`)
  } else {
    console.log(`Deletion of all cells in the recycle bin canceled.`)
  }
}

/**
 * Confirms and handles the deletion of the currently selected notebook.
 * Includes safety checks to prevent deletion of the recycle bin notebook
 * or notebooks containing read-only cells.
 *
 * @param {Object} notebooksAndCellsStore - The notebooks store instance
 * @param {Object} alertModal - Alert modal interface for user confirmation
 * @returns {Promise<void>} Resolves when the operation completes
 * @example
 * // In a component method:
 * import { confirmNotebookDeletion } from '@/utils/confirmationDialogHelpers';
 *
 * await confirmNotebookDeletion(notebooksStore, this.$alert);
 */
export const confirmNotebookDeletion = async (notebooksAndCellsStore, alertModal) => {
  let messageString = ''
  let confirmationOrMessageString = ''
  let confirmed = null

  // --------------------
  // Validation Checks
  // --------------------

  // Check if there are enough notebooks to delete one
  if (notebooksAndCellsStore.notebooks.length <= 1) {
    messageString = `No notebooks available to delete.`
    confirmationOrMessageString = 'message'
    await alertModal.openModal(messageString, confirmationOrMessageString)
    console.log('No notebooks available to delete.')
    return
  }

  // Check if a notebook is selected
  const selectedNotebook = notebooksAndCellsStore?.selectedNotebook
  if (!selectedNotebook) {
    messageString = `No notebook is selected.`
    confirmationOrMessageString = 'message'
    await alertModal.openModal(messageString, confirmationOrMessageString)
    console.log(`No notebook is selected.`)
    return
  }

  // Prevent deletion of recycle bin notebook (always at index 0)
  if (notebooksAndCellsStore.notebooks[0]?.id === selectedNotebook?.id) {
    messageString = `Cannot delete the recycle notebook.`
    confirmationOrMessageString = 'message'
    await alertModal.openModal(messageString, confirmationOrMessageString)
    console.log('Cannot delete the recycle notebook.')
    return
  }

  // --------------------
  // Check For Read-Only Cells
  // --------------------

  // Abort deletion if any cell in the notebook is not deletable
  const hasNonDeletableCell = selectedNotebook?.cells.some(
    (cell) => !cell?.editable || cell?.isCellReadOnlyForever
  )

  if (hasNonDeletableCell) {
    messageString = `Cannot delete a notebook that contains read-only or non-editable cells.`
    confirmationOrMessageString = 'message'
    await alertModal.openModal(messageString, confirmationOrMessageString)
    console.log('Cannot delete a notebook that contains read-only or non-editable cells.')
    return
  }

  // --------------------
  // Confirm & Execute Deletion
  // --------------------
  confirmed = await alertModal.openModal(
    `Are you sure you want to delete the notebook "${selectedNotebook?.name}"?`,
    'confirmation'
  )

  if (confirmed) {
    notebooksAndCellsStore.removeNotebook(selectedNotebook?.id)
    console.log(`Notebook "${selectedNotebook?.name}" deleted.`)
  } else {
    console.log(`Deletion of notebook "${selectedNotebook?.name}" canceled.`)
  }
}
