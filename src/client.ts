import { API, IAPI } from './api'
import { QueryBuilder } from './query_builder'

export class Client {
  private readonly apiClient: IAPI

  constructor(
    private readonly applicationName: string,
    private readonly endpoint: string,
    private readonly apiKey: string,
    public baseParams: Record<string, any>
  ) {
    this.apiClient = new API(
      apiKey,
      endpoint,
      `/_application/${applicationName}/_search`
    )
  }

  initQuery() {
    return new QueryBuilder(this.apiClient, this.baseParams)
  }
}
