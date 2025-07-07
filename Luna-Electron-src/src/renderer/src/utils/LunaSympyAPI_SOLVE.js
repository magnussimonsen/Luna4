export default function lunaSympyAPISolve(cellContent) {
  // This function processes the input string and generates a sympy code for solving equations
  // Returns an array with the sympy code, the import string for variables, and an error message if any
  // return [sympyAbcimportString, sympyCode, errorMessage]
  let errorMessage =
    'Please check your input and try again.\n' +
    'The syntax for the solve command is:\n' +
    'solve <equation1> and <equation2> ... for <var1> and <var2>...\n' +
    'For example:\n' +
    'solve x**2+4*x+4=0 for x \n' +
    'or\n' +
    'solve x**2+y**2=1 and x = y for x and y\n'
  // Example syntax for solve:
  // One equation: solve x^2+y^2=0 for x
  // Two equations: solve x^2+y^2=0 and x = y for x and y
  // Three equations: solve x^2+y^2+z^2=0 and x = y+z and x+y+z=0 for x and y and z (or for x, y and z)

  // Check if the first word is "solve"
  const firstWord = cellContent.split(' ')[0].toLowerCase()
  if (firstWord !== 'solve') {
    return ['', '', '', errorMessage]
  }

  // Check if the input contains " for " with whitespace around it
  const forIndex = cellContent.indexOf(' for ')
  if (forIndex === -1) {
    return ['', '', '', errorMessage]
  }

  // Get number of equations (number of "=" signs)
  const numEq = (cellContent.match(/=/g) || []).length
  if (numEq < 1) {
    return ['', '', '', errorMessage]
  }

  // Function to extract equations from the input string.
  // It expects a syntax like "solve <equation1> and <equation2> ... for <var1> and <var2>..."
  // Returns a array of strings of this type: sp.Eq(<right>, <left>), sp.Eq(<right>, <left>)
  function extractEquations(inputStr) {
    // Use regex to capture text between "solve" and "for"
    const eqMatch = inputStr.match(/solve\s+(.*?)\s+for/i)
    if (!eqMatch) {
      return ['', '', '', errorMessage]
    }
    // The match return array: [0] is the full match, [1] is the first capturing group
    const eqStr = eqMatch[1] // e.g., "x^2+y^2=0 and 2*x +3 = y"

    // Split the equation string by the word "and"
    const eqParts = eqStr.split(/\s+and\s+/i)
    const spEqArray = []

    // Process each equation
    eqParts.forEach((eq) => {
      const parts = eq.split('=')
      if (parts.length !== 2) {
        errorMessage = ''
        return ['', '', '', errorMessage]
      }
      // Here we need to run a function that converts from lunasyntax to sympy syntax
      // For example, x^2+y^2 should be converted to x**2 + y**2
      const leftSide = parts[0].trim()
      const rightSide = parts[1].trim()
      spEqArray.push(`Eq(${rightSide}, ${leftSide})`)
    })
    return spEqArray
  }

  // Function to extract independent variables from the input string.
  // It expects them to appear after the "for" keyword.
  function extractIndependentVariables(inputStr) {
    // Capture all text after "for"
    const varMatch = inputStr.match(/for\s+(.*)/i)
    if (!varMatch) {
      return ['', '', '', errorMessage]
    }
    let varStr = varMatch[1] // e.g., "x and y" or "x, y and z"

    // Replace commas with " and " to standardize splitting
    varStr = varStr.replace(/,/g, ' and ')

    // Split the string by "and", trim each variable, and filter out empties
    const variables = varStr
      .split(/\s+and\s+/i)
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
    return variables
  }

  // Function to create the sympy syntax for solving the equations.

  // Function that returns sympy code to set variables as symbols.
  // returns for example from sympy.abc import x, y
  function setVariablesAsSymbols(variables) {
    if (variables.length === 0) {
      return ''
    }
    // Create a string for the import statement
    return 'from sympy.abc import ' + variables.join(', ')
  }

  // Extract equations and independent variables from the cellContent
  const spEqArray = extractEquations(cellContent)
  const variables = extractIndependentVariables(cellContent)
  const sympyAbcImportString = setVariablesAsSymbols(variables)

  // Generate a sympy-style command.
  // For example, it will generate: "solve([<right1>, <left1>, <right2>, <left2>], [x, y])"
  const solveCode = `solve([${spEqArray.join(', ')}], [${variables.join(', ')}])`
  let latexSolveSetCode = 'False'
  if (variables.length === 1) {
    latexSolveSetCode = `latex(solveset(${spEqArray.join(', ')}, ${variables[0]}))`
  }
  console.log(latexSolveSetCode)
  return [sympyAbcImportString, solveCode, latexSolveSetCode, '']
}
