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