# Subscription

## Posting Feeds

Skapi database provides a subscription feature.

The subscription feature is useful when you want users to subscribe to certain users and fetch feeds from their subscriptions.

With the subscription feature, the uploader can also restrict certain users from accessing specific posts uploaded to the subscription table.

You can let users upload records to the subscription table by setting `table.subscription.is_subscription_record` to `true` in [`postRecord()`](/api-reference/database/README.md#postrecord) parameters.

When `table.subscription.upload_to_feed` is set to `true`, subscribed users can later fetch all the feeds from all the users they are subscribed to at once using the [`getFeed()`](/api-reference/database/README.md#getfeed) method.

The subscription feature is useful when building a social media platform where users can follow each other's content and fetch their feeds.

With the subscription feature, users can also block certain users from accessing their subscription group records.

The subscription feature can track subscriber counts, manage feeds, and send mass notifications, etc.

Let's assume **user 'A'** uploads a record in table 'Posts' with subscription group 1.

```js
// User 'A' uploads record in subscription table.
skapi.postRecord(null, {
    table: {
        name: "Posts",
        access_group: "authorized",
        subscription: {
            is_subscription_record: true
        },
    },
});
```

To allow other users to access records that require a subscription, they must first subscribe to the uploader using the [`subscribe()`](/api-reference/database/README.md#subscribe) method:

:::warning
Subscribers will not get feeds that are posted prior to the subscription.
:::

:::warning
Anonymous (unsigned) users cannot create subscription records.
:::

## Subscribing

:::warning
User must be logged in to call this method.
:::

Let's assume **user 'B'** wants to access **user 'A'**'s subscription records. **User 'B'** will need to subscribe to **user 'A'**.

```js
// User 'B' subscribes to user 'A'.
skapi.subscribe({
    user_id: "user_id_of_user_A",
    get_feed: true, // Required to enable the get_feed method
});
```

:::tip
To use the [`getFeed()`](/database/subscription.html#getting-feed) method later, be sure to include the parameter `get_feed: true` shown in [`subscribe(option): Promise<string>`](/api-reference/database/README.md#subscribe)
:::

Once the **user 'B'** has subscribed to **user 'A'**,
**user 'B'** can now have access to the records in that subscription table.

```js
// User 'B' now can get records that requires subscription of user 'A'
skapi
    .getRecords({
        table: {
            name: "Posts",
            access_group: "authorized",
            subscription: "user_id_of_user_A",
        },
    })
    .then((response) => {
        console.log(response.list); // All posts user 'A' uploaded to table 'Posts' in subscription group 1.
    });
```

:::tip
The number of subscribers for a user is tracked in the [UserPublic](/api-reference/data-types/README.md#userpublic) object,
which can be retrieved using the [`getUsers()`](/api-reference/database/README.md#getusers) method.
:::

:::danger
`table.subscription.upload_to_feed` should be set to `true` for record to show up in subscription table.
:::

### [`subscribe(option): Promise<Subscription>`](/api-reference/database/README.md#subscribe)

## Unsubscribing

:::warning
User must be logged in to call this method.
:::

Users can unsubscribe from subscription group 1 using the [`unsubscribe()`](/api-reference/database/README.md#unsubscribe) method.

```js
// User 'B'
skapi.unsubscribe({
    user_id: "user_id_of_user_A",
});
```

For more detailed information on all the parameters and options available with the [`unsubscribe()`](/api-reference/database/README.md#unsubscribe) method,
please refer to the API Reference below:

### [`unsubscribe(option): Promise<string>`](/api-reference/database/README.md#unsubscribe)

:::warning
After unsubscribing, subscription information may need some time to update (usually almost immediate).
:::

## Blocking and Unblocking Subscribers

:::warning
User must be logged in to call this method.
:::

One of the benefits of the subscription feature is that users can block certain users from accessing their subscription-level records.
But, as mentioned above, subscriptions are not meant to be used as a security restriction.

Even when a user has blocked certain users, those users still have access to files attached to the records, since file access is not restricted by subscription unless the file is private or uses a higher access group than the accessing user.

Other than files, blocked users will not have access to any record data at the subscription access level.

To block a subscriber, user can call the [`blockSubscriber()`](/api-reference/database/README.md#blocksubscriber) method:

### Blocking a Subscriber

```js
// User 'A' blocks user 'B' from accessing all subscription group 1.
skapi
    .blockSubscriber({
        user_id: "user_id_of_user_B",
    })
    .then((res) => {
        // User 'B' no longer have access to user A's subscription group 1.
    });
```

For more detailed information on all the parameters and options available with the [`blockSubscriber()`](/api-reference/database/README.md#blocksubscriber) method,
please refer to the API Reference below:

### [`blockSubscriber(option): Promise<string>`](/api-reference/database/README.md#blocksubscriber)

### Unblocking a Subscriber

```js
// User 'A' unblocks user 'B' from subscription group 1.
skapi
    .unblockSubscriber({
        user_id: "user_id_of_user_B",
    })
    .then((res) => {
        // User 'B' now has access to user A's subscription group 1.
    });
```

For more detailed information on all the parameters and options available with the [`unblockSubscriber()`](/api-reference/database/README.md#unblocksubscriber) method,
please refer to the API Reference below:

### [`unblockSubscriber(option): Promise<string>`](/api-reference/database/README.md#unblocksubscriber)

## Listing subscriptions

The [`getSubscriptions()`](/api-reference/database/README.md#getsubscriptions) method retrieves subscription information from the database.

### params:

-   `subscriber`: The user ID of the subscriber.
-   `subscription`: The user ID of the uploader and the subscription group.
-   `blocked`: Set to `true` to only retrieve blocked subscriptions.

Either the `params.subscriber` or `params.subscription` value must be provided.

### Examples

```js
/**
 * Retrieve all subscription information where user 'B' is the subscriber
 */
skapi
    .getSubscriptions({
        subscriber: "userB_user_id",
    })
    .then((response) => {
        console.log(response.list);
    });

/**
 * Retrieve all subscription information where user A is being subscribed to
 */
skapi
    .getSubscriptions({
        subscription: "userA_user_id",
    })
    .then((response) => {
        console.log(response.list);
    });

/**
 * Check if user 'B' is subscribed to user 'A'
 */
skapi
    .getSubscriptions({
        subscriber: "userB_user_id",
        subscription: "userA_user_id",
    })
    .then((response) => {
        console.log(response.list?.[0]);
    });
```

For more detailed information on all the parameters and options available with the [`getSubscriptions()`](/api-reference/database/README.md#getsubscriptions) method,
please refer to the API Reference below:

### [`getSubscriptions(params, fetchOptions?): Promise<DatabaseResponse<Subscription>>`](/api-reference/database/README.md#getsubscriptions)

## Getting Feed

The [`getFeed()`](/api-reference/database/README.md#getfeed) method retrieves the user's feed.

This method retrieves feed records from users the current user subscribes to.

You can use this method to build a feed page for the user.

### Examples

First, the user 'A' must upload a record as a feed.

```js
// User 'A' uploads record as a feed.
skapi.postRecord(null, {
  table: {
    name:'Posts',
    access_group: 'authorized',
    subscription: {
      upload_to_feed: true
    }
}})
```

Then user 'B', who is subscribed to user 'A', can fetch the uploaded feeds from users they subscribe to.

```js
/**
 * User 'B' Retrieves all feed of access_group: "authorized"
 */
skapi.getFeed({access_group: 'authorized'}).then((response) => {
  console.log(response.list); // Fetch all feed records in the 'authorized' access group from users userB subscribes to.
});
```

:::danger
If the record was NOT uploaded with `table.subscription.upload_to_feed` set to `true`, it will not show up in the feed.
:::

:::danger
When a user unsubscribes from another user, all past records from that user will no longer show in their feed.
:::

:::warning
Users only see feed records from the time they subscribed onward.
:::

### [`getFeed(params?, fetchOptions?): Promise<DatabaseResponse<RecordData>>`](/api-reference/database/README.md#getfeed)
