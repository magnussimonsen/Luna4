<!--
  --------------------------------------------------------------------
  File: Luna4HelpSidebar.vue
  --------------------------------------------------------------------
  Summary:
  A simplified help sidebar component that displays a placeholder text.
  It is vertically scrollable using CSS overflow properties.
-->

<template>
  <div
    class="sidebar-container"
    :style="{
      fontFamily: fontStore.fontFamily || 'Arial, sans-serif',
      fontSize: fontStore.fontSize || '14px'
    }"
  >
    <p>Here you'll find a quick guide to using Markdown, CAS and Python features in Luna.</p>

    <h3>Markdown Tutorial</h3>
    <ul>
      <li><strong>Headings:</strong> <code># My Notes</code>, <code>## Quick Tips</code></li>
      <li><strong>Bold:</strong> <code>**Important concept**</code></li>
      <li><strong>Italic:</strong> <code>*Remember this*</code></li>
      <li><strong>Lists:</strong> <code>- Step one</code>, <code>- Step two</code></li>
      <li><strong>Links:</strong> <code>[Luna4 Docs](https://luna4.app/docs)</code></li>
      <li><strong>Images:</strong> <code>![Some text describing the image](image.png)</code></li>
      <li>
        <strong>Code:</strong>
        <pre><code>```python
sum = a + b
```</code></pre>
      </li>
    </ul>
    <h3>CAS Tutorial</h3>
    <ul>
      <li>
        <strong>Solving Equations: </strong>
        <code>solve 2*x+4=9 for x</code>
      </li>
      <li>
        <strong>Multiple Variables: </strong>
        <code>solve x+y=10 and x-y=2 for x and y</code>
      </li>
      <li>
        <strong>Polynomial Equations: </strong>
        <code>solve x^2-4=0 for x</code>
      </li>
    </ul>
    <h3>Plotting in Python cells</h3>
    <pre><code>from pylab import *

def f(x):
  return (x-3)*(x+2)

def g(x):
  return 0.5*x-1

x = linspace(-3,5,100)

plot(x, f(x), label="f")
plot(x, g(x), label="g")

title("Plot of function")
xlabel("x")
ylabel("f(x)")
legend()
show()
</code></pre>

    <h3>SymPy in Python cells</h3>
    <p>SymPy is a Python library for symbolic mathematics. Here are some examples:</p>
    <ul>
      <li>
        <strong>Solving a quadratic equation:</strong>
        <pre><code>import sympy as sp
from sympy.abc import x

# Solving the equation x^2+4x-5=0
sol=sp.solve(x**2+4*x-5,x)
print(sol)
</code></pre>
      </li>
      <li>
        <strong>Solving a system of equations:</strong>
        <pre><code>import sympy as sp
from sympy.abc import x, y

# Solving the equation x^2+y^2 = 1 and x+1=y
sol=sp.solve([x**2+y**2-1, x+1-y],[x,y])
print(sol)
</code></pre>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useFontStore } from '@/stores/Luna4FontStore.js'
const fontStore = useFontStore()
</script>

<style scoped>
/* Sidebar container styling */
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%; /* Ensures the sidebar takes full height of the parent */
  overflow-y: auto; /* Enables vertical scrolling within the sidebar */
  padding: 1em;
  box-sizing: border-box; /* Includes padding and border in the element's total width and height */
  background-color: var(--navbar-bg-color, #f9f9f9); /* Fallback background color */
  color: var(--main-font-color, #000); /* Fallback color if CSS variable is not set */
}

/* Optional: Style the paragraphs for better readability */
.sidebar-container p {
  margin-bottom: 1em;
  line-height: 1.6;
  background-color: var(--navbar-bg-color, #f9f9f9); /* Fallback background color */
  color: var(--main-font-color, #000); /* Fallback color if CSS variable is not set */
}
</style>
