# API Reference: API Bridge

## secureRequest

```ts
secureRequest(
    params: {
        url: string;
        data?: any;
    }
): Promise<any>
```

## clientSecretRequest

```ts
clientSecretRequest(
    params: {
        url: string;
        clientSecretName: string;
        method: 'get' | 'post' | 'GET' | 'POST';
        headers?: Record<string, string>;
        data?: Record<string, string>;
        params?: Record<string, string>;
    }
): Promise<any>
```