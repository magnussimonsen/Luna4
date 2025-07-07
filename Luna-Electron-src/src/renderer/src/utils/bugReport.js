// File: C:\Users\magnu\Luna\Luna4\src\renderer\src\utils\bugReport.js

// Used to store
// -- the template for the bug object
// -- function that pushes the bug object to the bug array

import { convertToString } from './convertToString.js'
import { generateUniqueId } from './idGenerator.js'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'

/**
 * Standard template for bug reports in Luna
 */
const bugTemplate = {
  source: '', // Source file where the bug occurred
  createdAt: '', // ISO timestamp
  errorId: '', // Unique identifier
  errorType: '', // 'error', 'warning', or 'info'
  errorLocation: '', // Function or location in code
  customMessage: '', // Human-readable description
  error: '', // Technical error details
  cellId: null // Optional cell identifier if relevant
}

/**
 * Creates a standardized bug report and submits it to the global bug reports
 *
 * @param {Object} bugData - Bug report data (partial, will be merged with template)
 * @param {string} bugData.source - Source of the bug (usually the filename)
 * @param {string} bugData.errorLocation - Where in the code the error occurred
 * @param {string} bugData.errorType - 'error', 'warning', or 'info'
 * @param {string} bugData.customMessage - Human-readable error description
 * @param {any} bugData.error - Error object or message (will be converted to string)
 * @param {string|null} bugData.cellId - Optional ID of cell if relevant
 * @returns {Object} The created bug report object
 */
function createBugReport(bugData) {
  // Create a new bug report object
  const bugReport = {
    ...bugTemplate,
    source: bugData.source || 'unknown',
    createdAt: new Date().toISOString(),
    errorId: generateUniqueId(),
    errorType: bugData.errorType || 'error',
    errorLocation: bugData.errorLocation || '',
    customMessage: bugData.customMessage || 'An error occurred',
    error: convertToString(bugData.error) || 'Unknown error',
    cellId: bugData.cellId || null
  }

  // Send the bug report to the store
  const notebooksAndCellsStore = useNotebooksAndCellsStore()
  notebooksAndCellsStore.addGlobalBugReport(bugReport)

  return bugReport
}

/**
 * Reports a bug with simplified parameters
 *
 * @param {string} source - Source of the bug (usually filename)
 * @param {string} location - Where in code the error occurred
 * @param {string} message - Human-readable description
 * @param {any} error - Error object or message
 * @param {string} type - 'error', 'warning', or 'info'
 * @param {string|null} cellId - Optional ID of related cell
 * @returns {Object} The created bug report
 */
function reportBug(source, location, message, error, type = 'error', cellId = null) {
  return createBugReport({
    source,
    errorLocation: location,
    customMessage: message,
    error,
    errorType: type,
    cellId
  })
}

// Export the functions and template
export { bugTemplate, createBugReport, reportBug }
