// Luna4EditDropdownStore.js

import { defineStore } from 'pinia'

/**
 * This store manages the list of options displayed in the "Edit" dropdown menu.
 * It centralizes the edit-related actions such as undo, redo, cut, copy, and paste.
 * Each menu option includes a label, a value (which may be used for triggering the corresponding action),
 * and an optional icon field that can be used if an icon-based UI is desired.
 */

export const useEditDropdownStore = defineStore('editDropdown', {
  // ---------------------------------------------------------------------------
  // 1. STATE VARIABLES & REFERENCES

  /**
   * The state function provides the reactive data for the store.
   * @returns {Object} The reactive state object containing the dropdown options.
   */
  state: () => ({
    /**
     * An array of option objects representing the Edit dropdown items.
     * Each object includes:
     * - `label`: The text displayed in the menu (e.g., 'Undo', 'Copy').
     * - `value`: A unique identifier or command key (e.g., 'undo', 'copy') used for triggering the action.
     * - `icon`: An optional field that can hold a string reference to an icon name or path.
     *
     * @type {Array<{ label: string, value: string, icon: string|null }>}
     */
    options: [
      { label: 'Undo (Not Implemented)', value: 'undo', icon: null },
      { label: 'Redo (Not Implemented)', value: 'redo', icon: null },
      { label: 'Cut (Not Implemented)', value: 'cut', icon: null },
      { label: 'Copy (Not Implemented)', value: 'copy', icon: null },
      { label: 'Paste (Not Implemented)', value: 'paste', icon: null }
    ]
  })
})
