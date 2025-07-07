// src/renderer/src/codemirrorExtensions.js

import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { indentOnInput } from '@codemirror/language'
import { python } from '@codemirror/lang-python'
import rainbowBrackets from '@/assets/rainbowBrackets/rainbowBrackets.js'

export const basicExtensions = [
  keymap.of(defaultKeymap),
  // Line Numbers and Gutter Highlighting
  lineNumbers(),
  highlightActiveLineGutter(),
  // Update Listener to emit changes
  EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      // Handle updates here if needed
      // emit('update:modelValue', update.state.doc.toString())
    }
  }),
  // Editable configuration
  // EditorView.editable.of(true),
  indentOnInput(),
  python(),
  rainbowBrackets()
]
