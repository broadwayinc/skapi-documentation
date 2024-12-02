# API Reference: Database

## postRecord

```ts
postRecord(
    data: SubmitEvent | { [key: string] : any } | null,
    config: {
        record_id?: string; // Only used when updating records.
        unique_id?: string; // Unique ID to set to the record. If null is given, it will remove the previous unique ID when updating.
        // 'table' is optional when record ID is used.
        table: string | {
            name: string; // Other than space and period, special characters are not allowed.
            access_group?: number | 'private' | 'public' | 'authorized';  // Default: 'public'
            subscription?: boolean // Post record to subscription table if true. Default: false
        };
        readonly?: boolean; // Default: false. When true, the record cannot be updated.
        index?: {
            name: string; // Only alphanumeric and period allowed.
            value: string | number | boolean; // Only alphanumeric and spaces allowed.
        };
        tags?: string | <string>[]; // Only alphanumeric and spaces allowed. It can also be an array of strings or a string with comma separated values.
        reference?: {
            unique_id?: string; // Unique ID of the record to reference.
            record_id?: string; // ID of the record to reference. If given, will override the unique_id.
            prevent_multiple_referencing?: boolean; // default: false, When true, a single user can only reference this record once.
            referencing_limit?: number | null; // default: null, Set to 0 to block other records to reference this record, null for no limit.
            can_remove_referencing?: boolean; // default: false, When true, the owner of the record can remove the referenced records. And all the referenced records will be removed when the owner removes this record.
            exclude_from_suscription_feed?: boolean; // default: false, When true, the referenced records will not be included in the subscription feed.
            only_allow_granted: boolean; // default: false, When true, only the users who have been granted access to the record can reference this record.
            index_restrictions?: {
                /** Not allowed: White space, special characters. Allowed: Alphanumeric, Periods. */
                name: string; // Allowed index name
                /** Not allowed: Periods, special characters. Allowed: Alphanumeric, White space. */
                value?: string | number | boolean; // Allowed index value
                range?: string | number | boolean; // Allowed index range
                condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | '>' | '>=' | '<' | '<=' | '=' | '!='; // Allowed index value condition
            }[]
        };
        remove_bin?: BinaryFile[] | string[] | null; // If the BinaryFile object or the url of the file is given, it will remove the bin data(files) from the record. The file should be uploaded to this record. If null is given, it will remove all the bin data(files) from the record.
        progress: ProgressCallback; // Progress callback function. Usefull when uploading files.
    };
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
        /** When the table is given as a string value, the value is the table name. */
        table: string | {
            name: string,
            access_group?: number | 'private' | 'public' | 'authorized'; // 0 to 99 if using number. Default: 'public'
            subscription?: string; // User ID of the subscription (User being subscribed to)
        };

        /**
         * When unique ID is given, it will fetch the records referencing the given unique ID.
         * When record ID is given, it will fetch the records referencing the given record ID.
         * When user ID is given, it will fetch the records uploaded by the given user ID.
         * When fetching record by record_id or unique_id that user has restricted access, but the user has been granted access to reference, user can fetch the record if the record ID or the unique ID of the reference is set to reference parameter.
         */
        reference?: string;

        index?: {
            /** '$updated' | '$uploaded' | '$referenced_count' | '$user_id' are the reserved index names. */
            name: string | '$updated' | '$uploaded' | '$referenced_count' | '$user_id';
            value: string | number | boolean;
            condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | '>' | '>=' | '<' | '<=' | '=' | '!='; // cannot be used with range. Default: '='
            range?: string | number | boolean; // cannot be used with condition
        };

        tag?: string; // Queries records with the given tag.
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<RecordData>>
```

