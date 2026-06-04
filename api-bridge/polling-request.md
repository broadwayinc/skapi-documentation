
# Polling for the Result

Because third-party APIs can take time to respond, `clientSecretRequest()` uses a queue-and-poll model. Every call is queued on the server and you can poll for the result.

## Automatic polling with `poll`

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

:::warning
Only requests with status `running` or `pending` can be polled.
A request enters `running` or `pending` only when either `params.queue` (queue name) or `params.poll` (poll interval) is provided.
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

### [`cancelClientSecretRequest(params): Promise<{ removed: boolean; message: string }>`](/api-reference/api-bridge/README.md#cancelclientsecretrequest)


## Checking Queue Size

To check how many requests are currently waiting in a named queue, use [`getClientSecretRequestQueueCount()`](/api-reference/api-bridge/README.md#getclientsecretrequestqueuecount):

```js
const info = await skapi.getClientSecretRequestQueueCount({ queue: 'image-jobs' });
console.log(info.in_queue); // number of requests waiting
```

### [`getClientSecretRequestQueueCount(params): Promise<{ queue_name: string; in_queue: number }>`](/api-reference/api-bridge/README.md#getclientsecretrequestqueuecount)