<!-- File: Luna4RightToolbarTextCell.vue -->

<template>
  <div
    class="flex-main-row"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.fontSize || '14px'
    }"
  >
    <!-- Notebook selection dropdown for transferring a cell out of recycle bin -->
    <div>Plain text only (rich text editor support in development)</div>

    <!-- <div class="margin-left-auto">Buttons for other things</div> -->
  </div>
</template>

<script setup>
//import { ref } from 'vue'
import { useFontStore } from '@/stores/Luna4FontStore.js'
//import { useThemeStore } from '@/stores/Luna4ThemeStore.js'
//import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'

// Import components and icons.
//import LunaSuperButton from '@/components/Luna4SuperButton.vue'

//import DeleteIcon from '@/assets/icons/Luna_Delete.svg'
//import DeleteDarkIcon from '@/assets/icons/Luna_Delete_Dark.svg'
//import DeleteAllIcon from '@/assets/icons/Luna_Delete_All.svg'
//import DeleteAllDarkIcon from '@/assets/icons/Luna_Delete_All_Dark.svg'

const fontStore = useFontStore()
//const themeStore = useThemeStore()
//const notebooksAndCellsStore = useNotebooksAndCellsStore()
//const selectedButton = ref('')

//const handleButtonClick = async (value) => {
//  console.log('Selected option:', value)
//}
</script>

<style scoped>
.flex-main-row {
  display: flex;
  padding-left: 0.5em;
  padding-right: 0.5em;
  background-color: var(--right-toolbar-bg-color);
  align-items: center;
  max-height: 2.5em;
}

.margin-left-auto {
  margin-left: auto;
}
</style>
