<!--
  --------------------------------------------------------------------
  File: Luna4SuperDropdown.vue
  --------------------------------------------------------------------
  Summary:
  The Luna4SuperDropdown component provides a customizable dropdown menu 
  for selecting an option from a list. It offers optional icons, keyboard shortcuts,
  and special styling for certain menu options. The dropdown is fully integrated 
  with global font and theme stores to maintain a consistent look and feel across 
  the application.

  Key Features:
  - Configurable label and options passed as props.
  - Dynamic styling based on global font and theme settings.
  - Keyboard shortcut display.
  - Click-outside detection to automatically close the dropdown.
  - Emits events to the parent component when opened/closed or when an option is selected.

  Structure:
  - Template: 
      * A button representing the dropdown label that toggles the menu.
      * A menu container that conditionally appears when toggled.
      * A list of option buttons with optional icons, shortcuts, and styling.
  - Script Setup:
      * Receives props for `label` and `options`.
      * Uses `ref` and lifecycle hooks to manage click-outside behavior.
      * Emits events `update:isSelectedDropdown` and `select`-option-object.
  - Styles:
      * Scoped CSS ensures consistent and theme-aware styling.
      * Special classes for deletion and submission options.

  Usage:
  - Import the component:
    ```js
    import Luna4SuperDropdown from '@/components/Luna4SuperDropdown.vue'
    ```
  - Use in a parent component:
    ```vue
    <Luna4SuperDropdown
      :options="dropdownOptions"
      label="Actions"
      @update:isSelectedDropdown="handleDropdownState"
      @select="handleOptionSelect"
    />
    ```

  - `options` is an array of objects, each with:
      - `value`: A unique identifier for the action.
      - `label`: The text displayed in the dropdown.
      - `icon`: (Optional) Path to an icon image.
      - `shortcut`: (Optional) A string describing a keyboard shortcut.

  - The parent can listen to:
      - `update:isSelectedDropdown` event to track open/close state.
      - `select` event when a user picks an option.
-->

<template>
  <!-- Template Explanation
       - A clickable label button toggles the dropdown menu.
       - When open, a menu is displayed below the label.
       - Each option is rendered as a button with optional icon and shortcut.
  -->
  <div ref="dropdownRef" class="dropdown">
    <!-- Dropdown label button -->
    <button
      class="dropdown-label"
      :class="{ active: isSelectedDropdown }"
      :style="{
        fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
        fontSize: fontStore.menuFontSize || '14px'
      }"
      @mousedown.prevent="toggleDropdown"
    >
      <!-- Show icon if provided, otherwise display alternative text -->
      <img v-if="icon" :src="icon" alt="" />
      <span v-else>
        {{ label }}
      </span>
    </button>
    <!-- Dropdown menu: visible only when isSelectedDropdown is true -->
    <div
      v-if="isSelectedDropdown"
      class="dropdown-menu"
      :class="{ 'dropdown-menu-right': alignRight }"
    >
      <button
        v-for="option in options"
        :key="option.value"
        :class="[
          'dropdown-item',
          {
            'delete-selected-cell-option': option.value === 'deleteSelectedCell',
            'delete-selected-notebook-option': option.value === 'deleteSelectedNotebook',
            'submission-option': option.value === 'exportPDFAssignment'
          }
        ]"
        :style="{
          fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
          fontSize: fontStore.menuFontSize || '14px'
        }"
        @mousedown.prevent="selectOption(option, $event)"
      >
        <!-- Optional icon -->
        <span v-if="option.icon" class="dropdown-item-icon">
          <img :src="option.icon" alt="" />
        </span>
        <!-- Option label -->
        <span class="dropdown-item-label">{{ option.label }}</span>
        <!-- Optional shortcut display -->
        <span v-if="option.shortcut" class="option-shortcut">{{ option.shortcut }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
// Imports and Dependencies
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useFontStore } from '@/stores/Luna4FontStore.js'
//import { useThemeStore } from '@/stores/Luna4ThemeStore.js'
// Props
// - options: Array of dropdown items, each having value, label, and optional icon/shortcut.
// - label: The text to display on the dropdown toggle button.
const {
  options,
  label,
  icon,
  alignRight = false
} = defineProps({
  options: {
    type: Array,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String, // Optional icon URL
    default: ''
  },
  alignRight: {
    type: Boolean,
    default: false
  }
})

// Emits
// - update:isSelectedDropdown: Notifies parent when dropdown open state changes.
// - select: Emits the selected option object. (Dropdown har been updated to emit object instead of just the value)
const emit = defineEmits(['update:isSelectedDropdown', 'select'])
// State Variables & References
// Tracks whether the dropdown is open (true) or closed (false).
const isSelectedDropdown = ref(false)
// Reference to the dropdown container for click-outside detection.
const dropdownRef = ref(null)
// Access global font and theme stores.
const fontStore = useFontStore()
//const themeStore = useThemeStore()
// Debug log for theme.
//console.log('Current theme:', themeStore.activeTheme) // eslint-disable-line no-console

