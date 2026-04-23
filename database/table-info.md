# Table Information

Skapi tracks all tables in your database.
Use [`getTables()`](/api-reference/database/README.md#gettables) to retrieve table names, record counts, and table sizes.

You can fetch the full table list like this:

```js
skapi.getTables().then(response => {
    console.log(response); // List of all tables in the database
});
```

### Querying tables

To retrieve information for a specific table, pass an existing table name:

```js
skapi.getTables({
    table: 'my_collection',
}).then(response => {
    console.log(response.list);
    // [{
    //     table: 'my_collection';
    //     number_of_records: string;
    //     size: number;
    //     number_of_records_in_access_group_public?: number;
    //     number_of_records_in_access_group_private?: number;
    //     number_of_records_in_access_group_authorized?: number;
    //     number_of_records_in_access_group_admin?: number;
    //     number_of_records_in_access_group_xx?: number; // for other access groups
    // }]
})
```

You can also query table names using `condition`.

```js
skapi.getTables({
    table: 'C',
    condition: '>'
}).then(response => {
    console.log(response); // Table names starting from 'C'
})
```

In this example, `condition` is set to `>` and `table` is set to `C`.
This returns table names that come after `C` in lexicographic order, such as `Cc`, `D`, `E`, and `F`.

To fetch table names that start with a prefix, set `condition` to `>=`:

```js
skapi.getTables({
    table: 'my_',
    condition: '>='
}).then(response => {
    console.log(response); // Table names starting from 'my_' (for example, 'my_collection')
})
```

Condition-based table search is useful when you need to check whether a table already exists before uploading data.

For more detailed information on all the parameters and options available with the [`getTables()`](/api-reference/database/README.md#gettables) method, 
please refer to the API Reference below:

### [`getTables(query, fetchOptions?): Promise<DatabaseResponse<Table>>`](/api-reference/database/README.md#gettables)
