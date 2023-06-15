import ora from 'ora'
import inquirer from 'inquirer'
import chalk from 'chalk'
import fetch from 'cross-fetch'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const dictionary = require('./request_schema.json')

const AUTH_METHOD = {
  APIKey: 'API Key',
  Cred: 'credentials',
}

const data = {
  template: {
    script: {
      lang: 'mustache',
      source: `
        {
          "query": {
            "bool": {
              "must": [
              {{#query}}
              {
                "query_string": {
                  "query": "{{query}}"
                }
              }
              {{/query}}
            ],
            "filter": {{#toJson}}_es_filters{{/toJson}}
            }
          },
          "aggs": {{#toJson}}_es_aggs{{/toJson}},
          "from": {{from}},
          "size": {{size}},
          "sort": {{#toJson}}_es_sort_fields{{/toJson}}
        }`,
      params: {
        query: '',
        _es_filters: [],
        _es_aggs: {},
        _es_sort_fields: {},
        from: 0,
        size: 10,
      },
    },
    dictionary,
  },
}

inquirer
  .prompt([
    {
      type: 'input',
      name: 'endpoint',
      message: `Enter ${chalk.bgGrey('endpoint')} for elasticsearch`,
      filter(input) {
        return new Promise((resolve, reject) => {
          if (!input) {
            reject('Endpoint is required')
          } else {
            resolve(input)
          }
        })
      },
    },
    {
      type: 'input',
      name: 'applicationName',
      message: `Enter your ${chalk.bgGrey('search application name')}`,
      filter(input) {
        return new Promise((resolve, reject) => {
          if (!input) {
            reject('Application name is required')
          } else {
            resolve(input)
          }
        })
      },
    },
    {
      type: 'input',
      name: 'indexName',
      message: `Enter ${chalk.bgGrey('index')} for your search application`,
      filter(input) {
        return new Promise((resolve, reject) => {
          if (!input) {
            reject('Index is required')
          } else {
            resolve(input)
          }
        })
      },
    },
    {
      type: 'list',
      name: 'loginType',
      message: 'Select authorization type?',
      choices: [
        { name: 'API key', value: AUTH_METHOD.APIKey },
        { name: 'User:Password', value: AUTH_METHOD.Cred },
      ],
    },
    {
      type: 'input',
      name: 'apiKey',
      message: `Enter ${chalk.bgGrey('apiKey')} with proper permissions`,
      filter(input) {
        return new Promise((resolve, reject) => {
          if (!input) {
            reject('API key is required')
          } else {
            resolve(input)
          }
        })
      },
      when(answers) {
        return answers.loginType === AUTH_METHOD.APIKey
      },
    },
    {
      type: 'input',
      name: 'user',
      message: `Enter ${chalk.bgGrey('username')} for authorization`,
      filter(input) {
        return new Promise((resolve, reject) => {
          if (!input) {
            reject('Username is required')
          } else {
            resolve(input)
          }
        })
      },
      when(answers) {
        return answers.loginType === AUTH_METHOD.Cred
      },
    },
    {
      type: 'password',
      name: 'password',
      message: `Enter ${chalk.bgGrey('password')} for authorization`,
      filter(input) {
        return new Promise((resolve, reject) => {
          if (!input) {
            reject('Password is required')
          } else {
            resolve(input)
          }
        })
      },
      when(answers) {
        return answers.loginType === AUTH_METHOD.Cred
      },
    },
  ])
  .then(({ endpoint, applicationName, apiKey, user, password, indexName }) => {
    const url = `${endpoint}/_application/search_application/${applicationName}`
    const token = Buffer.from(`${user}:${password}`).toString('base64')
    const authorization = apiKey ? `Apikey ${apiKey}` : `Basic ${token}`
    const body = { ...data, indices: [indexName] }

    const spinner = ora('Updating template').start()
    fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then(async (response) => {
        if (!response.ok) {
          const err = await response.json()
          console.error(err)
          throw new Error(err?.error?.reason)
        }
      })
      .then(() => {
        spinner.succeed(chalk.green('Template updated'))
      })
      .catch((error) => {
        if (error.message) console.error('\n' + chalk.red(error.message))
        spinner.fail('Error during template update')
      })
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      console.error(error)
    }
  })
