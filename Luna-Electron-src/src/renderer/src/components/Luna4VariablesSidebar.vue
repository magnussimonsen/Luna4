<!-- Luna4Variables.vue -->
<template>
  <!--
    Main container for the Variables sidebar.
    The inline style uses font settings from the font store (with fallbacks).
  -->
  <div
    class="luna-variables"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.fontSize || '14px'
    }"
  >
    <!-- CAS section headings (currently placeholders) -->
    <h4>CAS functions</h4>
    <p>(No functions defined)</p>
    <h4>CAS variables</h4>
    <p>(No variables defined)</p>

    <!-- Python functions section -->
    <h4>Python functions (global namespace)</h4>
    <!--
      If there are any functions returned by the worker (sorted global functions),
      display them in a list. The functions are displayed as simple text.
    -->
    <ul v-if="notebookFunctions.length > 0" style="margin: 0; padding-left: 0.5em">
      <div v-for="(func, index) in notebookFunctions" :key="index">
        {{ func }}
      </div>
    </ul>
    <!-- If no functions exist, display a placeholder message. -->
    <p v-else style="margin: 0; padding-left: 0.5em">(No functions defined)</p>

    <!-- Python variables section -->
    <h4>User defined python variables</h4>
    <!-- If no variables exist, display a placeholder message. -->
    <p style="margin: 0; padding-left: 0.5em">(Not implemented yet)</p>
  </div>
</template>

<script setup>
// Import the computed API from Vue for reactive computed properties.
import { computed } from 'vue'
// Import the font store to retrieve font settings.
import { useFontStore } from '@/stores/Luna4FontStore.js'
// Import the notebooks and cells store to access the current notebook context.
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'

const fontStore = useFontStore()
const notebooksAndCellsStore = useNotebooksAndCellsStore()

// -----------------------------------------------------------------------------
// COMPUTED PROPERTIES
// -----------------------------------------------------------------------------

// Get the currently selected notebook from the Pinia store.
// This notebook is expected to contain properties for the Python context.
const selectedNotebook = computed(() => notebooksAndCellsStore.selectedNotebook)

// notebookFunctions computed property:
// Extracts the Python functions from the selected notebook's global namespace.
// The worker returns these sorted arrays, but here we ensure we get an array.
const notebookFunctions = computed(() => {
  // Access the property that holds the functions.
  const funcs = selectedNotebook.value?.pythonFunctions
  // If not defined, return an empty array.
  if (!funcs) return []
  // If it's not already an array, convert it using Object.values().
  return Array.isArray(funcs) ? funcs : Object.values(funcs)
})
</script>

<style scoped>
/* 
  Styling for the variables sidebar.
  The sidebar uses a flex column layout, scrolls vertically if content overflows,
  and applies padding and a default font color.
*/
.luna-variables {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 1em;
  color: var(--main-font-color, #000);
  box-sizing: border-box;
  text-wrap: wrap;
  word-wrap: break-word;
}
</style>
