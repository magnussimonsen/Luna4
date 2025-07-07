// File: Luna4MarkdownToolbarStore.js

/**
 * A store for managing the state and actions of the Markdown toolbar.
 *
 * @typedef {Object} MarkdownToolbarStore
 * @property {Ref<HTMLElement|null>} focusedEditableDiv - The currently focused editable div element.
 * @property {Ref<Array>} mathNotationDropdownOptions - Options for the math notation dropdown.
 * @property {Ref<Array>} fxDropdownOptions - Options for the fx dropdown.
 * @property {Ref<Array>} formulasDropdownOptions - Options for the formulas dropdown.
 * @property {Function} getOptionsAndSnippetsArrayForMarkdownToolbarDropdown - Function to get options and snippets for the dropdown.
 * @property {Function} setFocusedEditableDiv - Sets the currently focused editable div element.
 * @property {Function} insertMarkdownSnippet - Inserts a markdown snippet at the current caret position.
 * @property {Function} insertMarkdownWrapper - Wraps the selected text or inserts a wrapper at the caret position.
 * @property {Function} handleHeadingClickFromToolbarButton - Handles heading button clicks from the toolbar.
 * @property {Function} handleBoldClickFromToolbarButton - Handles bold button clicks from the toolbar.
 * @property {Function} handleItalicClickFromToolbarButton - Handles italic button clicks from the toolbar.
 * @property {Function} handleCodeBlockClickFromToolbarButton - Handles code block button clicks from the toolbar.
 * @property {Function} handleTableBlockClickFromToolbarButton - Handles table block button clicks from the toolbar.
 * @property {Function} handleInlineLatexClickFromToolbarButton - Handles inline LaTeX button clicks from the toolbar.
 * @property {Function} handleBlockLatexClickFromToolbarButton - Handles block LaTeX button clicks from the toolbar.
 */

import { defineStore } from 'pinia'
//import { useSettingsStore } from '@/stores/Luna4SettingsStore'
import { useLanguageStore } from '@/stores/Luna4LanguageStore'
import optionsAndSnippetsData from '@/assets/markdownKatexSnippets.json'
import { ref, watch } from 'vue'

const getOptionsAndSnippetsArrayForMarkdownToolbarDropdown = (
  optionsAndSnippetsData,
  dropdownKey,
  selectedLanguage,
  fallbackLanguage
) => {
  const dropdownData = optionsAndSnippetsData[dropdownKey]
  if (!dropdownData) {
    console.warn(`No data found for dropdownKey: ${dropdownKey}`)
    return []
  }
  return Object.entries(dropdownData).map(([, option]) => ({
    value: option.value,
    label: option.label[selectedLanguage] || option.label[fallbackLanguage],
    snippet: option.snippet,
    shortcut: option.shortcut || '',
    useFunctionFromMarkdownStore: option.useFunctionFromMarkdownStore
  }))
}

