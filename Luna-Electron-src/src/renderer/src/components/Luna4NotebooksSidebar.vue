<!--
  --------------------------------------------------------------------
  File: Luna4NotebooksSidebar.vue
  --------------------------------------------------------------------
  Summary:
  The Luna4NotebooksSidebar component provides a sidebar listing all notebooks.
  It includes controls for adding, deleting, and reordering notebooks.
  The sidebar integrates with global stores to reflect the current theme,
  font settings, and selected notebook. When users interact with the 
  provided buttons, notebook actions are dispatched through the store.

  Key Features:
  - Dynamically styled icons that adapt to the active theme.
  - Control buttons to add new notebooks, delete selected notebook, and 
    move the selected notebook up or down in the list.
  - Lists notebooks from a global store, each wrapped by Luna4NotebookTitleWrapper.
  - Displays an alert modal for confirming notebook deletions.

  Structure:
  - Template: Renders a toolbar with action buttons and a list of notebooks.
  - Script Setup: 
    * Imports and uses global font, theme, and notebook stores.
    * Provides computed properties to select appropriate icons based on theme.
    * Defines an action handler method for button clicks.
  - Style: Scoped CSS ensures consistent layout and theme-based visual styling.
-->

<template>
  <!-- ------------------------------------------------
       Template Explanation
       ------------------------------------------------
       The template layout:
       - A main container applying global font settings.
       - A navigation bar (notebook-navbar) with buttons for notebook operations.
       - A list of notebooks displayed as Luna4NotebookTitleWrapper components.
       - A LunaAlertModal for confirming delete operations.
  -->
  <div
    class="notebooks-sidebar-main-container"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.fontSize || '14px'
    }"
  >
    <!-- Notebook toolbar with action buttons -->
    <div class="notebook-navbar">
      <LunaSuperButton
        :icon="currentAddNewNotebookIcon"
        alt-text="Insert new notebook"
        title="Insert new notebook"
        class="add-notebook-button"
        @click="() => handleButtonClick('addNewNotebook')"
      />
      <LunaSuperButton
        :icon="currentDeleteNotebookIcon"
        alt-text="Delete selected notebook"
        title="Delete selected notebook"
        class="delete-notebook-button"
        @click="() => handleButtonClick('deleteNotebook')"
      />
      <LunaSuperButton
        :icon="currentArrowUpIcon"
        alt-text="Move notebook up"
        title="Move selected notebook up"
        @click="() => handleButtonClick('moveNotebookUp')"
      />
      <LunaSuperButton
        :icon="currentArrowDownIcon"
        alt-text="Move notebook down"
        title="Move selected notebook down"
        @click="() => handleButtonClick('moveNotebookDown')"
      />
    </div>

    <!-- Render each notebook using Luna4NotebookTitleWrapper -->
    <Luna4NotebookTitleWrapper
      v-for="notebook in notebooksAndCellsStore.notebooks"
      :key="notebook.id"
      :notebook="notebook"
    />

    <!-- Alert modal reference used for confirmations -->
    <LunaAlertModal ref="alertModalRef" />
  </div>
</template>

<script setup>
// ------------------------------------------------
// Imports and Dependencies
// ------------------------------------------------
// Vue Composition API features:
// - computed: to derive dynamic values from reactive data.
// - ref: to reference DOM elements or store component instances.
import { computed, ref } from 'vue'

// Global stores for fonts, themes, and notebooks/cells.
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useThemeStore } from '@/stores/Luna4ThemeStore.js'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import { confirmNotebookDeletion } from '../utils/confirmationDialogHelpers'
// Child components and icons
import Luna4NotebookTitleWrapper from '@/components/Luna4NotebookTitleWrapper.vue'
import LunaSuperButton from '@/components/Luna4SuperButton.vue'
import LunaAlertModal from '@/components/Luna4AlertModal.vue'
// Icons for different themes
import AddNewNotebookIcon from '@/assets/icons/Luna_Add_New_Notebook.svg'
import AddNewNotebookDarkIcon from '@/assets/icons/Luna_Add_New_Notebook_CCCCCC.svg'
import DeleteIcon from '@/assets/icons/Luna_Delete_Notebook.svg'
import DeleteDarkIcon from '@/assets/icons/Luna_Delete_Notebook_Dark.svg'
import ArrowUpIcon from '@/assets/icons/Luna_Arrow_Up.svg'
import ArrowDownIcon from '@/assets/icons/Luna_Arrow_Down.svg'
import ArrowUpDarkIcon from '@/assets/icons/Luna_Arrow_Up_Dark.svg'
import ArrowDownDarkIcon from '@/assets/icons/Luna_Arrow_Down_Dark.svg'

