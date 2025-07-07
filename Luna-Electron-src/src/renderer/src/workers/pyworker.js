/* pyworker.js */

// Bugsreport vs error handling is an attempt to separate user errors from bugs in the code

/**
 * - Pyodide enables us to run Python in the browser.
 */
import { loadPyodide /* @vite-ignore */ } from '../assets/pyodide/pyodide.mjs'
import { convertToString } from '../utils/convertToString.js'
import { generateUniqueId } from '../utils/idGenerator'

/**
 * - Declare variables to hold the Pyodide instance and a promise indicating when Pyodide is ready.
 * - This ensures that Pyodide is initialized only once.
 */
let pyodide
let pyodideReady = null // Will store the promise for Pyodide initialization
/**
 * - Lazily initializes Pyodide when needed.
 * - Chooses an indexURL based on the environment (development/production).
 * - Loads Pyodide and preloads essential packages (numpy and matplotlib).
 * - Returns the Pyodide instance once initialization is complete.
 */

async function initPyodide() {
  if (!pyodideReady) {
    // Any code that needs Pyodide to be fully loaded
    // can now use: await pyodideReady, or in this case, await initPyodide()
    // This ensures that Pyodide is ready before it tries to use it.
    pyodideReady = (async () => {
      try {
        const indexURL =
          process.env.NODE_ENV === 'development'
            ? '/src/assets/pyodide/'
            : `file:///resources/pyodide/`
        pyodide = await loadPyodide({ indexURL }) // loadPyodide from import above
        await pyodide.loadPackage(['matplotlib', 'pillow'])
        // Warm up matplotlib by triggering the font cache build.
        await pyodide.runPythonAsync(`
# THIS IS PYTHON CODE
try:
 import matplotlib.pyplot as plt
 plt.figure()
 plt.close()
 # lunaSympyAPI runs import sympy as sp, so we do not need to import sympy here
except Exception as e:
 pass
     `)
        try {
          // First check if 'e' exists in the Python namespace
          const eExists = await pyodide.runPythonAsync("'e' in globals()")
          if (eExists) {
            const errorProxy = await pyodide.runPythonAsync('e')
            let newError = errorProxy.toString() ?? 'No error'
            if (errorProxy && typeof errorProxy.destroy === 'function') {
              errorProxy.destroy()
            }
            if (newError !== 'No error') {
              reportBug({
                errorType: 'error',
                errorLocation: 'except Exception error in initPyodide()',
                customMessage: 'Failed to initialize Pyodide',
                error: 'Error from pyodide:' + convertToString(newError)
              })
            }
          }
        } catch (error) {
          reportBug({
            // If import matplotlib.pyplot as plt fails, this is a bug in Luna, not error in user code
            errorType: 'error',
            errorLocation: 'await pyodide.runPythonAsync(error) in initPyodide()',
            customMessage: 'Failed to initialize Pyodide',
            error: 'Error from pyodide:' + convertToString(error)
          })
        }
        return pyodide
      } catch (error) {
        reportBug({
          errorType: 'error',
          errorLocation: 'first try/catch in initPyodide()',
          customMessage: 'Failed to initialize Pyodide',
          error: 'Error' + convertToString(error)
        })
        throw new Error('Pyodide initialization failed.')
      }
    })()
  }
  return pyodideReady // Global variable
}

/**
 * - This event listener responds to messages from the main thread.
 * - It receives Python code, packages, and a cell identifier, then executes the code
 *   within Pyodide, capturing output, errors, and the resulting namespace.
 */
