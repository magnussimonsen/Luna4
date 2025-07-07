<!--
  --------------------------------------------------------------------
  File: C:\Users\magnu\Luna\Luna4\src\renderer\src\components\Luna4Navbar.vue
  --------------------------------------------------------------------
  Summary:
  The Luna4Navbar component provides the main navigation bar for the Luna4 application.
  It includes dropdown menus for file operations, editing, viewing, and inserting new cells.
  Additionally, it offers buttons for moving cells up or down, and integrates modals
  for settings and alerts. This component also handles keyboard shortcuts to streamline
  user actions and improve workflow efficiency.
-->

<template>
  <!-- ------------------------------------------------
       Template Explanation
       ------------------------------------------------
       The template displays a navigation bar containing:
       - Dropdown menus for File, Edit, View, and Insert actions.
       - Two buttons to move cells up and down.
       - Hidden modals for Settings and Alerts, accessible via actions.
       
       Font settings are dynamically applied based on the global font store.
  -->
  <nav
    class="luna-navbar"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.menuFontSize || '14px'
    }"
  >
    <!-- Dropdown Menus -->
    <LunaSuperDropdown
      :label="languageStore.getLocalizedString('fileStr')"
      :options="fileOptions"
      @select="handleSelect"
    />
    <LunaSuperDropdown
      :label="languageStore.getLocalizedString('editStr')"
      :options="editOptions"
      @select="handleSelect"
    />
    <!--<LunaSuperDropdown
      :label="languageStore.getLocalizedString('viewStr')"
      :options="viewOptions"
      @select="handleSelect"
    />-->
    <LunaSuperDropdown
      :label="languageStore.getLocalizedString('insertNewCellStr')"
      :options="insertOptions"
      @select="handleSelect"
    />

    <!-- Cell Movement Buttons -->

    <LunaSuperButton
      :style="{
        fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
        fontSize: fontStore.menuFontSize || '14px',
        fontWeight: 'bold' // Add desired font weight here
      }"
      :alt-text="languageStore.getLocalizedString('moveCellUpStr')"
      :is-selected="selectedButton === 'moveCellUp'"
      @click="handleButtonClick('moveCellUp')"
    />
    <LunaSuperButton
      :style="{
        fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
        fontSize: fontStore.menuFontSize || '14px',
        fontWeight: 'bold' // Add desired font weight here
      }"
      :alt-text="languageStore.getLocalizedString('moveCellDownStr')"
      :is-selected="selectedButton === 'moveCellDown'"
      @click="handleButtonClick('moveCellDown')"
    />
    <!-- Toggle Hide Show Cell Button -->
    <LunaSuperButton
      :style="{
        fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
        fontSize: fontStore.menuFontSize || '14px',
        backgroundColor: isSelectedCellInSelectedNotebook
          ? isVisible
            ? 'var(--selected-bg-color)'
            : 'var(--selected-hidden-cell-color)'
          : 'var(--navbar-bg-color)'
      }"
      :icon="currentVisibilityIcon ?? RedBugIcon"
      :alt-text="languageStore.getLocalizedString('toggleVisibilityStr')"
      @click="handleButtonClick('toggleVisibility')"
    />

    <!-- Toggle Read-Only Button -->
    <LunaSuperButton
      :style="{
        fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
        fontSize: fontStore.menuFontSize || '14px',
        backgroundColor: isSelectedCellInSelectedNotebook
          ? isCellEditable
            ? 'var(--selected-bg-color)'
            : 'var(--read-only-color)'
          : 'var(--navbar-bg-color)'
      }"
      :icon="currentLockIcon"
      :alt-text="languageStore.getLocalizedString('toggleReadOnlyStr')"
      @click="handleButtonClick('toggleEditable')"
    />

    <!--  View as A4 -->
    <LunaSuperButton
      :style="{
        fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
        fontSize: fontStore.menuFontSize || '14px'
      }"
      :icon="currentCropPortraitIcon"
      :alt-text="languageStore.getLocalizedString('cropPortraitStr')"
      :is-selected="settingsStore.viewAsA4"
      @click="settingsStore.setViewAsA4(true)"
    />
    <LunaSuperButton
      :style="{
        fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
        fontSize: fontStore.menuFontSize || '14px'
      }"
      :icon="currentAspectRatioIcon"
      :alt-text="languageStore.getLocalizedString('aspectRatioStr')"
      :is-selected="!settingsStore.viewAsA4"
      @click="settingsStore.setViewAsA4(false)"
    />
    <!-- Theme buttons -->
    <LunaSuperButton
      :style="{
        fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
        fontSize: fontStore.menuFontSize || '14px'
      }"
      :icon="currentLightMode"
      :alt-text="languageStore.getLocalizedString('lightModeStr')"
      :is-selected="!themeStore.isDarkMode"
      @click="setTheme('Light')"
    />
    <LunaSuperButton
      :style="{
        fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
        fontSize: fontStore.menuFontSize || '14px'
      }"
      :icon="currentDarkMode"
      :alt-text="languageStore.getLocalizedString('darkModeStr')"
      :is-selected="themeStore.isDarkMode"
      @click="setTheme('Dark')"
    />

    <!-- Modals for Settings and Alerts -->
    <ExportPdfForAssignmentHandinModal ref="exportPdfForAssignmentHandinModal" />
    <SettingsModal ref="settingsModal" />
    <LunaAlertModal ref="alertModal" />
  </nav>
