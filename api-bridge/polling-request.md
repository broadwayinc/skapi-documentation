
# Polling for the Result

Because third-party APIs can take time to respond, `clientSecretRequest()` uses a queue-and-poll model. Every call is queued on the server and you can poll for the result.

## Automatic polling with `poll`

Pass a `poll` interval (in milliseconds) together with `onResponse` and `onError` callbacks. With `poll` greater than `0`, Skapi auto-generates a queue and starts polling automatically; the final result is delivered to `onResponse` (and errors to `onError`). Note that when `onResponse` is provided, the awaited return value of `clientSecretRequest()` is the callback's return value, so don't rely on the returned promise for the status object in the auto-poll case. The immediate status object with a `poll()` method (`{ id, status, ... }`) is only returned when `poll` is omitted or `0` and `onResponse` is not supplied.

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

## Manual polling with `poll()`

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
    queue: 'image-queue',
    data: { model: 'gpt-image-1.5', prompt: 'A cute baby sea otter', n: 1, size: '1024x1024' }
});

// res = { id, status: 'running', queue_name, in_queue, poll }
res.poll({
    latency: 2000, // start polling at 2-second intervals
    onResponse(result) {
        console.log('Done:', result);
    },
    onError(err) {
        console.error('Failed:', err);
    }
});
```

:::warning
Only requests with status `running` or `pending` can be polled.
A request enters `running` or `pending` only when either `params.queue` (queue name) or `params.poll` (poll interval) is provided.
:::


## Stopping Polling

Polling and the request itself are separate things. `stopClientSecretPolling()` stops *watching* a
request; the server keeps working on it, and you can pick the result up later.

This matters because polling is real network traffic. A long-running request polled every second keeps
issuing calls for as long as it takes, whether or not anyone is looking at the result. Stop polling when
the user navigates away or the tab is hidden, and start again when they come back.

```js
// Stop watching one request. It keeps running on the server.
skapi.stopClientSecretPolling({
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    id: 'stamp:entropy'   // the id from the clientSecretRequest response
});

// Stop every poll on a queue.
skapi.stopClientSecretPolling({ queue: 'image-queue' });

// Stop everything this client is polling.
skapi.stopClientSecretPolling();
```

Each call returns how many polls it stopped.

### Handling a stopped poll

A stopped poll **resolves** with `{ id, status: 'stopped' }` rather than rejecting, so `await` sites do
not need a `catch`. Its `onResponse` and `onError` callbacks are **not** called, because a stop is not a
result. Use `isPollStopped()` to tell the two apart:

```js
const res = await skapi.clientSecretRequest({ /* ... */ });

const result = await res.poll({ latency: 2000 });

if (skapi.isPollStopped(result)) {
    // We stopped watching. Nothing failed, and the request may still be running.
    return;
}

console.log('Done:', result);
```

### Resuming

There is nothing to resume, as such — just poll again. Fetch the request from
[`clientSecretRequestHistory()`](/api-reference/api-bridge/README.md#clientsecretrequesthistory) and call
`poll()` on it. If it finished while you were not watching, the history entry already carries the result.

```js
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        skapi.stopClientSecretPolling({ queue: 'image-queue' });
    }
});
```

### [`stopClientSecretPolling(params?): number`](/api-reference/api-bridge/README.md#stopclientsecretpolling)

### [`isPollStopped(res): boolean`](/api-reference/api-bridge/README.md#ispollstopped)

:::tip
Requests sharing a queue are polled **one at a time**. A request that never settles therefore holds up
every poll queued behind it, so stopping it also unblocks the rest. Stopping a request that has not
started yet removes it from the queue entirely, freeing the slot immediately.
:::

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

:::info
`cancelClientSecretRequest()` cancels the **request**. [`stopClientSecretPolling()`](#stopping-polling)
only stops **watching** it — the request carries on and its result stays available. Use cancel when the
work is no longer wanted, and stop-polling when only the traffic is.
:::

### [`cancelClientSecretRequest(params): Promise<{ removed: boolean; message: string }>`](/api-reference/api-bridge/README.md#cancelclientsecretrequest)


## Checking Queue Size

To check how many requests are currently waiting in a named queue, use [`clientSecretRequestQueueCount()`](/api-reference/api-bridge/README.md#clientsecretrequestqueuecount):

```js
const info = await skapi.clientSecretRequestQueueCount({ queue: 'image-jobs' });
console.log(info.in_queue); // number of requests waiting
```

### [`clientSecretRequestQueueCount(params): Promise<{ queue_name: string; in_queue: number }>`](/api-reference/api-bridge/README.md#clientsecretrequestqueuecount)