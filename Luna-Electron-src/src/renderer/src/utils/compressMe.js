/**
 * Compression utilities for renderer process
 * Uses IPC to call main process for compression/decompression
 * @module src/renderer/src/utils/compressMe
 */

/**
 * Asynchronously compress data using gzip via IPC to main process
 * @param {string} data - String data to compress
 * @returns {Promise<Uint8Array>} Promise resolving to compressed data
 */
function gzipCompressAsync(data) {
  // Make sure we're sending a string to the main process
  const dataToCompress = typeof data === 'string' ? data : JSON.stringify(data)
  return window.electron.ipcRenderer.invoke('compress-data', { data: dataToCompress })
}

/**
 * Asynchronously decompress gzipped data via IPC to main process
 * @param {Uint8Array|string} data - Compressed data to decompress
 * @returns {Promise<string>} Promise resolving to decompressed string
 */
function gzipDecompressAsync(data) {
  return window.electron.ipcRenderer.invoke('decompress-data', { data })
}

// Export the utility functions
export { gzipCompressAsync, gzipDecompressAsync }
