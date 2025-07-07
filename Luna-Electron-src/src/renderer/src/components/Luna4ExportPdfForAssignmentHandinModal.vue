<template>
  <div v-if="isVisible" class="modal-overlay">
    <div
      class="modal-content"
      :style="{
        fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
        fontSize: '15px'
      }"
      @click.stop
    >
      <button class="close-button" @click="closeModal">×</button>

      <h2>Export Notebook as PDF</h2>
      <p>
        The notebook will be exported as a PDF and saved on your <strong>desktop</strong> with this
        <strong>safe</strong> file name:
      </p>
      <div class="text-center">
        <p>
          <strong>
            {{ studentFirstName.trim().replace(/[^a-zA-Z_]/g, 'x') }}
            {{ studentMiddleName.trim().replace(/[^a-zA-Z_]/g, 'x') }}
            {{ studentLastName.trim().replace(/[^a-zA-Z_]/g, 'x') }}
            {{ assignmentTitle.replace(/[^a-zA-Z0-9_]/g, '_') }}
            {{ assignmentFileSafeTimestampFormatted }}.pdf</strong
          >
        </p>
      </div>

      <div class="form-content">
        <div class="form-row">
          <label for="student-first-name-input">First Name:</label>
          <input
            id="student-first-name-input"
            ref="firstNameInput"
            v-model="studentFirstName"
            class="text-input"
            type="text"
            placeholder="Enter first name"
            @keyup.enter="focusMiddleName"
          />
        </div>

        <div class="form-row">
          <label for="student-middle-name-input">Middle Name: (optional)</label>
          <input
            id="student-middle-name-input"
            ref="middleNameInput"
            v-model="studentMiddleName"
            class="text-input"
            type="text"
            placeholder="Enter middle name (if any)"
            @keyup.enter="focusLastName"
          />
        </div>

        <div class="form-row">
          <label for="student-last-name-input">Last Name:</label>
          <input
            id="student-last-name-input"
            ref="lastNameInput"
            v-model="studentLastName"
            class="text-input"
            type="text"
            placeholder="Enter last name"
            @keyup.enter="exportPDF"
          />
        </div>

        <div class="form-row">
          <label for="assignment-title-input">Assignment title: (optional)</label>
          <input
            id="assignment-title-input"
            ref="assignmentTitleInput"
            v-model="assignmentTitle"
            placeholder="Enter assignment title (if any)"
            class="text-input"
            type="text"
            @keyup.enter="exportPDF"
          />
        </div>

        <div class="button-row">
          <button class="action-button cancel-button" @click="closeModal">Cancel</button>
          <button class="action-button export-button" :disabled="!isFormValid" @click="exportPDF">
            Export PDF
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, defineExpose, nextTick } from 'vue'
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js'
import { useFileDropdownStore } from '@/stores/Luna4FileDropdownStore.js'
import { useFontStore } from '@/stores/Luna4FontStore.js'
import { getCurrentFormattedDate } from '../utils/dateFormatter'

const notebooksAndCellsStore = useNotebooksAndCellsStore()
const fileDropdownStore = useFileDropdownStore()
const fontStore = useFontStore()

// References for input focus management
const firstNameInput = ref(null)
const middleNameInput = ref(null)
const lastNameInput = ref(null)
const assignmentTitleInput = ref(null)

// Get current date and time
// Same function is used in the notebooksAndCellsStore to set the assignmentFileSafeTimestamp
const assignmentFileSafeTimestampFormatted =
  getCurrentFormattedDate({ dateAndTimeFormat: 'useSettingsFileSafe' }) || ''

// Two-way binding for assignmentTitle in the notebooksAndCellsStore
const assignmentTitle = computed({
  get: () => notebooksAndCellsStore.notebooks[0].assignmentTitle || '',
  set: (value) => {
    notebooksAndCellsStore.notebooks[0].assignmentTitle = value
  }
})

// Two-way binding for student name fields
const studentFirstName = computed({
  get: () => notebooksAndCellsStore.notebooks[0].studentFirstName || '',
  set: (value) => {
    notebooksAndCellsStore.notebooks[0].studentFirstName = value
  }
})

const studentMiddleName = computed({
  get: () => notebooksAndCellsStore.notebooks[0].studentMiddleName || '',
  set: (value) => {
    notebooksAndCellsStore.notebooks[0].studentMiddleName = value
  }
})

const studentLastName = computed({
  get: () => notebooksAndCellsStore.notebooks[0].studentLastName || '',
  set: (value) => {
    notebooksAndCellsStore.notebooks[0].studentLastName = value
  }
})

// Form validation
const isFormValid = computed(() => {
  return studentFirstName.value.trim() && studentLastName.value.trim()
})

// Focus management functions
const focusMiddleName = () => {
  middleNameInput.value.focus()
}

const focusLastName = () => {
  lastNameInput.value.focus()
}

// Modal visibility control
const isVisible = ref(false)

// Methods
const openModal = () => {
  isVisible.value = true
  // Focus first name input on next tick to ensure it's rendered
  nextTick(() => {
    firstNameInput.value.focus()
  })
}

const closeModal = () => {
  isVisible.value = false
}

const exportPDF = async () => {
  if (!isFormValid.value) return

  notebooksAndCellsStore.isHandIn = true
  try {
    // Wait for the PDF export to complete
    await fileDropdownStore.exportPDF({ directToDesktop: true })
  } finally {
    closeModal()
  }
}

// Handle Escape key
const handleEscKey = (event) => {
  if (event.key === 'Escape') closeModal()
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('keydown', handleEscKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscKey)
})

// Expose methods to parent
defineExpose({
  openModal
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 1.5em;
  border-radius: 4px;
  max-width: 450px;
  min-width: 350px;
  position: relative;
  color: var(--text-color, #000);
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-color, #000);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5em;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.form-row label {
  font-weight: bold;
}

.text-input {
  padding: 0.5em;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1em;
  width: 100%;
}

.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 1em;
  margin-top: 1em;
}

.action-button {
  padding: 0.5em 1em;
  border-radius: 4px;
  border: none;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button {
  background-color: #f0f0f0;
  color: #333;
}

.export-button {
  background-color: #4caf50;
  color: white;
}

.export-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.text-center {
  text-align: center;
}
</style>
