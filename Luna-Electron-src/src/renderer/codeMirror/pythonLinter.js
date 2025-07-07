// Import needed items
import { linter } from '@codemirror/lint'
import { syntaxTree } from '@codemirror/language'

function pythonLinter(view) {
  let diagnostics = []
  // Get the syntax tree for the current document.
  let tree = syntaxTree(view.state)
  // Iterate over the tree looking for error nodes.
  tree.iterate({
    enter: (node) => {
      // Many Lezer parsers mark errors by a node type with isError set to true.
      if (node.type.isError) {
        diagnostics.push({
          from: node.from,
          to: node.to,
          severity: 'error',
          message: 'Syntax error',
          // Add these properties to ensure proper rendering
          source: 'Python'
        })
      }
    }
  })
  return diagnostics
}

// Create the linter extension with simplified config
export const pythonLintExtension = linter(pythonLinter)
