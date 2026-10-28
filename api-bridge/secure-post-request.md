# Secure Post Request

You can use [`secureRequest()`](/api-reference/api-bridge/README.md#securerequest) method to make a secure `POST` request to your custom API's.

:::warning
User must be logged in to call this method.
:::

:::warning
The [`secureRequest()`](/api-reference/api-bridge/README.md#securerequest) method does not support HTML Forms.
:::

The `params` object accepts the following properties:
 - `url`: A string representing the URL of your custom API.
 - `data`: An object representing the data to be sent to your custom API.

For more detailed information on all the parameters and options available with the [`secureRequest()`](/api-reference/api-bridge/README.md#securerequest) method, 
please refer to the API Reference below:

### [`secureRequest(params): Promise<any>`](/api-reference/api-bridge/README.md#securerequest)

## Example: Making a secure request to your custom API

Below is an example of a user making a secure request to your custom API that are hosted in `http://your.custom.api.com:3000/myapi`

```js
skapi.secureRequest({
    url: 'http://your.custom.api.com:3000/myapi',
    data: {
        some_data: 'Hello'
    }
}).then(response => {
    // response from your custom API
    console.log(response);
});
```

Skapi will mirror your request to your custom API. From your API, it receives user information along with the request data.

:::warning The request carries no secret key
The request body holds `user` and `data` only. The project secret key that used to be sent as `api_key` was retired, so your API cannot tell from the body alone that the request came through Skapi.

When your API has to check that, use [`forwardRequest()`](/api-bridge/forward-request.md) instead. Store a key on the [Secret Keys](/api-bridge/client-secret-request.md#registering-secret-keys) page, name it with `secretName`, and put `$CLIENT_SECRET` in a header your API checks. See [The project secret key](/deprecated/deprecated.md#the-project-secret-key-api-key).
:::

Below is an example of handling the request from your custom API:

## Node.js Example

```js
const http = require('http');

http.createServer(function (request, response) {
    if (request.method === 'POST') {
        if (request.url === '/myapi') {
            let body = '';

            request.on('data', function (data) {
                body += data;
            });

            request.on('end', function () {
                body = JSON.parse(body);
                console.log(body);

                // {
                //     "user": {
                //         "user_id": "...",
                //         "group": 1,
                //         "locale": "KR",
                //         "request_locale": "KR",
                //         ...
                //     },
                //     "data": {"some_data": "Hello"}
                // }

                response.writeHead(200, {'Content-Type': 'text/html'});
                // do something
                response.end('success');
            });
        }
    }
}).listen(3000);
```

## Python Example

```py
from http.server import BaseHTTPRequestHandler, HTTPServer
import json

class MyServer(BaseHTTPRequestHandler):
    def do_OPTION(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        print("POST")
        content_length = int(self.headers["Content-Length"])
        body = json.loads(self.rfile.read(content_length).decode("utf-8"))
        print(body)
        
        # {
        #     "user": {
        #         "user_id": "...",
        #         "group": 1,
        #         "locale": "KR",
        #         "request_locale": "KR",
        #         ...
        #     },
        #     "data": {"some_data": "Hello"}
        # }

        if self.path == "/myapi":
            self.send_response(200)
            self.end_headers()
            self.wfile.write("success".encode("utf-8"))

myServer = HTTPServer(("", 3000), MyServer)

try:
    myServer.serve_forever()
except KeyboardInterrupt:
    myServer.server_close()
```
