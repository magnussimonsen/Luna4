<!--
  --------------------------------------------------------------------
  File: Luna4CellWrapper.vue
  --------------------------------------------------------------------
  Summary:
  The Luna4CellWrapper component is responsible for rendering an individual cell 
  within a notebook-like interface. It integrates with global stores to display 
  cells with dynamic content, styling, and selection behavior.
-->

<template>
  <!-- ------------------------------------------------
       Template Explanation
       ------------------------------------------------
       The template displays a wrapper (`.cell-wrapper`) with optional 
       cell index and the cell’s main component. The entire cell is clickable 
       to change the selection state.

       - If `settingsStore.showCellIndex` is true, a `.cell-index` element 
         displays the current cell’s index.
       - The `.cell-container` dynamically renders the specific cell component 
         defined by `cellComponent`.
       - The `selected` CSS class is conditionally applied if the cell is currently selected.
  -->
  <div
    class="cell-wrapper"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.fontSize || '14px'
    }"
  >
    <!-- Container holds the actual cell component -->

    <div class="cell-index" :style="cellIndexDynamicStyle" @click="toggleSelectCell">
      {{ settingsStore.showCellIndex ? cellIndex : '' }}
    </div>

    <div
      v-if="!isVisible"
      :id="cell.id"
      class="hidden-cell"
      :style="dynamicHiddenCellStyle"
      @click="selectCell"
    >
      &nbsp; Hidden {{ props.cell.type }} (click to show)
    </div>

    <!-- Container holds the actual cell component -->
    <div
      v-if="isVisible"
      :id="cell.id"
      :class="[
        'cell-component-container',
        {
          selectedAndEditable: isSelected && cell.editable,
          selectedAndNotEditable: isSelected && !cell.editable
        }
      ]"
      @click="selectCell"
    >
      <component :is="cellComponent" :cell="cell" />
    </div>
  </div>
</template>

<script setup>
// `computed` is a Vue Composition API function for creating computed properties.
import { computed } from 'vue'

// Global stores providing state management:
// - notebooksAndCellsStore: Manages a collection of cells and the selected cell ID.
// - fontStore: Provides font family and size preferences.
// - settingsStore: Controls settings like whether to show cell indexes.
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useSettingsStore } from '@/stores/Luna4SettingsStore.js'

// Import cell-specific components.
import TextCell from '@/components/Luna4TextCell.vue'
import MarkdownCell from '@/components/Luna4MarkdownCell.vue'
import PythonCell from '@/components/Luna4PythonCell.vue'
import CASCell from '@/components/Luna4CASCell.vue'
import ProbCalcCell from '@/components/Luna4ProbCalcCell.vue'

// - cell: Represents the individual cell object with properties like id, type, and content.
//          Required to ensure each component instance knows which cell it's rendering.
const props = defineProps({
  cell: {
    type: Object,
    required: true
  }
})

// Access global state stores.
const notebooksAndCellsStore = useNotebooksAndCellsStore()
const fontStore = useFontStore()
const settingsStore = useSettingsStore()

/**
 * isSelected
 * @type {Computed<Boolean>}
 * Determines if this cell is the currently selected one by comparing
 * the global selectedCellId with this cell’s id.
 */
const isSelected = computed(() => notebooksAndCellsStore.selectedCellId === props.cell.id)
const isVisible = computed(() => props.cell.visible)

/**
 * cellIndex
 * @type {Computed<Number>}
 * Calculates the cell’s 1-based index from the global cell list.
 * Useful when displaying an index for user reference.
 */
const cellIndex = computed(() => {
  return notebooksAndCellsStore.cells.findIndex((c) => c.id === props.cell.id) + 1
})

const dynamicHiddenCellStyle = computed(() => {
  let backgroundColor
  if (isSelected.value && !props.cell.visible) {
    backgroundColor = 'transparent'
  } else if (!isSelected.value && !props.cell.visible) {
    backgroundColor = 'transparent'
  } else {
    backgroundColor = 'transparent'
  }

  return {
    fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
    fontSize: `calc(${fontStore.fontSize} * 0.8)` || '12px',
    backgroundColor
  }
})
/**
 * cellIndexStyle
 * @type {Computed<Object>}
 * Generates the inline style object for the cell index,
 * applying the global font settings.
 */
