// File: LunaMath.js

// Reference for the standard built-in Math object in JavaScript

// Static Properties
// Math.E - Euler's number and the base of natural logarithms; approximately 2.718
// Math.LN10 - Natural logarithm of 10; approximately 2.303
// Math.LN2 - Natural logarithm of 2; approximately 0.693
// Math.LOG10E - Base-10 logarithm of E; approximately 0.434
// Math.LOG2E - Base-2 logarithm of E; approximately 1.443
// Math.PI - Ratio of a circle's circumference to its diameter; approximately 3.14159
// Math.SQRT1_2 - Square root of ½; approximately 0.707
// Math.SQRT2 - Square root of 2; approximately 1.414

// Static Methods
// Math.abs(x) - Returns the absolute value of x
// Math.acos(x) - Returns the arccosine of x in radians
// Math.acosh(x) - Returns the hyperbolic arccosine of x
// Math.asin(x) - Returns the arcsine of x in radians
// Math.asinh(x) - Returns the hyperbolic arcsine of x
// Math.atan(x) - Returns the arctangent of x in radians
// Math.atan2(y, x) - Returns the arctangent of the quotient of y/x in radians
// Math.atanh(x) - Returns the hyperbolic arctangent of x
// Math.cbrt(x) - Returns the cube root of x
// Math.ceil(x) - Returns the smallest integer greater than or equal to x
// Math.clz32(x) - Returns the number of leading zero bits of a 32-bit integer x
// Math.cos(x) - Returns the cosine of x (in radians)
// Math.cosh(x) - Returns the hyperbolic cosine of x
// Math.exp(x) - Returns e^x (Euler’s number raised to the power of x)
// Math.expm1(x) - Returns e^x - 1
// Math.floor(x) - Returns the largest integer less than or equal to x
// Math.fround(x) - Returns the nearest 32-bit single precision float representation of x
// Math.hypot(...values) - Returns the square root of the sum of squares of its arguments
// Math.imul(a, b) - Returns the result of the 32-bit integer multiplication of a and b
// Math.log(x) - Returns the natural logarithm (ln) of x
// Math.log10(x) - Returns the base-10 logarithm of x
// Math.log1p(x) - Returns the natural logarithm of 1 + x
// Math.log2(x) - Returns the base-2 logarithm of x
// Math.max(...values) - Returns the largest of zero or more numbers
// Math.min(...values) - Returns the smallest of zero or more numbers
// Math.pow(base, exponent) - Returns base^exponent
// Math.random() - Returns a pseudo-random number between 0 and 1
// Math.round(x) - Returns the value of x rounded to the nearest integer
// Math.sign(x) - Returns the sign of x (-1, 0, or 1)
// Math.sin(x) - Returns the sine of x (in radians)
// Math.sinh(x) - Returns the hyperbolic sine of x
// Math.sqrt(x) - Returns the positive square root of x
// Math.tan(x) - Returns the tangent of x (in radians)
// Math.tanh(x) - Returns the hyperbolic tangent of x
// Math.trunc(x) - Returns the integer portion of x, removing any fractional digits

// -----------------------------------
// Basic arithmetic helper functions
// -----------------------------------

export function round(num, places = 0) {
  return Math.round(num * 10 ** places) / 10 ** places
}

// -----------------------------------
// Basic trigonometric helper functions
// -----------------------------------

/**
 * Convert degrees to radians
 * @param {*} degrees
 * @returns
 */
