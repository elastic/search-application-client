import { Highlight } from '../utils'
import { ResponseParams } from '../types'

type Hit = ResponseParams['hits']['hits'][0]

describe('utils', () => {
  describe('Highlight', () => {
    const hit: Hit = {
      _id: '',
      _index: '',
      _source: {
        title: 'Sample Title',
        description: 'Sample Description',
      },
      highlight: {
        title: ['<em>Sample</em> Title'],
      },
    }

    it('returns highlighted value if it exists', () => {
      const field = 'title'
      const highlightedValue = Highlight(hit, field)
      expect(highlightedValue).toEqual('<em>Sample</em> Title')
    })

    it('returns source value if highlight is empty', () => {
      const field = 'description'
      const sourceValue = Highlight(hit, field)
      expect(sourceValue).toEqual('Sample Description')
    })

    it('returns source value if highlight is undefined', () => {
      const hitWithoutHighlight: Hit = {
        _id: '',
        _index: '',
        _source: {
          title: 'Sample Title',
        },
      }
      const field = 'title'
      const sourceValue = Highlight(hitWithoutHighlight, field)
      expect(sourceValue).toEqual('Sample Title')
    })

    it('returns source value if highlight value is an empty array', () => {
      const hitWithEmptyHighlight: Hit = {
        _id: '',
        _index: '',
        _source: {
          title: 'Sample Title',
        },
        highlight: {
          title: [],
        },
      }
      const field = 'title'
      const sourceValue = Highlight(hitWithEmptyHighlight, field)
      expect(sourceValue).toEqual('Sample Title')
    })

    it('returns array highlights value if has more than one fragments', () => {
      const hitWithEmptyHighlight: Hit = {
        _id: '',
        _index: '',
        _source: {
          title: 'Sample Title',
        },
        highlight: {
          title: ['<em>Sample</em> Title', '<em>Sample</em> Title 2'],
        },
      }
      const field = 'title'
      const sourceValue = Highlight(hitWithEmptyHighlight, field)
      expect(sourceValue).toEqual(
        '<em>Sample</em> Title...<em>Sample</em> Title 2'
      )
    })
  })
})
