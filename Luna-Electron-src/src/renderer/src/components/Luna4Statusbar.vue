<!-- File: StatusBar.vue
  The StatusBar component displays a footer-like status bar at the bottom of the application.
  It provides information about the currently selected cell (if any).
-->
<template>
  <footer
    class="statusbar"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: statusBarFontSize
    }"
  >
    <!-- Left Section: Cell Information -->
    <div
      class="status-left"
      :class="{
        'editable-bg': isEditable,
        'read-only-bg': !isEditable
      }"
    >
      <div v-if="notebooksAndCellsStore.selectedCell">
        {{ notebooksAndCellsStore.selectedCell.type }} {{ formattedCellCreatedDateAndTime }}
        {{ notebooksAndCellsStore.selectedCell.editable ? '(Editable)' : '(Read-only)' }}
      </div>

      <div v-else>No cell selected.</div>
    </div>
    <div class="center-container">
      <!-- Center Section: File name -->
      <div
        class="status-center"
        :class="{
          'saved-bg': notebooksAndCellsStore.isSaved && isFileName,
          'unsaved-bg': !notebooksAndCellsStore.isSaved || !isFileName
        }"
        title="Click to save file"
        @click="saveFile"
      >
        {{
          isFileName
            ? notebooksAndCellsStore.isSaved
              ? notebooksAndCellsStore.notebooks[0].fileName + ' (last saved ' + lastSaved + ')'
              : notebooksAndCellsStore.notebooks[0].fileName + ' (last saved ' + lastSaved + ')'
            : 'Clik here to save your work.'
        }}
      </div>

      <div
        class="autosave-status"
        :class="{
          'autosave-enabled-bg': isAutoSaveEnabled,
          'autosave-disabled-bg': !isAutoSaveEnabled
        }"
        title="Click to toggle autosave"
        @click="toggleAutoSave"
      >
        Autosave{{ isAutoSaveEnabled ? 's after ' + autoSaveThreshold + ' changes' : ' is off' }}
      </div>
    </div>
    <!-- Right Section: Auto-save status, Zoom slider, and Reset button -->
    <div class="status-right">
      <input
        id="zoom-slider"
        v-model="localZoomValue"
        type="range"
        max="200"
        min="50"
        class="custom-slider"
      />
      <div class="reset-zoom-div" title="Click to reset zoom to 100%" @click="localZoomValue = 100">
        Reset Zoom
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import { useFileDropdownStore } from '@/stores/Luna4FileDropdownStore.js'
import { formatDate } from '../utils/dateFormatter'

const props = defineProps({
  zoomValue: {
    type: [String, Number],
    default: 100
  }
})

// Declare the event using defineEmits
const emit = defineEmits(['update:zoomValue'])
// Create a local ref to bind the value from the prop
const localZoomValue = ref(props.zoomValue)
// Watch localInputValue changes to emit them upward
watch(localZoomValue, (newValue) => {
  emit('update:zoomValue', newValue)
})

// State Variables & References
const fontStore = useFontStore()
const notebooksAndCellsStore = useNotebooksAndCellsStore()
const fileDropdownStore = useFileDropdownStore()

// Computed Properties
const statusBarFontSize = computed(() => {
  return fontStore.statusbarFontSize || '11px'
})

const lastSaved = computed(() => {
  if (!notebooksAndCellsStore.lastSavedTimestamp) return ''
  const date = new Date(notebooksAndCellsStore.lastSavedTimestamp)
  return formatDate({ date: date, dateAndTimeFormat: 'timeOnly' })
})

const isFileName = computed(() => {
  return notebooksAndCellsStore.notebooks[0].fileName !== (null || undefined || '')
})

const isEditable = computed(() => {
  return notebooksAndCellsStore.selectedCell?.editable
})

const isAutoSaveEnabled = computed(() => {
  return notebooksAndCellsStore.getAutoSaveEnabled
})

const autoSaveThreshold = computed(() => {
  return notebooksAndCellsStore.getAutoSaveThreshold ?? 'off'
})

watch(
  () => notebooksAndCellsStore.getAutoSaveThreshold,
  (newValue) => {
    console.log('AutoSave Threshold changed:', newValue)
  }
)

/**
 * formattedCellDate
 * Returns the creation date of the selected cell formatted according to the user’s chosen date format.
 * If no cell is selected or creation date is unavailable, returns an empty string.
 */
