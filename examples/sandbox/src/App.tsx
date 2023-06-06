import React, { useState } from 'react'
import SearchAppClient from '@elastic/search-app-client'
import './App.css'
import { IQueryBuilder } from '@elastic/search-app-client/lib/query_builder'

// SearchAppClient.init({
//     apiKey: 'amNxUWZJZ0J3S3pRbkpkdVdHSFQ6S0txSWVHMzVRWkdCemlMaTVmdDd4UQ==',
//     endpoint:
//         'https://search-ui-testing.es.us-west2.gcp.elastic-cloud.com' ||
//         'http://localhost:9200',
// })

let request: () => IQueryBuilder

function App() {
  const [target, setTarget] = useState<string>('')
  const [apiKey, setApiKey] = useState<string>(
    'b0s2NGk0Z0ItS3hPNEcyQ041cDM6Vmd1UC1Jem9UV0NoMk1ldkhmeXNkQQ=='
  )
  const [applicationName, setApplicationName] = useState<string>(
    'search_application/movies'
  )
  const [endpoint, setEndpoint] = useState<string>(
    'https://fce4152b85df49e0a522c132ad0c2911.us-central1.gcp.cloud.es.io'
  )
  const handleInit = () => {
    request = SearchAppClient(applicationName, endpoint, apiKey, {})
    console.log('client init')
    // @ts-ignore
    window.client = request
  }
  const handleSearch = async () => {
    let query = request()

    if (target) {
      query.query(target)
    }
    const results = await query.search()

    console.log('results', results)
  }

  return (
    <div className="App">
      <header className="App-header">
        <h3>1. Initialize the client with your credentials and endpoint</h3>
        <p>
          const request = SearchAppClient(
          <input
            name="applicationName"
            placeholder="Application Name"
            value={applicationName}
            onChange={(e) => setApplicationName(e.target.value)}
          />
          <input
            name="endpoint"
            placeholder="Endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          />
          <input
            name="apiKey"
            placeholder="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          )
        </p>
        <button onClick={handleInit}>Init client</button>

        <h3>2. Make request</h3>
        <p>
          request().query("
          <input
            placeholder="Target Path"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          ").
          <button name="search" onClick={handleSearch}>
            search()
          </button>
        </p>
      </header>
    </div>
  )
}

export default App
