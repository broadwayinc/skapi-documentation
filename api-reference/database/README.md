# API Reference: Database

Below are the parameters and return data type references for the methods in TypeScript format.

## postRecord

```ts
postRecord(
    data: SubmitEvent | { [key: string] : any } | null | undefined,
    config: {
        record_id?: string; // Used only when updating an existing record; not available to anonymous users. This can also be a unique ID if the record was created with one.
        unique_id?: string; // Unique ID to set to the record; not available to anonymous users. If null is given, it will remove the previous unique ID when updating.
        /** When the table is given as a string value, the value is the table name. */
        /** 'table.name' is optional when 'record_id' or 'unique_id' is used. */
        /** CREATE (no 'record_id'): a table given as a string sets table.name and pins table.access_group to 0 ('public'). */
        /** UPDATE ('record_id' given): no access group is sent in either form, and the record stays in the access group it is already in. Name the group to move it. */
        /** A table object sends only the keys that were written, so leaving 'access_group' out of it sends none. See [Access Restrictions](/database/access-restrictions.md#the-table-shorthand-and-access-group) */
        table?: {
            name?: string; // 1..256 characters, where / ! * # % each count as 3. Blocks control chars and sentinel U+10FFFF.
            access_group?: number | 'private' | '*' | 'public' | 'authorized' | 'admin';  // Default: 'public', otherwise not available to anonymous users. '*' is shorthand for 'private'.
            /** Subscription settings; not available to anonymous users, and never allowed on the project owner's own records. */
            /** On an update, settings left out keep their stored values, and null turns every setting off. */
            /** The project owner and admins can change them on an existing record of another user, unless it is private. On a record posted by an anonymous user they can only keep or turn them off. See [Subscription](/database/subscription.md#who-can-change-subscription-settings) */
            subscription?: {
                is_subscription_record?: boolean; // When true, record will be uploaded to subscription table.
                upload_to_feed?: boolean; // When true, record will be shown in the subscribers feeds that is retrieved via getFeed() method. Off unless set.
                notify_subscribers?: boolean; // When true, creating the record sends a push notification to the uploader's subscribers who subscribed with get_notified. See "notification".
                feed_referencing_records?: boolean; // When true, records referencing this record are added to the feed of this record's uploader.
                notify_referencing_records?: boolean; // When true, every new record referencing this one sends a push notification to this record's uploader's subscribers who subscribed with get_notified.
            } | null;
        };
        /** Text of the push notification sent when the record is created with table.subscription.notify_subscribers. Both required, together at most 3072 bytes. Without it, subscribers see a default text. Ignored on updates. See [Notifications](/database/subscription.md#notifications) */
        notification?: {
            title: string;
            body: string;
        } | null;
        readonly?: boolean; // Default: false. When true, the record cannot be updated. (Not available to anonymous users)
        index?: {
            name: string; // Custom index name: 1..256 characters, where / ! * # % each count as 3. Blocks control chars and sentinel U+10FFFF, and cannot start with '$'.
            value: string | number | boolean; // String value: 0..256 chars. Blocks control chars and sentinel U+10FFFF only.
        };
        tags?: string[] | null; // null removes all tags.
        source?: {
            referencing_limit?: number; // Default: null (Infinite)
            prevent_multiple_referencing?: boolean; // If true, a single user can reference this record only once.
            only_granted_can_reference?: boolean; // When true, only the user who has granted private access to the record can reference this record.
            can_remove_referencing_records?: boolean; // When true, owner of the record can remove any record that are referencing this record. Also when this record is deleted, all the record referencing this record will be deleted.
            referencing_index_restrictions?: {
                name: string; // 1..256 characters, where / ! * # % each count as 3. Blocks control chars and sentinel U+10FFFF, and cannot start with '$'.
                value?: string | number | boolean; // String value: 0..256 chars. Blocks control chars and sentinel U+10FFFF only.
                range?: string | number | boolean; // String range: 0..256 chars. Blocks control chars and sentinel U+10FFFF only.
                condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | '>' | '>=' | '<' | '<=' | '=' | '!='; // Allowed index value condition. Checked when a referencing record is posted: on a string value '>=' is a 'starts with' check, while '<=' is a plain 'lesser or equal' comparison and is not 'ends with'.
            }[] | null;
            allow_granted_to_grant_others?: boolean; // When true, the user who has granted private access to the record can grant access to other users.
        };
        reference?: string; // Reference to another record. When value is given, it will reference the record with the given value. Can be record ID or unique ID.
        remove_bin?: BinaryFile[] | string[] | null; // If the BinaryFile object or the url of the file is given, it will remove the bin data(files) from the record. The file should be uploaded to this record. If null is given, it will remove all the bin data(files) from the record. (not available to anonymous users)
        progress?: ProgressCallback; // Progress callback function. Useful when uploading files.
    },
    /** Files to attach to the record. Each file is uploaded with a permit issued for exactly its byte size, so a request that sends a different number of bytes is refused by storage. The project owner and admins (access groups 90 ~ 99) can attach files to another user's record unless it is private. See [Files on Records of Other Users](/database/handling-files.md#files-on-records-of-other-users) */
    files?: { name: string; file: File }[]
): Promise<RecordData>
```

