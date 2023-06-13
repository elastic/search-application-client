import { API } from './api'
import { FacetConfiguration, RequestBuilder } from './request_builder'
import { FilterFieldValue, Params, Query, SortFields } from './types'

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

  const facets = Object.keys(combinedAggregations).reduce(
    (facets, facetName) => {
      const key = facetName.replace('_facet', '')
      const facetConfiguration = facetConfigurations[key]
      if (!facetConfiguration) return facets

      const aggregation = combinedAggregations[facetName]
      if (facetConfiguration.type === 'terms') {
        return [
          ...facets,
          {
            name: key,
            entries: aggregation.buckets.map((bucket) => {
              return {
                value: bucket.key,
                count: bucket.doc_count,
              }
            }),
          },
        ]
      } else if (facetConfiguration.type === 'stats') {
        return [
          ...facets,
          {
            name: key,
            stats: {
              min: aggregation.min,
              max: aggregation.max,
              avg: aggregation.avg,
              sum: aggregation.sum,
              count: aggregation.count,
            },
          },
        ]
      }
    },
    []
  )

  const userSpecifiedAggs = Object.keys(results[0].aggregations).reduce(
    (acc, aggregationKey) => {
      if (!facetConfigurations[aggregationKey.replace('_facet', '')]) {
        return {
          ...acc,
          [aggregationKey]: results[0].aggregations[aggregationKey],
        }
      }
      return acc
    },
    {}
  )

  return {
    ...results[0],
    aggregations: userSpecifiedAggs,
    facets,
  }
}

export class QueryBuilder {
  readonly facets: Record<string, FacetConfiguration>
  facetFilters: Record<string, FilterFieldValue[]> = {}
  sort: SortFields
  filter: Query
  params: Params = {}

  constructor(private readonly apiClient: API, baseParams) {
    const { facets, ...rest } = baseParams
    this.facets = facets
    this.params = rest
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

  setFilter(value: Query): this {
    this.filter = value
    return this
  }

  addParameter(parameter: string, value: unknown): this {
    this.params[parameter] = value

    return this
  }

  query(query: string): this {
    this.params.query = query

    return this
  }

  setSort(sort: SortFields): this {
    this.sort = sort

    return this
  }

  async search(): Promise<any> {
    const requests = new RequestBuilder(
      this.facets,
      this.facetFilters,
      this.filter,
      this.sort,
      this.params
    ).build()

    const results = await Promise.all(
      requests.map((request) => this.apiClient.post({ params: request }))
    )

    return transformResponse(results, this.facets)
  }
}
