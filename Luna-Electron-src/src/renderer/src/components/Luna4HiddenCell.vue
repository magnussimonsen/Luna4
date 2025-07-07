<!-- filepath: c:\Users\magnu\Luna\Luna4\src\renderer\src\components\Luna4CASCell.vue -->
<!-- Luna4CASCell.vue -->
<template>
  <pre class="cell-wrapper" :style="toggleVisibilityIconDynamicStyle">HIDDEN</pre>
</template>

<script setup>
import { computed } from 'vue'
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'

// Props
const props = defineProps({
  cell: { type: Object, required: true }
})

const selectedCellId = computed(() => props.cell.id)

const fontStore = useFontStore()
const notebooksAndCellsStore = useNotebooksAndCellsStore()

const isCellVisible = computed(() => {
  return notebooksAndCellsStore.getIsVisible(selectedCellId.value) || true
})

const isSelectedCellInSelectedNotebook = computed(() => {
  return notebooksAndCellsStore.isSelectedCellInSelectedNotebook
})

// ------------------- Dynamic styles -------------------

const toggleVisibilityIconDynamicStyle = computed(() => {
  let backgroundColor
  if (isSelectedCellInSelectedNotebook.value) {
    backgroundColor = isCellVisible.value
      ? 'var(--selected-bg-color)'
      : 'var(--selected-hidden-cell-color)'
  } else {
    backgroundColor = 'var(--navbar-bg-color)'
  }
  return {
    fontFamily: fontStore.codingFontFamily || 'Arial, sans-serif',
    fontSize: fontStore.fontSize || '14px',
    backgroundColor
  }
})
</script>

<style scoped>
.cell-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 1em;
  padding: 0;
  background-color: var(--selected-hidden-cell-color);
  margin-bottom: 1em;
  margin-top: 1em;
}
</style>
