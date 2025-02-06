# Additional Settings

Go to your service page, and click on the **Service Settings** tab.

Below the toggle settings, you can see the additional settings you can configure for your service.

## Service Name

You can set the service name in your service settings.

The service name can be used to identify your service in the **My Services** page, and also can be used to replace [`Automated Email's placeholders`](/email/email-templates.md#template-placeholders).


## CORS

In your service settings, you can set the CORS setting to allow the request from the specific domain.

When left empty, the CORS setting will be set to `*` by default. Otherwise, you can set the CORS setting to the specific domain, for example, `https://example.com`.
You can also set multiple domains by separating them with a comma, for example, `https://example.com,https://example2.com`.

When the CORS setting is configured, requests from other domains will be blocked.

In production, it is recommended to set the CORS setting to the specific domain to prevent unauthorized access to your service.


## Secret Key

Skapi provides API bridge to your custom APIs.

For example, you might have your own external server that you want your users to connect to.

You can set your own secret key to protect your own APIs from unauthorized access.

For more information, refer [secure post request](/api-bridge/secure-post-request.html#secure-post-request) to your custom APIs.