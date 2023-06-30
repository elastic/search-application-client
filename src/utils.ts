import { ResponseParams } from './types'

export const Highlight = (
  hit: ResponseParams['hits']['hits'][0],
  field: string
) => {
  const highlightValue = hit.highlight?.[field]

  return highlightValue?.length
    ? highlightValue.join('...')
    : hit['_source'][field]
}
