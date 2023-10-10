
# Updating a Record

The [`postRecord()`](/api-reference/database/README.md#postrecord) method can also be used to update an existing record. You can specify the `record_id` in the `config` object in order to do so. 

[`postRecord()`](/api-reference/database/README.md#postrecord) will overwrite the user's record data to a new data.
For record config parameters, you only need to include the parameters you want to update along with the `record_id` parameter.
All other fields in the record will remain unchanged unless explicitly included in the method call.

User can only update the `config` of the record if they leave the first argument `data` to `undefined`.
Then, only the `config` will be updated with the previous data untouched.

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

:::warning Note
Only the owner of the record can update a record.
:::

## Readonly Record

You can let user upload a readonly record that cannot be updated by the user once it is created. This is useful for creating a record that is meant to be immutable.

To create a readonly record, you can set the `readonly` parameter in the `config` object to `true`.

```js
let data = {
  myData: "Hello World"
};

let config = {
  table: 'my_collection',
  readonly: true
};

skapi.postRecord(data, config).then(record => {
  console.log(record);
});
```

When the record is created with `readonly` set to `true`, the user will not be able to update the record anymore.

```js
skapi.postRecord({ myData: "Can this be updated?" }, { record_id: 'readonly_record_id' }).catch(err=>{
    alert(err.message); // Record is readonly.
})
```