export function rad(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Convert radians to degrees
 * @param {*} rad
 * @returns
 */
export function deg(rad) {
  return rad / (Math.PI / 180)
}

// -----------------------------------
// Random number helper functions
// -----------------------------------

/**
 * Generate a random integer between min and max
 * @param {number} min - The minimum value of the random number
 * @param {number} max - The maximum value of the random number
 * @returns {number} - A random integer between min and max
 * @error {Error} - If min is greater than max returns NaN
 */
export function randomInt({ min = 0, max = 1 } = {}) {
  if (typeof min !== 'number' || typeof max !== 'number' || min > max) {
    // throw new Error('Invalid input')
    return NaN
  }
  const num = Math.floor(Math.random() * (max - min + 1)) + min
  return num
}
// ---------------------------------------------
// Helper functions for probability calculations
// ---------------------------------------------

/**
 * limitProb - Limit the probability to be between 0 and 1
 * @param {number} prob - The probability to limit
 * @returns {number} - The probability limited to be between 0 and 1
 */
function limitProb(prob) {
  if (prob < 0) {
    return 0
  } else if (prob > 1) {
    return 1
  } else {
    return prob
  }
}

// -----------------------------------
// Basic array functions
// -----------------------------------

/**
 * Function to calculate the sum of an array of numbers
 * @param {Array<number>} arr - The array of numbers to sum
 * @returns {number} - The sum of the numbers in the array
 * @error {Error} - If input is not an array returns NaN
 */
export function sum(arr) {
  if (!Array.isArray(arr)) {
    return NaN
  }
  return arr.reduce((acc, val) => acc + val, 0)
}

// -----------------------------------
// Statistical functions
// -----------------------------------

/**
 * Function to calculate the mean of an array of numbers
 * @param {Array<number>} arr - The array of numbers to calculate the mean of
 * @returns {number} - The mean of the numbers in the array
 * @error {Error} - If input is not an array returns NaN
 */
export function mean(arr) {
  if (!Array.isArray(arr)) {
    return NaN
  }
  return sum(arr) / arr.length
}

/**
 * Function to calculate the median of an array of numbers
 * @param {Array<number>} arr - The array of numbers to calculate the median of
 * @returns {number} - The median of the numbers in the array
 * @error {Error} - If input is not an array returns NaN
 */
export function median(arr) {
  if (!Array.isArray(arr)) {
    return NaN
  }
  arr.sort((a, b) => a - b)
  const mid = Math.floor(arr.length / 2)
  return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2
}

// -----------------------------------
// Factorial and Combinations functions
// -----------------------------------

/**
 * An array of factorials from 0 to 170
 * @returns {Array} - An array of factorials from 0 to 170
 */

// Precompute factorials from 0 to 170 in an array.
const FACTORIALS = (() => {
  const arr = [1] // 0! = 1
  for (let i = 1; i <= 170; i++) {
    arr.push(arr[i - 1] * i)
  }
  return arr
})()

/**
 * Factorial function using a precomputed array of factorials
 * @param {number} n - The number to calculate the factorial of
 * @returns {number} - The factorial of n
 * @error {Error} - If n is not an integer or is negative returns NaN
 */

export function factorial(n) {
  if (!Number.isInteger(n) || n < 0) {
    return NaN
  }
  // For n > 170, do Stirling approximation or return Infinity, etc.
  if (n > 170) {
    return Math.round(Math.sqrt(2 * Math.PI * n) * Math.pow(n / Math.E, n))
  }
  return FACTORIALS[n]
}

/**
 * Combinations function using the factorial function
 * @param {number} n - Total number of items
 * @param {number} r - Number of items to choose
 * @returns {number} - Number of combinations
 */

export function nCr(n, r) {
  // safety checks in factorial function is sufficient
  return factorial(n) / (factorial(r) * factorial(n - r))
}

/**
 * Permuation function using the factorial function
 * @param {number} n - Total number of items
 * @param {number} r - Number of items to choose
 * @returns {number} - Number of permutations
 */
export function nPr(n, r) {
  if (r < 0) {
    return NaN
  }
  return factorial(n) / factorial(n - r)
}

// -----------------------------------
// Integration functions
// -----------------------------------

/**
 * Helper function to verify input for the integrate functions
 * @param {Function} f - The function to integrate
 * @param {number} a - The lower limit of integration
 * @param {number} b - The upper limit of integration
 * @param {number} n - Number of subintervals
 * @throws {Error} - If input is invalid
 */
function checkIntegrateInput({ f, a, b, n = 1000 } = {}) {
  if (n < 1 || !Number.isInteger(n) || n > 1000000) {
    return NaN
  }
  if (a === undefined || b === undefined) {
    return NaN
  }
  if (typeof f !== 'function') {
    throw new Error('Invalid value for f in integrate')
  }
}

/**
 * Integrates f(x) from a to b using the rectangle rule with n subintervals
 * @param {Function} f - The function to integrate
 * @param {number} a - The lower limit of integration
 * @param {number} b - The upper limit of integration
 * @param {number} n - Number of subintervals (larger n -> more accuracy)
 * @returns {number} - Approximate value of the definite integral
 */
export function recintegrate({ f, a, b, n = 1000, safe = false } = {}) {
  if (safe) {
    checkIntegrateInput({ f: f, a: a, b: b, n: n })
  }
  let h = (b - a) / n
  let sum = 0
  for (let i = 0; i < n; i++) {
    sum += f(a + i * h)
  }
  return h * sum
}

/**
 * Integrates f(x) from a to b using the trapezoidal rule with n subintervals
 * @param {Function} f - The function to integrate
 * @param {number} a - The lower limit of integration
 * @param {number} b - The upper limit of integration
 * @param {number} n - Number of subintervals (larger n -> more accuracy)
 * @returns {number} - Approximate value of the definite integral
 */
export function trapintegrate({ f, a, b, n = 1000, safe = true } = {}) {
  if (safe) {
    checkIntegrateInput({ f: f, a: a, b: b, n: n })
  }
  const h = (b - a) / n
  let sum = 0.5 * (f(a) + f(b))
  for (let i = 1; i < n; i++) {
    sum += f(a + i * h)
  }
  return sum * h
}

/**
 * Integrates f(x) from a to b using the midpoint rule with n subintervals
 * @param {Function} f - The function to integrate
 * @param {number} a - The lower limit of integration
 * @param {number} b - The upper limit of integration
 * @param {number} n - Number of subintervals (larger n -> more accuracy)
 * @returns {number} - Approximate value of the definite integral
 */
export function midpointintegrate({ f, a, b, n = 1000, safe = true } = {}) {
  if (safe) {
    checkIntegrateInput({ f: f, a: a, b: b, n: n })
  }
  const h = (b - a) / n
  let sum = 0
  for (let i = 0; i < n; i++) {
    sum += f(a + (i + 0.5) * h)
  }
  return sum * h
}

/**
 * Integrates f(x) from a to b using the simpson's rule with n subintervals
 * @param {Function} f - The function to integrate
 * @param {number} a - The lower limit of integration
 * @param {number} b - The upper limit of integration
 * @param {number} n - Number of subintervals (larger n -> more accuracy)
 * @returns {number} - Approximate value of the definite integral
 */
export function simpsonintegrate({ f, a, b, n = 1000, safe = true } = {}) {
  if (safe) {
    checkIntegrateInput({ f: f, a: a, b: b, n: n })
  }
  // We add a safety check to prevent returning a result if
  // the width of the subintervals is too large
  if (Math.abs(a - b) > n / 2) {
    return NaN
  }
  const h = (b - a) / n
  let sum = f(a) + f(b)
  for (let i = 1; i < n; i++) {
    sum += 2 * f(a + i * h) * ((i % 2) + 1)
  }
  return (sum * h) / 3
}

/**
 * Main integral function that calls the appropriate integration method
 * @param {Function} f - The function to integrate
 * @param {number} a - The lower limit of integration
 * @param {number} b - The upper limit of integration
 * @param {number} n - Number of subintervals (larger n -> more accuracy)
 * @param {string} method - The integration method to use ('trap', 'rec', or 'midpoint')
 * @returns {number} - Approximate value of the definite integral
 */

export function integrgate({ f, a, b, n = 1000, method = 'simpson', safe = true } = {}) {
  if (safe) {
    checkIntegrateInput({ f: f, a: a, b: b, n: n })
  }
  if (method === 'simpson' || method === undefined) {
    // Default to trapezoidal rule
    return trapintegrate({ f: f, a: a, b: b, n: n, safe: false })
  } else if (method === 'rec') {
    return recintegrate({ f: f, a: a, b: b, n: n, safe: false })
  } else if (method === 'midpoint') {
    return midpointintegrate({ f: f, a: a, b: b, n: n, safe: false })
  } else if (method === 'trap') {
    return simpsonintegrate({ f: f, a: a, b: b, n: n, safe: false })
  } else {
    throw new Error('Invalid integration method')
  }
}

// -----------------------------------
// Special functions
// -----------------------------------

/**
 * The Error function approximation (Equation 7.1.26 from Abramowitz & Stegun)
 * @param {number} x - The value to calculate the error function for
 * @returns {number} - The value of the error function at x
 * @error {Error} - If x is not a number returns NaN
 */

export function erf(x) {
  if (typeof x !== 'number') {
    return NaN
  }
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  // The error function is an odd function, so we need to adjust the sign
  // in the approximation if z is negative.
  return x >= 0 ? erf : -erf
}

// -----------------------------------
// Continuous probability functions
// -----------------------------------

/**
 * The normal probability density function
 * @param {number} x - The value to calculate the PDF for
 * @param {number} mu - The mean of the normal distribution
 * @param {number} sigma - The standard deviation of the normal distribution
 * @returns {number} - The value of the PDF at x
 * @error {Error} - If sigma is not a positive number or if x or mu are not numbers returns NaN
 */
export function normalPDF({ x = 0, paramObj } = {}) {
  const mu = paramObj.mu
  const sigma = paramObj.sigma
  // example of use: normalPDF({x: 0, mu: 0, sigma: 1})
  if (sigma <= 0 || typeof sigma !== 'number') {
    console.trace('Standard deviation sigma must a be positive number')
    return NaN
  }
  if (typeof x !== 'number' || typeof mu !== 'number') {
    // console.trace('x and mu must be numbers')
    return NaN
  }
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2))
}

