
# Subscription

:::warning
User must be logged in to call this method
:::

Skapi database provides subscription feature.

Records uploaded with subscription group requires users to subscribe to the uploader to have access to the records.

You can let users upload records with the subscription group number by setting `table.subscription.group`.

When user uploads a record with subscription group, other users must subscribe to the uploader to have access to the records.

Subscription feature can useful when you are building a social media platform, blog, etc.

With the subscription feature, user can also block certain users from accessing their subscription group records.

It can be used to track the number of subscribers of the user, feed, notify mass users, etc.

Lets assume **user 'A'** uploads a record in table 'Posts' with subscription group 1.

```js
// User 'A' uploads record in subscription table.
skapi.postRecord(null, {
  table: {
    name:'Posts',
    access_group: 'authorized',
    subscription: {
      group: 1
    }
}})
```

:::warning
Since user needs to login to subscribe to other users, the `table.access_group` cannot be set to `public` when uploading subscription records.
:::

To allow other users to access the records that requires subscription, they must first subscribe to the uploader using the [`subscribe()`](/api-reference/database/README.md#subscribe) method:

### [`subscribe(option): Promise<string>`](/api-reference/database/README.md#subscribe)

Lets assume **user 'B'** wants to access **user 'A'**s subscription record, **user 'B'** will need to subscribe to **user 'A'**.

```js
// User 'B' subscribes to user 'A' to subscription group 1.
skapi.subscribe({
  user_id: 'user_id_of_user_A',
  group: 1
})
```

Subsciprtion group number can range from 1 to 99.

Once the **user 'B'** has subscribed to **user 'A'**,
**user 'B'** can now have access to the records in that subscription group.

```js
// User 'B' can get records that requires group 1 subscription of user 'A'
skapi.getRecords({
  table: {
    name: 'Posts',
    access_group: 'authorized',
    subscription: {
      user_id: 'user_id_of_user_A',
      group: 1
    }
  }
}).then(response => {
    console.log(response.list); // All posts user 'A' uploaded to table 'Posts' in subscription group 1.
});
```

:::tip
Number of subscribers of the user will be tracked in [UserPublic](/api-reference/data-types/README.md#userpublic) object
that can be retrieved using the [`getUsers()`](/api-reference/database/README.md#getusers) method.
:::

:::danger Warning
- Do not rely on subscription access level as a security restriction.
  Anyone can subscribe to anybody to any subscription group.
  Consider subscription group as a additional layer of database query point that user needs additional action(subscribe) to have access.

  The main purpose of subscription record is to give user access to block certain users from accessing their subscription group records,
  also able to feed, notify mass users, etc.

- The files uploaded to the records are not security restricted to the subscription group.
  Files uploaded to the records are only restricted to the user's access group.
:::


### Unsubscribing

:::warning
User must be logged in to call this method
:::

Users can unsubscribe from the subscription group 1 they have subscribed to using the [`unsubscribe()`](/api-reference/database/README.md#unsubscribe) method.

```js
// User 'B'
skapi.unsubscribe({
    user_id: 'user_id_of_user_A',
    group: 1
})
```
For more detailed information on all the parameters and options available with the [`unsubscribe()`](/api-reference/database/README.md#unsubscribe) method, 
please refer to the API Reference below:

### [`unsubscribe(option): Promise<User | string>`](/api-reference/database/README.md#unsubscribe)

:::warning
When unsubscribed, subscription information may need some time to be updated. (Usually almost immediate)
:::


## Blocking and Unblocking Subscribers

:::warning
User must be logged in to call this method
:::

One of the benifit of subscription feature is that users can block certain users from accessing their subscription level records.
But as metioned above, subscription is not meant to be used as a security restriction.

Even when user has blocked certain users, they still have access to the files attached to the records since the file access level is not restricted to the subscription access unless it's private or higher access group than the accessing user.

Other than files, blocked users will not have access to any of the record data in the subscription access level.

To block a subscriber, user can call the [`blockSubscriber()`](/api-reference/database/README.md#blocksubscriber) method:

### Blocking a Subscriber

```js
// User 'A' blocks user 'B' from accessing all subscription group 1.
skapi.blockSubscriber({
    user_id: 'user_id_of_user_B',
    group: 1
}).then(res=>{
    // User 'B' no longer have access to user A's subscription group 1.
})
```

For more detailed information on all the parameters and options available with the [`blockSubscriber()`](/api-reference/database/README.md#blocksubscriber) method, 
please refer to the API Reference below:

### [`blockSubscriber(option): Promise<string>`](/api-reference/database/README.md#blocksubscriber)


### Unblocking a Subscriber

```js
// User 'A' unblocks user 'B' from subscription group 1.
skapi.unblockSubscriber({
    user_id: 'user_id_of_user_B',
    group: 1
}).then(res=>{
    // User 'B' now has access to user A's subscription group 1.
})
```
For more detailed information on all the parameters and options available with the [`unblockSubscriber()`](/api-reference/database/README.md#unblocksubscriber) method, 
please refer to the API Reference below:

### [`unblockSubscriber(option): Promise<string>`](/api-reference/database/README.md#unblocksubscriber)

## Listing subscriptions

The [`getSubscriptions()`](/api-reference/database/README.md#getsubscriptions) method retrieves subscription information from the database.

### params:
- `subscriber`: The user ID of the subscriber.
- `subscription`: The user ID of the uploader and the subscription group.
- `blocked`: Set to `true` to only retrieve blocked subscriptions.

Either the `params.subscriber` or `params.subscription` value must be provided.

### Examples

```js
/**
 * Retrieve all subscription information where userB is the subscriber
 */
skapi.getSubscriptions({
  subscriber: "userB_user_id"
}).then((response) => {
  console.log(response.list);
});

/** 
 * Retrieve all subscription information where userA is being subscribed to
 */
skapi.getSubscriptions({
  subscription: "userA_user_id"
}).then((response) => {
  console.log(response.list);
});

/**
 * Check if userB is subscribed to userA
 */
skapi.getSubscriptions({
  subscriber: "userB_user_id",
  subscription: "userA_user_id"
}).then((response) => {
  console.log(response.list?.[0]);
});
```
For more detailed information on all the parameters and options available with the [`getSubscriptions()`](/api-reference/database/README.md#getsubscriptions) method, 
please refer to the API Reference below:

### [`getSubscriptions(params, fetchOptions?): Promise<DatabaseResponse<RecordData>>`](/api-reference/database/README.md#getsubscriptions)

## Getting Feed

The [`getFeed()`](/api-reference/database/README.md#getfeed) method retrieves the feed of the user.

This method retrieves all the records that the user has ever subscribed to.

You can use this method to build a feed page for the user.

### Examples

```js
/**
 * Retrieve all feed of userB
 */
skapi.getFeed().then((response) => {
  console.log(response.list); // all records that userB has ever subscribed to.
});
```

### [`getFeed(fetchOptions?): Promise<DatabaseResponse<RecordData>>`](/api-reference/database/README.md#getfeed)