import { QueryBuilder } from '../query_builder'
import { API } from '../api'

describe('QueryBuilder', () => {
  let queryBuilder

  beforeEach(() => {
    queryBuilder = new QueryBuilder(new API('', '', ''), {})
  })

  describe('addParameter', () => {
    test('should params be empty', () => {
      expect(queryBuilder.params.params).toEqual({})
    })

    test('should add param to params', () => {
      queryBuilder.addParameter('query', 'test')
      queryBuilder.addParameter('custom', 'this')
      expect(queryBuilder.params.params).toEqual({
        query: 'test',
        custom: 'this',
      })
    })
  })

  describe('setFilter', () => {
    test('should _es_filters be undefined when not passed filters', () => {
      expect(queryBuilder.params.params._es_filters).toBeUndefined()
    })

    test('should set _es_filters when pass object', () => {
      queryBuilder.setFilter({
        match: {
          Rated: 'PG',
        },
      })

      expect(queryBuilder.params.params._es_filters).toEqual({
        bool: {
          must: [
            {
              match: {
                Rated: 'PG',
              },
            },
          ],
        },
      })
    })

    test('should add filter to the end of array', () => {
      queryBuilder.setFilter({
        match: {
          Rated: 'PG',
        },
      })

      queryBuilder.setFilter({
        match: {
          SubRated: 'PG2',
        },
      })

      expect(queryBuilder.params.params._es_filters).toEqual({
        bool: {
          must: [
            {
              match: {
                Rated: 'PG',
              },
            },
            {
              match: {
                SubRated: 'PG2',
              },
            },
          ],
        },
      })
    })
  })
})
