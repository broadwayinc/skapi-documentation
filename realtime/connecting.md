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

### [`connectRealtime(RealtimeCallback): Promise<WebSocket | void>`](/api-reference/realtime/README.md#connectrealtime)

Once the connection is established, you can start receiving realtime data from the [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback).

On the initial connection, the returned promise resolves to `undefined` rather than the socket. The `WebSocket` is delivered through the [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback).

```js
let RealtimeCallback = (rt) => {
    // Callback executed when there is data transfer between the users.
    /**
    rt = {
      type: 'message' | 'error' | 'success' | 'close' | 'notice' | 'private' | 'reconnect' | 'rtc:incoming' | 'rtc:closed';
      message?: any;
      connectRTC?: (params: RTCReceiverParams, callback: (e: RTCEvent) => void) => Promise<RTCResolved>; // Accept incoming RTC calls.
      hangup?: () => void; // Reject incoming RTC connection.
      sender?: string; // user_id of the sender
      sender_cid?: string; // scid of the sender
      sender_rid?: string; // group of the sender
      code?: 'USER_LEFT' | 'USER_DISCONNECTED' | 'USER_JOINED' | null; // code for notice messages
    }
    */
    console.log(rt);
};

skapi.connectRealtime(RealtimeCallback);
```

In the example above, the [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback) function is executed whenever data is transferred between users.

When the callback runs, it receives a message object with the following properties:

-   `type` Shows the type of the received message as below:

    -   "message": When there is data broadcasted from the realtime group.

    -   "error": When there is an error. Usually websocket connection has an error and will be disconnected.

    -   "success": When the connection is established. This may fire on initial connection, or when the reconnection attempt is successful.

    -   "close": When the connection is intentionally closed by the user.

    -   "notice": When there is a notice. Usually notice users when the user in a realtime group has joined, left, or being disconnected.

    -   "private": When there is private data transfer between the users.

    -   "reconnect": When there is reconnection attempt. The websocket can disconnect when the network drops, or when the application is left unfocused for some period of time (the user leaves the browser tab, or the device screen is locked). The SDK reopens it by itself: an attempt after 3 seconds, then after 6, 12, 24 and at most 30 seconds between attempts, for as long as the page is open and the user is signed in, and at once when the user comes back to the tab. Each attempt is announced with "reconnect" and a successful one with "success". A WebRTC call that is up goes on meanwhile; see [A dropped connection](/realtime/webRTC.md#a-dropped-connection).

    -   "rtc:incoming": When there is incoming WebRTC call.
    -   "rtc:closed": When the WebRTC connection is closed.

-   `message` is the data passed from the server. It can be any JSON data.
-   `sender` is the user ID of the message sender. It is available when `type` is "message", "private", or "notice". For "notice" events it carries the user ID of the user who joined, left, or was disconnected.
-   `sender_cid` is the connection ID of the message sender. It can be used to track the sender's connected device.
-   `sender_rid` is the group name of the received message.
-   `code` is a string identifier for notice messages.
-   `connectRTC`: Function to accept an incoming RTC call. Pass a callback to receive `RTCEvent` updates.
-   `hangup`: Function to reject incoming RTC connection.

## Staying Connected

A connection that closes on its own (the network dropped, the device slept) is reopened by the SDK without any call from your code: the first attempt 3 seconds later, then after 6, 12 and 24 seconds, then every 30 seconds, for as long as the page is open and the user is signed in, and at once when the user returns to the tab. The group the user was in is joined again by itself. The user stays signed in through the outage: a token refresh that gets no answer leaves the session as it is (see [Auto Login](/authentication/login-logout.md#auto-login)).

Your callback hears about it, so the page can say what is going on:

```js
let online = true;

let RealtimeCallback = (rt) => {
    switch (rt.type) {
        case 'reconnect':
            // the connection dropped; an attempt to reopen it follows. One message per attempt.
            if (online) {
                online = false;
                status.textContent = 'Connection lost. Reconnecting...';
            }
            break;

        case 'success':
            // the connection is open: the first time, and after every successful attempt
            if (!online) {
                online = true;
                status.textContent = '';
                // who is in the group may have changed meanwhile: read the list again
                skapi.getRealtimeUsers({ group: currentGroup }).then(renderUsers);
            }
            break;

        case 'error':
            // "Skapi: WebSocket unexpected close." comes once per drop, before the first 'reconnect'
            if (!/unexpected close/.test(rt.message)) console.error(rt.message);
            break;
    }
};
```

A message posted while the connection is down is not queued: `postRealtime()` throws, and the page should keep it until `success` comes back. After a reconnect the server gives the connection a new connection id (`sender_cid` on the messages others receive from this user); a WebRTC call that was up goes on across it, see [A dropped connection](/realtime/webRTC.md#a-dropped-connection).

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