export const useMarkdownToolbarStore = defineStore('MarkdownToolbarStore', () => {
  //const settingsStore = useSettingsStore()
  const languageStore = useLanguageStore()

  // States
  const focusedEditableDiv = ref(null)
  const mathNotationDropdownOptions = ref([])
  const fxDropdownOptions = ref([])
  const formulasDropdownOptions = ref([])
  // Methods
  const updateDropdownOptions = () => {
    const { selectedLanguage, fallbackLanguage } = languageStore
    mathNotationDropdownOptions.value = getOptionsAndSnippetsArrayForMarkdownToolbarDropdown(
      optionsAndSnippetsData,
      'mathNotationDropdownOptions',
      selectedLanguage.value,
      fallbackLanguage
    )
    fxDropdownOptions.value = getOptionsAndSnippetsArrayForMarkdownToolbarDropdown(
      optionsAndSnippetsData,
      'fxDropdownOptions',
      selectedLanguage.value,
      fallbackLanguage
    )
    formulasDropdownOptions.value = getOptionsAndSnippetsArrayForMarkdownToolbarDropdown(
      optionsAndSnippetsData,
      'formulasDropdownOptions',
      selectedLanguage.value,
      fallbackLanguage
    )
  }

  // Initialize dropdown options
  updateDropdownOptions()
  // Watch for changes in selectedLanguage
  watch(() => languageStore.selectedLanguage, updateDropdownOptions)
  // Set the focused editable div
  const setFocusedEditableDiv = (div) => {
    focusedEditableDiv.value = div
  }
  // Insert a markdown snippet at the current caret position
  const insertMarkdownSnippet = (snippet, caretOffset = null) => {
    if (!focusedEditableDiv.value) return
    const selection = window.getSelection()
    if (selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const textNode = document.createTextNode(snippet)
    range.insertNode(textNode)

    const finalOffset = caretOffset === null ? snippet.length : caretOffset
    range.setStart(textNode, finalOffset)
    range.setEnd(textNode, finalOffset)

    selection.removeAllRanges()
    selection.addRange(range)
  }
  // Wrap the selected text or insert a wrapper at the caret position
  const insertMarkdownWrapper = (snippet) => {
    const [prefix, suffix] = snippet.split(',')
    if (!focusedEditableDiv.value) return
    const selection = window.getSelection()
    if (selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    const isCollapsed = range.collapsed
    if (!isCollapsed) {
      const selectedText = range.toString()
      range.deleteContents()
      const wrappedText = document.createTextNode(`${prefix}${selectedText}${suffix}`)
      range.insertNode(wrappedText)
      range.setStartAfter(wrappedText)
      range.setEndAfter(wrappedText)
      selection.removeAllRanges()
      selection.addRange(range)
    } else {
      const wrapPlaceholder = document.createTextNode(prefix + suffix)
      range.insertNode(wrapPlaceholder)
      const offset = prefix.length
      range.setStart(wrapPlaceholder, offset)
      range.setEnd(wrapPlaceholder, offset)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
  // Handle heading button clicks from the toolbar
  const handleHeadingClickFromToolbarButton = (returnStringFromButton) => {
    // Map returnStringFromButton to markdown syntax
    const headingMap = {
      H1: '# ',
      H2: '## ',
      H3: '### ',
      H4: '#### '
    }
    const headingSyntax = headingMap[returnStringFromButton]
    if (headingSyntax) {
      insertMarkdownSnippet(headingSyntax)
    } else {
      console.warn(`Unknown Heading String: ${returnStringFromButton}`)
    }
  }

  const handleBoldClickFromToolbarButton = () => {
    // bold = "**" prefix, "**" suffix
    insertMarkdownWrapper('**,**')
  }

  const handleItalicClickFromToolbarButton = () => {
    // italic = "_" prefix, "_" suffix
    insertMarkdownWrapper('_,_')
  }

  const handleCodeBlockClickFromToolbarButton = () => {
    // italic = "'''Python" prefix, "'''" suffix
    insertMarkdownWrapper('```Python\n,\n```')
  }

  const handleTableBlockClickFromToolbarButton = () => {
    // A simple 3x3 Markdown table snippet
    const tableSnippet = `| | | |
|-|-|-|
| | | |
| | | |`

    insertMarkdownSnippet(tableSnippet)
  }

  const handleInlineLatexClickFromToolbarButton = () => {
    insertMarkdownWrapper('$,$')
  }

  const handleBlockLatexClickFromToolbarButton = () => {
    insertMarkdownWrapper('$$\n,\n$$')
  }

  return {
    focusedEditableDiv,
    mathNotationDropdownOptions,
    fxDropdownOptions,
    formulasDropdownOptions,
    getOptionsAndSnippetsArrayForMarkdownToolbarDropdown,
    setFocusedEditableDiv,
    insertMarkdownSnippet,
    insertMarkdownWrapper,
    handleHeadingClickFromToolbarButton,
    handleBoldClickFromToolbarButton,
    handleItalicClickFromToolbarButton,
    handleCodeBlockClickFromToolbarButton,
    handleTableBlockClickFromToolbarButton,
    handleInlineLatexClickFromToolbarButton,
    handleBlockLatexClickFromToolbarButton
  }
})
