// src/assets/codeMirror/casLanguage.js
import { parser } from './cas-parser.js'
import { LRLanguage, LanguageSupport } from '@codemirror/language'
import { styleTags } from '@lezer/highlight'
//import { useLanguageStore } from '@/stores/Luna4LanguageStore.js'
import { tags } from '@lezer/highlight' // Import standard tags directly

// Define keyword translations
// We will remove this and import keywordTranslations from a json file that contains
// all the keywords and autocomplete information in all languages
const keywordTranslations = {
  English: {
    solve: 'solve',
    for: 'for',
    and: 'and',
    diff: 'diff',
    integral: 'integral',
    series: 'series',
    sequence: 'sequence',
    expand: 'expand',
    factor: 'factor',
    csolve: 'csolve',
    limit: 'limit',
    sum: 'sum',
    round: 'round',
    simplify: 'simplify',
    pi: 'pi',
    exp: 'exp',
    e: 'e', // Euler's number
    i: 'i', // Imaginary unit
    sin: 'sin',
    cos: 'cos',
    tan: 'tan',
    asin: 'asin',
    acos: 'acos',
    atan: 'atan',
    ln: 'ln',
    lg: 'lg',
    log: 'log',
    sqrt: 'sqrt',
    abs: 'abs'
  },
  Norwegian: {
    solve: 'løs',
    for: 'for',
    and: 'og',
    e: 'e', // Euler's number
    i: 'i' // Imaginary unit
  }
}

export function cas() {
  // Get current language
  // const languageStore = useLanguageStore()
  // const currentLang = languageStore.selectedLanguage
  // const keywords = keywordTranslations[currentLang] || keywordTranslations['English']
  const keywords = keywordTranslations['English']

  // Try a more simplified tagging approach
  try {
    const parserWithTags = parser.configure({
      props: [
        styleTags({
          // Basic keywords
          [keywords.solve]: tags.keyword,
          [keywords.csolve]: tags.keyword,
          [keywords.for]: tags.keyword,
          [keywords.and]: tags.keyword,

          // Math operations
          [keywords.diff]: tags.operator,
          [keywords.integral]: tags.operator,
          [keywords.series]: tags.operator,
          [keywords.sequence]: tags.operator,
          [keywords.limit]: tags.operator,
          [keywords.sum]: tags.operator,
          [keywords.round]: tags.operator,
          [keywords.simplify]: tags.operator,
          [keywords.factor]: tags.operator,
          [keywords.expand]: tags.operator,

          // Constants
          [keywords.pi]: tags.number,
          [keywords.exp]: tags.number,
          //[keywords.e]: tags.number, Dont work. See custon extension file
          //[keywords.i]: tags.number, Dont work. See custon extension file

          // Functions
          [keywords.sin]: tags.variableName,
          [keywords.cos]: tags.variableName,
          [keywords.tan]: tags.variableName,
          [keywords.asin]: tags.variableName,
          [keywords.acos]: tags.variableName,
          [keywords.atan]: tags.variableName,
          [keywords.ln]: tags.variableName,
          [keywords.lg]: tags.variableName,
          // Removing the log entry as it will be handled by the casLogHighlighter
          // [keywords.log]: tags.variableName,
          [keywords.sqrt]: tags.variableName,
          [keywords.abs]: tags.variableName,

          // Basic syntax elements
          LineComment: tags.comment,
          Comment: tags.comment,
          AssignOp: tags.propertyName // := operator mapped to tags.operator consistently
        })
      ]
    })

    const casLanguage = LRLanguage.define({
      parser: parserWithTags
    })

    return new LanguageSupport(casLanguage)
  } catch (error) {
    console.error('Error configuring CAS language:', error)
    // Return a minimal language support if there's an error
    return new LanguageSupport(LRLanguage.define({ parser }))
  }
}
