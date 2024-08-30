# Service Settings

You can setup basic settings for your services from your dashboard page.

## Service Name

You can set the service name in your service dashboard.

The service name can be used to identify your service in the **My Services** page, and also can be used to replace [`Automated Email's placeholders`](/email/email-templates.md#template-placeholders).

## CORS

In your service dashboard, you can set the CORS setting to allow the request from the specific domain.

When left empty, the CORS setting will be set to `*` by default. Otherwise, you can set the CORS setting to the specific domain, for example, `https://example.com`.
You can also set multiple domains by separating them with a comma, for example, `https://example.com,https://example2.com`.

When the CORS setting is configured, requests from other domains will be blocked.

## Secret Key

Skapi provides API bridge to your custom APIs.

Set your own secret key to protect your APIs from unauthorized access.
When you set the secret key, you can do [secure post request](/api-bridge/secure-post-request.html#secure-post-request) to your custom APIs.

## User Signup

You can prevent user signup by setting it to **Only admin allowed**.

This setting will prevent anyone from signing up to your service. Only the admin can create user accounts from the **Users** page.
This is useful when you want to create a private service for a specific group of users.

## Disable Service

You can disable your service temporarily from the service dashboard.
This is useful when you need to go under maintainance while temporarily blocking the access to your service without losing the data.
When you disable your service, all the requests to your service will be blocked, and the service will be shown as disabled in the **My Services** page.

:::warning
Disabling your service will not pause your subscription. You will still be charged for the service even when it is disabled.
:::

## Delete Service

:::tip
The delete service button will only be shown if your subscription has been expired, or you are in the trial plan.
:::

You can delete your service from the service dashboard.

The delete service button is located at the bottom of the service dashboard page.
When you click the delete service button, you will be asked to confirm the deletion of your service.

:::danger
When you delete your service, all the data related to your service will be deleted permanently, and cannot be recovered.
:::