</template>

<script setup>
/* ---------------------------------------------------------------------------
   Brief Summary
   ---------------------------------------------------------------------------
   This script section defines the Luna4Navbar component's logic, including:
    - Handling dropdown menu selections and button clicks.
    - Managing keyboard shortcuts for quick actions.
    - Lifecycle hooks for adding and removing event listeners.
    - Accessing global state and store instances.
    - Computed properties for dynamic styling and state checks.
   ------------------------------------------------------------------------
*/

// ------------------- Imports and Dependencies -------------------
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useFontStore } from '@/stores/Luna4FontStore.js'
//import { useThemeStore } from '@/stores/Luna4ThemeStore.js'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import { confirmCellDeletion } from '../utils/confirmationDialogHelpers'
import { useFileDropdownStore } from '@/stores/Luna4FileDropdownStore.js'
import { useEditDropdownStore } from '@/stores/Luna4EditDropdownStore.js'
import { useSettingsStore } from '@/stores/Luna4SettingsStore.js'
import { useInsertDropdownStore } from '@/stores/Luna4InsertDropdownStore.js'
import { useViewDropdownStore } from '@/stores/Luna4ViewDropdownStore.js'
import { useLanguageStore } from '@/stores/Luna4LanguageStore.js'
import { useThemeStore } from '@/stores/Luna4ThemeStore.js'
import LunaSuperDropdown from '@/components/Luna4SuperDropdown.vue'
import LunaSuperButton from '@/components/Luna4SuperButton.vue'
import SettingsModal from '@/components/Luna4SettingsModal.vue'
import LunaAlertModal from '@/components/Luna4AlertModal.vue'
import ExportPdfForAssignmentHandinModal from '@/components/Luna4ExportPdfForAssignmentHandinModal.vue'
import RedBugIcon from '@/assets/Icons/Luna_Red_Bug.svg'
import LightMode from '@/assets/icons/Luna_Partly_Cloudy_Day.svg'
import LightModeCCCCCC from '@/assets/icons/Luna_Partly_Cloudy_Day_CCCCCC.svg'
import DarkMode from '@/assets/icons/Luna_DArk_Mode.svg'
import DarkModeCCCCCC from '@/assets/icons/Luna_Dark_Mode_CCCCCC.svg'
import AspectRatioIcon from '@/assets/icons/Luna_Aspect_Ratio.svg'
import AspectRatioIconCCCCCC from '@/assets/icons/Luna_Aspect_Ratio_CCCCCC.svg'
import CropPortraitIcon from '@/assets/icons/Luna_Crop_Portrait.svg'
import CropPortraitIconCCCCCC from '@/assets/icons/Luna_Crop_Portrait_CCCCCC.svg'
import LockIcon from '@/assets/icons/Luna_Lock.svg'
import LockIconCCCCCC from '@/assets/icons/Luna_Lock_CCCCCC.svg'
import LockOpenIcon from '@/assets/icons/Luna_Lock_Open.svg'
import LockOpenIconCCCCCC from '@/assets/icons/Luna_Lock_Open_CCCCCC.svg'
import VisibilityIcon from '@/assets/icons/Luna_Visibility.svg'
import VisibilityIconCCCCCC from '@/assets/icons/Luna_Visibility_CCCCCC.svg'
import VisibilityOffIcon from '@/assets/icons/Luna_Visibility_Off.svg'
import VisibilityOffIconCCCCCC from '@/assets/icons/Luna_Visibility_Off_CCCCCC.svg'

