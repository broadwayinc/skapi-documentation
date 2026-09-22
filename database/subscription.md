# Subscription

## Posting Feeds

Skapi database includes a subscription feature.

This feature lets users subscribe to other users and view feed records from those subscriptions.

Users can also block specific users from accessing their subscription-level records.

You can let users upload records to the subscription table by setting `table.subscription.is_subscription_record` to `true` in [`postRecord()`](/api-reference/database/README.md#postrecord) parameters.

When `table.subscription.upload_to_feed` is set to `true`, subscribed users can fetch feed records from all subscribed users at once using [`getFeed()`](/api-reference/database/README.md#getfeed).

### Subscription options overview

The `table.subscription` object controls how a record behaves for subscribers.

-   `is_subscription_record`: Marks the record as subscription-scoped. Subscribed users can retrieve these records with [`getRecords()`](/api-reference/database/README.md#getrecords) (using `table.subscription`).
-   `upload_to_feed`: Publishes the record to subscriber feeds so it can appear in [`getFeed()`](/api-reference/database/README.md#getfeed). Off unless set to `true`.
-   `notify_subscribers`: When the record is created, sends a push notification to the uploader's subscribers who subscribed with `get_notified: true`. See [Notifications](#notifications).
-   `feed_referencing_records`: Adds records that reference this record to the feed of this record's uploader.
-   `notify_referencing_records`: Every time a new record references this record, sends a push notification to this record's uploader's subscribers who subscribed with `get_notified: true`. See [Notifications](#notifications).

You can enable these options independently or combine them depending on your product behavior.

For example:

-   Use `is_subscription_record: true` without `upload_to_feed` when records should be accessible to subscribers but not appear in feed timelines.
-   Use `upload_to_feed: true` for timeline-style content.
-   Use `notify_subscribers: true` to tell subscribers about a new post as it happens, and `notify_referencing_records: true` to tell them about new comments on it.

This is useful for social apps where users follow each other, consume feed content, and track subscriber counts.

Assume **user A** uploads a record in table `Posts` as a subscription record.

```js
// User A uploads a subscription record.
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

You can also set every option at upload time:

```js
skapi.postRecord({
    title: "New post",
    body: "Hello subscribers!"
}, {
    table: {
        name: "Posts",
        access_group: "authorized",
        subscription: {
            is_subscription_record: true,
            upload_to_feed: true,
            notify_subscribers: true,
            feed_referencing_records: false,
            notify_referencing_records: false
        }
    }
});
```

To allow other users to access records that require a subscription, they must first subscribe to the user the record belongs to using the [`subscribe()`](/api-reference/database/README.md#subscribe) method:

:::warning
Anonymous (unsigned) users cannot create subscription records.
:::

### Who can change subscription settings

Every signed-in user of the project can set the subscription settings of their own records.

The project owner and admins (access groups `90` ~ `99`) can also change the subscription settings of an existing record that belongs to another user of the project. The record stays that user's, so it is that user's subscribers who get access to it. Admins in access groups `90` ~ `98` can change nothing else in the record's data or settings, and cannot change a read-only one. Files are a separate right: they can attach files to such a record by passing them to [`postRecord()`](/api-reference/database/README.md#postrecord) with nothing else changed, except to a read-only record, which refuses them with `Record is read only.`, and they can delete its files with [`deleteFiles()`](/api-reference/database/README.md#deletefiles), read-only or not. The project owner and access group `99` can attach files to read-only records too. A file attached this way is stored under the record's user. See [Admin Permissions](/admin/permissions.md#subscription-settings) and [Files on Records of Other Users](/database/handling-files.md#files-on-records-of-other-users).

Nobody but the record's own user can change anything on a private record, subscription settings included, or attach and delete its files.

The project owner's own records can never have subscription settings, whoever sends the request. A request that adds or turns one on is refused, while settings an older record already has can be kept as they are or turned off:

```ts
{
    code: "INVALID_REQUEST";
    message: "Records of the project owner cannot have subscription settings.";
}
```

Records posted by anonymous (signed-out) users belong to no user of the project, so the project owner and admins cannot give them subscription settings either. A request that adds or turns one on is refused, while settings such a record already has can be kept as they are or turned off:

```ts
{
    code: "INVALID_REQUEST";
    message: "Anonymous records cannot have subscription settings.";
}
```

On an update, options left out of `table.subscription` keep their stored values, and `table.subscription: null` turns every subscription setting off.

## Subscribing

:::warning
User must be logged in to call this method.
:::

Assume **user B** wants to access **user A**'s subscription records. **User B** must first subscribe to **user A**.

```js
// User B subscribes to user A.
skapi.subscribe({
    user_id: "user_id_of_user_A",
    get_feed: true, // Required to use getFeed() later.
});
```

:::tip
To use the [`getFeed()`](/database/subscription.html#getting-feed) method later, be sure to include `get_feed: true` in [`subscribe()`](/api-reference/database/README.md#subscribe).

`table.subscription.upload_to_feed` must be set to `true` for records to appear in subscriber feeds.
:::

A new subscription starts with every option off: `get_feed` and `get_notified` are only on when you set them. Calling [`subscribe()`](/api-reference/database/README.md#subscribe) again for the same user changes only the options you pass and keeps the others, so a subscriber can turn notifications on or off later without losing their feed:

```js
// User B turns notifications on. get_feed stays as it is.
skapi.subscribe({
    user_id: "user_id_of_user_A",
    get_notified: true,
});
```

:::warning
Subscribers will not get feeds that are posted prior to the subscription.
:::

Once **user B** subscribes to **user A**, **user B** can access records in that subscription table.

```js
// User B can now retrieve records that require subscription to user A.
skapi
    .getRecords({
        table: {
            name: "Posts",
            access_group: "authorized",
            subscription: "user_id_of_user_A",
        },
    })
    .then((response) => {
        console.log(response.list); // All of user A's subscription records in the Posts table.
    });
```

:::tip
Subscriber counts are tracked in the [UserPublic](/api-reference/data-types/README.md#userpublic) object,
which you can retrieve with [`getUsers()`](/api-reference/user/README.md#getusers).
:::


### [`subscribe(option): Promise<Subscription>`](/api-reference/database/README.md#subscribe)

## Unsubscribing

:::warning
User must be logged in to call this method.
:::

Users can unsubscribe using [`unsubscribe()`](/api-reference/database/README.md#unsubscribe).

```js
// User 'B'
skapi.unsubscribe({
    user_id: "user_id_of_user_A",
});
```

For full parameter and option details, see the API reference below:

### [`unsubscribe(option): Promise<string>`](/api-reference/database/README.md#unsubscribe)

:::warning
After unsubscribing, subscription information may need some time to update (usually almost immediate).
:::

## Blocking and Unblocking Subscribers

:::warning
User must be logged in to call this method.
:::

One benefit of the subscription feature is that users can block specific users from subscription-level records.
However, subscriptions are not a full security boundary.

Even when a user is blocked, they may still access files attached to records unless those files are private or use a higher access group.

Blocked users cannot access subscription-level record data.

To block a subscriber, call [`blockSubscriber()`](/api-reference/database/README.md#blocksubscriber):

### Blocking a Subscriber

```js
// User A blocks user B from subscription records.
skapi
    .blockSubscriber({
        user_id: "user_id_of_user_B",
    })
    .then((res) => {
        // User B no longer has access to user A's subscription records.
    });
```

For full parameter and option details, see the API reference below:

### [`blockSubscriber(option): Promise<string>`](/api-reference/database/README.md#blocksubscriber)

### Unblocking a Subscriber

```js
// User A unblocks user B.
skapi
    .unblockSubscriber({
        user_id: "user_id_of_user_B",
    })
    .then((res) => {
        // User B can access user A's subscription records again.
    });
```

An unblocked subscriber gets their subscription back with the options they had. Unblocking a user who was blocked without ever subscribing does not subscribe them.

For full parameter and option details, see the API reference below:

### [`unblockSubscriber(option): Promise<string>`](/api-reference/database/README.md#unblocksubscriber)

## Notifications

A user's subscribers can get a push notification when the user posts a record, and when someone references one of the user's records (for example, a comment on a post). Both are turned on per record by the uploader, and each subscriber decides whether they want them.

### What the subscriber needs

1. Subscribe with `get_notified: true`:

    ```js
    // User B wants notifications from user A.
    skapi.subscribe({
        user_id: "user_id_of_user_A",
        get_notified: true,
    });
    ```

2. Register the device for push notifications with [`subscribeNotification()`](/api-reference/realtime/README.md#subscribenotification). Notifications are delivered to every device the subscriber registered. See [Notifications](/notification/send-notifications.md) for the service worker and the registration steps.

To stop the notifications, subscribe again with `get_notified: false`. Their other options stay as they are.

### Notifying subscribers of a new record

Set `table.subscription.notify_subscribers` to `true` when you create the record. Pass `notification` to choose the text the subscribers see:

```js
// User A posts, and user A's subscribers are told.
skapi.postRecord({
    title: "New post",
    body: "Hello subscribers!"
}, {
    table: {
        name: "Posts",
        access_group: "authorized",
        subscription: {
            notify_subscribers: true
        }
    },
    notification: {
        title: "User A posted",
        body: "Hello subscribers!"
    }
});
```

`notification.title` and `notification.body` are both required, and together they must fit 3072 bytes. Without `notification`, subscribers see the title `New post` and the body `A user you subscribed to posted in "Posts".`

Only creating the record sends the notification. Updating a record, even to turn `notify_subscribers` on, does not.

### Notifying subscribers of a new reference

Set `table.subscription.notify_referencing_records` to `true` on a record. From then on, every new record that references it notifies the record uploader's subscribers:

```js
// User A's post: new comments on it notify user A's subscribers.
skapi.postRecord({ title: "New post" }, {
    table: {
        name: "Posts",
        access_group: "authorized",
        subscription: {
            notify_referencing_records: true
        }
    }
});

// User C comments. User A's subscribers who set get_notified are told.
skapi.postRecord({ comment: "Nice!" }, {
    table: {
        name: "Comments",
        access_group: "authorized"
    },
    reference: "record_id_of_user_A_post"
});
```

These notifications always show the title `New reference` and the body `A post by a user you subscribed to was referenced in "Comments".` (with the referencing record's table name). The user who references cannot choose the text, because it goes to someone else's subscribers.

A record notifies only when it gains the reference, when it is created or updated to reference a different record. Saving it again with the same reference does not notify again.

### Who is notified

-   Subscribers who set `get_notified: true` and are not blocked.
-   Only subscribers who can read the record: every subscriber for a `public` or `authorized` record, and for a higher access group, only subscribers whose own access group is at least that high. A reference is checked against the higher access group of the two records.
-   Never for a `private` record, on either side of a reference.
-   Never the user who posted the record, even if they subscribe to the uploader.
-   Only references made by signed-in users notify.

### What the service worker receives

The push message is a JSON object. Besides `title` and `body`, it says which record it is about, so your service worker can open the right page:

```ts
{
    title: string;
    body: string;
    type: "record" | "reference"; // "record": a new record. "reference": a new record referencing one of the user's records.
    record_id: string; // The new record.
    table: string; // Table name of the new record.
    user_id: string; // User who posted the new record.
    reference?: string; // Only for "reference": the record that was referenced.
}
```

See [Notifications](/notification/send-notifications.md#notifications-from-records) for a service worker that opens the record when the notification is clicked.

## Listing Subscriptions

The [`getSubscriptions()`](/api-reference/database/README.md#getsubscriptions) method retrieves subscription information from the database.

### Parameters

-   `subscriber`: User ID of the subscriber.
-   `subscription`: User ID of the user being subscribed to.
-   `blocked`: Set to `true` to return only blocked subscriptions.

Provide at least one of `params.subscriber` or `params.subscription`.

### Examples

```js
/**
 * Retrieve all subscriptions where user B is the subscriber.
 */
skapi
    .getSubscriptions({
        subscriber: "userB_user_id",
    })
    .then((response) => {
        console.log(response.list);
    });

/**
 * Retrieve all subscriptions where user A is being subscribed to.
 */
skapi
    .getSubscriptions({
        subscription: "userA_user_id",
    })
    .then((response) => {
        console.log(response.list);
    });

/**
 * Check whether user B is subscribed to user A.
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

For full parameter and option details, see the API reference below:

### [`getSubscriptions(params, fetchOptions?): Promise<DatabaseResponse<Subscription>>`](/api-reference/database/README.md#getsubscriptions)

## Getting Feed

[`getFeed()`](/api-reference/database/README.md#getfeed) retrieves the current user's feed.

It returns feed records from users the current user has subscribed to.

You can use this method to build a feed page for the user.

### Examples

First, user A must upload a record to the feed.

```js
// User A uploads a record to the feed.
skapi.postRecord(null, {
    table: {
        name: 'Posts',
        access_group: 'authorized',
        subscription: {
            upload_to_feed: true
        }
    }
});
```

Then user B, who is subscribed to user A, can fetch feed records from subscribed users.

```js
/**
 * User B retrieves all feed records with access_group: "authorized".
 */
skapi.getFeed({ access_group: 'authorized' }).then((response) => {
    console.log(response.list); // Feed records from subscribed users in the 'authorized' access group.
});
```

:::danger
If the record does NOT have `table.subscription.upload_to_feed` set to `true`, it will not show up in the feed. Saving a record without the flag leaves it as stored, and a record that never set it stays out of the feed.
:::

:::danger
When a user unsubscribes from another user, all past records from that user will no longer show in their feed.
:::

:::warning
Users only see feed records from the time they subscribed onward.
:::

### [`getFeed(params?, fetchOptions?): Promise<DatabaseResponse<RecordData>>`](/api-reference/database/README.md#getfeed)
