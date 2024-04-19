# Secure Post Request

You can use [`secureRequest()`](/api-reference/api-bridge/README.md#securerequest) to make a secure `POST` request to your custom API's.

### [`secureRequest(params): Promise<any>`](/api-reference/api-bridge/README.md#securerequest)

:::warning
User must be logged in to call this method
:::

:::warning
[`secureRequest()`](/api-reference/api-bridge/README.md#securerequest) Does not support HTML Forms.
:::

The `params` object accepts the following properties:
 - `url`: A string representing the URL of your custom API.
 - `data`: An object representing the data to be sent to your custom API.

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
If you have set the secret key in your service dashboard, the request will contain your secret key.
For more information on how to set the secret key, see [Secret Key](/service-settings/service-settings.html#secret-key).

You can have your custom API's to check the secret key in the request data. If the secret key is not matched, you can return the error response.

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
                //     "data": {"some_data": "Hello"},
                //     "api_key": 'your api secret key',
                // }

                if (body.api_key === 'your api secret key') {
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    // do something
                    response.end('success');
                } else {
                    response.writeHead(401, {'Content-Type': 'text/html'});
                    response.end("api key mismatch");
                }
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
        #     "data": {"some_data": "Hello"},
        #     "api_key": 'your api secret key',
        # }

        if self.path == "/myapi":
            if body.get("api_key") == "your api secret key":
                self.send_response(200)
                self.end_headers()
                self.wfile.write("success".encode("utf-8"))
            else:
                self.send_response(401)
                self.end_headers()
                self.wfile.write("api key mismatch".encode("utf-8"))

myServer = HTTPServer(("", 3000), MyServer)

try:
    myServer.serve_forever()
except KeyboardInterrupt:
    myServer.server_close()
```
