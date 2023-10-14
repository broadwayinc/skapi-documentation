# API Security

Skapi provides a security setting to protect your service from unauthorized access. You can set the security setting in your service dashboard.

## Cors

In your service dashboard, you can set the cors setting to allow the request from the specific domain.
When left empty, the cors setting will be set to `*` by default. Otherwise, you can set the cors setting to the specific domain, for example, `https://example.com`.

You can also set multiple domains by separating them with a comma, for example, `https://example.com,https://example2.com`.

When the cors setting is set, the request from the other domain will be blocked.

## Secret Key

Skapi provides API bridge to your custom API's. To protect your API from unauthorized access, you can set the secret key in your service dashboard.

When you set the secret key, you can have your custom API's to check the secret key in the request header. If the secret key is not matched, you can return the error response.
