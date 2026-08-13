# Using Third-Party APIs

You can connect Skapi to third-party APIs (projects outside your app), such as AI service, map service, payment service, or your own external APIs.

If the API requires a client secret, use [`clientSecretRequest()`](/api-reference/api-bridge/README.md#clientsecretrequest) to send secure `POST` or `GET` requests.

Because client secrets must never be exposed in frontend code, register each secret key securely in Skapi.

## Registering Client Secret Keys

1. In your Skapi project dashboard, click **Client Secret Key**.
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

- `clientSecretName`: Name of the client secret key saved in your Skapi project.
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

Some third-party APIs are slow, or must be rate-limited so requests do not run in parallel. For these, run the request through a **queue** and **poll** for the result instead of waiting on a single response.

- Set `poll` to a polling interval in milliseconds (a non-negative number). When `poll > 0`, the request is queued, the promise resolves immediately with a status object (`id`, `status`, `queue_name`, `in_queue`), and the final result is delivered to your `onResponse` (or `onError`) callback once it is ready.
- When `poll` is `0` or omitted, the returned status object also carries a `poll()` method you can call to start polling manually.
- Add a `queue` name so requests sharing the same `url`, `method`, and `queue` are processed one at a time on the server.

```js
skapi.clientSecretRequest({
    clientSecretName: 'YourSecretKeyName',
    url: 'https://third.party.com/api',
    method: 'POST',
    queue: 'my-queue',
    poll: 1000, // check every second
    headers: { Authorization: 'Bearer $CLIENT_SECRET' },
    onResponse: (res) => console.log('final result', res),
    onError: (err) => console.error(err)
});
```

To stop watching a poll without cancelling the running request, use [`stopClientSecretPolling()`](/api-reference/api-bridge/README.md#stopclientsecretpolling); pick the result back up later by polling again. A stopped poll resolves with `{ status: 'stopped' }`, which [`isPollStopped()`](/api-reference/api-bridge/README.md#ispollstopped) detects.

## Request History

[`clientSecretRequestHistory()`](/api-reference/api-bridge/README.md#clientsecretrequesthistory) returns the past requests for a given `url` and `method` as a paginated list of [`RequestHistory`](/api-reference/data-types/README.md#requesthistory) items. Each item includes the `request_body`, the `response_body`, the `status`, and two timestamps in milliseconds: `created` (when the request was made) and `updated` (the most recent status change, i.e. when the response arrived for a settled request).

```js
skapi.clientSecretRequest({
    clientSecretName: 'YourSecretKeyName',
    url: 'https://third.party.com/api',
    method: 'POST',
    headers: { Authorization: 'Bearer $CLIENT_SECRET' }
}).then(() => skapi.clientSecretRequestHistory({
    url: 'https://third.party.com/api',
    method: 'POST'
})).then((history) => {
    for (const req of history.list) {
        console.log(req.created, req.updated, req.status);
    }
});
```

## Related Methods

- [`clientSecretRequestHistory(params, fetchOptions)`](/api-reference/api-bridge/README.md#clientsecretrequesthistory) — list past requests (see above).
- [`cancelClientSecretRequest(params)`](/api-reference/api-bridge/README.md#cancelclientsecretrequest) — cancel a queued or running request and remove it from the client-side queue.
- [`stopClientSecretPolling(params?)`](/api-reference/api-bridge/README.md#stopclientsecretpolling) — stop polling locally without cancelling the request.
- [`isPollStopped(res)`](/api-reference/api-bridge/README.md#ispollstopped) — tell a stopped-poll result apart from a real API response.
- [`clientSecretRequestQueueCount(params)`](/api-reference/api-bridge/README.md#clientsecretrequestqueuecount) — how many requests are waiting in a named queue.
