<!--
  --------------------------------------------------------------------
  File: Luna4RightToolbarWrapper.vue
  --------------------------------------------------------------------
  Summary:
  The Luna4RightToolbarWrapper component serves as a container for right-side toolbar 
  elements in the Luna4 application. Its primary role is to conditionally display
  a specific toolbar for each cell type or for the recycle bin notebook (for example RightToolbarRecycleBin, RightToolbarTextCell or 
  RightToolbarPythonCell and so on). Otherwise, it displays a placeholder message.

  Key Features:
  - Integrates with the global store to determine which toolbar content to show.
  - Adapts typography and layout based on the font and theme settings.
  - Functions as a flexible wrapper that can easily be extended for additional right-side toolbars.
  
  Structure:
  - Template: 
    * Displays the RightToolbarRecycleBin component if the currently selected notebook is the recycle bin.
    * Shows a simple "Toolbar is empty" message if not.
  - Script Setup:
    * Imports global stores (font, theme, notebooks/cells) and the RightToolbarRecycleBin component.
    * Logs the current theme (primarily to silence ESLint warnings about unused variables).
-->

<template>
  <!-- ------------------------------------------------
       Template Explanation
       ------------------------------------------------
       The template checks if the selected notebook is the recycle bin 
       (the first notebook in the store's array). If yes, it shows the 
       RightToolbarRecycleBin component. Otherwise, it displays a placeholder message.
       
       Dynamic font styling is applied based on font store settings.
  -->
  <nav
    class="toolbar-base margin-bottom"
    :class="{
      read: isEditable,
      'read-only': !isEditable,
      'not-selected': !notebooksAndCellsStore.selectedCell
    }"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.menuFontSize || '14px'
    }"
  >
    <!-- Conditionally render the recycle bin toolbar if the selected notebook is the first (recycle) notebook -->
    <div
      v-if="notebooksAndCellsStore.selectedNotebookId === notebooksAndCellsStore.notebooks[0].id"
      class="toolbar-base"
      style="width: 100%"
    >
      <RecycleBinToolbar />
    </div>
    <div
      v-else-if="
        notebooksAndCellsStore.selectedCell &&
        notebooksAndCellsStore.selectedCell.type === 'Markdown'
      "
      class="toolbar-base"
      style="width: 100%"
    >
      <MarkdownToolbar />
    </div>
    <div
      v-else-if="
        notebooksAndCellsStore.selectedCell &&
        notebooksAndCellsStore.selectedCell.type === 'ProbabilityCalculator'
      "
      class="toolbar-base"
      style="width: 100%"
    >
      <ProbCalcToolbar />
    </div>
    <div
      v-else-if="
        notebooksAndCellsStore.selectedCell && notebooksAndCellsStore.selectedCell.type === 'Python'
      "
      class="toolbar-base"
      style="width: 100%"
    >
      <PythonToolbar />
    </div>
    <div
      v-else-if="
        notebooksAndCellsStore.selectedCell && notebooksAndCellsStore.selectedCell.type === 'CAS'
      "
      class="toolbar-base"
      style="width: 100%"
    >
      <CASToolbar />
    </div>
    <div
      v-else-if="
        notebooksAndCellsStore.selectedCell && notebooksAndCellsStore.selectedCell.type === 'Text'
      "
      class="toolbar-base"
      style="width: 100%"
    >
      <TextToolbar />
    </div>

    <!-- Show a placeholder when no specialized toolbar is applicable -->
    <div v-else>Toolbar is empty. No cell selected.</div>
  </nav>
</template>

<script setup>
// Imports and Dependencies
// Import stores for font, theme, and notebooks/cells to dynamically style and determine displayed toolbar.
import { useFontStore } from '@/stores/Luna4FontStore.js'
//import { useThemeStore } from '@/stores/Luna4ThemeStore.js'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'

// Import the toolbar components
import RecycleBinToolbar from '@/components/Luna4RecycleBinToolbar.vue'
import MarkdownToolbar from '@/components/Luna4MarkdownToolbar.vue'
import PythonToolbar from '@/components/Luna4PythonToolbar.vue'
import ProbCalcToolbar from '@/components/Luna4ProbCalcToolbar.vue'
import CASToolbar from '@/components/Luna4CASToolbar.vue'
import TextToolbar from '@/components/Luna4TextToolbar.vue'
import { computed } from 'vue'

// ------------------------------------------------
// State Variables & References
// ------------------------------------------------
// Access global font and theme settings, as well as the notebooks/cells store.
const fontStore = useFontStore()
//const themeStore = useThemeStore()
const notebooksAndCellsStore = useNotebooksAndCellsStore()

const isEditable = computed(() => {
  return notebooksAndCellsStore.isCellCurrentlyEditable
})
</script>

<style scoped>
/* Style the child divs that contain the actual toolbar components */

.read {
  border: 1px solid var(--selected-bg-color);
}
.read-only {
  border: 1px solid var(--read-only-color);
}

.not-selected {
  border: 1px solid var(--navbar-bg-color);
}
</style>
