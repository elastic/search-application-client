import { Client } from './client'
import { IQueryBuilder } from './query_builder'

const throwParamRequiredError = (param: string) => {
  throw new Error(`${param} is required`)
}

export default function SearchApplicationClient(
  applicationName: string,
  endpoint: string,
  apiKey: string,
  params: Record<string, any>
): () => IQueryBuilder {
  if (!applicationName) throwParamRequiredError('applicationName')
  if (!endpoint) throwParamRequiredError('endpoint')
  if (!apiKey) throwParamRequiredError('apiKey')
  if (!params) throwParamRequiredError('params')

  const client = new Client(applicationName, endpoint, apiKey, params)

  return () => client.initQuery()
}
