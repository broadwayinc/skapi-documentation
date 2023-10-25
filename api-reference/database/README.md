# API Reference: Database

## postRecord

```ts
postRecord(
    data: SubmitEvent | { [key: string] : any } | null,
    config: {
        // 'table' is optional when record ID is used.
        table: string | {
            name: string; // Other than space and period, special characters are not allowed.
            access_group?: number | 'private' | 'public' | 'authorized';  // Default: 'public'
            subscription?: boolean // Post record to subscription table if true. Default: false
        };
        record_id?: string; // Only used when updating records.
        readonly?: boolean; // Default: false. When true, the record cannot be updated.
        index?: {
            name: string; // Only alphanumeric and period allowed.
            value: string | number | boolean; // Only alphanumeric and spaces allowed.
        };
        tags?: string | <string>[]; // Only alphanumeric and spaces allowed.
        reference?: {
            record_id?: string; // ID of the record to reference.
            allow_multiple_reference?: boolean; // default: true
            reference_limit?: number | null; // Set to 0 to block referencing, null for no limit.
        };
        remove_bin?: BinaryFile[] | string[]; // Removes bin data from the record.
        progress: ProgressCallback; // Progress callback function. Usefull when uploading files.
    };
): Promise<RecordData>
```

See [RecordData](/api-reference/data-types/README.md#recorddata)

## getRecords

```ts
getRecords(
    query: {
        record_id?: string; // When record ID is given, all other parameters are bypassed.
        
        /** When the table is given as a string value, the value is the table name. */
        table: string | {
            name: string,
            access_group?: number | 'private' | 'public' | 'authorized'; // 0 to 99 if using number. Default: 'public'
            subscription?: string; // User ID of the subscription (User being subscribed to)
        };

        /**
         * When record ID is given, it will fetch the records referencing the given record ID.
         * When user ID is given, it will fetch the records uploaded by the given user ID.
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
    record_id?: string | string[],
    table?: { // ignored if record_id is provided
        name: string;
        access_group?: number | 'private' | 'public' | 'authorized'; // Default = 'public'
        subscription?: boolean; // Delete records in subscription table if true. Default = false
    };
}): Promise<string>
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