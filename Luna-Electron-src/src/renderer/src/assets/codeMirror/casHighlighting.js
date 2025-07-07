import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { useThemeStore } from '@/stores/Luna4ThemeStore'

// Define highlight styles for both themes using only the most basic standard tags
const lightThemeHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: 'rgb(225, 110, 2)', fontWeight: 'bold' }, // keywords like solve, for, and
  { tag: tags.operator, color: 'blue', fontWeight: 'bold' }, // keywords of second rank diff, integral, series, sequence, limit, sum, round, simplify
  { tag: tags.variableName, color: 'blue', fontWeight: 'bold' }, // Functions like sin, cos, etc.
  { tag: tags.propertyName, color: 'rgb(208, 0, 255)', fontWeight: 'bold' }, //  operator :=
  { tag: tags.atom, color: 'cyan', fontWeight: 'bold' }, // Not used?
  { tag: tags.number, color: 'green', fontWeight: 'bold' }, // constants like pi, e, etc.
  { tag: tags.string, color: 'red' }, // Not used in CAS
  { tag: tags.comment, color: 'red' } // Not used in CAS
])

const darkThemeHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: 'orange' },
  { tag: tags.operator, color: 'cyan' },
  { tag: tags.variableName, color: 'cyan' },
  { tag: tags.propertyName, color: 'rgb(208, 0, 255)' },
  { tag: tags.atom, color: 'cyan', fontWeight: 'bold' },
  { tag: tags.number, color: 'lightgreen' },
  { tag: tags.string, color: '#CE9178' },
  { tag: tags.comment, color: '#6A9955' }
])

// Create a function that returns the appropriate highlighting based on current theme
export function getCasHighlighting() {
  const themeStore = useThemeStore()
  const isDarkMode = themeStore.isDarkMode

  // Add a try/catch to help diagnose any issues
  try {
    return syntaxHighlighting(isDarkMode ? darkThemeHighlight : lightThemeHighlight)
  } catch (error) {
    console.error('Error creating syntax highlighting:', error)
    // Provide an ultra-simple fallback highlighting
    const fallbackHighlight = HighlightStyle.define([
      { tag: tags.keyword, color: isDarkMode ? 'orange' : 'blue' }
    ])
    return syntaxHighlighting(fallbackHighlight)
  }
}

// Export a default highlighting for initial render
export const casHighlighting = syntaxHighlighting(lightThemeHighlight)

export { tags }
