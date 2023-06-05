export interface IAPI {
  post(body: any): Promise<any>
}

export class API implements IAPI {
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
      .then((body) => {
        const error = body?.error?.caused_by?.reason || body?.error?.reason

        if (error) {
          throw new Error(error)
        }

        return body
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
