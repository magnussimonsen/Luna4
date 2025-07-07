<!-- File: Luna4ProbCalcCell.vue-->
<template>
  <div
    :id="cell.id"
    :cell="cell"
    class="probability-calculator-cell"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.fontSize || '14px'
    }"
  >
    <div class="parameter-container">
      <strong>{{ distNameLong }}&nbsp;</strong>

      <div v-for="paramKey in parameterData" :key="paramKey">
        {{ paramKey.name[selectedLanguage] || paramKey.name[fallbackLanguage] }},
        {{ paramKey.unicode }}: {{ paramKey.currentValue }}.
      </div>

      <div v-if="selectedIntervalKey === 'leftSided' || selectedIntervalKey === 'rightSided'">
        {{ intervals[selectedIntervalKey].replace('x', String(intervalData.x.currentValue)) }}
        =
        {{ distObj[selectedDistribution].roundedAns }}
      </div>
      <div v-else>
        {{
          intervals[selectedIntervalKey]
            .replace('a', String(intervalData.a.currentValue))
            .replace('b', String(intervalData.b.currentValue))
        }}
        =
        {{ roundedAns }}
      </div>
    </div>
  </div>
</template>

<script setup>
// Imports and Dependencies
import { computed } from 'vue'
import { useFontStore } from '@/stores/Luna4FontStore.js'
//import { useSettingsStore } from '@/stores/Luna4SettingsStore.js' // Import the settings store
import { useLanguageStore } from '@/stores/Luna4LanguageStore.js' // Import the language store
//import LunaMarkdownRenderer from '@/components/LunaMarkdownRenderer.vue'

// const = useStore
const fontStore = useFontStore()
//const settingsStore = useSettingsStore()
const languageStore = useLanguageStore()

const selectedLanguage = computed(() => languageStore.selectedLanguage)
const fallbackLanguage = computed(() => languageStore.fallbackLanguage)

// Props

const props = defineProps({
  cell: {
    type: Object,
    required: true
  }
})

const selectedDistribution = computed(() => props.cell.selectedDistribution)
const distObj = computed(() => props.cell.distObj)
const intervals = computed(() => distObj.value[selectedDistribution.value].intervals)
const selectedIntervalKey = computed(
  () =>
    distObj.value[selectedDistribution.value].selectedIntervalKey || distObj.value.fallbackInterval
)
const distNameLong = computed(
  () =>
    distObj.value[selectedDistribution.value].distNameLong[selectedLanguage.value] ||
    distObj.value[selectedDistribution.value].distNameLong[fallbackLanguage.value]
)
const intervalData = computed(() => distObj.value[selectedDistribution.value].intervalData)
const parameterData = computed(() => distObj.value[selectedDistribution.value].parameterData)
const roundedAns = computed(() => distObj.value[selectedDistribution.value].roundedAns)
</script>

<style scoped>
.probability-calculator-cell {
  padding: 0.5em;
  background-color: var(--cell-bg-color);
  color: var(--main-font-color);
}
.parameter-container {
  background-color: var(--navbar-bg-color);
  cursor: not-allowed !important;
  color: var(--main-font-color);
}
</style>
