// File: C:\Users\magnu\Luna\Luna4\src\renderer\src\utils\handleCopy.js
// Function to handle copying only plain text

function handleCopy(event) {
  // Prevent the default copy behavior
  event.preventDefault()

  // Get the selected text
  const selection = window.getSelection()
  const selectedText = selection.toString()

  // Set only the plain text to the clipboard
  if (selectedText) {
    navigator.clipboard
      .writeText(selectedText)
      .catch((err) => console.error('Failed to copy text: ', err))
  }
}

// Export the function so it can be imported elsewhere
export default handleCopy
