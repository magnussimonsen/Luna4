/**
 * CodeMirror Theme Utilities
 *
 * Bridge between ThemeMirror package and our application's theme system.
 */

import { EditorView } from '@codemirror/view'

// Direct imports from thememirror (only importing what we know exists)
import {
  solarizedLight,
  dracula,
  amy,
  ayuLight,
  clouds,
  espresso,
  noctisLilac,
  rosePineDawn,
  smoothy,
  tomorrow,
  barf,
  boysAndGirls,
  coolGlow,
  bespin,
  birdsOfParadise,
  cobalt
} from 'thememirror'

// Import all themes to log available ones
import * as thememirror from 'thememirror'

// Create fallback themes for both light and dark modes
const fallbackLightTheme = EditorView.theme({
  '&': { backgroundColor: '#ffffff', color: '#000000' },
  '.cm-content': { caretColor: '#000000' },
  '.cm-cursor': { borderLeftColor: '#000000' },
  '.cm-gutters': { backgroundColor: '#f5f5f5', color: '#6c6c6c' },
  '.cm-activeLineGutter': { backgroundColor: '#e2f2ff' }
})

const fallbackDarkTheme = EditorView.theme({
  '&': { backgroundColor: '#1e1e1e', color: '#d4d4d4' },
  '.cm-content': { caretColor: '#d4d4d4' },
  '.cm-cursor': { borderLeftColor: '#d4d4d4' },
  '.cm-gutters': { backgroundColor: '#1e1e1e', color: '#858585' },
  '.cm-activeLineGutter': { backgroundColor: '#333333' }
})

// Debug what's available in the thememirror package
try {
  console.log('Available ThemeMirror themes:', Object.keys(thememirror))
} catch (error) {
  console.warn('Could not log ThemeMirror themes:', error.message)
}

// Simple theme map with verified themes only
const themeMap = {
  'solarized-light': solarizedLight || fallbackLightTheme,
  'ayu-light': ayuLight || fallbackLightTheme,
  clouds: clouds || fallbackLightTheme,
  espresso: espresso || fallbackLightTheme,
  'noctis-lilac': noctisLilac || fallbackLightTheme,
  'rose-pine-daw': rosePineDawn || fallbackLightTheme,
  smoothy: smoothy || fallbackLightTheme,
  tomorrow: tomorrow || fallbackLightTheme,
  dracula: dracula || fallbackDarkTheme,
  amy: amy || fallbackDarkTheme,
  barf: barf || fallbackDarkTheme,
  'boys-and-girls': boysAndGirls || fallbackDarkTheme,
  'cool-glow': coolGlow || fallbackDarkTheme,
  bespin: bespin || fallbackDarkTheme,
  'birds-of-paradise': birdsOfParadise || fallbackDarkTheme,
  cobalt: cobalt || fallbackDarkTheme
}

// Categorize themes into light and dark
const lightThemes = [
  'solarized-light',
  'ayu-light',
  'clouds',
  'espresso',
  'noctis-lilac',
  'rose-pine-daw',
  'smoothy',
  'tomorrow'
]
// the dark themes in the themeMap object
const darkThemes = [
  'dracula',
  'amy',
  'barf',
  'boys-and-girls',
  'cool-glow',
  'bespin',
  'birds-of-paradise',
  'cobalt'
]

/**
 * Returns the appropriate CodeMirror theme extension
 * @param {boolean} isDarkMode - Whether dark mode is active
 * @param {string} themeName - The name of the theme to use
 * @returns {Extension} The CodeMirror theme extension
 */
export function getThemeForMode(isDarkMode, themeName) {
  console.log(`Getting theme: ${themeName} for mode: ${isDarkMode ? 'dark' : 'light'}`)

  // Default themes if none specified
  if (!themeName || !themeMap[themeName]) {
    themeName = isDarkMode ? 'dracula' : 'solarized-light'
  }

  // Get the theme extension
  const themeExtension = themeMap[themeName]

  if (!themeExtension) {
    console.warn(`Theme "${themeName}" not found, using fallback`)
    return isDarkMode ? fallbackDarkTheme : fallbackLightTheme
  }

  return themeExtension
}

// Export theme lists for UI components
export const availableLightThemes = lightThemes
export const availableDarkThemes = darkThemes
export const availableThemes = [...availableLightThemes, ...availableDarkThemes]

/**
 * Provides a list of all available themes for the current mode.
 * @param {boolean} isDarkMode - Whether to get dark themes
 * @returns {string[]} - Array of theme names available for the mode
 */
export function getAvailableThemesForMode(isDarkMode) {
  return isDarkMode ? availableDarkThemes : availableLightThemes
}
