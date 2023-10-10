
# Subscription

Skapi database provides subscription access level in its table.
Records uploaded with subscription access level requires users to subscribe to the uploader to have access to the records.

You can let users upload records with the subscription access by setting the `table.subscription` to `true`:

Lets assume **user 'A'** uploads a record in table 'Posts' with subscription access level.

```js
// User 'A' uploads record in subscription table.
skapi.postRecord(null, {
  table: {
    name:'Posts',
    subscription: true
}})
```

To allow other users to access the records that requires subscription, they must first subscribe to the uploader using the [`subscribe()`](/api-reference/database/README.md#subscribe) method:

### [`subscribe(option): Promise<string>`](/api-reference/database/README.md#subscribe)

:::warning
User must be logged in to call this method
:::

Lets assume **user 'B'** is logged in and, **user 'B'** is subscribing to **user 'A'**.

```js
// User 'B' subscribes to user 'A' to subscription group 5.
skapi.subscribe({
  user_id: 'user_id_of_user_A'
})
```

Once the **user 'B'** has subscribed to **user 'A'**,
**user 'B'** will have access to the records in that requires subscription access.

```js
// User 'B' can get records that requires subscription access of user 'A'
skapi.getRecords({
  table: {
    name: 'Posts',
    subscription: 'user_id_of_user_A'
  }
}).then(response => {
    console.log(response.list); // All posts user 'A' uploaded to table 'Posts' in subscription access level.
});
```

:::tip
Number of subscribers of the user will be tracked in [UserPublic](/api-reference/data-types/README.md#userpublic) object
that can be retrieved using the [`getUsers()`](/api-reference/database/README.md#getusers) method.
:::

:::danger Warning
- Do not rely subscription access level as a security restriction.
  Anyone can subscribe to anybody to any subscription group.
  Consider subscription group as a additional layer of database query point that user needs additional action(subscribe) to have access.

- The files uploaded to the records are not security restricted to the subscription group.
  Files uploaded to the records are only restricted to the user's access group.
:::

### Unsubscribing

### [`unsubscribe(option): Promise<User | string>`](/api-reference/database/README.md#unsubscribe)

:::warning
User must be logged in to call this method
:::

Users can unsubscribe from the users they have subscribed to using the [`unsubscribe()`](/api-reference/database/README.md#unsubscribe) method.

```js
// User 'B'
skapi.unsubscribe({
    user_id: 'user_id_of_user_A'
})
```

:::warning
When unsubscribed, subscription information may need some time to be updated. (Usually almost immediate)
:::


## Blocking and Unblocking Subscribers

Main benifit of subscription access level is that users can block certain users from accessing their subscription level records.
But as metioned above, subscription access level is not meant to be used as a security restriction.

Even when user has blocked certain users, they still have access to the files attached to the records since the file access level is not restricted to the subscription access.

Other than files, blocked users will not have access to any of the record data in the subscription access level.

### [`blockSubscriber(option): Promise<string>`](/api-reference/database/README.md#blocksubscriber)
### [`unblockSubscriber(option): Promise<string>`](/api-reference/database/README.md#unblocksubscriber)

:::warning
User must be logged in to call this method
:::

Users can block certain users from their subscription groups.
If the user is blocked from a subscription group, they will not have access to the records in that group.

To block a subscriber, user can call the [`blockSubscriber()`](/api-reference/database/README.md#blocksubscriber) method:

### Blocking a Subscriber

```js
// User 'A' blocks user 'B' from accessing all subscription group records.
skapi.blockSubscriber({
    user_id: 'user_id_of_user_B'
}).then(res=>{
    // User 'B' no longer have access to user A's subscription group records.
})
```

To unblock a subscriber, use the [`unblockSubscriber()`](/api-reference/database/README.md#unblocksubscriber) method:

### Example: Unblocking a Subscriber

```js
// User 'A' unblocks user 'B' from all subscription group.
skapi.unblockSubscriber({
    user_id: 'user_id_of_user_B'
}).then(res=>{
    // User 'B' now has access to user A's subscription group records.
})
```


## Listing subscriptions

### [`getSubscriptions(params, fetchOptions?): Promise<DatabaseResponse>`](/api-reference/database/README.md#getsubscriptions)

The [`getSubscriptions()`](/api-reference/database/README.md#getsubscriptions) method retrieves subscription information from the database.

### params:
- `subscriber`: The user ID of the subscriber.
- `subscription`: The user ID of the uploader.
- `blocked`: Set to `true` to only retrieve blocked subscriptions.

Either the `params.subscriber` or `params.subscription` value must be provided.

### Examples

```js
/**
 * Retrieve all subscription information where userA is the subscriber
 */
skapi.getSubscriptions({
  subscriber: "userA_user_id"
}).then((response) => {
  console.log(response.list);
});

/** 
 * Retrieve all subscription information where userB is being subscribed to
 */
skapi.getSubscriptions({
  subscription: "userB_user_id"
}).then((response) => {
  console.log(response.list);
});

/** 
 * Check if userA is subscribed to userB
 */
skapi.getSubscriptions({
  subscriber: "userA_user_id",
  subscription: "userB_user_id"
}).then((response) => {
  console.log(response.list?.[0]);
});
```
