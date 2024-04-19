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
        headers?: { [key: string]: string };
        data?: { [key: string]: any };
        params?: { [key: string]: string };
    }
): Promise<any>
```