const cellIndexDynamicStyle = computed(() => {
  let backgroundColor
  if (isSelected.value && !props.cell.visible) {
    backgroundColor = 'var(--selected-hidden-cell-color)'
  } else if (!isSelected.value && !props.cell.visible) {
    backgroundColor = 'var(--not-selected-hidden-cell-color)'
  } else if (isSelected.value && props.cell.editable && props.cell.visible) {
    backgroundColor = 'var(--selected-bg-color)'
  } else if (isSelected.value && !props.cell.editable && props.cell.visible) {
    backgroundColor = 'var(--read-only-color)'
  } else if (!isSelected.value && props.cell.editable && props.cell.visible) {
    backgroundColor = 'var(--not-selected-bg-color)'
  } else {
    backgroundColor = 'var(--inactive-read-only-color)'
  }

  return {
    fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
    fontSize: `calc(${fontStore.fontSize} * 0.8)` ?? '12px',
    minWidth: settingsStore.showCellIndex ? '1.5em' : '0.5em',
    backgroundColor
  }
})

/**
 * cellComponent
 * @type {Computed<Component|String>}
 * Returns the appropriate component to render based on the cell’s type.
 * If no match is found, it returns a fallback element.
 */
const cellComponent = computed(() => {
  switch (props.cell.type) {
    case 'Text':
      return TextCell
    case 'Markdown':
      return MarkdownCell
    case 'Python':
      return PythonCell
    case 'CAS':
      return CASCell
    case 'ProbabilityCalculator':
      return ProbCalcCell
    // Additional cases for other cell types can be added here.
    default:
      return 'div' // Fallback if cell type is unrecognized.
  }
})

/**
 * selectCell
 * Triggers the selection of the current cell.
 * @returns {void}
 * Side Effects:
 * - Updates the global selectedCellId in the notebooksAndCellsStore.
 */
const selectCell = () => {
  notebooksAndCellsStore.setSelectedCell(props.cell.id)
  if (!props.cell.visible) {
    notebooksAndCellsStore.setVisible(props.cell.id, true)
  }
}

const toggleSelectCell = () => {
  if (isSelected.value) {
    notebooksAndCellsStore.setSelectedCell(null)
  } else {
    selectCell()
    // notebooksAndCellsStore.setVisible(props.cell.id, true)
  }
}
</script>

<style scoped>
.cell-wrapper {
  display: flex;
  flex-wrap: nowrap;
  flex-grow: auto;
  width: 100%;
  background-color: var(--paper-bg-color);
  border-radius: var(--border-radius, 2px);
  margin-right: 0px;
}

.cell-index {
  color: var(--main-font-color);
  padding-right: 0.2em;
  text-align: right;
}
.hidden-cell {
  flex-grow: 1;
  width: 100%;
  height: auto;
  align-content: center;
  text-align: left;
  color: var(--main-font-color);
  background-color: transparent;
  /* Use transition-property, transition-duration, transition-timing-function, transition-delay */
  /*transition: color 10s ease-out 0.2s, background-color 10s ease-out 0.2s; /* The last value is the delay */
  transition: background-color 0.2s ease-out 0.2s; /* The last value is the delay */
}

.hidden-cell:hover {
  background-color: var(--selected-hidden-cell-color) !important;
  color: var(--main-font-color);
  /* Add delay to hover state transitions */
  transition: background-color 0.2s ease-in 0.2s; /* 0.2s delay for color */
}

.cell-component-container {
  background-color: transparent;
  width: 100%;
  min-width: 0;
  height: auto; /* Allow the container to adjust height based on content */
  /*min-height: 2.5em;*/
  /* box-shadow: inset 0.5em 0px 0px 0px var(--navbar-bg-color);   */
  border-left: none;
  padding-left: 0em; /*0.5em*/
  padding-right: 1px;
  flex-grow: 1; /* Do not force the container to grow */
  cursor: pointer;
  border-top-right-radius: var(--border-radius, 2px);
  border-bottom-right-radius: var(--border-radius, 2px);
  /*border: 1px solid var(--navbar-bg-color); /* Enalbels visible line between cells   */
  border: 0px solid var(--cell-bg-color);
}

.selectedAndEditable {
  border: 0px solid var(--selected-bg-color);
}

.selectedAndNotEditable {
  border: 0px solid var(--read-only-color);
}

.notEditable {
  border: 0px solid var(--read-only-color);
}
</style>
