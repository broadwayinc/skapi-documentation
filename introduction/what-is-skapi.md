# What is Skapi?

Skapi is a serverless backend infrastructure platform for AI agents, web developers, and anyone who needs a secure, scalable backend without managing servers.

## What is backend infrastructure?

Backend infrastructure is the part of your service that users do not see directly. It handles authentication, data storage, permissions, and security.

For example, your frontend is what people interact with (buttons, pages, and forms). Your backend makes those features work safely and reliably behind the scenes.

Whether your project is a simple photo gallery or a large ticketing platform, you need backend infrastructure if your service runs online.

In Skapi, this backend infrastructure is called a **Service**.

With Skapi, you create one service per project. That service becomes the complete backend infrastructure for your web app.

## Creating a Service

1. Sign up for an account at [skapi.com](https://www.skapi.com/signup).
2. Log in, go to your services page, enter a service name, and click **Create**.

## Service Settings

You can set additional settings for your service.

- **Name:** The service name used to identify your service on the **My Services** page.

- **CORS:** Configure CORS to allow requests from specific domains. If left empty, CORS defaults to `*`. To restrict access, set one or more domains, for example, `https://example.com` or `https://example.com, https://example2.com`. Requests from domains not listed in CORS will be blocked. In production, set CORS to specific domains to help prevent unauthorized access to your service.

- **Allow Signup:**
  You can prevent user signups by turning off this option. This setting prevents new signups and account deletion in your service.
  When this option is off, only admins can create or disable user accounts from the **Users** page. This is useful for private services with a limited user group.

- **Allow Inquiries:**
  You can allow anonymous users to send inquiries to your service via [`sendInquiry()`](/api-reference/email/README.md#sendinquiry).
  When users send an inquiry, it is forwarded to your email. Turn this option off if you want to reduce spam.

- **Freeze Database:**
  You can freeze your database to prevent write operations.
  When the database is frozen, all user write operations are blocked and only read operations are allowed. When this option is enabled, only the service owner can write to the database.

- **Allow Anonymous Posts to Database:**
  You can allow anonymous users (users who are not logged in) to post public records to the database.
  Use caution when enabling this option, as it may increase the risk of malicious submissions. Make sure your app includes defensive validation when handling anonymous records.

- **Enable/Disable:**
  You can temporarily disable your service.
  This is useful during maintenance when you need to block access without losing data.
  When your service is disabled, all requests are blocked, and it appears as disabled on the **My Services** page.

:::warning
Disabling your service will not pause your subscription. You will still be charged for the service even when it is disabled.
:::

## Deleting Your Service

You can delete your service only under these conditions:
- your subscription has expired, or
- you are on the trial plan.

You can delete your service from the service settings page.

The **Delete Service** button is located at the bottom of the service settings page.

When you click **Delete Service**, you will be asked to confirm deletion.

:::danger
When you delete your service, all related data is permanently deleted and cannot be recovered.
:::