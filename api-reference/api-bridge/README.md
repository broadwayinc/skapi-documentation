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
        data?: { [key: string]: any }; // Request body as a key-value object (used when method is POST or PUT).
        params?: { [key: string]: string }; // Query parameters as a key-value object (used when method is GET or DELETE).
        poll?: number; // Optional polling interval in milliseconds. When > 0, the promise resolves immediately with the initial status object and the final result is delivered via onResponse/onError. When omitted or 0, the status object is returned with a poll() method to start polling manually. Must be a non-negative number.
        queue?: string; // Optional queue name. Requests sharing the same queue are processed sequentially on the server side.
        expires?: number; // Optional expiration time in seconds for the request record.
        onResponse?: (res: any) => void; // Called with the final API response once polling resolves, or immediately for non-queued direct responses.
        onError?: (err: any) => void; // Called when polling or the initial request fails.
    }
): Promise<any | {
    id: string;           // Request ID in "stamp:entropy" format.
    status: 'running' | 'pending'; // Current queue status.
    queue_name: string;   // The queue this request belongs to.
    in_queue: number;     // Number of requests ahead in the queue (1 = processing, >1 = waiting).
    poll?: (arg?: { latency?: number }) => void; // Only present when poll is omitted or 0. Call to start manual polling.
}>
```

**Behavior:**
- For non-queued requests (no `queue`), the response is returned directly and `onResponse` is also called with the result.
- When `poll > 0`, the promise resolves with the initial status object immediately. The final response is delivered via `onResponse`; errors via `onError`.
- When `poll` is `0` or omitted, the promise resolves with the status object plus a `poll()` method. Call `poll()` to start polling; results come via `onResponse`/`onError`.

## clientSecretRequestHistory

```ts
clientSecretRequestHistory(
    params: {
        url: string; // The third-party API endpoint URL used in the original request.
        method: 'GET' | 'POST' | 'DELETE' | 'PUT'; // The HTTP method used in the original request.
        queue?: string; // Optional queue name to filter history by. When omitted, all requests for the given url and method are returned.
        status?: 'pending' | 'running' | 'resolved' | 'failed'; // Optional status filter.
    },
    fetchOptions?: FetchOptions // Pagination and fetch behavior options.
): Promise<DatabaseResponse<PollingResult[]>>
```

Items in the returned list that have `status: 'running'` or `status: 'pending'` include a `poll()` method:

```ts
poll(arg?: {
    latency?: number;           // Polling interval in milliseconds. Defaults to 1000.
    onResponse?: (res: any) => void; // Called with the final result when polling resolves.
    onError?: (err: any) => void;    // Called on polling error.
}): void
```

## cancelClientSecretRequest

```ts
cancelClientSecretRequest(
    params: {
        url: string; // The third-party API endpoint URL of the request to cancel.
        method: 'GET' | 'POST' | 'DELETE' | 'PUT'; // The HTTP method of the request to cancel.
        id: string; // The request ID to cancel.
        queue?: string; // Optional queue name the request belongs to. Provide this to also remove the request from the client-side queue.
    }
): Promise<{ removed: boolean; message: string }>
```

## getClientSecretRequestQueueCount

```ts
getClientSecretRequestQueueCount(
    params: {
        queue: string; // The queue name to check.
        service?: string; // Optional service ID override.
        owner?: string; // Optional owner ID override.
    }
): Promise<{
    queue_name: string; // The queue name.
    in_queue: number;   // Number of requests currently waiting in the queue.
}>
```

## PollingResult

```ts
type PollingResult = {
    id: string;               // Request ID in "stamp:entropy" format.
    status: 'resolved' | 'failed' | 'pending' | 'running';
    status_code: number | null; // HTTP status code returned by the third-party API.
    response_body: any;         // Response body returned by the third-party API.
    request_body: any;          // The request body that was sent.
    error: any;                 // Error details, if the request failed.
    updated: number;            // Timestamp of the last status update.
    expires: number | null;     // Expiration timestamp; null while still pending.
    queue_name?: string;        // Queue name, if the request was queued.
    poll?: (arg?: { latency?: number; onResponse?: (res: any) => void; onError?: (err: any) => void }) => void; // Present on running/pending items from clientSecretRequestHistory().
};
```
