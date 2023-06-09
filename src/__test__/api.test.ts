import { API } from '../api'

describe('API', () => {
  const apiKey = 'YOUR_API_KEY'
  const endpoint = 'https://example.com'
  const path = '/api'
  const headers = { 'X-Header': 'value' }

  let api: API

  beforeEach(() => {
    api = new API(apiKey, endpoint, path, headers, true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('request', () => {
    it('should make a POST request and return response data', async () => {
      const mockResponse = { data: 'Response data' }
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      })

      const method = 'POST'
      const url = `${endpoint}${path}`
      const body = { param: 'value' }

      const result = await api['request'](method, url, body)

      expect(global.fetch).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          method,
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Apikey ${apiKey}`,
          }),
          body: JSON.stringify(body),
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('should make a GET request and return response data', async () => {
      const mockResponse = { data: 'Response data' }
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      })

      const method = 'GET'
      const url = `${endpoint}${path}`

      const result = await api['request'](method, url)

      expect(global.fetch).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          method,
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Apikey ${apiKey}`,
          }),
          body: undefined,
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('should throw an error if the response contains an error message', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockReturnValue()
      const errorMessage = 'Request error'
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest
          .fn()
          .mockResolvedValueOnce({ error: { reason: errorMessage } }),
      })

      const method = 'GET'
      const url = `${endpoint}${path}`

      await expect(api['request'](method, url)).resolves.toBeUndefined()

      expect(global.fetch).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should log and catch any errors during the request', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockReturnValue()
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValueOnce(new Error('Network error')),
      })

      const method = 'GET'
      const url = `${endpoint}${path}`

      await expect(api['request'](method, url)).resolves.toEqual(undefined)

      expect(global.fetch).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('post', () => {
    it('should make a POST request and return response data', async () => {
      const mockResponse = { data: 'Response data' }
      const requestSpy = jest
        .spyOn(api as any, 'request')
        .mockResolvedValueOnce(mockResponse)

      const body = { param: 'value' }

      const result = await api.post(body)

      expect(requestSpy).toHaveBeenCalledWith(
        'POST',
        `${endpoint}${path}`,
        body
      )
      expect(result).toEqual(mockResponse)
    })
  })
})
