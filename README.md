# Search Application Client

The Search Application Client is a JavaScript library that provides functionality for interacting with a search application in Elasticsearch.

## Quick Access
Here are some quick links to the important sections:

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Advanced Usage](#advanced-usage)
- [Examples](#examples)

## <a id="installation">Installation</a>

To install the Search Application Client, you can use npm or yarn.

### Using npm:

```bash
npm install search-application-client
```

### Using yarn:
```bash
yarn add search-application-client
```

### In Browser via CDN
```html
<script src="https://cdn.jsdelivr.net/npm/@elastic/search-application-client@latest"></script>
```

## <a id="usage">Usage</a>
### Importing the Client
You can import the Search Application Client in your JavaScript or TypeScript file using the following import statement:

```javascript
import SearchApplicationClient from 'search-application-client';
```

### Creating an Instance of Client
To use the Search Application Client, create an instance by calling the function returned by the imported module:
```javascript
const client = SearchApplicationClient(applicationName, endpoint, apiKey, params);
```
- applicationName: The name of the search application.
- endpoint: The URL of the search application's endpoint.
- apiKey: The API key for accessing the search application.
- params: Additional parameters to be passed to the client.

### Using the Client
The Search Application Client provides a QueryBuilder class that allows you to build complex search queries:
```javascript
const results = await client()
  .query('John')
  .setPage(1)
  .search()
```
The search method returns a Promise that resolves with the search results.

#### Use facets
To use facets filtering, specify facets in the client initialization:
```javascript
const client = SearchApplicationClient('*search-application-name*', '*elasticsearch-endpoint*', '*apiKey*', {
  facets: {
    category: { type: 'terms', field: 'category.keyword', size: 10 },
    price: { type: 'stats', field: 'price', size: 10, disjunctive: true },
  },
});

const results = await client()
  .addFacetFilter('category', 'electronics')
  .addFacetFilter('price', { from: 100, to: 1000 })
  .addFacetFilter('author', 'orwell') // ❌ Throw an error, because the facet is not specified during initialization
  .setSort({'price': 'desc'})
  .search()
```

#### Use sorting
To use sorting, specify the field name and the sort order or pass _score to sort by relevance:
```javascript
const results = await client()
  .setSort([{'publish_date': 'desc'}, "_score"])
  .search()
```

#### Use pagination
To use pagination, set the page number and the page size:
```javascript
const results = await client()
  .setPage(2) // For the second page
  .setPageSize(15)
  .search()
```
By default, page size is 10

Or pass from and size to use from/size pagination:
```javascript
const results = await client()
  .setPageSize(20)
  .setFrom(20 * 2) // For the third page
  .search()
```

## <a id="api-reference">API Reference</a>
### ```SearchApplicationClient()```
Function to initialize searchApplicationClient and returns function to create an instance of the QueryBuilder.

- ```applicationName (string)```: The name of the search application.
- ```endpoint (string)```: The URL of the search application's endpoint.
- ```apiKey (string)```: The API key for accessing the search application.
- ```params (Params)```: Additional parameters to be passed to the client.

Returns: function that returns new QueryBuilder instance.

### ```QueryBuilder```
This class provides methods for building search queries.


- ```query(query: string): QueryBuilder```
Sets the search query. Returns: QueryBuilder instance.

- ```addFacetFilter(field: string, value: FilterFieldValue): QueryBuilder```
Adds a facet filter to narrow down the search results. Returns: QueryBuilder instance.

  - ```field (string)```: The field name of the facet filter.
  - ```value (string | string[] | number | number[])```: The value or range of values for the facet filter.

- ```setSort(sort: SortFields): QueryBuilder```
Sets the sorting criteria for the search results. Returns: QueryBuilder instance.

  - ```sort (Record<string, 'desc' | 'asc'> | '_score')[])```: The sorting criteria for the search results.

- ```search(): Promise<ResponseParams>```
Sends the search request to the search application. Use generic types for specify ```hits._source``` type.
Returns: A promise that resolves to the search results.
  - hits: An array of search hits.
  - facets: An array of facet results.
  - aggregations: An object containing aggregation results.
  - total: The total number of search results.
  - took: The time taken for the search request.

Please refer to the code and type definitions for more details on the available methods and their parameters.

## <a id="advanced-usage">Advanced Usage</a>
### Using dictionary for template
To use template with typechecking you can update your template with prebuilded json schema by running command:

```bash
yarn update::template
```
Once you have updated the template it will use the schema for typechecking of params for each request.

## <a id="examples">Examples</a>

You can find usage examples in the [examples/sandbox](./examples/sandbox/README.md) directory of this repository. These examples demonstrate how to use the search-application-client library.

