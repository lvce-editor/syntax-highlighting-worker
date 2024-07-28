const lineMap = Object.create(null)
const lineCaches = Object.create(null)
const invalidStartIndices = Object.create(null)
const languageIds = Object.create(null)

export const setLines = (editorId: number, lines: readonly string[]) => {
  lineMap[editorId] = lines
  lineCaches[editorId] = []
  invalidStartIndices[editorId] = 0
}

export const getLines = (editorId: number) => {
  return lineMap[editorId]
}

export const getLineCache = (editorId: number) => {
  return lineCaches[editorId]
}

export const getInvalidStartIndex = (editorId: number) => {
  return invalidStartIndices[editorId]
}

export const resetInvalidStartIndex = (languageId: string) => {
  for (const [key, value] of Object.entries(languageIds)) {
    if (value === languageId) {
      invalidStartIndices[key] = 0
    }
  }
}
export const setInvalidStartIndex = (editorId: number, index: number) => {
  invalidStartIndices[editorId] = index
}

export const setLanguageId = (editorId: number, languageId: string) => {
  languageIds[editorId] = languageId
}
