import { QueryBuilder } from '../query_builder'
import { API } from '../api'

describe('QueryBuilder', () => {
  let queryBuilder: QueryBuilder

  beforeEach(() => {
    queryBuilder = new QueryBuilder(new API('', '', ''), {})
  })

  describe('addParameter', () => {
    test('should params be empty', () => {
      expect(queryBuilder.params).toEqual({})
    })

    test('should add param to params', () => {
      queryBuilder.addParameter('query', 'test')
      queryBuilder.addParameter('custom', 'this')
      expect(queryBuilder.params).toEqual({
        query: 'test',
        custom: 'this',
      })
    })
  })

  describe('setFilter', () => {
    test('should _es_filters be undefined when not passed filters', () => {
      expect(queryBuilder.filter).toBeUndefined()
    })

    test('should set _es_filters when pass object', () => {
      queryBuilder.setFilter({
        match: {
          Rated: {
            query: 'PG',
          },
        },
      })

      queryBuilder.setFilter({
        term: {
          'Rated.keyword': 'PG',
        },
      })

      expect(queryBuilder.filter).toEqual({
        term: {
          'Rated.keyword': 'PG',
        },
      })

      queryBuilder.setFilter({
        match: {
          SubRated: {
            query: 'PG2',
          },
        },
      })

      expect(queryBuilder.filter).toEqual({
        match: {
          SubRated: {
            query: 'PG2',
          },
        },
      })
    })
  })

  describe('addFacetFilter', () => {
    test('should throw error when facet not passed in configuration params', () => {
      expect(() => {
        queryBuilder.addFacetFilter('Rated', 'PG')
      }).toThrow(`Facet Rated wasn't passed in configuration params`)
    })

    test('should update _es_filters when proper param passed to addFacetFilter', () => {
      const queryBuilderWithFacet = new QueryBuilder(new API('', '', ''), {
        facets: {
          actors: {
            field: 'actors.enum',
            size: 10,
            type: 'terms',
          },
          directors: {
            field: 'directors.enum',
            size: 10,
            type: 'terms',
            disjunctive: true,
          },
          imdbrating: {
            field: 'imdbrating',
            type: 'stats',
          },
        },
      })

      queryBuilderWithFacet
        .addFacetFilter('actors', 'PG')
        .addFacetFilter('directors', ['Steven Spielberg', 'Robert Zemeckis'])
        .addFacetFilter('imdbrating', { gte: 7.5 })

      expect(queryBuilderWithFacet.facetFilters).toEqual({
        actors: ['PG'],
        directors: ['Steven Spielberg', 'Robert Zemeckis'],
        imdbrating: [{ gte: 7.5 }],
      })
    })
  })

  describe('query', () => {
    test('should add query to params', () => {
      queryBuilder.query('test')
      expect(queryBuilder.params).toEqual({
        query: 'test',
      })
    })
  })

  describe('setFrom', () => {
    test('should add from to params', () => {
      queryBuilder.setFrom(10)
      expect(queryBuilder.params).toEqual({
        from: 10,
      })
    })
  })

  describe('setSize', () => {
    test('should add size to params', () => {
      queryBuilder.setPageSize(10)
      expect(queryBuilder.params).toEqual({
        size: 10,
      })
    })
  })

  describe('setPage', () => {
    test('should add from to params', () => {
      queryBuilder.setPageSize(10)
      queryBuilder.setPage(10)
      expect(queryBuilder.params).toEqual({
        size: 10,
        from: 90,
      })
    })
  })
})
