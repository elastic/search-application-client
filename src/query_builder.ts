import { API } from './api'

type FilterValue =
  | string
  | string[]
  | { from: number; to: number }
  | { from: number; to: number }[]
  | number
  | number[]

type Filter = Record<
  'match' | 'terms' | 'range',
  { [field: string]: FilterValue }
>

interface Params {
  params: {
    _es_filters?: { bool: { must: Filter[] } }
    query?: string
    result_fields?: string[]
    search_fields?: string[]
    size?: number
    from?: number
  }
}

export class QueryBuilder {
  private params: Params = { params: {} }

  constructor(private readonly apiClient: API, baseParams) {
    this.params.params = baseParams
  }

  addFacetFilter(field: string, value: FilterValue): this {
    return this
  }

  addFilter(field: string, value: FilterValue): this {
    return this
  }

  setFilter(value: Filter): this {
    if (!this.params.params._es_filters) {
      this.params.params._es_filters = { bool: { must: [] } }
    }

    this.params.params._es_filters.bool.must.push(value)

    return this
  }

  addParameter(parameter: string, value: string): this {
    this.params.params[parameter] = value

    return this
  }

  query(query: string): this {
    this.params.params.query = query

    return this
  }

  search(): Promise<any> {
    return this.apiClient.post(this.params)
  }
}
