
# Access Restrictions

Skapi database allows you to set access restrictions on records. This allows you to control who can access your records.

You can add additional settings to your `table` parameter by using an `object` instead of a `string` in your `config.table`.
This allows you to set access restrictions on records using the `access_group` parameter.

The following values can be set for `table.access_group`:

- Number 0 to 99: Integer from 0 to 99 can be set to define the access level.
- `private`: Only the uploader of the record will have access.
- `*`: Shorthand for `private`. The SDK converts it to `private` before the request is sent.
- `public`: The record will be accessible to everyone. (Equivalent to number 0)
- `authorized`: The record will only be accessible to users who are logged into your project. (Equivalent to number 1)
- `admin`: The record will only be accessible to admins (access groups `90` ~ `99`) and the project owner. (Equivalent to number 99)


If `access_group` is not set, what happens depends on **which form** the table was written in, because a table written as a plain string is not the same request as a table object with the `access_group` key left out. See [The `table` shorthand and `access_group`](#the-table-shorthand-and-access-group) below.

::: tip
Users can only access records that have an access group that is the same or a lower number than the access group defined in their user profile.

Admins (access groups `90` ~ `99`) and the project owner are the exception: they query and upload records in **every** access group, including `admin` (`99`). Fetching a single record by its `record_id` is stricter for admins in access groups `90` ~ `98`: a record in a higher access group than their own is refused with `No access to the record.` Admins in access group `99` and the project owner reach any record. Private records are off limits to all of them. See [Admin Permissions](/admin/permissions.md#records).

The user profile's access group is set by the project owner, and by admins with [`grantAccess()`](/api-reference/admin/README.md#grantaccess), up to their own access group and only on accounts below their own. See [Granting an access group](/admin/permissions.md#granting-an-access-group).
:::

::: tip
Unless the user is referencing a private access granted record, the user cannot upload a record with `access_group` set to a higher level than their own access level. Admins and the project owner can.

You can read more about referencing records [here](/database/referencing.md).
:::

::: warning
Anonymous (unsigned) users can only create records with `access_group` set to `public`.
:::

## The `table` shorthand and `access_group`

Everywhere a `table` is accepted, it can be written two ways, and the two do **not** mean the same thing when no
`access_group` is given.

Writing the table as a plain **string** is shorthand that pins access group `0` (`public`):

```js
// These two calls are identical. The string form fills in access_group: 0 for you.
await skapi.getRecords({ table: 'notes' });
await skapi.getRecords({ table: { name: 'notes', access_group: 0 } });
```

That is true on `getRecords()`, on `deleteRecords()`, and on a `postRecord()` that **creates** a record (one called
without a `record_id`). It is worth being deliberate about on a delete: `deleteRecords({ table: 'notes' })` does not
empty the table, it deletes your public records in it, and the records the same table holds at any other access group
are left exactly where they are.

Writing the table as an **object** sends only the keys you actually wrote. Leaving `access_group` out of the object
sends no access group at all, and the backend decides the scope of the call:

- For a signed in user who is not the project owner, no access group resolves to group `0`, so it reads and deletes the
  same public records the shorthand would have.
- For the **master** (project owner) account, it is not restricted to one group: the call spans every access group in
  the table. That is the reason the two forms are kept apart. A dashboard or an admin tool that wants to see a whole
  table wants the object form, and a call that must stay inside the public records wants the shorthand.

```js
await skapi.getRecords({ table: 'notes' });            // public records only, for everyone
await skapi.getRecords({ table: { name: 'notes' } });  // no group sent: every group, when the caller is the master
```

::: warning
On an **update**, neither form sends an access group. `postRecord(data, { record_id, table: 'notes' })` and
`postRecord(data, { record_id, table: { name: 'notes' } })` both leave the record in whatever access group it is
already in, and the backend fills the group back in from the stored record. This is what makes an update safe to write
without repeating the group every time. To actually **move** a record between groups, name the group you want:
`table: { name: 'notes', access_group: 'private' }`. Be aware that moving a record in or out of `'private'` is not a
metadata change, see [Encrypting Private Record Data](/database/encryption.md).
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

**Even the admin of the project will not have access to view the user's private data.** Admins in access groups `90` ~ `98` cannot fetch another user's private record at all. The project owner and admins in access group `99` can fetch it, but its `data` comes back withheld, as `{ __is_private__: null }`, so the stored data never leaves. Deleting such a record, and removing private access from a user, are admin rights all the same. See [Private records](/admin/permissions.md#private-records).

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
    .catch(err=>alert(err.message)); // User has no private access.
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

Admins (access groups `90` ~ `99`) can remove private access from any record in the project, not only their own.
On an [encrypted](/database/encryption.md) record this stops the user from fetching it, but only the record's uploader can re-encrypt it, so a copy the user already holds stays readable to them.

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

Nobody else can change anything on a user's private record either, subscription settings
included, or attach and delete its files. This holds for the project owner and admin accounts
too.

The two refusals below are what the project owner and admin accounts get, because they are the
only other accounts allowed to update another user's record at all (on a read-only record, admins
in access groups `90` ~ `98` get `Record is read only.` first). Any other user is refused
before either check, for a private record or not, with:

```ts
{
    code: "INVALID_REQUEST";
    message: "User has no access to update this record.";
}
```

A request from the project owner or an admin account that sets `table.access_group` of a user's
private record to any other group, moving it out of `private`, is refused with:

```ts
{
    code: "INVALID_REQUEST";
    message: "User has no access to change the private access of the record.";
}
```

From the project owner or an admin account, any other change to that record, including a
request that keeps it in `private` or changes only its subscription settings, and moving another
user's record into `private`, are refused with:

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

On another user's non-private record, the project owner and admins in access group `99` can
change the data and the other settings, including moving it between any two non-private
access groups and changing its subscription settings. The project owner cannot make it
read-only. Admins in access groups `90` ~ `98` can change none of its data or settings
except its subscription settings. Files are a separate right: the project owner and every admin
(access groups `90` ~ `99`) can attach files to it and delete its files, see [Files on
Records of Other Users](/database/handling-files.md#files-on-records-of-other-users).
On a record posted by an anonymous user, subscription settings can only be kept or turned
off. See [Admin Permissions](/admin/permissions.md#updating-another-users-record) and
[Subscription](/database/subscription.md#who-can-change-subscription-settings).

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
