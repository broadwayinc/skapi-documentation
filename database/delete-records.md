
# Deleting Records

:::warning
User must be logged in to call this method
:::

The [`deleteRecords()`](/api-reference/database/README.md#deleterecords) method allows users to delete records from their tables.
When the record is deleted, all the files that were uploaded to the record will be deleted as well.

The `params` object accepts the following properties:

- `record_id` (optional): A string or an array of strings representing the record IDs to delete.
- `table` (optional): An object specifying the table from which to delete records.

**Note:** Either one of the properties should be present

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
You can only delete up to 100 records at a time.
:::

## Deleting User's Records from a Table
Here's an example of deleting all user's records uploaded in the "A" table with a public access group:

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

## Deleting Records in the Subscription Table

You can set `subscription` to `true` to remove the records only in the subscription table.
`table.name` and `table.access_group` value is required to delete records in subscription table.

Below is an example of a user deleting all records in the "A" table with a 'authorized' access group that are in the subscription table.

First, lets upload a record in the "A" table that requires subscription.

```js
let query = {
    table: {
        name: 'A',
        access_group: 'authorized',
        subscription: true
    }
};

skapi.postRecord(null, query).then(response => {
    console.log(response); // Record is uploaded
});
```

Then, you can let user remove all records uploaded in the "A" table that requires subscription.

Learn more about [Subscription](/database/subscription.md).

```js
let query = {
    table: {
        name: 'A',
        access_group: 'authorized',
        subscription: true
    }
};

skapi.deleteRecords(query).then(response => {
    console.log(response); // 'SUCCESS: records are being deleted. please give some time to finish the process.'
});
```

:::warning
When deleting multiple records, the promise will return success immediately, but it may take some time for the deleted records to be reflected in the database.
:::

For more detailed information on all the parameters and options available with the [`deleteRecords()`](/api-reference/database/README.md#deleterecords) method, 
please refer to the API Reference below:

### [`deleteRecords(params): Promise<string>`](/api-reference/database/README.md#deleterecords)