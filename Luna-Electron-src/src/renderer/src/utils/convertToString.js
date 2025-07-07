// File: C:\Users\magnu\Luna\Luna4\src\renderer\src\utils\convertToString.js
// Description: This file is used to convert a message to a string.
// Convert a message to a string.
// If the message is an object or function, convert it to a JSON string.
// If the message is not a string, convert it to a string.
// Return the message as a string.

export function convertToString(msg) {
  if (typeof msg === 'undefined' || msg === null) {
    return ''
  } else if (typeof msg === 'object' || typeof msg === 'function') {
    return JSON.stringify(msg)
  } else if (typeof msg !== 'string') {
    return msg.toString()
  }
  return msg
}
