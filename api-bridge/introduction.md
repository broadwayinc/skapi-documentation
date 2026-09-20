# API Bridge

Skapi's API Bridge allows your project to connect external API's.

API Bridge provides [`forwardRequest()`](/api-reference/api-bridge/README.md#forwardrequest) and [`secureRequest()`](/api-reference/api-bridge/README.md#securerequest) methods to make secure requests to your custom API's.

[`forwardRequest()`](/api-reference/api-bridge/README.md#forwardrequest) relays a request to any destination you choose from Skapi's servers instead of from the browser, optionally substituting one of your stored secret keys into it, and can queue the request, poll for its result and stream the response back as it arrives.
[`secureRequest()`](/api-reference/api-bridge/README.md#securerequest) is used to make a secure request to your custom API's.
