// File: Luna4FontStore.js

import { defineStore } from 'pinia'
import { watch } from 'vue'

export const useFontStore = defineStore('fontStore', {
  // State
  state: () => ({
    fontFamily: "'Arimo', Arial, sans-serif",
    menuFontSize: '14px',
    statusbarFontSize: '11px',
    fontSize: '14px', // Where is this used? WorkspaceFontsize? Why do I wase my life on this?
    fontSizes: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 34].map(
      (size) => `${size}px`
    ),
    codingFontFamily: "'Fira Code', serif",
    codingFontSize: '14px',
    availableFontFamilies: [
      { name: 'Arial', value: "'Arial', sans-serif" },
      { name: 'Fira Code', value: "'Fira Code', serif" },
      { name: 'Comic Sans', value: "'Comic Sans MS', sans-serif" },
      { name: 'Comic Neue', value: "'Comic Neue', cursive" },
      { name: 'Georgia', value: "'Georgia', serif" },
      { name: 'OpenDyslexic', value: "'OpenDyslexic', sans-serif" },
      { name: 'Roboto', value: "'Roboto', Arial, sans-serif" },
      { name: 'Times New Roman', value: "'Times New Roman', serif" },
      { name: 'Verdana', value: "'Verdana', sans-serif" },
      { name: 'Arimo', value: "'Arimo', Arial, sans-serif" }
    ].sort((a, b) => a.name.localeCompare(b.name)),
    availableCodingFontFamilies: [
      { name: 'Arial', value: "'Arial', sans-serif" },
      { name: 'Fira Code', value: "'Fira Code', serif" },
      { name: 'Comic Sans', value: "'Comic Sans MS', sans-serif" },
      { name: 'Comic Neue', value: "'Comic Neue', cursive" },
      { name: 'Courier New', value: "'Courier New', monospace" },
      { name: 'OpenDyslexic', value: "'OpenDyslexic', sans-serif" },
      { name: 'Roboto', value: "'Roboto', Arial, sans-serif" }
    ].sort((a, b) => a.name.localeCompare(b.name))
  }),

  // Actions
  actions: {
    /**
     * Updates the primary font family used across general UI text.
     * @param {string} font - The new font family for general UI text.
     */
    setFontFamily(font) {
      this.fontFamily = font
    },

    /**
     * Updates the font family used in coding contexts like code cells.
     * @param {string} font - The new font family for code cells (e.g., "'Fira Code', monospace").
     */
    setCodingFontFamily(font) {
      this.codingFontFamily = font
    },

    /**
     * Initializes font settings from localStorage and sets up watchers.
     */
    initializeFonts() {
      const storedFontSize = localStorage.getItem('fontSize')
      const storedMenuFontSize = localStorage.getItem('menuFontSize')
      const storedFontFamily = localStorage.getItem('fontFamily')
      const storedCodingFontFamily = localStorage.getItem('codingFontFamily')

      if (storedFontSize) this.fontSize = storedFontSize
      if (storedMenuFontSize) this.menuFontSize = storedMenuFontSize
      if (storedFontFamily) this.fontFamily = storedFontFamily
      if (storedCodingFontFamily) this.codingFontFamily = storedCodingFontFamily

      // Setup watchers to persist changes
      watch(
        () => this.fontSize,
        (newValue) => {
          localStorage.setItem('fontSize', newValue)
        },
        { immediate: true }
      )

      watch(
        () => this.menuFontSize,
        (newValue) => {
          localStorage.setItem('menuFontSize', newValue)
        },
        { immediate: true }
      )

      watch(
        () => this.fontFamily,
        (newValue) => {
          localStorage.setItem('fontFamily', newValue)
        },
        { immediate: true }
      )

      watch(
        () => this.codingFontFamily,
        (newValue) => {
          localStorage.setItem('codingFontFamily', newValue)
        },
        { immediate: true }
      )
    }
  }
})