self.addEventListener('message', async (event) => {
  if (!event.data || !event.data.type) {
    reportBug({
      errorType: 'error',
      errorLocation: 'self.addEventListener("message") ',
      customMessage: 'Invalid message format posted to pyworker: missing type',
      error: event.data
    })
    return
  }
  // -------------------------------------------------
  // Handle execute message type from the main thread.
  // -------------------------------------------------
  if (event.data.type === 'execute') {
    let {
      code = '',
      cellId = '',
      packages = '',
      isDarkMode = false,
      pythonVariablesObjectString = '{}' // Stringified version of the pythonVariablesObject
      // Stringified version of the pythonVariablesObject
    } = event.data

    console.log('CODE:', code)

    let pythonVariablesObject = JSON.parse(pythonVariablesObjectString || '{}') // Parse the stringified version (for debugging)

    // Validate the code input. (Not a bug, user has not provided code)
    if (!code || typeof code !== 'string') {
      self.postMessage({
        type: 'error',
        workerError: 'No code provided.',
        cellId
      })
      return
    }
    try {
      pyodide = await initPyodide()
      if (packages && packages.length > 0) {
        for (const pkg of packages) {
          if (!pyodide.loadedPackages[pkg]) {
            await pyodide.loadPackage(pkg)
          }
        }
      }
      // Prepare the user's Python code by indenting each line.
      // This indentation allows us to embed the user's code within a try/except block.
      const indentedCode = code
        .split('\n')
        .map((line) => '    ' + line)
        .join('\n')

      // Construct the wrapped Python code that:
      // - Redirects stdout and stderr to StringIO objects.
      // - Sets up image processing (for matplotlib).
      // - Executes the user code in a try/except block to capture tracebacks.
      // - Captures the final output (stdout and stderr) and the user-defined namespace.
      const wrappedCode = `
# THIS IS PYTHON CODE
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
# The following import is for image processing; remove if not needed.
# from PIL import Image
import base64
import os
from io import BytesIO
# Set the matplotlib backend to Agg (non-interactive).
os.environ['MPLBACKEND'] = 'Agg'
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Reset matplotlib to clear any persistent state
plt.rcdefaults()
plt.close('all')

# Set global dark/light mode styling
background = "${isDarkMode ? 'dark' : 'light'}"
if background.lower() == "dark":
    plt.style.use('dark_background')
    fig_facecolor = "#222222"
    axes_facecolor = "#222222"
    text_color = "white"
else:
    plt.rcParams.update({'figure.facecolor': 'white',
                       'axes.facecolor': 'white',
                       'text.color': 'black'})
    fig_facecolor = "white"
    axes_facecolor = "white"
    text_color = "black"

imagesArray = []  # Array to store images captured from matplotlib
_old_show = plt.show

def show(background="${isDarkMode ? 'dark' : 'light'}"):
    from matplotlib.pyplot import gcf, gca, savefig, clf
    buf = BytesIO()
    
    # Get the current axes and figure
    ax = gca()
    fig = gcf()
    
    # Set the figure background color
    fig.patch.set_facecolor(fig_facecolor)
    ax.set_facecolor(axes_facecolor)
    
    # Update tick parameters so that tick labels are set to text_color
    ax.tick_params(colors=text_color)
    
    # Update the axis labels and title
    if ax.xaxis.label:
        ax.xaxis.label.set_color(text_color)
    if ax.yaxis.label:
        ax.yaxis.label.set_color(text_color)
    if ax.title:
        ax.title.set_color(text_color)
    
    # Update any additional text objects in the axes
    for text in ax.texts:
        text.set_color(text_color)
    
    # Set legend text color to black, regardless of the background
    leg = ax.get_legend()
    if leg:
        for leg_text in leg.get_texts():
            leg_text.set_color("black")
    
    # Save the figure with the specified facecolor
    savefig(buf, format='png', facecolor=fig_facecolor)
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    imagesArray.append(f"data:image/png;base64,{img_base64}")
    
    # Clear the current figure and close the buffer
    clf()
    buf.close()

plt.show = show

# Problem: Variales defined in the user's code are 
# not accessible in the global namespace if they are
# defined in try/except block. How to solve this?
try:
${indentedCode}
except Exception as e:
    import traceback
    traceback.print_exc(file=sys.stderr)
    
for img in imagesArray:
  print(img)  # Print each image's data URL.
stdout = sys.stdout.getvalue() # Retrieve the standard output. 
stderr = sys.stderr.getvalue()
# Build a dictionary of all user-defined globals (exclude keys that start with '_').
pythonContext = {}
pythonContext = { key: value for key, value in globals().items() if not key.startswith('_') }
`
      await pyodide.runPythonAsync(wrappedCode)
      // Placeholders for the variables in the pyodide context
      let workerError = ''
      let stdout = ''
      let stderr = ''
      let stdoutImages = []
      let stdoutText = ''
      let pythonContext = {}
      let pythonFunctions = []
      let sortedFunctions = []

      try {
        const stdoutProxy = await pyodide.runPythonAsync('stdout')
        stdout = stdoutProxy.toString() ?? ''
        console.log('4')
        // Seperate images from text output
        stdoutImages = extractImagesFromStdout(stdout)
        stdoutText = stdout.replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g, '').trim() // Text output without images

        if (stdoutProxy && typeof stdoutProxy.destroy === 'function') {
          stdoutProxy.destroy()
        }
      } catch (error) {
        console.log('5')
        reportBug({
          errorType: 'error',
          cellId,
          errorLocation: 'try/catch in self.addEventListener("message") in pyworker.js',
          customMessage: `Failed to retrieve stdout from Pyodide.`,
          error: convertToString(error) || 'Unknown error'
        })
      }
      try {
        const stderrProxy = await pyodide.runPythonAsync('stderr')
        stderr = stderrProxy.toString() ?? ''
        if (stderrProxy && typeof stderrProxy.destroy === 'function') {
          stderrProxy.destroy()
        }
        console.log('6')
        // Ignore known startup stderr messages (THIS HAS NO BO LONGER EFFECT, DONT KNOW WHY)
        //if (stderr.trim() === 'Matplotlib is building the font cache; this may take a moment.') {
        //  stderr = ''
      } catch (error) {
        console.log('7')
        reportBug({
          errorType: 'error',
          errorLocation: 'try/catch in self.addEventListener("message") in pyworker.js',
          customMessage: `Failed to retrieve stderr from Pyodide.`,
          error: convertToString(error) || 'Unknown error'
        })
      }
      // Retrieve the variabls from the provided pythonVariablesObject variables or other variables from the python namespace
      if (pythonVariablesObject) {
        for (const varName of Object.keys(pythonVariablesObject)) {
          try {
            const proxy = await pyodide.runPythonAsync(varName)
            pythonVariablesObject[varName] = proxy.toString()
            console.log(
              'Successfully retrieved',
              varName,
              'from Pyodide:',
              pythonVariablesObject[varName]
            )
            if (proxy && typeof proxy.destroy === 'function') {
              proxy.destroy()
            }
          } catch (error) {
            console.log(`Failed to retrieve ${varName} from Pyodide.`)
            pythonVariablesObject[varName] = ''
          }
        }
      }

      // Retrieve the python namespace.
      try {
        const pythonContextProxy = await pyodide.runPythonAsync('pythonContext')
        pythonContext = pythonContextProxy.toJs() ?? {}
        if (pythonContextProxy && typeof pythonContextProxy.destroy === 'function') {
          pythonContextProxy.destroy()
        }
        // Iterate over the keys in the namespace.
        const keys = Array.from(pythonContext.keys())
        for (const key of keys) {
          const value = pythonContext.get(key)
          if (value === undefined || value === null) continue
          const strValue =
            value && typeof value.toString === 'function' ? value.toString() : String(value)
          if (strValue.startsWith('<function')) {
            pythonFunctions.push(key)
          }
        }
        // Sort the python-defined functions alphabetically.
        sortedFunctions = pythonFunctions.sort((a, b) => a.localeCompare(b))
      } catch (error) {
        reportBug({
          errorType: 'error',
          errorLocation: 'try/catch in self.addEventListener("message") in pyworker.js',
          customMessage:
            'Failed to retrieve the user-defined namespace (pythonContextProxy) from Pyodide in pyworker.js',
          error: convertToString(error) || 'Unknown error'
        })
      }
      // ----------------------------------------------
      // Send the result back to the main thread.
      // ---------------------------------------------
      console.log('JSON.stringify(pythonVariablesObject)', JSON.stringify(pythonVariablesObject))
      // Seems like we can not send an object inside an object (can't clone it), so we need to stringify it
      self.postMessage({
        type: 'result',
        workerError: workerError ?? '',
        stdout: stdout ?? '',
        stderr: stderr ?? '',
        stdoutImages: stdoutImages ?? '',
        stdoutText: stdoutText ?? '',
        pythonFunctions: sortedFunctions ?? [],
        pythonVariables: '', // Not yet implemented (variables from the global namespace)
        pythonVariablesObjectString: JSON.stringify(pythonVariablesObject), // We also send the stringified version
        cellId: cellId ?? ''
      })
    } catch (error) {
      const errorMessage = convertToString(error) || 'Unknown Python error'
      // Don't return silently - we need to send the error back to the main thread
      // If the Python code has syntax errors, they might be caught at the JavaScript
      // level before the Python code even executes. These errors are caught in the
      // outer JavaScript try-catch block and handled in this catch section:
      if (
        errorMessage.includes('SyntaxError') ||
        errorMessage.includes('NameError') ||
        errorMessage.includes('IndentationError')
      ) {
        self.postMessage({
          type: 'error',
          workerError: `Please check your code for errors and try again. ${errorMessage}`,
          cellId
        })
      } else {
        // Only report as a bug if it appears to be an internal error rather than user code error
        reportBug({
          errorType: 'error',
          errorLocation: 'try/catch in self.addEventListener("message") in pyworker.js',
          customMessage: 'Error in handling execute message type in pyworker.js',
          error: errorMessage
        })
      }
    }
  } else {
    reportBug({
      errorType: 'error',
      errorLocation: 'self.addEventListener("message")',
      customMessage: 'Error: event.data.type not equal to execute',
      error: 'Unknown message type (not exexute): ' + convertToString(event.data.type)
    })
  }
})

