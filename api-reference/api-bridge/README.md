# API Reference: Third-Party APIs

Below are the parameters and return data type references for the methods in TypeScript format.

## clientSecretRequest

```ts
clientSecretRequest(
    params: {
        clientSecretName: string; // The name of the client secret key registered in your Skapi service.
        url: string; // The third-party API endpoint URL.
        method: 'GET' | 'POST' | 'DELETE' | 'PUT'; // The HTTP method.
        headers?: { [key: string]: string }; // Request headers as a key-value object.
        data?: { [key: string]: any }; // Request body as a key-value object (used when `method` is `POST` or `PUT`).
        params?: { [key: string]: string }; // Query parameters as a key-value object (used when `method` is `GET` or `DELETE`).
        poll?: number; // Optional polling interval in milliseconds. When set to a positive number, Skapi polls the request result at the given interval and the promise resolves with the final response once available. When omitted or `0`, the call returns immediately with `{ id, status: 'pending' }` and the result can be retrieved later via `clientSecretRequestHistory()`. Must be a non-negative number.
        expires?: number; // Optional expiration time in milliseconds for the request record. Defaults to 15 minutes. After this period the request is invalidated and any pending poll returns an error.
        queue?: string; // Optional queue name. Requests sharing the same `url`, `method` and `queue` value are processed sequentially in the order they are received. When omitted, requests are processed immediately in parallel.
    }
): Promise<any>
```

## clientSecretRequestHistory

```ts
clientSecretRequestHistory(
    params: {
        url: string; // The third-party API endpoint URL used in the original request.
        method: 'GET' | 'POST' | 'DELETE' | 'PUT'; // The HTTP method used in the original request.
        poll?: number; // Optional polling interval in milliseconds. When set to a positive number, items still in `pending` status spawn poll promises returned in a parallel `pending` array on the response — each promise resolves with the final `PollingResult` of that item. When omitted or `0`, history is returned as-is without polling. Must be a non-negative number.
        queue?: string; // Optional queue name to filter history by. When provided, only requests submitted with the same queue name are returned. When omitted, all requests for the given `url` and `method` are returned.
    },
    fetchOptions?: FetchOptions // Pagination and fetch behavior options.
): Promise<DatabaseResponse<PollingResult[]> & { pending: Promise<PollingResult>[] }>
```

`PollingResult`:

```ts
type PollingResult = {
    id: string;
    status: 'resolved' | 'failed' | 'pending';
    status_code: number | null; // HTTP status code returned by the third-party API.
    response_body: any;          // Response body returned by the third-party API.
    request_body: any;           // The request body that was sent.
    error: any;                  // Error details, if the request failed.
    updated: number;             // Timestamp of the last status update.
    expires: number | null;      // Expiration timestamp; `null` while the request is still pending.
};
```