import { API } from '../api'
import { RequestParams } from '../types'

describe('API', () => {
  const apiKey = 'YOUR_API_KEY'
  const endpoint = 'https://example.com'
  const path = '/api'
  const headers = { 'X-Header': 'value' }

  let api: API

  beforeEach(() => {
    api = new API(apiKey, endpoint, path, { headers, cache: false })
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
      const body = { params: 'value' as RequestParams }

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

    it('should make a GET request and return caching data', async () => {
      api = new API(apiKey, endpoint, path, { headers })

      const mockResponse = { data: 'Response data' }
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      })

      const method = 'GET'
      const url = `${endpoint}${path}`

      let result = await api['request'](method, url)

      expect(result).toEqual(mockResponse)

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ data: '' }),
      })

      result = await api['request'](method, url)

      expect(result).toEqual(mockResponse)
    })

    it('should make a GET request and return non-caching data when data is expired', async () => {
      Date.now = jest.fn().mockReturnValue(0)
      api = new API(apiKey, endpoint, path, { headers, cacheExpiration: 1 })

      const mockResponse = { data: 'Response data' }
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      })

      const method = 'GET'
      const url = `${endpoint}${path}`

      let result = await api['request'](method, url)

      expect(result).toEqual(mockResponse)

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ data: '' }),
      })
      Date.now = jest.fn().mockReturnValue(5)

      result = await api['request'](method, url)

      expect(result).toEqual({ data: '' })
    })

    it('should log and catch any errors during the request', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockReturnValue()
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValueOnce(new Error('Network error')),
      })

      const method = 'GET'
      const url = `${endpoint}${path}`
      try {
        await expect(api['request'](method, url)).resolves.toEqual(undefined)
      } catch (error) {
        expect(global.fetch).toHaveBeenCalled()
        expect(consoleErrorSpy).toHaveBeenCalled()
        expect(error.message).toMatch('[Error: Network error]')
      }
    })
  })

  describe('error', () => {
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

      try {
        await expect(api['request'](method, url)).resolves.toBeUndefined()
      } catch (error) {
        expect(global.fetch).toHaveBeenCalled()
        expect(consoleErrorSpy).toHaveBeenCalledWith(new Error(errorMessage))
        expect(error.message).toMatch('[Error: Request error]')
      }
    })

    it('should throw an network error when fetch request was rejected', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockReturnValue()
      const errorMessage = 'Request error'
      global.fetch = jest.fn().mockRejectedValueOnce(new Error(errorMessage))

      const method = 'GET'
      const url = `${endpoint}${path}`

      try {
        await expect(api['request'](method, url)).resolves.toBeUndefined()
      } catch (error) {
        expect(global.fetch).toHaveBeenCalled()
        expect(consoleErrorSpy).toHaveBeenCalledWith(new Error(errorMessage))
        expect(error.message).toMatch('[Network Error]')
      }
    })

    it('should throw a not found error when status 404', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockReturnValue()
      const errorMessage = 'Request error'
      global.fetch = global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          error: { reason: errorMessage, type: 'Not_found' },
          status: 404,
        }),
      })

      const method = 'GET'
      const url = `${endpoint}${path}`

      try {
        await expect(api['request'](method, url)).resolves.toBeUndefined()
      } catch (error) {
        expect(global.fetch).toHaveBeenCalled()
        expect(consoleErrorSpy).toHaveBeenCalled()
        expect(error.message).toMatch('[Not Found Error]')
      }
    })

    it('should throw not valid type error when status is 500 and has specific type', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockReturnValue()
      const errorMessage = 'Request error'
      global.fetch = global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          error: { reason: errorMessage, type: 'json_parse_exception' },
          status: 500,
        }),
      })

      const method = 'GET'
      const url = `${endpoint}${path}`

      try {
        await expect(api['request'](method, url)).resolves.toBeUndefined()
      } catch (error) {
        expect(global.fetch).toHaveBeenCalled()
        expect(consoleErrorSpy).toHaveBeenCalledWith(new Error(errorMessage))
        expect(error.message).toMatch('[Parameter or type is invalid]')
      }
    })

    it('should throw authorization error when status is 401', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockReturnValue()
      const errorMessage = 'Request error'
      global.fetch = global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          error: { reason: errorMessage },
          status: 401,
        }),
      })

      const method = 'GET'
      const url = `${endpoint}${path}`

      try {
        await expect(api['request'](method, url)).resolves.toBeUndefined()
      } catch (error) {
        expect(global.fetch).toHaveBeenCalled()
        expect(consoleErrorSpy).toHaveBeenCalledWith(new Error(errorMessage))
        expect(error.message).toMatch('[Authorization Error]')
      }
    })
  })

  describe('post', () => {
    it('should make a POST request and return response data', async () => {
      const mockResponse = { data: 'Response data' }
      const requestSpy = jest
        .spyOn(api as any, 'request')
        .mockResolvedValueOnce(mockResponse)

      const body = { params: 'value' as RequestParams }

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
