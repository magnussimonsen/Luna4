import { defineStore } from 'pinia'
import {
  getThemeForMode,
  availableLightThemes,
  availableDarkThemes
} from '@/utils/codeMirrorThemes'

export const useThemeStore = defineStore('themeStore', {
  state: () => ({
    activeTheme: 'Light', // The global app color theme (light/dark)
    // CodeMirror theme selection - update defaults to themes we know exist
    codeMirrorThemeLight: 'tomorrow',
    codeMirrorThemeDark: 'dracula',
    selectedCodeMirrorTheme: getThemeForMode(false, 'tomorrow'), // Default light theme
    // Available color themes
    colorThemes: [
      { name: 'Light', value: 'Light' },
      { name: 'Dark', value: 'Dark' }
    ],
    // ThemeMirror themes mapping - these are the actual theme names from the thememirror package
    themeMirrorThemes: {
      light: availableLightThemes,
      dark: availableDarkThemes
    },
    // Common colors shared across all themes
    commonColors: {
      '--yes-bg-color': 'green',
      '--no-bg-color': '#8F4747',
      '--delete-bg-color': '#f08080',
      '--main-border-color': '#8f8e8d',
      '--left-toolbar-border-color': '#2B2B2B',
      '--delete-hover-bg-color': '#cd5c5c',
      '--border-radius': '2px',
      '--inactive-border-color': 'gray',
      '--highlighted-option-bg-color': '#C7F4C6',
      '--highlighted-option-font-color': '#000000',
      '--highlighted-option-hover-color': '#5CC55C',
      '--highlighted-option-font-hover-color': '#000000',
      '--modal-bg-color': '#696969'
    },

    // Theme-specific colors
    themes: {
      Light: {
        '--main-font-color': '#000000',
        '--run-stop-font-color': 'white',
        '--navbar-bg-color': 'whitesmoke',
        '--navbar-hover-bg-color': '#D9D9D9',
        '--navbar-hover-font-color': '#000000',
        '--statusbar-bg-color': 'lightgray',
        '--statusbar-button-bg-color': 'lightgreen',
        '--active-element-color': '#272727',
        '--read-only-color': '#FF5100',
        '--selected-hidden-cell-color': '#EE6CFF',
        '--not-selected-hidden-cell-color': '#EEC6FF',
        '--inactive-read-only-color': '#FAD8B3',
        '--dropdown-bg-color': 'lab(93.4 0 -0.02)',
        '--right-toolbar-bg-color': 'whitesmoke',
        '--active-border-color': 'black',
        '--selected-cell-border-color': 'lightgreen',
        '--selected-bg-color': 'lightgreen',
        '--not-selected-bg-color': 'whitesmoke',
        '--cell-bg-color': 'white',
        '--paper-bg-color': 'white',
        '--output-bg-color': 'whitesmoke',
        // Markdown-specific
        '--markdown-input-div-bg-color': 'honeydew',
        '--markdown-font-color': 'black',
        '--markdown-bg-color': '#ffffff',
        '--markdown-link-color': '#1E88E5',
        '--markdown-code-bg-color': '#f5f5f5',
        '--markdown-code-text-color': '#333333',
        '--markdown-quote-bg-color': 'white',
        '--markdown-quote-text-color': 'black',
        '--markdown-h1-underline-color': 'green'
      },
      Dark: {
        '--main-font-color': '#CCCCCC',
        '--run-stop-font-color': '#CCCCCC',
        '--navbar-bg-color': '#202020',
        '--navbar-hover-bg-color': '#535353',
        '--navbar-hover-font-color': '#dddddd',
        '--statusbar-bg-color': '#202020',
        '--statusbar-button-bg-color': 'darkgreen',
        '--active-element-color': '#d3d3d3',
        '--read-only-color': '#BD3F22',
        '--selected-hidden-cell-color': '#892097',
        '--not-selected-hidden-cell-color': '#45094D',
        '--inactive-read-only-color': '#492525',
        '--dropdown-bg-color': '#282828',
        '--right-toolbar-bg-color': '#202020',
        '--active-border-color': 'whitesmoke',
        '--selected-bg-color': 'darkgreen',
        '--not-selected-bg-color': 'black',
        '--selected-cell-border-color': 'darkgreen',
        '--cell-bg-color': '#161616',
        '--paper-bg-color': '#161616',
        '--output-bg-color': '#252525',
        // Markdown-specific
        '--markdown-input-div-bg-color': '#001F01',
        '--markdown-font-color': '#CCCCCC',
        '--markdown-bg-color': '#2e2e2e',
        '--markdown-link-color': '#90caf9',
        '--markdown-code-bg-color': '#444444',
        '--markdown-code-text-color': '#f0f0f0',
        '--markdown-quote-bg-color': '#444444',
        '--markdown-quote-text-color': '#dddddd',
        '--markdown-h1-underline-color': 'black'
      }
    }
  }),
  getters: {
    // Fix the duplicate name by renaming the getter
    isDarkMode: (state) => state.activeTheme === 'Dark',

    // Get the current CodeMirror theme extension
    currentCodeMirrorTheme(state) {
      // Use the appropriate theme based on mode instead of a single selectedTheme
      const themeToUse = this.isDarkMode ? state.codeMirrorThemeDark : state.codeMirrorThemeLight

      // Ensure the theme is correctly loaded for the current mode
      return getThemeForMode(this.isDarkMode, themeToUse)
    },

    // Get available themes based on current mode
    availableCodeMirrorThemes() {
      return this.themeMirrorThemes[this.isDarkMode ? 'dark' : 'light']
    }
  },
  actions: {
    getActiveTheme() {
      return this.activeTheme
    },
    /**
     * Sets the active theme and applies its colors to the document.
     * @param {string} themeName - Name of the theme (e.g., 'Light' or 'Dark').
     */
    setActiveTheme(themeName) {
      const themeColors = this.themes[themeName]
      if (!themeColors) {
        console.warn(`Theme "${themeName}" does not exist.`)
        return
      }
      this.activeTheme = themeName

      // Update isDarkMode based on theme
      const isDarkMode = themeName === 'Dark'

      // Don't set the codeMirrorTheme property directly here,
      // instead let the currentCodeMirrorTheme getter handle it

      const root = document.documentElement
      // Apply common colors
      Object.entries(this.commonColors).forEach(([key, val]) => {
        root.style.setProperty(key, val)
      })
      // Apply theme-specific colors
      Object.entries(themeColors).forEach(([key, val]) => {
        root.style.setProperty(key, val)
      })

      // Save theme preference
      localStorage.setItem('activeTheme', themeName)

      console.log(`Theme changed to ${themeName}, isDarkMode: ${isDarkMode}`)
    },

    /**
     * Sets the CodeMirror theme
     * @param {string} themeName - Name of the CodeMirror theme
     */
    setCodeMirrorTheme(themeName) {
      const availableThemes = this.themeMirrorThemes[this.isDarkMode ? 'dark' : 'light']

      // Verify the theme exists
      if (!availableThemes.includes(themeName)) {
        console.warn(`Theme "${themeName}" does not exist in the current mode.`)
        return
      }

      this.selectedCodeMirrorTheme = themeName
      this.codeMirrorTheme = getThemeForMode(this.isDarkMode, themeName)
      localStorage.setItem('selectedCodeMirrorTheme', themeName)
    },

    /**
     * Gets the current CodeMirror light theme
     * @returns {string} The name of the current light theme
     */
    getCodeMirrorLightTheme() {
      return this.codeMirrorThemeLight
    },

    /**
     * Sets the CodeMirror light theme
     * @param {string} themeName - Name of the CodeMirror light theme
     */
    setCodeMirrorLightTheme(themeName) {
      const availableThemes = this.themeMirrorThemes.light

      // Verify the theme exists
      if (!availableThemes.includes(themeName)) {
        console.warn(`Light theme "${themeName}" does not exist.`)
        return
      }

      this.codeMirrorThemeLight = themeName
      localStorage.setItem('codeMirrorLightTheme', themeName)

      // If current mode is light, update the current theme
      if (!this.isDarkMode) {
        this.selectedCodeMirrorTheme = themeName
        this.codeMirrorTheme = getThemeForMode(false, themeName)
        localStorage.setItem('selectedCodeMirrorTheme', themeName)
      }
    },

    /**
     * Gets the current CodeMirror dark theme
     * @returns {string} The name of the current dark theme
     */
    getCodeMirrorDarkTheme() {
      return this.codeMirrorThemeDark
    },

    /**
     * Sets the CodeMirror dark theme
     * @param {string} themeName - Name of the CodeMirror dark theme
     */
    setCodeMirrorDarkTheme(themeName) {
      const availableThemes = this.themeMirrorThemes.dark

      // Verify the theme exists
      if (!availableThemes.includes(themeName)) {
        console.warn(`Dark theme "${themeName}" does not exist.`)
        return
      }

      this.codeMirrorThemeDark = themeName
      localStorage.setItem('codeMirrorDarkTheme', themeName)

      // If current mode is dark, update the current theme
      if (this.isDarkMode) {
        this.selectedCodeMirrorTheme = themeName
        this.codeMirrorTheme = getThemeForMode(true, themeName)
        localStorage.setItem('selectedCodeMirrorTheme', themeName)
      }
    },

    /**
     * Initializes the theme by loading preferences from localStorage.
     */
    initializeTheme() {
      const storedColorTheme = null
      const storedLightTheme = null
      const storedDarkTheme = null
      const storedSelectedTheme = null
      // const storedColorTheme = localStorage.getItem('activeTheme')
      // const storedLightTheme = localStorage.getItem('codeMirrorLightTheme')
      // const storedDarkTheme = localStorage.getItem('codeMirrorDarkTheme')
      // const storedSelectedTheme = localStorage.getItem('selectedCodeMirrorTheme')

      // Load stored theme preferences
      if (storedLightTheme) {
        this.codeMirrorThemeLight = storedLightTheme
      }

      if (storedDarkTheme) {
        this.codeMirrorThemeDark = storedDarkTheme
      }

      // Set the selectedCodeMirrorTheme based on stored preference or active theme
      if (storedSelectedTheme) {
        this.selectedCodeMirrorTheme = storedSelectedTheme
      } else if (storedColorTheme === 'Dark') {
        this.selectedCodeMirrorTheme = this.codeMirrorThemeDark
      } else {
        this.selectedCodeMirrorTheme = this.codeMirrorThemeLight
      }

      // Apply the theme (this will apply the correct CodeMirror theme too)
      if (storedColorTheme && this.themes[storedColorTheme]) {
        this.setActiveTheme(storedColorTheme)
      } else {
        this.setActiveTheme('Light') // Default theme
      }
    }
  }
})
