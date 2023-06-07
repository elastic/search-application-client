import { API } from './api'

type Filter =
  | string
  | string[]
  | { from: number; to: number }
  | { from: number; to: number }[]
  | number
  | number[]

interface Params {
  params: {
    _es_filters?: Record<string, any>
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

  addFacetFilter(field: string, value: Filter): this {
    return this
  }

  addFilter(field: string, value: Filter): this {
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
