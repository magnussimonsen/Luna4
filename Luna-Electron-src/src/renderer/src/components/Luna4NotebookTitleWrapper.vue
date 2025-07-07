<!--
  --------------------------------------------------------------------
  File: Luna4NotebookTitleWrapper.vue
  --------------------------------------------------------------------
  Summary:
  This component displays the title of a notebook entry within the application’s 
  notebook list. It allows the user to:
  - View the notebook name.
  - Select a notebook by clicking on it.
  - Rename a notebook by double-clicking, unless it’s the special "recycle bin" notebook.
  - Display a specialized icon if this notebook is the recycle bin notebook.
  
  Key Features:
  - Dynamically shows an editable text input for renaming notebooks (except the recycle bin).
  - Indicates the currently selected notebook with a distinct border style.
  - Integrates with global theme and font stores for consistent styling.
  - Changes icons dynamically based on the active theme.

  Structure:
  - Template: Conditionally renders an input field when editing, or the notebook’s name otherwise.
              Displays a special icon if the notebook is the recycle bin.
  - Script Setup: 
      * Imports stores and icons.
      * Defines props for the notebook data and optional icon.
      * Uses computed properties to determine selection state, whether it’s the recycle bin, and which icon to show.
      * Provides methods to select notebooks, initiate editing, and commit name changes.
  - Styles: Scoped CSS defines the appearance of the notebook wrapper and input field.
-->

<template>
  <!-- ------------------------------------------------
       Template Explanation
       ------------------------------------------------
       The template renders a wrapper that displays the notebook’s title.
       If the user double-clicks on a non-recycle bin notebook, it switches
       to edit mode (showing an input field). The ‘selected’ CSS class highlights
       the currently selected notebook. Icons and fonts are dynamically applied.
  -->
  <div
    :id="'notebook-' + notebook.id"
    :class="['notebook-title-wrapper', { selected: isSelected }]"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.fontSize || '14px'
    }"
    @click="selectNotebook"
    @dblclick="tryStartEditing"
  >
    <!-- If editing and not the recycle bin, show an input for renaming -->
    <input
      v-if="isEditing"
      ref="inputRef"
      type="text"
      :value="editedName"
      class="notebook-name-input"
      @input="editedName = $event.target.value"
      @keyup.enter="commitEdit"
      @blur="commitEdit"
    />
    <!-- If not editing, display the notebook name -->
    <span v-else>
      <!-- If this is the recycle bin notebook, show the name in bold and the icon -->
      <template v-if="isRecycleBinNotebook">
        <div class="notebook-title-line">
          <strong>{{ notebook.name }} &nbsp; </strong>
          <img :src="currentRecyclingBinIcon" alt="Recycle Bin Icon" class="notebook-icon" />
        </div>
      </template>
      <!-- Otherwise, just display the notebook name normally -->
      <template v-else>
        <div class="notebook-title-line">
          {{ notebook.name }}
          <img :src="currentNotebookIcon" alt="Notebook Icon" class="notebook-icon" />
        </div>
      </template>
    </span>
  </div>
</template>

<script setup>
// ------------------------------------------------
// Imports and Dependencies
// ------------------------------------------------
// Importing Vue Composition API utilities:
// - ref: to define reactive references.
// - computed: to create computed properties based on reactive data.
// - nextTick: to run code after the DOM update cycle.
import { computed, ref, nextTick } from 'vue'

// Stores providing global state and methods:
// - useNotebooksAndCellsStore: Manages notebooks, their selection, and updating notebook names.
// - useFontStore: Provides font family and size preferences.
// - useThemeStore: Provides theme data to determine icon selection for the recycle bin.
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useThemeStore } from '@/stores/Luna4ThemeStore.js'

// Icons for recycle bin in different themes
import RecyclingBinDarkIcon from '@/assets/icons/Luna_Recycling_Bin_Dark.svg'
import RecyclingBinIcon from '@/assets/icons/Luna_Recycling_Bin.svg'
import NotebookDarkIcon from '@/assets/icons/Luna_Notebook_Dark.svg'
import NotebookIcon from '@/assets/icons/Luna_Notebook.svg'

// ------------------------------------------------
// Props
// ------------------------------------------------
// - notebook: Object containing notebook details such as id and name.
// - icon: Optional icon for the notebook; defaults to null if not provided.
const props = defineProps({
  notebook: {
    type: Object,
    required: true
  },
  icon: {
    type: String,
    required: false,
    default: null
  }
})

