import { defineStore } from 'pinia'
import languageData from '@/assets/languageData.json'

// TO DO: Rewtire to an setup store?

export const useLanguageStore = defineStore('languageStore', {
  // State
  state: () => ({
    fallbackLanguage: 'English',
    selectedLanguage: 'English',
    availableLanguages: languageData.availableLanguages
  }),

  // Actions
  actions: {
    /**
     * Sets the selected language.
     * @param {string} newLanguage - The new language to set.
     */
    setLanguage(newLanguage) {
      if (this.availableLanguages.includes(newLanguage)) {
        this.selectedLanguage = newLanguage
        console.log(`Language "${newLanguage}" is selected.`)
      } else {
        console.warn(`Language "${newLanguage}" is not supported.`)
      }
    },

    getLanguage() {
      return this.selectedLanguage
    },

    /**
     * Gets the localized string for a given key.
     * @param {string} key - The key for the localized string.
     * @returns {string} - The localized string.
     */
    getLocalizedString(key) {
      return (
        languageData.translations[this.selectedLanguage]?.[key] ||
        languageData.translations[this.fallbackLanguage]?.[key] ||
        key
      )
    }
  }
})
