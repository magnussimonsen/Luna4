<!-- File: Luna4ProbCalcTootlbar.vue-->

<template>
  <div
    class="toolbar-base"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.menuFontSize || '14px'
    }"
  >
    <!-- Distribution -->
    <select v-if="selectedCell && distObj" v-model="selectedDistribution">
      <option v-for="distNameKey in distKeyNames" :key="distNameKey" :value="distNameKey">
        <!-- distKeyNames is an array like this ["Normal", "Exponential", and so on]-->
        {{
          distObj[distNameKey].distName[selectedLanguage] ??
          distObj[distNameKey].distName[fallbackLanguage]
        }}
      </option>
    </select>
    <!-- Interval Selector:  P(X>x), P(X<x), P(a<X<b), P(a>X>b)  -->
    <select v-if="selectedCell && intervalKeys" v-model="selectedIntervalKey">
      <option v-for="intervalKey in intervalKeys" :key="intervalKey" :value="intervalKey">
        {{ distObj[selectedDistribution].intervals[intervalKey] ?? null }}
      </option>
    </select>
    <!-- Input field for x, a, b -->
    <div v-if="selectedIntervalKey">
      <span v-if="selectedIntervalKey === 'leftSided' || selectedIntervalKey === 'rightSided'">
        <LunaMarkdownRenderer
          v-if="intervalData.x.latex"
          :content="`$$${intervalData.x.latex}$$`"
          class="latex-renderer"
        />
        :
        <input
          v-model.number="currentValueX"
          type="number"
          :step="intervalData.x.stepSize"
          :min="intervalData.x.minValue"
          :max="isDiscrete ? numberOfTrials : intervalData.x.maxValue"
        />
      </span>
      <span v-else-if="selectedIntervalKey === 'interval' || selectedIntervalKey === 'twoTailed'">
        a:
        <input
          v-model.number="currentValueA"
          type="number"
          :step="intervalData.a.stepSize"
          :min="intervalData.a.minValue"
          :max="
            isDiscrete
              ? selectedIntervalKey === 'twoTailed'
                ? Math.min(currentValueB - 1, numberOfTrials)
                : Math.min(currentValueB, numberOfTrials)
              : intervalData.a.maxValue
          "
        />
        b:
        <input
          v-model.number="currentValueB"
          type="number"
          :step="intervalData.b.stepSize"
          :min="
            isDiscrete && selectedIntervalKey === 'twoTailed' ? currentValueA + 1 : currentValueA
          "
          :max="isDiscrete ? numberOfTrials : intervalData.b.maxValue"
        />
      </span>
    </div>
    <!-- Parameter Selector -->
    <select v-model="selectedParameterKey">
      <!-- Example: The key = "mu", value = subobjet with info about mu, like name, unicode, currentValue) -->
      <!-- The <select> selects the :value-binding, which in this case is the key of the object -->
      <option v-for="(value, key) in parameterData" :key="key" :value="key">
        <!-- The label still comes from the object 'value' -->
        {{ (value.name[selectedLanguage] || value.name[fallbackLanguage]) + ', ' + value.unicode }}
      </option>
    </select>

    <div v-if="selectedParameterKey">
      <input
        v-model.number="selectedParameterCurrentValue"
        type="number"
        :step="parameterData[selectedParameterKey].stepSize"
        :min="parameterData[selectedParameterKey].minValue"
        :max="parameterData[selectedParameterKey].maxValue"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
import { useFontStore } from '@/stores/Luna4FontStore.js' // Import the font store
//import { useSettingsStore } from '@/stores/Luna4SettingsStore.js' // Import the settings store
import { useLanguageStore } from '@/stores/Luna4LanguageStore.js' // Import the language store
import * as LunaMath from '@/utils/LunaMath.js' // Import the LunaMath utility
import { useNotebooksAndCellsStore } from '@/stores/Luna4NotebooksAndCellsStore.js' // Import the notebooks and cells store
import LunaMarkdownRenderer from '@/components/LunaMarkdownRenderer.vue'
const fontStore = useFontStore()
//const settingsStore = useSettingsStore()
const languageStore = useLanguageStore()
const notebooksAndCellsStore = useNotebooksAndCellsStore()
//---------------------------------------------------------------------
// Computed aliases for read-only properties (for convenience)
//---------------------------------------------------------------------
const selectedLanguage = computed(() => languageStore.selectedLanguage)
const fallbackLanguage = computed(() => languageStore.fallbackLanguage)
const selectedCell = computed(() => notebooksAndCellsStore.selectedCell ?? null)
const distObj = computed(() => selectedCell.value.distObj)
// Array of distribution keys (strings) for the distribution selector dropdown
const distKeyNames = computed(() => {
  return Object.keys(distObj.value) ?? null
})
// Key-value pairs {'leftSided': 'P(X<x)', ...} for the interval dropdown
const intervalKeys = computed(() => {
  return Object.keys(distObj.value[selectedDistribution.value].intervals) ?? null
})
// Sub-object of the selected distObj for the interval data,
// containing among other things the current values of x, a, b
const intervalData = computed(() => {
  return distObj.value[selectedDistribution.value].intervalData ?? null
})
// Sub-object of the selected distObj for the parameter data, containing among other
// things the current values of the parameters (like mu and sigma for normal distribution)
const parameterData = computed(() => {
  return distObj.value[selectedDistribution.value].parameterData ?? null
})

