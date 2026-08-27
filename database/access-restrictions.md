
# Access Restrictions

Skapi database allows you to set access restrictions on records. This allows you to control who can access your records.

You can add additional settings to your `table` parameter by using an `object` instead of a `string` in your `config.table`.
This allows you to set access restrictions on records using the `access_group` parameter.

The following values can be set for `table.access_group`:

- Number 0 to 99: Integer from 0 to 99 can be set to define the access level.
- `private`: Only the uploader of the record will have access.
- `public`: The record will be accessible to everyone. (Equivalent to number 0)
- `authorized`: The record will only be accessible to users who are logged into your project. (Equivalent to number 1)
- `admin`: Only admin can use this group. The record will only be accessible to the admin of your project. (Equivalent to number 99)


If `access_group` is not set, the default value is `public`.

::: tip
Users can only access records that have an access group that is the same or a lower number than the access group defined in their user profile.

The user profile's access group can only be changed by the project owners.
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

**Even the admin of the project will not have access to view the user's private data.**

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

## Changing the Access Group Clears Private Access

Moving a record **into or out of** the `private` access group removes **every private access
grant on it**.

| Change | Grants |
| --- | --- |
| `private` to any other group | **cleared** |
| any other group to `private` | **cleared** |
| between two non-private groups | untouched |
| no access group change | untouched |

`private` is the only access group where a grant means *"this named user may read this one
record"*. In every other group a grant only widens what an already-qualifying user may do,
such as reading a record above their own access level or seeing the records referencing it,
so those grants stay meaningful and are left alone.

Leaving them in place on the way **out** of `private` would keep an access model the record
no longer uses. Leaving them in place on the way **back in** would silently re-grant users
the owner never re-approved.

```js
// shared with a colleague
await skapi.grantPrivateRecordAccess({ record_id, user_id: 'colleague_user_id' });

// this clears that grant, and so would moving it back to 'private' afterwards
await skapi.postRecord(undefined, {
    record_id,
    table: { name: 'my_collection', access_group: 'authorized' }
});
```

:::warning
The grants are gone, not suspended. If those users should still have access after the
change, grant them again.
:::

This is handled server side, so it applies to every project.

## Only the Owner Can Cross the Private Boundary

A record can only be moved **into or out of** `private` by **the user who owns it**.

This is the one record setting that a project owner or admin account cannot change on
someone else's behalf. Everything else about another user's record remains available to
them, including moving it between any two non-private access groups.

```ts
{
    code: "INVALID_REQUEST";
    message: "Only the owner of a record can move it into or out of the private access group.";
}
```

The reason is that `private` is the only access group whose contents may be
[end-to-end encrypted](/database/encryption.md). Nobody but the owner holds the key, so a
different account moving the record across that line would either seal it under a key the
owner does not have, or publish bytes that nobody can decrypt. Both destroy the record while
reporting success, and neither is recoverable.

The rule is enforced whether or not encryption is enabled, so that a project cannot enable
it later and discover its records were already stranded.

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

You can list records or users that have been granted private access using the [`listPrivateRecordAccess(params, fetchOptions)`](/api-reference/database/README.md#listprivaterecordaccess) method.

:::warning IMPORTANT
Provide either `record_id` or `user_id` (at least one is required).
:::

```js
skapi.listPrivateRecordAccess({
    // Optional: one or both of these fields
    record_id: 'record_can_be_granted',
    user_id: 'user_id_to_check_granted'
}).then(res => {
    // Response shape:
    // {
    //   list: [
    //     { user_id: 'xxxx-xxxx...', record_id: 'record_id_123' },
    //     ...
    //   ],
    //   ...
    // }
})
```
