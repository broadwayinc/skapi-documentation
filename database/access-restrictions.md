
# Access Restrictions

Skapi database allows you to set access restrictions on records. This allows you to control who can access your records.

You can add additional settings to your `table` parameter by using an `object` instead of a `string` in your `config.table`.
This allows you to set access restrictions on records using the `access_group` parameter.

The following values can be set for `table.access_group`:

- Number 0 to 99: Integer from 0 to 99 can be set to define the access level.
- `private`: Only the uploader of the record will have access.
- `public`: The record will be accessible to everyone. (Equivalent to number 0)
- `authorized`: The record will only be accessible to users who are logged into your service. (Equivalent to number 1)
- `admin`: Only admin can use this group. The record will only be accessible to the admin of your service. (Equivalent to number 99)


If `access_group` is not set, the default value is `public`.

::: tip
Users can only access records that have an access group that is the same or a lower number than the access group defined in their user profile.

The user profile's access group can only be changed by the service owners.
:::

::: tip
Unless the user is referencing a private access granted record, the user cannot upload a record with `access_group` set to a higher level than their own access level.

You can read more about referencing records [here](/database/referencing.md).
:::

::: warning
Anonymous (unsigned) users can only create records with `access_group` set to `public`.
:::

## Creating Record With Access Restrictions

Here's an example that demonstrates uploading record with `authorized` level access:

```js
let data = {
    myData: "Only for authorized users"
};

let config = {
    table: {
        name: 'ForAuthorizedUsers',
        access_group: 'authorized'
    }
};

skapi.postRecord(data, config).then(record => {
    console.log(record); // Only the logged users will have access this record.
});
```


## Fetching Records with Access Restrictions

In order to fetch records with `access_group` that is not `public`, you need to specify the `access_group` you are trying to fetch from. In this example, we are trying to fetch records from the "ForAuthorizedUsers" table with `authorized` access.

```js
let config = {
    table: {
        name: 'ForAuthorizedUsers',
        access_group: 'authorized'
    }
};

skapi.getRecords(config)
    .then(response => {
        // response
        /**
         * endOfList: true,
         * list: [
         *  {
         *      data: { myData: "Only for authorized users" },
         *      table: { name: 'ForAuthorizedUsers', access_group: 'authorized' },
         *      ...
         *  }, ...
         * ],
         * startKey: 'end',
         * ...
         */
    });
```

## Private Records

Private records are only accessible to the uploader of the record.

**Even the admin of the service will not have access to view the user's private data.**

The example below demonstrates uploading a private record:

```js
let data = {
    myData: "My private data"
};

let config = {
    table: {
        name: 'PrivateCollection',
        access_group: 'private'
    }
};

skapi.postRecord(data, config).then(record => {
    console.log(record); // Only the uploader will be able to access this record.
});
```

Then, if someone else tries to fetch the record, they will get an error:

```js
let config = {
    record_id: 'record_id_of_the_private_record'
};

skapi.getRecords(config)
    .catch(err=>alert(err.message)); // User has no access to private record.
```

## Grant Private Access

Users can grant private access of their record to other users by using the [`grantPrivateRecordAccess(params)`](/api-reference/database/README.md#grantprivateaccess) method.

```js
skapi.grantPrivateRecordAccess({
    record_id: 'record_id_of_the_private_record',
    user_id: 'user_id_to_grant_access'
})
```

When the user is granted access to the record, they will be able to fetch the record either if it's private or even if it has higher access group than the user.

Access granted users can also see all the records that is referencing this record at all access groups including private records.

You can read more about referencing records [here](/database/referencing.md).

## Remove Private Access

Users can remove access of their private record from other users by using the [`removePrivateRecordAccess(params)`](/api-reference/database/README.md#removeprivateaccess) method.

```js
skapi.removePrivateRecordAccess({
    record_id: 'record_id_of_the_private_record',
    user_id: 'user_id_to_remove_access'
})
```

## Allowing Others to Grant Private Access to Others

By default, The owner of the record has access to grant private access of the uploaded record to others.

The owner of the record can also allow other granted users to grant private access of the uploaded record to others.

When uploading a record, if the uploader set `source.allow_granted_to_grant_others` to `true` users with private access to the record can grant access to other users as well.

```js
skapi.postRecord(null, {
    table: {
        name: 'record_can_be_granted',
        access_group: 'private'
    },
    source: {
        allow_granted_to_grant_others: true
    }
}).then(r=>{
    // now other users with an private access can also grant private access to the record (r) to others.
})
```


## Listing Private Access Grants

You can list record IDs or users that have been granted private access using the [`listPrivateRecordAccess(params, fetchOptions)`](/api-reference/database/README.md#listprivaterecordaccess) method.

:::warning IMPORTANT
Either "record_id" or "user_id" should be given in the parameter.
:::

```js
skapi.listPrivateRecordAccess({
    record_id?: 'record_can_be_granted',
    user_id?: ['user_id_to_check_granted', ...]
}).then(r => {
    // List of records/users with granted private access for the given inputs.
    // {
    //     list: [{
    //         user_id: 'xxxx-xxxx...',
    //         record_id: 'record_id_123'
    //     }, ...],
    //     ...
    // }
})
```
