import ora from 'ora'
import inquirer from 'inquirer'
import chalk from 'chalk'
import fetch from 'cross-fetch'
const AUTH_METHOD = {
  APIKey: 'API Key',
  Cred: 'credentials',
}

const data = JSON.stringify({
  indices: ['search-movies'],
  template: {
    script: {
      lang: 'mustache',
      source: `
        {
          "query": {
            "bool": {
              "must": [
              {{#query}}
              {
                "query_string": {
                  "query": "{{query}}"
                }
              }
              {{/query}}
            ],
            "filter": {{#toJson}}_es_filters{{/toJson}}
            }
          },
          "aggs": {{#toJson}}_es_aggs{{/toJson}},
          "from": {{from}},
          "size": {{size}},
          "sort": {{#toJson}}_es_sort_fields{{/toJson}}
        }`,
      params: {
        query: '',
        _es_filters: [],
        _es_aggs: {},
        _es_sort_fields: {},
        from: 0,
        size: 10,
      },
    },
    dictionary: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: {
        AggregationsAggregateOrder: {
          anyOf: [
            {
              $ref: '#/definitions/Partial<Record<string,SortOrder>>',
            },
            {
              items: {
                $ref: '#/definitions/Partial<Record<string,SortOrder>>',
              },
              type: 'array',
            },
          ],
        },
        BaseQueryValue: {
          type: ['string', 'number', 'boolean'],
        },
        BoolQuery: {
          properties: {
            filter: {
              items: {
                $ref: '#/definitions/Query',
              },
              type: 'array',
            },
            must: {
              items: {
                $ref: '#/definitions/Query',
              },
              type: 'array',
            },
            must_not: {
              items: {
                $ref: '#/definitions/Query',
              },
              type: 'array',
            },
            should: {
              items: {
                $ref: '#/definitions/Query',
              },
              type: 'array',
            },
          },
          minProperties: 1,
          additionalProperties: false,
          type: 'object',
        },
        GeoDistanceQuery: {
          allOf: [
            {
              properties: {
                distance: {
                  type: 'string',
                },
              },
              required: ['distance'],
              additionalProperties: false,
              type: 'object',
            },
            {
              additionalProperties: {
                properties: {
                  lat: {
                    type: 'number',
                  },
                  lon: {
                    type: 'number',
                  },
                },
                required: ['lat', 'lon'],
                additionalProperties: false,
                type: 'object',
              },
              type: 'object',
            },
          ],
        },
        'Partial<Record<string,SortOrder>>': {
          additionalProperties: {
            enum: ['asc', 'desc'],
            type: 'string',
          },
          type: 'object',
        },
        Query: {
          properties: {
            bool: {
              $ref: '#/definitions/BoolQuery',
            },
            geo_bounding_box: {
              additionalProperties: {
                properties: {
                  bottom_right: {
                    properties: {
                      lat: {
                        type: 'number',
                      },
                      lon: {
                        type: 'number',
                      },
                    },
                    required: ['lat', 'lon'],
                    additionalProperties: false,
                    type: 'object',
                  },
                  top_left: {
                    properties: {
                      lat: {
                        type: 'number',
                      },
                      lon: {
                        type: 'number',
                      },
                    },
                    required: ['lat', 'lon'],
                    additionalProperties: false,
                    type: 'object',
                  },
                },
                required: ['bottom_right', 'top_left'],
                additionalProperties: false,
                type: 'object',
              },
              type: 'object',
            },
            geo_distance: {
              $ref: '#/definitions/GeoDistanceQuery',
            },
            match: {
              additionalProperties: {
                properties: {
                  query: {
                    $ref: '#/definitions/BaseQueryValue',
                  },
                },
                required: ['query'],
                additionalProperties: false,
                type: 'object',
              },
              type: 'object',
            },
            nested: {
              properties: {
                path: {
                  type: 'string',
                },
                query: {
                  $ref: '#/definitions/Query',
                },
              },
              required: ['path', 'query'],
              additionalProperties: false,
              type: 'object',
            },
            range: {
              additionalProperties: {
                properties: {
                  gt: {
                    type: 'number',
                  },
                  gte: {
                    type: 'number',
                  },
                  lt: {
                    type: 'number',
                  },
                  lte: {
                    type: 'number',
                  },
                },
                minProperties: 1,
                additionalProperties: false,
                type: 'object',
              },
              type: 'object',
            },
            term: {
              additionalProperties: {
                $ref: '#/definitions/BaseQueryValue',
              },
              type: 'object',
            },
          },
          additionalProperties: false,
          type: 'object',
        },
      },
      properties: {
        _es_aggs: {
          patternProperties: {
            _facet$: {
              properties: {
                stats: {
                  properties: {
                    field: {
                      type: 'string',
                    },
                  },
                  required: ['field'],
                  additionalProperties: false,
                  type: 'object',
                },
                terms: {
                  properties: {
                    field: {
                      type: 'string',
                    },
                    order: {
                      $ref: '#/definitions/AggregationsAggregateOrder',
                    },
                    size: {
                      type: 'number',
                    },
                  },
                  required: ['field'],
                  additionalProperties: false,
                  type: 'object',
                },
              },
              minProperties: 1,
              additionalProperties: false,
              type: 'object',
            },
          },
          additionalProperties: false,
          type: 'object',
        },
        _es_filters: {
          $ref: '#/definitions/Query',
        },
        _es_sort_fields: {
          items: {
            anyOf: [
              {
                additionalProperties: {
                  enum: ['asc', 'desc'],
                  type: 'string',
                },
                type: 'object',
              },
              {
                const: '_score',
                type: 'string',
              },
            ],
          },
          type: 'array',
        },
      },
      type: 'object',
    },
  },
})

