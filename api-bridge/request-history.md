
# Fetching Request History

Every call made through `clientSecretRequest()` is stored in your service so the result can be retrieved later — even if the original call returned before the third-party API responded, or if the page was reloaded mid-request.

Use [`clientSecretRequestHistory(params, fetchOptions)`](/api-reference/api-bridge/README.md#clientsecretrequesthistory) to list past requests for a given `url` and `method`:

```js
const history = await skapi.clientSecretRequestHistory({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST'
});

console.log(history.list); // RequestHistory[]
```

## Polling History Items

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

## Filtering by Status

Pass a `status` filter to return only requests in a specific state:

```js
skapi.clientSecretRequestHistory({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    status: 'pending'
});
```

## Filtering by Queue

If the original request used a `queue` name, pass the same `queue` to return only requests in that queue:

```js
skapi.clientSecretRequestHistory({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    queue: 'image-jobs'
});
```

For full parameter details, see the API reference:

### [`clientSecretRequestHistory(params, fetchOptions): Promise<DatabaseResponse<RequestHistory[]>>`](/api-reference/api-bridge/README.md#clientsecretrequesthistory)

