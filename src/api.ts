import { Query } from './templates/v1'

export class API {
    constructor(private readonly apiKey: string, private readonly endpoint) {}

    request(method: 'POST' | 'GET', url: string, body: Query) {
        return fetch(`${this.endpoint}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Apikey ${this.apiKey}`,
            },
            body: JSON.stringify(body),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json()
                }
            })
            .then((body) => {
                const error =
                    body?.error?.caused_by?.reason || body?.error?.reason

                if (error) {
                    throw new Error(error)
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }

    post(url: string, body: Query): Promise<any> {
        return this.request('POST', url, body)
    }

    get(url: string, body: Query) {
        return this.request('GET', url, body)
    }
}
