# Using Third-Party APIs

You can connect Skapi to third-party APIs (services outside your app), such as AI services, map services, payment services, or your own external APIs.

If the API requires a client secret, use [`clientSecretRequest()`](/api-reference/api-bridge/README.md#clientsecretrequest) to send secure `POST` or `GET` requests.

Because client secrets must never be exposed in frontend code, register each secret key securely in Skapi.

## Registering Client Secret Keys

1. In your Skapi service dashboard, click **Client Secret Key**.
2. Click **+** at the top-right of the table.
3. In the form, enter:
  - **Name:** A label for this key. You will use this value as `clientSecretName` in [`clientSecretRequest()`](/api-reference/api-bridge/README.md#clientsecretrequest).
  - **Client Secret Key:** The actual secret value. Use `$CLIENT_SECRET` in your `data`, `params`, `headers`, or `url` fields where the real secret should be inserted.
  - **Locked:** Controls access to this key. If **Locked** is enabled, only logged-in users can use it. If disabled, any user can use it.

4. Click **Save**.


## Sending Requests to Third-Party APIs

After you save your client secret key, use [`clientSecretRequest(params)`](/api-reference/api-bridge/README.md#clientsecretrequest) to send secure requests to third-party APIs.

The example below sends a `POST` request to a third-party API using a key saved as `YourSecretKeyName`. It places `$CLIENT_SECRET` in the `Authorization` header.

```js
skapi.clientSecretRequest({
    clientSecretName: 'YourSecretKeyName',
    url: 'https://third.party.com/api',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer $CLIENT_SECRET'
    }
})
```

The `params` object supports these fields:

- `clientSecretName`: Name of the client secret key saved in your Skapi service.
- `url`: Third-party API endpoint URL.
- `method`: HTTP method (`GET`, `POST`, `PUT`, or `DELETE`).
- `headers`: Request headers as key-value pairs.
- `data`: Request body as key-value pairs (used when `method` is `POST` or `PUT`).
- `params`: Query parameters as key-value pairs (used when `method` is `GET` or `DELETE`).
- `poll`: Polling interval in milliseconds. See [Polling for the Result](#polling-for-the-result) below. Must be a non-negative number.
- `expires`: Expiration time in seconds for the request record. After this period the record is removed and any poll returns an error.
- `queue`: Optional queue name. Requests sharing the same `url`, `method`, and `queue` value are processed sequentially on the server side. Useful for rate-limited APIs or operations that must not run in parallel. When omitted, requests are processed in parallel.
- `onResponse`: Callback called with the final API response. For non-queued requests it is called immediately alongside the returned promise. For queued requests it is called when polling resolves.
- `onError`: Callback called when the request or polling fails.

:::warning
When using `clientSecretRequest()`, include the `$CLIENT_SECRET` placeholder in at least one of these values: `data`, `params`, `headers`, or `url`.
:::

For full parameter details, see the API reference below:

### [`clientSecretRequest(params): Promise<any>`](/api-reference/api-bridge/README.md#clientsecretrequest)


## Polling for the Result

Because third-party APIs can take time to respond, `clientSecretRequest()` uses a queue-and-poll model. Every call is queued on the server and you can poll for the result.

### Automatic polling with `poll`

Pass a `poll` interval (in milliseconds) together with `onResponse` and `onError` callbacks. Skapi starts polling automatically. The promise resolves immediately with the initial status object (`{ id, status, ... }`); the final result is delivered via `onResponse`.

```js
skapi.clientSecretRequest({
    clientSecretName: 'openai',
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer $CLIENT_SECRET'
    },
    data: { model: 'gpt-image-1.5', prompt: 'A cute baby sea otter', n: 1, size: '1024x1024' },
    poll: 2000,              // poll every 2 seconds
    onResponse(result) {
        console.log('Done:', result);
    },
    onError(err) {
        console.error('Failed:', err);
    }
});
```

### Manual polling with `poll()`

When `poll` is omitted or `0`, the promise resolves with the status object plus a `poll()` method. Call it whenever you are ready to start polling:

```js
const res = await skapi.clientSecretRequest({
    clientSecretName: 'openai',
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer $CLIENT_SECRET'
    },
    data: { model: 'gpt-image-1.5', prompt: 'A cute baby sea otter', n: 1, size: '1024x1024' },
    onResponse(result) {
        console.log('Done:', result);
    },
    onError(err) {
        console.error('Failed:', err);
    }
});

// res = { id, status: 'running', queue_name, in_queue, poll }
res.poll({ latency: 2000 }); // start polling at 2-second intervals
```


## Fetching Request History

Every call made through `clientSecretRequest()` is stored in your service so the result can be retrieved later — even if the original call returned before the third-party API responded, or if the page was reloaded mid-request.

Use [`clientSecretRequestHistory(params, fetchOptions)`](/api-reference/api-bridge/README.md#clientsecretrequesthistory) to list past requests for a given `url` and `method`:

```js
const history = await skapi.clientSecretRequestHistory({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST'
});

console.log(history.list); // PollingResult[]
```

Each item in `history.list` is a `PollingResult` with fields: `id`, `status` (`'resolved' | 'failed' | 'pending' | 'running'`), `status_code`, `response_body`, `request_body`, `error`, `updated`, `expires`, and optionally `queue_name`.

### Polling History Items

Items with `status: 'running'` or `status: 'pending'` include a `poll()` method. Call it to start polling that specific item:

```js
const history = await skapi.clientSecretRequestHistory({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST'
});

for (const item of history.list) {
    if (item.status === 'running' || item.status === 'pending') {
        item.poll({
            latency: 2000,
            onResponse(result) { console.log('Resolved:', result); },
            onError(err) { console.error('Failed:', err); }
        });
    }
}
```

### Filtering by Status

Pass a `status` filter to return only requests in a specific state:

```js
skapi.clientSecretRequestHistory({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    status: 'pending'
});
```

### Filtering by Queue

If the original request used a `queue` name, pass the same `queue` to return only requests in that queue:

```js
skapi.clientSecretRequestHistory({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    queue: 'image-jobs'
});
```

For full parameter details, see the API reference:

### [`clientSecretRequestHistory(params, fetchOptions): Promise<DatabaseResponse<PollingResult[]>>`](/api-reference/api-bridge/README.md#clientsecretrequesthistory)


## Cancelling a Request

To cancel a pending request before it is processed, call [`cancelClientSecretRequest()`](/api-reference/api-bridge/README.md#cancelclientsecretrequest):

```js
const result = await skapi.cancelClientSecretRequest({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    id: 'stamp:entropy',  // the id from the clientSecretRequest response
    queue: 'image-jobs'   // required if the request was submitted with a queue name
});

console.log(result.removed); // true if successfully removed
```

Provide `queue` when the original request was submitted with a queue name. This removes the pending job from the client-side queue in addition to cancelling it on the server.

### [`cancelClientSecretRequest(params): Promise<{ removed: boolean; message: string }>`](/api-reference/api-bridge/README.md#cancelclientsecretrequest)


## Checking Queue Size

To check how many requests are currently waiting in a named queue, use [`getClientSecretRequestQueueCount()`](/api-reference/api-bridge/README.md#getclientsecretrequestqueuecount):

```js
const info = await skapi.getClientSecretRequestQueueCount({ queue: 'image-jobs' });
console.log(info.in_queue); // number of requests waiting
```

### [`getClientSecretRequestQueueCount(params): Promise<{ queue_name: string; in_queue: number }>`](/api-reference/api-bridge/README.md#getclientsecretrequestqueuecount)


## OpenAI Images API

In this example, you will use Skapi to call the [OpenAI Images API](https://developers.openai.com/api/reference/resources/images/methods/generate) securely.

First, we review the OpenAI API request format. Then we build the same request with `clientSecretRequest()`.

#### Prerequisites

1. Create an OpenAI account and get your API secret key from [platform.openai.com](https://platform.openai.com/).
2. Save your OpenAI API secret key on the **Client Secret Key** page in Skapi.

  For this example, save the key with the name `openai`.

  You will use this name as `clientSecretName` in the request.

#### Understanding the API call

According to the API documentation, the endpoint is:

```
POST https://api.openai.com/v1/images/generations
```

This means the request uses `POST` to `https://api.openai.com/v1/images/generations`.

The curl example looks like this:

``` bash
curl https://api.openai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-image-1.5",
    "prompt": "A cute baby sea otter",
    "n": 1,
    "size": "1024x1024"
  }'
```

From this example, the request needs these headers:

- `Content-Type: application/json`
- `Authorization: Bearer $OPENAI_API_KEY`

The request body should include fields such as `model`, `prompt`, `n`, and `size`.

`$OPENAI_API_KEY` is a placeholder for your OpenAI secret key.

Because secrets must not be exposed in frontend code, use [`clientSecretRequest()`](/api-reference/api-bridge/README.md#clientsecretrequest) and pass `Bearer $CLIENT_SECRET` instead:
::: code-group

```html [Form]
<form onsubmit="skapi.clientSecretRequest(event).then(r=>console.log(r))">
  <input name="clientSecretName" hidden value="openai">
  <input name="url" hidden value="https://api.openai.com/v1/images/generations">
  <input name="method" hidden value="POST">
  <input name="headers[Content-Type]" hidden value='application/json'>
  <input name="headers[Authorization]" hidden value="Bearer $CLIENT_SECRET">
  <input name="data[model]" hidden value="gpt-image-1.5">
  <input name="data[n]" hidden type='number' value="1">
  <input name="data[size]" hidden value="1024x1024">
  <textarea name='data[prompt]' required>A cute baby sea otter</textarea>
  <input type="submit" value="Generate">
</form>
```

```js [JS]
skapi.clientSecretRequest({
    clientSecretName: 'openai',
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer $CLIENT_SECRET'
    },
    data: {
        model: "gpt-image-1.5",
        "prompt": "A cute baby sea otter",
        n: 1,
        size: "1024x1024"
    },
    onResponse(result) {
        console.log(result);
    }
})
```
:::
The example above shows how to build request headers and body data for a secure OpenAI API call.
Use `$CLIENT_SECRET` in the `Authorization` header and set `clientSecretName` to `openai`, which is the key name saved in your Skapi dashboard.

When the request runs, Skapi replaces `$CLIENT_SECRET` with your stored secret key and returns the response from the OpenAI API via the `onResponse` callback.
