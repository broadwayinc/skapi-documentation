# API Reference: Connection

## getConnectionInfo

```ts
getConnectionInfo(): Promise<ConnectionInfo>
```

See [ConnectionInfo](/api-reference/data-types/README.md#connectioninfo)

## mock

```ts
mock(
    data: SubmitEvent | { [key: string]: any } & { raise?: 'ERR_INVALID_REQUEST' | 'ERR_INVALID_PARAMETER' | 'SOMETHING_WENT_WRONG' | 'ERR_EXISTS' | 'ERR_NOT_EXISTS'; },
    options?: {
        auth?: boolean; // Requires authentication
        method?: string; // HTTP method. Default is 'POST'
        responseType?: 'blob' | 'json' | 'text' | 'arrayBuffer' | 'formData' | 'document'; // Response data type. Default is 'json'
        contentType?: string; // Content-Type header. Default is 'application/json'
        progress?: ProgressCallback;
    }
): Promise<{[key:string]: any}>
```

See [ProgressCallback](/api-reference/data-types/README.md#progresscallback)

## getFormResponse

```ts
getFormResponse(): Promise<any>
```