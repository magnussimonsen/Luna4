import crypto from 'node:crypto'

// Example 32-byte key
// In a production environment, this should be securely stored and retrieved
const encryptionKey = Buffer.from(
  '4bf6ef06b0ecfd3926046a5965d1a73197f4f7a2cb1570917dc7086de2a2e67d',
  'hex'
)

/**
 * Encrypts data using AES-256-CBC
 * @param {Buffer} plaintextBuffer - The data to encrypt
 * @returns {string} - The encrypted data as a hex string with format "iv:encryptedData"
 */
function encryptData(plaintextBuffer) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv)
  const encryptedBuffer = Buffer.concat([cipher.update(plaintextBuffer), cipher.final()])
  // Return iv + encrypted data in hex
  return `${iv.toString('hex')}:${encryptedBuffer.toString('hex')}`
}

/**
 * Decrypts data that was encrypted with encryptData
 * @param {string} ciphertext - The encrypted string in "iv:encryptedData" format
 * @returns {Buffer} - The decrypted data as a Buffer
 */
function decryptData(ciphertext) {
  const [ivHex, encryptedHex] = ciphertext.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv)
  const decryptedBuffer = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ])
  return decryptedBuffer
}

// Export the encryption functions for use in other modules
export { encryptData, decryptData }
