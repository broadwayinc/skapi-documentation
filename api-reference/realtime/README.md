# API Reference: Realtime Connection

## connectRealtime

```ts
connectRealtime(cb: RealtimeCallback): Promise<WebSocket>
```

See [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback)

#### Errors
```ts
{
  code: 'INVALID_REQUEST';
  message: "Callback must be a function.";
}
|
{
  code: 'ERROR';
  message: "Skapi: WebSocket connection error.";
}
```

## postRealtime

```ts
postRealtime(
    message: SubmitEvent | any,
    recipient: string // User's ID or a group name
): Promise<{ type: 'success', message: 'Message sent.' }>
```

#### Errors
```ts
{
  code: 'INVALID_REQUEST';
  message: "No realtime connection. Execute connectRealtime() before this method.";
}
|
{
  code: 'INVALID_REQUEST';
  message: "User has not joined to the recipient group. Run joinRealtime('...')";
}
|
{
  code: 'INVALID_REQUEST';
  message: "Realtime connection is not open. Try reconnecting with connectRealtime().";
}
```

## joinRealtime

```ts
joinRealtime(SubmitEvent | params: {
    group: string, // Group name
}
): Promise<{ type: 'success', message: string }>
```

#### Errors
```ts
{
  code: 'INVALID_REQUEST';
  message: "No realtime connection. Execute connectRealtime() before this method.";
}
```

## getRealtimeGroups

```ts
getRealtimeGroups(SubmitEvent | params?: {
        searchFor: 'group' | 'number_of_users';
        value?: string | number; // Group name or number of users
        condition?: '>' | '>=' | '=' | '<' | '<=' | '!=' | 'gt' | 'gte' | 'eq' | 'lt' | 'lte' | 'ne';
        range?: string | number | boolean; // Cannot be used with condition.
    } | null,
    fetchOptions?: FetchOptions
): Promise<DatabaseResponse<{ group: string; number_of_users: number; }>>
```

## getRealtimeUsers

```ts
getRealtimeUsers(SubmitEvent | params?: {
        group: string; // Group name
        user_id?: string; // User ID in the group
    },
    fetchOptions?: FetchOptions
): Promise<DatabaseResponse<{ user_id:string; connection_id:string; }[]>>
```

See [FetchOptions](/api-reference/data-types/README.md#fetchoptions)

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)


## closeRealtime
    
```ts
closeRealtime(): Promise<void>
```