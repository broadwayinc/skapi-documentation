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
- `headers`: Headers to send **to your backend**. These travel outbound only; they have no effect on the response the browser sees, so putting CORS headers such as `Access-Control-Allow-Origin` here does nothing. Your body's `Content-Type` is forwarded automatically unless you set one here.
- `apiKeyHeader`: Which header carries your API key. Defaults to `x-api-key`.
- `apiKeyScheme`: A prefix for the key value, such as `Bearer`.
- `onStream`: Called with each chunk of the response as it arrives. Supplying this is what makes the call streaming.
- `responseType`: `json`, `text`, or `response` for the raw `Response` object.
- `signal`: An `AbortSignal` that stops the client receiving the rest of the response. The request already sent to your backend is **not** cancelled and runs to completion, so make the endpoint safe to abandon.

### [`forwardRequest(form, options): Promise<any>`](/api-reference/api-bridge/README.md#forwardrequest)

:::warning
The destination instructions travel in a header, so `url` plus `headers` (and the rest of the options) are capped at **4096 characters** of JSON. Past that the call throws `INVALID_PARAMETER`; put large values in the body instead.

These header names are **rejected** rather than ignored, failing the call with `INVALID_PARAMETER`: connection and framing headers (`host`, `content-length`, `connection`, `keep-alive`, `transfer-encoding`, `upgrade`, `te`, `trailer`, `proxy-authorization`, `proxy-connection`, `expect`), anything starting `x-skapi-`, and any value containing a line break.
:::

## Example: Forwarding a form to your backend

The first argument is the form itself, so a form reaches your backend without you rebuilding its payload. It is relayed as `multipart/form-data`, **files included**. The form's own `enctype` and `method` attributes are not used; the method comes from `options.method`.

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

Your backend's **status code and response headers are passed through** on the wire, so a `404` stays a `404` and a custom `X-Request-Id` arrives intact.

To read them from JavaScript, call with `responseType: 'response'` and use the raw `Response`. Without it the SDK resolves with the parsed body alone, and a non-2xx is thrown as a `SkapiError` whose `code` comes from your JSON body's `code` field (otherwise `ERROR`).

Three groups are withheld, each because forwarding it would break something:

| withheld | why |
|---|---|
| `transfer-encoding`, `content-length`, `connection`, and other hop-by-hop headers | they describe your backend's connection, not the one delivering the stream to the browser |
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

:::info Non-ASCII text in headers
An HTTP header carries bytes, not text, so a profile with a Korean name or an emoji cannot be put into one as it stands. `x-skapi-user` is therefore JSON with every non-ASCII character escaped as `\uXXXX`. It stays valid JSON, so `JSON.parse` (or `json.loads`) hands you the original text with nothing to undo.

Non-ASCII values in your own `headers` are sent as UTF-8 bytes instead, the same as any other HTTP client. Node and Python's `http.server` both decode incoming headers as Latin-1, so a backend reading such a header gets those bytes back with `Buffer.from(value, 'latin1').toString('utf8')` or `value.encode('latin1').decode('utf8')`. Values that cannot be sent at all, such as a line break, are refused with `INVALID_PARAMETER` rather than silently dropped.
:::

::: code-group

```js [Node]
const http = require('http');

http.createServer(function (request, response) {
    // Consume the body even when you are about to refuse the request: an unread
    // request stream keeps the connection from being reused, and a large upload
    // can reach the client as a reset instead of your status code. This is the
    // form payload, verbatim.
    const chunks = [];
    request.on('data', function (chunk) { chunks.push(chunk); });
    request.on('end', function () {
        const body = Buffer.concat(chunks);

        function reply(code, payload, contentType) {
            response.writeHead(code, {
                'content-type': contentType || 'text/plain',
                'content-length': Buffer.byteLength(payload)
            });
            response.end(payload);
        }

        if (request.method !== 'POST' || request.url !== '/report') {
            return reply(404, 'not found');
        }

        // compare the VALUE: an unset project key arrives as the string "none"
        if (request.headers['x-api-key'] !== 'your api key string') {
            return reply(401, 'api key mismatch');
        }

        const user = JSON.parse(request.headers['x-skapi-user']);
        console.log(user.user_id, 'sent a report');

        reply(200, JSON.stringify({ received: true }), 'application/json');
    });
}).listen(8000);
```

```py [Python]
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json

class Handler(BaseHTTPRequestHandler):
    # HTTP/1.1, so a streaming reply can be chunked. The default is 1.0, which
    # has no chunked encoding and closes the connection after every response.
    protocol_version = "HTTP/1.1"

    def do_POST(self):
        # Read the body even when you are about to refuse the request: bytes
        # left unread in the socket can reach the client as a reset connection
        # instead of your status code. This is the form payload, verbatim.
        body = self.rfile.read(int(self.headers.get("content-length") or 0))

        if self.path != "/report":
            return self.reply(404, b"not found")

        # compare the VALUE: an unset project key arrives as the string "none"
        if self.headers.get("x-api-key") != "your api key string":
            return self.reply(401, b"api key mismatch")

        user = json.loads(self.headers["x-skapi-user"])
        print(user["user_id"], "sent a report")

        self.reply(200, json.dumps({"received": True}).encode(), "application/json")

    def reply(self, code, body, content_type="text/plain"):
        self.send_response(code)
        self.send_header("content-type", content_type)
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

# Threaded: a forwarded request holds the connection open for as long as your
# handler takes, and the single-threaded default would serialize them.
ThreadingHTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
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

// stop receiving the response; the request already sent to your backend keeps running
controller.abort();
```

## Errors

An error raised before your backend answers, such as a rejected URL or an unauthenticated caller, arrives as a `SkapiError` with the usual `code`, whether or not you supplied `onStream`. Common ones: `INVALID_REQUEST` for a signed-out caller (`User login is required.`), `INVALID_PARAMETER` for a malformed url or header, `INVALID_CORS` when the page's origin is not on your project's CORS list, and `NOT_EXISTS` when the region has not published this feature yet.

Once your backend has answered, its status is already on the wire and cannot be taken back. If reading its body then fails mid-stream, the body you receive ends with a marker rather than simply stopping:

```
...partial output...
{"error":"STREAM_INTERRUPTED","message":"..."}
```

The marker is best effort: it covers a failure while reading your backend, which is the common case. A forwarder timeout or a broken connection to the browser can still end a stream without one, so treat a stream as complete only when your own payload says it is.

:::warning
Your backend must resolve to a public address. Private ranges, loopback, and cloud metadata addresses are refused, and the connection is pinned to the address that passed that check.
:::
