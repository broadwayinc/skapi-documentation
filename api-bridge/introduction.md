# API Bridge

Skapi's API Bridge allows your project to connect external API's.

API Bridge provides [`secureRequest()`](/api-reference/api-bridge/README.md#securerequest), [`clientSecretRequest()`](/api-reference/api-bridge/README.md#clientsecretrequest) and [`forwardRequest()`](/api-reference/api-bridge/README.md#forwardrequest) methods to make secure requests to your custom API's.

[`secureRequest()`](/api-reference/api-bridge/README.md#securerequest) is used to make a secure request to your custom API's.
[`clientSecretRequest()`](/api-reference/api-bridge/README.md#clientsecretrequest) is used to make a request to your 3rd party API with a client secret key.
[`forwardRequest()`](/api-reference/api-bridge/README.md#forwardrequest) is used to forward a request, including an HTML form and its files, to your own external backend, which recognises the call by your project's API key, and streams the response back as it arrives.