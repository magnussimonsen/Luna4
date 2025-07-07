<!-- \Luna4\src\renderer\src\Luna4App.vue -->
<template>
  <div
    class="app-container"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.fontSize || '14px'
    }"
  >
    <div class="Navbar">
      <LunaNavbar />
    </div>
    <div class="left-and-right-toolbar-container">
      <LunaLeftToolbar @toggle-component="handleToggleComponent" />
      <LunaRightToolbarWrapper />
    </div>
    <div class="left-and-right-main-container">
      <!-- Left Panel: Dynamically displays selected component -->
      <div v-show="visibleComponent" class="left-main-container">
        <component :is="componentMap[visibleComponent]" />
      </div>
      <div id="right-main-content" class="right-main-container">
        <div
          id="right-main-content-wrapper"
          class="right-main-content-wrapper"
          :style="{
            transform: 'scale(' + zoomValue / 100 + ')',
            transformOrigin: 'top left',
            'min-width': isViewAsA4 ? 100 + '%' : (100 * 100) / zoomValue + '%',
            'max-width': isViewAsA4 ? 100 + '%' : (100 * 100) / zoomValue + '%'
          }"
        >
          <div v-if="!notebooksAndCellsStore.isHandIn" class="header-title">
            {{ notebooksAndCellsStore.selectedNotebook?.name }}
          </div>
          <p v-if="notebooksAndCellsStore.isHandIn" class="student-info">
            {{ notebooksAndCellsStore.notebooks[0]?.studentFirstName }}
            {{ notebooksAndCellsStore.notebooks[0]?.studentMiddleName }}
            {{ notebooksAndCellsStore.notebooks[0]?.studentLastName }}
            <br v-if="notebooksAndCellsStore.notebooks[0]?.assignmentTitle" />
            {{ notebooksAndCellsStore.notebooks[0]?.assignmentTitle }}
            <br v-if="notebooksAndCellsStore.notebooks[0]?.assignmentTimeStampFormatted" />
            {{ notebooksAndCellsStore.notebooks[0]?.assignmentTimeStampFormatted }}
          </p>
          <div :class="isViewAsA4 ? 'view-as-a4' : 'web-view'">
            <!--  <div v-if="isViewAsA4" class="page-break-indicators"></div> -->
            <div v-if="isRecycleBinSelected" class="recycle-bin-info">
              <strong>
                This is your recycle notebook. <br />
                All deleted cells end up here. <br />
                These cells are selectable, but not editable.
              </strong>
            </div>
            <!-- Always show the cells of the currently selected notebook -->
            <LunaCellWrapper
              v-for="cell in notebooksAndCellsStore.cells"
              id="cell-wrapper"
              :key="cell.id"
              :cell="cell"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- Status Bar: Displays application status at the bottom -->
    <LunaStatusBar :zoom-value="zoomValue" @update:zoom-value="updateZoomValue" />
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import { useSettingsStore } from '@/stores/Luna4SettingsStore.js'
//import { useThemeStore } from '@/stores/Luna4ThemeStore.js'
import LunaCellWrapper from '@/components/Luna4CellWrapper.vue'
import LunaNavbar from '@/components/Luna4Navbar.vue'
import LunaLeftToolbar from '@/components/Luna4LeftToolbar.vue'
import LunaRightToolbarWrapper from '@/components/Luna4RightToolbarWrapper.vue'
import LunaStatusBar from '@/components/Luna4StatusBar.vue'
import LunaTOCSidebar from '@/components/Luna4TOCSidebar.vue'
import LunaVariablesSidebar from '@/components/Luna4VariablesSidebar.vue'
import LunaHelpSidebar from '@/components/Luna4HelpSidebar.vue'
import LunaNotebooksSidebar from '@/components/Luna4NotebooksSidebar.vue'
import LunaBugReportsSidebar from '@/components/Luna4BugReportsSidebar.vue'

// Reactive state to track currently visible component in the left panel
const visibleComponent = ref('')
const notebooksAndCellsStore = useNotebooksAndCellsStore()
const settingsStore = useSettingsStore()
const fontStore = useFontStore()
//const themeStore = useThemeStore()

// Map of component names to their respective Vue components:
//  This enables dynamic rendering in the left panel based on the selected component.

const componentMap = {
  toc: LunaTOCSidebar,
  variables: LunaVariablesSidebar,
  help: LunaHelpSidebar,
  notebooks: LunaNotebooksSidebar,
  bugReports: LunaBugReportsSidebar
}

/* 
  Toggles visibility of a selected component in the left panel:
  - If the component is already visible, hide it.
  - Otherwise, set it as the visible component.
*/
function handleToggleComponent(component) {
  if (visibleComponent.value === component) {
    visibleComponent.value = '' // Hide the component
  } else {
    visibleComponent.value = component // Show the selected component
  }
}

const isViewAsA4 = computed(() => {
  return settingsStore.viewAsA4 === true
})

const isRecycleBinSelected = computed(() => {
  return notebooksAndCellsStore.selectedNotebookId === notebooksAndCellsStore.notebooks[0].id
})
const zoomValue = ref(100)
function updateZoomValue(newVal) {
  zoomValue.value = newVal
}
const maxContainerWidth = ref(0) // Maximum width of the container
const maxContainerHeight = ref(0) // Maximum height of the container

// This will set the max width and height based on the viewport size
onMounted(() => {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // Limit scaling to prevent overflow
  maxContainerWidth.value = viewportWidth * 0.95 // 95% of the viewport width
  maxContainerHeight.value = viewportHeight * 0.95 // 95% of the viewport height
})
</script>

