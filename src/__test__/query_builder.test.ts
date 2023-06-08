import { QueryBuilder } from '../query_builder'
import { API } from '../api'

describe('QueryBuilder', () => {
  let queryBuilder

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
          Rated: 'PG',
        },
      })

      expect(queryBuilder.filter).toEqual({
        match: {
          Rated: 'PG',
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
})
