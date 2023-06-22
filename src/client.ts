import { API } from './api'
import { QueryBuilder } from './query_builder'

export class Client {
  private readonly apiClient: API

  constructor(
    applicationName: string,
    endpoint: string,
    apiKey: string,
    public baseParams: Record<string, any>,
    requestHeaders?: Record<string, string>
  ) {
    this.apiClient = new API(
      apiKey,
      endpoint,
      `/_application/search_application/${applicationName}/_search`,
      requestHeaders
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
