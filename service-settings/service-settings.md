# Service Settings

Go to your service page and click on the **Service Settings** menu.

On this page, you can configure settings for your service.

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


## Disable/Enable

You can disable your service temporarily from the service dashboard.

This is useful when you need to go under maintainance while temporarily blocking the access to your service without losing the data.
When you disable your service, all the requests to your service will be blocked, and the service will be shown as disabled in the **My Services** page.

:::warning
Disabling your service will not pause your subscription. You will still be charged for the service even when it is disabled.
:::


## Allow Signup

You can prevent user signup by turning off this option.
This setting will prevent anyone to signup or prevent anyone from removing their account in your service.

If this option is turned off, only the admin can create, disable user accounts from the **Users** page.
This is useful when you want to create a private service for a specific group of users.


## Prevent Inquiry

You can prevent users from sending inquiries to your service by turning off this option.

This is useful when you are not planning to use the [`sendInquiry()`](/api-reference/email/README.md#sendinquiry) method, and want to prevent spam.


## Freeze Database

You can freeze your database to prevent any write operations.

When you freeze your database, all your user's write operations will be blocked, and only the read operations will be allowed.
When this in enabled only the service owner can write to the database.