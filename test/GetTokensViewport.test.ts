import { expect, test } from '@jest/globals'
import * as GetTokensViewport from '../src/parts/GetTokensViewport/GetTokensViewport.ts'
import * as TextDocument from '../src/parts/TextDocument/TextDocument.ts'
import * as TokenizerMap from '../src/parts/TokenizerMap/TokenizerMap.ts'

test('keeps embedded tokenization cached while scrolling', () => {
  const editorId = 1
  const lines = ['one', 'two', 'three', 'four', 'five', 'six']
  let outerTokenizeCount = 0
  let embeddedTokenizeCount = 0
  TokenizerMap.set('markdown-test', {
    hasArrayReturn: true,
    initialLineState: {
      state: 0,
    },
    tokenizeLine(line: string, lineState: any) {
      outerTokenizeCount++
      return {
        embeddedLanguage: 'javascript-test',
        embeddedLanguageEnd: line.length,
        embeddedLanguageStart: 0,
        state: lineState.state + 1,
        tokens: [1, line.length],
      }
    },
  })
  TokenizerMap.set('javascript-test', {
    hasArrayReturn: true,
    initialLineState: {
      state: 0,
    },
    TokenMap: {
      1: 'Identifier',
    },
    tokenizeLine(line: string, lineState: any) {
      embeddedTokenizeCount++
      return {
        state: lineState.state + 1,
        tokens: [1, line.length],
      }
    },
  })

  const first = GetTokensViewport.getTokensViewport({ languageId: 'markdown-test' }, 0, 3, true, editorId, lines)
  const second = GetTokensViewport.getTokensViewport({ languageId: 'markdown-test' }, 3, 6, false, editorId, [])
  const firstAgain = GetTokensViewport.getTokensViewport({ languageId: 'markdown-test' }, 0, 3, false, editorId, [])

  expect(first.embeddedResults.map((result) => result.result.state)).toEqual([1, 2, 3])
  expect(second.embeddedResults.map((result) => result.result.state)).toEqual([4, 5, 6])
  expect(firstAgain.embeddedResults.map((result) => result.result.state)).toEqual([1, 2, 3])
  expect(second.tokens.map((result) => result.embeddedResultIndex)).toEqual([0, 1, 2])
  expect(firstAgain.tokens.map((result) => result.embeddedResultIndex)).toEqual([0, 1, 2])
  expect(outerTokenizeCount).toBe(6)
  expect(embeddedTokenizeCount).toBe(6)
  expect(TextDocument.getInvalidStartIndex(editorId)).toBe(6)
})

test('does not invalidate outer tokens for an empty embedded range', () => {
  const editorId = 2
  const lines = ['<script>', 'one', 'two', 'three']
  let outerTokenizeCount = 0
  let embeddedTokenizeCount = 0
  TokenizerMap.set('html-test', {
    hasArrayReturn: true,
    initialLineState: {
      state: 0,
    },
    tokenizeLine(line: string, lineState: any) {
      outerTokenizeCount++
      return {
        embeddedLanguage: 'javascript-empty-range-test',
        embeddedLanguageEnd: line === '<script>' ? 0 : line.length,
        embeddedLanguageStart: line === '<script>' ? line.length : 0,
        state: lineState.state + 1,
        tokens: [1, line.length],
      }
    },
  })
  TokenizerMap.set('javascript-empty-range-test', {
    hasArrayReturn: true,
    initialLineState: {
      state: 0,
    },
    TokenMap: {
      1: 'Identifier',
    },
    tokenizeLine(line: string, lineState: any) {
      embeddedTokenizeCount++
      return {
        state: lineState.state + 1,
        tokens: [1, line.length],
      }
    },
  })

  const first = GetTokensViewport.getTokensViewport({ languageId: 'html-test' }, 0, 3, true, editorId, lines)
  const second = GetTokensViewport.getTokensViewport({ languageId: 'html-test' }, 1, 4, false, editorId, [])

  expect(first.tokenizersToLoad).toEqual([])
  expect(second.tokenizersToLoad).toEqual([])
  expect(outerTokenizeCount).toBe(4)
  expect(embeddedTokenizeCount).toBe(3)
  expect(TextDocument.getInvalidStartIndex(editorId)).toBe(4)
})