// ------------------- Accessing Global State -------------------
const fontStore = useFontStore()
// const themeStore = useThemeStore()
const settingsStore = useSettingsStore()
const languageStore = useLanguageStore()

// Retrieve the notebooks/cells store and dropdown stores
const notebooksAndCellsStore = useNotebooksAndCellsStore()
const fileDropdownStore = useFileDropdownStore()
const editDropdownStore = useEditDropdownStore()
const insertDropdownStore = useInsertDropdownStore()
const viewDropdownStore = useViewDropdownStore()
const themeStore = useThemeStore()
// const deleteDropdownStore = useDeleteDropdownStore()

// Extract dropdown options from stores
const fileOptions = fileDropdownStore.options
const editOptions = editDropdownStore.options
const insertOptions = insertDropdownStore.options
const viewOptions = viewDropdownStore.options
// const deleteOptions = deleteDropdownStore.options

// ------------------- State Variables & References -------------------
const settingsModal = ref(null) // Reference to the SettingsModal component
const exportPdfForAssignmentHandinModal = ref(null) // Reference to the ExportPdfForAssignmentHandinModal component
const alertModal = ref(null) // Reference to the AlertModal component
const selectedButton = ref(null) // Tracks which cell movement button (if any) is currently selected
// ------------------- Computed read only -------------------
const selectedCellId = computed(() => {
  return notebooksAndCellsStore.selectedCellId
})

const isCellEditable = computed(() => {
  return notebooksAndCellsStore.isCellCurrentlyEditable
})

const isVisible = computed(() => {
  return notebooksAndCellsStore.getIsVisible(selectedCellId.value)
})

const isSelectedCellInSelectedNotebook = computed(() => {
  return notebooksAndCellsStore.isSelectedCellInSelectedNotebook
})

// Computed Properties for Dynamic Icon Selection
const currentLightMode = computed(() => {
  return themeStore.activeTheme === 'Dark' ? LightModeCCCCCC : LightMode
})

const currentDarkMode = computed(() => {
  return themeStore.activeTheme === 'Dark' ? DarkModeCCCCCC : DarkMode
})

const currentAspectRatioIcon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? AspectRatioIconCCCCCC : AspectRatioIcon
})

const currentCropPortraitIcon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? CropPortraitIconCCCCCC : CropPortraitIcon
})

const currentVisibilityIcon = computed(() => {
  const isVisible = notebooksAndCellsStore.getIsVisible(selectedCellId.value)
  if (isVisible) {
    return themeStore.activeTheme === 'Dark' ? VisibilityIconCCCCCC : VisibilityIcon
  } else if (!isVisible) {
    return themeStore.activeTheme === 'Dark' ? VisibilityOffIconCCCCCC : VisibilityOffIcon
  }
  return null
})

const currentLockIcon = computed(() => {
  if (isCellEditable.value) {
    return themeStore.activeTheme === 'Dark' ? LockOpenIconCCCCCC : LockOpenIcon
  }
  if (!isCellEditable.value) {
    return themeStore.activeTheme === 'Dark' ? LockIconCCCCCC : LockIcon
  }
  return null
})

// ------------------- Methods -------------------

