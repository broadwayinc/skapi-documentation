# API Reference: Third-Party APIs

Below are the parameters and return data type references for the methods in TypeScript format.

## clientSecretRequest

```ts
clientSecretRequest(
    params: {
        clientSecretName: string; // The name of the client secret key registered in your Skapi project.
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
    status: 'pending';    // Queue status at the time of queueing. Newly queued requests are always 'pending'.
    queue_name: string;   // The queue this request belongs to (plain queue name).
    in_queue: number;     // Unresolved requests in this queue, INCLUDING this one. 1 means this request is at the head (processing next); 2 means one request is ahead of it.
    poll?: (arg?: { latency?: number }) => Promise<any>; // Present when the request was queued. Call to start manual polling. In practice you only receive this object when poll is omitted or 0. See Behavior below.
}>
```

**Behavior:**
- For non-queued requests (no `queue`), the response is returned directly and `onResponse` is also called with the result.
- When `poll > 0`, polling starts automatically and the promise resolves with the **final** result once polling finishes, not with the status object. (If `onResponse` is supplied, the promise resolves with that callback's return value.) Errors go to `onError`. A queue is auto-generated when `poll > 0` and no `queue` was given.
- When `poll` is `0` or omitted, the promise resolves with the status object plus a `poll()` method. Call `poll()` to start polling; results come via `onResponse`/`onError`.
- The promise returned by `poll()` also carries a `stop()` method that stops that one poll. See [stopClientSecretPolling](#stopclientsecretpolling).

:::info
`queue_name` is the plain queue name (e.g. `"image-queue"`) on every response that carries it:
this one, `clientSecretRequestHistory()` results, and the object a `poll()` resolves with.
:::

## clientSecretRequestHistory

```ts
clientSecretRequestHistory(
    params: {
        url: string; // The third-party API endpoint URL used in the original request.
        method: 'GET' | 'POST' | 'DELETE' | 'PUT'; // The HTTP method used in the original request.
        queue?: string; // Optional queue name to filter history by. When omitted, all requests for the given url and method are returned.
        status?: 'pending' | 'running' | 'resolved' | 'failed'; // Optional status filter.
        compact?: boolean; // Return lightweight label stubs instead of full request/response bodies. See below.
        queue_exact?: boolean; // Match the named queue exactly instead of as a prefix. See below.
        queue_exclude?: string; // Drop one queue's rows from the listing. See below.
    },
    fetchOptions?: FetchOptions // Pagination and fetch behavior options.
): Promise<DatabaseResponse<RequestHistory[]>>
```

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [RequestHistory](/api-reference/data-types/README.md#requesthistory)

Each history item carries two timestamps, both in milliseconds: `created`, the time the
request was made (set once, never changes), and `updated`, the time of the most recent
status change (for a settled request, when its response arrived).

Listing modifiers:

- `compact: true` returns each item with label stubs (`request_text`, `response_text`,
  `response_complete_marker`, and `compact: true`) **instead of** `request_body` and
  `response_body`; the full bodies never leave the server. Use it to render long lists
  cheaply, then re-fetch without `compact` (or `poll()` a live item) when a full body is
  actually needed.
- `queue_exact: true` restricts a `queue` listing to exactly the named queue. Without it
  the queue lookup is a prefix range, so queue `"u1"` also matches `"u1-bg"` and every
  other queue that starts with `"u1"`.
- `queue_exclude: "<name>"` drops one queue's rows from the listing: the inverse filter,
  for fetching everything except a background queue.

Both queue filters are applied server-side after the range read, so a page can come back
short (or even empty) while more matches remain. Rely on `endOfList`/`startKey` to keep
paging, never on a page's length.

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

## stopClientSecretPolling

```ts
stopClientSecretPolling(
    params?: {
        url?: string; // The third-party API endpoint URL of the request. Required when identifying by id.
        method?: 'GET' | 'POST' | 'DELETE' | 'PUT'; // The HTTP method of the request. Required when identifying by id.
        id?: string; // The request ID whose poll should stop. Pair with url and method.
        queue?: string; // Stop every poll started with this queue name instead of a single request.
        service?: string; // Optional project ID override.
        owner?: string; // Optional owner ID override.
    }
): number // How many live polls were stopped.
```

Stops polling **without cancelling the request**. The request keeps running on the server; only this
client stops asking about it. Call it again later to pick the result back up.

Pass `id` (with `url` and `method`) to stop one request, `queue` to stop every poll on a queue, or no
arguments at all to stop every live poll.

**Behavior:**
- A stopped poll **resolves** with `{ id, status: 'stopped' }`. It does not reject, so `await` sites do
  not need a `catch`.
- `onResponse` and `onError` are **not** called for a stopped poll; a stop is not a result.
- Stopping a request that is still waiting in a queue also removes it from that queue, freeing the slot
  for the next request.
- Stopping an unknown or already-finished request is a no-op and returns `0`.

To cancel the request itself rather than just stop watching it, use
[`cancelClientSecretRequest()`](#cancelclientsecretrequest).

## isPollStopped

```ts
isPollStopped(
    res: any // A resolved poll result.
): boolean // true if the result came from stopClientSecretPolling rather than the server.
```

Distinguishes a stopped poll from a real API result, so a handler can ignore it instead of treating
`{ status: 'stopped' }` as a response.

## clientSecretRequestQueueCount

```ts
clientSecretRequestQueueCount(
    params: {
        queue: string; // The queue name to check.
        service?: string; // Optional project ID override.
        owner?: string; // Optional owner ID override.
    }
): Promise<{
    queue_name: string; // The queue name.
    in_queue: number;   // Number of requests currently waiting in the queue.
}>
```
## secureRequest

```ts
secureRequest<
    Params = {
        url: string;   // The URL of your custom API.
        data?: any;    // The data to send to your custom API.
        sync?: boolean; // When true, the requests are processed synchronously.
    },
    Response = { response: any; statusCode: number; url: string }
>(
    params: Params[] | Form<Params>, // A single request, an array of requests, or a form.
    url?: string
): Promise<Response | Response[]>
```

Mirrors a `POST` request to your own API through Skapi, so your API receives the signed-in
user's information alongside the request data. The user must be logged in, and this method
does not accept HTML forms.

When a secret key is set on the project's settings page, the mirrored request carries that
key, which is how your API can verify the call really came from Skapi.

See [Secure Post Request](/api-bridge/secure-post-request.md)

## forwardRequest

```ts
forwardRequest(
    form: SubmitEvent | HTMLFormElement | FormData | { [key: string]: any }, // Sent to the destination as-is.
    options: {
        url: string;            // The destination URL. Must be http(s) and resolve to a public address.
        method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'; // Defaults to 'POST'.
        headers?: { [key: string]: string }; // Headers to send TO the destination.
        apiKeyHeader?: string;  // Header name carrying your project's API key. Defaults to 'x-api-key'.
        apiKeyScheme?: string;  // Prefix for the API key value, e.g. 'Bearer'.
        onStream?: (chunk: string) => void; // Called with each chunk as it arrives. Supplying this enables streaming.
        signal?: AbortSignal;   // Stops the client receiving the response. Does NOT cancel the request already sent to your backend.
        responseType?: 'json' | 'text' | 'response'; // How the promise resolves. Defaults to json, falling back to text.
    }
): Promise<any>
```

Forwards a request to your own external backend from Skapi's servers instead of the
browser, and streams the response back as it arrives. The user must be logged in.

Accepts an HTML form directly, so `onsubmit="skapi.forwardRequest(event, { url })"` works
with no `preventDefault()` of your own.

Unlike [secureRequest](#securerequest), the body is relayed **verbatim**: a form arrives at
your backend as `multipart/form-data`, files included. The form's own `enctype` and `method`
attributes are not used.

Your backend authenticates the call by the `x-api-key` header, which Skapi adds server side
from the API key string set on your [project settings](/service-settings/additional.md)
page. The browser never sees it and a caller cannot replace it. Your backend also receives
`x-skapi-user` and `x-skapi-service`, written from the verified session, so it can tell who
is calling without trusting the client.

Your backend's status code and response headers are passed through to the caller, except
hop-by-hop headers, `content-length`, `set-cookie`, and `access-control-*` (Skapi writes those
itself from the project's CORS setting; a duplicate would make the browser reject the response).
Forwarded headers are named in `Access-Control-Expose-Headers` so the client can actually read
them. Reading the status code or a response header from JavaScript requires
`responseType: 'response'`; otherwise a non-2xx is thrown as a `SkapiError` and the promise
value is the parsed body alone.

**Return value:**
- with `onStream`, the promise resolves with the whole body once the stream ends, after the callback has seen every chunk
- otherwise your backend's response, parsed as JSON when it parses, else text
- `responseType: 'response'` hands back the raw `Response` object for full control

See [Forward Request](/api-bridge/forward-request.md)
