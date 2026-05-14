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

```js [JS]
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
- `poll`: Polling interval in milliseconds. When set to a positive number, Skapi polls the result at the given interval and the promise resolves with the final response. When omitted or `0`, the call returns immediately with `{ id, status: 'pending' }` and the result can be retrieved later with [`clientSecretRequestHistory()`](#fetching-request-history). Must be a non-negative number.
- `expires`: Expiration time in milliseconds for the request record. Defaults to 15 minutes. After this period the request is invalidated and any pending poll returns an error.
- `queue`: Optional queue name. Requests sharing the same `url`, `method`, and `queue` value are processed sequentially in the order they are received. Useful for rate-limited APIs or operations that must not run in parallel. When omitted, requests are processed immediately in parallel.


:::warning
When using `clientSecretRequest()`, include the `$CLIENT_SECRET` placeholder in at least one of these values: `data`, `params`, `headers`, or `url`.
:::

For full parameter details, see the API reference below:

### [`clientSecretRequest(params): Promise<any>`](/api-reference/api-bridge/README.md#clientsecretrequest)


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

Each item in `history.list` is a `PollingResult` with `id`, `status` (`'resolved' | 'failed' | 'pending'`), `status_code`, `response_body`, `request_body`, `error`, `updated`, and `expires`.

### Polling Pending Requests

If some items in the history are still in `pending` status (for example, a long-running request that has not finished yet), pass a `poll` interval (in milliseconds). Skapi will start polling each pending item and expose a `pending` array of promises on the response — one per pending request — that each resolve with the final `PollingResult`:

```js
const history = await skapi.clientSecretRequestHistory({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    poll: 2000 // poll every 2 seconds
});

// Wait for all still-pending requests to resolve
const finalized = await Promise.all(history.pending);
console.log(finalized);
```

When `poll` is omitted or `0`, the history is returned as-is without any polling. Negative values are rejected with an `INVALID_PARAMETER` error.

### Filtering by Queue

If the original request used a `queue` name, pass the same `queue` to `clientSecretRequestHistory()` to return only the requests in that queue:

```js
skapi.clientSecretRequestHistory({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    queue: 'image-jobs'
});
```

For full parameter details, see the API reference below:

### [`clientSecretRequestHistory(params, fetchOptions): Promise<DatabaseResponse<PollingResult[]> & { pending: Promise<PollingResult>[] }>`](/api-reference/api-bridge/README.md#clientsecretrequesthistory)


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
    }
})
```
:::
The example above shows how to build request headers and body data for a secure OpenAI API call.
Use `$CLIENT_SECRET` in the `Authorization` header and set `clientSecretName` to `openai`, which is the key name saved in your Skapi dashboard.

When the request runs, Skapi replaces `$CLIENT_SECRET` with your stored secret key and returns the response from the OpenAI API.