async function handleSelect(selectedOptionObject) {
  // Structure for the navbar dropdown options:

  // if-tests for each dropdown category (file, edit, view, insert)

  // Check if the selected option is from the Insert dropdown
  // IMPORTENT NOTE: Input is an object, not a string
  if (insertOptions.some((option) => option.value === selectedOptionObject.value)) {
    switch (selectedOptionObject.value) {
      case 'Text':
        notebooksAndCellsStore.addCell('Text')
        break
      case 'Markdown':
        notebooksAndCellsStore.addCell('Markdown')
        break
      case 'Python':
        notebooksAndCellsStore.addCell('Python')
        break
      case 'CAS':
        notebooksAndCellsStore.addCell('CAS')
        break
      case 'Geometry':
        await alertModal.value.openModal('Geometry cells are not implemented yet.', 'message')
        break
      case 'GraphicalCalculator':
        await alertModal.value.openModal(
          'Graphical calculator cells are not implemented yet.',
          'message'
        )
        break
      case 'Spreadsheet':
        await alertModal.value.openModal('Spreadsheet cells are not implemented yet.', 'message')
        break
      case 'ProbabilityCalculator':
        notebooksAndCellsStore.addCell('ProbabilityCalculator')
        break
      case 'deleteSelectedCell':
        // Confirm cell deletion with an alert modal before proceeding
        await confirmCellDeletion(notebooksAndCellsStore, alertModal.value)
        break
      default:
        console.warn('Unhandled insert option:', selectedOptionObject.value)
    }
  } else if (fileOptions.some((option) => option.value === selectedOptionObject.value)) {
    // FILE DROPDOWN ACTIONS
    switch (selectedOptionObject.value) {
      case 'newFile':
        fileDropdownStore.newFile()
        break
      case 'openFile': {
        try {
          // await the Promise returned by openFile()
          const notebooksFromFile = await fileDropdownStore.openFile()
          if (!notebooksFromFile) {
            // If null, user canceled the file selection
            return
          }
          notebooksAndCellsStore.loadNotebooksFromFile(notebooksFromFile.content)
        } catch (err) {
          console.error('Error opening file:', err)
          await alertModal.value.openModal('Failed to open file', 'me')
        }
        break
      }
      case 'saveFile':
        fileDropdownStore.saveFile()
        break
      case 'saveFileAs':
        fileDropdownStore.saveFileAs()
        break
      case 'exportPDFAssignment':
        notebooksAndCellsStore.resetSelectedCellId()
        await exportPdfForAssignmentHandinModal.value.openModal()
        break
      case 'exportPDF':
        fileDropdownStore.exportPDF()
        break
      case 'settings':
        settingsModal.value.openModal()
        break
      case 'quit':
        fileDropdownStore.quit()
        break
      default:
        await alertModal.value.openModal('Unhandled file option:', 'message')
    }
  } else if (editOptions.some((option) => option.value === selectedOptionObject.value)) {
    // Edit dropdown actions (extend as needed)
    console.log('Edit option selected:', selectedOptionObject.value)
  } else if (viewOptions.some((option) => option.value === selectedOptionObject.value)) {
    // View dropdown actions (extend as needed)
    console.log('View option selected:', selectedOptionObject.value)
  } else {
    console.warn('Unhandled option:', selectedOptionObject.value)
  }
}

/**
 * handleShortcut
 * Captures keyboard events to perform actions quickly.
 * Supports Ctrl+number and Shift+Arrow for cell navigation and operations.
 * @param {KeyboardEvent} event - Triggered keyboard event.
 */

