# Service Settings

Go to your service page, and click on the **Service Settings** tab.

Here, you can see the information of your service data usage, subscription model for your service.

Below are some toggle settings you can configure for your service.

## Disable/Enable

You can disable your service temporarily from the service dashboard.

This is useful when you need to go under maintainance while temporarily blocking the access to your service without losing the data.
When you disable your service, all the requests to your service will be blocked, and the service will be shown as disabled in the **My Services** page.

:::warning
Disabling your service will not pause your subscription. You will still be charged for the service even when it is disabled.
:::


## Allow Signup

You can prevent user signup by turning off this option.

This setting will prevent anyone from signing up to your service. Only the admin can create user accounts from the **Users** page.
This is useful when you want to create a private service for a specific group of users.


## Prevent Inquiry

You can prevent users from sending inquiries to your service by turning off this option.

This is useful when you are not planning to use the [`sendInquiry()`](/api-reference/email/README.md#sendinquiry) method, and want to prevent spam.


## Freeze Database

You can freeze your database to prevent any write operations.

When you freeze your database, all your user's write operations will be blocked, and only the read operations will be allowed.