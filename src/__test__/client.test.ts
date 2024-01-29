import { Client } from '../client'

describe('Client', () => {
  test('should create api client without header', () => {
    const client = new Client({
      applicationName: '',
      endpoint: '',
      apiKey: '',
      apiOptions: {},
    })

    expect(client['apiClient']['options']).toEqual({ cache: true })
  })

  test('should create api client with proper header', () => {
    const client = new Client({
      applicationName: 'testApplication',
      endpoint: 'https://localhost:3000',
      apiKey: '123-123',
      baseParams: {},
      apiOptions: {
        headers: {
          'x-api-key': 'test',
        },
      },
    })

    expect(client['apiClient']['options']['headers']).toEqual({
      'x-api-key': 'test',
    })
  })
})
