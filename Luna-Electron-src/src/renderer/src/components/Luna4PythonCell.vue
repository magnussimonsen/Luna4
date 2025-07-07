<!-- Luna4PythonCell.vue-->
<template>
  <div class="cell-wrapper">
    <!-- Editable content area -->
    <div class="code-editor-container">
      <Luna4CodeMirrorComponent
        ref="codeMirrorComp"
        v-model="editorCode"
        :read-only="!isCellEditable"
        :cell="cell"
        language="python"
        @focus="setActiveCell"
        @blur="handleBlur"
        @error="handleEditorError"
        @update="updateContent"
      />
    </div>
    <!-- Error from toolbar component output area -->
    <div v-if="isToolbarError" class="output-text-div" style="color: red">
      Toolbar error: {{ toolbarError }}
    </div>
    <!-- Standard python error output area -->
    <div v-if="isWorkerError" class="output-text-div" style="color: red">
      Worker message: {{ pyOutObj.workerError }}
    </div>
    <!-- Standard python error output area -->
    <div v-if="isStderr" class="output-text-div" style="color: red">
      Standard error: {{ pyOutObj.stderr }}
    </div>
    <!-- Standard python text output area -->
    <pre
      v-if="isText && !isError"
      class="output-text-container"
      :style="{
        fontFamily: fontStore.codingFontFamily || 'Arial, sans-serif',
        fontSize: fontStore.fontSize || '14px'
      }"
      @copy="handleCopy"
      >{{ pyOutObj.stdoutText }} </pre
    >

    <!-- Display images if they exist -->
    <div v-if="isImage && !isError" class="output-image-container">
      <!-- Slider to scale python plots -->
      <input
        v-model="imageWidthPercent"
        type="range"
        min="25"
        max="100"
        step="1"
        style="transform-origin: 0 0; scale: 0.5"
      />
      <img
        v-for="(image, index) in pyOutObj.stdoutImages"
        :key="index"
        :src="image"
        class="output-image"
        :style="{ width: imageWidthPercent + '%' }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import Luna4CodeMirrorComponent from '@/components/Luna4CodeMirrorComponent.vue'
import handleCopy from '@/utils/handleCopy.js'
// import { convertToString } from '../utils/convertToString'

// Props
const props = defineProps({
  cell: { type: Object, required: true }
})

const fontStore = useFontStore()
const notebooksAndCellsStore = useNotebooksAndCellsStore()
const isCellEditable = computed(() => props.cell.editable && !props.cell.isCellReadOnlyForever)
const codeMirrorComp = ref(null)
const toolbarError = computed(() => props.cell.toolbarError)
const pyOutObj = computed(() => props.cell.pythonWorkerStdOutput) // Python output object
const editorCode = ref(
  props.cell.content && props.cell.content.value
    ? props.cell.content.value
    : 'print("Hello, Luna!")'
)
// Two-way computed property for imageWidthPercent.
// It reads the value from props.cell.imageWidthPercent and, on update,
// calls the global store's updateImageWidthPercent to persist the new value.
const imageWidthPercent = computed({
  get: () => props.cell.imageWidthPercent || 100,
  set: (newValue) => {
    notebooksAndCellsStore.updateCellPropVal(props.cell.id, [
      { key: 'imageWidthPercent', val: newValue }
    ])
  }
})
// Computed properties to determine if the cell has image output
const isImage = computed(() => {
  return (
    Array.isArray(pyOutObj.value.stdoutImages) &&
    pyOutObj.value.stdoutImages.length > 0 &&
    typeof pyOutObj.value.stdoutImages[0] === 'string' &&
    pyOutObj.value.stdoutImages[0].startsWith('data:image/png;base64,')
  )
})
// Computed property to determine if the cell has text output
const isText = computed(() => {
  return (
    pyOutObj.value.stdoutText &&
    pyOutObj.value.stdoutText.trim &&
    pyOutObj.value.stdoutText.trim().length > 0
  )
})

const isToolbarError = computed(() => Boolean(props.cell.toolbarError))
const isWorkerError = computed(() => Boolean(pyOutObj.value.workerError))
const isStderr = computed(() => Boolean(pyOutObj.value.stderr))
const isError = computed(() => isToolbarError.value || isWorkerError.value || isStderr.value)
// Helper method to update the codeMirror-input-code content in the store
const updateContent = () => {
  editorCode.value = editorCode.value || ''
  notebooksAndCellsStore.updateCellPropVal(props.cell.id, [
    { key: 'content', val: editorCode.value }
  ])
}

const setActiveCell = () => {
  notebooksAndCellsStore.setSelectedCell(props.cell.id)
}
function handleBlur() {
  notebooksAndCellsStore.selectedCellId = null
}
function handleEditorError(error) {
  console.error('CodeMirror error:', error)
}
</script>

<style scoped>
.cell-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: fit-content;
  padding: 0;
  background-color: var(--output-bg-color);
  margin-bottom: 1em;
  margin-top: 1em;
}

.code-editor-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0em 0em;
  margin: 0;
}

.code-editor-container:focus {
  border: 2px solid blue; /* Change to the color or style you prefer */
}

.output-text-container {
  padding: 1em 1em;
  margin: 1em;
  height: fit-content;
  background-color: var(--output-bg-color, white);
  color: var(--main-font-color, black);
  font-size: var(--coding-font-size, 14px);
  border: 0px solid black;
  white-space: pre-wrap; /* Preserve newlines from Python output */
}

.output-image-container {
  display: block;
  margin-left: 1.5em;
  line-height: 0;
  background-color: var(--cell-bg-color);
}

.output-image {
  display: block; /* ensures no inline baseline gap */
  width: 100%; /* The default size (when slider is at 100) */
  height: auto; /* let the browser scale height automatically */
  margin: 0; /* remove default margins */
  padding: 0;
}

/* Buttons */
.run-button {
  background-color: green;
  color: white;
  border: none;
  margin: 0px;
  cursor: pointer;
  border-radius: 2px;
}
.stop-button {
  background-color: red;
  color: white;
  border: none;
  margin: 0px;
  cursor: pointer;
  border-radius: 2px;
}
.disabled-button {
  background-color: gray;
  color: white;
  border: none;
  margin: 0px;
  border-radius: 2px;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
