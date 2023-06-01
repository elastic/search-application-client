import Client from '../index'

const client = Client({
    facets: {
        actors: { size: 5 },
    },
    search_fields: ['dd'],
    result_fields: ['dd'],
})

client.customQuery('http://localhost:9200/_cat/indices').search()

describe('Client', () => {
    test('should be defined', () => {
        expect(Client).toBeDefined()
    })
})

// client.query('shawshank redemption').search()