See [RecordData](/api-reference/data-types/README.md#recorddata)

See [ProgressCallback](/api-reference/data-types/README.md#progresscallback)

See [BinaryFile](/api-reference/data-types/README.md#binaryfile)

#### Errors
```ts
{
    code: "INVALID_REQUEST";
    // Another account (the project owner or an admin) set table.access_group of a user's
    // private record to a non-private group, moving it out of the 'private' access group.
    message: "User has no access to change the private access of the record.";
}
|
{
    code: "INVALID_REQUEST";
    // Only the record's own user can move it into the 'private' access group, or change
    // anything else on it while it is private, subscription settings and attaching files
    // included. This holds for the project owner and admin accounts too.
    // This error and the one above are sent only to the project owner or an admin account.
    // Other users are refused earlier with "User has no access to update this record."
    message: "Only the owner of a record can move it into or out of the private access group.";
}
|
{
    code: "INVALID_REQUEST";
    // The project owner's own records can never have subscription settings, whoever sends
    // the request. Keeping the settings an older record already has, or turning them off,
    // is allowed.
    message: "Records of the project owner cannot have subscription settings.";
}
|
{
    code: "INVALID_REQUEST";
    // A record posted by an anonymous (signed-out) user belongs to no user of the project,
    // so the project owner and admins cannot add or turn on its subscription settings.
    // Keeping the settings it already has, or turning them off, is allowed.
    message: "Anonymous records cannot have subscription settings.";
}
|
{
    code: "INVALID_REQUEST";
    // Admins in access groups 90 ~ 98 can change only the subscription settings of another
    // user's record. {field} names the first field that differs from the stored record,
    // for example data, index, tags, table.name, table.access_group, readonly, unique_id,
    // reference, remove_bin, source.<key> or table.subscription.<key>.
    // Attaching files is a separate right: passing files with nothing else changed is
    // allowed. Removing a stored file with remove_bin is a change, so use deleteFiles().
    message: "Admins can only change the subscription settings of another user's record ({field} differs).";
}
|
{
    code: "INVALID_REQUEST";
    // Admins in access groups 90 ~ 98 changing the subscription settings of another user's
    // record: the record was changed after this request read it, for example saved by its
    // user. Nothing was written. Send the request again, and it is judged against the record
    // as it is stored then.
    message: "The record changed while it was being updated. Try again.";
}
|
{
    code: "INVALID_REQUEST";
    // The project owner's account is not a user of the project.
    message: "The project owner cannot upload records to the private access group." | "The project owner cannot upload read-only records.";
}
|
{
    code: "INVALID_REQUEST";
    // The record belongs to another user and the caller is not the project owner or an admin.
    // Checked before the private access group errors above, so it is also what such a caller
    // gets for another user's private record.
    message: "User has no access to update this record.";
}
|
{
    code: "INVALID_REQUEST";
    // Only the project owner and admins in access group 99 can update a read-only record.
    message: "Record is read only.";
}
|
{
    code: "INVALID_REQUEST";
    // An attached file may not take the name the record's own offloaded data file uses:
    // the file input name "__data__", or the file name "__json__.json".
    // See Large Record Data: /database/create.md#large-record-data
    message: '"__data__/__json__.json" is a reserved file name.';
}
```

Each attached file is uploaded with a permit issued for exactly the byte size the request declares, so
storage refuses a request that then sends a different number of bytes and stores nothing. The SDK always
declares the true size of the file it sends, [encrypted](/database/encryption.md) and empty files
included. See [Uploading Files](/database/handling-files.md#uploading-files).

## getRecords

```ts
getRecords(
    query: {
        record_id?: string; // When record ID is given, it will fetch the record with the given record ID. all other parameters are bypassed and will override unique ID.
        unique_id?: string; // Unique ID of the record. When unique ID is given, it will fetch the record with the given unique ID. All other parameters are bypassed.
        /** When the table is given as a string value, the given value will be set as table.name and table.access_group will be pinned to 0 ('public'). */
        /** A table object sends only the keys that were written: with 'access_group' left out, no access group is sent and the backend decides the scope. A signed in non-master reads group 0, the master reads every group in the table. See [Access Restrictions](/database/access-restrictions.md#the-table-shorthand-and-access-group) */
        /** 'table' is optional when 'record_id' or 'unique_id' is used. */
        table?: string | {
            name: string, // 1..256 characters, where / ! * # % each count as 3. Blocks control chars and sentinel U+10FFFF.
            access_group?: number | 'private' | '*' | 'public' | 'authorized' | 'admin'; // 0 to 99 if using number. 'public' = 0, 'authorized' = 1, 'admin' = 99, '*' = 'private'. Default: 'public'
            subscription?: string; // User ID that requester is subscribed to. (eg. "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
        };

        /**
         * When unique ID is given, it will fetch the records referencing the given unique ID.
         * When record ID is given, it will fetch the records referencing the given record ID.
         * When user ID is given, it will fetch the records uploaded by the given user ID.
         */
        reference?: string | { record_id?: string; unique_id?: string; user_id?: string };

        index?: {
            /** Reserved names: '$updated' | '$uploaded' | '$referenced_count' | '$user_id'. */
            /** Custom names: 1..256 characters, where / ! * # % each count as 3. Block control chars and sentinel U+10FFFF, and cannot start with '$'. */
            name: string | '$updated' | '$uploaded' | '$referenced_count' | '$user_id';
            value: string | number | boolean; // String value: 0..256 chars. Blocks control chars and sentinel U+10FFFF only.
            /** For a string value: '>=' = 'starts with', '<=' = 'ends with'. When the name is a compound name ending in '.', '>=' / '<=' match the child name segment (starts / ends with). '>' / '<' are lexicographic; numbers/booleans compare normally. */
            condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | '>' | '>=' | '<' | '<=' | '='; // cannot be used with range. Default: '='
            range?: string | number | boolean; // String range: 0..256 chars. Blocks control chars and sentinel U+10FFFF only.
        };

        tag?: string; // 1..256 characters, where / ! * # % each count as 3. Blocks control chars and sentinel U+10FFFF.
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<RecordData>>
```

See [RecordData](/api-reference/data-types/README.md#recorddata)

See [FetchOptions](/api-reference/data-types/README.md#fetchoptions)

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

A private record of another user comes back to the project owner and to admins in access group `99` with
its `data` as `{ __is_private__: null }` unless they have access to it: it was shared with them, or they
have private access to the record it references. This holds however it was reached: by `record_id`, by a listing of the
table, by a listing that names `access_group: 'private'`, or by a `tag` query. The rest of the record is
unchanged. Admins in access groups `90` ~ `98` without access cannot fetch such a record by its `record_id`
at all: they get `User has no private access.` See [Private records](/admin/permissions.md#private-records).

## grantPrivateAccess
```ts
grantPrivateRecordAccess(
    params: {
        record_id: string;
        user_id: string | string[];
    }
): Promise<'SUCCESS: granted x users private access to record: xxxx...'>
  
```

:::warning
Moving the record into or out of the `private` access group **removes every grant on it**,
in either direction. See [Changing the Access Group Clears Private
Access](/database/access-restrictions.md#changing-the-access-group-clears-private-access).
:::

#### Errors
```ts
{
    code: "INVALID_REQUEST";
    // The project owner's account can never be given private access to a record.
    message: "Private access cannot be granted to service owners.";
}
|
{
    code: "INVALID_REQUEST";
    message: "Record should be owned by the user.";
}
|
{
    code: "INVALID_REQUEST";
    message: "cannot process more than 100 users at once.";
}
|
{
    code: "INVALID_REQUEST";
    message: "At least 1 user id is required.";
}
```

A grant is what lets another user read a private record, admins in access group `99` included. It
cannot be given to the project owner. See [Private records](/admin/permissions.md#private-records).


## removePrivateAccess
```ts
removePrivateRecordAccess(
    params: {
        record_id: string;
        user_id: string | string[];
    }
): Promise<string>
  
```

#### Errors
```ts
{
    code: "INVALID_REQUEST";
    message: "Private access cannot be granted to project owners.";
}
|
{
    code: "INVALID_REQUEST";
    message: "Record should be owned by the user.";
}
|
{
    code: "INVALID_REQUEST";
    message: "cannot process more than 100 users at once.";
}
|
{
    code: "INVALID_REQUEST";
    message: "At least 1 user id is required.";
}
```

## listPrivateRecordAccess
```ts
listPrivateRecordAccess(
    params: {
        record_id?: string;
        user_id?: string | string[];
    }
): Promise<DatabaseResponse<{
    user_id: string;
    record_id: string;
}>>
```

See [FetchOptions](/api-reference/data-types/README.md#fetchoptions)

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)


## deleteRecords

```ts
deleteRecords({
    record_id?: string; // Record ID to delete. When record ID is given, it will delete the record with the given record ID. It will bypass all other parameters and will override unique ID.
    unique_id?: string; // Unique ID to delete. When unique ID is given, it will delete the record with the given unique ID. It will bypass all other parameters except record_id.

    /** Delete bulk records by query. Query will be bypassed when "record_id" is given. */
    /** When deleteing records by query, It will only delete the record that user owns. */
    /** When the table is given as a string value, the value is the table name, and table.access_group is pinned to 0 ('public'). A string table therefore deletes the PUBLIC records of that table, not the whole table. */
    /** A table object sends only the keys that were written: with 'access_group' left out, no access group is sent and the backend decides the scope. See [Access Restrictions](/database/access-restrictions.md#the-table-shorthand-and-access-group) */
    /** 'table' is optional when 'record_id' or 'unique_id' is used. */
    table: string | {
        name: string,
        access_group?: number | 'private' | '*' | 'public' | 'authorized' | 'admin'; // 0 to 99 if using number. 'public' = 0, 'authorized' = 1, 'admin' = 99, '*' = 'private'. Default: 'public'
        subscription?: string; // User ID that requester is subscribed to. (eg. "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
    };

    /**
     * When unique ID is given, it will fetch the records referencing the given unique ID.
     * When record ID is given, it will fetch the records referencing the given record ID.
     * When user ID is given, it will fetch the records uploaded by the given user ID.
     * When fetching record by record_id or unique_id that user has restricted access, but the user has been granted access to reference, user can fetch the record if the record ID or the unique ID of the reference is set to reference parameter.
     */
    reference?: string;

    index?: {
        /** Reserved names: '$updated' | '$uploaded' | '$referenced_count' | '$user_id'. */
        /** Custom names: 1..256 characters, where / ! * # % each count as 3. Block control chars and sentinel U+10FFFF, and cannot start with '$'. */
        name: string | '$updated' | '$uploaded' | '$referenced_count' | '$user_id';
        value: string | number | boolean; // String value: 0..256 chars. Blocks control chars and sentinel U+10FFFF only.
        /** For a string value: '>=' = 'starts with', '<=' = 'ends with'. When the name is a compound name ending in '.', '>=' / '<=' match the child name segment (starts / ends with). '>' / '<' are lexicographic; numbers/booleans compare normally. */
        condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | '>' | '>=' | '<' | '<=' | '='; // cannot be used with range. Default: '='
        range?: string | number | boolean; // String range: 0..256 chars. Blocks control chars and sentinel U+10FFFF only.
    };

    tag?: string; // 1..256 characters, where / ! * # % each count as 3. Blocks control chars and sentinel U+10FFFF.
}): Promise<string | DatabaseResponse<RecordData>>
```

## getTables

```ts
getTables(
    query?: {
        table?: string; // If omitted, fetches the full list of tables.
        /** Default when omitted: EXACT match on the given table name. */
        /** 'gte' / '>=' is a prefix search: table names starting with the given value. */
        /** 'gt' / '>' is lexicographic, so it spills past the prefix into every later table name. */
        condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | '>' | '>=' | '<' | '<=' | '=';
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<Table>>
```

When `condition` is omitted and `table` is given, the table name is matched **exactly**.
When `table` is omitted as well, every table is returned.

| Call | Result |
| --- | --- |
| `getTables()`, `getTables({})` | Every table in the project. |
| `getTables({ table: 'x' })` | Exact match on `'x'`. |
| `getTables({ table: 'x', condition: 'gte' })` | Prefix: every table name starting with `'x'`. |
| `getTables({ table: '' })` | Error: `"table" should not be empty.` |
| `getTables({ condition: 'gte' })`, with no `table` | Error: `"table" is required for condition.` |

While you are exploring and do not know the exact spelling, pass `gte`: it is a prefix search, so it also surfaces related entries.
A table name very often carries a leading name shared with the rest of its data set, a source or dataset prefix for example, so an exact match finds one spelling and silently misses its siblings, while the prefix finds the whole family.
When you already know the exact name, omitting `condition` is the exact match you want.

**Requires a signed in user** when the project's [Require Login](/service-settings/service-settings.md#require-login) setting is on, and a project that has never set that option counts as **on**.
The SDK throws `REQUIRE_LOGIN` before the request leaves, and the backend refuses the same call with `INVALID_REQUEST`, so a direct API call is refused as well.

Table **names** are never filtered by access group: every table in the project is listed.
The per access group record counters are filtered to the caller: `number_of_records_in_access_group_public` for everyone, the counters up to and including the caller's own access group for a signed in user, and `number_of_records_in_access_group_private` and `number_of_records_in_access_group_admin` for admins and the project owner.
`number_of_records` and `size` are **not** filtered and stay totals over every access group, so `number_of_records` is normally larger than the counters you can see add up to.
See [Table Information](/database/table-info.md).

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [Table](/api-reference/data-types/README.md#table)


## getIndex

```ts
getIndexes(
    query: {
        table: string;
        /** Omitted: PREFIX, lists every index of the table. */
        /** A name with no trailing '.': EXACT match on that index name. */
        /** A name ending in '.': PREFIX, lists the children of that compound index. ('Band.' lists 'Band.name', 'Band.year') */
        index?: string; // 1..256 characters for custom names, where / ! * # % each count as 3; blocks control chars and sentinel U+10FFFF, cannot start with '$'.
        order?: {
            by: 'average_number' | 'total_number' | 'number_count' | 'average_bool' | 'total_bool' | 'bool_count' | 'string_count' | 'index_name' | 'number_of_records';
            value?: number | boolean | string; // Required when 'order.condition' is given.
            /** Default when omitted: EXACT match against 'order.value'. */
            condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | '>' | '>=' | '<' | '<=' | '=';
        };
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<Index>>
```

`table` is **required**, so there is no no-argument form.
[`getIndexes()`](/api-reference/database/README.md#getindex) has no top level `condition` either.
The only condition is `order.condition`, and it **requires** `order.value`: a query that sets `order.condition` without `order.value` is rejected.

| Call | Result |
| --- | --- |
| `getIndexes({ table: 't' })` | Every index of table `'t'`. |
| `getIndexes({ table: 't', index: 'Band' })` | Exact match on index `'Band'`. |
| `getIndexes({ table: 't', index: 'Band.' })` | Prefix: the children of the compound index, so `Band.name` and `Band.year`. |
| `getIndexes({ table: 't', order: { by: 'index_name', value: 'B' } })` | Exact match against the value. |
| `getIndexes({ table: 't', order: { by: 'total_number' } })` | The whole partition, ordered by that attribute. |
| `order.condition` without `order.value` | Error. |
| No `table` | Error: `"table" is required.` |

While you are hunting for an index whose exact spelling you do not know, order by `index_name` and pass `gte` instead of a bare `order.value`: it is a prefix search, so it also surfaces the related entries an exact match would silently miss.

**Requires a signed in user** when the project's [Require Login](/service-settings/service-settings.md#require-login) setting is on, and a project that has never set that option counts as **on**.
The SDK throws `REQUIRE_LOGIN` before the request leaves, and the backend refuses the same call with `INVALID_REQUEST`, so a direct API call is refused as well.

The listing is **not** filtered by access group, for any caller.
An index row is stored keyed by table and index name with the access group left out, so one row aggregates every group: `number_of_records`, `total_number`, `average_number` and the rest span the whole table, private and admin records included.
Any caller allowed to read this listing reads the project's entire index vocabulary. The records behind it stay gated.

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [Index](/api-reference/data-types/README.md#index)


## getTags

```ts
getTags(
    query?: {
        table?: string; // 1..256 characters, where / ! * # % each count as 3. Blocks control chars and sentinel U+10FFFF.
        tag?: string; // 1..256 characters, where / ! * # % each count as 3. Blocks control chars and sentinel U+10FFFF.
        /** Default when omitted: EXACT match on the tag when BOTH 'table' and 'tag' are given, otherwise '>=' (prefix). */
        /** 'gte' / '>=' is a prefix search. */
        condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | '>' | '>=' | '<' | '<=' | '=';
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<Tag>>
```

When `condition` is omitted and **both** `table` and `tag` are given, the tag is matched **exactly**.
When only `table` is given, the omitted `condition` defaults to `>=`, a prefix search, so the call lists every tag in that table.
When only `tag` is given, that same `>=` default searches every table, so the call finds that tag across the whole project.
When neither `table` nor `tag` is given, every tag in the project is returned, ordered by record count, descending.

| Call | Result |
| --- | --- |
| `getTags()`, `getTags({})` | Every tag in the project, ordered by record count, descending. |
| `getTags({ table: 't' })` | Every tag in table `'t'`. |
| `getTags({ table: 't', tag: 'g' })` | Exact match on tag `'g'` in table `'t'`. |
| `getTags({ tag: 'g' })`, with no `table` | Tag `'g'` across all tables. |
| `getTags({ table: 't', tag: 'g', condition: 'gte' })` | Prefix: every tag in `'t'` starting with `'g'`. |
| `getTags({ condition: 'gte' })`, with neither `table` nor `tag` | Error: `"table" or "tag" is required for condition.` |

While you are exploring and do not know the exact spelling, pass `gte`: it is a prefix search, so it also surfaces related entries.
A tag very often carries a leading name shared with the rest of its data set, a series name for example, or an entity recorded once plainly and once with a parenthesised alias, so an exact match finds one spelling and silently misses its siblings, while the prefix finds the whole family.
When you already know the exact name, give both `table` and `tag` and omit `condition`: that is the exact match you want.

**Requires a signed in user** when the project's [Require Login](/service-settings/service-settings.md#require-login) setting is on, and a project that has never set that option counts as **on**.
The SDK throws `REQUIRE_LOGIN` before the request leaves, and the backend refuses the same call with `INVALID_REQUEST`, so a direct API call is refused as well.

The listing is **not** filtered by access group, for any caller.
A tag row is stored keyed by tag and table name with the access group left out, so `number_of_records` counts the records in every group together.
Any caller allowed to read this listing reads the project's entire tag vocabulary, tags carried only by private or admin records included. The records behind it stay gated, but a tag name is visible to every signed in user.

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [Tag](/api-reference/data-types/README.md#tag)


## getUniqueId

```ts
getUniqueId(
    query: {
        unique_id?: string;
        condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | '>' | '>=' | '<' | '<=' | '=' | '!=';
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<UniqueId>>
```

**Requires a signed in user** when the project's [Require Login](/service-settings/service-settings.md#require-login) setting is on, and a project that has never set that option counts as **on**.
The SDK throws `REQUIRE_LOGIN` before the request leaves, and the backend refuses the same call with `INVALID_REQUEST`, so a direct API call is refused as well.

Called with no `unique_id`, this enumerates **every** unique ID in the project.
The listing is **not** filtered by access group: a row is keyed by the unique ID alone, so any caller allowed to read it sees the IDs of records in every group, each with the record ID it maps to. Fetching those records still goes through the usual access checks.

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [UniqueId](/api-reference/data-types/README.md#uniqueid)


## subscribe
```ts
subscribe(
    {
        user_id: string; // User to subscribe to.
        get_feed?: boolean; // Records the user posts with upload_to_feed appear in getFeed().
        get_notified?: boolean; // Push notifications for the user's records posted with notify_subscribers, and for new references to their records with notify_referencing_records. The device also needs subscribeNotification().
        get_email?: boolean;
    }
): Promise<Subscription>
```

A new subscription starts with every option off. Calling `subscribe()` again for the same user changes only the options given and keeps the rest. See [Notifications](/database/subscription.md#notifications)

See [Subscription](/api-reference/data-types/README.md#subscription)


## unsubscribe
```ts
unsubscribe(
    {
        user_id: string;
    }
): Promise<'SUCCESS: The user has unsubscribed.'>
```


## blockSubscriber

```ts
blockSubscriber(
    {
        user_id: string;
    }
): Promise<'SUCCESS: Blocked user ID "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".'>
```

## unblockSubscriber

```ts
unblockSubscriber(
    {
        user_id: string;
    }
): Promise<'SUCCESS: Unblocked user ID "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".'>
```


## getSubscriptions

```ts
getSubscriptions(
    params: {
        // Must have either subscriber and/or subscription value
        subscriber?: string; // User ID of the subscriber (User who subscribed)
        subscription?: string; // User ID of the subscription (User being subscribed to)
        blocked?: boolean; // When true, fetches only blocked subscribers. Default = false
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<Subscription>>
```
See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [Subscription](/api-reference/data-types/README.md#subscription)


## getFeed

```ts
getFeed(params?: { access_group?: number; }, fetchOptions?: FetchOptions): Promise<DatabaseResponse<RecordData>>
```

## getFile
    
```ts
getFile(
    url: string,
    config?: {
        dataType?: 'base64' | 'download' | 'endpoint' | 'blob' | 'text' | 'info';
        expires?: number;
        browserCache?: number;
        refresh?: boolean;
        progress?: ProgressCallback;
    },
): Promise<Blob | string | FileInfo | void>
```

`browserCache` is the number of seconds the browser may reuse the URL minted for `expires`.
Without it, every call mints a brand new signed URL, and since the browser cache is keyed by URL,
the file is downloaded again every time even when nothing has changed.
With it, the request that mints the URL is answered from the browser cache and the same URL comes back,
so the copy already downloaded stays usable.
The URL's own lifetime is still `expires`: what keeps the file available past that is the cached copy, not the URL.
Only meaningful together with `expires`, and capped at 1 week.
Private files in a record's `bin` already do this for you, see [Caching Expiring Files](/database/handling-files.md#caching-expiring-files).

`refresh` bypasses that cached mint and forces a fresh signed URL.
Use it when the file may have changed, or after a load failed because the cached URL had expired
and the file was no longer in the browser cache.

See [FileInfo](/api-reference/data-types/README.md#fileinfo)

See [ProgressCallback](/api-reference/data-types/README.md#progresscallback)

## deleteFiles

```ts
deleteFiles({
    /** Endpoint URLs of record files (the url of a BinaryFile), up to 1000. They may belong to different records of the project. */
    /** A user who is not an admin can delete only the files of their own records, except files the project owner or an admin attached to them before such files were stored under the record's user. See [Files attached by another account](/database/handling-files.md#removing-files) */
    /** The project owner and admins (access groups 90 ~ 99) can also delete the files of another user's record, unless it is private. */
    /** Files on a private record can be deleted only by its user. See [Files on Records of Other Users](/database/handling-files.md#files-on-records-of-other-users) */
    endpoints: string | string[];
}): Promise<RecordData[]> // The records the files were removed from.
```

The whole list is checked before anything is deleted, so a refused request deletes no file.

See [RecordData](/api-reference/data-types/README.md#recorddata)

#### Errors
```ts
{
    code: "INVALID_REQUEST";
    // The caller is not an admin, and either the record is not theirs or the file is one the
    // project owner or an admin attached to it before such files were stored under the record's user.
    message: "The record should be owned by the user.";
}
|
{
    code: "INVALID_REQUEST";
    // The record belongs to another user and is private. Refused for everyone, the project
    // owner and admins included.
    message: "Only the owner of a private record can delete its files.";
}
|
{
    code: "NOT_EXISTS";
    // A record that one of the files belongs to does not exist.
    message: 'Record "<record_id>" does not exists.';
}
|
{
    code: "INVALID_REQUEST";
    // The URL is not the endpoint of a record file in this project.
    message: "Invalid endpoint";
}
|
{
    code: "INVALID_REQUEST";
    // The file that holds a record's offloaded data cannot be deleted by URL.
    message: '"__data__/__json__.json" is a reserved file name.';
}
|
{
    code: "INVALID_REQUEST";
    message: "Cannot delete more than 1000 files at once.";
}
|
{
    code: "INVALID_REQUEST";
    // The database is frozen. Admins and the project owner are not affected.
    message: "Database is frozen. Write access is denied for this user.";
}
|
{
    code: "INVALID_PARAMETER";
    message: '"endpoints" should be type: array | string.';
}
```