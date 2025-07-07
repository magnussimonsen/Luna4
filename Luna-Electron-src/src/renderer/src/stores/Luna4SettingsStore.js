// File: Luna4SettingsStore.js
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settingsStore', {
  // State
  state: () => ({
    viewAsA4: true,
    showCellIndex: true,
    selectedMarkdownTheme: 'default', // Default Markdown Theme
    markdownThemes: [
      { name: 'Default', value: 'default', file: 'markdown-default.css' },
      { name: 'Right sided', value: 'right-aligned', file: 'markdown-right-aligned.css' }
    ],
    selectedDateFormat: 'DD.MM.YYYY hh:mm', // Default date format
    dateFormats: [
      { label: 'DD.MM.YYYY hh:mm', value: 'DD.MM.YYYY hh:mm' },
      { label: 'MM.DD.YYYY hh:mm', value: 'MM.DD.YYYY hh:mm' }
      // { label: 'DD.MM.YYYY hh:mm:ss', value: 'DD.MM.YYYY hh:mm:ss' },
      // { label: 'MM.DD.YYYY hh:mm:ss', value: 'MM.DD.YYYY hh:mm:ss' },
      // { label: 'DD.MM.YYYY hh:mm:ss.ms', value: 'DD.MM.YYYY hh:mm:ss.ms' },
      // { label: 'MM.DD.YYYY hh:mm:ss.ms', value: 'MM.DD.YYYY hh:mm:ss.ms' }
    ]
  }),

  // Actions
  getters: {
    /**
     * Returns the current Markdown theme.
     * @returns {string} The current Markdown theme.
     */
    getMarkdownTheme() {
      return this.selectedMarkdownTheme
    },

    /**
     * Returns the current date format.
     * @returns {string} The current date format.
     */
    getDateFormat() {
      return this.selectedDateFormat
    },

    /**
     * Returns the view as A4 setting
     * @returns {boolean} The viewAsA4 setting.
     */

    getViewAsA4() {
      return this.viewAsA4
    }
  },
  actions: {
    /**
     * Gets the viewAsA4 setting.
     * @returns {boolean} The viewAsA4 setting.
     */

    setViewAsA4(viewAsA4) {
      this.viewAsA4 = viewAsA4
    },

    /**
     * Toggles the A4 view setting.
     */
    toggleViewAsA4() {
      this.viewAsA4 = !this.viewAsA4
    },

    /**
     * Sets the Markdown theme and dynamically loads its CSS.
     * @param {string} themeValue - The theme value to set.
     */
    setMarkdownTheme(themeValue) {
      const theme = this.markdownThemes.find((theme) => theme.value === themeValue)
      if (theme) {
        this.selectedMarkdownTheme = theme.value
        const linkId = 'markdown-theme-stylesheet'
        let link = document.getElementById(linkId)
        const themePath = new URL(`/src/assets/themes/${theme.file}`, import.meta.url).href
        const cacheBuster = `?v=${new Date().getTime()}`
        if (link) {
          link.href = themePath + cacheBuster
        } else {
          link = document.createElement('link')
          link.id = linkId
          link.rel = 'stylesheet'
          link.href = themePath
          document.head.appendChild(link)
        }
        console.log('Loaded theme:', themePath) // Debug log
        localStorage.setItem('selectedMarkdownTheme', theme.value)
      } else {
        console.warn(`Markdown theme "${themeValue}" does not exist.`)
      }
    },

    /**
     * Sets the date format.
     * @param {string} format - The date format to set.
     */
    setDateFormat(format) {
      if (this.dateFormats.some((df) => df.value === format)) {
        this.selectedDateFormat = format
        localStorage.setItem('selectedDateFormat', format)
      } else {
        console.warn(`Invalid date format selected: ${format}`)
      }
    },

    /**
     * Initializes settings by loading preferences from localStorage.
     */
    initializeSettings() {
      const storedMarkdownTheme = localStorage.getItem('selectedMarkdownTheme')
      const storedDateFormat = localStorage.getItem('selectedDateFormat')

      if (
        storedMarkdownTheme &&
        this.markdownThemes.some((theme) => theme.value === storedMarkdownTheme)
      ) {
        this.setMarkdownTheme(storedMarkdownTheme)
      } else {
        this.setMarkdownTheme('default')
      }

      if (storedDateFormat && this.dateFormats.some((df) => df.value === storedDateFormat)) {
        this.selectedDateFormat = storedDateFormat
      }
    }
  }
})
