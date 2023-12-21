import { Cache } from './cache'
import { RequestParams, ResponseParams } from './types'
import { ErrorResponseBase } from '@elastic/elasticsearch/lib/api/types'

interface NetworkError extends Error {
  isNetworkError: boolean
}
interface FetchError extends Error {
  isFetchError: boolean
  data: ErrorResponseBase
}

export interface Options {
  cacheExpiration?: number
  disableCache?: boolean
  headers?: HeadersInit
}

const cache = new Cache()

export class API {
  constructor(
    private readonly apiKey: string,
    private readonly endpoint: string,
    private readonly path: string,
    private readonly options: Options = {
      disableCache: false,
      headers: {},
    }
  ) {}

  private request<R extends ResponseParams = ResponseParams>(
    method: 'POST' | 'GET',
    url: string,
    body?: { params: RequestParams }
  ): Promise<R> {
    const cachedQueryResult =
      !this.options.disableCache &&
      cache.getByRequestParams(method, url, {
        ...body,
        apiKey: this.apiKey,
        endpoint: this.endpoint,
      })
    if (cachedQueryResult) {
      return Promise.resolve(cachedQueryResult)
    }

    return fetch(url, {
      method,
      headers: {
        ...this.options.headers,
        'Content-Type': 'application/json',
        Authorization: `Apikey ${this.apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
      .then(
        (response) => response.json(),
        (err) => {
          err.isNetworkError = true

          throw err
        }
      )
      .then((result) => {
        if (result.error) {
          const errorMessage =
            (result as ErrorResponseBase)?.error?.reason ||
            (result as ErrorResponseBase)?.error?.caused_by?.reason
          const fetchError = new Error(errorMessage) as FetchError
          fetchError.isFetchError = true
          fetchError.data = result

          throw fetchError
        }

        if (!this.options.disableCache) {
          cache.setByRequestParams(
            method,
            url,
            body,
            result,
            this.options.cacheExpiration
          )
        }

        return result
      })
      .catch(this.handleError)
  }

  async post<R extends ResponseParams = ResponseParams>(body: {
    params: RequestParams
  }) {
    return await this.request<R>('POST', `${this.endpoint}${this.path}`, body)
  }

  private handleError(error: Error): void {
    if ((error as NetworkError).isNetworkError) {
      error.name = '[Network Error]'
    } else if (
      (error as FetchError).isFetchError &&
      (error as FetchError).data.status === 500 &&
      ((error as FetchError).data.error?.caused_by?.type.includes(
        'format_exception'
      ) ||
        (error as FetchError).data.error.type === 'json_parse_exception')
    ) {
      error.name = '[Parameter or type is invalid]'
    } else if (
      (error as FetchError).isFetchError &&
      (error as FetchError).data.status === 401
    ) {
      error.name = '[Authorization Error]'
    } else if (
      (error as FetchError).isFetchError &&
      (error as FetchError).data.status === 404
    ) {
      error.name = '[Not Found Error]'
      error.message = `${(error as FetchError).data.error.type}: ${
        error.message
      }`
    }

    console.error(error)
  }
}
