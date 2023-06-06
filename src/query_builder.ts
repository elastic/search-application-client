import { API } from './api'

type Filter =
  | string
  | string[]
  | Record<string, number | number[] | string | string[]>

export class QueryBuilder {
  private params = { params: { query: '' } }

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
