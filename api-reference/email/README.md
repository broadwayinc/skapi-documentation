# API Reference: E-Mail

Below are the parameters and return data type references for the methods in TypeScript format.

## subscribeNewsletter

```ts
subscribeNewsletter(
    params: SubmitEvent | {
        /**
         * Numeric group 0 ~ 99, 'public' (group 0), 'authorized' (group 1),
         * or the name of a named newsletter group.
         * A group name is 2 ~ 20 lowercase alphanumeric characters, contains at least one letter,
         * is not a number in exponent notation such as '1e5',
         * and is not one of the reserved names:
         * 'tp', 'admin', 'public', 'authorized', 'newsletter', 'forward', 'all', 'true', 'false', 'null'.
         */
        group: number | 'public' | 'authorized' | string;
        email?: string | string[]; // only for public newsletters, or a named group with restriction 0
        redirect?: string; // only for public newsletters, or a named group with restriction 0. User will be redirected to this URL when confirmation link is clicked.
    }
): Promise<string>
```

## unsubscribeNewsletter

```ts
unsubscribeNewsletter(
    params: { 
        /** Numeric group, 'public', 'authorized' or a named newsletter group. null unsubscribes from every group. */
        group: number | 'public' | 'authorized' | string | null;
    }
): Promise<string>
```

## getNewsletterSubscription

```ts
getNewsletterSubscription(
    params: { 
        /** Numeric group, 'public', 'authorized' or a named newsletter group. Omit for every group. */
        group?: number | 'public' | 'authorized' | string | null;
        user_id?: string; // Another user's subscriptions. Project owner and admins (access groups 90 ~ 99) only. Omit it to get your own, or the whole list of the group as the owner or an admin.
        email?: string; // Project owner, Skapi staff and admins in access group 99 only. Returns the subscribers of "group" whose e-mail address starts with this text. Requires "group", cannot be used with "user_id". Admins in access groups 90 ~ 98 are refused with "No access."
    },
    fetchOptions?: FetchOptions
): Promise<{
    active: boolean;
    timestamp: number; // Undefined on a group's whole subscriber list.
    group: number | string; // Number for the 0 ~ 99 groups, the group name for a named newsletter group.
    subscribed_email: string; // Masked as "j**@**.com" for admins in access groups 90 ~ 98, except on their own subscriptions.
    subscriber_token?: string; // Only on a masked row of a group's subscriber list. Opaque, stable per address, and different for different addresses.
}[] | DatabaseResponse<{
    active: boolean;
    timestamp: number;
    group: number | string; // Number for the 0 ~ 99 groups, the group name for a named newsletter group.
    subscribed_email: string; // Masked as "j**@**.com" for admins in access groups 90 ~ 98, except on their own subscriptions.
    subscriber_token?: string; // Only on a masked row of a group's subscriber list. Opaque, stable per address, and different for different addresses.
}>>
```

- Called with a `group` and no `user_id` by the project owner or an admin (access groups `90` ~ `99`), it returns **every subscriber** of that group, sorted by e-mail address.
- Called without `user_id` by any other user, it returns the signed in user's own subscriptions.
- Called with a `group` and an `email` by the project owner, Skapi staff or an admin in access group `99`, it returns only the subscribers of that group whose e-mail address **starts with** `email`, matched in lowercase and sorted by e-mail address. Everyone else, admins in access groups `90` ~ `98` included, gets `INVALID_REQUEST` and `No access.`
- Passing another user's `user_id` is refused with `No access.` unless the caller is the project owner or an admin (access groups `90` ~ `99`).
- `subscribed_email` comes back **masked**, as `j**@**.com`, to an admin in access groups `90` ~ `98`: on a group's subscriber list, and on another user's subscriptions read with `user_id`. The project owner, Skapi staff and admins in access group `99` get the addresses in full, and every user reading their own subscriptions gets their own address in full.
- A masked address cannot be mailed and is not unique, so it is never a key. `subscriber_token` is what tells two masked rows apart: it comes with every masked row of a **group's subscriber list**, is the same string for the same subscriber on every call and every page, and is a different string for a different address. It is opaque, it is scoped to this project, owner and group, and it is **absent** for a caller who reads addresses in full. The single user path read with `user_id` carries none. Do not store it as a lasting id: the platform can reissue tokens.
- Paging is unchanged, but for an admin in access groups `90` ~ `98` the `startKey` of a page is sealed, `{ seal: '...' }` rather than the database's own key. `fetchMore` replays it; a `startKey` you pass yourself has to be the previous page's object unchanged, or the request is refused with `INVALID_PARAMETER` and `"startKey" does not belong to this request.`

