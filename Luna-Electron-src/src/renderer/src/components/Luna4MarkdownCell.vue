<!--
  File: Luna4MarkdownComponent.vue

  Summary:
    The `LunaMarkdownComponent` is a Vue component that provides an editable markdown cell within a notebook interface.

  Key Features:
    - Editable markdown cell with real-time preview.
    - Supports markdown and LaTeX rendering.
    - Synchronizes content with a global Pinia store.

  Example Usage:
    Add this component to a notebook editor and pass a cell object:
    <LunaMarkdownComponent :cell="cell" />

  Props (Inputs):
    - cell (Object): Contains `id`, `content`, and `editable` status of the cell.

  Return (Outputs):
    - Renders the markdown as styled text/LaTeX.
    - Updates the cell content in the global store.
-->

<template>
  <div class="divider-markdown-wrapper">
    <div
      v-if="
        rendercomponentPosition === 'top' ||
        rendercomponentPosition === 'right' ||
        rendercomponentPosition === 'left'
      "
      class="content-container"
      :class="{
        'top-layout': rendercomponentPosition === 'top',
        'right-layout': rendercomponentPosition === 'right',
        'left-layout': rendercomponentPosition === 'left'
      }"
    >
      <LunaMarkdownRenderer
        class="markdown-and-katex-rendered"
        :content="cellContent"
        :style="rendererStyle"
      />
      <div
        v-show="isSelectedCell && isCellEditable && !isCellReadOnlyForever"
        ref="editableDiv"
        :contenteditable="isCellEditable"
        class="input-div"
        :style="editableDivStyle"
        data-placeholder="Enter your markdown here..."
        @input="updateContent"
        @focus="setActiveCell"
        @blur="onBlur"
        @click="updateCaretPosition"
        @keyup="updateCaretPosition"
      >
        {{ props.cell.content }}
      </div>
    </div>
    <!-- BOTTOM -->
    <div
      v-if="rendercomponentPosition === 'bottom'"
      class="content-container"
      :class="{
        'bottom-layout': rendercomponentPosition === 'bottom'
      }"
    >
      <div
        v-show="isSelectedCell && isCellEditable && !isCellReadOnlyForever"
        ref="editableDiv"
        :contenteditable="isCellEditable"
        class="input-div"
        :style="editableDivStyle"
        data-placeholder="Enter your markdown here..."
        @input="updateContent"
        @focus="setActiveCell"
        @blur="onBlur"
        @click="updateCaretPosition"
        @keyup="updateCaretPosition"
      >
        {{ props.cell.content }}
      </div>
      <LunaMarkdownRenderer
        class="markdown-and-katex-rendered"
        :content="cellContent"
        :style="rendererStyle"
      />
    </div>
    <!-- Toggle button for layout -->
    <div v-if="isSelectedCell" class="layout-toggle-container">
      <button
        class="icon-button"
        :class="rendercomponentPosition"
        title="Toggle preview position"
        @click="toggleRendercomponentPosition"
      >
        <img :src="currentSplitTopIcon" alt="Side by Side View" class="layout-icon" />
      </button>
    </div>
  </div>
</template>

<script setup>
//// Imports and Dependencies
import { ref, computed, onMounted } from 'vue'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import { useMarkdownToolbarStore } from '@/stores/Luna4MarkdownToolbarStore.js'
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useThemeStore } from '@/stores/Luna4ThemeStore.js'
import LunaMarkdownRenderer from '@/components/LunaMarkdownRenderer.vue'

// Import icons for split view
import SplitTopIcon from '@/assets/icons/Luna_Splitscreen_Top.svg'
import SplitTopDarkIcon from '@/assets/icons/Luna_Splitscreen_Top_CCCCCC.svg'
//// Props
const props = defineProps({
  cell: { type: Object, required: true } // Input cell object containing id, content, and editable status
})

const currentSplitTopIcon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? SplitTopDarkIcon : SplitTopIcon
})
const rendercomponentPositionArray = ['right', 'top', 'left', 'bottom'] // Possible positions for the LunaMarkdownRenderer component

const toggleRendercomponentPosition = () => {
  updateContent() // Update the content before changing the position
  rendercomponentPosition.value =
    rendercomponentPositionArray[
      (rendercomponentPositionArray.indexOf(rendercomponentPosition.value) + 1) %
        rendercomponentPositionArray.length
    ] // Cycle through the available positions
  console.log(rendercomponentPosition.value)
  console.log('mounted', cellContent.value)
}

// LunaMarkdownRenderer component position
const rendercomponentPosition = ref('top') // Position of the LunaMarkdownRenderer component

//// Pinia Stores
const notebooksAndCellsStore = useNotebooksAndCellsStore() // Notebook store for managing cells
const markdownToolbarStore = useMarkdownToolbarStore()
const fontStore = useFontStore() // Font settings store
const themeStore = useThemeStore() // Theme settings store
//// Lifecycle Hook: Set initial content of the editable div
onMounted(() => {
  if (!editableDiv.value) return // Check if editableDiv is properly initialized
  editableDiv.value.innerText = cellContent.value // Sync content with the editable div
})
//// Reactive References
const editableDiv = ref(null) // Reference to the editable div
const cellContent = computed(() => props.cell.content) // Content of the cell
//// Computed Properties
const isCellEditable = computed(() => props.cell.editable && !props.cell.isCellReadOnlyForever) // Editable state of the cell
const isCellReadOnlyForever = computed(() => props.cell.isCellReadOnlyForever) // Check if the cell is read-only
const isSelectedCell = computed(() => notebooksAndCellsStore.selectedCellId === props.cell.id) // Checks if the current cell is selected
const editableDivStyle = computed(() => ({
  fontFamily: fontStore.fontFamily || 'Arial, sans-serif', // Apply font from store or default
  fontSize: fontStore.fontSize || '14px' // Apply font size from store or default
}))