inquirer
  .prompt([
    {
      type: 'input',
      name: 'endpoint',
      message: `Enter ${chalk.bgGrey('endpoint')} for elasticsearch`,
      filter(input) {
        return new Promise((resolve, reject) => {
          if (!input) {
            reject('Endpoint is required')
          } else {
            resolve(input)
          }
        })
      },
    },
    {
      type: 'input',
      name: 'applicationName',
      message: `Enter your ${chalk.bgGrey('search application name')}`,
      filter(input) {
        return new Promise((resolve, reject) => {
          if (!input) {
            reject('Application name is required')
          } else {
            resolve(input)
          }
        })
      },
    },
    {
      type: 'input',
      name: 'indexName',
      message: `Enter ${chalk.bgGrey('index')} for your search application`,
      filter(input) {
        return new Promise((resolve, reject) => {
          if (!input) {
            reject('Index is required')
          } else {
            resolve(input)
          }
        })
      },
    },
    {
      type: 'list',
      name: 'loginType',
      message: 'Select authorization type?',
      choices: [
        { name: 'API key', value: AUTH_METHOD.APIKey },
        { name: 'User:Password', value: AUTH_METHOD.Cred },
      ],
    },
    {
      type: 'input',
      name: 'apiKey',
      message: `Enter ${chalk.bgGrey('apiKey')} with proper permissions`,
      filter(input) {
        return new Promise((resolve, reject) => {
          if (!input) {
            reject('API key is required')
          } else {
            resolve(input)
          }
        })
      },
      when(answers) {
        return answers.loginType === AUTH_METHOD.APIKey
      },
    },
    {
      type: 'input',
      name: 'user',
      message: `Enter ${chalk.bgGrey('username')} for authorization`,
      filter(input) {
        return new Promise((resolve, reject) => {
          if (!input) {
            reject('Username is required')
          } else {
            resolve(input)
          }
        })
      },
      when(answers) {
        return answers.loginType === AUTH_METHOD.Cred
      },
    },
    {
      type: 'password',
      name: 'password',
      message: `Enter ${chalk.bgGrey('password')} for authorization`,
      filter(input) {
        return new Promise((resolve, reject) => {
          if (!input) {
            reject('Password is required')
          } else {
            resolve(input)
          }
        })
      },
      when(answers) {
        return answers.loginType === AUTH_METHOD.Cred
      },
    },
  ])
  .then(({ endpoint, applicationName, apiKey, user, password }) => {
    const url = `${endpoint}/_application/search_application/${applicationName}`
    const token = Buffer.from(`${user}:${password}`).toString('base64')
    const authorization = apiKey ? `Apikey ${apiKey}` : `Basic ${token}`

    const spinner = ora('Updating template').start()
    fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: data,
    })
      .then(async (response) => {
        if (!response.ok) {
          const err = await response.json()
          console.error(err)
          throw new Error(err?.error?.reason)
        }
      })
      .then(() => {
        spinner.succeed(chalk.green('Template updated'))
      })
      .catch((error) => {
        if (error.message) console.error('\n' + chalk.red(error.message))
        spinner.fail('Error during template update')
      })
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      console.error(error)
    }
  })
