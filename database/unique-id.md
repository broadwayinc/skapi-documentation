# Unique ID

When uploading a record with [`postRecord()`](/api-reference/database/README.md#postrecord), you can set a unique ID for the record. This unique ID can be used to fetch the record later.
Unique ID must be a string and must be unique across all records in the table.

This feature is useful when you want to create a record with a unique identifier, such as a order ID, or any other unique identifier.

Unique ID can be used to fetch the record using the [`getRecords()`](/api-reference/database/README.md#getrecords) method.

Unique ID can be also used when fetching references of a record.
More on referencing can be found in [Referencing](/database/referencing.md).

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

With `condition` omitted, the unique ID is matched exactly.
`>=` fetches the unique IDs that **start with** the value, as above, and `<=` fetches the ones that **end with** it:

```js
skapi.getUniqueId({
    unique_id: '_acoustic',
    condition: '<='
}).then(response => {
    console.log(response.list);  // Unique IDs ending with "_acoustic", such as "guitar_acoustic"
});
```

An 'ends with' search reads each unique ID from its last character backwards, and the results come back in that order. `fetchOptions.ascending` still applies, but it orders by that reversed reading rather than by the unique ID itself, so sort the returned list yourself if you need it ordered by unique ID.

## Reserved Prefix: `src::`

Unique IDs that start with `src::` identify the files in your project's file storage.
A file stored at `folder/report.pdf` is identified by the unique ID `src::folder/report.pdf`.
Records that describe a part of that file can extend its ID with `#` or `::`, for example `src::folder/report.pdf#page-3`.

Deleting a file also deletes the records under its ID, so the prefix is reserved:

- The project owner and admins can set any unique ID that starts with `src::`.
- A signed in user who is not an admin can only set `src::<their user ID>/...`, which names a file in their own upload folder.
- Any other unique ID that starts with `src::` is refused with an `INVALID_REQUEST` error.

A record that already has a `src::` unique ID can be updated by anyone who is allowed to write it, as long as the unique ID is left unchanged.

When a file is deleted from the project's file storage, these records are deleted with it:

- The record whose unique ID is `src::<file path>`.
- Every record whose unique ID extends that ID with `#` or `::`.
- Every record that references one of the records above, at any depth.

:::warning
Do not use the `src::` prefix for your own identifiers. Records under a `src::` unique ID are removed when the file with that path is deleted.
:::
