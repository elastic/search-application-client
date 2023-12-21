import { API, Options } from './api'
import { QueryBuilder } from './query_builder'

export class Client {
  private readonly apiClient: API
  private readonly baseParams: Record<string, any>

  constructor({
    applicationName,
    endpoint,
    apiKey,
    baseParams,
    apiOptions,
  }: {
    applicationName: string
    endpoint: string
    apiKey: string
    baseParams?: Record<string, any>
    apiOptions?: Options
  }) {
    this.baseParams = baseParams || {}
    this.apiClient = new API(
      apiKey,
      endpoint,
      `/_application/search_application/${applicationName}/_search`,
      apiOptions
    )
  }

  /**
   * @public
   * @returns {QueryBuilder} - returns QueryBuilder instance
   */
  initQuery() {
    return new QueryBuilder(this.apiClient, this.baseParams)
  }
}
