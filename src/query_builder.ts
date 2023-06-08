import { API } from './api'

type BaseValueFilter = string | string[] | number | number[]
type BaseRangeFilter = {
  gte?: number
  lte?: number
  gt?: number
  lt?: number
}
type FilterFieldValue = BaseValueFilter | BaseRangeFilter
type FilterMatchField = { match: { [field: string]: BaseValueFilter } }
type FilterTermsField = { terms: { [field: string]: BaseValueFilter } }
type FilterRangeField = { range: { [field: string]: BaseRangeFilter } }

type FilterField = FilterMatchField | FilterRangeField | FilterTermsField

enum FacetType {
  terms = 'terms',
  stats = 'stats',
}

interface FacetParam {
  field: string
  size?: number
  type: FacetType
  disjunctive?: boolean
}

const mapFacetTypeToElastic: { [key: string]: 'terms' | 'range' } = {
  [FacetType.terms]: 'terms',
  [FacetType.stats]: 'range',
}

interface Params {
  params: {
    _es_filters?: { bool: { must: FilterField[] } }
    query?: string
    result_fields?: string[]
    search_fields?: string[]
    size?: number
    from?: number
  }
}

export class QueryBuilder {
  private readonly facets: Record<string, FacetParam>
  params: Params = { params: {} }

  constructor(private readonly apiClient: API, baseParams) {
    this.facets = baseParams.facets
  }

  addFacetFilter(field: string, value: FilterFieldValue): this {
    const facetInfo = this.facets?.[field]

    if (!facetInfo) {
      throw new Error(`Facet ${field} wasn't passed in configuration params`)
    }

    const elasticType = mapFacetTypeToElastic[facetInfo.type]

    this.setFilter({
      [elasticType]: { [facetInfo.field]: value },
    } as FilterField)

    return this
  }

  addFilter(field: string, value: FilterFieldValue): this {
    return this
  }

  setFilter(value: FilterField): this {
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
