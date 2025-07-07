<!--
  File: Luna4BugsReportSidebar.vue

  We might need to import { convertToString } from '../utils/convertToString.js'

   // Creates a global bug report of each type and pushes it to the globalBugReports array.
// --- BugReport Standard Object ---
//  type: 'error' | 'warning' | 'info'
//  bugReport = {
//   source: 'pyworker.js',
//   createdAt: new Date().toISOString(),
//   errorId: generateUniqueId(),
//   errorType: 'error',
//   errorLocation: 'self.addEventListener("message")',
//   customMessage: 'Error: event.data.type not equal to execute',
//   error: 'Unknown message type (not exexute): ' + convertToString(event.data.type)
-->
<template>
  <div
    class="sidebar-container"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.fontSize || '14px'
    }"
  >
    <h4>Bug Reports from Luna Code Base</h4>
    <p>
      Luna is a work in progress, and we appreciate your feedback. If you encounter any bugs or
      issues, please report them to <strong>www.luna4STEM.com</strong>.
    </p>

    <div v-if="isGlobalBug" class="bugs-header">List of bugs:</div>
    <div v-else>No bugs detected in Luna</div>

    <div class="bug-list">
      <div
        v-for="bug in bugArray"
        :key="bug.id"
        class="bug-item"
        :class="getBugTypeClass(bug.bugReport.errorType)"
      >
        <div class="bug-header">
          <span class="bug-time">{{ formatDate(bug.createdAt) }}</span>
          <span v-if="bug.bugReport.errorType" class="bug-type">{{ bug.bugReport.errorType }}</span>
        </div>
        <div class="bug-source">Source: {{ convertToString(bug.bugReport.source) }}</div>
        <div v-if="bug.bugReport.errorLocation" class="bug-location">
          Function: {{ convertToString(bug.bugReport.errorLocation) }}
        </div>
        <div v-if="bug.bugReport.customMessage" class="bug-message">
          {{ convertToString(bug.bugReport.customMessage) }}
        </div>
        <pre v-if="bug.bugReport.error" class="bug-error">
          <span class="error-label">Error:</span> {{ convertToString(bug.bugReport.error) }}
        </pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import { computed } from 'vue'
import { convertToString } from '../utils/convertToString.js'

const fontStore = useFontStore()
const notebooksAndCellsStore = useNotebooksAndCellsStore()
const isGlobalBug = computed(() => notebooksAndCellsStore.isGlobalBug)
const bugArray = computed(() => notebooksAndCellsStore.notebooks[0]?.globalBugReports)

// Format the date for better display
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString()
  } catch (e) {
    return dateString
  }
}

// Return CSS class based on error type
const getBugTypeClass = (errorType) => {
  if (!errorType) return 'bug-error-type'

  switch (errorType.toLowerCase()) {
    case 'warning':
      return 'bug-warning-type'
    case 'info':
      return 'bug-info-type'
    case 'error':
    default:
      return 'bug-error-type'
  }
}
</script>

<style scoped>
/* Sidebar container styling */
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 1em;
  box-sizing: border-box;
  background-color: var(--navbar-bg-color, #f9f9f9);
  color: var(--main-font-color, #000);
}

/* Bug list styling */
.bug-list {
  margin-top: 1em;
}

.bug-item {
  margin-bottom: 1em;
  padding: 0.75em;
  border-radius: 4px;
  background-color: var(--bug-bg-color, #fff1f1);
  border-left: 4px solid var(--bug-border-color, #ff6b6b);
}

/* Bug type styling */
.bug-error-type {
  border-left-color: #ff6b6b;
  background-color: #fff1f1;
}

.bug-warning-type {
  border-left-color: #ffc107;
  background-color: #fffbeb;
}

.bug-info-type {
  border-left-color: #4dabf7;
  background-color: #e7f5ff;
}

.bug-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5em;
}

.bug-time {
  font-size: 0.85em;
  color: var(--bug-time-color, #666);
}

.bug-timestamp {
  font-size: 0.85em;
  color: var(--bug-time-color, #666);
  margin-bottom: 0.5em;
}

.bug-type {
  font-size: 0.85em;
  font-weight: bold;
  text-transform: uppercase;
  padding: 0.15em 0.5em;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.1);
}

.bug-source {
  font-weight: bold;
  margin-bottom: 0.25em;
}

.bug-location {
  font-style: italic;
  margin-bottom: 0.25em;
  color: var(--bug-location-color, #555);
}

.bug-message {
  margin-bottom: 0.25em;
  padding: 0.2em 0;
  font-weight: 500;
}

.bug-custom {
  font-style: italic;
  margin-bottom: 0.25em;
  padding: 0.2em 0;
  color: var(--bug-custom-color, #555);
}

.bug-error {
  font-family: monospace;
  white-space: pre-wrap;
  padding: 0.5em;
  background-color: var(--bug-error-bg-color, rgba(0, 0, 0, 0.05));
  border-radius: 3px;
  overflow-x: auto;
  max-height: 200px;
  margin-top: 0.5em;
}

.error-label {
  font-weight: bold;
  color: #d32f2f;
}

.bugs-header {
  font-weight: bold;
  margin: 0.5em 0;
}
</style>
