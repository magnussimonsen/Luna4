// File: casLogHighlighter.js

/**
 * CodeMirror CAS Log Highlighter Extension
 * Provides specialized highlighting for "log" followed by any positive integer in CAS expressions.
 * This is a custom extension that highlights such patterns in blue.
 * It is separate from the main CAS highlighting to allow for more specific control.
 * This extension is used in conjunction with the main CAS highlighting.
 * It is not a replacement for it.
 * This extension is designed to work with the CodeMirror editor.
 * It uses the CodeMirror view API to create custom decorations.
 * The "log" followed by digits is highlighted with a bold blue color.
 */
import { EditorView, Decoration } from '@codemirror/view'
import { useThemeStore } from '@/stores/Luna4ThemeStore'

/**
 * Creates a custom extension that specifically highlights "log" followed by any positive integer
 */
export function casLogHighlighter() {
  return EditorView.decorations.of((view) => {
    const themeStore = useThemeStore()
    const isDarkMode = themeStore.isDarkMode
    const logColor = isDarkMode ? 'cyan' : 'blue' // Use light green for dark mode and green for light mode
    const fontWeight = isDarkMode ? 'normal' : 'bold' // Bold only in light mode

    const decorations = []
    const { doc } = view.state
    const content = doc.toString()

    // Find all "log" followed by any positive integer (excludes log0)
    // Modified regex: matches "log" followed by a non-zero digit and then any other digits
    const logRegex = /\blog([1-9]\d*)\b/g
    let match

    while ((match = logRegex.exec(content)) !== null) {
      const start = match.index
      const end = start + match[0].length

      decorations.push(
        Decoration.mark({
          class: 'cm-log-highlight',
          attributes: { style: `color: ${logColor}; font-weight: ${fontWeight};` }
        }).range(start, end)
      )
    }

    return Decoration.set(decorations)
  })
}
