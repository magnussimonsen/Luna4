// electron.vite.config.mjs
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
        '@renderer': resolve('src/renderer/src')
        // Add this alias for "path"
        // path: 'path-browserify'
      }
    },
    plugins: [vue()],
    // Place worker config here so that workers used in the renderer pick it up
    worker: {
      format: 'es'
    }
  },
  build: {
    assetsInclude: ['**/*.mjs', '**/*.wasm', '**/*.data'], // Include Pyodide files
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
        format: 'es' // Ensure output is in ES module format
      }
    }
  }
})
