import { Options } from './api'
import { Client } from './client'
import { QueryBuilder } from './query_builder'

const throwParamRequiredError = (param: string) => {
  throw new Error(`${param} is required`)
}

/**
 * @function SearchApplicationClient
 * @param {string} applicationName
 * @param {string} endpoint
 * @param {string} apiKey
 * @param {Object} params
 * @param {Object} apiOptions
 * @returns {function(): QueryBuilder}
 */
export default function SearchApplicationClient(
  applicationName: string,
  endpoint: string,
  apiKey: string,
  params?: Record<string, any>,
  apiOptions?: Options
): () => QueryBuilder {
  if (!applicationName) throwParamRequiredError('applicationName')
  if (!endpoint) throwParamRequiredError('endpoint')
  if (!apiKey) throwParamRequiredError('apiKey')

  const client = new Client({
    applicationName,
    endpoint,
    apiKey,
    baseParams: params,
    apiOptions,
  })

  return () => client.initQuery()
}

export * from './utils'
