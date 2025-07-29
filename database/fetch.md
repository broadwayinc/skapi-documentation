# Fetching Records

The [`getRecords()`](/api-reference/database/README.md#getrecords) method allows you to fetch records from the database. It retrieves records based on the specified query parameters and returns a promise that resolves to the [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse) containing the [RecordData](/api-reference/data-types/README.md#recorddata) object.

It takes two arguments:
- `query`: Specifies the query parameters for fetching records.
- `fetchOptions`: (optional)
    Specifies additional configuration options for fetching database records
    For more information, see [Database Fetch Options](/database/fetch.md#database-fetch-options).

### Fetching Records from a Table

```js
let query = {
    table: { name: 'my_collection', access_group: 'public' }
}

skapi.getRecords(query).then(response=>{
    // response
    /**
     * endOfList: true,
     * list: [
     *  ...
     * ],
     * startKey: 'end',
     * ...
     */
});
```

The example above retrieve records from a table named 'my_collection' with `access_group` that are `public`
The `table` parameter in the `query` argument sets the table name you want to fetch records from.
The retrieved records are accessed through the `response.list` property.

When fetching the records with access restrictions, see [`Access Restrictions`](/database/access-restrictions.md).

For more detailed information on all the parameters and options available with the [`getRecords()`](/api-reference/database/README.md#getrecords) method, 
please refer to the API Reference below:

### [`getRecords(query, fetchOptions?): Promise<DatabaseResponse<RecordData>>`](/api-reference/database/README.md#getrecords)

### Fetching Record by ID

You can fetch a record by its unique ID using the [`getRecords()`](/api-reference/database/README.md#getrecords) method. When fetching a record by ID, you don't need to provide any additional configuration parameters.

```js
let query = {
    record_id: 'record_id_to_fetch'
};

skapi.getRecords(query).then(response => {
    // response
    /**
     * endOfList: true,
     * list: [{
     *  ... // only 1 result
     * }],
     * startKey: null // startKey is null as no more records can be retrieved
     */
});
```

In this example, the `query` object includes the `record_id` property set to the ID of the record you want to fetch.
`record_id` is a unique identifier for each record in the database.

The `response.list` will contain the record data if the record exists.


## Database Fetch Options

[FetchOptions](/api-reference/data-types/README.md#fetchoptions) can control the number of the record per fetch, fetching the next batch of records, fetching the records by ascending/descending order... etc.

This is used globally for all database related methods that allows optional [FetchOptions](/api-reference/data-types/README.md#fetchoptions) argument.

See full list of parameters: [FetchOptions](/api-reference/data-types/README.md#fetchoptions)


#### Limit Results with `fetchOptions.limit`

By default, 50 sets of the data will be fetched per call.
You can adjust the limit to your preference, allowing up to **1000 sets of data**, by using the `limit` key.

#### Fetch More Results with `fetchOptions.fetchMore`

To fetch the next batch of results, you can set the `fetchOption.fetchMore` to `true`.
When set to `false`(default), database will always return the first batch of the data.

This allows you to retrieve results in batches until the end of the list is reached.

#### Order results with `fetchOptions.ascending`

By default, the database fetch the data in ascending order.
If set to `false`, list of data can be fetched in descending order

For example, let's say there is millions of record in the database table 'my_collection'.
We can fetch the first 100 data, then paginate to the next 100 data by setting `fetchOptions.fetchMore` to `true`.

``` js
let query = {
    table: { name: 'my_collection', access_group: 'public' }
}

let fetchOptions = {
  limit: 100, // Limit each fetch to 100 data.
  fetchMore: false, // When false, database always gives you the first batch of data.
  ascending: false // Fetch in decending order.
}

skapi.getRecords(query, fetchOptions).then(res=>{
  console.log(res.list); // List of up to 100 data in the database.
  
  if(!res.endOfList) {
    // If there is more data to fetch, and if user chooses to, they can retrieve the next batch of 100.

    fetchOptions.fetchMore = true;
    if(confirm('Fetch more records?')) {
        skapi.getUsers(query, fetchOptions)
            .then(res=>{
                console.log(res.list); // List of the next 100 data from the database.
            }
        );
    }
  }
});
```

In this example, after the first call to the database, we see the `endOfList` value is not `true`.
This means there are more data left to fetch in the database.

To fetch more data in the database, we set `fetchOptions.fetchMore` to `true` and call the method again.
This allows to fetch the next batch of 100 data on each execution until the end of the list is reached.

:::tip
When using the `fetchMore` parameter, you must check if the response's `endOfList` value is `true` before making the next call.
The database will always return an empty list if the `fetchOptions.fetchMore` is set to `true` and it had reached the end of list and.

You can however, initialize your fetch and refetch from start by toggling `fetchOptions.fetchMore` back to `false`.
:::

:::tip
You can fetch all the data at once by recursively calling the method until the `endOfList` value is `true`.
However for efficiency, avoid trying to fetch all the data at once. Fetch only data the user needs and paginate when necessary.
:::