import type {
  SearchRequest,
  AggregationsStatsAggregate as ResponseStatsAggregation,
} from '@elastic/elasticsearch/lib/api/types'
import { AggregationsSignificantStringTermsBucket } from '@elastic/elasticsearch/lib/api/types'

export type {
  SearchResponse as ResponseParams,
  AggregationsSignificantStringTermsAggregate as ResponseTermsAggregation,
  AggregationsStatsAggregate as ResponseStatsAggregation,
  AggregationsAggregationContainer,
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
  bool?: BoolQuery
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

export type GeoDistanceQuery = { distance: string } & {
  [field: string]: {
    lat: number
    lon: number
  }
}

export type Aggregations = {
  stats?: {
    field: SearchRequest['aggs'][string]['stats']['field']
  }
  terms?: {
    field: SearchRequest['aggs'][string]['terms']['field']
    order?: SearchRequest['aggs'][string]['terms']['order']
    size?: SearchRequest['aggs'][string]['terms']['size']
  }
}

export type RequestParams = {
  _es_aggs?: { [name: string]: Aggregations }
  _es_filters?: Query
  _es_sort_fields?: SortFields
  query?: SearchRequest['query']['query_string']['query']
  highlight_fields?: SearchRequest['highlight']
}

export type ResponseTermsFacet = {
  name: string
  entries: {
    value: AggregationsSignificantStringTermsBucket['key']
    count: AggregationsSignificantStringTermsBucket['doc_count']
  }[]
}

export type ResponseStatsFacet = {
  name: string
  stats: Pick<ResponseStatsAggregation, 'min' | 'max' | 'avg' | 'sum' | 'count'>
}
export type ResponseFacets = ResponseTermsFacet | ResponseStatsFacet
