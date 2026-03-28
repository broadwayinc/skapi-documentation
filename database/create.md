# Creating a Record

Use [`postRecord()`](/api-reference/database/README.md#postrecord) to create a new record or update an existing record in the database.

This method takes two arguments:

- `data`: The content to save as key-value pairs. This can be an object literal, `null`, `undefined`, or a form `SubmitEvent`. After upload, the value is stored under the `data` key in the returned [RecordData](/api-reference/data-types/README.md#recorddata).

- `config` (required): Upload configuration, including table name, access group, index values, and more.

See the example below:

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
When successful, the method returns [RecordData](/api-reference/data-types/README.md#recorddata).

In this example, the first argument is the data to upload.
The value of `something` is saved as part of the record and appears under the `data` key in the returned [RecordData](/api-reference/data-types/README.md#recorddata).

In the second argument, the table name is set to `my_collection` and the access group is set to `public`.
`config.table` is required.

Every record must include a table name. You can think of the table name as the top-level category for your data. Later, you can fetch records by table.

`config.table.name` validation rules:

- Maximum length: 128 characters
- Must not be empty
- Must not include `/`, `!`, `*`, `#`
- Must not include control characters or sentinel `􏿿`

If the access group is `public`, anyone can access the uploaded data.
To use different access restrictions, see [`Access Restrictions`](/database/access-restrictions.md).

::: danger
Both authenticated and anonymous users can upload data to your service with [`postRecord()`](/api-reference/database/README.md#postrecord).

Limitations for anonymous (unsigned) users:
1. They can only create records in the `public` access group (see [`Access Restrictions`](/database/access-restrictions.md)).
2. They cannot edit or delete any records they create.
3. They cannot create records that use [`Subscription`](/database/subscription.md) features.
4. They cannot create records with [`Unique ID`](/database/unique-id.md) features.

You can prevent anonymous uploads by changing your service settings in the Skapi dashboard.
:::

::: warning
When an anonymous user uploads a record, the `user_id` value in the returned [`RecordData`](/api-reference/data-types/README.md#recorddata) is temporary and should not be used for user queries.
:::

For more detailed information on all the parameters and options available with the [`postRecord()`](/api-reference/database/README.md#postrecord) method, 
please refer to the API Reference below:

### [`postRecord(data, config):Promise<RecordData>`](/api-reference/database/README.md#postrecord)

:::tip Note
Skapi does not require you to predefine a database schema.

If the specified table does not exist, it will be automatically created when you create the record.
Conversely, if a table has no records, it will be automatically deleted.
:::