See [RecordData](/api-reference/data-types/README.md#recorddata)

See [FetchOptions](/api-reference/data-types/README.md#fetchoptions)

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

## grantPrivateAccess
```ts
grantPrivateRecordAccess(
    params: {
        record_id: string;
        user_id: string | string[];
    }
): Promise<'SUCCESS: granted x users private access to record: xxxx...'>
  
```

#### Errors
```ts
{
    code: "INVALID_REQUEST";
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


## removePrivateAccess
```ts
removePrivateRecordAccess(
    params: {
        record_id: string;
        user_id: string | string[];
    }
): Promise<'SUCCESS: granted x users private access to record: xxxx...'>
  
```

#### Errors
```ts
{
    code: "INVALID_REQUEST";
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

## deleteRecords

```ts
deleteRecords({
    record_id?: string | string[]; // Record ID or an array of record IDs to delete. When record ID is given, it will delete the record with the given record ID. It will bypass all other parameters and will override unique ID.
    unique_id?: string | string[]; // Unique ID or an array of unique IDs to delete. When unique ID is given, it will delete the record with the given unique ID. It will bypass all other parameters except record_id.

    /** Delete bulk records by query. Query will be bypassed when "record_id" is given. */
    /** When deleteing records by query, It will only delete the record that user owns. */
    table?: {
        name: string;
        access_group?: number | 'private' | 'public' | 'authorized';
        subscription?: boolean; // When true, it will delete records from the subscription table.
    };

    reference?: string; // Referenced record ID or unique ID or user ID. when value is given, it will delete records that are referencing to the given value.

    /** Index condition and range cannot be used simultaneously.*/
    index?: {
        name: string | '$updated' | '$uploaded' | '$referenced_count' | '$user_id'; // Not allowed: White space, special characters. Allowed: Periods, alphanumeric.
        value: string | number | boolean; // Not allowed: Periods, special characters. Allowed: White space, alphanumeric.
        condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | '>' | '>=' | '<' | '<=' | '=' | '!=';
        range?: string | number | boolean; // Not allowed: Periods, special characters. Allowed: White space, alphanumeric.
    };
    tag?: string; // Not allowed: Periods, special characters. Allowed: White space, alphanumeric.
}): Promise<string | DatabaseResponse<string>>
```

## getTables

```ts
getTables(
    query: {
        table: string;
        condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | '>' | '>=' | '<' | '<=' | '=' | '!=';
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<Table>>
```
See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [Table](/api-reference/data-types/README.md#table)


## getIndex

```ts
getIndexes(
    query: {
        table: string;
        index?: string;
        order?: {
            by: 'average_number' | 'total_number' | 'number_count' | 'average_bool' | 'total_bool' | 'bool_count' | 'string_count' | 'index_name';
            value?: number | boolean | string;
            condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | '>' | '>=' | '<' | '<=' | '=' | '!=';
        };
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<Index>>
```
See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [Index](/api-reference/data-types/README.md#index)


## getTags

```ts
getTags(
    query: {
        table: string;
        tag?: string;
        condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | '>' | '>=' | '<' | '<=' | '=' | '!=';
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<Tag>>
```
See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [Tag](/api-reference/data-types/README.md#tag)

## subscribe
```ts
subscribe(
    {
        user_id: string;
    }
): Promise<'SUCCESS: the user has subscribed.'>
```


## unsubscribe
```ts
unsubscribe(
    {
        user_id: string;
    }
): Promise<'SUCCESS: the user has unsubscribed.'>
```


## blockSubscriber

```ts
blockSubscriber(
    {
        user_id: string;
    }
): Promise<'SUCCESS: blocked user id "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".'>
```

## unblockSubscriber

```ts
unblockSubscriber(
    {
        user_id: string;
    }
): Promise<'SUCCESS: unblocked user id "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".'>
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

See [Subscription](/api-reference/data-types/README.md#subscripion)


## getFile
    
```ts
getFile(
    url: string,
    config?: {
        dataType: 'base64' | 'download' | 'endpoint' | 'blob' | 'text' | 'info';
    },
    progressCallback?: ProgressCallback
): Promise<Blob | string | FileInfo | void>
```

See [FileInfo](/api-reference/data-types/README.md#fileinfo)

See [ProgressCallback](/api-reference/data-types/README.md#progresscallback)