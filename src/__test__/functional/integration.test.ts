import nock from 'nock'
import Client from '../../index'
import 'cross-fetch/polyfill'
import { AGG_ACTORS_RESPONSE, ALL_RESULTS } from '../mocks'

describe('Full integration test', () => {
  it('should work', async () => {
    const client = Client('test', 'http://localhost:6000', 'test', {
      facets: {
        actors: {
          type: 'terms',
          field: 'actors.enum',
          size: 10,
          disjunctive: true,
        },
        directors: {
          type: 'terms',
          field: 'directors.enum',
          size: 10,
          disjunctive: true,
        },
        year: {
          type: 'stats',
          field: 'year',
        },
      },
    })

    nock('http://localhost:6000')
      .post(
        '/_application/search_application/test/_search',
        (requestBody: any) => {
          expect(requestBody).toMatchInlineSnapshot(`
            {
              "params": {
                "_es_aggs": {
                  "directors_facet": {
                    "terms": {
                      "field": "directors.enum",
                      "size": 10,
                    },
                  },
                  "year_facet": {
                    "stats": {
                      "field": "year",
                    },
                  },
                },
                "_es_filters": {
                  "bool": {
                    "must": [
                      {
                        "match": {
                          "Rated": "PG",
                        },
                      },
                      {
                        "terms": {
                          "actors.enum": [
                            "Keanu Reeves",
                          ],
                        },
                      },
                      {
                        "range": {
                          "year": [
                            {
                              "gte": 1990,
                              "lte": 2200,
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                "query": "test",
              },
            }
          `)
          return true
        }
      )
      .times(1)
      .reply(200, ALL_RESULTS)
      .post(
        '/_application/search_application/test/_search',
        (requestBody: any) => {
          expect(requestBody).toMatchInlineSnapshot(`
            {
              "params": {
                "_es_aggs": {
                  "actors_facet": {
                    "terms": {
                      "field": "actors.enum",
                      "size": 10,
                    },
                  },
                },
                "_es_filters": {
                  "bool": {
                    "must": [
                      {
                        "match": {
                          "Rated": "PG",
                        },
                      },
                      {
                        "range": {
                          "year": [
                            {
                              "gte": 1990,
                              "lte": 2200,
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                "from": 0,
                "query": "test",
                "size": 0,
              },
            }
          `)
          return true
        }
      )
      .times(1)
      .reply(200, AGG_ACTORS_RESPONSE)

    const results = await client()
      .setFilter({
        match: {
          Rated: 'PG',
        },
      })
      .addFacetFilter('actors', 'Keanu Reeves')
      .addFacetFilter('year', { gte: 1990, lte: 2200 })
      .query('test')
      .search()

    expect(results.response).toMatchSnapshot('Response with results')
    expect(results.facets).toMatchSnapshot('Response with facets')
  })
})