// Methods
//Toggles the dropdown menu's visibility and emits the new state.
function toggleDropdown() {
  isSelectedDropdown.value = !isSelectedDropdown.value
  emit('update:isSelectedDropdown', isSelectedDropdown.value)
}
//Handles selection of a dropdown option.
function selectOption(option, event) {
  event.stopPropagation() // Prevents click from propagating beyond the option
  emit('select', option) // Notify parent of the selected option
  isSelectedDropdown.value = false
  emit('update:isSelectedDropdown', isSelectedDropdown.value) // Close the dropdown by emitting isSelectedDropdown=false
}
//Closes the dropdown if the user clicks outside of it.
function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isSelectedDropdown.value = false
    emit('update:isSelectedDropdown', isSelectedDropdown.value)
  }
}
// Lifecycle Hooks
// Add a global click event listener to detect outside clicks on mount.
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

// Remove the global click event listener before the component is unmounted.
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
/* Container for the entire dropdown (label + menu) */
.dropdown {
  position: relative;
  display: inline-block;
}
/* Button acting as the dropdown label */
.dropdown-label {
  background-color: var(--navbar-bg-color);
  color: var(--font-color);
  cursor: pointer;
  padding: 0.2em 0.2em;
  border: none;
  margin-left: 0.2em;
  margin-right: 0.2em;
  border-radius: var(--border-radius, 2px);
  border: 0px solid var(--main-border-color);
}
/* Remove padding and margin from the img inside dropdown-label */
.dropdown-label img {
  margin: 0;
  padding: 0;
  display: block; /* Optional: Removes extra space below the image */
}
/* Style applied when the dropdown is open */
.dropdown-label.active {
  background-color: var(--dropdown-bg-color);
  transform: translate(1px, 1px); /* Simulate "pushed in" by slightly moving the button */
}
/* The dropdown menu container */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: max-content;
  max-height: 550px;
  border: 2px solid var(--main-border-color);
  margin-top: 0.2em;
  margin-left: 0.2em;
  z-index: 1000;
  border-radius: var(--border-radius, 2px);
  overflow-y: auto; /* Allows scrolling if too many options */
  overflow-x: auto; /* Allows scrolling if too many options */
}
.dropdown-menu-right {
  right: 0 !important;
  left: auto !important;
  margin-left: 0 !important;
}
/* Individual dropdown items */
.dropdown-item {
  padding: 0.5em 3em 0.5em 1em;
  cursor: pointer;
  display: flex;
  align-items: center;
  border: none;
  width: 100%;
  background-color: var(--dropdown-bg-color);
  color: var(--font-color);
  border-radius: var(--border-radius, 2px);
}
/* The main label for each dropdown item */
.dropdown-item-label {
  background-color: transparent;
}
/* Hover states for items and label */
.dropdown-item:hover,
.dropdown-label:hover {
  background-color: var(--navbar-hover-bg-color);
}
/* Optional icon displayed to the left of the label */
.dropdown-item-icon {
  margin-right: 0.5em;
  background-color: transparent;
}
/* Ensure icons have a consistent size */
.dropdown-item-icon img {
  width: 25px;
  height: 25px;
}
/* Specialized styling for 'deleteSelectedCell' option */
.dropdown-item.delete-selected-cell-option {
  margin-top: 0em;
  background-color: var(--delete-bg-color);
  color: var(--delete-font-color, #fff);
}
/* Hover style for 'deleteSelectedCell' option */
.dropdown-item.delete-selected-cell-option:hover {
  background-color: var(--delete-hover-bg-color, darkred);
  color: var(--delete-hover-font-color, darkred);
}
/* Specialized styling for 'deleteSelectedNotebook' option */
.dropdown-item.delete-selected-notebook-option {
  margin-top: 0.1em;
  background-color: var(--delete-bg-color);
  color: var(--delete-font-color, #fff);
}

/* Hover style for 'deleteSelectedNotebook' option */
.dropdown-item.delete-selected-notebook-option:hover {
  background-color: var(--delete-hover-bg-color, darkred);
  color: var(--delete-hover-font-color, darkred);
}
/* Keyboard shortcuts displayed on the right side of the item */
.option-shortcut {
  padding-left: 2rem;
  opacity: 0.8;
  font-size: 0.9em;
  margin-left: auto;
  background-color: transparent;
}
/* Styling for 'saveForSubmission' (submission-option) */
.dropdown-item.submission-option {
  font-weight: bold;
  background-color: var(--highlighted-option-bg-color, #d1e7ff);
  color: var(--highlighted-option-font-color, #004085);
}

/* Hover style for 'saveForSubmission' option */
.dropdown-item.submission-option:hover {
  background-color: var(--highlighted-option-hover-color, #cbe2ff);
  color: var(--highlighted-option-font-hover-color, #00366d);
}
/* Icon size */
img {
  width: 1.8em;
  height: 1.8em;
  padding: 0em;
  margin: 0em;
  display: block; /* Optional: Removes extra space below the image */
}
</style>
