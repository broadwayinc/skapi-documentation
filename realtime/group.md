# Realtime Groups

Realtime groups are used to send realtime data to multiple users at once.
This can be used to create group chats, group notifications, etc.

## Joining a Group

Users can join a group by calling [`joinRealtime()`](/api-reference/realtime/README.md#joinrealtime) method.

params argument takes the following parameters:
- `group`: The name of the group to join.

Group name can be anything you want.
If the group does not exist, it will be created automatically, otherwise the user will be joined to the existing group.

```js
skapi.joinRealtime({ group: 'HelloWorld' }).then(res => {
    console.log(res.message) // Joined realtime message group: "HelloWorld".
});
```

When the user is joined to the group successfully, the method will return the following object:

```ts
{
  type: 'success',
  message: 'Joined realtime message group: "HelloWorld"'.
}
```
For more detailed information on all the parameters and options available with the [`joinRealtime()`](/api-reference/realtime/README.md#joinrealtime) method, 
please refer to the API Reference below:

### [`joinRealtime(params): Promise<{ type: 'success', message: string }>`](/api-reference/realtime/README.md#joinrealtime)

:::tip
Even if the user has joined the group, they can still receive realtime data sent individually to them.
:::

## Sending Data to a Group

Once the user have joined the group, user can send any JSON data over to a group by using [`postRealtime()`](/api-reference/realtime/README.md#postrealtime) method.
Any users in the group will receive the data.

The example below shows how to send realtime data to a group named "HelloWorld":

::: code-group

```html [Form]
<form onsubmit="skapi.postRealtime(event, 'HelloWorld').then(u=>console.log(u))">
    <input name="msg" required><input type="submit" value="Send">
</form>
```

```js [JS]
skapi.postRealtime({ msg: "Hello World!" }, 'HelloWorld').then(res => console.log(res));
```
:::

For more detailed information on all the parameters and options available with the [`postRealtime()`](/api-reference/realtime/README.md#postrealtime) method, 
please refer to the API Reference below:

### [`postRealtime(message, recipient): Promise<{ type: 'success', message: string }>`](/api-reference/realtime/README.md#postrealtime)

:::warning
The user must be joined to the group to send data to the group.
:::

## Leaving, Changing Groups

Users can join only one group at a time.
If you want your user to change groups, you can call [`joinRealtime()`](/api-reference/realtime/README.md#joinrealtime) method with a different `params.group` value.

Also, if you want to leave the group, you can call [`joinRealtime()`](/api-reference/realtime/README.md#leaverealtime) method with a `params.group` value as empty `string` or `null`.


## Listing Groups

Users can get a list of realtime groups by calling [`getRealtimeGroups()`](/api-reference/realtime/README.md#getrealtimegroups) method.

Example below shows listing all groups existing in your service:

```js
skapi.getRealtimeGroups().then(res => {
    console.log(res.list) // [{ group: 'HelloWorld', number_of_users: 1 }, ...]
});
```

You can search groups by the name.
Below example shows how to search group names that start with "Hello":

```js
skapi.getRealtimeGroups({ searchFor: 'group', value: 'Hello', condition: '>=' }).then(res => {
    console.log(res.list) // [{ group: 'HelloWorld', number_of_users: 1 }, ...]
});
```

You can also list groups that have more than 10 users:

```js
skapi.getRealtimeGroups({ searchFor: 'number_of_users', value: 10, condition: '>=' }).then(res => {
    console.log(res.list) // [{ group: 'HelloUniverse', number_of_users: 11 }, ...]
});
```

For more detailed information on all the parameters and options available with the [`getRealtimeGroups()`](/api-reference/realtime/README.md#getrealtimegroups) method, 
please refer to the API Reference below:

### [`getRealtimeGroups(params?, fetchOptions?): Promise<DatabaseResponse<{ group: string; number_of_users: number; }>>`](/api-reference/realtime/README.md#getrealtimegroups)

## Listing Users in a Group

Users can get a list of users in a group by calling [`getRealtimeUsers()`](/api-reference/realtime/README.md#getrealtimeusers) method.

Example below shows listing all users in the "HelloWorld" group:

```js
skapi.getRealtimeUsers({ group: 'HelloWorld' }).then(res => {
    console.log(res.list) // [{user_id: 'user_a', cid: 'user_cid'}, ...]
});
```

You can also search users in the group by their user ID.
This is useful if you want to check if the user is in the group.

```js
skapi.getRealtimeUsers({ group: 'HelloWorld', user_id: 'user_a' }).then(res => {
    console.log(res.list) // [{user_id: 'user_a', cid: 'user_cid'}]
});
```
For more detailed information on all the parameters and options available with the [`getRealtimeUsers()`](/api-reference/realtime/README.md#getrealtimeusers) method, 
please refer to the API Reference below:

### [`getRealtimeUsers(params, fetchOptions?): Promise<DatabaseResponse<{ user_id:string; connection_id:string; }[]>>`](/api-reference/realtime/README.md#getrealtimeusers)