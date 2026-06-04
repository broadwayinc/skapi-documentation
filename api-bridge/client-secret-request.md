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