// The numer of trails for the discrete distributions
const numberOfTrials = computed(() => {
  if (!isDiscrete.value) {
    return null
  }
  return parameterData.value.n.currentValue ?? null
})

// True if the selected distribution is discrete, false if continuous
const isDiscrete = computed(() => distObj.value[selectedDistribution.value].isDiscrete)

// --------------------------------------------------------------
// Computed properties with setters and getters used v-model in the template
// Used to add two way binding between v-model-properties and the store
// --------------------------------------------------------------

const selectedDistribution = computed({
  get: () => selectedCell.value.selectedDistribution ?? selectedCell.value.fallbackDistribution,
  set: (newSelectedDistribution) => {
    if (newSelectedDistribution === undefined || newSelectedDistribution === null) return
    notebooksAndCellsStore.updateCellPropValNested(selectedCell.value.id, [
      { key: 'selectedDistribution', val: newSelectedDistribution }
    ])
  }
})

const selectedParameterKey = computed({
  get: () =>
    distObj.value[selectedDistribution.value].selectedParameterKey ??
    distObj.value[selectedDistribution.value].fallbackParameterKey,
  set: (newSelectedParameterKey) => {
    if (newSelectedParameterKey === undefined || newSelectedParameterKey === null) return
    notebooksAndCellsStore.updateCellPropValNested(selectedCell.value.id, [
      {
        key: `distObj[${selectedDistribution.value}].selectedParameterKey`,
        val: newSelectedParameterKey
      }
    ])
  }
})

const selectedParameterCurrentValue = computed({
  get: () => parameterData.value[selectedParameterKey.value].currentValue,
  set: (newSelectedParameterCurrentValue) => {
    if (newSelectedParameterCurrentValue === undefined || newSelectedParameterCurrentValue === null)
      return
    notebooksAndCellsStore.updateCellPropValNested(selectedCell.value.id, [
      {
        key: `distObj[${selectedDistribution.value}].parameterData[${selectedParameterKey.value}].currentValue`,
        val: newSelectedParameterCurrentValue
      }
    ])
  }
})

const selectedIntervalKey = computed({
  get: () =>
    distObj.value[selectedDistribution.value].selectedIntervalKey ||
    distObj.value[selectedDistribution.value].fallbackIntervalKey,
  set: (newSelectedIntervalKey) => {
    if (newSelectedIntervalKey === undefined || newSelectedIntervalKey === null) return
    notebooksAndCellsStore.updateCellPropValNested(selectedCell.value.id, [
      {
        key: `distObj[${selectedDistribution.value}].selectedIntervalKey`,
        val: newSelectedIntervalKey
      }
    ])
  }
})

const currentValueX = computed({
  get: () => intervalData.value.x.currentValue,
  set: (newCurrentValueX) => {
    if (newCurrentValueX === undefined || newCurrentValueX === null) return
    notebooksAndCellsStore.updateCellPropValNested(selectedCell.value.id, [
      {
        key: `distObj[${selectedDistribution.value}].intervalData.x.currentValue`,
        val: newCurrentValueX
      }
    ])
  }
})

const currentValueA = computed({
  get: () => intervalData.value.a.currentValue,
  set: (newCurrentValueA) => {
    if (newCurrentValueA === undefined || newCurrentValueA === null) return
    notebooksAndCellsStore.updateCellPropValNested(selectedCell.value.id, [
      {
        key: `distObj[${selectedDistribution.value}].intervalData.a.currentValue`,
        val: newCurrentValueA
      }
    ])
  }
})

const currentValueB = computed({
  get: () => intervalData.value.b.currentValue,
  set: (newCurrentValueB) => {
    if (newCurrentValueB === undefined || newCurrentValueB === null) return
    notebooksAndCellsStore.updateCellPropValNested(selectedCell.value.id, [
      {
        key: `distObj[${selectedDistribution.value}].intervalData.b.currentValue`,
        val: newCurrentValueB
      }
    ])
  }
})

// --------------------------------------------------------------
// Code for the calculation of the probability
// --------------------------------------------------------------

// Array of [{parameter1: currentValue, parameter2: currentValue}],
// like [{mu: 0, sigma: 1}], pairs for calculstion functions in LunaMath.js
const paramObj = computed(() => {
  const result = {}
  if (!parameterData.value) {
    return result
  }
  for (const key in parameterData.value) {
    if (
      Object.hasOwn(parameterData.value[key], 'currentValue') &&
      typeof parameterData.value[key].currentValue === 'number'
    ) {
      result[key] = parameterData.value[key].currentValue
    }
  }
  return result
})

