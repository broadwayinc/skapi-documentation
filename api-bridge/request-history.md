
# Fetching Request History

Every call made through `clientSecretRequest()` is stored in your project so the result can be retrieved later — even if the original call returned before the third-party API responded, or if the page was reloaded mid-request.

Use [`clientSecretRequestHistory(params, fetchOptions)`](/api-reference/api-bridge/README.md#clientsecretrequesthistory) to list past requests for a given `url` and `method`:

```js
const history = await skapi.clientSecretRequestHistory({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST'
});

console.log(history.list); // RequestHistory[]
```

## Timestamps

Every [`RequestHistory`](/api-reference/data-types/README.md#requesthistory) item carries two timestamps, both in milliseconds:

- `created`: when the request was made. It is set once and never changes, so it is the value to sort or display a request list by.
- `updated`: when the request status last changed. For a request that has settled (`resolved` or `failed`) this is when its response arrived, so `updated - created` is how long the third-party API took.

```js
const history = await skapi.clientSecretRequestHistory({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST'
});

for (const item of history.list) {
    console.log(new Date(item.created), item.status, item.updated - item.created + 'ms');
}
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

::: warning Queue names match as a prefix
A bare `queue` lookup is a prefix range: `queue: 'image'` also returns requests queued as
`'image-jobs'`, `'image-retry'`, and every other queue starting with `'image'`. Pass
`queue_exact: true` when you want only the named queue.
:::

## Exact Queue Matching

`queue_exact: true` restricts the listing to exactly the named queue:

```js
skapi.clientSecretRequestHistory({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    queue: 'image',
    queue_exact: true // 'image' only; 'image-jobs' etc. are excluded
});
```

The inverse also exists: `queue_exclude: '<name>'` drops one queue's rows from a listing,
which is how you fetch everything *except* a background queue.

Both filters are applied server-side after the range read, so a page can come back short
(or even empty) while more matches remain. Keep paging by `startKey`/`endOfList` as usual;
never treat a short page as the end of the list.

## Compact Listings

Request and response bodies can be large (file contents, long AI conversations). When you
only need to *list* requests (render a history view, label rows, check whether something
finished), pass `compact: true`:

```js
const history = await skapi.clientSecretRequestHistory({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    compact: true
});

for (const item of history.list) {
    // item.request_body / item.response_body are omitted. Instead:
    console.log(item.request_text);             // first text of the request's last user message, truncated
    console.log(item.response_text);            // the head of the response text, truncated
    console.log(item.response_complete_marker); // whether the response carried the completion marker
    console.log(item.compact);                  // true: bodies were deliberately omitted, not empty
}
```

Each item carries lightweight stubs **instead of** the full `request_body` and
`response_body`; the bodies never leave the server, so a page of heavy requests costs a
fraction of the bandwidth. `request_text` can be missing when a request body's shape has
no recognizable user message. When you do need a full body, re-fetch that listing without
`compact`, or `poll()` a still-running item, which always resolves with the full result.

For full parameter details, see the API reference:

### [`clientSecretRequestHistory(params, fetchOptions): Promise<DatabaseResponse<RequestHistory[]>>`](/api-reference/api-bridge/README.md#clientsecretrequesthistory)

