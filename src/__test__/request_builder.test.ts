import { RequestBuilder } from '../request_builder'

describe('facets builder', () => {
  it('should be able to build a facets query', () => {
    const facetsBuilder = new RequestBuilder(
      {
        actors: {
          type: 'terms',
          field: 'actors',
          size: 10,
        },
        directors: {
          type: 'terms',
          field: 'directors',
          size: 10,
          disjunctive: true,
        },
        imdbrating: {
          type: 'stats',
          field: 'imdbrating',
        },
      },
      {
        directors: ['director1', 'director2'],
      },
      null,
      {
        query: 'test',
        size: 10,
        from: 0,
      }
    )

    const aggRequests = facetsBuilder.build()

    expect(aggRequests).toMatchInlineSnapshot(`
      [
        {
          "_es_aggs": {
            "actors_facet": {
              "terms": {
                "field": "actors",
                "size": 10,
              },
            },
            "imdbrating_facet": {
              "stats": {
                "field": "imdbrating",
              },
            },
          },
          "_es_filters": {
            "bool": {
              "must": [
                {
                  "terms": {
                    "directors": [
                      "director1",
                      "director2",
                    ],
                  },
                },
              ],
            },
          },
          "from": 0,
          "query": "test",
          "size": 10,
        },
        {
          "_es_aggs": {
            "directors_facet": {
              "terms": {
                "field": "directors",
                "size": 10,
              },
            },
          },
          "_es_filters": {
            "bool": {
              "must": [],
            },
          },
          "from": 0,
          "query": "test",
          "size": 0,
        },
      ]
    `)
  })
})
