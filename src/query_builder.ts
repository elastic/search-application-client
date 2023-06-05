import { IAPI } from './api'

type Filter =
  | string
  | string[]
  | Record<string, number | number[] | string | string[]>

export interface IQueryBuilder {
  addFilter: (field: string, value: Filter) => IQueryBuilder
  addFacetFilter: (field: string, value: Filter) => IQueryBuilder
  addParameter: (parameter: string, value: string) => IQueryBuilder

  query: (query: string) => IQueryBuilder

  search: () => Promise<any>
}

export class QueryBuilder implements IQueryBuilder {
  private params = { params: { query: '' } }
  constructor(private readonly apiClient: IAPI, baseParams) {
    this.params.params = baseParams
  }
  addFacetFilter(field, value): IQueryBuilder {
    return this
  }

  addFilter(field, value): IQueryBuilder {
    return this
  }

  addParameter(parameter: string, value: string): IQueryBuilder {
    return this
  }

  query(query: string): IQueryBuilder {
    this.params.params.query = query

    return this
  }

  search(): Promise<any> {
    return this.apiClient.post(this.params)
  }
}
