/**
 * Use regex or use tokenizer and parser to convert Luna math string to Sympy math string?
 * Candidates: moo (tokenizer) and nearley (parser)
 * In development
 *  */

export default function lunaSympyAPI(lunaString) {
  const LunaToSympyMathJSON = {
    English: [
      { luna: '^', sympy: '**' },
      { luna: 'eval', sympy: 'sp.eval' },
      { luna: 'expand', sympy: 'sp.expand' },
      { luna: 'factor', sympy: 'sp.factor' },
      { luna: 'simp', sympy: 'sp.simp' },
      { luna: 'series', sympy: 'sp.series' },
      { luna: 'diff', sympy: 'sp.diff' },
      { luna: 'integral', sympy: 'sp.integral' },
      { luna: 'limit', sympy: 'sp.limit' },
      { luna: 'Mat', sympy: 'sp.Mat' },
      { luna: 'det', sympy: 'sp.det' },
      { luna: 'inv', sympy: 'sp.inv' },
      { luna: 'transpose', sympy: 'sp.transpose' },
      { luna: 'pi', sympy: 'sp.pi' },
      { luna: 'E', sympy: 'sp.E' },
      { luna: 'oo', sympy: 'sp.oo' },
      { luna: 'I', sympy: 'sp.I' },
      { luna: 'deg', sympy: 'sp.deg' },
      { luna: 'rad', sympy: 'sp.rad' },
      //{ luna: '!', sympy: 'sp.factorial' }, // Special case
      { luna: 'abs', sympy: 'sp.abs' },
      { luna: 'sin', sympy: 'sp.sin' },
      { luna: 'cos', sympy: 'sp.cos' },
      { luna: 'tan', sympy: 'sp.tan' },
      { luna: 'asin', sympy: 'sp.asin' },
      { luna: 'acos', sympy: 'sp.acos' },
      { luna: 'atan', sympy: 'sp.atan' },
      { luna: 'exp', sympy: 'sp.exp' },
      { luna: 'ln', sympy: 'sp.ln' },
      { luna: 'lg', sympy: 'sp.lg' },
      { luna: 'log', sympy: 'sp.log' }, // Special case
      { luna: 'sqrt', sympy: 'sp.sqrt' }
    ]
  }
}
