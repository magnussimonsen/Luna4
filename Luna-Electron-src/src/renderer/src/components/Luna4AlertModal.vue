<!-- File: Luna4AlertModal.vue

    The template displays a modal overlay and content if 'isVisible' is true.
    In 'confirmation' mode, two buttons ('Yes' and 'No') are shown.
    In 'message' mode, a single 'Close' button is displayed.
    The modal closes either by clicking a button or pressing 'Esc' when focused.
  
    In the parent (or wherever you call openModal), you can do something like:
    async function onDeleteFile() {
        const userChoice = await modalRef.openModal('Are you sure you want to delete this file?', 'confirmation')
        if (userChoice) {
            // userChoice === true => user clicked Yes
            // proceed with the file deletion
        } else {
            // userChoice === false => user clicked No or dismissed
             // do nothing or show a message
        }
    }
-->

<template>
  <!-- Modal container displayed conditionally based on isVisible -->
  <div v-if="isVisible" class="modal-overlay" @keydown.esc="closeModal">
    <div class="modal-content">
      <!-- Display the current question text -->
      <h3>{{ question }}</h3>
      <!-- If mode is 'confirmation', show Yes/No buttons -->
      <div v-if="mode === 'confirmation'" class="button-container">
        <button @click="confirmAction">Yes</button>
        <button @click="cancelAction">No</button>
      </div>
      <!-- If mode is 'message', show a single Close button CHANGED TO NOT "confirmation" for code safty -->
      <!--  <div v-else-if="mode === 'message'"> -->
      <div v-else>
        <button @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const isVisible = ref(false)
// question: the text shown in the modal.
const question = ref('')
// mode: current mode of the modal ('confirmation' or 'message').
const mode = ref('')
//resolvePromise: holds the `resolve` function from a Promise when the modal
//is opened in `confirmation` mode.
let resolvePromise = null
/**
 * openModal
 * Opens the modal with the specified text and mode.
 * @param {String} questionText - The text to display.
 * @param {String} modalMode - 'confirmation' or 'message'.
 * @returns {Promise<Boolean|undefined>}
 *   - In 'confirmation' mode, resolves `true` (Yes) or `false` (No).
 *   - In 'message' mode, no meaningful resolution.
 */
function openModal(questionText = 'Are you sure you want to proceed?', modalMode = 'confirmation') {
  question.value = questionText
  mode.value = modalMode
  isVisible.value = true

  if (modalMode === 'confirmation') {
    return new Promise((resolve) => {
      // We never use 'reject' — there is no error scenario in this design.
      // Save the resolve function so we can call it later
      resolvePromise = resolve
    })
  }
}
// Closes the modal. In 'confirmation' mode, resolves as false if neither Yes nor No was clicked.
function closeModal() {
  isVisible.value = false
  if (mode.value === 'confirmation' && resolvePromise) {
    resolvePromise(false)
  }
}
// Handles 'Yes' click in confirmation mode; resolves the promise with true.
function confirmAction() {
  isVisible.value = false
  if (resolvePromise) resolvePromise(true)
}
// Handles 'No' click in confirmation mode; resolves the promise with false.
function cancelAction() {
  isVisible.value = false
  if (resolvePromise) resolvePromise(false)
}
// Expose the methods to the parent component
defineExpose({
  openModal,
  closeModal,
  confirmAction,
  cancelAction
})
</script>

<style scoped>
/* Modal Overlay: a semi-transparent backdrop covering the entire viewport */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

/* Modal Content: a centered box containing the question and buttons */
.modal-content {
  background: var(--navbar-bg-color);
  padding: 1em;
  border-radius: var(--border-radius);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1em;
}

.modal-content button {
  padding: 1em 2em;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 1em;
}

/* First button (usually 'Yes') - Green background */
.modal-content button:first-of-type {
  background-color: #4caf50;
  color: white;
}
.modal-content button:first-of-type:hover {
  background-color: #45a049;
}

/* Second button (usually 'No') - Red background */
.modal-content button:last-of-type {
  background-color: #f44336;
  color: white;
}
.modal-content button:last-of-type:hover {
  background-color: #e53935;
}

.modal-content .button-container {
  display: flex;
  justify-content: center;
  gap: 3em;
}
</style>
