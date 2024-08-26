# AI Image Generator

Skapi provides API Bridge to make requests to 3rd party APIs.
You can save your API keys in your servce dashboard and make requests to 3rd party APIs without exposing your API keys to the public.
This tutorial will show you how you can provide an AI image generating service using OpenAI's API.

## Files to Read

```
.
├─ image-generator
│  └─ image-generator.html
```
::: warning
Note that this is the extension of the previous tutorials, so you still need the complete project folders and files.

See the tutorial [Introduction](/full-example/intro.html) for more information.
:::

## Prerequisites

- You need to have an OpenAI account to use the API.
- You need to obtain the client secret key from OpenAI.
- You need to save your client secret key in your service dashboard.

  For more information, see [Client Secret Key](/service-settings/service-settings.html#client-secret-key).

## AI Image Generator

### image-generator/image-generator.html

```html
<!--
    This page provides AI image generation using OpenAI's API.
-->
<!DOCTYPE html>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script src="../service.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/modern-init-css@latest/init.css">
<link rel="stylesheet" href="../custom.css">

<!--
    Following <script> will check if the user is logged in.
    If the user is not logged in, it will redirect the user to ../index.html page.
-->
<script>
    let user = skapi.getProfile().then(u => {
        if (!u) {
            location.href = '../index.html';
        }
        return u;
    });
</script>

<main id="main_page">
    <div class="spaceBetween">
        <h2>Image Generator</h2>
        <a href="../index.html">Back</a>
    </div>
    <hr>
    <div id="generated">
        <p>Describe an image you want to generate</p>
    </div>
    <style>
        #generated img {
            width: 100%;
        }
    </style>
    <form onsubmit="
        /*
        We will use the clientSecretRequest() method to call the OpenAI's API.
        We will pass the url, method, headers and post data according to the OpenAI's API documentation.
        The client secret name is the key name of the client secret you may have saved in the service dashboard.
        
        For more information about the setting your client secret keys,
        visit: https://docs.skapi.com/service-settings/service-settings.html#client-secret-key
        
        When successful, it will return the response data.
        When unsuccessful, it will return the error object.
        */
        generated.innerHTML = /*html*/ `<p>Generating... Please wait</p>`;

        // Disable the form while the request is being processed.
        // The function is defined in the service.js file.
        disableForm(this, true);

        skapi.clientSecretRequest(event).then(r => {
            if (r.error) {
                generated.innerHTML = /*html*/ `<p>Describe an image you want to generate</p>`;
                alert(r.error.message);
                return;
            }

            let data = r.data[0]
            let html = /*html*/ `
                <img src='${data.url}'>
                <p>${data.revised_prompt}</p>`;

            generated.innerHTML = html;
        }).finally(() => {
            disableForm(this, false);
        });
    ">
        <input name="clientSecretName" hidden value="openai">
        <input name="url" hidden value="https://api.openai.com/v1/images/generations">
        <input name="method" hidden value="POST">
        <input name="headers[Content-Type]" hidden value='application/json'>
        <input name="headers[Authorization]" hidden value="Bearer $CLIENT_SECRET">
        <input name="data[model]" hidden value="dall-e-3">
        <input name="data[n]" type='number' hidden value="1">
        <input name="data[size]" hidden value="1024x1024">
        <input name="data[style]" hidden value="vivid">
        <textarea name='data[prompt]' rows="4" placeholder="Describe an image" required></textarea>
        <input type="submit" value="Generate">
    </form>
    <style>
        textarea {
            width: 100%;
        }
    </style>
</main>
```