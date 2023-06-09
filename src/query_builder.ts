import { API } from './api'
import { FacetConfiguration, RequestBuilder } from './request_builder'

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

export type FilterField = FilterMatchField | FilterRangeField | FilterTermsField

export interface Params {
  _es_filters?: { bool: { must: FilterField[] } }
  query?: string
  result_fields?: string[]
  search_fields?: string[]
  size?: number
  from?: number
}

export type FacetFilters = Record<string, FilterFieldValue[]>

const transformResponse = (
  results: any[],
  facetConfigurations: Record<string, FacetConfiguration>
) => {
  const combinedAggregations = results.reduce((acc, result) => {
    return {
      ...acc,
      ...result.aggregations,
    }
  }, {})

  const facets = Object.keys(combinedAggregations).map((facetName) => {
    const facetConfiguration =
      facetConfigurations[facetName.replace('_facet', '')]
    const aggregation = combinedAggregations[facetName]
    if (facetConfiguration.type === 'terms') {
      return {
        name: facetName,
        entries: aggregation.buckets.map((bucket) => {
          return {
            value: bucket.key,
            count: bucket.doc_count,
          }
        }),
      }
    } else if (facetConfiguration.type === 'stats') {
      return {
        min: aggregation.min,
        max: aggregation.max,
        avg: aggregation.avg,
        sum: aggregation.sum,
        count: aggregation.count,
      }
    }
  })

  return {
    ...results[0],
    facets,
  }
}

export class QueryBuilder {
  readonly facets: Record<string, FacetConfiguration>
  facetFilters: Record<string, FilterFieldValue[]> = {}
  filter: FilterField
  params: Params = {}

  constructor(private readonly apiClient: API, baseParams) {
    this.facets = baseParams.facets
  }

  addFacetFilter(field: string, value: FilterFieldValue): this {
    const facetInfo = this.facets?.[field]

    if (!facetInfo) {
      throw new Error(`Facet ${field} wasn't passed in configuration params`)
    }

    this.facetFilters[field] = [
      ...(this.facetFilters[field] || []),
      Array.isArray(value) ? value : [value],
    ].flat()

    return this
  }

  setFilter(value: FilterField): this {
    this.filter = value
    return this
  }

  addParameter(parameter: string, value: string): this {
    this.params[parameter] = value

    return this
  }

  query(query: string): this {
    this.params.query = query

    return this
  }

  async search(): Promise<any> {
    const requests = new RequestBuilder(
      this.facets,
      this.facetFilters,
      this.filter,
      this.params
    ).build()

    const results = await Promise.all(
      requests.map((request) => this.apiClient.post(request))
    )

    return transformResponse(results, this.facets)
  }
}
