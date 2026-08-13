# Forward Request

[`forwardRequest()`](/api-reference/api-bridge/README.md#forwardrequest) forwards a request to **your own external backend** from Skapi's servers instead of from the browser, and streams the response back as it arrives.

:::warning
User must be logged in to call this method.
:::

Your backend recognises the call by the `x-api-key` header: Skapi adds it server side, using the API key string you set on your [project settings](/service-settings/additional.md) page. Your backend compares it against the same string, and rejects anything that does not match. The key never reaches the browser, so it cannot be read out of your frontend code.

Use it when the browser should not be the one talking to your backend: when the call must be attributable to a signed-in user, when your backend only accepts requests carrying your API key, or when the response is a stream you want to render as it arrives.

The `options` object accepts the following properties:
- `url`: Your backend's URL. Must be `http`/`https` and resolve to a public address.
- `method`: The HTTP method. Defaults to `POST`.
- `headers`: Headers to send **to your backend**. These travel outbound only; they have no effect on the response the browser sees, so putting CORS headers such as `Access-Control-Allow-Origin` here does nothing.
- `apiKeyHeader`: Which header carries your API key. Defaults to `x-api-key`.
- `apiKeyScheme`: A prefix for the key value, such as `Bearer`.
- `onStream`: Called with each chunk of the response as it arrives. Supplying this is what makes the call streaming.
- `responseType`: `json`, `text`, or `response` for the raw `Response` object.
- `signal`: An `AbortSignal` that cancels the forward and the request to your backend.

### [`forwardRequest(form, options): Promise<any>`](/api-reference/api-bridge/README.md#forwardrequest)

## Example: Forwarding a form to your backend

The first argument is the form itself, so a form reaches your backend without you rebuilding its payload. The body arrives exactly as the browser would have sent it, **files included**.

::: code-group

```html [Form]
<form onsubmit="skapi.forwardRequest(event, {
        url: 'https://api.yourbackend.com/report'
    }).then(res => console.log(res))">
    <input name="title" placeholder="Title" required>
    <input name="attachment" type="file">
    <input type="submit" value="Send">
</form>
```

```js [JS]
skapi.forwardRequest({
    title: 'Quarterly numbers'
}, {
    url: 'https://api.yourbackend.com/report',
    headers: {
        Accept: 'application/json'
    }
}).then(res => {
    console.log(res);
});
```

:::

The first argument can be a form submit event, a form element, a `FormData`, or a plain object.

## Example: Streaming a response

When your backend streams its response, such as a chat completion or a long report, pass `onStream` and render each chunk as it lands. The promise still resolves with the complete body at the end.

::: code-group

```html [Form]
<form onsubmit="skapi.forwardRequest(event, {
        url: 'https://api.yourbackend.com/chat',
        onStream: chunk => document.getElementById('output').textContent += chunk
    })">
    <textarea name="question" required>What were last quarter's numbers?</textarea>
    <input type="submit" value="Ask">
</form>

<pre id="output"></pre>
```

```js [JS]
let output = document.getElementById('output');

skapi.forwardRequest({
    question: "What were last quarter's numbers?"
}, {
    url: 'https://api.yourbackend.com/chat',
    onStream: chunk => {
        output.textContent += chunk;
    }
}).then(whole => {
    console.log('finished:', whole.length, 'characters');
});
```

:::

Server-sent events work the same way: your backend's `Content-Type` is preserved, so a `text/event-stream` response arrives as `data:` frames in the order they were produced.

## What the client receives

Your backend's **status code and response headers are passed through**, so a `404` from your backend reaches the caller as a `404`, and a custom `X-Request-Id` is readable in the browser.

Three groups are withheld, each because forwarding it would break something:

| withheld | why |
|---|---|
| `transfer-encoding`, `content-length`, `connection`, `content-encoding`, and other hop-by-hop headers | they describe your backend's connection, not the one delivering the stream to the browser |
| `access-control-*` | Skapi writes these from your project's CORS setting. A second copy from your backend would put two values in one header, which browsers reject outright |
| `set-cookie` | every project shares one forwarder endpoint, so a cookie from one backend would be stored against the shared domain and sent on another project's requests |

Skapi also sets `Access-Control-Expose-Headers` naming every header it forwarded. Without that, browsers hide all but a small safelist from `fetch`, and a header you set would read as `null` on the client even though it arrived.

:::info
CORS for the browser is answered by Skapi using your project's CORS setting, not by your backend. If the request is refused with `INVALID_CORS`, add the page's origin on your [project settings](/service-settings/additional.md) page.
:::

:::warning
A streaming form must not have an `action` attribute. With an `action`, the response is stored and the page navigates once the request resolves, which discards the stream.
:::

## What your backend receives

Alongside your `headers`, the forwarded request carries:

| header | value |
|---|---|
| `x-api-key` | The API key string from your project settings page, or `none` when the project has no key set. Skapi always sends this header, so a request arriving **without** it did not come through Skapi. Compare the value against your own key rather than merely checking that the header exists, since `none` is a non-empty string. |
| `x-skapi-user` | The signed-in user, as JSON, taken from the verified session. |
| `x-skapi-service` | Your project's service ID. |

The identity headers are written by Skapi, not by the caller: any request that tries to set an `x-skapi-` header itself is rejected, so your backend can trust them to attribute the call.

::: code-group

```js [Node]
app.post('/report', (req, res) => {
    // compare the VALUE: an unset project key arrives as the string "none"
    if (req.headers['x-api-key'] !== 'your api key string') {
        return res.status(401).end('api key mismatch');
    }

    let user = JSON.parse(req.headers['x-skapi-user']);
    console.log(user.user_id, 'sent a report');

    res.json({ received: true });
});
```

```py [Python]
@app.post("/report")
def report(request):
    # compare the VALUE: an unset project key arrives as the string "none"
    if request.headers.get("x-api-key") != "your api key string":
        return Response("api key mismatch", status=401)

    user = json.loads(request.headers["x-skapi-user"])
    print(user["user_id"], "sent a report")

    return {"received": True}
```

:::

To stream from a Python backend, respond with `text/event-stream` (or chunked plain text) and flush as you go; the chunks reach the browser as they are produced.

## Aborting

```js
let controller = new AbortController();

skapi.forwardRequest({ question: 'Long one' }, {
    url: 'https://api.yourbackend.com/chat',
    onStream: chunk => output.textContent += chunk,
    signal: controller.signal
});

// stop it, and the request to your backend with it
controller.abort();
```

## Errors

An error raised before your backend answers, such as a rejected URL or an unauthenticated caller, arrives as a `SkapiError` with the usual `code`.

Once your backend has answered, its status is already on the wire and cannot be taken back. If the connection then dies mid-stream, the body you receive ends with a marker instead of simply stopping, so a truncated answer is never mistaken for a complete one:

```
...partial output...
{"error":"STREAM_INTERRUPTED","message":"..."}
```

:::warning
Your backend must resolve to a public address. Private ranges, loopback, and cloud metadata addresses are refused, and the connection is pinned to the address that passed that check.
:::
