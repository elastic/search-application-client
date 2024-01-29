const ONE_HOUR = 1000 * 60 * 60
export class Cache {
  private cache: Record<string, any> = {}

  constructor(private readonly ttl: number = ONE_HOUR) {}

  private createKeyByRequestParams(method, url, params: Record<string, any>) {
    return method + url + JSON.stringify(params)
  }

  getByRequestParams(method, url, params: Record<string, any>) {
    const key = this.createKeyByRequestParams(method, url, params)

    return this.get(key)
  }

  get(key: string) {
    const cached = this.cache[key]

    if (!cached) return null

    if (cached.expiration < Date.now()) {
      delete this.cache[key]

      return null
    }

    return cached.value
  }

  set(key: string, value: any) {
    this.cache[key] = {
      value,
      expiration: Date.now() + this.ttl,
    }
  }

  setByRequestParams(
    method: 'POST' | 'GET',
    url: string,
    params: Record<string, any>,
    value: any
  ) {
    const key = this.createKeyByRequestParams(method, url, params)
    this.set(key, value)
  }
}
