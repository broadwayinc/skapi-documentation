# API Reference: API Bridge

Below are the parameters and return data type references for the methods in TypeScript format.

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