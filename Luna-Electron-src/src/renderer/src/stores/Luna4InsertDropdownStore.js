// Luna4InsertDropdownStore.js

import { defineStore } from 'pinia'

/**
 * Manages the options available in the "Insert" dropdown menu.
 * Provides a reactive list of actions for adding various cell types and deleting the selected cell.
 *
 * Structure:
 * 1. State Variables & References
 * 2. Computed Properties
 * 3. Actions
 * 4. Lifecycle Hooks
 * 5. Returning State and Actions
 */
export const useInsertDropdownStore = defineStore('insertDropdown', {
  // ---------------------------------------------------------------------------
  // 1. STATE VARIABLES & REFERENCES
  // ---------------------------------------------------------------------------

  // Reactive state containing the list of insert options.
  // Each option includes a label, shortcut, value, and optional icon for UI representation.
  // Go to Luna4Navbar.vue to edit shortcut keys Ctrl + X
  state: () => ({
    options: [
      { label: 'Text cell (Plain text only)', shortcut: 'Ctrl + 1', value: 'Text', icon: null },
      { label: 'Markdown and LaTeX', shortcut: 'Ctrl + 2', value: 'Markdown', icon: null },
      { label: 'Python cell', shortcut: 'Ctrl + 3', value: 'Python', icon: null },
      { label: 'CAS cell (in development)', shortcut: 'Ctrl + 4', value: 'CAS', icon: null },
      {
        label: 'Geometry cell (in development)',
        shortcut: 'Ctrl + 5',
        value: 'Geometry',
        icon: null
      },
      {
        label: 'Graphical calculator cell (Not implemented yet)',
        shortcut: 'Ctrl + 6',
        value: 'GraphicalCalculator',
        icon: null
      },
      {
        label: 'Spreadsheet cell (Not implemented yet)',
        shortcut: 'Ctrl + 7',
        value: 'Spreadsheet',
        icon: null
      },
      {
        label: 'Probability calculator cell (in development)',
        shortcut: 'Ctrl + 8',
        value: 'ProbabilityCalculator',
        icon: null
      },
      {
        label: 'Delete selected cell',
        shortcut: 'Ctrl + Delete',
        value: 'deleteSelectedCell',
        icon: null
      }
    ]
  })
})
