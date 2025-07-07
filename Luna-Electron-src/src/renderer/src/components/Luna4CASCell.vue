<!-- filepath: c:\Users\magnu\Luna\Luna4\src\renderer\src\components\Luna4CASCell.vue -->
<!-- Luna4CASCell.vue -->
<template>
  <div class="cell-wrapper">
    <!-- Editable content area -->
    <div class="code-editor-container">
      <CASCodeMirrorComponent
        ref="CAScodeMirrorComp"
        v-model="casInput"
        :read-only="!isCellEditable"
        :cell="cell"
        @focus="setActiveCell"
        @blur="handleBlur"
        @error="handleEditorError"
        @update="updateContent"
      />
    </div>

    <!-- Error output area -->
    <pre v-if="isError" class="output-text-div" style="color: red">
      Test Error
    </pre>

    <!-- Standard text output area -->
    <div
      v-if="apiErrorString || toolbarError"
      class="output-text-container"
      :style="{
        fontFamily: fontStore.codingFontFamily || 'Arial, sans-serif',
        fontSize: fontStore.fontSize || '14px'
      }"
      @copy="handleCopy"
    >
      Please check your input and try again. <br />
      The syntax for the solve command is:<br />
      solve equation1 and equation2 and ... for x1 and x2...<br />
      For example:<br />
      solve x**2+4*x+4=0 for x or <br />
      solve x**2+y**2=1 and x = y for x and y
    </div>

    <!-- Latex Principal Solution output-->

    <div
      v-if="showLatexSolutions"
      class="markdown-and-katex-rendered"
      :style="{
        fontFamily: fontStore.codingFontFamily || 'Arial, sans-serif',
        fontSize: fontStore.fontSize || '14px'
      }"
      @copy="handleCopy"
    >
      {{ latexSolutions }}
    </div>

    <div
      v-if="showPrincipalSolution"
      class="markdown-and-katex-rendered"
      :style="{
        fontFamily: fontStore.codingFontFamily || 'Arial, sans-serif',
        fontSize: fontStore.fontSize || '14px'
      }"
      @copy="handleCopy"
    >
      <LunaMarkdownRenderer
        :content="'Principal solution: $' + latexSolutions + '$'"
        :font-size="fontStore.fontSize"
        :font-family="fontStore.codingFontFamily"
        :cell-id="props.cell.id"
        :is-cell-editable="isCellEditable"
      />
    </div>

    <!-- Latex General Solution output-->
    <div
      v-if="showGeneralSolution"
      class="markdown-and-katex-rendered"
      :style="{
        fontFamily: fontStore.codingFontFamily || 'Arial, sans-serif',
        fontSize: fontStore.fontSize || '14px'
      }"
      @copy="handleCopy"
    >
      <LunaMarkdownRenderer
        :content="'General solution: $' + latexSolutionSet + '$' || 'No general solution found'"
        :font-size="fontStore.fontSize"
        :font-family="fontStore.codingFontFamily"
        :cell-id="props.cell.id"
        :is-cell-editable="isCellEditable"
      />
    </div>

    <!-- Display images if they exist -->
    <div v-if="isImage && !isAnyError" class="output-image-container">
      <!-- Slider to scale plots -->
      <input
        v-model="imageWidthPercent"
        type="range"
        min="25"
        max="100"
        step="1"
        style="transform-origin: 0 0; scale: 0.5"
      />
      <img
        v-for="(image, index) in props.cell.stdoutImages"
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
import CASCodeMirrorComponent from '@/components/Luna4CASCodeMirrorComponent.vue'
import LunaMarkdownRenderer from '@/components/LunaMarkdownRenderer.vue'

// Props
const props = defineProps({
  cell: { type: Object, required: true }
})

const fontStore = useFontStore()
const notebooksAndCellsStore = useNotebooksAndCellsStore()
//const isSelectedCell = computed(() => notebooksAndCellsStore.selectedCellId === props.cell.id)
const isCellEditable = computed(() => props.cell.editable && !props.cell.isCellReadOnlyForever)
const CAScodeMirrorComp = ref(null)
const casInput = ref(props?.cell?.content.value)

const imageWidthPercent = computed({
  get: () => props.cell.imageWidthPercent || 100,
  set: (newValue) => {
    notebooksAndCellsStore.updateCellPropVal(props.cell.id, [
      { key: 'imageWidthPercent', val: newValue }
    ])
  }
})

// --------------------------------
// Get all solutions from the store
// --------------------------------

//const solutions = computed(() => {
//  return notebooksAndCellsStore.selectedCell.sympyVariablesObject.solutions || 'Solution undefined'
//})

const latexSolutions = computed(() => {
  return props.cell.sympyVariablesObject.latexSolutions
})

const showPrincipalSolution = computed(() => {
  return props.cell.showPrincipalSolution
})

const showGeneralSolution = computed(() => {
  return props.cell.showGeneralSolution
})

const latexSolutionSet = computed(() => {
  return props.cell.sympyVariablesObject.latexSolutionSet
})

const apiErrorString = computed(() => {
  return props.cell.apiErrorString || ''
})

const toolbarError = computed(() => {
  return props.cell.toolbarError
})

//const selectedToolbarButton = computed(() => notebooksAndCellsStore.casToolbarButtonClicked)
const isError = false

// Computed property to determine if the cell has image output
const isImage = computed(() => {
  return (
    props.cell.stdoutImages &&
    props.cell.stdoutImages.length > 0 &&
    props.cell.stdoutImages[0].startsWith('data:image/png;base64,')
  )
})

// Helper method to update the codeMirror-input-code content in the store
const updateContent = () => {
  casInput.value = casInput.value ?? ''
  notebooksAndCellsStore.updateCellPropVal(props.cell.id, [{ key: 'content', val: casInput.value }])
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

// Computed properties

// Function to handle copying only plain text
function handleCopy(event) {
  event.preventDefault()
  const selection = window.getSelection()
  const selectedText = selection.toString()

  // Set only the plain text to the clipboard
  if (selectedText) {
    navigator.clipboard
      .writeText(selectedText)
      .catch((err) => console.error('Failed to copy text: ', err))
  }
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
  border: 2px solid blue;
}

.output-text-container {
  padding: 0.5em;
  margin: 0.5em;
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

/* Rendered markdown and LaTeX styling */
.markdown-and-katex-rendered {
  flex: 1;
  padding: 0 0.5em;
  margin: 0;
  min-height: 2.5em;
  height: fit-content; /* Adjust height based on content */
  width: 100%;
  min-width: 25%;
  background-color: var(--cell-bg-color);
  color: var(--markdown-font-color, #000000);
  cursor: not-allowed !important;
  z-index: 10000;
}

.layout-toggle-container {
  z-index: 1000;
}
</style>