async function handleShortcut(event) {
  // Handle Ctrl-based shortcuts
  if (event.ctrlKey) {
    switch (event.key) {
      case '1':
        event.preventDefault()
        handleSelect({ value: 'Text' }) // Note the object (handleSelect expects an value)
        break

      case '2':
        event.preventDefault()
        handleSelect({ value: 'Markdown' })
        break
      case '3':
        event.preventDefault()
        handleSelect({ value: 'Python' }) // etc.
        break
      case '4':
        event.preventDefault()
        handleSelect({ value: 'CAS' })
        break
      case '5':
        event.preventDefault()
        handleSelect({ value: 'Geometry' })
        break
      case '6':
        event.preventDefault()
        handleSelect({ value: 'GraphicalCalculator' })
        break
      case '7':
        event.preventDefault()
        handleSelect({ value: 'Spreadsheet' })
        break
      case '8':
        event.preventDefault()
        handleSelect({ value: 'ProbabilityCalculator' })
        break
      case 'n':
        event.preventDefault()
        handleSelect({ value: 'newFile' })
        break
      case 'o':
        event.preventDefault()
        handleSelect({ value: 'openFile' })
        break
      case 's':
        event.preventDefault()
        handleSelect({ value: 'saveFile' })
        break

      case 'Delete':
        event.preventDefault()
        handleSelect({ value: 'deleteSelectedCell' })
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!notebooksAndCellsStore.selectedCellId) {
          await alertModal.value.openModal('No cell selected to move.', 'message')
          return
        }
        notebooksAndCellsStore.moveCell(notebooksAndCellsStore.selectedCellId, 'up')
        break
      case 'ArrowDown':
        event.preventDefault()
        if (!notebooksAndCellsStore.selectedCellId) {
          await alertModal.value.openModal('No cell selected to move.', 'message')
          return
        }
        notebooksAndCellsStore.moveCell(notebooksAndCellsStore.selectedCellId, 'down')
        break
      default:
        console.log('Unhandled Ctrl shortcut key:', event.key)
    }
  }
  // --------------------------------------------
  // Handle Shift-based shortcuts for navigation
  //---------------------------------------------
  if (event.shiftKey) {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        if (!notebooksAndCellsStore.selectedCellId) {
          await alertModal.value.openModal('No cell selected to navigate.', 'message')
          return
        }
        notebooksAndCellsStore.selectCellAbove(notebooksAndCellsStore.selectedCellId)
        break
      case 'ArrowDown':
        event.preventDefault()
        if (!notebooksAndCellsStore.selectedCellId) {
          await alertModal.value.openModal('No cell selected to navigate.', 'message')
          return
        }
        notebooksAndCellsStore.selectCellBelow(notebooksAndCellsStore.selectedCellId)
        break
      default:
        console.log('Unhandled Shift shortcut key:', event.key)
    }
  }
  // Handle Ctrl+Shift combinations
  if (event.ctrlKey && event.shiftKey) {
    switch (event.key.toLowerCase()) {
      case 's':
        event.preventDefault()
        handleSelect({ value: 'saveFileAs' })
        break
      case 'x':
        event.preventDefault()
        handleSelect({ value: 'settings' })
        break
      case 'a':
        event.preventDefault()
        handleSelect({ value: 'exportPDFAssignment' })
        break
      case 'q':
        event.preventDefault()
        handleSelect({ value: 'quit' })
        break
      // Other Ctrl+Shift shortcuts can be added here
      default:
        console.log('Unhandled Ctrl+Shift shortcut key:', event.key)
    }
    return // Exit early if it was a Ctrl+Shift combo
  }
}

/**
 * handleButtonClick
 * Executes actions for moving cells up or down based on the clicked button.
 * @param {string} action - Indicates the desired move action (e.g., 'moveCellUp', 'moveCellDown').
 */

function handleButtonClick(action) {
  // For actions that require a selected cell
  const cellDependentActions = ['moveCellUp', 'moveCellDown']
  if (cellDependentActions.includes(action) && !notebooksAndCellsStore.selectedCellId) {
    console.log('No cell selected for this action.')
    return
  }
  // Handle specific actions
  if (action === 'moveCellUp') {
    notebooksAndCellsStore.moveCell(notebooksAndCellsStore.selectedCellId, 'up')
  } else if (action === 'moveCellDown') {
    notebooksAndCellsStore.moveCell(notebooksAndCellsStore.selectedCellId, 'down')
  } else if (action === 'toggleEditable') {
    notebooksAndCellsStore.toggleSelectedCellEditable(notebooksAndCellsStore.selectedCellId)
  } else if (action === 'toggleVisibility') {
    notebooksAndCellsStore.toggleSelectedCellVisibility(notebooksAndCellsStore.selectedCellId)
  } else {
    console.warn('Unhandled button action:', action)
  }
  selectedButton.value = null // Reset the selected button state after action
}

// Function to set theme and save preference
function setTheme(themeName) {
  themeStore.setActiveTheme(themeName)
  //themeStore.activeTheme = themeName // Make sure both properties are updated
  localStorage.setItem('activeTheme', themeName)
}

// ------------------- Lifecycle Hooks -------------------
onMounted(() => {
  // Add keyboard event listener for shortcuts when component mounts
  document.addEventListener('keydown', handleShortcut)
})

onBeforeUnmount(() => {
  // Remove keyboard event listener when component unmounts
  document.removeEventListener('keydown', handleShortcut)
})
</script>

<style scoped>
.luna-navbar {
  display: flex;
  margin-left: 0.5em;
  gap: 0.2em;
  align-items: center;
  padding: 0.2em 0em 0.2em 0em;
  background-color: var(--navbar-bg-color);
  color: var(--main-font-color);
  min-width: max-content;
}
</style>
