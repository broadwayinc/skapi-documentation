## subscribeNewsletter

```ts
subscribeNewsletter({
    params: SubmitEvent | <{
        email?: string;
        group: number | 'public' | 'authorized';
        redirect?: string;
    }>,
    callbacks: {
        response?(response: any): any;
        onerror?(error: Error): any;
    }
}): Promise<string>
```

## unsubscribeNewsletter

```ts
unsubscribeNewsletter(params: { group: number | 'public' | 'authorized' | null; }): Promise<string>
```