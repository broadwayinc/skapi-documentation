# Sending Realtime Data

Once the realtime connection is established, users can start sending realtime data to other users.

## Sending Data to a User

### [`postRealtime(message, recipient): Promise<{ status: 'success', message: string }>`](/api-reference/realtime/README.md#postrealtime)

User can send any JSON data over to any users by using [`postRealtime()`](/api-reference/realtime/README.md#postrealtime) method.

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

Example above shows how to send realtime data to a user with an id: 'recipient_user_id' (Should be a real user_id that you see in user profiles).

[`postRealtime()`](/api-reference/realtime/README.md#postrealtime) method can be used directly from the form element as shown in the example above.
[`postRealtime()`](/api-reference/realtime/README.md#postrealtime) takes two arguments:
- `message`: The data to be sent to the recipient. It can be any JSON parsable data, or a SubmitEvent object.
- `recipient`: The user ID of the recipient.

When the message is sent successfully, the method will return the following object:
```ts
{
  status: 'success',
  message: 'Message sent.'
}
```

On the receiver's side, the message will be received as an argument as an object with `status` and `message` properties through the [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback) that has been set when creating the realtime connection via [`connectRealtime()`](/api-reference/realtime/README.md#connectrealtime) method.
 