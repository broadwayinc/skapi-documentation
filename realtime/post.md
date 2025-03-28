# Sending Realtime Data

Once the realtime connection is established, users can start sending realtime data to another user.

## Sending Data to a User

User can send any JSON data over to any users by using [`postRealtime()`](/api-reference/realtime/README.md#postrealtime) method.

For more detailed information on all the parameters and options available with the [`postRealtime()`](/api-reference/realtime/README.md#postrealtime) method, 
please refer to the API Reference below:

### [`postRealtime(message, recipient, notification): Promise<{ type: 'success', message: string }>`](/api-reference/realtime/README.md#postrealtime)

:::warning
The receiver must also be connected to the realtime connection to receive the data.
:::

::: code-group

```html [Form]
<form onsubmit="skapi.postRealtime(event, 'recipient_user_id').then(u=>console.log(u))">
    <input name="msg" required><input type="submit" value="Send">
</form>
```

```js [JS]
skapi.postRealtime({ msg: "Hello World!" }, 'recipient_user_id').then(res => console.log(res));
```

:::

Example above shows how to send realtime data to a user with an id: 'recipient_user_id' (Should be the user_id of user's profile).

[`postRealtime()`](/api-reference/realtime/README.md#postrealtime) method can be used directly from the form element as shown in the example above.
[`postRealtime()`](/api-reference/realtime/README.md#postrealtime) takes two arguments:
- `message`: The data to be sent to the recipient. It can be any JSON parsable data, or a SubmitEvent object.
- `recipient`: The user ID of the recipient or the name of the group the user have joined.
- `notification`: Notification to send with the realtime message, or notification to use when user is not connected to realtime. See [`Sending Notifications`](/notification/send-notifications.html#sending-notifications)

When the message is sent successfully, the method will return the following object:
```ts
{
  type: 'success',
  message: 'Message sent.'
}
```

On the receiver's side, the message will be received as an argument as an object with `type` and `message` properties through the [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback) that has been set when creating the realtime connection via [`connectRealtime()`](/api-reference/realtime/README.md#connectrealtime) method.
