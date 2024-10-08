import * as GetInitialLineState from '../GetInitialLineState/GetInitialLineState.ts'
import * as SafeTokenizeLine from '../SafeTokenizeLine/SafeTokenizeLine.ts'
import * as TextDocument from '../TextDocument/TextDocument.ts'
import * as TokenizePlainText from '../TokenizePlainText/TokenizePlainText.ts'
import * as Tokenizer from '../Tokenizer/Tokenizer.ts'
import * as TokenizerMap from '../TokenizerMap/TokenizerMap.ts'

const getTokensViewportEmbedded = (langageId, lines, lineCache, linesWithEmbed) => {
  const tokenizersToLoad: any[] = []
  const embeddedResults: any[] = []
  let topContext
  for (const index of linesWithEmbed) {
    const result = lineCache[index + 1]
    const line = lines[index]
    if (result.embeddedLanguage) {
      const { embeddedLanguage, embeddedLanguageStart, embeddedLanguageEnd } = result
      const embeddedTokenizer = Tokenizer.getTokenizer(embeddedLanguage)
      if (embeddedLanguageStart !== line.length && embeddedTokenizer && embeddedTokenizer !== TokenizePlainText) {
        const isFull = embeddedLanguageStart === 0 && embeddedLanguageEnd === line.length
        const partialLine = line.slice(embeddedLanguageStart, embeddedLanguageEnd)
        const embedResult = SafeTokenizeLine.safeTokenizeLine(
          langageId,
          embeddedTokenizer.tokenizeLine,
          partialLine,
          topContext || GetInitialLineState.getInitialLineState(embeddedTokenizer.initialLineState),
          embeddedTokenizer.hasArrayReturn,
        )
        topContext = embedResult
        result.embeddedResultIndex = embeddedResults.length
        embeddedResults.push({
          result: embedResult,
          TokenMap: embeddedTokenizer.TokenMap,
          isFull,
        })
      } else if (line.length === 0) {
        const embedResult = {
          tokens: [],
        }
        result.embeddedResultIndex = embeddedResults.length
        embeddedResults.push({
          result: embedResult,
          isFull: true,
          TokenMap: [],
        })
      } else {
        tokenizersToLoad.push(embeddedLanguage)
        embeddedResults.push({
          result: {},
          isFull: false,
          TokenMap: [],
        })
        topContext = undefined
      }
    } else {
      topContext = undefined
    }
  }
  return {
    tokenizersToLoad,
    embeddedResults,
  }
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
  const tokenizersToLoad = []
  const embeddedResults: any[] = []
  const linesWithEmbed: any[] = []
  for (let i = tokenizeStartIndex; i < tokenizeEndIndex; i++) {
    const lineState = i === 0 ? GetInitialLineState.getInitialLineState(initialLineState) : lineCache[i]
    const line = lines[i]
    const result = SafeTokenizeLine.safeTokenizeLine(languageId, tokenizeLine, line, lineState, hasArrayReturn)
    // TODO if lineCacheEnd matches the one before, skip tokenizing lines after
    lineCache[i + 1] = result
    if (result.embeddedLanguage) {
      result.embeddedResultIndex = linesWithEmbed.length
      linesWithEmbed.push(i)
    }
  }
  const visibleLines = lineCache.slice(startLineIndex + 1, endLineIndex + 1)
  if (linesWithEmbed.length > 0) {
    const { tokenizersToLoad, embeddedResults } = getTokensViewportEmbedded(languageId, lines, lineCache, linesWithEmbed)
    // TODO support lineCache with embedded content
    TextDocument.setInvalidStartIndex(id, 0)
    return {
      tokens: visibleLines,
      tokenizersToLoad,
      embeddedResults,
    }
  }
  TextDocument.setInvalidStartIndex(id, Math.max(invalidStartIndex, tokenizeEndIndex))
  return {
    tokens: visibleLines,
    tokenizersToLoad,
    embeddedResults,
  }
}
