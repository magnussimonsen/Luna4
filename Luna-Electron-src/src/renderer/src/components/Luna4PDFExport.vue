<template>
  <div class="pdf-export-container">
    <div class="pdf-notebook-content">
      <h1>{{ notebookTitle }}</h1>
      <!-- Only render the cells, nothing else -->
      <LunaCellWrapper v-for="cell in notebooksAndCellsStore.cells" :key="cell.id" :cell="cell" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import LunaCellWrapper from '@/components/Luna4CellWrapper.vue'

const notebooksAndCellsStore = useNotebooksAndCellsStore()

// Get the notebook ID from URL params
const urlParams = new URLSearchParams(window.location.search)
const notebookId = urlParams.get('notebook')

// Load the correct notebook
onMounted(() => {
  console.log('PDF Export - Notebook ID:', notebookId)
  if (notebookId) {
    notebooksAndCellsStore.setSelectedNotebook(notebookId)
  }
})

// Get notebook title
const notebookTitle = computed(() => {
  const notebook = notebooksAndCellsStore.notebooks.find((n) => n.id === notebookId)
  return notebook ? notebook.name : 'Notebook'
})
</script>

<style>
.pdf-export-container {
  width: 100%;
  min-height: 100vh;
  background-color: white;
  padding: 25mm 18mm;
  box-sizing: border-box;
}

.pdf-notebook-content {
  width: 100%;
  font-family: Arial, sans-serif;
}
</style>
