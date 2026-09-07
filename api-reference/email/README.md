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
         * and is not one of the reserved names:
         * 'tp', 'admin', 'public', 'authorized', 'newsletter', 'forward', 'all'.
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
        user_id?: string; // Admin can fetch another user's subscriptions.
    },
    fetchOptions?: FetchOptions
): Promise<{
    active: boolean;
    timestamp: number;
    group: number | string; // Number for the 0 ~ 99 groups, the group name for a named newsletter group.
    subscribed_email: string;
}[] | DatabaseResponse<{
    active: boolean;
    timestamp: number;
    group: number | string; // Number for the 0 ~ 99 groups, the group name for a named newsletter group.
    subscribed_email: string;
}>>
```

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

Service owner only.

```ts
registerNewsletterGroup(
    params: SubmitEvent | {
        /**
         * Name of the newsletter group.
         * 2 ~ 20 lowercase alphanumeric characters, at least one letter,
         * and not one of the reserved names:
         * 'tp', 'admin', 'public', 'authorized', 'newsletter', 'forward', 'all'.
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

Service owner only. Deletes the group along with every subscription of that group.

```ts
deleteNewsletterGroup(
    params: SubmitEvent | {
        /** Name of the newsletter group to delete. */
        group: string;
    }
): Promise<string> // 'SUCCESS: Group has been deleted along with N subscription(s).'
```

## newsletterGroupEndpoint

Service owner only.

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