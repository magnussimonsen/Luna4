<!-- LunaLeftToolbar.vue 
 
This component implements the left toolbar for the application,
providing quick access to toggleable UI components such as the Table of Contents (TOC), Tabs,Variables, and Help. 
Each toggleable component is represented by a button that dynamically updates its state and appearance 
based on the active theme. 
The toolbar uses `LunaSuperButton` for its buttons and emits events to notify the parent component 
about toggled components. 

How to use:
Buttons are styled dynamically using the current theme. 
- Clicking a button toggles the corresponding component (e.g., TOC). 
- Emits a `toggleComponent` event with the selected component name when a button is clicked.  
- Accessible with icons that adapt to light and dark themes. 
-->

<template>
  <nav
    class="toolbar-base left-margin margin-bottom"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.menuFontSize || '14px'
    }"
  >
    <!-- Button for toggling Notebooks -->
    <LunaSuperButton
      :icon="currentTABSIcon"
      alt-text="Notebooks"
      return-string="notebooks"
      :is-selected="selectedButton === 'notebooks'"
      :extra-styling="true"
      title="Show list of notebooks"
      @click="handleButtonClick('notebooks')"
    />

    <!-- Button for toggling Help -->
    <LunaSuperButton
      :icon="currentHELPIcon"
      alt-text="Help"
      return-string="help"
      :is-selected="selectedButton === 'help'"
      :extra-styling="true"
      title="Show help information"
      @click="handleButtonClick('help')"
    />

    <!-- Button for toggling the Table of Contents (TOC) -->
    <LunaSuperButton
      :icon="currentTOCIcon"
      alt-text="TOC"
      return-string="toc"
      :is-selected="selectedButton === 'toc'"
      :extra-styling="true"
      title="Show table of contents"
      @click="handleButtonClick('toc')"
    />

    <!-- Button for toggling Variables -->
    <LunaSuperButton
      :icon="currentVARIABLESIcon"
      alt-text="Variables"
      return-string="variables"
      :is-selected="selectedButton === 'variables'"
      :extra-styling="true"
      title="Show list of variabels and fuctions in this notebook"
      @click="handleButtonClick('variables')"
    />
    <!-- Button for toggling bug reports-->
    <LunaSuperButton
      :icon="currentBugIcon"
      alt-text="Development bug report"
      return-string="bugReports"
      :is-selected="selectedButton === 'bugReports'"
      :is-global-bug="isGlobalBug"
      :extra-styling-bug="true"
      title="Report a bug"
      @click="handleButtonClick('bugReports')"
    />
  </nav>
</template>

<script setup>
/*
  Imports necessary libraries, components, and assets.
*/
import { ref, computed } from 'vue'
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useThemeStore } from '@/stores/Luna4ThemeStore.js'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import LunaSuperButton from '@/components/Luna4SuperButton.vue'
import TOCIcon from '@/assets/Icons/Luna_TOC.svg'
import HELPIcon from '@/assets/Icons/Luna_Help.svg'
import VARIABLESIcon from '@/assets/Icons/Luna_Variables.svg'
import TABSIcon from '@/assets/Icons/Luna_Notebooks.svg'
import TOCDarkIcon from '@/assets/Icons/Luna_TOC_CCCCCC.svg'
import HELPDarkIcon from '@/assets/Icons/Luna_Help_CCCCCC.svg'
import VARIABLESDarkIcon from '@/assets/Icons/Luna_Variables_CCCCCC.svg'
import TABSDarkIcon from '@/assets/Icons/Luna_Notebooks_CCCCCC.svg'
import BugIcon from '@/assets/Icons/Luna_Bug.svg'
import BugDarkIcon from '@/assets/Icons/Luna_Bug_CCCCCC.svg'

const fontStore = useFontStore()
const themeStore = useThemeStore()
const notebooksAndCellsStore = useNotebooksAndCellsStore()

const selectedButton = ref('') // Tracks which button is selected
const isGlobalBug = computed(() => {
  const bugStatus = notebooksAndCellsStore.isGlobalBug
  return bugStatus
})

const currentTOCIcon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? TOCDarkIcon : TOCIcon
})

const currentHELPIcon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? HELPDarkIcon : HELPIcon
})

const currentVARIABLESIcon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? VARIABLESDarkIcon : VARIABLESIcon
})

const currentTABSIcon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? TABSDarkIcon : TABSIcon
})

const currentBugIcon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? BugDarkIcon : BugIcon
})

const emit = defineEmits(['toggleComponent'])

const handleButtonClick = (component) => {
  // Toggle selection state
  if (selectedButton.value === component) {
    selectedButton.value = '' // Deselect if clicked again
  } else {
    selectedButton.value = component // Select new button
  }

  emit('toggleComponent', selectedButton.value)
}
</script>

<style scoped></style>
