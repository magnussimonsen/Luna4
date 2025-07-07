<!-- Luna4SuperButton.vue -->
<template>
  <!-- Button with toggleable 'selected' state and emits a 'click' event -->
  <button
    :class="{
      selected: isSelected,
      'extra-styling': extraStyling,
      'extra-styling-bug': extraStylingBug,
    }"
    :aria-pressed="isSelected.toString()"
    :aria-label="altText"
    :disabled="disabled"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.menuFontSize || '14px',
      backgroundColor: extraStylingBug && isGlobalBug && !isSelected ? 'red' : null
    }"
    @mousedown.prevent="handleClick($event)"
  >
    <!-- Show icon if provided, otherwise display alternative text -->
    <img v-if="icon" :src="icon" alt="" />
    <div v-else>
      {{ altText }}
    </div>
  </button>
</template>

<script setup>
import { useFontStore } from '@/stores/Luna4FontStore.js'

const fontStore = useFontStore()

// Props for button customization
const props = defineProps({
  // URL or path to an optional icon displayed on the button.
  // If no icon is provided, the button can display alternative text or other content.
  icon: String,

  // Alternative text for the button.
  // Useful for accessibility (e.g., screen readers) and also acts as a fallback if the icon is not visible.
  // Defaults to "Button Icon" if not provided.
  altText: { type: String, default: 'Button Icon' },

  // Custom string identifier returned when the button is clicked.
  // Can be used by parent components to differentiate between buttons.
  // Defaults to "buttonClicked" if not specified.
  returnString: { type: String, default: 'buttonClicked', required: false },

  // Boolean flag indicating whether the button is in a "selected" state.
  // Typically used for toggling visual styles to indicate active or selected status.
  // Defaults to `false`.
  isSelected: { type: Boolean, default: false },

  // Boolean flag to disable the button.
  // When set to `true`, the button is non-interactive and visually appears disabled.
  // Defaults to `false`.
  disabled: { type: Boolean, default: false },

  // Boolean flag for applying additional styles to the button.
  // Used to customize the appearance or behavior of specific buttons.
  // Defaults to `false`.
  extraStyling: { type: Boolean, default: false },

  // Boolean flag for applying additional styles to the button for bug reports.
  // Used to customize the appearance or behavior of specific buttons.
  // Defaults to `false`.
  extraStylingBug: { type: Boolean, default: false },

  isGlobalBug: { type: Boolean, default: false },

  // Boolean flag for a "run-ready" state.
  // Used to indicate that the button is ready to run a process.
  // Defaults to `false`.
  runReady: { type: Boolean, default: false },

  // Boolean flag for a "stop-ready" state.
  // Used to indicate that the button is ready to stop a process.
  // Defaults to `false`.
  stopReady: { type: Boolean, default: false },

  // Boolean flag for a "run-stop-disabled" state.
  // Used to indicate that the run/stop button is disabled.
  // Defaults to `false`.
  runStopDisabled: { type: Boolean, default: false }
})

// Define 'click' event emitter
//This is a function from Vue's Composition API that defines the custom
// events a component can emit. It is used to create an event handler for emitting
// events from the child component to the parent component.
// In the parent component, you could listen for this custom click event like this:
// <Luna4SuperButton @click="handleButtonClick" />
const emit = defineEmits(['click'])

// Handle click and emit the returnString
// The method calls emit (which was defined earlier using defineEmits) to trigger the
// custom click event. When this event is emitted, it sends props.returnString as
// the event payload to the parent component.
// props.returnString: This is a prop passed into the Luna4SuperButton component.
// It's the string that will be sent as the payload when the button is clicked.
// For example, if the returnString prop was set to "buttonClicked", this value
// would be emitted to the parent when the button is clicked.

const handleClick = () => {
  emit('click', props.returnString)
}
</script>

<style scoped>
button {
  display: inline-flex;
  background-color: var(--navbar-bg-color);
  color: var(--main-font-color);
  border: 0px solid var(--main-border-color, #ccc);
  border-radius: var(--border-radius, 2px);
  cursor: pointer;
  padding: 0.1em;
  box-sizing: border-box; /* Include padding and border in height */
  font-size: inherit;
  font-family: inherit;
  align-items: center;
  justify-items: center;
}

/* Button hover effect */
button:hover {
  background-color: var(--navbar-hover-bg-color);
}

/* Button click (active) effect */
button:not(.extra-styling):active {
  transform: scale(1);
  background-color: var(--navbar-hover-bg-color);
}

/* Styles for selected button */
button.selected {
  background-color: var(--selected-bg-color);
  box-shadow: inset 0em 0em 0em var(--main-border-color);
  transform: scale(1);
  border-radius: var(--border-radius, 2px); /* Fallback to 4px if not set */
}

button.extra-styling {
  box-shadow: 2px 2px 0px var(--main-border-color);
  border: 1px solid var(--main-border-color);
  border-radius: var(--border-radius, 2px); /* Fallback to 4px if not set */
}

button.extra-styling.selected {
  box-shadow: 0px 0px 0px var(--main-border-color); /* Inset effect for "pushed in" */
  border: 1px solid var(--main-border-color);
  border-radius: var(--border-radius, 2px); /* Fallback to 2px if not set */
  transform: translate(2px, 2px); /* Simulate "pushed in" by slightly moving the button */
}

button.extra-styling-bug {
  box-shadow: 2px 2px 0px var(--main-border-color);
  border: 1px solid var(--main-border-color);
  border-radius: var(--border-radius, 2px); /* Fallback to 4px if not set */
}

button.extra-styling-bug.selected {
  box-shadow: 0px 0px 0px var(--main-border-color); /* Inset effect for "pushed in" */
  border: 1px solid var(--main-border-color);
  border-radius: var(--border-radius, 2px); /* Fallback to 2px if not set */
  transform: translate(2px, 2px); /* Simulate "pushed in" by slightly moving the button */
}

/* Disabled state */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Icon size - fix to prevent stretched images */
img {
  display: inline-block;
  width: 2em; /* Keep consistent width */
  height: 2em; /* Keep consistent height */
}


</style>
