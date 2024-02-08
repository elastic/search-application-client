import { API } from './api'
import { FacetConfiguration, RequestBuilder } from './request_builder'
import type {
  FilterFieldValue,
  Params,
  Query,
  SortFields,
  ResponseParams,
  ResponseTermsAggregation,
  ResponseStatsAggregation,
  ResponseFacets,
} from './types'

const transformResponse = <T extends ResponseParams = ResponseParams>(
  results: T[],
  facetConfigurations: Record<string, FacetConfiguration>
): T & { facets?: ResponseFacets[] } => {
  const combinedAggregations = results.reduce((acc, result) => {
    return {
      ...acc,
      ...result.aggregations,
    }
  }, {})

  const facets = Object.keys(combinedAggregations).reduce<ResponseFacets[]>(
    (facets, facetName) => {
      const key = facetName.replace('_facet', '')
      const facetConfiguration = facetConfigurations[key]
      if (!facetConfiguration) return facets

      const aggregation = combinedAggregations[facetName]
      if (facetConfiguration.type === 'terms') {
        const { buckets } = aggregation as ResponseTermsAggregation

        return [
          ...facets,
          {
            name: key,
            entries: (Array.isArray(buckets)
              ? buckets
              : Object.values(buckets)
            ).map((bucket) => {
              return {
                value: bucket.key,
                count: bucket.doc_count,
              }
            }),
          },
        ]
      } else if (facetConfiguration.type === 'stats') {
        const { min, max, avg, sum, count } =
          aggregation as ResponseStatsAggregation

        return [
          ...facets,
          {
            name: key,
            stats: {
              min,
              max,
              avg,
              sum,
              count,
            },
          },
        ]
      }
    },
    []
  )

  const userSpecifiedAggs = Object.keys(results[0]?.aggregations || {}).reduce(
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
  readonly facets: Record<string, FacetConfiguration> = {}
  facetFilters: Record<string, FilterFieldValue[]> = {}
  sort: SortFields
  filter: Query
  params: Params = {}

  constructor(
    private readonly apiClient: API,
    baseParams: {
      facets?: Record<string, FacetConfiguration>
    } & Params = {}
  ) {
    const { facets, ...rest } = baseParams
    this.facets = facets || {}
    this.params = rest
  }

  /**
   * @public
   * @param {string} field
   * @param {string | Array.string | Object} value
   * @returns {QueryBuilder}
   */
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

  /**
   * @public
   * @param {string} parameter
   * @param {*} value
   * @returns {QueryBuilder}
   */
  addParameter(parameter: keyof Params, value: Params[keyof Params]): this {
    this.params[parameter] = value

    return this
  }

  /**
   * @public
   * @param {string} query
   * @returns {QueryBuilder}
   */
  query(query: string): this {
    return this.addParameter('query', query)
  }

  /**
   * @async
   * @public - returns search results
   * @returns {Promise.<Array.<Object>>}
   */
  async search<Result = unknown>(errorHandler?: (error: Error) => void) {
    const requests = new RequestBuilder(
      this.facets,
      this.facetFilters,
      this.filter,
      this.sort,
      this.params
    ).build()

    const results = (
      await Promise.all(
        requests.map((request) =>
          this.apiClient.post<ResponseParams<Result>>({ params: request })
        )
      )
    ).filter((data) => !!data)

    return transformResponse<ResponseParams<Result>>(results, this.facets)
  }

  /**
   * @public
   * @param {Object} value
   * @returns {QueryBuilder}
   */
  setFilter(value: Query): this {
    this.filter = value
    return this
  }

  /**
   * @public
   * @param {number} value
   * @returns {QueryBuilder}
   */
  setFrom(value: Params['from']): this {
    return this.addParameter('from', value)
  }

  /**
   * @public
   * @param {number} value
   * @returns {QueryBuilder}
   */
  setPageSize(value: Params['size']): this {
    return this.addParameter('size', value)
  }

  /**
   * @public
   * @param {Array.<Object<string, 'desc' | 'asc'>|'_score'>} sort
   * @returns {QueryBuilder}
   */
  setSort(sort: SortFields): this {
    this.sort = sort

    return this
  }
}
