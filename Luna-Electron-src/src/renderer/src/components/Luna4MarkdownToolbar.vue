<!--File: Luna4RightToolbarMarkdown.vue-->
<template>
  <!-- Toolbar Container -->

  <!-- Heading Buttons (H1 to H4)  -->
  <Luna4SuperButton
    :icon="currentH1Icon"
    alt-text="Heading 1"
    return-string="H1"
    @mousedown.prevent="() => handleHeadingButtonClick('H1')"
  />
  <Luna4SuperButton
    :icon="currentH2Icon"
    alt-text="Heading 2"
    return-string="H2"
    @mousedown.prevent="() => handleHeadingButtonClick('H2')"
  />
  <Luna4SuperButton
    :icon="currentH3Icon"
    alt-text="Heading 3"
    return-string="H3"
    @mousedown.prevent="() => handleHeadingButtonClick('H3')"
  />
  <Luna4SuperButton
    :icon="currentH4Icon"
    alt-text="Heading 4"
    return-string="H4"
    @mousedown.prevent="() => handleHeadingButtonClick('H4')"
  />
  <!-- Bold Button -->
  <Luna4SuperButton
    :icon="currentBoldIcon"
    alt-text="Bold"
    return-string="bold"
    @mousedown.prevent="() => handleBoldButtonClick('bold')"
  />
  <!-- Italic Button -->
  <Luna4SuperButton
    :icon="currentItalicIcon"
    alt-text="Italic"
    return-string="italic"
    @mousedown.prevent="() => handleItalicButtonClick('italic')"
  />
  <!-- Code Block Button -->
  <Luna4SuperButton
    :icon="currentCodeBlockIcon"
    alt-text="Insert Code Block"
    return-string="codeBlock"
    @mousedown.prevent="() => handleCodeBlockButtonClick('code block')"
  />
  <!-- Table Button -->
  <Luna4SuperButton
    :icon="currentTableIcon"
    alt-text="Insert Table"
    return-string="table"
    @mousedown.prevent="() => handleTableBlockButtonClick('table')"
  />
  <Luna4SuperButton
    :noicon="true"
    alt-text="Inline Math"
    return-string="inlineLatex"
    @mousedown.prevent="() => handleInlineLatexButtonClick('inline latex')"
  />
  <Luna4SuperButton
    :noicon="true"
    alt-text="Block Math"
    return-string="blockLatex"
    @mousedown.prevent="() => handleBlockLatexButtonClick('block latex')"
  />
  <!-- Add the Dropdown for Scientific Notations :options= load from markdownKAtexSnippets.json instead? -->
  <Luna4SuperDropdown
    :icon="currentMathNotationIcon"
    :options="markdownToolbarStore.mathNotationDropdownOptions"
    label="Mathematical Notation"
    :align-right="true"
    @select="handleOptionSelect"
  />
  <!-- Add the Dropdown for sums, integrals and so on :options= load from markdownKAtexSnippets.json instead? -->
  <Luna4SuperDropdown
    :icon="currentFXIcon"
    :options="markdownToolbarStore.fxDropdownOptions"
    :align-right="true"
    label="Sums"
    @select="handleOptionSelect"
  />
  <!-- Add the Dropdown for Formulas :options= load from :markdownKAtexSnippets.json instead? -->
  <Luna4SuperDropdown
    :icon="currentFormulasIcon"
    :options="markdownToolbarStore.formulasDropdownOptions"
    :align-right="true"
    label="Formulas"
    @select="handleOptionSelect"
  />
</template>

<script setup>
// Imports and Dependencies
import { computed } from 'vue'
//import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useMarkdownToolbarStore } from '@/stores/Luna4MarkdownToolbarStore.js'
import { useThemeStore } from '@/stores/Luna4ThemeStore.js'
import Luna4SuperDropdown from '@/components/Luna4SuperDropdown.vue'
import Luna4SuperButton from '@/components/Luna4SuperButton.vue'
// Import heading icons.
import H1Icon from '@/assets/icons/Luna_H1.svg'
import H1DarkIcon from '@/assets/icons/Luna_H1_CCCCCC.svg'
import H2Icon from '@/assets/icons/Luna_H2.svg'
import H2DarkIcon from '@/assets/icons/Luna_H2_CCCCCC.svg'
import H3Icon from '@/assets/icons/Luna_H3.svg'
import H3DarkIcon from '@/assets/icons/Luna_H3_CCCCCC.svg'
import H4Icon from '@/assets/icons/Luna_H4.svg'
import H4DarkIcon from '@/assets/icons/Luna_H4_CCCCCC.svg'
// Import Bold icons
import BoldIcon from '@/assets/icons/Luna_Bold.svg'
import BoldDarkIcon from '@/assets/icons/Luna_Bold_CCCCCC.svg'
// Import Italic icons
import ItalicIcon from '@/assets/icons/Luna_Italic.svg'
import ItalicDarkIcon from '@/assets/icons/Luna_Italic_CCCCCC.svg'
// Import Code Block icons
import CodeBlockIcon from '@/assets/icons/Luna_Code_Block.svg'
import CodeBlockDarkIcon from '@/assets/icons/Luna_Code_Block_CCCCCC.svg'
// Import Table icons
import TableIcon from '@/assets/icons/Luna_Table.svg'
import TableDarkIcon from '@/assets/icons/Luna_Table_CCCCCC.svg'
// Import Formula icons
import FXIcon from '@/assets/icons/Luna_FX.svg'
import FXDarkIcon from '@/assets/icons/Luna_FX_CCCCCC.svg'
// Import Math Notation icons
import MathNotationIcon from '@/assets/icons/Luna_MathNotation.svg'
import MathNotationDarkIcon from '@/assets/icons/Luna_MathNotation_CCCCCC.svg'
// Import Math Notation icons
import FormulasIcon from '@/assets/icons/Luna_Formulas.svg'
import FormulasDarkIcon from '@/assets/icons/Luna_Formulas_CCCCCC.svg'
// State Variables & References
const markdownToolbarStore = useMarkdownToolbarStore()
//const fontStore = useFontStore()
const themeStore = useThemeStore()

