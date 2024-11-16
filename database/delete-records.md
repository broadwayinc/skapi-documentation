
# Deleting Records

:::warning
User must be logged in to call this method
:::

The [`deleteRecords()`](/api-reference/database/README.md#deleterecords) method allows users to delete records that they own.
When the record is deleted, all the files that were uploaded to the record will be deleted as well.

The `params` object accepts similar parameters as the [`getRecords()`](/api-reference/database/README.md#getrecords) method.

If the `record_id` is provided, it will delete the record with the given `record_id`.


## Deleting Records by Record IDs

Here's an example that demonstrates how to delete multiple records using an array of record IDs:
```js
let query = {
    record_id: ['record_a_record_id','record_b_record_id']
};

skapi.deleteRecords(query).then(response => {
    // 'SUCCESS: records are being deleted. please give some time to finish the process.'
    console.log(response);
});
```

:::warning
You can only delete up to 100 record ID at a time.
:::

## Deleting User's Records with Database Query

Here's an example of deleting all user's records uploaded in the "A" table with a public access group.

```js
let query = {
    table: {
        name: 'A',
        access_group: 'public'
    }
};

skapi.deleteRecords(query).then(response => {
    // 'SUCCESS: records are being deleted. please give some time to finish the process.'
    console.log(response);
});
```

You can use the database query however you like to let users delete bulk of records that they own. (e.g. by access group, by table name, index, tag, reference, etc.)

:::tip
When deleting multiple records, the promise will return success immediately, but it may take some time for the deleted records to be reflected in the database.
:::

:::warning
When deleting records by database query, user will not delete records that they do not own, or records that are uploaded as read-only.

However, if the user is an admin, they can delete any records in the database. So be cafeful when admin is using this method.
:::

For more detailed information on all the parameters and options available with the [`deleteRecords()`](/api-reference/database/README.md#deleterecords) method, 
please refer to the API Reference below:

### [`deleteRecords(params): Promise<string>`](/api-reference/database/README.md#deleterecords)