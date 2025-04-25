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
connectRTC({
    cid: string; // Client id of the opponent
    ice?: string; // stun:your.stun.server:3468 (optional)
    media?: {
        video: boolean; // When true, video will be streamed
        audio: boolean; // When true, audio will be streamed
    } | MediaStream; // MediaStream object can be used
    channels?: Array<{
        ordered: 'boolean',
        maxPacketLifeTime: 'number',
        maxRetransmits: 'number',
        protocol: 'string'
    } | "text-chat" | "file-transfer" | "video-chat" | "voice-chat" | "gaming">; // Can create data channels with optimal setting for given task
}): Promise<RTCConnector>
```

See [RTCConnector](/api-reference/data-types/README.md#rtcconnector)

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
    params: {
        endpoint: string; // The endpoint URL for the device to subscribe to notifications.
        keys: {
            p256dh: string; // The encryption key to secure the communication channel.
            auth: string; // The authentication key to authenticate the subscription.
        };
    }
}): Promise<'SUCCESS: Subscribed to receive notifications.'>
```

## unsubscribeNotification

```ts
unsubscribeNotification({
    params: {
        endpoint: string; // The endpoint URL for the device to unsubscribe from notifications.
        keys: {
            p256dh: string; // The encryption key to secure the communication channel.
            auth: string; // The authentication key to authenticate the unsubscription.
        };
    }
}): Promise<'SUCCESS: Unsubscribed from notifications.'>
```

## pushNotification

```ts
pushNotification({
    params: {
        {
            title: string; // The title of the notification.
            body: string; // The body content of the notification.
        },
        user_ids?: string | string[]; // Optional parameter to specify the user(s) for whom to send the notification.
    }
}): Promise<"SUCCESS: Notification sent.">
```