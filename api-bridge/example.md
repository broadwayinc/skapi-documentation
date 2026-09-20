
# OpenAI Images API

In this example, you will use Skapi to call the [OpenAI Images API](https://developers.openai.com/api/reference/resources/images/methods/generate) securely.

First, we review the OpenAI API request format. Then we build the same request with `forwardRequest()`.

#### Prerequisites

1. Create an OpenAI account and get your API secret key from [platform.openai.com](https://platform.openai.com/).
2. Save your OpenAI API secret key on the **Secret Keys** page in Skapi.

  For this example, save the key with the name `openai`.

  You will use this name as `secretName` in the request.

#### Understanding the API call

According to the API documentation, the endpoint is:

```
POST https://api.openai.com/v1/images/generations
```

This means the request uses `POST` to `https://api.openai.com/v1/images/generations`.

The curl example looks like this:

``` bash
curl https://api.openai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-image-1.5",
    "prompt": "A cute baby sea otter",
    "n": 1,
    "size": "1024x1024"
  }'
```

From this example, the request needs these headers:

- `Content-Type: application/json`
- `Authorization: Bearer $OPENAI_API_KEY`

The request body should include fields such as `model`, `prompt`, `n`, and `size`.

`$OPENAI_API_KEY` is a placeholder for your OpenAI secret key.

Because secrets must not be exposed in frontend code, use [`forwardRequest()`](/api-reference/api-bridge/README.md#forwardrequest) and pass `Bearer $CLIENT_SECRET` instead.

The first argument is the **form**, so the form's own fields become the request body. The destination, the method and the headers go in the second argument:
::: code-group

```html [Form]
<form onsubmit="skapi.forwardRequest(event, {
      secretName: 'openai',
      url: 'https://api.openai.com/v1/images/generations',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer $CLIENT_SECRET'
      }
  }).then(r=>console.log(r))">
  <input name="model" hidden value="gpt-image-1.5">
  <input name="n" hidden type='number' value="1">
  <input name="size" hidden value="1024x1024">
  <textarea name='prompt' required>A cute baby sea otter</textarea>
  <input type="submit" value="Generate">
</form>
```

```js [JS]
skapi.forwardRequest({
    model: "gpt-image-1.5",
    "prompt": "A cute baby sea otter",
    n: 1,
    size: "1024x1024"
}, {
    secretName: 'openai',
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer $CLIENT_SECRET'
    },
    onResponse(result) {
        console.log(result);
    }
})
```
:::
The example above shows how to build request headers and body data for a secure OpenAI API call.
Use `$CLIENT_SECRET` in the `Authorization` header and set `secretName` to `openai`, which is the key name saved in your Skapi dashboard.

The two calls send the same request. In the form version the fields `model`, `n`, `size` and `prompt` are flattened and merged into the request body, because the method is `POST`; in the JavaScript version they are written out as `data`. Passing `null` as the first argument is how you say "no form, everything is in the options".

:::warning
The form is flattened to plain fields, and a **file input would be dropped**. This request has none. See [multipart](/api-bridge/forward-request.md#sending-the-raw-form-body-with-multipart) for sending a form's files.
:::

When the request runs, Skapi replaces `$CLIENT_SECRET` with your stored secret key and returns the response from the OpenAI API via the `onResponse` callback.

