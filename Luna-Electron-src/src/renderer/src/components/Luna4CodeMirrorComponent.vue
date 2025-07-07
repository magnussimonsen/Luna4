<!-- Luna4CodeMirrorComponent.vue -->
<template>
  <div ref="editorContainer" class="code-editor" :style="editorStyles"></div>
</template>

<script>
import { pythonLintExtension } from '@/assets/codeMirror/pythonLinter.js' // Import the Python linter
import { defineComponent, onMounted, ref, watch, onBeforeUnmount, computed } from 'vue'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { useFontStore } from '@/stores/Luna4FontStore.js' // Import the font store
import { useThemeStore } from '@/stores/Luna4ThemeStore.js' // Import the theme store
import rainbowBrackets from '@/assets/rainbowBrackets/rainbowBrackets.js'
import { defaultKeymap } from '@codemirror/commands'
import { indentOnInput } from '@codemirror/language'
import { python } from '@codemirror/lang-python'

export default defineComponent({
  name: 'Luna4CodeMirrorComponent',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    readOnly: {
      // Should be made into a computed property in order to take into account the readOnlyForever prop
      type: Boolean,
      default: false
    },
    cell: {
      type: Object,
      default() {
        return { message: 'prop "cell" in code mirror is not working' }
      }
    },
    language: {
      type: String,
      default: 'python'
    }
  },
  emits: ['update:modelValue', 'update'],
  setup(props, { emit }) {
    const modelValue = ref(props.cell.content || '')
    const editorContainer = ref(null)
    let view = null
    // Compartment for theme reconfiguration
    const themeCompartment = new Compartment()
    const readOnlyCompartment = new Compartment()
    // Font and theme stores
    const fontStore = useFontStore()
    const themeStore = useThemeStore()
    // Use the ThemeMirror theme from the store instead of custom themes
    const editorStyles = computed(() => ({
      '--cm-font-family': fontStore.codingFontFamily,
      '--cm-font-size': fontStore.fontSize
    }))

    // Get language extension based on prop
    const getLanguageExtension = () => {
      switch (props.language.toLowerCase()) {
        case 'python':
        case 'py':
          return python()
        default:
          return python()
      }
    }

    // Watch for active theme changes
    watch(
      () => themeStore.activeTheme,
      () => {
        if (view) {
          // Explicitly reconfigure with the current theme when global theme changes
          view.dispatch({
            effects: themeCompartment.reconfigure(themeStore.currentCodeMirrorTheme)
          })
        }
      }
    )

    // Watch for specific theme changes
    watch(
      () => [themeStore.codeMirrorThemeLight, themeStore.codeMirrorThemeDark],
      () => {
        if (view) {
          view.dispatch({
            effects: themeCompartment.reconfigure(themeStore.currentCodeMirrorTheme)
          })
        }
      }
    )

    onMounted(() => {
      const state = EditorState.create({
        doc: modelValue.value,
        extensions: [
          // Default Keybindings
          keymap.of(defaultKeymap),
          // Line Numbers and Gutter Highlighting
          lineNumbers(),
          highlightActiveLineGutter(),
          // Indentation Handling
          indentOnInput(),
          // Language Support based on props
          getLanguageExtension(),
          rainbowBrackets(),
          // Use ThemeMirror theme from the store
          themeCompartment.of(themeStore.currentCodeMirrorTheme),
          // Use compartment for readOnly
          readOnlyCompartment.of(EditorView.editable.of(!props.readOnly)),
          // Lint extension for Python syntax errors
          props.language.toLowerCase() === 'python' ? pythonLintExtension : [],
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newValue = update.state.doc.toString()
              emit('update:modelValue', newValue)
              emit('update') // Emit the event that triggers updateContent
              console.log('Emitting update:modelValue in codeMirrorComponent', newValue)
            }
          })
        ]
      })

      view = new EditorView({
        state,
        parent: editorContainer.value
      })
    })

    watch(
      () => props.readOnly,
      (newValue) => {
        if (view) {
          view.dispatch({
            effects: readOnlyCompartment.reconfigure(EditorView.editable.of(!newValue))
          })
        }
      }
    )

    // Watch for external modelValue changes and update the editor
    watch(
      () => props.modelValue,
      (newValue) => {
        if (!view) return
        const currentValue = view.state.doc.toString()
        if (newValue !== currentValue) {
          view.dispatch({
            changes: {
              from: 0,
              to: currentValue.length,
              insert: newValue
            }
          })
        }
      }
    )

    onBeforeUnmount(() => {
      if (view) {
        view.destroy()
      }
    })

    return {
      editorContainer,
      editorStyles
    }
  }
})
</script>

<style scoped>
.code-editor {
  height: auto;
  width: 100%;
  border: 0px solid #ddd;
  border-radius: 4px;
}

/* Use :deep() instead of ::v-deep */
:deep(.cm-content) {
  font-family: var(--cm-font-family) !important;
  font-size: var(--cm-font-size) !important;
}

/* Use :deep() instead of ::v-deep */
:deep(.cm-content) {
  font-family: var(--cm-font-family) !important;
  font-size: var(--cm-font-size) !important;
}

:deep(.cm-editor.cm-focused) {
  /* Remove dashed border (outline) */
  outline: none !important;
}
/* styles for rainbow brackets */
.rainbow-bracket-red > span {
  color: red;
}

.rainbow-bracket-orange > span {
  color: orange;
}

.rainbow-bracket-yellow > span {
  color: olive;
}

.rainbow-bracket-green > span {
  color: green;
}

.rainbow-bracket-blue > span {
  color: blue;
}

.rainbow-bracket-indigo > span {
  color: indigo;
}

.rainbow-bracket-violet > span {
  color: violet;
}
</style>