/**
 * The normal cumulative distribution function
 * Calculates the probability that a normally distributed variable falls between a and b.
 * @param {number} a - The lower limit of integration
 * @param {number} b - The upper limit of integration
 * @param {Object} paramObj - An object containing the mean and standard deviation of the normal distribution
 * @returns {number} - The approximate value of the CDF from a to b
 * @dependency normalPDF
 * @dependency erf
 */
export function normalCDF({ a, b, paramObj } = {}) {
  // The normal CDF is calculated using the error function approximation
  // P(X<x) = 1/2(1+erf(x/sqrt(2)))
  const mu = paramObj.mu
  const sigma = paramObj.sigma
  if (typeof (a || b || mu || sigma) !== 'number' || sigma <= 0) {
    console.trace('Invalid input for sigma, a, or b. Returning NaN')
    return NaN
  }
  // Input a, b may be "+-Infinity"
  if (!isFinite(a)) {
    a = mu - 10 * sigma // For a lower limit of -Infinity
  }
  if (!isFinite(b)) {
    b = mu + 10 * sigma // For an upper limit of Infinity
  }
  var sqrtSigmaSigmaX2 = Math.sqrt(2 * sigma * sigma)
  // This converts the raw score (z) into a standardized form relative to mean and sigma.
  var za = (a - mu) / sqrtSigmaSigmaX2 // lower bound
  var zb = (b - mu) / sqrtSigmaSigmaX2 // upper bound
  // P(X<x) = 1/2(1+erf(x/sqrt(2))) and P(a < X < b) = P(X < b) - P(X < a)
  return 0.5 * (1 + erf(zb / Math.sqrt(2)) - (1 + erf(za / Math.sqrt(2))))
}

