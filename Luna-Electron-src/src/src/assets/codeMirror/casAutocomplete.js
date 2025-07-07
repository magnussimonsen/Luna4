/**
 * File: casAutocomplete.js
 * CodeMirror CAS Autocomplete Extension
 * Provides specialized autocompletion for Computer Algebra System (CAS) operations.
 */

import { autocompletion, completeFromList } from '@codemirror/autocomplete'
import casFunctionsData from './casFunctions.json'
// import { useLanguageStore } from '@/stores/Luna4LanguageStore'
import { computed } from 'vue'
//const languageStore = useLanguageStore()

const casFunctions = computed(() => {
  //const selectedLanguage = languageStore.selectedLanguage
  //const fallbackLanguage = languageStore.fallbackLanguage
  return casFunctionsData['English']
  // For development we use English since other languages are not yet implemented
  // return casFunctionsData[selectedLanguage] || casFunctionsData[fallbackLanguage] || casFunctionsData["English"]
})

/**
 * Creates and configures the CodeMirror autocomplete extension for CAS operations.
 * @returns {Array} Array of extensions to apply to CodeMirror editor
 */
export function casAutocomplete() {
  return [
    autocompletion({
      override: [
        // Use completeFromList with our CAS functions
        (context) => completeFromList(casFunctions.value)(context)
      ],

      // Configure when autocompletion appears
      activateOnTyping: true,
      // Show completions after any of these characters
      activateAfterChars: /[A-Za-z.]$/,
      icons: true
    })
  ]
}
