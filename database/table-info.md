# Table Information

:::warning
User must be logged in to call this method
:::

Skapi keeps track of all the tables in your database.
You can fetch a list of table names and number of records in each tables and total database size consumed in the table using the [`getTables()`](/api-reference/database/README.md#gettables) method.

You can fetch a list of table using the `getTables()` method.

```js
skapi.getTables().then(response=>{
    console.log(response); // List of all tables in the database
})
```

### Querying tables

You can query table names that meets the `condition`.

```js
skapi.getTables({
    table: 'C',
    condition: '>'
}).then(response => {
    console.log(response); // Table names starting from 'C'
})
```

In this example, the condition property is set to `>`, and `table` is set to `C`.
This query will return the table names that come after table 'C' in lexographic order, such as 'Cc', 'D', 'E', 'F', 'G'... and so on.

To fetch the table names that starts with 'C', you can set the condition to `>=` instead.

For more detailed information on all the parameters and options available with the [`getTables()`](/api-reference/database/README.md#gettables) method, 
please refer to the API Reference below:

### [`getTables(query, fetchOptions?): Promise<DatabaseResponse<Table>>`](/api-reference/database/README.md#gettables)
