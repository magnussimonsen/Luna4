// File: C:\Users\magnu\Luna\Luna4\src\renderer\src\utils\testAddGlobalBugReport.js
// Description: This file is used to test the addGlobalBugReport function in the utils folder.
// Creates a global bug report of each type and pushes it to the globalBugReports array.

// --- BugReport standard object ---
// id: generateUniqueId(),
// bugReport: bugReport,
// createdAt: new Date().toISOString()
// bugReport.source // file name
// bugReport.errorType  // error, warning, info
// bugReport.errorLocation // function name
// bugReport.customMessage // custom message
// bugReport.error // standard error message from for example try catch or from the system in general

import { useNotebooksAndCellsStore } from '../stores/Luna4NotebooksAndCellsStore'

export function testAddGlobalBugReport() {
  // Get the store instance
  const notebooksStore = useNotebooksAndCellsStore()

  // Create and add an error bug report
  notebooksStore.addGlobalBugReport({
    source: 'testAddGlobalBugReport.js',
    errorType: 'error',
    errorLocation: 'testErrorFunction',
    customMessage: 'This is a test error message',
    error: "TypeError: Cannot read property 'value' of undefined"
  })

  // Create and add a warning bug report
  notebooksStore.addGlobalBugReport({
    source: 'testAddGlobalBugReport.js',
    errorType: 'warning',
    errorLocation: 'testWarningFunction',
    customMessage: 'This is a test warning message',
    error: 'Performance issue detected: function took too long to execute'
  })

  // Create and add an info bug report
  notebooksStore.addGlobalBugReport({
    source: 'testAddGlobalBugReport.js',
    errorType: 'info',
    errorLocation: 'testInfoFunction',
    customMessage: 'This is a test info message',
    error: null
  })
}