<style scoped>
/* Main container styling */
.app-container {
  display: flex; /* Enables flex layout for vertical stacking */
  flex-direction: column; /* Stack elements vertically */
  height: 100vh; /* Full viewport height */
  overflow: hidden; /* Prevents scrollbars on the main container */
  background-color: var(--navbar-bg-color);
}

/* Toolbars: Align elements and provide space between items */
.left-and-right-toolbar-container {
  display: flex; /* Enables flex layout for horizontal alignment */
  align-items: center; /* Aligns items vertically */
  background-color: var(--navbar-bg-color);
  padding: 0em 0em 0em 0em;
  gap: 0.5em;
  box-shadow: 0 3px 2px rgba(0, 0, 0, 0.2);
}

/* Main content area: Ensures proper layout and hides overflow */
.left-and-right-main-container {
  display: flex; /* Enables horizontal layout for panels and cells */
  flex: 1; /* Allows the main content to take up remaining space */
  width: 100%;
  overflow: hidden; /* Prevents unintended scrollbars */
  background-color: transparent; /* Theme background color */
  padding: 0em;
}

/* Left panel: Flexible and resizable area for side components */
.left-main-container {
  background-color: var(--navbar-bg-color); /* Theme background color */
  overflow: hidden; /* Prevents the parent from scrolling */
  width: 30%; /* Default width */
  min-width: 25%; /* Minimum allowed width */
  max-width: 75%; /* Maximum allowed width */
  resize: horizontal; /* Allows user to resize horizontally */
  border: 0.1em solid black; /* Adds a subtle divider */
  box-sizing: border-box; /* Includes border in element's total width */
  border-radius: var(--border-radius, 2px); /* Fallback to 2px if not set */
  padding-left: 0.5em;
  margin: 0.5em;
  display: flex; /* Enables flex layout for column */
  flex-direction: column; /* Stack children vertically */
}

/* Cells container: Vertical scrolling and proper spacing for cells */
.right-main-container {
  flex: 1; /* Takes up available horizontal space */
  overflow-x: hidden;
  overflow-y: auto; /* Enables vertical scrolling */
  height: auto; /* Ensures the container fills the height */
  width: 100%; /* Ensures the container fills the width */
  margin-right: 1em;
  display: flex;
  flex-direction: column;
  box-sizing: border-box; /* Includes border in element's total width */
  border-radius: var(--border-radius, 2px); /* Fallback to 2px if not set */
  background-color: none;
  word-wrap: break-word;
}

.right-main-content-wrapper {
  /* This is the scaled content container */
  /*height: max-content; /* or use auto, depending on your needs    */
  transform-origin: top left; /* ensures scaling is from the top-left corner */
  margin: 1em 1em 1em 1em;
  position: relative; /* Ensure proper offset calculations */
  height: 100%; /* Ensure it has a defined height */
}

/* Target only the cells within the right-main-content-wrapper no margins*/
.web-view {
  background-color: transparent;
  margin: 0em 1em 1em 0em;
}

/* Status bar: Anchored to the bottom with no shrink behavior */
.statusbar {
  flex-shrink: 0; /* Ensures it doesn't shrink */ /*Redundant?*/
  overflow: hidden; /* Prevents the parent from scrolling */
}

.recycle-bin-info {
  padding: 0.5em;
  color: var(--main-font-color);
}

/* Base styles for an A4 paper view */
.view-as-a4 {
  width: calc(210mm * 1); /* Scaled to 90% of A4 width for visual preview */
  background-color: var(--paper-bg-color); /* Simulates the appearance of paper */
  border: 1px solid #000000; /* Provides a clear boundary for better visibility */
  box-shadow: 2px 4px 5px rgba(0, 0, 0, 0.5); /* Adds depth with a subtle shadow */
  padding: 25mm 18mm 25mm 18mm; /* Top, Right, Bottom, Left A4-padding */

  border: none;
}

.header-title,
.student-info {
  display: none;
}

/* Page setup for printing */
@page {
  size: A4 portrait;
  padding: 0;
  margin: 25mm 25mm 25mm 25mm; /* Top, Right, Bottom, Left  A4 margin*/
  background-color: white;
}

@media print {
  body {
    overflow: visible !important;
  }

  .app-container {
    overflow: visible !important;
    height: auto !important;
    width: calc(210mm * 1);
  }

  /* Fix header/footer elements */
  .header-title {
    display: block !important;
    font-size: 0.9em;
    margin: 1em;
    background-color: var(--paper-bg-color);
    color: var(--main-font-color);
    text-align: left;
  }

  .student-info {
    display: block !important;
    font-size: 1.1em;
    font-weight: normal;
    margin: 1em;
    background-color: white;
    color: rgb(32, 32, 32);
    text-align: left;
  }

  /* Hide non-essential elements when printing */
  .Navbar,
  .left-and-right-toolbar-container,
  .left-main-container,
  .recycle-bin-info,
  .statusbar {
    display: none;
  }

  /* Reset transformations and margins for print */
  .right-main-container * {
    transform: scale(1) !important;
    overflow-y: hidden !important;
  }

  .right-main-container {
    margin: 0 !important;
    padding: 0 !important;
    background-color: var(--paper-bg-color) !important;
  }

  .right-main-content-wrapper {
    margin: 0 !important;
    padding: 0 !important;
    background-color: var(--paper-bg-color) !important;
    background-color: white !important;
  }

  .view-as-a4,
  .web-view {
    width: 210mm;
    margin: 0;
    padding: 0;
    border: none !important;
    box-shadow: none !important;
  }
}
</style>
