# Using Third-Party APIs

You can connect Skapi to third-party APIs (projects outside your app), such as AI service, map service, payment service, or your own external APIs.

If the API requires a client secret, use [`forwardRequest()`](/api-bridge/forward-request.md) to send the request from Skapi's servers with the secret substituted in.

Because client secrets must never be exposed in frontend code, register each secret key securely in Skapi.

## Registering Secret Keys

1. In your Skapi project dashboard, click **Secret Keys**.
2. Click **+ Register Secret**.
3. In the form, enter:
  - **Name:** A label for this key. You will use this value as `secretName` in [`forwardRequest()`](/api-reference/api-bridge/README.md#forwardrequest).
  - **Secret Value:** The actual secret value. Use `$CLIENT_SECRET` in your `data`, `params`, `headers`, or `url` fields where the real secret should be inserted.
  - **Locked:** Controls access to this key. If **Locked** is enabled, only logged-in users can use it. If disabled, any user can use it.
  - **Destinations:** Optional. Comma-separated URLs this key may be sent to, such as `https://api.example.com/v1`. Leave it empty to allow any URL. See [Restricting Where a Key Can Be Sent](#restricting-where-a-key-can-be-sent).

4. Click **Register**.

:::warning Secret keys are a project setting
Registering, listing, replacing and deleting them belong to the **project owner's Skapi account**, and to Skapi staff when you ask Skapi for help. Listing them answers with the stored secret values, so it is owner only as well. An [admin](/admin/permissions.md#project-settings-belong-to-the-project-owner) of your project, access group `99` included, is refused with `INVALID_REQUEST` and `Only the project owner can change project settings.`
Using a saved key with [`forwardRequest()`](/api-reference/api-bridge/README.md#forwardrequest) is unchanged for every user of your project.
:::


## Sending Requests to Third-Party APIs

After you register your secret key, use [`forwardRequest(form, options)`](/api-reference/api-bridge/README.md#forwardrequest) to send secure requests to third-party APIs.

The example below sends a `POST` request to a third-party API using a key saved as `YourSecretKeyName`. It places `$CLIENT_SECRET` in the `Authorization` header.

```js
skapi.forwardRequest(null, {
    secretName: 'YourSecretKeyName',
    url: 'https://third.party.com/api',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer $CLIENT_SECRET'
    }
})
```

The first argument is the request body, a form or a plain object. This request sends none, so it passes `null`. The `options` object supports these fields, among others:

- `secretName`: Name of the secret key registered in your Skapi project. Optional: a request that names none is forwarded with only what you supplied, and nothing is substituted.
- `url`: Third-party API endpoint URL.
- `method`: HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, or `HEAD`). Defaults to `POST`.
- `headers`: Request headers as key-value pairs. A name starting with `x-skapi-` is refused.
- `data`: Request body as key-value pairs, merged over the first argument (used when `method` is not `GET`, `DELETE` or `HEAD`).
- `params`: Query parameters as key-value pairs, merged over the first argument (used when `method` is `GET`, `DELETE` or `HEAD`).
- `multipart`: Relay the form's own bytes, files included, instead of flattening it to fields.
- `skapiHeaders`: Tell the destination who is calling, from the verified identity of the request.
- `poll`: Polling interval in milliseconds. See [Polling for the Result](#polling-for-the-result) below. Must be a non-negative number.
- `expires`: Expiration time in seconds for the request record. After this period the record is removed and any poll returns an error.
- `queue`: Optional queue name. Requests sharing the same `url`, `method`, and `queue` value are processed sequentially on the server side. Useful for rate-limited APIs or operations that must not run in parallel. When omitted, requests are processed in parallel.
- `onResponse`: Callback called with the final API response. For non-queued requests it is called immediately alongside the returned promise. For queued requests it is called when polling resolves.
- `onError`: Callback called when the request or polling fails.

:::warning
When you name a `secretName`, include the `$CLIENT_SECRET` placeholder in at least one of these values: `data`, `params`, `headers`, or `url`. A request that names no secret needs no placeholder.
:::

For full parameter details, see the API reference below:

### [`forwardRequest(form, options): Promise<any>`](/api-reference/api-bridge/README.md#forwardrequest)

## Restricting Where a Key Can Be Sent

`forwardRequest()` takes its `url` from your frontend code, so anyone who can call it can also choose where the request goes. For a key that is not **Locked**, that includes visitors who are not signed in. Without a restriction, a key can be sent to any address, including one that records it.

Set **Destinations** on the key to close that. When a key has at least one destination, Skapi only sends it to a URL that matches one of them, and refuses every other request before anything leaves the server.

Each destination is a full URL, and a request URL matches when:

- **The scheme is the same.** `https://` and `http://` are different destinations.
- **The host is the same**, ignoring upper and lower case. `https://*.example.com` matches every subdomain of `example.com`, such as `api.example.com` or `eu.api.example.com`, but not `example.com` itself.
- **The port is the same.** When no port is written, `443` is used for `https://` and `80` for `http://`.
- **The path starts with the destination's path**, at a `/` boundary. `https://api.openai.com/v1` matches `https://api.openai.com/v1` and `https://api.openai.com/v1/chat/completions`, but not `https://api.openai.com/v10` or `https://api.openai.com/dashboard`. A destination without a path matches every path on that host.

The query string is never compared, so `$CLIENT_SECRET` can still go in a query parameter.

```js
// Key "my_secret" registered with Destinations: https://api.example.com/v1

skapi.forwardRequest(null, {
    secretName: 'my_secret',
    url: 'https://api.example.com/v1/chat/completions', // allowed
    method: 'POST',
    headers: { Authorization: 'Bearer $CLIENT_SECRET' }
});

skapi.forwardRequest(null, {
    secretName: 'my_secret',
    url: 'https://example.net/collect', // refused
    method: 'POST',
    headers: { Authorization: 'Bearer $CLIENT_SECRET' }
}).catch((err) => {
    console.log(err.code); // 'INVALID_REQUEST'
    console.log(err.message); // 'Destination is not allowed for this client secret.'
});
```

A key that has destinations is also sent with redirects turned off. If an allowed destination answers with a redirect, you receive that redirect response instead of Skapi following it to another address.

Queued requests are checked twice: when you make the request, and again right before it is sent. If you narrow a key's destinations while requests are waiting in a queue, the waiting requests that no longer match fail instead of being sent.

On a key that has destinations, a request URL is refused whatever those destinations say when it contains user info (`https://name@host`), spaces, backslashes, a placeholder such as `$CLIENT_SECRET` before the path, or `.` and `..` path segments. Each of those can make the address a server reads differ from the one that was compared, so none of them is matched, it is simply refused.

:::tip
Add destinations to every key that can reach a paid or private API. It costs nothing when your frontend only calls the addresses you list, and it means a copy of your frontend code cannot turn your key into someone else's.
:::

## Polling for the Result

Some third-party APIs are slow, or must be rate-limited so requests do not run in parallel. For these, run the request through a **queue** and **poll** for the result instead of waiting on a single response.

- Set `poll` to a polling interval in milliseconds (a non-negative number). When `poll > 0`, the request is queued, the promise resolves immediately with a status object (`id`, `status`, `queue_name`, `in_queue`), and the final result is delivered to your `onResponse` (or `onError`) callback once it is ready.
- When `poll` is `0` or omitted, the returned status object also carries a `poll()` method you can call to start polling manually.
- Add a `queue` name so requests sharing the same `url`, `method`, and `queue` are processed one at a time on the server.

```js
skapi.forwardRequest(null, {
    secretName: 'YourSecretKeyName',
    url: 'https://third.party.com/api',
    method: 'POST',
    queue: 'my-queue',
    poll: 1000, // check every second
    headers: { Authorization: 'Bearer $CLIENT_SECRET' },
    onResponse: (res) => console.log('final result', res),
    onError: (err) => console.error(err)
});
```

To stop watching a poll without cancelling the running request, use [`stopForwardRequestPolling()`](/api-reference/api-bridge/README.md#stopforwardrequestpolling); pick the result back up later by polling again. A stopped poll resolves with `{ status: 'stopped' }`, which [`isPollStopped()`](/api-reference/api-bridge/README.md#ispollstopped) detects.

## Request History

[`forwardRequestHistory()`](/api-reference/api-bridge/README.md#forwardrequesthistory) returns the past requests for a given `url` and `method` as a paginated list of [`RequestHistory`](/api-reference/data-types/README.md#requesthistory) items. Each item includes the `request_body`, the `response_body`, the `status`, and two timestamps in milliseconds: `created` (when the request was made) and `updated` (the most recent status change, i.e. when the response arrived for a settled request).

```js
skapi.forwardRequest(null, {
    secretName: 'YourSecretKeyName',
    url: 'https://third.party.com/api',
    method: 'POST',
    headers: { Authorization: 'Bearer $CLIENT_SECRET' }
}).then(() => skapi.forwardRequestHistory({
    url: 'https://third.party.com/api',
    method: 'POST'
})).then((history) => {
    for (const req of history.list) {
        console.log(req.created, req.updated, req.status);
    }
});
```

## Related Methods

- [`forwardRequestHistory(params, fetchOptions)`](/api-reference/api-bridge/README.md#forwardrequesthistory): list past requests (see above).
- [`cancelForwardRequest(params)`](/api-reference/api-bridge/README.md#cancelforwardrequest): cancel a queued or running request and remove it from the client-side queue.
- [`stopForwardRequestPolling(params?)`](/api-reference/api-bridge/README.md#stopforwardrequestpolling): stop polling locally without cancelling the request.
- [`isPollStopped(res)`](/api-reference/api-bridge/README.md#ispollstopped): tell a stopped-poll result apart from a real API response.
- [`forwardRequestQueueCount(params)`](/api-reference/api-bridge/README.md#forwardrequestqueuecount): how many requests are waiting in a named queue.
