# Creating a Record

Users can use the [`postRecord()`](/api-reference/database/README.md#postrecord) method to create a new record or update existing records in the database.

It takes two arguments:

- `data` The data to be saved in key-value pairs. It can be an object literal, `null`, `undefined`, or a form `SubmitEvent`. Once the record is uploaded, the given data will be stored as a value under the key name `data` in the returned [RecordData](/api-reference/data-types/README.md#recorddata).

- `config` (required): Configuration for the record to be uploaded. This is where you specify the table name, access group, index values, etc.

Refer to the example below:

:::code-group

```html [Form]
<form onsubmit="skapi.postRecord(event, { table: { name: 'my_collection', access_group: 'public' } }).then(rec => {
    console.log(rec);
    /*
    Returns:
    {
        data: { something: 'Hello World' },
        table: { name: 'my_collection', access_group: 'public' },
        ...
    }
    */
})">
    <input name="something" placeholder="Say something" value="Hello World"/>
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
    table: { name: 'my_collection', access_group: 'public' }
}

skapi.postRecord(data, config).then(rec=>{
    console.log(rec);
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
The given data will be stord under the key name `data` of the returned [RecordData](/api-reference/data-types/README.md#recorddata).

And in the second argument we have set table name to be `my_collection` and access group to be `public`.
`config.table` is a required parameter in the configuration object and the `config.table.name` should not contain any special characters.

::: tip
If `config.table` is given as a **string**, the given value will be set as `config.table.name` and the record will be uploaded with `config.table.access_group` set to `"public"`.
:::

::: warning
Both authenticated and anonymous users can upload data to your service using the [`postRecord()`](/api-reference/database/README.md#postrecord) method.

Limitations for anonymous (unsigned) users:
1. They can only create records in the `public` access group (see [`Access Restrictions`](/database/access-restrictions.md)).
2. They cannot edit or delete any records they create.
3. They cannot create records that use [`Subscription`](/database/subscription.md) features.
4. They cannot create records with[`Unique ID`](/database/unique-id.md)
:::

When uploading the record with access restrictions, see [`Access Restrictions`](/database/access-restrictions.md).

For more detailed information on all the parameters and options available with the [`postRecord()`](/api-reference/database/README.md#postrecord) method, 
please refer to the API Reference below:

### [`postRecord(data, config):Promise<RecordData>`](/api-reference/database/README.md#postrecord)

:::tip Note
Skapi database does not require you to pre-setup your database schema.

If the specified table does not exist, it will be automatically created when you create the record.
Conversely, if a table has no records, it will be automatically deleted.
:::