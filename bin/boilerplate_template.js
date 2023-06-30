import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const dictionary = require('./request_schema.json')

export default {
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
    dictionary,
  },
}
