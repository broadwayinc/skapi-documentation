# API Reference: Email

## subscribeNewsletter

```ts
subscribeNewsletter({
    params: SubmitEvent | <{
        group: 'public' | 'authorized';
        email?: string; // only for public newsletters
        redirect?: string; // only for public newsletters. User will be redirected to this URL when confirmation link is clicked.
    }>,
    callbacks: {
        response?(response: any): any;
        onerror?(error: Error): any;
    }
}): Promise<string>
```

## unsubscribeNewsletter

```ts
unsubscribeNewsletter(
    params: { 
        group: 'authorized';
    }
): Promise<string>
```

## getNewsletterSubscription

```ts
getNewsletterSubscription(
    params: { 
        group: 'authorized';
    }
): Promise<any[]>
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