import type { SearchRequest } from '@elastic/elasticsearch/lib/api/types'
export type {
  SearchResponse as ResponseParams,
  AggregationsMultiTermsAggregate as ResponseTermsAggregation,
  AggregationsStatsAggregate as ResponseStatsAggregation,
  AggregationsAggregationContainer as Aggregations,
} from '@elastic/elasticsearch/lib/api/types'

export type BaseValueFilter = string | string[] | number | number[]
export type BaseRangeFilter = {
  gte?: number
  lte?: number
  gt?: number
  lt?: number
}
export type FilterFieldValue = BaseValueFilter | BaseRangeFilter

export type Params = Record<string, unknown>

export type FacetFilters = Record<string, FilterFieldValue[]>

export type SortFields = (Record<string, 'desc' | 'asc'> | '_score')[]

export type BoolQuery = {
  must?: Query[]
  filter?: Query[]
  should?: Query[]
  must_not?: Query[]
}

export type BaseQueryValue = string | number | boolean

export type MatchQuery = {
  [field: string]: {
    query: BaseQueryValue
  }
}

export type TermQuery = {
  [field: string]: BaseQueryValue
}

export type RangeQuery = {
  [field: string]: BaseRangeFilter
}

export type NestedQuery = {
  path: string
  query: Query
}

export type Query = {
  match?: MatchQuery
  term?: TermQuery
  range?: RangeQuery
  nested?: NestedQuery
  geo_bounding_box?: GeoBoundingBoxQuery
  geo_distance?: GeoDistanceQuery
}

export type GeoBoundingBoxQuery = {
  [field: string]: {
    top_left: {
      lat: number
      lon: number
    }
    bottom_right: {
      lat: number
      lon: number
    }
  }
}

export type GeoDistanceQuery = {
  distance: string
} & Record<
  string,
  {
    lat: number
    lon: number
  }
>

export type RequestParams = Pick<SearchRequest, 'from' | 'size'> & {
  _es_aggs?: SearchRequest['aggs']
  _es_filters?: SearchRequest['query']['bool']['filter']
  _es_sort_fields?: SearchRequest['sort']
  query?: SearchRequest['query']['query_string']['query']
  highlight_fields?: SearchRequest['highlight']
}
