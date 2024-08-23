# Realtime Connection
Skapi's realtime connection let's you transfer JSON data between users in realtime.
This is useful for creating chat applications, notifications, etc.

## Creating Connection

### [`connectRealtime(RealtimeCallback): Promise<WebSocket>`](/api-reference/realtime/README.md#connectrealtime)

:::warning
User must be logged in to call this method
:::

Before you start sending realtime data, you must create a realtime connection.
You can create a realtime connection by calling [`connectRealtime()`](/api-reference/realtime/README.md#connectrealtime) method.

Once the connection is established, you can start receiving realtime data from the [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback).

```js
let RealtimeCallback = (rt) => {
    // Callback executed when there is data transfer between the users.
    /**
    rt = {
        type: 'message' | 'private' | 'error' | 'success' | 'close' | 'notice',
        message: '...',
        ...
    }
    */
    console.log(rt);
}

skapi.connectRealtime(RealtimeCallback);
```

In the example above, the [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback) function will be executed when there is data transfer between the users.

When the callback is executed, message will be passed as an object with `type` and `message` properties.

- `type` Shows the type of the received message as below:
  
  "message": When there is data transfer between the users.

  "private": When there is private data transfer between the users.
  
  "error": When there is an error.
  
  "success": When the connection is established.
  
  "close": When the connection is closed.
  
  "notice": When there is a notice.

- `message` is the data passed from the server. It can be any JSON data.
- `sender` is the user ID of the message sender. It is only available when `type` is "message" or "private".


## Closing Connection

### [`closeRealtime(): Promise<void>`](/api-reference/realtime/README.md#closerealtime)

You can close the realtime connection by calling [`closeRealtime()`](/api-reference/realtime/README.md#closerealtime) method.

```js
skapi.closeRealtime();
```

When the connection is successfully closed, [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback) will trigger with following callback data:

```ts
{
  type: 'close',
  message: 'WebSocket connection closed.'
}
```

:::tip
When the user closes the tab or refresh the browser, the connection will be closed automatically.
And when the connection is closed user will be removed from the group.
:::