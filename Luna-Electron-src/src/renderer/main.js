// C:\Users\magnu\Luna\Luna4\src\renderer\src\main.js
// Imports: Global Dependencies and Plugins

// MarkdownIt and Plugins
import MarkdownIt from 'markdown-it'
import markdownItMark from 'markdown-it-mark' // Plugin for ==highlight==
// import markdownItKatex from 'markdown-it-katex'
import markdownItTexmath from 'markdown-it-texmath' // Math rendering alternative
// import hljs from 'highlight.js' // Import highlight.js
import 'highlight.js/styles/github.css' // or another theme of your choice
import markdownItHighlightjs from 'markdown-it-highlightjs' // Highlight.js plugin for code in MarkdownIt

// ThemeMirror import - using the correct package
// No CSS import needed for thememirror by vadimdemedes

// Global Styles
import './assets/styles/fonts.css' // Font definitions
import 'katex/dist/katex.min.css' // Include KaTeX CSS for proper rendering
import './assets/css/toolbar-base.css' // Base toolbar styles
// Fonts Configuration
import fonts from './assets/fonts/fonts.js'
import preloadFonts from './assets/fonts/preloadFonts.js'

// -----------------------------------------
// App Initialization and Configuration
// -----------------------------------------

const app = createApp(Luna4App) // Create Vue App
const pinia = createPinia() // Initialize Pinia Store
app.use(pinia) // Use Pinia

// Vue Core and Stores
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Luna4App from './Luna4App.vue' // Root Vue Component
//import { useFontStore } from '@/stores/Luna4FontStore.js'
import { useSettingsStore } from '@/stores/Luna4SettingsStore.js'
import { useThemeStore } from '@/stores/Luna4ThemeStore.js'

// Setting Initialization
const settingsStore = useSettingsStore()
const themeStore = useThemeStore()

settingsStore.initializeSettings()
themeStore.initializeTheme()

// MarkdownIt Configuration
const md = new MarkdownIt({
  html: false, // "We think it's the best choice and use it by default. " https://github.com/markdown-it/markdown-it/blob/master/docs/security.md
  linkify: true, // Autolink URLs
  typographer: true, // Enable smart typography
  breaks: true // Support line breaks
  /*highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (error) {
        console.error('Highlighting error:', error)
      }
    }
    return '' // Use default escaping
  }*/
})
  .use(markdownItMark)
  .use(markdownItHighlightjs, { auto: true, inline: true })
  .use(markdownItTexmath, {
    engine: 'katex', // Use KaTeX as the rendering engine
    delimiters: 'dollars', // Enable dollar-sign delimiters
    katexOptions: {
      strict: false,
      displayMode: true // Enable block math display mode
    } // KaTeX options
  })

// Provide MarkdownIt globally
app.config.globalProperties.$markdown = md

// Fonts Preloading and CSS Variable Setup
// Preload critical fonts
function preloadCriticalFonts(fonts) {
  fonts.forEach((font) => {
    const link = document.createElement('link') // Create a new <link> element
    link.rel = 'preload' // Set to preload for performance optimization
    link.href = font.href // The URL of the font file
    link.as = font.as // Specifies the type of resource (e.g., 'font')
    link.type = font.type // MIME type of the font file
    if (font.crossorigin) link.crossOrigin = font.crossorigin // Set cross-origin attribute if specified
    document.head.appendChild(link) // Append the <link> element to the <head> for preloading
  })
}
preloadCriticalFonts(preloadFonts)
// Set font families as CSS variables
// Redundant code not used in this application, but nice to have for later
function setFontFamilies(fontsConfig) {
  Object.entries(fontsConfig.family).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--font-family-${key}`, value)
  })
}
setFontFamilies(fonts)

// Mount Application
app.mount('#app') // Mount the Vue application
