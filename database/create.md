# Creating a Record

:::warning
User must be logged in to call this method
:::

Users can create [`postRecord()`](/api-reference/database/README.md#postrecord) method to create a new record or update existing records in the database.

It takes two arguments:

- `data`: The data to be saved in key-value pairs. It can be an object literal, `null`, `undefined` or a form `SubmitEvent`.
- `config` (required): Configuration for the record to be uploaded. This is where you specify the table name, access group, index values, etc.

:::code-group

```html [Form]
<form onsubmit="skapi.postRecord(event, { table: 'my_collection'}).then(record => console.log(record))">
    <input name="something" placeholder="Say something"/>
    <input type="submit" value="Submit" />
</form>
```

```js [JS]
// Data to be saved in key:value pairs
let data = {
    something: "Hello World"
}

// Configuration for the record to be uploaded
let config = {
    table: 'my_collection'
}

skapi.postRecord(data, config).then(record=>{
    console.log(record);
    /*
    Returns:
    {
        data: { something: "Hello World" },
        table: { name: 'my_collection', access_group: 'public' },
        ...
    }
    */
});
```
:::

This example demonstrates using the [`postRecord()`](/api-reference/database/README.md#postrecord) method to create a record in the database.
When the request is successful, the [RecordData](/api-reference/data-types/README.md#recorddata) is returned.

In this example, the first argument takes the actual data to be uploaded to the database.
The data is a Javascript object that has string value in the key 'something'.
And in the second argument we have set table name to be `my_collection`.

Table name is a required field in the configuration object and the table name should not contain any special characters.

For more detailed information on all the parameters and options available with the [`postRecord()`](/api-reference/database/README.md#postrecord) method, 
please refer to the API Reference below:

### [`postRecord(data, config):Promise<RecordData>`](/api-reference/database/README.md#postrecord)

:::tip Note
Skapi database does not require you to pre-setup your database schema.

If the specified table does not exist, it will be automatically created when you create the record.
Conversely, if a table has no records, it will be automatically deleted.
:::