## Client Secret Request

If you are using 3rd party API's that requires a client secret, you can use [`clientSecretRequest()`](/api-reference/api-bridge/README.md#clientsecretrequest) to make a secure `POST` or `GET` request to your 3rd party API's.

### [`clientSecretRequest(params): Promise<any>`](/api-reference/api-bridge/README.md#clientsecretrequest)

The list parameters of `params` of the method is shown as below:

  - `url`: A string representing the URL of your 3rd party API.
  - `clientSecretName`: A string representing the name of the client secret key you may have saved in your service dashboard.
  - `method`: A string representing the method of the request. It can be either "GET" or "POST".
  - `headers`: An object representing the headers of the request.
  - `data`: An object representing the data to be sent to your 3rd party API. It is only used when `method` is "POST".
  - `params`: An object representing the query string parameters of the request. It is only used when `method` is "GET".

:::warning
When using `clientSecretRequest()`, you must include the `$CLIENT_SECRET` placeholder string in the `data` or `params` or `headers` parameter value.
:::

## Example: Making a secure request to OpenAI API image generator.

As an example, we will be using the [OpenAI API](https://platform.openai.com/docs/api-reference/images/create?lang=curl) image generator from Skapi.

We will referencing the OpenAI API documentation to understand how to make secure requests to the API.

#### Prerequisites

1. Create an OpenAI account and get your API secret key from [here](https://beta.openai.com/account/api-keys).
2. Save your OpenAI API secret key in your service dashboard.
   For more information on how to save the client secret key, see [Client Secret Key](/service-settings/service-settings.html#client-secret-key). For this example save your OpenAI API key in the key name `openai`.
   We will use this key name when making the secure request to the OpenAI API.

#### Understanding the API call

In the API documentation, we can see that the API call is made as follows:

```
POST https://api.openai.com/v1/images/generations
```

This means the API call should be made using the `POST` method to the `https://api.openai.com/v1/images/generations` URL.

Next, you will see curl example of the API call:

``` bash
curl https://api.openai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "dall-e-3",
    "prompt": "A cute baby sea otter",
    "n": 1,
    "size": "1024x1024"
  }'
```

This means the API call to `https://api.openai.com/v1/images/generations` should be made with a `header` with `Content-Type` to `application/json` and `Authorization` to `Bearer $OPENAI_API_KEY`.
And the post data should contain properties like `model`, `prompt`, `n`, and `size`.

The `$OPENAI_API_KEY` is the API secret key that you have obtained from the OpenAI website. And it is meant to be replaced with your API secret key.

Since we cannot expose the API secret key in the frontend, we will be using the [`clientSecretRequest()`](/api-reference/api-bridge/README.md#clientsecretrequest) method to make a secure request to the OpenAI API:

```js
skapi.clientSecretRequest({
    clientSecretName: 'openai',
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer $CLIENT_SECRET'
    },
    data: {
        model: "dall-e-3",
        "prompt": "A cute baby sea otter",
        n: 1,
        size: "1024x1024"
    }
})
```

The example above shows how we can compose the request headers and data to make a secure request to the OpenAI API.
Note that we have used the `$CLIENT_SECRET` placeholder string in the `Authorization` header value,
and we have set `clientSecretName` to `openai` which is the key name that you may have saved your OpenAI API key in the service dashboard.

When the request is made, Skapi will replace the placeholder string with the client secret key that you have saved in your service dashboard, and return the response from the OpenAI API.