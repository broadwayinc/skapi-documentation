
# Streaming the Response

By default, a queued [`clientSecretRequest()`](/api-reference/api-bridge/README.md#clientsecretrequest) waits for the destination to finish, downloads the whole response, and stores it on the request. Pass `stream: true` and the server reads the response **incrementally** instead, relaying the raw bytes as they arrive. Your `onStream` callback receives them in order, so you can act on the beginning of a response while the destination is still producing the end of it.

Anything that answers incrementally works: a Server-Sent Events endpoint, an NDJSON export, a log tail, a progress feed, a long report a vendor writes row by row. Skapi relays the bytes and reads none of them, so the format is entirely between you and the destination.

## What streaming gives you, and what it does not

Streaming does not make the destination faster. A request that takes 30 seconds to answer still takes 30 seconds. What changes is when you can use it: the first piece arrives after the first piece is produced, instead of after the last one.

Three things are worth being blunt about before you write any code:

1. **Skapi does not parse the stream.** It relays bytes and never inspects them, so decoding whatever framing your destination uses is your code's job. That is deliberate: it is what makes this work against any destination rather than a list of blessed ones.
2. **A streamed request settles with a status and no body.** The relayed bytes live in a chunk store, not on the request, so its history entry stays empty until you say what should be kept with [`clientSecretRequestFinalize()`](#finalizing-what-to-keep).
3. **Your destination has to be streaming too.** `stream: true` only says how Skapi should READ the response. Asking the destination to produce one incrementally is part of your own request, so whatever that API requires (most spell it `"stream": true` in the body) goes in `data` as usual. Set only Skapi's half and you get one ordinary document relayed in pieces, with no error to tell you so. Set only the destination's and Skapi buffers the whole event transcript into the stored response, where a reader expecting that API's normal document finds a wall of `data: {...}` lines. Neither half-set case raises: your request body is yours and is never inspected.

## Streaming a request

`stream` needs a queue, because the relayed text is appended to a polling row and only a queued request has one. The SDK mints a queue name for you when you do not give one, so in practice you just set the flag. (The endpoint refuses a streamed request with no queue rather than silently handing back a buffered answer. You are unlikely to see it through the SDK, which mints a queue name before it validates.)

The example below uses a Server-Sent Events endpoint, because SSE is the most common incremental format and OpenAI's chat completions API is a recognisable one to read; the mechanism is the same for any other. Note that `stream: true` is set alongside the `stream` this particular destination takes in its own body, and that the SSE decoding is entirely the caller's business:

```html
<pre id="output"></pre>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
const skapi = new Skapi("<Project ID>");

let output = document.getElementById('output');
let buffer = '';   // holds a frame that arrived cut in half
let answer = '';   // the text as we have assembled it

// Your format, your parser. Skapi handed us raw bytes and knows nothing about SSE.
function readEvents(chunk) {
    buffer += chunk;
    let frames = buffer.split('\n\n');
    buffer = frames.pop();  // the last piece may be half written, keep it for next time

    for (let frame of frames) {
        for (let line of frame.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            let payload = line.slice(6);
            if (payload === '[DONE]') return;
            let delta = JSON.parse(payload).choices[0].delta.content || '';
            answer += delta;
            output.textContent = answer;
        }
    }
}

skapi.clientSecretRequest({
    clientSecretName: 'openai',
    url: 'https://api.openai.com/v1/chat/completions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer $CLIENT_SECRET'
    },
    data: {
        model: 'gpt-4.1',
        // This "stream" is OpenAI's own field, asking IT to answer in pieces.
        // Skapi passes it through without looking at it.
        stream: true,
        messages: [{ role: 'user', content: 'Explain HTTP polling in two paragraphs.' }]
    },
    // And this one is Skapi's, telling it to relay that answer as it arrives.
    stream: true,
    poll: 1000,
    onStream: (chunk, seq) => readEvents(chunk)
}).then(res => {
    // A streamed request settles with a status and NO body: the text was the stream.
    console.log(res.status); // "resolved"

    // Keep what we assembled as this request's history, and release the chunks.
    return skapi.clientSecretRequestFinalize(res.id, answer, {
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'POST'
    });
});
</script>
```

Three parameters are added to `clientSecretRequest()` for this:

- `stream`: relay the destination's response incrementally instead of buffering it. Requires a queue (one is minted if you do not name it). Never sent to the destination.
- `realtime`: also push each relayed piece over skapi's websocket, so it arrives as it is relayed instead of on the next poll tick. Optional accelerator, covered under [Faster delivery over the websocket](#faster-delivery-over-the-websocket).
- `onStream`: `(chunk: string, seq: number, via?: 'socket' | 'poll') => void`. Called with each relayed piece, in order, with raw text. `via` names the transport that carried it, and is covered in that same section.

Chunk boundaries are set by how fast the destination writes, not by your format, so a chunk can end in the middle of a frame. Buffer until your own framing says a unit is complete, as the example does. Multi-byte characters are never split across chunks.

The presence of `onStream` is what makes the poll loop fetch chunks at all. A poll without it sends no cursor and gets exactly the response it got before streaming existed, which is what lets a second reader watch the same request for its outcome only, paying nothing for text it does not want.

When you omit `poll`, the promise resolves with the status object and its `poll()` method instead, and you pass the callback there:

```js
const res = await skapi.clientSecretRequest({
    clientSecretName: 'openai',
    url: 'https://api.openai.com/v1/chat/completions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer $CLIENT_SECRET'
    },
    data: { model: 'gpt-4.1', stream: true, messages: [/* ... */] },
    stream: true
});

// res = { id, status: 'pending', queue_name, in_queue, poll }
res.poll({ latency: 1000, onStream: (chunk) => readEvents(chunk) });
```

:::warning
The relayed bytes are decoded as **UTF-8, and only UTF-8**. A `charset` in the destination's response headers is ignored, because the streaming shape almost never declares an honest one. A destination that answers a streamed request in some other encoding gets `U+FFFD` where its non-ASCII characters were, and should be called without `stream`.
:::

## Reading a request you did not start

`onStream` on `clientSecretRequest()` only reaches the caller that started the request. The page was reloaded, a second tab is watching, or an old request is being opened from history and was never finalized: for all of those, use `clientSecretRequestStream()`.

Give it the request id and it does the right thing for the state the request is in:

- **Still running:** polls and delivers text through `onStream` until the request settles, then resolves with its terminal status.
- **Finished, not finalized:** fetches the whole stored text at once (paging internally until there is none left), delivers it through `onStream` in order, and resolves. This is what makes an unfinalized request re-readable.
- **Already finalized:** resolves with the stored body itself, exactly the value you kept. Nothing streams, because the chunks were released when that version was stored.

```js
// Started somewhere else, id kept in storage.
localStorage.setItem('pending_turn', res.id);

// ...after a reload, or in another tab
let requestId = localStorage.getItem('pending_turn');

const restored = await skapi.clientSecretRequestStream(requestId, {
    url: 'https://api.openai.com/v1/chat/completions',
    method: 'POST',
    poll: 1000,                     // interval while it is still running, default 1000
    onStream: (chunk) => readEvents(chunk)
});
```

```ts
clientSecretRequestStream(
    requestId: string, // "stamp:entropy" as returned by the request, or an already composed full id.
    options: {
        url?: string; // The url the request was sent to. Required unless requestId is a full id.
        method?: 'GET' | 'POST' | 'DELETE' | 'PUT'; // Required unless requestId is a full id.
        onStream?: (chunk: string, seq: number, via?: 'socket' | 'poll') => void; // Each relayed piece, in order. Raw text.
        realtimeGroup?: string; // The realtime_group the dispatching call handed back. See Faster delivery below.
        since?: number; // Start after this sequence number instead of from the beginning.
        poll?: number; // Polling interval in ms while the request is still running. Default 1000.
        onResponse?: (res: any) => void; // Called once with whatever this resolves with.
        onError?: (err: any) => void; // Called if the read itself fails.
    }
): Promise<any> & { stop: () => void }
```

`since` is there so a reader that already holds part of a response does not receive it twice. The returned promise carries a `stop()` that ends the read without touching the request, and it is registered like any other poll, so [`stopClientSecretPolling()`](/api-reference/api-bridge/README.md#stopclientsecretpolling) reaches it too when called with the request's `url`, `method` and `id`, or with no arguments at all.

Telling the two resolutions apart takes all three fields: a status envelope always carries `status`, `id` and `in_queue` **together**, and anything that does not is a finalized body. Do not test `status` alone, because the body you finalized may carry a `status` field of its own, and most destinations' responses do. This is exactly the test the SDK uses internally.

:::tip
Only the caller who made a request can read it back. The identity half of a request id is taken from the request context on the server and never travels, so an id that is not yours composes a key that does not exist. For a signed-in user that identity is the account; for a visitor who is not signed in it is the IP and user agent pair, so a request made while signed out is not readable from another browser or another network.
:::

## Faster delivery over the websocket

The poll decides how quickly relayed text reaches you: at `poll: 1000` a piece written just after a tick waits nearly a second for the next one. Pass `realtime: true` and the server ALSO pushes each piece over skapi's websocket as it relays it, so it arrives as soon as it exists.

```js
const res = await skapi.clientSecretRequest({
    clientSecretName: 'my_secret',
    url: 'https://api.example.com/v1/report',
    method: 'POST',
    data: { report: 'quarterly', stream: true },
    stream: true,
    realtime: true,
    poll: 1000,
    onStream: (chunk, seq, via) => { output.textContent += chunk; }
});
```

**It is an accelerator, never the source of truth.** The poll keeps running and keeps reading the same chunk store it always did. Everything it implies follows from that:

- No websocket in this environment, no session to open one with, a connection that will not open, a connection that drops mid-response: none of them are errors and none of them are reported. The read continues at poll speed, which is the behaviour with no websocket at all.
- Nothing is delivered twice and nothing arrives out of order, whichever transport carried it. A piece the websocket delivers is skipped by the poll, and a piece that arrives ahead of one still missing is held until the gap is filled rather than handed over early.
- Every piece is in the chunk store either way, so a response is re-readable in full with `clientSecretRequestStream()` regardless of how it was delivered live.

Because both transports hand their text to the same `onStream`, a response delivered perfectly over the websocket and one polled the whole way look identical from the outside. The third argument is the difference: `via` is `'socket'` when the websocket got there first, `'poll'` when the poll did. It is there to be observed, not acted on, and a callback that ignores it reads exactly as it did before.

```js
onStream: (chunk, seq, via) => {
    if (via === 'socket') console.log('live', seq);
    output.textContent += chunk;
}
```

`realtime: true` only makes a difference alongside `stream: true` and an `onStream` callback: without somewhere to put the text there is nothing to deliver faster, and skapi will not open a connection your application did not ask for.

### What it does to your own websocket

Skapi's realtime connection is shared, and this borrows it:

- A connection your application already opened is **not** replaced, its callback is not changed, and it is not closed. These pieces are read off the socket directly, so your own realtime callback never sees them.
- A connection skapi opens for a read is closed by that read, and only while it is still the one skapi opened.
- Joining a room **replaces** the room the connection was in, and the room is left when the read settles rather than restored, because the SDK cannot read which room you were in. If your application uses realtime rooms of its own, re-join yours after the request settles.
- One connection is in one room at a time, so two responses streaming at once cannot both listen. The first takes the room and the second reads at poll speed rather than evicting a reader mid-response.

An application that never calls `connectRealtime()` has none of this to think about.

### Re-attaching later

The reply to a `realtime: true` request carries `realtime_group`. It cannot be rebuilt from a request ID, so keep it beside the ID if you may want to re-attach:

```js
localStorage.setItem('pending', JSON.stringify({ id: res.id, group: res.realtime_group }));

// ...after a reload
const saved = JSON.parse(localStorage.getItem('pending'));
await skapi.clientSecretRequestStream(saved.id, {
    url: 'https://api.example.com/v1/report',
    method: 'POST',
    realtimeGroup: saved.group,
    onStream: (chunk, seq, via) => { output.textContent += chunk; }
});
```

Everything above holds for this read too. Omit `realtimeGroup` and it works exactly as it always has, at poll speed.

## Finalizing what to keep

A streamed request settles with a status and no body. Skapi never decides what those chunks add up to, because it never read them. `clientSecretRequestFinalize()` is where you say:

```js
await skapi.clientSecretRequestFinalize(requestId, answer, {
    url: 'https://api.openai.com/v1/chat/completions',
    method: 'POST'
});
// { finalized: true, message: 'Finalized.' }
```

```ts
clientSecretRequestFinalize(
    requestId: string, // "stamp:entropy", or an already composed full id.
    data?: any, // The version to keep. Sent verbatim and stored as given.
    options?: {
        url?: string; // Required unless requestId is a full id.
        method?: 'GET' | 'POST' | 'DELETE' | 'PUT'; // Required unless requestId is a full id.
    }
): Promise<{ finalized: boolean; message: string }>
```

What you send becomes that request's stored result: the value [`clientSecretRequestHistory()`](/api-reference/api-bridge/README.md#clientsecretrequesthistory) lists as `response_body`, and the value a later poll of the same request hands back. The content is entirely yours. Skapi does not validate it, parse it, or interpret it: text you assembled from the chunks, a rebuilt response object, a summary, a single word, anything at all. It is stored as given and returned as given. Calling it with **no** `data` is not a no-op: it keeps `null` as the request's result and still releases the chunks, which destroys the relayed text. Pass what you actually want kept.

Storing that version is also what **releases the chunks**, which are deleted once the result lands.

:::warning
Chunks are kept **indefinitely** until you finalize. Nothing expires them on a timer. Until then, opening that request cold has to fetch and re-parse all of its chunks, so a request nobody finalized gets slower and more expensive to open, forever. (A reader that already holds a cursor only fetches past it, which is what `since` is for.) Finalize as soon as you have what you want: it is what turns a pile of relayed bytes into an ordinary history entry.

The one exception is `expires`. A request sent with it is removed when its history expires, and the removal takes its chunks with it. Cancelling a **live** streamed request with [`cancelClientSecretRequest()`](/api-reference/api-bridge/README.md#cancelclientsecretrequest) also discards them, so finalize first if you want to keep the part that arrived. Cancel only reaches a request that is still `pending` or `running`: a settled one is refused with `{ removed: false }`, so for a finished request finalize (or `expires`) is the only release.

:::

Finalizing twice simply replaces the kept version, so a call lost to the network can be repeated. `finalized: false` comes back with a message rather than an error in these cases:

| message | meaning |
|---|---|
| `Request not found.` | No such request for this caller. An id belonging to somebody else reads the same way, deliberately. |
| `The request has not finished yet.` | Only a settled request can be finalized. Finalizing a live one would race the worker's own settle. |
| `The request was not sent with stream, so its response is already stored.` | A buffered request's stored result **is** the destination's own answer, and that answer is not yours to overwrite. |
| `The request changed while it was being finalized. Try again.` | The row moved between the read and the write. Read it again and decide afresh. |

## What a poll returns

For a streamed request polled **with** `onStream` (which is what sends the cursor), a poll answers with the status object plus the chunks you do not have yet:

```js
{
    id: 'stamp:entropy',
    status: 'running',       // 'pending' | 'running' | 'resolved' | 'failed' | 'cancelled'
    queue_name: 'my-queue',
    in_queue: 1,
    stream: true,
    chunks: [ { seq: 41, txt: 'data: ...' }, { seq: 42, txt: 'data: ...' } ],
    last_seq: 42,            // send this back as the next cursor
    more: false
}
```

- While the request is **running or pending**, that is what every tick returns, with `chunks` carrying whatever arrived since the last one.
- Once it is **`resolved` or `failed` and not finalized**, the same shape comes back with the terminal `status`, and the chunks stay readable. This is the state `clientSecretRequestStream()` replays. A **`cancelled`** request is the exception: the cancel releases its chunks, so there is nothing left to replay.
- When it **failed**, the same shape also carries an `error` field. See below.
- Once it is **finalized**, the poll returns your stored body verbatim instead, with none of the envelope fields. The signal is the absence of `status`, `id` and `in_queue` together, not the absence of `status` on its own.

`more: true` means that read was capped, not that the request is unfinished: there is more text already written and waiting. The one exception is `more: true` with an empty `chunks` and an unchanged `last_seq`: that is the server saying the chunk read itself failed, not that a page is waiting. Treat it as "nothing known this tick" and poll again rather than as a truncation. The SDK distinguishes the two: on a real cap it goes straight back round for the next page rather than spending a whole interval per page, which is how a finished request replays in one pass, while on a degraded read it waits out the interval and, after three consecutive degraded reads on a settled request, gives up and resolves with what it has. **That last case is the one to guard**: a body assembled after a degraded read can be short, so check that your own parser saw the end of the response before you finalize, or you will store a truncation and release the chunks holding the rest. `last_seq` is the cursor to send back, and it stays at the value you sent when nothing new arrived.

A poll sent **without** `onStream` sends no cursor, so it returns the pre-streaming response key for key: no `chunks`, `last_seq`, `more`, `stream` or `error`. Those five are attached only when a cursor is present.

## When things fail

A failed request does not throw and does not reach `onError`, which is reserved for the poll itself failing. Read **with** `onStream`, it resolves with the status envelope carrying `status: 'failed'`, so check the status. Read without one, it resolves with the error payload on its own, exactly as a buffered failure always has.

**The destination answered with an error.** A response of 400 or above is never relayed into chunks. It is small, it is the destination's own error message, and it is stored on the request where every error reader already looks. The poll returns `status: 'failed'` and an `error` of `status_code`, `body` and `truncated`.

**The destination ran past the body budget.** A streamed read is bounded by the invocation's own clock, so a destination still sending at the end of it settles the request `failed` with the chunks that did arrive and a message saying it was still sending. A healthy answer is nowhere near that ceiling; a destination that trickles for many minutes will meet it.

**The stream died mid body.** The request goes terminal as `failed`, and **the part that arrived stays exactly where it is**. A request that died at 80% has 80% of a response sitting there, and the poll hands you the terminal status, the error, and those chunks in one response:

```js
{
    id: 'stamp:entropy',
    status: 'failed',
    queue_name: 'my-queue',
    in_queue: 0,
    stream: true,
    chunks: [ /* everything that did arrive */ ],
    last_seq: 118,
    more: false,
    error: {
        message: 'streamed response ended before completion: ...',
        status_code: 200,
        chunks: 118
    }
}
```

Read without `onStream`, a failed request answers with that error payload on its own rather than the status envelope, exactly as a buffered one always has.

You can read that partial answer back later with `clientSecretRequestStream()`, and you can finalize it: a failed request is still finalizable, so keeping the 80% that arrived is a normal thing to do.

## Streaming from your own backend instead

[`forwardRequest()`](/api-bridge/forward-request.md) also streams, and the two are for different jobs.

| | `clientSecretRequest({ stream: true })` | `forwardRequest()` |
|---|---|---|
| destination | any third party, authenticated with a stored client secret | **your own** backend, authenticated with your project's API key |
| transport | queued, relayed into a chunk store, read by polling | one HTTP connection held open, chunks pushed straight through |
| survives a reload | yes, re-attach with `clientSecretRequestStream()` | no, the response is gone with the connection |
| stored | yes, and stays stored until you finalize | nothing is stored |
| stopping | `stopClientSecretPolling()` stops watching, the request keeps running | an `AbortSignal` stops receiving, the request keeps running |

Reach for `forwardRequest()` when the destination is your own backend and a live connection is all you need. Reach for a streamed `clientSecretRequest()` when the secret belongs to a third party, or when the answer has to outlive the page that asked for it.

## A destination that is not SSE

Nothing above depends on Server-Sent Events. A destination that writes newline-delimited JSON needs no SSE parsing at all, just a buffer and a split, because the chunk boundaries Skapi hands you have nothing to do with the destination's own record boundaries:

```js
let carry = '';
const rows = [];

await skapi.clientSecretRequest({
    clientSecretName: 'vendor',
    url: 'https://api.vendor.example/v1/export',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer $CLIENT_SECRET'
    },
    data: { report: 'quarterly', format: 'ndjson' },
    stream: true,
    onStream(chunk) {
        carry += chunk;
        const lines = carry.split('\n');
        carry = lines.pop();          // the last piece may be half a line
        for (const line of lines) {
            if (line.trim()) rows.push(JSON.parse(line));
        }
    }
});
```

The rule is the same whatever the format: a chunk is an arbitrary slice of the byte stream, so hold the incomplete tail and carry it into the next one. Skapi guarantees only two things about the boundaries, that the pieces arrive in order and that a multi-byte UTF-8 character is never split across two of them.
