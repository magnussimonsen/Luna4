/**
 * CAS - Sympy API
 *
 * This is a custom API for the CAS cell that is used to interact with the sympy library.
 *
 * The API is a function that takes a string as input and returns a string with the sympy code
 *
 * Example
 * CASRawInputString: solve x^2+y^2=0 and x = y for x and y
 * return { SympyCode: "import sympy as sp
 * from sympy.abc import x, y
 * eq1 = sp.Eq(x**2+y**2,16)
 * eq2 = sp.Eq(x,y)
 * sol = sp.solve((eq1, eq2), (x, y))" }
 */

/* Template for the output object */
/* Python variables to retrieve from the python code produced  br the API */
/* This is the source of truth for the variables for this object */
let sympyVariablesObject = {
  solutions: '',
  sympyErrorString: '',
  latexSolutions: '',
  latexSolutionSet: ''
}

let sympyVariablesObjectString = JSON.stringify(sympyVariablesObject)

import { aboutLuna } from '../assets/aboutLuna.js'
import lunaSympyAPISolve from './LunaSympyAPI_SOLVE.js'

export function lunaSympyAPI(cellId, cellContent) {
  let apiErrorString = ''
  if (!cellId) {
    // If the cellId is not provided, return an error message
    return {
      sympyCodeWrapped: '',
      sympyCode: '',
      sympyVariablesObject: sympyVariablesObject,
      sympyVariablesObjectString: sympyVariablesObjectString,
      apiErrorString: 'No cellId provided. Please report this bug to ' + aboutLuna.webpage
    }
  } else if (!cellContent || typeof cellContent !== 'string' || cellContent.trim() === '') {
    // If the input is not a string, or an empty string,
    return {
      sympyCodeWrapped: '',
      sympyCode: '',
      sympyVariablesObject: sympyVariablesObject,
      sympyVariablesObjectString: sympyVariablesObjectString,
      apiErrorString: 'Please check your input and try again.'
    }
  }
  // Cell content is a string. We can now start processing the input
  cellContent = cellContent.trim()
  const solveReturn = lunaSympyAPISolve(cellContent)
  const sympyAbcImportString = solveReturn[0]
  let solveCode = solveReturn[1]
  let latexSolveSetCode = solveReturn[2]
  const errorMessage = solveReturn[3]
  if (errorMessage) {
    console.log('Error message:', errorMessage)
    return {
      sympyCodeWrapped: '',
      sympyCode: '',
      sympyVariablesObject: sympyVariablesObject,
      sympyVariablesObjectString: '',
      apiErrorString: errorMessage
    }
  }
  console.log(sympyAbcImportString)
  console.log(solveCode)
  console.log('latexSolveSetCode:', latexSolveSetCode)
  console.log(errorMessage)
  // -------------------
  // API CODE GOES HERE
  // -------------------

  // Solve command API
  // For now we hardcode a string to return
  let sympyCode = `
from sympy import *
from sympy.printing.mathml import mathml
${sympyAbcImportString}
solutions = ${solveCode}
latexSolutions = latex(solutions)
latexSolutionSet = ${latexSolveSetCode}
if latexSolutionSet == False:
  latexSolutionSet = ""
# THIS LIST OF VARIABLES MUST MATCH THE pythonVariabelsObject template above (for reference) and the divs in LunaCasCellComponent.vue
# -------------------
# latexEq = sp.latex(eq)
# -------------------
# latexAns = sp.latex(ans)
# -------------------
# ansDecimal = [sp.N(a) for a in ans]
# latexAnsDecimal = sp.latex(ansDecimal)
# -------------------
# solutionsSet = sp.solveset(eq, x)
# -------------------
# solutionsReal = sp.solve(eq, x, sp.Reals)
# solutionsSetReal = sp.solveset(eq, x, sp.Reals)
# -------------------
# solutionsDecimal = [sol.evalf() for sol in solutions]
# solutionsSetDecimal = sp.FiniteSet(*[s.evalf() for s in solutionsSet])
# -------------------
# latexSolutionsReal = spl.latex(solutionsReal)
# latexSolutionsSetReal = ', '.join([sp.latex(s) for s in solutionsSetReal])
# -------------------
# latexSolutions = sp.latex(solutions)
#latexSolutionsSet = sp.latex(solutionsSet)
# latexSolutions = ', '.join([sp.latex(s) for s in solutions])
# latexSolutionsSet = ', '.join([sp.latex(s) for s in solutionsSet])
# -------------------
# Raise an exception to test the error handling
# raise Exception("This is a test exception")
# -------------------
# apiErrorString = ${apiErrorString}
sympyErrorString = "Error string test message"
`

  // Prepare the sympy code by indenting each line.
  // This indentation allows us to embed the sympy code within a try/except block.
  const indentedCode = sympyCode
    .split('\n')
    .map((line) => '    ' + line)
    .join('\n')

  //------------------------------------------
  // Wrap the sympy code in a try/except block
  // -----------------------------------------

  let sympyCodeWrapped = `
try:
${indentedCode}
except Exception as e:
  import traceback
  sympyErrorString = traceback.format_exc() # Custom error message
  sympyFullErrorString = str(e) # Full error message from exception
`
  return {
    sympyCodeWrapped: sympyCodeWrapped ?? '',
    sympyCode: sympyCode ?? '',
    sympyVariablesObject: sympyVariablesObject,
    sympyVariablesObjectString: sympyVariablesObjectString,
    apiErrorString: apiErrorString ?? ''
  }
}