// ------------------------------------------------
// State Variables & References
// ------------------------------------------------
// Access global stores for notebooks/cells, fonts, and themes.
const notebooksAndCellsStore = useNotebooksAndCellsStore()
const fontStore = useFontStore()
const themeStore = useThemeStore()

// Track editing state and edited name of the notebook.
const isEditing = ref(false)
const editedName = ref(props.notebook.name)
const inputRef = ref(null) // Reference to the input element for focusing/selection.

// ------------------------------------------------
// Computed Properties
// ------------------------------------------------
/**
 * isSelected
 * Determines if the current notebook is selected (active).
 * Returns true if the notebook’s id matches the store’s selectedNotebookId.
 */
const isSelected = computed(() => notebooksAndCellsStore.selectedNotebookId === props.notebook.id)

/**
 * isRecycleBinNotebook
 * Checks if the notebook is the special recycle bin notebook.
 * Returns true if this notebook’s id matches the first notebook in the list.
 */
const isRecycleBinNotebook = computed(() => {
  const notebooks = notebooksAndCellsStore.notebooks
  return notebooks.length > 0 && notebooks[0].id === props.notebook.id
})

/**
 * currentRecyclingBinIcon
 * Determines which icon to use based on the active theme.
 * Returns a dark icon if theme is 'Dark', otherwise the default icon.
 */
const currentRecyclingBinIcon = computed(() =>
  themeStore.activeTheme === 'Dark' ? RecyclingBinDarkIcon : RecyclingBinIcon
)

const currentNotebookIcon = computed(() =>
  themeStore.activeTheme === 'Dark' ? NotebookDarkIcon : NotebookIcon
)

// ------------------------------------------------
// Methods
// ------------------------------------------------

/**
 * selectNotebook
 * Selects the current notebook in the store when the component is clicked.
 * @returns {void}
 */
function selectNotebook() {
  notebooksAndCellsStore.setSelectedNotebook(props.notebook.id)
}

/**
 * tryStartEditing
 * Initiates editing mode for the notebook name unless it’s the recycle bin notebook.
 * Focuses and selects the input field if editing starts.
 * @returns {void}
 */
function tryStartEditing() {
  if (isRecycleBinNotebook.value) return // Cannot edit the recycle bin notebook
  isEditing.value = true
  editedName.value = props.notebook.name

  // Wait for next tick to ensure input is rendered and then focus on it
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
      inputRef.value.select()
    }
  })
}

/**
 * commitEdit
 * Commits the edited notebook name to the store if changed and allowed.
 * If the name has changed and the notebook is not the recycle bin, it updates the store.
 * Ends editing mode afterwards.
 * @returns {void}
 */
function commitEdit() {
  if (!isRecycleBinNotebook.value) {
    const trimmedName = editedName.value.trim()
    if (trimmedName !== props.notebook.name) {
      notebooksAndCellsStore.updateNotebookName(props.notebook.id, trimmedName)
    }
  }
  isEditing.value = false
}
</script>

<style scoped>
/* ------------------------------------------------
   Styles
   ------------------------------------------------
   The styling ensures:
   - A distinctive look for the selected notebook.
   - Smooth transitions when entering edit mode.
   - Proper spacing, fonts, and colors consistent with application theme.
*/

.notebook-title-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--navbar-bg-color);
  padding: 0.5em;
  border: 0.2em solid var(--inactive-border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  align-items: left;
  color: var(--main-font-color);
  margin-top: 0.5em;
  box-shadow: 0em 0em 0px rgba(0, 0, 0, 0.2);
}

.notebook-title-wrapper:hover {
  background-color: var(--navbar-hover-bg-color);
  border: 0.2em solid var(--navbar-hover-bg-color);
}

.notebook-title-wrapper.selected {
  border: 0.2em solid var(--active-border-color);
  box-shadow: inset 0em 0em 0px 0em rgba(0, 0, 0, 1);
  background-color: var(--selected-bg-color);
}

.notebook-name-input {
  width: 100%;
  padding: 0;
  font-size: inherit;
  font-family: inherit;
  border: none;
  outline: none;
  background-color: var(--cell-bg-color);
}

.notebook-title-line {
  display: flex;
  align-items: center;
}

.notebook-icon {
  width: 1.4em;
  height: 1.4em;
  margin-left: auto;
}
</style>