/**
 * The exponential probability density function
 * @param {number} x - The value to calculate the PDF for
 * @param {number} lambda - The rate parameter of the exponential distribution
 * @returns {number} - The value of the PDF at x
 * @error {Error} - If lambda is not a positive number or if x is not a number returns NaN
 */
export function exponentialPDF(x, lambda) {
  if (lambda <= 0 || typeof lambda !== 'number') {
    console.trace('Rate parameter lambda must be positive')
    return NaN
  }
  if (typeof x !== 'number') {
    // throw new Error('x must be a number')
    return NaN
  }
  // Replace infinite limits with finite approximations
  if (!isFinite(x)) {
    x = 100 / lambda // For an upper limit of Infinity
  }
  return lambda * Math.exp(-lambda * x)
}

/**
 * The exponential cumulative distribution function
 * @param {number} a - The lower limit of integration
 * @param {number} b - The upper limit of integration
 * @param {Array<number>} paramList - An array containing [lambda] where lambda is the rate parameter
 * @returns {number} - The approximate value of the CDF from a to b
 * @dependency exponentialPDF
 * @dependency trapintegrate
 */
export function exponentialCDF({ a, b, paramObj } = {}) {
  const lambda = paramObj.lambda
  // Check for valid lambda, a, b, and parameter types
  if (lambda <= 0 || typeof lambda !== 'number') {
    console.trace('Rate parameter lambda must be a positive number in exponentialCDF')
    return NaN
  }
  if (typeof a !== 'number' || typeof b !== 'number' || a > b) {
    console.trace('Invalid input for a or b in exponentialCDF')
    return NaN
  }

  // Replace infinite limits with finite approximations
  if (!isFinite(a)) {
    a = 0 // For a lower limit of 0
  }
  if (!isFinite(b)) {
    b = 10 / lambda // For an upper limit of Infinity
  }
  const result = 1 - Math.exp(-lambda * b) - (1 - Math.exp(-lambda * a))
  return result
}

