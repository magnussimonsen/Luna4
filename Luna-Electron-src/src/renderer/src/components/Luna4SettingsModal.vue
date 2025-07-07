<!-- Luna4SettingsModal.vue -->
<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content" @click.stop>
      <button class="close-button" @click="closeModal">×</button>

      <h3>Settings</h3>

      <div class="form-grid">
        <!-- Column 1 -->
        <div class="form-column-one">
          <!-- Font Size Selection -->
          <div class="form-row">
            <label for="font-size-select">Workspace font Size:</label>
            <select
              id="font-size-select"
              v-model="fontStore.fontSize"
              class="select-column-one"
              style="font-size: 14px"
            >
              <option v-for="size in fontStore.fontSizes" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>

          <!-- Menu font Size Selection -->
          <div class="form-row">
            <label for="menu-font-size-select">Top menu font Size:</label>
            <select
              id="menu-font-size-select"
              v-model="fontStore.menuFontSize"
              class="select-column-one"
              style="font-size: 14px"
            >
              <option v-for="size in fontStore.fontSizes" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>

          <!-- Statusbar font Size Selection -->
          <div class="form-row">
            <label for="statusbar-font-size-select">Statusbar font Size:</label>
            <select
              id="statusbar-font-size-select"
              v-model="fontStore.statusbarFontSize"
              class="select-column-one"
              style="font-size: 14px"
            >
              <option v-for="size in fontStore.fontSizes" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>

          <!-- Font Family Selection -->
          <div class="form-row">
            <label for="font-family-select">Main font Family:</label>
            <select
              id="font-family-select"
              v-model="fontStore.fontFamily"
              class="select-column-one"
              style="font-size: 14px"
            >
              <option
                v-for="font in fontStore.availableFontFamilies"
                :key="font.value"
                :value="font.value"
              >
                {{ font.name }}
              </option>
            </select>
          </div>

          <!-- Coding font Family Selection -->
          <div class="form-row">
            <label for="coding-font-family-select">Coding font Family:</label>
            <select
              id="coding-font-family-select"
              v-model="fontStore.codingFontFamily"
              class="select-column-one"
              style="font-size: 14px"
            >
              <option
                v-for="font in fontStore.availableCodingFontFamilies"
                :key="font.value"
                :value="font.value"
              >
                {{ font.name }}
              </option>
            </select>
          </div>

          <!-- Global app color Theme Selection -->
          <div class="form-row">
            <label for="color-theme-select">Global Color Theme:</label>
            <select
              id="color-theme-select"
              v-model="themeStore.activeTheme"
              class="select-column-one"
              style="font-size: 14px"
              @change="themeStore.setActiveTheme($event.target.value)"
            >
              <option
                v-for="theme in themeStore.colorThemes"
                :key="theme.value"
                :value="theme.value"
              >
                {{ theme.name }}
              </option>
            </select>
          </div>

          <!-- Python Light Theme Selection -->
          <div class="form-row">
            <label for="python-light-theme-select">Python Light Theme:</label>
            <select
              id="python-light-theme-select"
              :value="themeStore.getCodeMirrorLightTheme()"
              class="select-column-one"
              style="font-size: 14px"
              @change="themeStore.setCodeMirrorLightTheme($event.target.value)"
            >
              <option
                v-for="theme in themeStore.themeMirrorThemes.light"
                :key="theme"
                :value="theme"
              >
                {{ theme }}
              </option>
            </select>
          </div>

          <!-- Python Dark Theme Selection -->
          <div class="form-row">
            <label for="python-dark-theme-select">Python Dark Theme:</label>
            <select
              id="python-dark-theme-select"
              :value="themeStore.getCodeMirrorDarkTheme()"
              class="select-column-one"
              style="font-size: 14px"
              @change="themeStore.setCodeMirrorDarkTheme($event.target.value)"
            >
              <option
                v-for="theme in themeStore.themeMirrorThemes.dark"
                :key="theme"
                :value="theme"
              >
                {{ theme }}
              </option>
            </select>
          </div>

          <!-- Markdown Theme Selection -->
          <div class="form-row">
            <label for="markdown-theme-select">Markdown Theme:</label>
            <select
              id="markdown-theme-select"
              v-model="settingsStore.selectedMarkdownTheme"
              class="select-column-one"
              style="font-size: 14px"
              @change="settingsStore.setMarkdownTheme($event.target.value)"
            >
              <option
                v-for="theme in settingsStore.markdownThemes"
                :key="theme.value"
                :value="theme.value"
              >
                {{ theme.name }}
              </option>
            </select>
          </div>

          <!-- Show/Hide Cell Index -->
          <div class="form-row">
            <label for="cell-index-checkbox">Show Cell Index:</label>
            <input
              id="cell-index-checkbox"
              v-model="settingsStore.showCellIndex"
              class="input-column-two"
              type="checkbox"
            />
          </div>

          <!-- Future Checkbox Example -->

          <div class="form-row">
            <label for="future-checkbox">Enable Delete Cell Warning :</label>
            <input
              id="future-checkbox"
              v-model="settingsStore.enableFutureFeature"
              class="input-column-two"
              type="checkbox"
            />
          </div>
        </div>

        <!-- Column 2 -->
        <div class="form-column-two">
          <!-- Language Selection -->
          <div class="form-row">
            <label for="language-select">Language:</label>
            <select
              id="language-select"
              v-model="languageStore.selectedLanguage"
              class="select-column-two"
              style="font-size: 14px"
              @change="languageStore.setLanguage($event.target.value)"
            >
              <option v-for="lang in languageStore.availableLanguages" :key="lang" :value="lang">
                {{ lang }}
              </option>
            </select>
          </div>

          <!-- Date Format Selection -->
          <div class="form-row">
            <label for="date-format-select">Date Format:</label>
            <select
              id="date-format-select"
              v-model="dateFormat"
              class="select-column-two"
              style="font-size: 14px"
            >
              <option
                v-for="format in settingsStore.dateFormats"
                :key="format.value"
                :value="format.value"
              >
                {{ format.label }}
              </option>
            </select>
          </div>

          <!-- Auto-Save Settings -->
          <div class="form-row">
            <label for="auto-save-select">Auto-Save:</label>
            <select
              id="auto-save-select"
              v-model="autoSaveSetting"
              class="select-column-two"
              style="font-size: 14px"
            >
              <option value="off">Off</option>
              <option value="10">After 10 changes</option>
              <option value="25">After 25 changes</option>
              <option value="50">After 50 changes</option>
              <option value="50">After 75 changes</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useSettingsStore } from '@/stores/Luna4SettingsStore.js'
