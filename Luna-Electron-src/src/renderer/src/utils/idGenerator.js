// idGenerator.js
import { v4 as uuidv4 } from 'uuid'

// Unique ID generator function
export const generateUniqueId = () => {
  return uuidv4()
}
