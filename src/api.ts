import { Cache } from './cache'

const cache = new Cache()

export class API {
  constructor(
    private readonly apiKey: string,
    private readonly endpoint: string,
    private readonly path: string
  ) {}

  static request(
    method: 'POST' | 'GET',
    url: string,
    apiKey: string,
    body?: Record<string, any>
  ) {
    const cachedQueryResult = cache.getByRequestParams(method, url, body)
    if (cachedQueryResult) {
      return Promise.resolve(cachedQueryResult)
    }

    return fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Apikey ${apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json()
        }
      })
      .then((result) => {
        const error = result?.error?.caused_by?.reason || result?.error?.reason

        if (error) {
          throw new Error(error)
        }

        cache.setByRequestParams(method, url, body, result)

        return result
      })
      .catch((error) => {
        console.error(error)
      })
  }

  post(body) {
    return API.request(
      'POST',
      `${this.endpoint}${this.path}`,
      this.apiKey,
      body
    )
  }
}
