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
          "dictionary": {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "definitions": {
              "AggregationsAggregateOrder": {
                "anyOf": [
                  {
                    "$ref": "#/definitions/Partial<Record<string,SortOrder>>",
                  },
                  {
                    "items": {
                      "$ref": "#/definitions/Partial<Record<string,SortOrder>>",
                    },
                    "type": "array",
                  },
                ],
              },
              "BaseQueryValue": {
                "type": [
                  "string",
                  "number",
                  "boolean",
                ],
              },
              "BoolQuery": {
                "additionalProperties": false,
                "minProperties": 1,
                "properties": {
                  "filter": {
                    "items": {
                      "$ref": "#/definitions/Query",
                    },
                    "type": "array",
                  },
                  "must": {
                    "items": {
                      "$ref": "#/definitions/Query",
                    },
                    "type": "array",
                  },
                  "must_not": {
                    "items": {
                      "$ref": "#/definitions/Query",
                    },
                    "type": "array",
                  },
                  "should": {
                    "items": {
                      "$ref": "#/definitions/Query",
                    },
                    "type": "array",
                  },
                },
                "type": "object",
              },
              "GeoDistanceQuery": {
                "allOf": [
                  {
                    "additionalProperties": false,
                    "properties": {
                      "distance": {
                        "type": "string",
                      },
                    },
                    "required": [
                      "distance",
                    ],
                    "type": "object",
                  },
                  {
                    "additionalProperties": {
                      "additionalProperties": false,
                      "properties": {
                        "lat": {
                          "type": "number",
                        },
                        "lon": {
                          "type": "number",
                        },
                      },
                      "required": [
                        "lat",
                        "lon",
                      ],
                      "type": "object",
                    },
                    "type": "object",
                  },
                ],
              },
              "Partial<Record<string,SortOrder>>": {
                "additionalProperties": {
                  "enum": [
                    "asc",
                    "desc",
                  ],
                  "type": "string",
                },
                "type": "object",
              },
              "Query": {
                "additionalProperties": false,
                "properties": {
                  "bool": {
                    "$ref": "#/definitions/BoolQuery",
                  },
                  "geo_bounding_box": {
                    "additionalProperties": {
                      "additionalProperties": false,
                      "properties": {
                        "bottom_right": {
                          "additionalProperties": false,
                          "properties": {
                            "lat": {
                              "type": "number",
                            },
                            "lon": {
                              "type": "number",
                            },
                          },
                          "required": [
                            "lat",
                            "lon",
                          ],
                          "type": "object",
                        },
                        "top_left": {
                          "additionalProperties": false,
                          "properties": {
                            "lat": {
                              "type": "number",
                            },
                            "lon": {
                              "type": "number",
                            },
                          },
                          "required": [
                            "lat",
                            "lon",
                          ],
                          "type": "object",
                        },
                      },
                      "required": [
                        "bottom_right",
                        "top_left",
                      ],
                      "type": "object",
                    },
                    "type": "object",
                  },
                  "geo_distance": {
                    "$ref": "#/definitions/GeoDistanceQuery",
                  },
                  "match": {
                    "additionalProperties": {
                      "additionalProperties": false,
                      "properties": {
                        "query": {
                          "$ref": "#/definitions/BaseQueryValue",
                        },
                      },
                      "required": [
                        "query",
                      ],
                      "type": "object",
                    },
                    "type": "object",
                  },
                  "nested": {
                    "additionalProperties": false,
                    "properties": {
                      "path": {
                        "type": "string",
                      },
                      "query": {
                        "$ref": "#/definitions/Query",
                      },
                    },
                    "required": [
                      "path",
                      "query",
                    ],
                    "type": "object",
                  },
                  "range": {
                    "additionalProperties": {
                      "additionalProperties": false,
                      "minProperties": 1,
                      "properties": {
                        "gt": {
                          "type": "number",
                        },
                        "gte": {
                          "type": "number",
                        },
                        "lt": {
                          "type": "number",
                        },
                        "lte": {
                          "type": "number",
                        },
                      },
                      "type": "object",
                    },
                    "type": "object",
                  },
                  "term": {
                    "additionalProperties": {
                      "$ref": "#/definitions/BaseQueryValue",
                    },
                    "type": "object",
                  },
                },
                "type": "object",
              },
            },
            "properties": {
              "_es_aggs": {
                "additionalProperties": false,
                "patternProperties": {
                  "_facet$": {
                    "additionalProperties": false,
                    "minProperties": 1,
                    "properties": {
                      "stats": {
                        "additionalProperties": false,
                        "properties": {
                          "field": {
                            "type": "string",
                          },
                        },
                        "required": [
                          "field",
                        ],
                        "type": "object",
                      },
                      "terms": {
                        "additionalProperties": false,
                        "properties": {
                          "field": {
                            "type": "string",
                          },
                          "order": {
                            "$ref": "#/definitions/AggregationsAggregateOrder",
                          },
                          "size": {
                            "type": "number",
                          },
                        },
                        "required": [
                          "field",
                        ],
                        "type": "object",
                      },
                    },
                    "type": "object",
                  },
                },
                "type": "object",
              },
              "_es_filters": {
                "$ref": "#/definitions/Query",
              },
              "_es_sort_fields": {
                "items": {
                  "anyOf": [
                    {
                      "additionalProperties": {
                        "enum": [
                          "asc",
                          "desc",
                        ],
                        "type": "string",
                      },
                      "type": "object",
                    },
                    {
                      "const": "_score",
                      "type": "string",
                    },
                  ],
                },
                "type": "array",
              },
            },
            "type": "object",
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
          "dictionary": {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "definitions": {
              "AggregationsAggregateOrder": {
                "anyOf": [
                  {
                    "$ref": "#/definitions/Partial<Record<string,SortOrder>>",
                  },
                  {
                    "items": {
                      "$ref": "#/definitions/Partial<Record<string,SortOrder>>",
                    },
                    "type": "array",
                  },
                ],
              },
              "BaseQueryValue": {
                "type": [
                  "string",
                  "number",
                  "boolean",
                ],
              },
              "BoolQuery": {
                "additionalProperties": false,
                "minProperties": 1,
                "properties": {
                  "filter": {
                    "items": {
                      "$ref": "#/definitions/Query",
                    },
                    "type": "array",
                  },
                  "must": {
                    "items": {
                      "$ref": "#/definitions/Query",
                    },
                    "type": "array",
                  },
                  "must_not": {
                    "items": {
                      "$ref": "#/definitions/Query",
                    },
                    "type": "array",
                  },
                  "should": {
                    "items": {
                      "$ref": "#/definitions/Query",
                    },
                    "type": "array",
                  },
                },
                "type": "object",
              },
              "GeoDistanceQuery": {
                "allOf": [
                  {
                    "additionalProperties": false,
                    "properties": {
                      "distance": {
                        "type": "string",
                      },
                    },
                    "required": [
                      "distance",
                    ],
                    "type": "object",
                  },
                  {
                    "additionalProperties": {
                      "additionalProperties": false,
                      "properties": {
                        "lat": {
                          "type": "number",
                        },
                        "lon": {
                          "type": "number",
                        },
                      },
                      "required": [
                        "lat",
                        "lon",
                      ],
                      "type": "object",
                    },
                    "type": "object",
                  },
                ],
              },
              "Partial<Record<string,SortOrder>>": {
                "additionalProperties": {
                  "enum": [
                    "asc",
                    "desc",
                  ],
                  "type": "string",
                },
                "type": "object",
              },
              "Query": {
                "additionalProperties": false,
                "properties": {
                  "bool": {
                    "$ref": "#/definitions/BoolQuery",
                  },
                  "geo_bounding_box": {
                    "additionalProperties": {
                      "additionalProperties": false,
                      "properties": {
                        "bottom_right": {
                          "additionalProperties": false,
                          "properties": {
                            "lat": {
                              "type": "number",
                            },
                            "lon": {
                              "type": "number",
                            },
                          },
                          "required": [
                            "lat",
                            "lon",
                          ],
                          "type": "object",
                        },
                        "top_left": {
                          "additionalProperties": false,
                          "properties": {
                            "lat": {
                              "type": "number",
                            },
                            "lon": {
                              "type": "number",
                            },
                          },
                          "required": [
                            "lat",
                            "lon",
                          ],
                          "type": "object",
                        },
                      },
                      "required": [
                        "bottom_right",
                        "top_left",
                      ],
                      "type": "object",
                    },
                    "type": "object",
                  },
                  "geo_distance": {
                    "$ref": "#/definitions/GeoDistanceQuery",
                  },
                  "match": {
                    "additionalProperties": {
                      "additionalProperties": false,
                      "properties": {
                        "query": {
                          "$ref": "#/definitions/BaseQueryValue",
                        },
                      },
                      "required": [
                        "query",
                      ],
                      "type": "object",
                    },
                    "type": "object",
                  },
                  "nested": {
                    "additionalProperties": false,
                    "properties": {
                      "path": {
                        "type": "string",
                      },
                      "query": {
                        "$ref": "#/definitions/Query",
                      },
                    },
                    "required": [
                      "path",
                      "query",
                    ],
                    "type": "object",
                  },
                  "range": {
                    "additionalProperties": {
                      "additionalProperties": false,
                      "minProperties": 1,
                      "properties": {
                        "gt": {
                          "type": "number",
                        },
                        "gte": {
                          "type": "number",
                        },
                        "lt": {
                          "type": "number",
                        },
                        "lte": {
                          "type": "number",
                        },
                      },
                      "type": "object",
                    },
                    "type": "object",
                  },
                  "term": {
                    "additionalProperties": {
                      "$ref": "#/definitions/BaseQueryValue",
                    },
                    "type": "object",
                  },
                },
                "type": "object",
              },
            },
            "properties": {
              "_es_aggs": {
                "additionalProperties": false,
                "patternProperties": {
                  "_facet$": {
                    "additionalProperties": false,
                    "minProperties": 1,
                    "properties": {
                      "stats": {
                        "additionalProperties": false,
                        "properties": {
                          "field": {
                            "type": "string",
                          },
                        },
                        "required": [
                          "field",
                        ],
                        "type": "object",
                      },
                      "terms": {
                        "additionalProperties": false,
                        "properties": {
                          "field": {
                            "type": "string",
                          },
                          "order": {
                            "$ref": "#/definitions/AggregationsAggregateOrder",
                          },
                          "size": {
                            "type": "number",
                          },
                        },
                        "required": [
                          "field",
                        ],
                        "type": "object",
                      },
                    },
                    "type": "object",
                  },
                },
                "type": "object",
              },
              "_es_filters": {
                "$ref": "#/definitions/Query",
              },
              "_es_sort_fields": {
                "items": {
                  "anyOf": [
                    {
                      "additionalProperties": {
                        "enum": [
                          "asc",
                          "desc",
                        ],
                        "type": "string",
                      },
                      "type": "object",
                    },
                    {
                      "const": "_score",
                      "type": "string",
                    },
                  ],
                },
                "type": "array",
              },
            },
            "type": "object",
          },
          "from": 0,
          "query": "test",
          "size": 0,
        },
      ]
    `)
  })
})