// -----------------------------------
// Discrete probability functions
// -----------------------------------

// Helper function to check valid interval types
function isValidIntervalType(intervaltype) {
  if (
    intervaltype === undefined ||
    typeof intervaltype !== 'string' ||
    (intervaltype !== 'rightSided' &&
      intervaltype !== 'leftSided' &&
      intervaltype !== 'interval' &&
      intervaltype !== 'twoTailed')
  ) {
    return false
  }
  return true
}

/**
 * Computes the binomial probability mass function (PMF).
 * Given `n` Bernoulli trials each with success probability `p`,
 * this function returns the probability of observing exactly `k` successes.
 * @function binomialPMF
 * @param {Object} [options] - The parameters object.
 * @param {number} [options.k] - The number of successes (must be an integer ≥ 0).
 * @param {number} [options.n] - The number of trials (must be an integer ≥ 0).
 * @param {number} [options.p] - The probability of success on each trial (0 ≤ p ≤ 1).
 * @returns {number} The probability of getting `k` successes in `n` trials.
 * Returns `0` if `k > n`.
 * Returns `NaN` if any inputs are invalid (e.g., non-integers or out-of-bounds probabilities).
 */
export function binomialPMF({ k, n, p } = {}) {
  if (
    !Number.isInteger(k) ||
    !Number.isInteger(n) ||
    !Number.isFinite(p) ||
    k < 0 ||
    n < 0 ||
    p < 0 ||
    p > 1
  ) {
    return NaN
  }
  if (k > n) {
    return 0
  }
  return nCr(n, k) * p ** k * (1 - p) ** (n - k)
}

/**
 * Computes various cumulative probabilities for the Binomial distribution.
 *
 * Given `n` Bernoulli trials each with success probability `p`, this function
 * can compute:
 *
 * - **leftSided**: \(P(X \le b)\)
 * - **rightSided**: \(P(X \ge a)\)
 * - **interval**: \(P(a \le X \le b)\)
 * - **twoTailed**: \(P(X \le a \text{ or } X \ge b)\)
 *
 * The range `[a, b]` is inclusive of the endpoints.
 *
 * @function binomialCDF
 * @param {Object} [options] - The parameters object.
 * @param {number} [options.a] - The lower bound for the number of successes (integer ≥ 0).
 * @param {number} [options.b] - The upper bound for the number of successes (integer ≥ a).
 * @param {Object} [options.paramObj] - An object containing `n` (number of trials) and `p` (success probability).
 * @param {number} [options.paramObj.n] - Must be an integer ≥ 0.
 * @param {number} [options.paramObj.p] - Must be a finite number within [0, 1].
 * @param {string} [options.interval='leftSided'] - The type of interval to compute.
 *    Can be `"leftSided"`, `"rightSided"`, `"interval"`, or `"twoTailed"`.
 * @returns {number}
 *    The cumulative probability over the specified range of successes.
 *    Returns `NaN` if inputs are invalid.
 *    In certain edge cases, returns `0` or `1` (e.g., if the bounds exceed `[0, n]`).
 *
 * @dependency binomialPMF
 */
