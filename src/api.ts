import { Cache } from './cache'

const cache = new Cache()

export class API {
  constructor(
    private readonly apiKey: string,
    private readonly endpoint: string,
    private readonly path: string,
    private readonly headers: HeadersInit = {},
    private readonly disableCaching: boolean = false
  ) {}

  private request(
    method: 'POST' | 'GET',
    url: string,
    body?: Record<string, any>
  ) {
    const cachedQueryResult =
      !this.disableCaching && cache.getByRequestParams(method, url, body)
    if (cachedQueryResult) {
      return Promise.resolve(cachedQueryResult)
    }

    return fetch(url, {
      method,
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
        Authorization: `Apikey ${this.apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
      })
      .then((result) => {
        const error = result?.error?.caused_by?.reason || result?.error?.reason

        if (error) {
          throw new Error(error)
        }

        if (!this.disableCaching) {
          cache.setByRequestParams(method, url, body, result)
        }

        return result
      })
      .catch((error) => {
        console.error(error)
      })
  }

  post(body) {
    return this.request('POST', `${this.endpoint}${this.path}`, body)
  }
}
