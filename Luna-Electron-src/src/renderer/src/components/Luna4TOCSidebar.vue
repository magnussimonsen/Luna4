<!-- Luna4TableOfContents.vue -->
<template>
  <div
    class="luna-toc"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.fontSize || '14px'
    }"
  >
    <h4>Table of Contents</h4>
    <p v-if="tocHeadings.length === 0">(No headings found in current notebook)</p>

    <ul v-else class="toc-list">
      <li
        v-for="(heading, index) in tocHeadings"
        :key="index"
        class="toc-item"
        :style="{ marginLeft: heading.level - 1 + 'em' }"
        @click="goToHeading(heading.cellId)"
      >
        {{ heading.text }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'

const fontStore = useFontStore()
const notebooksAndCellsStore = useNotebooksAndCellsStore()

/**
 * A computed list of headings extracted from the current notebook's markdown cells.
 * Each heading is an object: { level: Number, text: String, cellId: String }
 */
const tocHeadings = computed(() => {
  const notebook = notebooksAndCellsStore.selectedNotebook
  if (!notebook) return []

  const headings = []
  for (const cell of notebook.cells) {
    // Only parse if it's a Markdown cell
    if (cell.type === 'Markdown') {
      // Split the cell content into lines
      const lines = cell.content.split('\n')
      for (const line of lines) {
        // Regex: match one or more '#' at start, followed by space(s) and text
        const match = line.match(/^(#+)\s+(.*)/)
        if (match) {
          const level = match[1].length // heading level (1=#, 2=##, etc.)
          const text = match[2].trim() // actual heading text
          headings.push({
            level,
            text,
            cellId: cell.id // store which cell this heading is from
          })
        }
      }
    }
  }
  return headings
})

/**
 * Select the cell in the store, so the user can see/edit it.
 */
function goToHeading(cellId) {
  console.log('Navigating to cellId:', cellId)

  const element = document.getElementById(cellId)
  const container = document.getElementById('right-main-content') // Target container

  if (element && container) {
    console.log('Element found:', element)
    console.log('Scrolling within container:', container)

    // Calculate the element's position relative to the container
    const elementTop = element.offsetTop - container.offsetTop

    // Scroll the container to the element's position
    container.scrollTo({
      top: elementTop, // Scroll to the element's vertical position within the container
      behavior: 'smooth' // Smooth scrolling
    })
  } else {
    if (!element) {
      console.error('Element not found for cellId:', cellId)
    }
    if (!container) {
      console.error('Container with id="right-main-content-wrapper" not found.')
    }
  }
}
</script>

<style scoped>
.luna-toc {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 1em;
  color: var(--main-font-color, #000);
  box-sizing: border-box;
}

.toc-list {
  list-style: none;
  padding-left: 0;
}

.toc-item {
  line-height: 1.4;
  margin-bottom: 0.3em;
  cursor: pointer; /* Indicate this is clickable */
}
.toc-item:hover {
  text-decoration: underline;
}
</style>
