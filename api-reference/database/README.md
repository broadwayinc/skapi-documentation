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
            /** Subscription settings; not available to anonymous users. */
            subscription?: {
                is_subscription_record?: boolean; // When true, record will be uploaded to subscription table.
                upload_to_feed?: boolean; // When true, record will be shown in the subscribers feeds that is retrieved via getFeed() method.
                notify_subscribers?: boolean; // When true, subscribers will receive notification when the record is uploaded.
                feed_referencing_records?: boolean; // When true, records referencing this record will be included to the subscribers feed.
                notify_referencing_records?: boolean; // When true, records referencing this record will be notified to subscribers.
            };
        };
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
    files?: { name: string; file: File }[] // Files to attach to the record.
): Promise<RecordData>
```

See [RecordData](/api-reference/data-types/README.md#recorddata)

See [ProgressCallback](/api-reference/data-types/README.md#progresscallback)

See [BinaryFile](/api-reference/data-types/README.md#binaryfile)

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

#### Errors
```ts
{
    code: "INVALID_REQUEST";
    // Moving a record into or out of the 'private' access group is restricted to the
    // record's owner, even for a project owner or admin account. Every other setting on
    // another user's record remains updatable, including moving it between any two
    // non-private groups.
    message: "Only the owner of a record can move it into or out of the private access group.";
}
```

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
See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [UniqueId](/api-reference/data-types/README.md#uniqueid)


## subscribe
```ts
subscribe(
    { user_id: string; get_feed?: boolean; get_notified?: boolean; get_email?: boolean; }
): Promise<Subscription>
```

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