// ------------------------------------------------
// State Variables & References
// ------------------------------------------------
// Access global font and theme settings
const fontStore = useFontStore()
const themeStore = useThemeStore()

// Access notebooks store to list and modify notebooks
const notebooksAndCellsStore = useNotebooksAndCellsStore()

// Reference to the alert modal for showing confirmation dialogs
const alertModalRef = ref(null)

// ------------------------------------------------
// Computed Properties
// ------------------------------------------------
/**
 * currentAddNewNotebookIcon
 * Chooses the correct icon for "Add New Notebook" based on the active theme.
 */
const currentAddNewNotebookIcon = computed(() =>
  themeStore.activeTheme === 'Dark' ? AddNewNotebookDarkIcon : AddNewNotebookIcon
)

/**
 * currentDeleteIcon
 * Chooses the correct delete icon based on the active theme.
 */
const currentDeleteNotebookIcon = computed(() =>
  themeStore.activeTheme === 'Dark' ? DeleteDarkIcon : DeleteIcon
)

/**
 * currentArrowUpIcon
 * Chooses the correct "move up" icon based on the active theme.
 */
const currentArrowUpIcon = computed(() =>
  themeStore.activeTheme === 'Dark' ? ArrowUpDarkIcon : ArrowUpIcon
)

/**
 * currentArrowDownIcon
 * Chooses the correct "move down" icon based on the active theme.
 */
const currentArrowDownIcon = computed(() =>
  themeStore.activeTheme === 'Dark' ? ArrowDownDarkIcon : ArrowDownIcon
)

// ------------------------------------------------
// Methods
// ------------------------------------------------
/**
 * handleButtonClick
 * Executes the appropriate action when toolbar buttons are clicked.
 *
 * @param {string} action - The requested action:
 *  - 'addNewNotebook': Adds a new notebook.
 *  - 'deleteNotebook': Confirms and deletes the selected notebook.
 *  - 'moveNotebookUp': Moves the selected notebook up in the list.
 *  - 'moveNotebookDown': Moves the selected notebook down in the list.
 */
async function handleButtonClick(action) {
  if (action === 'addNewNotebook') {
    notebooksAndCellsStore.addNotebook()
  } else if (action === 'deleteNotebook') {
    if (alertModalRef.value) {
      await confirmNotebookDeletion(notebooksAndCellsStore, alertModalRef.value)
    }
  } else if (action === 'moveNotebookUp') {
    notebooksAndCellsStore.moveNotebookUp()
    console.log(notebooksAndCellsStore.selectedNotebook.name) // Debugging log
  } else if (action === 'moveNotebookDown') {
    notebooksAndCellsStore.moveNotebookDown()
    console.log(notebooksAndCellsStore.selectedNotebook.name) // Debugging log
  } else {
    console.warn('Unhandled action:', action)
  }
}
</script>

<style scoped>
/* ------------------------------------------------
   Styles
   ------------------------------------------------
   Provides a clean layout for the notebooks sidebar.
   The sidebar and toolbar are styled for clarity and 
   consistency with the application's theme.
*/

.notebooks-sidebar-main-container {
  display: flex;
  flex-direction: column;
  height: 100%; /* Ensures the sidebar takes full height of the parent */
  overflow-y: auto; /* Enables vertical scrolling within the sidebar */
  padding-left: 0em;
  padding-right: 0.5em;
  color: var(--main-font-color, #000); /* Fallback color if CSS variable is not set */
  box-sizing: border-box; /* Includes padding and border in the element's total width and height */
}

.notebook-navbar {
  display: flex;
  margin-bottom: 0em;
  margin-top: 0.5em;
  justify-content: left;
}

.add-notebook-button:hover {
  background-color: limegreen;
}
.delete-notebook-button:hover {
  background-color: red;
}
</style>