export function binomialCDF({ a, b, paramObj, intervaltype } = {}) {
  const n = paramObj.n
  const p = paramObj.p
  if (!isValidIntervalType(intervaltype)) {
    console.trace('Invalid interval type in binomialCDF')
    return
  }
  // Basic input validation
  if (!Number.isInteger(n) || !Number.isFinite(p) || n < 0 || p < 0 || p > 1) {
    console.trace('Invalid input for n or p in binomialCDF')
    return NaN
  }
  // Handle different interval types
  if (intervaltype === 'leftSided') {
    a = 0
    if (!Number.isInteger(b) || b < 0) {
      return NaN
    }
    if (b > n) {
      return 1
    }
    let sum = 0
    for (let i = 0; i <= b; i++) {
      sum += binomialPMF({ k: i, n, p })
    }
    return sum
  } else if (intervaltype === 'rightSided') {
    b = n
    if (!Number.isInteger(a) || a < 0) {
      return NaN
    }
    if (a > n) {
      return 0
    }
    let sum = 0
    for (let i = a; i <= n; i++) {
      sum += binomialPMF({ k: i, n, p })
    }
    return sum
  } else if (intervaltype === 'interval') {
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < a) {
      return NaN
    }
    if (a > n) {
      // Entire interval is out of range
      return 0
    }
    if (b > n) {
      // Cap b to n
      b = n
    }
    let sum = 0
    for (let i = a; i <= b; i++) {
      sum += binomialPMF({ k: i, n, p })
    }
    return sum
  } else if (intervaltype === 'twoTailed') {
    // Two-tailed: P(X ≤ a) + P(X ≥ b)
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b <= a) {
      return NaN
    }
    if (a > n) {
      // a, b out of range
      return 0
    }
    if (b > n) {
      // Cap b to n
      b = n
    }
    let sum = 0
    for (let i = 0; i <= a; i++) {
      sum += binomialPMF({ k: i, n, p })
    }
    for (let i = b; i <= n; i++) {
      sum += binomialPMF({ k: i, n, p })
    }
    return sum
  }

  // If an unknown interval type was provided, return NaN
  return NaN
}

/**
 * hypergeometricPMF - The hypergeometric probability mass function
 * @param {number} k - The number of observed successes
 * @param {number} N - The population size
 * @param {number} n - The number of draws
 * @param {number} K - The number of success states in the population,
 * @returns {number} - The probability of k successes in n trials
 * @error {Error} - If k or n are not integers or if p is not between 0 and 1 returns NaN
 * @dependency nCr
 */

export function hypergeometricPMF(k, N, n, K) {
  if (
    !Number.isInteger(k) ||
    !Number.isInteger(N) ||
    !Number.isInteger(n) ||
    !Number.isInteger(K) ||
    k < 0 ||
    N < 0 ||
    K < 0 ||
    n < 0 ||
    k > n ||
    n > N ||
    K > N
  ) {
    return NaN
  }
  return (nCr(K, k) * nCr(N - K, n - k)) / nCr(N, n)
}

/**
 * The hypergeometric cumulative distribution function
 * @param {number} a - Lower bound of number of successes
 * @param {number} b - Upper bound of number of successes
 * @param {number} k - The number of observed successes
 * @param {number} N - The population size
 * @param {number} n - The number of draws
 * @param {number} K - The number of success states in the population,
 * @returns {number} - The probability of k successes in n trials
 * @error {Error} - If k or n are not integers or if p is not between 0 and 1 returns NaN
 * @dependency hypergeometricPMF
 */

export function hypergeometricCDF(a, b, paramList, interval = 'leftSided') {
  let [N, n, K] = paramList
  if (interval === 'leftSided') {
    a = 0
    if (
      !Number.isInteger(b) ||
      !Number.isInteger(N) ||
      !Number.isInteger(n) ||
      !Number.isInteger(K) ||
      b < 0 ||
      N < 0 ||
      K < 0 ||
      n < 0 ||
      K > N
    ) {
      return NaN
    }
    if (b > n) {
      return 1
    }
    let sum = 0
    for (let i = 0; i <= b; i++) {
      sum += hypergeometricPMF(i, N, n, K)
    }
    return limitProb(sum)
  }
}
