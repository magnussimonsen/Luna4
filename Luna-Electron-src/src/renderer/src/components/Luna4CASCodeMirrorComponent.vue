<template>
  <div ref="editorContainer" class="code-editor" :style="editorStyles"></div>
</template>

<script>
import { defineComponent, onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { defaultKeymap } from '@codemirror/commands'
import { indentOnInput } from '@codemirror/language'
import rainbowBrackets from '@/assets/rainbowBrackets/rainbowBrackets.js'
import { getCasHighlighting } from '@/assets/codeMirror/casHighlighting.js'
import { cas } from '@/assets/codeMirror/casLanguage.js'
import { useLanguageStore } from '@/stores/Luna4LanguageStore.js'
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useThemeStore } from '@/stores/Luna4ThemeStore.js'
import { casAutocomplete } from '@/assets/codeMirror/casAutocomplete.js'
import { casConstantHighlighter } from '@/assets/codeMirror/casConstantHighlighter.js'
import { casEqualsHighlighter } from '@/assets/codeMirror/casEqualsHighlighter.js'
import { casLogHighlighter } from '@/assets/codeMirror/casLogHighlighter.js'
export default defineComponent({
  name: 'Luna4CASCodeMirrorComponent',
  props: {
    modelValue: { type: String, default: '' },
    readOnly: { type: Boolean, default: false },
    cell: {
      type: Object,
      default() {
        return { message: 'prop "cell" in code mirror is not working' }
      }
    }
  },
  emits: ['update:modelValue', 'update'],
  setup(props, { emit }) {
    const modelValue = ref(props.cell.content || '')
    const editorContainer = ref(null)
    let view = null
    const fontStore = useFontStore()
    const themeStore = useThemeStore()
    const languageStore = useLanguageStore()
    const readOnlyCompartment = new Compartment()
    const highlightCompartment = new Compartment()
    const themeCompartment = new Compartment()
    const cursorCompartment = new Compartment()
    const languageCompartment = new Compartment() // Add a compartment for language changes

    const editorStyles = computed(() => ({
      '--cm-font-family': fontStore.codingFontFamily,
      '--cm-font-size': fontStore.fontSize,
      '--cm-text-color': 'var(--main-font-color)'
    }))

    onMounted(() => {
      const state = EditorState.create({
        doc: modelValue.value,
        extensions: [
          keymap.of(defaultKeymap),
          //lineNumbers(),
          highlightActiveLineGutter(),
          indentOnInput(),
          casAutocomplete(),
          rainbowBrackets(),
          languageCompartment.of(cas()),
          readOnlyCompartment.of(EditorView.editable.of(!props.readOnly)),
          casConstantHighlighter(), // Add our custom E and I highlighter
          casEqualsHighlighter(), // Add our custom E and I highlighter
          casLogHighlighter(),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newValue = update.state.doc.toString()
              emit('update:modelValue', newValue)
              emit('update')
              console.log('Emitting update:modelValue in codeMirrorComponent', newValue)
            }
          }),
          // Custom CAS syntax highlighting
          highlightCompartment.of(getCasHighlighting()),
          // Base editor theme from ThemeMirror
          themeCompartment.of(themeStore.currentCodeMirrorTheme),
          cursorCompartment.of(EditorView.theme(themeStore.isDarkMode))
        ]
      })

      view = new EditorView({
        state,
        parent: editorContainer.value
      })
    })

    // Update the watch to use themeStore.currentCodeMirrorTheme
    watch(
      () => themeStore.currentCodeMirrorTheme,
      (newTheme) => {
        if (view) {
          view.dispatch({
            effects: [
              highlightCompartment.reconfigure(getCasHighlighting()),
              themeCompartment.reconfigure(newTheme),
              cursorCompartment.reconfigure(EditorView.theme(themeStore.isDarkMode))
            ]
          })
          // Force redraw
          view.requestMeasure()
        }
      }
    )

    // Also add a watch for isDarkMode changes to update highlighting
    watch(
      () => themeStore.isDarkMode,
      (isDarkMode) => {
        if (view) {
          view.dispatch({
            effects: [
              highlightCompartment.reconfigure(getCasHighlighting()),
              cursorCompartment.reconfigure(EditorView.theme(isDarkMode))
            ]
          })
          // Force redraw
          view.requestMeasure()
        }
      }
    )

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

    watch(
      () => props.modelValue,
      (newValue) => {
        if (!view) return
        const currentValue = view.state.doc.toString()
        if (newValue !== currentValue) {
          view.dispatch({
            changes: { from: 0, to: currentValue.length, insert: newValue }
          })
        }
      }
    )

    // Watch for language changes
    watch(
      () => languageStore.selectedLanguage,
      () => {
        if (view) {
          // Reconfigure with new language
          view.dispatch({
            effects: [
              // Reconfigure the language extension with the updated language settings
              languageCompartment.reconfigure(cas())
            ]
          })

          // Also update highlighting since it might depend on language
          view.dispatch({
            effects: [highlightCompartment.reconfigure(getCasHighlighting())]
          })

          // Force redraw to ensure changes are rendered
          view.requestMeasure()
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
      editorStyles,
      themeStore
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

:deep(.cm-content) {
  font-family: var(--cm-font-family) !important;
  font-size: var(--cm-font-size) !important;
  color: var(--cm-text-color) !important;
  background-color: var(--cell-bg-color) !important;
}

:deep(.cm-editor.cm-focused) {
  /* Remove dashed border (outline) */
  outline: none !important;
}

/* Add these styles for the CAS autocompletion */
.cas-completion {
  display: flex;
  align-items: center;
  padding: 0.2em;
}

.cas-completion-icon {
  margin-right: 8px;
  width: 100%;
  height: 160px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
}

.cas-function-icon {
  background-color: #4b83cd;
  color: white;
}

.cas-constant-icon {
  background-color: #c678dd;
  color: white;
}

.cas-keyword-icon {
  background-color: #e06c75;
  color: white;
}

.cas-class-icon {
  background-color: #98c379;
  color: white;
}

/*.cas-completion-info {  commented out becous theese have no effect. Dont know why.
}
.cas-completion-detail {
}*/
</style>