See [Searching subscribers by e-mail](/admin/newsletters.md#searching-subscribers-by-e-mail) and [Who can read the subscriber list](/admin/newsletters.md#who-can-read-the-subscriber-list).

## getNewsletters

```ts
getNewsletters(
    params?: {
        /**
         * Search points.
         * 'message_id' and 'subject' value should be string.
         * Others in numbers.
         */
        searchFor: 'message_id' | 'timestamp' | 'read' | 'complaint' | 'bounced' | 'subject';
        value: string | number;
        /** Numeric group, 'public', 'authorized' or a named newsletter group. */
        group: number | 'public' | 'authorized' | string;
        range?: string | number;
        /**
         * Defaults to '='
         */
        condition?: '>' | '>=' | '=' | '<' | '<=' | 'gt' | 'gte' | 'eq' | 'lt' | 'lte';
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<Newsletter>>
```

See [FetchOptions](/api-reference/data-types/README.md#fetchoptions)

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [Newsletter](/api-reference/data-types/README.md#newsletter)


## registerNewsletterGroup

Project owner and admins in access group `99` only.

```ts
registerNewsletterGroup(
    params: SubmitEvent | {
        /**
         * Name of the newsletter group.
         * 2 ~ 20 lowercase alphanumeric characters, at least one letter,
         * not a number in exponent notation such as '1e5',
         * and not one of the reserved names:
         * 'tp', 'admin', 'public', 'authorized', 'newsletter', 'forward', 'all', 'true', 'false', 'null'.
         */
        group: string;
        /**
         * Access group required to subscribe to the group, and to read its sent mail. Defaults to 0.
         * 0 is anyone, 1 is any logged in user, 2 ~ 99 is that access group.
         */
        restriction?: number;
        /** Display label of the group. 60 characters max. */
        name?: string;
    }
): Promise<'SUCCESS: Group registered successfully.'>
```

A service can hold up to 20 named newsletter groups.

## deleteNewsletterGroup

Project owner and admins in access group `99` only. Deletes the group along with every subscription of that group.

```ts
deleteNewsletterGroup(
    params: SubmitEvent | {
        /** Name of the newsletter group to delete. */
        group: string;
    }
): Promise<string> // 'SUCCESS: Group has been deleted along with N subscription(s).'
```

## newsletterGroupEndpoint

Project owner and admins in access group `99` only.

```ts
newsletterGroupEndpoint(): Promise<{
    groups: {
        /** Name of the newsletter group. */
        group: string;
        /**
         * Access group required to subscribe to the group, and to read its sent mail.
         * 0 is anyone, 1 is any logged in user, 2 ~ 99 is that access group.
         */
        restriction: number;
        /** Display label of the group. Empty string when none was set. */
        name: string;
        /** Number of subscribers of the group. */
        subscribers: number;
        /**
         * E-Mail address a newsletter for this group is sent to.
         * Empty string when the service has no sender e-mail set.
         */
        endpoint: string;
    }[];
}>
```

## sendInquiry

```ts
sendInquiry(
    params: {
        name: string;
        email: string;
        subject: string;
        message: string;
    }
): Promise<'SUCCESS: Inquiry has been sent.'>
```