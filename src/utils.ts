import { ResponseParams } from './types'

export const Highlight = (
  hit: ResponseParams['hits']['hits'][0],
  field: string
) => {
  const highlightValue = hit.highlight?.[field]

  if (highlightValue?.length) {
    return highlightValue.length > 1 ? highlightValue : highlightValue[0]
  }

  return hit['_source'][field]
}
