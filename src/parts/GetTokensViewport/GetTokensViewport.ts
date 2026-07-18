import * as GetInitialLineState from '../GetInitialLineState/GetInitialLineState.ts'
import * as SafeTokenizeLine from '../SafeTokenizeLine/SafeTokenizeLine.ts'
import * as TextDocument from '../TextDocument/TextDocument.ts'
import * as TokenizePlainText from '../TokenizePlainText/TokenizePlainText.ts'
import * as Tokenizer from '../Tokenizer/Tokenizer.ts'
import * as TokenizerMap from '../TokenizerMap/TokenizerMap.ts'

interface CachedEmbeddedResult {
  readonly context: any
  readonly languageId: string
  readonly response: any
}

const embeddedResultCache = new WeakMap<object, CachedEmbeddedResult>()

const getTokensViewportEmbedded = (langageId, lines, lineCache, linesWithEmbed) => {
  const tokenizersToLoad: any[] = []
  for (const index of linesWithEmbed) {
    const result = lineCache[index + 1]
    const line = lines[index]
    if (result.embeddedLanguage) {
      const { embeddedLanguage, embeddedLanguageStart, embeddedLanguageEnd } = result
      const embeddedTokenizer = Tokenizer.getTokenizer(embeddedLanguage)
      const previousResult = lineCache[index]
      const previousEmbeddedResult = previousResult && embeddedResultCache.get(previousResult)
      const previousContext = previousEmbeddedResult?.languageId === embeddedLanguage ? previousEmbeddedResult.context : undefined
      if (embeddedLanguageStart !== line.length && embeddedTokenizer && embeddedTokenizer !== TokenizePlainText) {
        const isFull = embeddedLanguageStart === 0 && embeddedLanguageEnd === line.length
        const partialLine = line.slice(embeddedLanguageStart, embeddedLanguageEnd)
        const embedResult = SafeTokenizeLine.safeTokenizeLine(
          langageId,
          embeddedTokenizer.tokenizeLine,
          partialLine,
          previousContext || GetInitialLineState.getInitialLineState(embeddedTokenizer.initialLineState),
          embeddedTokenizer.hasArrayReturn,
        )
        embeddedResultCache.set(result, {
          context: embedResult,
          languageId: embeddedLanguage,
          response: {
            result: embedResult,
            TokenMap: embeddedTokenizer.TokenMap,
            isFull,
          },
        })
      } else if (line.length === 0) {
        const embedResult = {
          tokens: [],
        }
        embeddedResultCache.set(result, {
          context: previousContext,
          languageId: embeddedLanguage,
          response: {
            result: embedResult,
            isFull: true,
            TokenMap: [],
          },
        })
      } else {
        tokenizersToLoad.push(embeddedLanguage)
        embeddedResultCache.set(result, {
          context: undefined,
          languageId: embeddedLanguage,
          response: {
            result: {},
            isFull: false,
            TokenMap: [],
          },
        })
      }
    }
  }
  return {
    tokenizersToLoad,
  }
}

const getVisibleEmbeddedResults = (visibleLines: readonly any[]): readonly any[] => {
  const embeddedResults: any[] = []
  for (const result of visibleLines) {
    const cached = embeddedResultCache.get(result)
    if (cached) {
      result.embeddedResultIndex = embeddedResults.length
      embeddedResults.push(cached.response)
    }
  }
  return embeddedResults
}

const getTokenizeEndIndex = (invalidStartIndex, endLineIndex, tokenizeStartIndex) => {
  return invalidStartIndex < endLineIndex ? endLineIndex : tokenizeStartIndex
}

// TODO only send changed lines to renderer process instead of all lines in viewport
export const getTokensViewport = (editor, startLineIndex, endLineIndex, hasLinesToSend, id, linesToSend) => {
  if (hasLinesToSend) {
    TextDocument.setLines(id, linesToSend)
  }
  const { languageId } = editor
  TextDocument.setLanguageId(id, languageId)
  const lines = TextDocument.getLines(id)
  const lineCache = TextDocument.getLineCache(id)
  const invalidStartIndex = TextDocument.getInvalidStartIndex(id)
  const tokenizer = TokenizerMap.get(languageId)
  const { hasArrayReturn, tokenizeLine, initialLineState } = tokenizer
  const tokenizeStartIndex = invalidStartIndex
  const tokenizeEndIndex = getTokenizeEndIndex(invalidStartIndex, endLineIndex, tokenizeStartIndex)
  const linesWithEmbed: any[] = []
  for (let i = tokenizeStartIndex; i < tokenizeEndIndex; i++) {
    const lineState = i === 0 ? GetInitialLineState.getInitialLineState(initialLineState) : lineCache[i]
    const line = lines[i]
    const result = SafeTokenizeLine.safeTokenizeLine(languageId, tokenizeLine, line, lineState, hasArrayReturn)
    // TODO if lineCacheEnd matches the one before, skip tokenizing lines after
    lineCache[i + 1] = result
    if (result.embeddedLanguage) {
      linesWithEmbed.push(i)
    }
  }
  const visibleLines = lineCache.slice(startLineIndex + 1, endLineIndex + 1)
  let tokenizersToLoad: readonly any[] = []
  if (linesWithEmbed.length > 0) {
    ;({ tokenizersToLoad } = getTokensViewportEmbedded(languageId, lines, lineCache, linesWithEmbed))
  }
  const embeddedResults = getVisibleEmbeddedResults(visibleLines)
  const nextInvalidStartIndex = tokenizersToLoad.length > 0 ? tokenizeStartIndex : Math.max(invalidStartIndex, tokenizeEndIndex)
  TextDocument.setInvalidStartIndex(id, nextInvalidStartIndex)
  return {
    tokens: visibleLines,
    tokenizersToLoad,
    embeddedResults,
  }
}
