
# Updating a Record

The [`postRecord()`](/api-reference/database/README.md#postrecord) method can also be used to update an existing record. You can specify the `record_id` in the `config` object in order to do so. 

[`postRecord()`](/api-reference/database/README.md#postrecord) will overwrite the user's record data to a new data.

For record config parameters, you only need to include the parameters you want to update along with the `record_id` parameter.
All other fields in the record will remain unchanged unless explicitly included in the method call.

```js
let updatedData = {
  newData: "Overwritten with new data."
};

let config = {
  record_id: 'record_id_to_update',
  table: {
    name: 'new_table_name',
    access_group: 'private' // change access group to private
  }
};

skapi.postRecord(updatedData, config).then(record => {
  console.log(record);
});
```

Example above overwrites record data to a new data and updated to a new table name.

:::tip
To update only the `config` of the record with `data` untouched, you can leave the first argument `data` to `undefined`.
Then, only the `config` will be updated with the previous data untouched.

```js
let new_config = {
  record_id: 'record_id_to_update',
  table: {
    name: 'new_table_name',
    access_group: 'private' // change access group to private
  }
};

skapi.postRecord(undefined, new_config).then(record => {
  console.log(record);
});
```

:::danger
Always use `undefined` if you want to update only the record configurations.
If `null` is used instead of undefined, the record data will be overwritten to value `null`.
:::

:::

:::info
Only the owner of the record can update a record.
:::

## Readonly Record

You can let user upload a readonly record that is immutable once it is created.
To create a readonly record, you can set the `readonly` parameter in the `config` object to `true`.

```js
let data = {
  myData: "Hello World"
};

let config = {
  table: 'my_collection',
  readonly: true
};

let read_only_record_id;
skapi.postRecord(data, config).then(record => {
  console.log(record);
  read_only_record_id = record.record_id;
});
```

When the record is created with `readonly` set to `true`, the user will not be able edit or delete the record anymore.

```js
skapi.postRecord({ myData: "Can this be updated?" }, { record_id: read_only_record_id }).catch(err=>{
    alert(err.message); // Record is readonly.
})
```