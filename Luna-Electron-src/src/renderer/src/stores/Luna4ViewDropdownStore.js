// Luna4ViewDropdownStore.js

import { defineStore } from 'pinia'
/**
 * Manages the options for the "View" dropdown menu.
 * Provides a reactive state containing menu items for switching between different viewing layouts.
 */
export const useViewDropdownStore = defineStore('viewDropdown', {
  // ---------------------------------------------------------------------------
  // 1. STATE VARIABLES & REFERENCES
  state: () => ({
    // Array of view options available in the dropdown menu.
    // Each option object contains:
    // - `label`: Display name shown to the user.
    // - `value`: Unique key identifying the view mode.
    // - `icon`: Optional icon associated with the view option.
    options: [
      { label: 'View print layout (Not Implemented)', value: 'viewPrintLayout', icon: null },
      { label: 'View web layout (Not Implemented)', value: 'viewWebLayout', icon: null }
    ]
  })
})
