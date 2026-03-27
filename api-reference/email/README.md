# API Reference: Email

Below are the parameters and return data type references for the methods in TypeScript format.

## subscribeNewsletter

```ts
subscribeNewsletter({
    params: SubmitEvent | {
        group: number | 'public' | 'authorized' | 'admin';
        email?: string; // only for public newsletters
        redirect?: string; // only for public newsletters. User will be redirected to this URL when confirmation link is clicked.
    }
}): Promise<string>
```

## unsubscribeNewsletter

```ts
unsubscribeNewsletter(
    params: { 
        group: number | 'public' | 'authorized' | null;
    }
): Promise<string>
```

## getNewsletterSubscription

```ts
getNewsletterSubscription(
    params: { 
        group?: number | 'public' | 'authorized';
    }
): Promise<{
    active: boolean;
    timestamp: number;
    group: number;
    subscribed_email: string;
}[]>
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
        searchFor: 'message_id' | 'timestamp' | 'read' | 'complaint' | 'subject';
        value: string | number;
        group: 'public' | 'authorized' | number;
        range: string | number;
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