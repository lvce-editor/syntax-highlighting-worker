import { expect, test } from '@jest/globals'
import * as DefaultCommandMap from '../src/parts/DefaultCommandMap/DefaultCommandMap.ts'
import * as TextDocument from '../src/parts/TextDocument/TextDocument.ts'

const dispose = (id: number) => DefaultCommandMap.commandMap['TextDocument.dispose'](id)

test('disposing a document releases lines and token caches without affecting another editor', () => {
  const lines = ['large document contents']
  TextDocument.setLines(100, lines)
  TextDocument.setLanguageId(100, 'javascript')
  TextDocument.getLineCache(100).push({ tokens: [1, 23] })
  TextDocument.setLines(101, lines)

  dispose(100)
  dispose(100)
  TextDocument.resetInvalidStartIndex('javascript')

  expect(TextDocument.getLines(100)).toBeUndefined()
  expect(TextDocument.getLineCache(100)).toBeUndefined()
  expect(TextDocument.getInvalidStartIndex(100)).toBeUndefined()
  expect(TextDocument.getLines(101)).toBe(lines)
  dispose(101)
})

test('a disposed document id can be initialized again without stale caches', () => {
  TextDocument.setLines(102, ['old'])
  TextDocument.setLanguageId(102, 'javascript')
  dispose(102)
  TextDocument.setLines(102, ['new'])
  TextDocument.setLanguageId(102, 'plaintext')
  expect(TextDocument.getLines(102)).toEqual(['new'])
  expect(TextDocument.getLineCache(102)).toEqual([])
  expect(TextDocument.getInvalidStartIndex(102)).toBe(0)
  dispose(102)
})
