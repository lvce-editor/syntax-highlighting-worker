import { expect, test } from '@jest/globals'
import * as TextDocument from '../src/parts/TextDocument/TextDocument.ts'

test('setLanguageId resets cached tokens when the language changes', () => {
  const editorId = 1
  const lines = ['test']
  TextDocument.setLines(editorId, lines)
  TextDocument.setLanguageId(editorId, 'plaintext')
  TextDocument.getLineCache(editorId).push({ tokens: [0, 4] })
  TextDocument.setInvalidStartIndex(editorId, 1)

  TextDocument.setLanguageId(editorId, 'xyz')

  expect(TextDocument.getLines(editorId)).toBe(lines)
  expect(TextDocument.getLineCache(editorId)).toEqual([])
  expect(TextDocument.getInvalidStartIndex(editorId)).toBe(0)
})

test('setLanguageId preserves cached tokens when the language is unchanged', () => {
  const editorId = 2
  TextDocument.setLines(editorId, ['test'])
  TextDocument.setLanguageId(editorId, 'xyz')
  const lineCache = TextDocument.getLineCache(editorId)
  lineCache.push({ tokens: [1, 4] })
  TextDocument.setInvalidStartIndex(editorId, 1)

  TextDocument.setLanguageId(editorId, 'xyz')

  expect(TextDocument.getLineCache(editorId)).toBe(lineCache)
  expect(TextDocument.getInvalidStartIndex(editorId)).toBe(1)
})
