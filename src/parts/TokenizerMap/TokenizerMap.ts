import * as TokenizePlainText from '../TokenizePlainText/TokenizePlainText.ts'
import * as TextDocument from '../TextDocument/TextDocument.ts'

const tokenizers = Object.create(null)

export const set = (id, value) => {
  tokenizers[id] = value
  console.log('reset', id)
  TextDocument.resetInvalidStartIndex(id)
}

export const get = (id) => {
  return tokenizers[id] || TokenizePlainText
}

export const remove = (id) => {
  delete tokenizers[id]
}
