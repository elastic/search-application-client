import {
  Aggregations,
  FacetFilters,
  Params,
  Query,
  RequestParams,
  SortFields,
} from './types'

interface BaseFacetConfiguration {
  type: 'terms' | 'stats'
  field: string
  disjunctive?: boolean
}

interface TermsFacetConfiguration extends BaseFacetConfiguration {
  type: 'terms'
  size: number
}

interface StatsFacetConfiguration extends BaseFacetConfiguration {
  type: 'stats'
}

export type FacetConfiguration =
  | TermsFacetConfiguration
  | StatsFacetConfiguration

interface FacetsConfiguration {
  [facetName: string]: FacetConfiguration
}

const TermsAggregation = (
  facetConfiguration: TermsFacetConfiguration
): Pick<Aggregations, 'terms'> => ({
  terms: {
    field: facetConfiguration.field,
    size: facetConfiguration.size,
  },
})

const StatsAggregation = (
  facetConfiguration: StatsFacetConfiguration
): Pick<Aggregations, 'stats'> => ({
  stats: {
    field: facetConfiguration.field,
  },
})

export class RequestBuilder {
  constructor(
    private readonly facetsConfiguration: FacetsConfiguration,
    private readonly facetFilters: FacetFilters,
    private readonly filter: Query,
    private readonly sort: SortFields,
    private readonly params: Params
  ) {}

  build(): RequestParams[] {
    const facetRequests = Object.keys(this.facetsConfiguration).reduce<
      string[][]
    >(
      (requests, facetName) => {
        const facetConfiguration = this.facetsConfiguration[facetName]
        if (
          facetConfiguration.disjunctive &&
          this.facetFilters[facetName]?.length > 0
        ) {
          requests.push([facetName])
          return requests
        }
        requests[0].push(facetName)
        return requests
      },
      [[]]
    )

    return facetRequests.reduce<RequestParams[]>((acc, facetNames, i) => {
      const initialRequest = i === 0

      const aggs = facetNames.reduce<Record<string, Aggregations>>(
        (acc, facetName) => {
          const facetConfiguration = this.facetsConfiguration[facetName]

          const aggregation =
            facetConfiguration.type === 'terms'
              ? TermsAggregation(facetConfiguration)
              : StatsAggregation(facetConfiguration)

          return {
            ...acc,
            [`${facetName}_facet`]: aggregation,
          }
        },
        {}
      )

      const filters = Object.keys(this.facetsConfiguration).reduce(
        (acc, facetName) => {
          const facetConfiguration = this.facetsConfiguration[facetName]
          const facetFilter = this.facetFilters[facetName] || []

          if (facetFilter.length === 0) return acc
          if (facetConfiguration.disjunctive && !initialRequest) return acc

          return [
            ...acc,
            {
              [facetConfiguration.type === 'terms' ? 'terms' : 'range']: {
                [facetConfiguration.field]: facetFilter,
              },
            },
          ]
        },
        []
      )

      acc.push({
        _es_aggs: aggs,
        _es_filters: {
          bool: {
            must: [...(this.filter ? [this.filter] : []), ...filters],
          },
        },
        ...(this.sort ? { _es_sort_fields: this.sort } : {}),
        ...this.params,
        ...(initialRequest ? {} : { size: 0, from: 0 }),
      })
      return acc
    }, [])
  }
}
