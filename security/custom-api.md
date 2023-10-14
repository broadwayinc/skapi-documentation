# Custom API

Skapi provides API bridge to your custom API's. You can use your own custom API's to extend the functionality of your service.

### [`secureRequest(params): Promise<any>`](/api-reference/authentication/README.md#securerequest)

You can use [`secureRequest()`](/api-reference/authentication/README.md#securerequest) to make a secure request to your custom API's.

:::warning
User must be logged in to call this method
:::

The `params` object accepts the following properties:
 - `url`: A string representing the URL of your custom API.
 - `data`: An object representing the data to be sent to your custom API.

Below is an example of a user making a secure request to your custom API:

```js
skapi.secureRequest({
    url: 'https://your.custom.api.com/myapi',
    data: {
        some_data: 'Hello'
    }
}).then(response => {
    // response from your custom API
    console.log(response);
});
```

Skapi will mirror your request to your custom API. The request data will contain user's information and the secret key.
If you have set the secret key in your service dashboard, you can have your custom API's to check the secret key in the request data. If the secret key is not matched, you can return the error response.

Below is an example of handling the request from your custom API:

### Node.js Example

```js
const http = require('http');
http.createServer(function (request, response) {
if (request.url === '/myapi') {
    if (request.method === 'POST') {
        let body = '';

        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
            body = JSON.parse(body);
            console.log(body);
            // {
            //     user: {
            //         user_id: '',
            //         address: '',
            //         phone_number: '',
            //         email: '',
            //         name: '',
            //         locale: '',
            //         request_locale: ''
            //     },
            //     data: {
            //         some_data: 'Hello',
            //     },
            //     api_key: 'your api secret key'
            // }

            if (body.api_key && body.api_key === 'your api secret key') {
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