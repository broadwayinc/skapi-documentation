# Connecting to Realtime

Skapi's realtime connection let's you transfer JSON data between users in realtime.
This is useful for creating chat applications, notifications, etc.

## Creating Connection

:::warning
User must be logged in to call this method
:::

Before you start sending realtime data, you must create a realtime connection.
You can create a realtime connection by calling [`connectRealtime()`](/api-reference/realtime/README.md#connectrealtime) method.

For more detailed information on all the parameters and options available with the [`connectRealtime()`](/api-reference/realtime/README.md#connectrealtime) method, 
please refer to the API Reference below:

### [`connectRealtime(RealtimeCallback): Promise<WebSocket>`](/api-reference/realtime/README.md#connectrealtime)

Once the connection is established, you can start receiving realtime data from the [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback).

```js
let RealtimeCallback = (rt) => {
    // Callback executed when there is data transfer between the users.
    /**
    rt = {
      type: 'message' | 'error' | 'success' | 'close' | 'notice' | 'private' | 'reconnect' | 'rtc:incoming' | 'rtc:closed';
      message?: any;
      connectRTC?: (params: RTCReceiverParams, callback: RTCEvent) => Promise<RTCResolved>; // Incoming RTC
      hangup?: () => void; // Reject incoming RTC connection.
      sender?: string; // user_id of the sender
      sender_cid?: string; // scid of the sender
      sender_rid?: string; // group of the sender
      code?: 'USER_LEFT' | 'USER_DISCONNECTED' | 'USER_JOINED' | null; // code for notice messages
      connectRTC?: (params: RTCReceiverParams, callback: RTCEvent) => Promise<RTCResolved>; // Incoming RTC calls.
      hangup?: () => void; Function to reject incoming RTC commection.
    }
    */
    console.log(rt);
}

skapi.connectRealtime(RealtimeCallback);
```

In the example above, the [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback) function is executed whenever data is transferred between users.

When the callback runs, it receives a message object with the following properties:

- `type` Shows the type of the received message as below:
  
  - "message": When there is data broadcasted from the realtime group.

  - "error": When there is an error. Usually websocket connection has an error and will be disconnected.

  - "success": When the connection is established. This may fire on initial connection, or when the reconnection attempt is successful.

  - "close": When the connection is intentionally closed by the user.

  - "notice": When there is a notice. Usually notice users when the user in a realtime group has joined, left, or being disconnected.

  - "private": When there is private data transfer between the users.

  - "reconnect": When there is reconnection attempt. This happens after user leaves the browser tab or device screen is lock for certain amount of time, and the user comes back to the application. The websocket can disconnect when the application is left unfocus for some period of time.
  
  - "rtc:incoming": When there is incoming WebRTC call.
  - "rtc:closed": When the WebRTC connection is closed.

- `message` is the data passed from the server. It can be any JSON data.
- `sender` is the user ID of the message sender. It is only available when `type` is "message" or "private".
- `sender_cid` is the connection ID of the message sender. It can be used to track the sender's connected device.
- `sender_rid` is the group name of the received message.
- `code` is a string identifier for notice messages.
- `connectRTC`: Incoming RTC calls. Can answer by executing the callback.
- `hangup`: Function to reject incoming RTC connection.
  
## Closing Connection

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

For more detailed information on all the parameters and options available with the [`closeRealtime()`](/api-reference/realtime/README.md#closerealtime) method, 
please refer to the API Reference below:

### [`closeRealtime(): Promise<void>`](/api-reference/realtime/README.md#closerealtime)

:::tip
When the user closes the tab or refresh the browser, the connection will be closed automatically.
And when the connection is closed user will be removed from the group.
:::