/**
 * Function to calculate the probability based on the selected interval
 * Selected interval intervalltype IS ONLY USED IN THE DISCRETE DISTRIBUTIONS
 * In the continuous distributions, the intervaltype is always "leftSided" P(X < x)
 * Dependency: LunaMath.js
 */

const calculateProbabilityFromCDF = ({ x, a, b, paramObj, interval, CDF, isDiscrete } = {}) => {
  // Check if the selected distribution has a CDF function in LunaMath.js
  if (!LunaMath[CDF]) {
    console.trace(`CDF function ${CDF} not found in LunaMath.js`)
    return NaN
  }
  // The variabel "intervaltype" is only used in the discrete distributions
  let ans = 0
  const n = 1000 // Number of steps for the integration
  switch (interval) {
    case 'leftSided': {
      // P(X < x)
      const xmin = Number(intervalData.value.x.minValue)
      if (isDiscrete) {
        ans = LunaMath[CDF]({ a: xmin, b: x, paramObj: paramObj, intervaltype: 'leftSided' })
      } else {
        ans = LunaMath[CDF]({ a: xmin, b: x, paramObj: paramObj, n: n })
      }
      break
    }
    case 'rightSided': {
      // P(X > x)
      const xmax = Number(intervalData.value.x.maxValue)
      if (isDiscrete) {
        ans = LunaMath[CDF]({ a: x, b: xmax, paramObj: paramObj, intervaltype: 'rightSided' })
      } else {
        ans = LunaMath[CDF]({ a: x, b: xmax, paramObj: paramObj, n: n })
      }
      break
    }
    case 'interval': {
      // P(a < X < b)
      if (isDiscrete) {
        ans = LunaMath[CDF]({ a: a, b: b, paramObj: paramObj, intervaltype: 'interval' })
      } else {
        ans = LunaMath[CDF]({ a: a, b: b, paramObj: paramObj, n: n })
      }
      break
    }
    case 'twoTailed': {
      // P(a > X > b) = P(X < a) + P(X > b)
      if (isDiscrete) {
        ans = LunaMath[CDF]({ a: a, b: b, paramObj: paramObj, intervaltype: 'twoTailed' })
      } else {
        ans = 1 - LunaMath[CDF]({ a: a, b: b, paramObj: paramObj, n: n })
      }
      break
    }
    default:
      return NaN
  }
  return ans
}

// The answer is rounded to the number of significant digits specified in the cell
const roundedAns = computed(() => {
  if (!selectedCell.value || !distObj.value) {
    console.trace('selectedCell.value error in ProbToolbar roundedProbAns:', selectedCell.value)
    return NaN
  }
  const ans = calculateProbabilityFromCDF({
    a: currentValueA.value,
    b: currentValueB.value,
    x: currentValueX.value,
    paramObj: paramObj.value,
    interval: selectedIntervalKey.value,
    CDF: distObj.value[selectedDistribution.value].CDF,
    isDiscrete: distObj.value[selectedDistribution.value].isDiscrete
  })
  // return ans
  const roundedAns =
    Math.round(ans * Math.pow(10, distObj.value[selectedDistribution.value].significantDigits)) /
    Math.pow(10, distObj.value[selectedDistribution.value].significantDigits)
  return roundedAns
})

watch(roundedAns, (newVal) => {
  notebooksAndCellsStore.updateCellPropValNested(selectedCell.value.id, [
    { key: `distObj[${selectedDistribution.value}].roundedAns`, val: newVal }
  ])
})

onMounted(() => {
  // On mount, read the computed's value and update the store.
  notebooksAndCellsStore.updateCellPropValNested(selectedCell.value.id, [
    { key: `distObj[${selectedDistribution.value}].roundedAns`, val: roundedAns.value }
  ])
})
</script>

<style scoped>
/* Using base style: \Luna4\src\renderer\src\assets\css\toolbar-base.css */
select,
input {
  height: 2.1em;
  box-sizing: border-box;
  vertical-align: middle;
  border: 0px solid var(--input-border-color, #ccc);
  border-radius: 4px;
}

option {
  font-size: inherit;
  font-family: inherit;
  color: var(--main-font-color, #000);
  background-color: var(--dropdown-bg-color, #fff);
}

select {
  font-size: inherit;
  font-family: inherit;
  color: var(--main-font-color, #000);
  background-color: var(--dropdown-bg-color, #fff);
}

input {
  font-size: inherit;
  font-family: inherit;
  border: 1px solid var(--input-border-color, #ccc);
  border-radius: 4px;
  width: fit-content;
  min-width: 5ch;
  max-width: 10ch;
}

.latex-renderer {
  display: inline-flex; /* Change to inline-flex */
  align-items: center; /* Center contents vertically */
  color: var(--main-font-color, rgb(119, 119, 119));
  background-color: transparent;
  height: 2.1em; /* Match other component heights */
}

.latex-label {
  display: flex;
  align-items: center;
  height: 2.1em;
}
</style>