const formattedCellCreatedDateAndTime = computed(() => {
  if (!notebooksAndCellsStore.selectedCell || !notebooksAndCellsStore.selectedCell.createdAt)
    return ''
  const date = new Date(notebooksAndCellsStore.selectedCell.createdAt)
  //return formatDate({ date: date, dateAndTimeFormat: 'useSettings' })
  return formatDate({
    date: date,
    dateAndTimeFormat: 'Dont show this date and time'
  })
})

/**
 * Toggles the autosave functionality between off and a threshold of 25 changes
 */
const toggleAutoSave = () => {
  if (isAutoSaveEnabled.value) {
    // If autosave is currently enabled, turn it off
    notebooksAndCellsStore.setAutoSaveThreshold('off')
    notebooksAndCellsStore.setAutoSaveEnabled(false)
  } else {
    // If autosave is currently disabled, enable it with threshold of 25
    notebooksAndCellsStore.setAutoSaveThreshold(25)
    notebooksAndCellsStore.setAutoSaveEnabled(true)
  }
}

const saveFile = () => {
  fileDropdownStore.saveFile()
}
</script>

<style scoped>
.statusbar {
  line-height: 0em;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--statusbar-bg-color);
  color: var(--main-font-color);
  box-sizing: border-box;
  max-height: auto;
  margin: 0;
  padding: 0;
  font-size: inherit;
  overflow: hidden;
  border-top: solid 1px black;
  position: relative;
}

.status-left {
  line-height: 1em;
  display: inline-block;
  color: var(--main-font-color);
  text-align: left;
  border-radius: 3px; /* Optional: adds rounded corners */
  padding: 0.5em 1em; /* Added vertical padding */
  user-select: none; /* Prevent text selection when clicking */
}

.center-container {
  display: flex;
  gap: 0em;
}

.status-center {
  line-height: 1em; /* Changed from 0em to give more height */
  display: inline-block;
  color: var(--main-font-color);
  padding: 0.5em 1em; /* Added vertical padding */
  border-radius: 0px; /* Optional: adds rounded corners */
  cursor: pointer; /* Add cursor pointer to indicate it's clickable */
  user-select: none; /* Prevent text selection when clicking */
  gap: 0em; /* Add gap between elements */
}

.status-right {
  line-height: 0em;
  display: flex;
  align-items: center;
  text-align: right;
  color: var(--main-font-color);
  user-select: none; /* Prevent text selection when clicking */
  gap: 1em;
}

.autosave-status {
  padding: 0.5em 0.8em; /* Added padding */
  border-radius: 0px; /* Optional: adds rounded corners */
  line-height: 1em; /* Add some height */
  cursor: pointer; /* Add cursor pointer to indicate it's clickable */
  user-select: none; /* Prevent text selection when clicking */
}

.autosave-status:hover {
  transform: scale(1); /* Scale up on hover */
}

/* Reset zoom div styling to match autosave-status */
.reset-zoom-div {
  padding: 0.5em 0.8em;
  border-radius: 4px;
  line-height: 1em;
  cursor: pointer;
  background-color: var(--statusbar-button-bg-color);
  color: var(--main-font-color);
  user-select: none; /* Prevent text selection when clicking */
}

.reset-zoom-div:hover {
  opacity: 0.9; /* Visual feedback on hover */
}

/* Background color classes */
.editable-bg {
  background-color: var(--statusbar-button-bg-color) !important;
}

.read-only-bg {
  background-color: var(--inactive-read-only-color) !important;
}

.saved-bg {
  background-color: var(--statusbar-button-bg-color) !important;
}

.unsaved-bg {
  background-color: var(--inactive-read-only-color) !important;
}

.autosave-enabled-bg {
  background-color: var(--statusbar-button-bg-color) !important;
}
.autosave-disabled-bg {
  background-color: var(--inactive-read-only-color) !important;
}

/* Custom slider styling */
.custom-slider {
  -webkit-appearance: none; /* Override default appearance */
  appearance: none;
  width: 100px;
  height: 8px;
  background: var(--secondary-color, var(--statusbar-button-bg-color));
  outline: none;
  border-radius: 4px;
  font-family: inherit;
  font-size: inherit;
  margin-right: 1em;
}

/* Style the track for webkit browsers */
.custom-slider::-webkit-slider-runnable-track {
  height: 8px;
  background: var(--secondary-color, #666);
  border-radius: 4px;
}

/* Style the thumb for webkit browsers */
.custom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--accent-color, #4caf50);
  border-radius: 50%;
  cursor: pointer;
  margin-top: -4px; /* Center thumb on track */
}

/* Focus state */
.custom-slider:focus {
  outline: none;
}
</style>
