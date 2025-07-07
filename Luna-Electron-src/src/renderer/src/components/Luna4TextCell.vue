<!-- File: Luna4TextCell.vue -->
<template>
  <!-- Editable content area -->
  <div class="dev-texcell-wrapper">
    <div style="display: flex">
      <!-- Input div - REMOVE :innerHTML binding -->
      <div
        ref="editableDiv"
        :contenteditable="isCellEditable"
        class="input-div"
        :style="{
          fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
          fontSize: fontStore.menuFontSize || '14px',
          color: 'var(--main-font-color)' || 'black'
        }"
        data-placeholder="Enter your plain text here..."
        @input="onInput"
        @focus="setActiveCell"
      ></div>

      <!-- Rendered markdown and KaTeX 
      <div class="markdown-and-katex-renderd"></div>-->
    </div>

    <!-- Display Raw HTML 
    <div class="display-raw-html-from-markdown-katex">
      <p>Raw input:</p>
      <pre>{{ cellContent }}</pre>
    </div>-->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import { useFontStore } from '@/stores/Luna4FontStore.js'

const props = defineProps({
  cell: { type: Object, required: true }
})
const notebooksAndCellsStore = useNotebooksAndCellsStore()
const fontStore = useFontStore()
const editableDiv = ref(null)
const previousContent = ref('')

// Computed property with getter and setter
const cellContent = computed({
  get: () => props.cell.content || '',
  set: (newValue) => {
    notebooksAndCellsStore.updateCellPropVal(props.cell.id, [
      {
        key: 'content',
        val: newValue
      }
    ])
  }
})

// Update the computed property when the div changes
const onInput = () => {
  if (editableDiv.value) {
    const newContent = editableDiv.value.innerHTML
    // Only update if content actually changed
    if (newContent !== previousContent.value) {
      previousContent.value = newContent
      cellContent.value = newContent
    }
  }
}

const isCellEditable = computed(() => props.cell.editable && !props.cell.isCellReadOnlyForever) // Editable state of the cell
// const isCellReadOnlyForever = computed(() => props.cell.isCellReadOnlyForever) // Check if the cell is read-only

const setActiveCell = () => {
  notebooksAndCellsStore.setSelectedCell(props.cell.id)
}

// Watch for external changes to cell content
watch(
  () => props.cell.content,
  (newContent) => {
    if (editableDiv.value && newContent !== editableDiv.value.innerHTML) {
      // Only update if it's different to avoid cursor jumping
      editableDiv.value.innerHTML = newContent || ''
      previousContent.value = newContent || ''
    }
  }
)

// Keep font watchers
watch(
  () => fontStore.fontSize,
  () => {
    if (editableDiv.value) {
      editableDiv.value.style.fontSize = fontStore.fontSize || '14px'
    }
  }
)

watch(
  () => fontStore.fontFamily,
  () => {
    if (editableDiv.value) {
      editableDiv.value.style.fontFamily = fontStore.fontFamily || 'Arial, sans-serif'
    }
  }
)

onMounted(() => {
  if (editableDiv.value) {
    // Set initial content
    editableDiv.value.innerHTML = props.cell.content || ''
    previousContent.value = props.cell.content || ''

    // Set styles
    editableDiv.value.style.fontFamily = fontStore.fontFamily || 'Arial, sans-serif'
    editableDiv.value.style.fontSize = fontStore.fontSize || '14px'
  }
})
</script>

<style scoped>
.dev-texcell-wrapper {
  display: flex;
  flex-direction: column;
  padding: 0;
  background-color: var(--navbar-bg-color);
  background-color: var(--cell-bg-color);
  min-height: 2em;
}

.input-div {
  outline: none; /* Removes the default focus outline */
  flex: 1;
  line-height: 1.45;
  padding: 0.5em;
  min-height: 2em;
  height: fit-content; /* Adjust height based on content */
  min-width: 25%;
  background-color: var(--cell-bg-color);
  caret-color: initial;
}

.markdown-and-katex-renderd {
  flex: 1;
  width: 50%;
  border: 1px solid #ccc;
  padding: 10px;
  min-height: 150px;
}

.display-raw-html-from-markdown-katex {
  margin-top: 10px;
  width: 100%;
  border: 1px solid #ccc;
  padding: 10px;
}
</style>
