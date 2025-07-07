<!-- \components\LunaMarkdownRenderer.vue -->
<!-- eslint-disable vue/no-v-html THIS IS OK USING HTML=FALSE IN MARKDOWN-IT-LIBRARY-->
<template>
  <div class="markdown-rendered" v-html="renderedMarkdown"></div>
</template>

<script setup>
//import { useFontStore } from '@/stores/Luna4FontStore'
import { computed, getCurrentInstance } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

// const fontStore = useFontStore()
// Access global Markdown-it instance
const { proxy } = getCurrentInstance()
const markdown = proxy.$markdown
const renderedMarkdown = computed(() => {
  if (!props.content) return ''
  const rawHtml = markdown.render(props.content)
  return rawHtml.trim()
})
</script>

<style>
.markdown-rendered {
  word-break: break-word;
  color: var(--markdown-text-color, #000000);
  cursor: text;
  word-wrap: break-word; /* Break long words to fit within container */
  word-break: break-word; /* Break long words if necessary */
  /*white-space: pre-wrap;  Preserve newlines and allow wrapping */
  overflow-wrap: break-word; /* Ensure wrapping works in modern browsers */
  font-size: inherit;
}
</style>
