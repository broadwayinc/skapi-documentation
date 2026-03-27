# API Reference: Realtime Connection

Below are the parameters and return data type references for the methods in TypeScript format.

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
    recipient: string, // User's ID or a group name
    notification?: {
      title: string;
      body: string;
      config?: {
        always: boolean; // When true, notification will always trigger the receiver's device regardless their connection state.
      }
    }
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
joinRealtime(params: {
  group: string | null, // Group name, or null to leave group
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
getRealtimeGroups(params?: {
        searchFor: 'group' | 'number_of_users';
  value: string | number; // Group name or number of users
        condition?: '>' | '>=' | '=' | '<' | '<=' | '!=' | 'gt' | 'gte' | 'eq' | 'lt' | 'lte' | 'ne';
  range?: string | number; // Cannot be used with condition.
    } | null,
    fetchOptions?: FetchOptions
): Promise<DatabaseResponse<{ group: string; number_of_users: number; }>>
```

## getRealtimeUsers

```ts
getRealtimeUsers(params: {
        group: string; // Group name
        user_id?: string; // User ID in the group
    },
    fetchOptions?: FetchOptions
): Promise<DatabaseResponse<{ user_id:string; cid:string; }[]>>
```

See [FetchOptions](/api-reference/data-types/README.md#fetchoptions)

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)


## closeRealtime
    
```ts
closeRealtime(): Promise<void>
```

## connectRTC

```ts
connectRTC(
  params: {
    cid: string;
    ice?: string;
    media?: {
      video: boolean;
      audio: boolean;
    } | MediaStream | MediaStreamConstraints;
    channels?: Array<RTCDataChannelInit | 'text-chat' | 'file-transfer' | 'video-chat' | 'voice-chat' | 'gaming'>;
  },
  callback?: (e: RTCEvent) => void
): Promise<RTCConnector>
```

See [RTCConnector](/api-reference/data-types/README.md#rtcconnector)

See [RTCEvent](/api-reference/data-types/README.md#rtcevent)

#### Errors
```ts
{
  code: 'DEVICE_NOT_FOUND';
  message: "Requested media device not found.";
}
|
{
  code: 'INVALID_REQUEST';
  message: 'Data channel with the protocol "{protocol name}$" already exists.';
}
```

## vapidPublicKey

```ts
vapidPublicKey(): Promise<{ VAPIDPublicKey: string }>
```

## subscribeNotification

```ts
subscribeNotification({
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  }
}): Promise<'SUCCESS: Subscribed to receive notifications.'>
```

## unsubscribeNotification

```ts
unsubscribeNotification({
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  }
}): Promise<'SUCCESS: Unsubscribed from notifications.'>
```

## pushNotification

```ts
pushNotification({
  params: {
    title: string;
    body: string;
  },
  user_ids?: string | string[]
}): Promise<"SUCCESS: Notification sent.">
```