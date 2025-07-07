import { EditorView, Decoration } from '@codemirror/view'
import { useThemeStore } from '@/stores/Luna4ThemeStore'

/**
 * Creates a custom extension that specifically highlights E and I constants
 * This is needed because the parser doesn't recognize these as special tokens
 */
export function casConstantHighlighter() {
  return EditorView.decorations.of((view) => {
    const themeStore = useThemeStore()
    const isDarkMode = themeStore.isDarkMode
    const fontWeight = isDarkMode ? 'normal' : 'bold' // Bold only in light mode
    const color = isDarkMode ? 'lightgreen' : 'green' // Use light green for dark mode and green for light mode
    const decorations = []
    const { doc } = view.state
    const content = doc.toString()

    // Find all standalone E and I constants (not part of other identifiers)
    const constantRegex = /\b([ei])\b/g
    let match

    while ((match = constantRegex.exec(content)) !== null) {
      const start = match.index
      const end = start + match[0].length

      decorations.push(
        Decoration.mark({
          class: 'cm-constant-highlight',
          attributes: { style: `color: ${color}; font-weight: ${fontWeight};` }
        }).range(start, end)
      )
    }

    return Decoration.set(decorations)
  })
}
