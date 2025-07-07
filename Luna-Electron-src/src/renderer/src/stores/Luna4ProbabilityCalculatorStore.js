// File: stores/ProbabilityCalculatorStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProbabilityCalculatorStore = defineStore('probabilityCalculatorStore', () => {
  const defaultDistribution = ref('Normal') // Default distribution in the toolbar
  const selectedDistribution = ref(null) // Selected distribution shared between components

  return {
    defaultDistribution,
    selectedDistribution
  }
})
