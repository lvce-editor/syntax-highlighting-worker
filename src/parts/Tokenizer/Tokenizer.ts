import * as TokenizePlainText from '../TokenizePlainText/TokenizePlainText.ts'
import * as TokenizerMap from '../TokenizerMap/TokenizerMap.ts'

// TODO loadTokenizer should be invoked from renderer worker
export const loadTokenizer = async (languageId: string, tokenizePath: string) => {
  if (!tokenizePath) {
    return
  }
  try {
    // TODO check that tokenizer is valid
    // 1. tokenizeLine should be of type function
    // 2. getTokenClass should be of type function
    const tokenizer = await import(tokenizePath)
    if (typeof tokenizer.tokenizeLine !== 'function') {
      console.warn(`tokenizer.tokenizeLine should be a function in "${tokenizePath}"`)
      return
    }
    if (!tokenizer.TokenMap || typeof tokenizer.TokenMap !== 'object' || Array.isArray(tokenizer.TokenMap)) {
      console.warn(`tokenizer.TokenMap should be an object in "${tokenizePath}"`)
      return
    }
    TokenizerMap.set(languageId, tokenizer)
    return tokenizer.TokenMap
  } catch (error) {
    // TODO better error handling
    console.error(error)
    return
  }
}

export const getTokenizer = (languageId) => {
  if (TokenizerMap.get(languageId)) {
    return TokenizerMap.get(languageId)
  }
  return TokenizePlainText
}