// Computed Properties for Dynamic Icon Selection
const currentH1Icon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? H1DarkIcon : H1Icon
})
const currentH2Icon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? H2DarkIcon : H2Icon
})
const currentH3Icon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? H3DarkIcon : H3Icon
})
const currentH4Icon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? H4DarkIcon : H4Icon
})
const currentBoldIcon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? BoldDarkIcon : BoldIcon
})
const currentItalicIcon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? ItalicDarkIcon : ItalicIcon
})
const currentCodeBlockIcon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? CodeBlockDarkIcon : CodeBlockIcon
})
const currentTableIcon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? TableDarkIcon : TableIcon
})
const currentFXIcon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? FXDarkIcon : FXIcon
})
const currentMathNotationIcon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? MathNotationDarkIcon : MathNotationIcon
})
const currentFormulasIcon = computed(() => {
  return themeStore.activeTheme === 'Dark' ? FormulasDarkIcon : FormulasIcon
})

// Calls up  methods in the Luna4ToolbarStore.js that will insert
// markdown syntax code into the current selected editable div
const handleHeadingButtonClick = (returnStringFromButton) => {
  console.log('Button clicked, message:', returnStringFromButton)
  markdownToolbarStore.handleHeadingClickFromToolbarButton(returnStringFromButton)
}

const handleBoldButtonClick = (returnStringFromButton) => {
  console.log('Button clicked, message:', returnStringFromButton)
  markdownToolbarStore.handleBoldClickFromToolbarButton(returnStringFromButton)
}

const handleItalicButtonClick = (returnStringFromButton) => {
  console.log('Button clicked, message:', returnStringFromButton)
  markdownToolbarStore.handleItalicClickFromToolbarButton(returnStringFromButton)
}

const handleCodeBlockButtonClick = (returnStringFromButton) => {
  console.log('Button clicked, message:', returnStringFromButton)
  markdownToolbarStore.handleCodeBlockClickFromToolbarButton(returnStringFromButton)
}

const handleTableBlockButtonClick = (returnStringFromButton) => {
  console.log('Button clicked, message:', returnStringFromButton)
  markdownToolbarStore.handleTableBlockClickFromToolbarButton(returnStringFromButton)
}

const handleInlineLatexButtonClick = (returnStringFromButton) => {
  console.log('Button clicked, message:', returnStringFromButton)
  markdownToolbarStore.handleInlineLatexClickFromToolbarButton(returnStringFromButton)
}

const handleBlockLatexButtonClick = (returnStringFromButton) => {
  console.log('Button clicked, message:', returnStringFromButton)
  markdownToolbarStore.handleBlockLatexClickFromToolbarButton(returnStringFromButton)
}

const handleOptionSelect = (selectedOption) => {
  console.log('Math notation selected:', selectedOption)
  // Dynamically invoke the appropriate method from the store
  // Check if useFunction exists and is valid
  if (!selectedOption.useFunctionFromMarkdownStore) {
    console.error(
      'The selected option does not have a useFunctionFromMarkdownStore property:',
      selectedOption
    )
    return
  }
  const storeFunction = markdownToolbarStore[selectedOption.useFunctionFromMarkdownStore]
  if (typeof storeFunction === 'function') {
    // Matches the store function name
    storeFunction(selectedOption.snippet)
  } else {
    console.warn(
      'Unknown function type or method not found:',
      selectedOption.useFunctionFromMarkdownStore
    )
  }
}
</script>

<style scoped>
/* Using base style: \Luna4\src\renderer\src\assets\css\toolbar-base.css */
</style>
