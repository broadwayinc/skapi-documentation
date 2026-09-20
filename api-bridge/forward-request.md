# Forwarding Requests

[`forwardRequest(form, options)`](/api-reference/api-bridge/README.md#forwardrequest) relays a request to a destination of your choosing **from Skapi's servers** instead of from the browser. It is the method to reach for whenever the call should not leave the browser as it stands: because it carries a key the page must not hold, because it has to be queued or rate limited, because its answer has to outlive the page that asked for it, or because you want the response streamed as it arrives.

## Sending a request

```js
skapi.forwardRequest({ report: 'quarterly' }, {
    url: 'https://api.example.com/v1/report',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
}).then(res => console.log(res));
```

The first argument is the request body, here a plain object. Pass `null` when there is nothing to send.

To send a stored secret with the request, name it and put `$CLIENT_SECRET` where the value goes:

```js
skapi.forwardRequest({ report: 'quarterly' }, {
    secretName: 'my_secret',
    url: 'https://api.example.com/v1/report',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer $CLIENT_SECRET'
    }
});
```

The substitution happens on the server, so the secret never reaches the browser. Registering secrets, and restricting where each one may be sent, is on the [Secret Keys](/api-bridge/client-secret-request.md) page.

## The form is the first argument

The first argument is a **submit event**, a **form element**, a **`FormData`**, a **plain object**, or **`null`**. A submit event uses its target form, and the SDK calls `preventDefault()` for you, so `onsubmit="skapi.forwardRequest(event, { ... })"` works with nothing else to write.

By default the form is **flattened** into a plain key-value object and merged into the request:

- into **`params`** when the method is `GET`, `DELETE` or `HEAD`,
- into **`data`** for every other method.

Repeated field names collapse to an array, and bracketed names such as `name="filter[status]"` build nested objects, exactly as everywhere else in this SDK. Where the form and your options carry the same key, **the option wins**: you typed it at the call site, while the form's value was collected from a page.

::: code-group

```html [Form]
<form onsubmit="skapi.forwardRequest(event, {
        secretName: 'my_secret',
        url: 'https://api.example.com/v1/report',
        method: 'POST',
        headers: { Authorization: 'Bearer $CLIENT_SECRET' }
    }).then(res => console.log(res))">
    <input name="title" placeholder="Title" required>
    <textarea name="notes"></textarea>
    <input type="submit" value="Send">
</form>
```

```js [JS]
skapi.forwardRequest({ title: 'Quarterly numbers', notes: '' }, {
    secretName: 'my_secret',
    url: 'https://api.example.com/v1/report',
    method: 'POST',
    headers: { Authorization: 'Bearer $CLIENT_SECRET' }
}).then(res => console.log(res));
```

:::

Both calls send `{ title, notes }` as the request body.

:::warning Files are dropped
The flattened object is merged into `data` or `params` and travels as **JSON**, where a file has no representation. A file input in the form is therefore **dropped**, silently, along with a `File` or `Blob` value in a plain object. To send the file itself, use `multipart: true` below.
:::

## Sending the raw form body with multipart

`multipart: true` sends the body **byte for byte the way a browser posting that form would send it, files included**. Skapi builds the body with the platform's own `FormData` serialization, so the boundary, the part headers and the file bytes are exactly what `fetch()` would have written, and relays it to the destination with that same content type.

```js
skapi.forwardRequest(formElement, {
    secretName: 'my_secret',
    url: 'https://api.example.com/v1/upload',
    method: 'POST',
    headers: { Authorization: 'Bearer $CLIENT_SECRET' },
    multipart: true
});
```

:::warning Keep a multipart body under about 1.5 MB
A raw body rides the **ordinary request**, not a separate upload, so it shares that request's payload budget. Skapi caps a request at 2 MB, and the encoded body is capped at **2 MB minus 64 KB (2,031,616 characters)**, the headroom being for the url, the headers and the query string that share the same budget.

The cap is measured on the **base64 text**, and base64 costs four characters per three bytes, so the file itself has to be about a quarter smaller again: roughly **1.5 MB**. Past it the call throws `INVALID_PARAMETER` with the measured size in the message.

More than that, and the file belongs somewhere else: [upload it](/database/handling-files.md) first and send its url.
:::

`data` is **refused** alongside `multipart: true`, in the SDK and on the server both. There is no sane merge of a raw body with a key-value object, and either choice of which to drop would be a quiet surprise. `headers` and `params` are unaffected; your `Content-Type`, if you set one, is replaced by the multipart type the body actually has.

`multipart: true` needs a form: called with `null` it throws `INVALID_PARAMETER`. In an environment with no `FormData` or `Response`, it throws `NOT_SUPPORTED`.

## Naming a secret key is optional

`secretName` names one of your project's [Secret Keys](/api-bridge/client-secret-request.md#registering-secret-keys). It is **optional**.

**Named.** `$CLIENT_SECRET` is substituted server side in the `url`, the `headers`, `data` and `params`; the key's access group authorizes the caller; and the key's [Destinations](/api-bridge/client-secret-request.md#restricting-where-a-key-can-be-sent) are enforced before anything is sent. At least one value has to carry the placeholder, or the call is refused with `INVALID_PARAMETER`: there would be nothing for the secret to fill.

**Absent.** Nothing is resolved and no placeholder is required. The request is forwarded with only what you supplied. A literal `$CLIENT_SECRET` in a request that names no secret is just text you typed, and is sent as such.

:::info Signing in is not required
A signed-out visitor can call this, and the key's own **Locked** setting decides whether they may use it: a locked key needs a signed-in caller whose access group reaches the key's, an unlocked one is open to anyone.
:::

## Telling the destination who is calling

`skapiHeaders` is **off by default**: the destination is told nothing about the caller.

| value | sent |
|---|---|
| `true` | `x-skapi-user` and `x-skapi-service` |
| `{ user: true }` | `x-skapi-user` |
| `{ service: true }` | `x-skapi-service` |

- **`x-skapi-user`** is the signed-in caller's **user id**. A signed-out caller has none, so the header is **left out entirely** rather than sent empty, which lets a destination read its presence as "a signed-in caller".
- **`x-skapi-service`** is **the service this request runs against**, which is not necessarily the caller's own connection service.

Both values are written on the server from the **verified identity of the request**, never from anything typed at the call site.

:::warning The `x-skapi-` prefix is reserved
A header of your own whose name starts with `x-skapi-` is **refused** with `INVALID_PARAMETER`, whatever `skapiHeaders` says, matched without regard to case. Both the SDK and the server refuse it. That refusal is the whole value of the prefix: a caller who could set one of these headers could claim to be any user of any service, so a destination would have no reason to trust them.
:::

## Methods

`GET`, `POST`, `PUT`, `PATCH`, `DELETE` and `HEAD`. `POST` is the default, which is what a form with no method attribute of its own would have meant and what all but a read is.

`GET`, `DELETE` and `HEAD` carry the form's fields in the **query string** (`params`); everything else carries them in the **body** (`data`).

## Reading the answer

`responseType` shapes what the promise resolves with:

- `'text'` hands back a string, stringifying a value that is not one already.
- `'json'` parses a string, and hands the string back unchanged when it does not parse.
- Left out, the answer arrives exactly as the server stored it.

A Skapi status object, the envelope a queued request resolves with, is handed back **untouched** either way: reshaping it would corrupt the very fields it is read for.

The destination is called **server side** and its body is relayed, so there is no live `Response` object to hand back. The destination's own status code is the `status_code` of the row [`forwardRequestHistory()`](/api-bridge/request-history.md) lists.

`signal` takes an `AbortSignal`, and aborting it stops **this client's poll**. The request is already on the server and may already be running at the destination, so it is deliberately not cancelled: [`cancelForwardRequest()`](/api-bridge/polling-request.md#cancelling-a-request) is what removes it. A signal that is already aborted throws before anything is sent, and on the direct non-queued path there is no poll, so a signal does nothing there.

## Queueing, polling and streaming

Each of these has a page of its own:

- [Polling Requests](/api-bridge/polling-request.md): `poll`, `queue`, the `poll()` handle on the reply, stopping a poll, cancelling a request, and the queue count.
- [Streaming the Response](/api-bridge/streaming-request.md): `stream`, `realtime`, `onStream`, reading a request you did not start, and finalizing what to keep.
- [Request History](/api-bridge/request-history.md): listing past requests, and their timestamps.

```js
const res = await skapi.forwardRequest({ report: 'quarterly' }, {
    secretName: 'my_secret',
    url: 'https://api.example.com/v1/report',
    method: 'POST',
    headers: { Authorization: 'Bearer $CLIENT_SECRET' },
    queue: 'reports',
    poll: 1000,
    onResponse: (result) => console.log('final result', result),
    onError: (err) => console.error(err)
});
```

:::warning A streaming form must have no `action`
When a form carries an `action` attribute, the SDK stores the resolved value and navigates to that url once the request settles, which throws a stream away. Leave `action` off a form you stream from.
:::

## Errors

| code | when |
|---|---|
| `INVALID_PARAMETER` | a bad `method`, `multipart` with `data`, `multipart` with no form, a header in the `x-skapi-` namespace, a `secretName` with no `$CLIENT_SECRET` anywhere, a multipart body over the size cap, a negative `poll` |
| `INVALID_REQUEST` | an unknown `secretName`, no access to the named secret, a destination the secret is not allowed to be sent to, a `signal` that was already aborted |
| `NOT_SUPPORTED` | `multipart: true` in an environment with no `FormData` or `Response` |

A destination that answers with an error of its own is not one of these: that answer is relayed and stored like any other, and is read from the request's status and history.

### [`forwardRequest(form, options): Promise<any>`](/api-reference/api-bridge/README.md#forwardrequest)