import { useThemeStore } from '@/stores/Luna4ThemeStore.js'
import { useLanguageStore } from '@/stores/Luna4LanguageStore.js'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'

// Access global theme, font, settings, and notebooks stores
const fontStore = useFontStore()
const settingsStore = useSettingsStore()
const themeStore = useThemeStore()
const languageStore = useLanguageStore()
const notebooksAndCellsStore = useNotebooksAndCellsStore()

const dateFormat = computed({
  get: () => settingsStore.selectedDateFormat,
  set: (value) => settingsStore.setDateFormat(value)
})

// Modal visibility control
const isVisible = ref(false)

// Auto-Save Settings - Replace the ref with a computed property
const autoSaveSetting = computed({
  get: () => {
    const threshold = notebooksAndCellsStore.getAutoSaveThreshold
    return threshold !== undefined ? threshold.toString() : 'off'
  },
  set: (newValue) => {
    console.log('AutoSave Setting changed to:', newValue)
    if (newValue === 'off') {
      notebooksAndCellsStore.setAutoSaveEnabled(false)
      notebooksAndCellsStore.setAutoSaveThreshold('off')
    } else {
      notebooksAndCellsStore.setAutoSaveEnabled(true)
      notebooksAndCellsStore.setAutoSaveThreshold(parseInt(newValue))
    }
  }
})

// Methods
const openModal = () => {
  isVisible.value = true
}

const closeModal = () => {
  isVisible.value = false
}

const handleEscKey = (event) => {
  if (event.key === 'Escape') closeModal()
}

// Lifecycle Hooks
onMounted(() => {
  window.addEventListener('keydown', handleEscKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscKey)
})

// Expose Methods to Parent
defineExpose({
  openModal
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 0.5em;
  border-radius: 0px;
  max-width: 750px;
  min-width: 500px;
  position: relative;
  color: var(--text-color, #000);
  font-family: 'Arial', sans-serif;
  font-size: 12px;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-color, #000);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two columns */
  grid-template-rows: auto; /* Automatic row height */
  gap: 1em;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.5em;
}

.form-row label {
  padding-right: 0.5em;
  min-width: fit-content;
}

.select-column-one,
.select-column-two {
  margin-left: auto;
  padding: 0.2em;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
}

.select-column-one {
  min-width: 50px;
  max-width: 170px; /* Explicit width for dropdowns */
}

.select-column-two {
  width: fit-content;
}

.input-column-two {
  margin-left: auto;
  padding: 0.2em;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  width: fit-content;
}
</style>