/**
 * Extracts base64-encoded PNG images from stdout text
 */
function extractImagesFromStdout(stdout) {
  const regex = /data:image\/png;base64,([A-Za-z0-9+/=]+)/g
  const images = []
  let match
  while ((match = regex.exec(stdout)) !== null) {
    const base64Data = match[1]
    const dataURL = `data:image/png;base64,${base64Data}`
    images.push(dataURL)
  }
  return images
}

/**
 * - Creates a standardized bug report and submits it to the global bug reports.
 * - The bug report is a partial object that will be merged with the bugTemplate.
 * - The bug report is then sent to the global bug reports.
 */

function reportBug(bugReport = {}, cellId) {
  bugReport.source = 'pyworker.js'
  bugReport.createdAt = new Date().toISOString()
  bugReport.errorId = generateUniqueId()
  bugReport.cellId = cellId
  self.postMessage({
    type: 'bugReport',
    bugReport
  })
}

// Creates a global bug report of each type and pushes it to the globalBugReports array.
// --- BugReport Standard Object ---
//  type: 'error' | 'warning' | 'info'
//  bugReport = {
//   source: 'pyworker.js',
//   createdAt: new Date().toISOString(),
//   errorId: generateUniqueId(),
//   errorType: 'error',
//   errorLocation: 'self.addEventListener("message")',
//   customMessage: 'Error: event.data.type not equal to execute',
//   error: 'Unknown message type (not exexute): ' + convertToString(event.data.type)
