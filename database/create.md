# Creating Records

Database is a crucial part of any application.
You may want to store user data, application data, or any other data that is important to your application.

Skapi provides a powerful database that combines the best characteristics of NoSQL and SQL.
Skapi database does not require any pre configuration or schema design and is ready to use out of the box.
At Skapi, we call each data in the database a "record".

## Creating a Record

### [`postRecord(data, config):Promise<RecordData>`](/api-reference/database/README.md#postrecord)

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
    <input type="text" name="myData"/>
    <input type="submit" value="Submit" />
</form>
```

```js [JS]
// Data to be saved in key:value pairs
let data = {
    myData: "Hello World"
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