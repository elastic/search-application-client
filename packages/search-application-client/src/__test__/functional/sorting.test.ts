import nock from 'nock'
import Client from '../../index'
import 'cross-fetch/polyfill'
import { ALL_RESULTS } from '../mocks'

describe('Sorting', () => {
  it('should send sorting parameter', async () => {
    const client = Client('test', 'http://localhost:6000', 'test', {
      facets: {},
    })

    nock('http://localhost:6000')
      .post(
        '/_application/search_application/test/_search',
        (requestBody: any) => {
          expect(requestBody.params._es_sort_fields).toEqual([
            { year: 'asc' },
            '_score',
          ])
          return true
        }
      )
      .times(1)
      .reply(200, ALL_RESULTS)

    const results = await client()
      .setSort([{ year: 'asc' }, '_score'])
      .query('test')
      .search()

    expect(results['response']).toMatchSnapshot('Response with results')
  })
})
