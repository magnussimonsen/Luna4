// File: casEqualsHighlighter.js

/**
 * CodeMirror CAS Equals Sign Highlighter Extension
 * Provides specialized highlighting for equals signs in CAS expressions.
 * This is a custom extension that highlights equals signs in orange.
 * It is separate from the main CAS highlighting to allow for more specific control.
 * This is useful for distinguishing between different types of operators.
 * This extension is used in conjunction with the main CAS highlighting.
 * It is not a replacement for it.
 * This extension is designed to work with the CodeMirror editor.
 * It uses the CodeMirror view API to create custom decorations.
 * The equals sign is highlighted with a bold orange color.
 */
import { EditorView, Decoration } from '@codemirror/view'
import { useThemeStore } from '@/stores/Luna4ThemeStore'
/**
 * Creates a custom extension that specifically highlights equals signs
 */
export function casEqualsHighlighter() {
  return EditorView.decorations.of((view) => {
    const themeStore = useThemeStore()
    const isDarkMode = themeStore.isDarkMode
    const equalsColor = isDarkMode ? 'orange' : 'rgb(225, 110, 2)' // Use orange for both light and dark modes
    const fontWeight = isDarkMode ? 'normal' : 'bold' // Bold only in light mode

    const decorations = []
    const { doc } = view.state
    const content = doc.toString()

    // Find all equals signs
    const equalsRegex = /([=])/g
    let match

    while ((match = equalsRegex.exec(content)) !== null) {
      const start = match.index
      const end = start + match[0].length

      decorations.push(
        Decoration.mark({
          class: 'cm-equals-highlight',
          attributes: { style: `color: ${equalsColor}; font-weight: ${fontWeight};` }
        }).range(start, end)
      )
    }

    return Decoration.set(decorations)
  })
}