const rendererStyle = computed(() => ({
  backgroundColor:
    isSelectedCell.value && isCellEditable.value ? 'var(--cell-bg-color)' : 'var(--cell-bg-color)'
}))
//// Event Handlers
const onBlur = () => {
  if (!editableDiv.value) return // Check if editableDiv is accessible
  markdownToolbarStore.setFocusedEditableDiv(null) // Clear the focused editable div in the store
}
const updateContent = () => {
  if (!editableDiv.value) return // Prevent errors if editableDiv is not defined
  notebooksAndCellsStore.updateCellPropVal(props.cell.id, [
    { key: 'content', val: editableDiv.value.innerText }
  ])
}
const setActiveCell = (event) => {
  if (!event.target || !editableDiv.value) return // Ensure the target is valid
  notebooksAndCellsStore.setSelectedCell(props.cell.id) // Mark the current cell as active
  markdownToolbarStore.setFocusedEditableDiv(event.target) // Set the active editable div
}
</script>
<style scoped>
/* Wrapper for the markdown editor and renderer */
.divider-markdown-wrapper {
  display: flex;
  flex-direction: column;
  padding: 0;
  background-color: var(--cell-bg-color);
  min-height: 2em;
  position: relative; /* Add relative positioning for absolute child positioning */
}

.divider-markdown-wrapper:focus {
  outline: none; /* Removes the default focus outline */
  border: 2px solid blue; /* Change to the color or style you prefer */
}
/* Container for editable div and renderer */
.content-container {
  display: flex;
  gap: 2em; /* Added gap between input-div and markdown-and-katex-rendered */
  align-items: flex-start; /* ensure items start at top so resizing doesn't stretch siblings */
}

.content-container:focus {
  border: 2px solid blue; /* Change to the color or style you prefer */
}
/* Editable div styling */
.input-div {
  /* Remove or adjust flex: 1 if you want the user's resizing to truly override the layout */
  color: var(--markdown-font-color, #000000);
  line-height: 1.45;
  padding: 0.5em;
  min-height: fit-content;
  width: 50%;
  min-width: 25%;
  margin-left: 0;
  background-color: var(--cell-bg-color);
  background-color: var(--markdown-input-div-bg-color, #ffffff);
  white-space: pre-wrap;
  caret-color: initial;
  /* Key additions: */
  overflow: auto; /* needed for resize to work properly */
}

.input-div:focus {
  /*outline: none:  Remove default outline */
  outline: none; /* Removes the default focus outline */
}

/* Rendered markdown and LaTeX styling */
.markdown-and-katex-rendered {
  flex: 1;
  padding: 0 0.5em;
  margin: 0;
  min-height: 2.5em;
  height: fit-content;
  width: 50%;
  min-width: 25%;
  background-color: var(--cell-bg-color);
  color: var(--markdown-font-color, #000000);
  cursor: not-allowed !important;
}
.input-div:empty:before {
  content: attr(data-placeholder);
  color: #aaa;
  pointer-events: none;
}

.content-container.top-layout {
  flex-direction: column;
  gap: 1em;
}

.content-container.top-layout .input-div {
  width: 100%;
}

.content-container.top-layout .markdown-and-katex-rendered {
  width: 100%;
  margin-bottom: 0.1em;
}

.content-container.right-layout {
  flex-direction: row;
  gap: 1em;
}

.content-container.right-layout .input-div {
  width: 50%;
}

.content-container.left-layout .markdown-and-katex-rendered {
  width: 50%;
  margin-left: 0.5em;
}

.content-container.left-layout {
  flex-direction: row-reverse;
  gap: 1em;
}

.content-container.left-layout .input-div {
  width: 50%;
}

.content-container.right-layout .markdown-and-katex-rendered {
  width: 100%;
  margin-right: 0.5em;
}

.content-container.bottom-layout {
  flex-direction: column;
  gap: 1em;
}

.content-container.bottom-layout .input-div {
  width: 100%;
}

.content-container.bottom-layout .markdown-and-katex-rendered {
  width: 100%;
  margin-bottom: 0.1em;
}

/* For the toggle button */
.toggle-position-button {
  display: none;
}

/* Replace the toggle button with icon buttons */
.layout-toggle-container {
  position: absolute;
  top: 0em;
  right: max(0em, 1%);
  display: flex;
  gap: 0.5em;
  z-index: 1000;
}

.icon-button {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  cursor: pointer;
  margin: 0em;
  width: 1.3em;
  height: 1.3em;
  transition: all 0.3s ease;
  border: none;
  border-radius: 4px;
}

.icon-button.right {
  background-color: transparent;
  transform: rotate(90deg);
  transition: all 0s ease;
}

.icon-button.left {
  background-color: transparent;
  transform: rotate(-90deg);
  transition: all 0s ease;
}

.icon-button.top {
  background-color: transparent;
  transform: rotate(180deg);
  transition: all 0s ease;
}

.icon-button.bottom {
  background-color: transparent;
  transform: rotate(0deg);
  transition: all 0s ease;
}

.layout-icon {
  width: 1.8em;
  height: 1.8em;
}
</style>
