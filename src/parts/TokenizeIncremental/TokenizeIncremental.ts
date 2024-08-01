import * as GetInitialLineState from '../GetInitialLineState/GetInitialLineState.ts'
import * as SafeTokenizeLine from '../SafeTokenizeLine/SafeTokenizeLine.ts'
import * as TextDocument from '../TextDocument/TextDocument.ts'
import * as TokenizerMap from '../TokenizerMap/TokenizerMap.ts'

export const tokenizeIncremental = (id: any, languageId: string, oldLine: string, newLine: string, rowIndex: number, minLineY: number) => {
  const lineCache = TextDocument.getLineCache(id)
  const tokenizer = TokenizerMap.get(languageId)

  const initialLineState = lineCache[rowIndex] || GetInitialLineState.getInitialLineState(tokenizer.initialLineState)
  const { tokens: oldTokens } = SafeTokenizeLine.safeTokenizeLine(
    languageId,
    tokenizer.tokenizeLine,
    oldLine,
    initialLineState,
    tokenizer.hasArrayReturn,
  )
  // @ts-ignore
  const { tokens: newTokens, lineState } = SafeTokenizeLine.safeTokenizeLine(
    languageId,
    tokenizer.tokenizeLine,
    newLine,
    initialLineState,
    tokenizer.hasArrayReturn,
  )
  if (newTokens.length !== oldTokens.length) {
    return undefined
  }
  const incrementalEdits: any[] = []
  let offset = 0
  const relativeRowIndex = rowIndex - minLineY
  for (let i = 0; i < oldTokens.length; i += 2) {
    const oldTokenType = oldTokens[i]
    const oldTokenLength = oldTokens[i + 1]
    const newTokenType = newTokens[i]
    const newTokenLength = newTokens[i + 1]
    if (oldTokenType === newTokenType && oldTokenLength !== newTokenLength && oldTokenLength > 0) {
      const columnTokenIndex = i / 2
      incrementalEdits.push({
        rowIndex: relativeRowIndex,
        columnIndex: columnTokenIndex,
        text: newLine.slice(offset, offset + newTokenLength),
      })
    }
    offset += newTokenLength
  }
  if (incrementalEdits.length === 1) {
    return incrementalEdits
  }
  return undefined
}
