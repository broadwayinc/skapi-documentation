# Create / Fetch Records

Database is a crucial part of any application.
You may want to store user data, application data, or any other data that is important to your application.

Skapi provides a powerful database that combines the best characteristics of NoSQL and SQL.
Skapi database does not require any pre configuration or schema design and is ready to use out of the box.
We call each data in the database a "record".

In this guide, we will cover the basics of creating and fetching the records to the database.

## Creating a Record

### [`postRecord(data, config):Promise<RecordData>`](/api-reference/database/README.md#postrecord)

:::warning
User must be logged in to call this method
:::

Users can create [`postRecord()`](/api-reference/database/README.md#postrecord) method to create a new record or update existing records in the database.

It takes two arguments:

- `data`: The data to be saved in key-value pairs. It can be an object literal, `null`, `undefined` or a form `SubmitEvent`.
- `config` (required): Configuration for the record to be uploaded.

:::code-group

```html [Form]
<form onsubmit="skapi.postRecord(event, { table: 'my_collection'}).then(record => console.log(record))">
    <input type="text" name="myData"/>
    <input type="submit" value="Submit" />
</form>
```

```js [JS]
let data = { // Data to be saved in key:value pairs
    myData: "Hello World"
}

let config = {
    table: 'my_collection'
}

skapi.postRecord(data, config).then(record=>{
    console.log(record);
    /*
    Returns:
    {
        data: { myData: "Hello World" },
        table: { name: 'myTable', access_group: 0 },
        ...
    }
    */
});
```
:::

This example demonstrates using the [`postRecord()`](/api-reference/database/README.md#postrecord) method to create a record in the database.
When the request is successful, the [RecordData](/api-reference/data-types/README.md#recorddata) is returned.

In this example, the first argument takes the actual data to be uploaded to the database.
The data is a Javascript object that has 'myData' keyname inside.
And in the second argument we have set table name to be `my_collection`.

:::tip Note
Skapi database does not require you to pre-setup your database schema.

If the specified table does not exist, it will be automatically created when you create the record.
Conversely, if a table has no records, it will be automatically deleted.
:::


## Fetching Records

### [`getRecords(query, fetchOptions?): Promise<DatabaseResponse<RecordData>>`](/api-reference/database/README.md#getrecords)

The [`getRecords()`](/api-reference/database/README.md#getrecords) method allows you to fetch records from the database. It retrieves records based on the specified query parameters and returns a promise that resolves to the response containing the [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse) object.

It takes two arguments:
- `query`: Specifies the query parameters for fetching records.
- `fetchOptions`: (optional)
    Specifies additional configuration options for fetching database records
    For more information, see [Database Fetch Options](/database/create-fetch.md#database-fetch-options)

### Fetching Records from a Table

```js
let query = {
    table: 'my_collection'
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

The example above retrieve records from a table named 'my_collection'.
The `table` parameter in the `query` argument sets the table name you want to fetch records from.
The retrieved records are accessed through the `response.list` property.

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
    table: 'my_collection'
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

You can however, Initialize your fetch and refetch from start by toggling `fetchOptions.fetchMore` back to `false`.
:::

:::tip
You can fetch all the data at once by recursively calling the method until the `endOfList` value is `true`.
However for efficiency, avoid trying to fetch all the data at once. Fetch only data the user needs and paginate when necessary.
:::