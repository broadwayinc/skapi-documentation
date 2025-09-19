# Unique ID

When uploading a record with [`postRecord()`](/api-reference/database/README.md#postrecord), you can set a unique ID for the record. This unique ID can be used to fetch the record later.
Unique ID must be a string and must be unique across all records in the table.

This feature is useful when you want to create a record with a unique identifier, such as a order ID, or any other unique identifier.

Unique ID can be used to fetch the record using the [`getRecords()`](/api-reference/database/README.md#getrecords) method.

Unique ID can be also used when fetching references of a record.
More on referencing can be found [here](/database/referencing.md).

:::warning
Anonymous (unsigned) users cannot create records using unique ID.
:::

## Creating a Record with Unique ID

```js
let data = {
    myData: "This is a record with a unique ID"
};

let config = {
    table: { name: 'my_table', access_group: 'public' },
    unique_id: 'My Unique ID %$#@'
};

skapi.postRecord(data, config).then(record => {
    console.log(record);
    /*
    Returns:
    {
        data: { myData: "This is a record with a unique ID" },
        table: { name: 'my_table', access_group: 'public' },
        unique_id: 'My Unique ID %$#@',
        ...
    }
    */
});
```

The example above demonstrates uploading a record with a unique ID.
When the request is successful, the [RecordData](/api-reference/data-types/README.md#recorddata) is returned.

## Fetching a Record with Unique ID

After uploading the record, you can fetch the record using the unique ID with [`getRecords()`](/api-reference/database/README.md#getrecords) method.

```js
let params = {
    unique_id: 'My Unique ID %$#@'
};

skapi.getRecords(params).then(response => {
    console.log(response.list);  // record with the unique ID
});
```

## Fetching Unique ID List

By using [`getUniqueId()`](/api-reference/database/README.md#getuniqueid) method, you can fetch list of unique ID's that are registered in your database.

Below is an example where you can fetch list of unique ID that starts with **"guitar_"**

```js
let params = {
    unique_id: 'guitar_',
    condition: '>='
};

skapi.getUniqueId(params).then(response => {
    console.log(response.list);  // [{unique_id: "...", record_id: "..."}, ...]
});
```