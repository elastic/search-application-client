import { Client } from '../client'

describe('Client', () => {
  test('should create api client without header', () => {
    const client = new Client('', '', '', {})

    expect(client['apiClient']['headers']).toEqual({})
  })

  test('should create api client with proper header', () => {
    const client = new Client(
      'testApplication',
      'https://localhost:3000',
      '123-123',
      {},
      { 'x-api-key': 'test' }
    )

    expect(client['apiClient']['headers']).toEqual({
      'x-api-key': 'test',
    })
  })
})
