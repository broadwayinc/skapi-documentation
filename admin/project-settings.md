
# Project Settings

You can set advanced settings for your project.

- **Name:** The project name used to identify your project on the **My Projects** page.

- **CORS:** Configure CORS to allow requests from specific domains. If left empty, CORS defaults to `*`. To restrict access, set one or more domains, for example, `https://example.com` or `https://example.com, https://example2.com`. Requests from domains not listed in CORS will be blocked. In production, set CORS to specific domains to help prevent unauthorized access to your project.

- **Allow Signup:**
  You can prevent user signups by turning off this option. This setting prevents new signups and account deletion in your project.
  When this option is off, only admins can create or disable user accounts from the **Users** page. This is useful for private projects with a limited user group.

- **Allow Inquiries:**
  You can allow anonymous users to send inquiries to your project via [`sendInquiry()`](/api-reference/email/README.md#sendinquiry).
  When users send an inquiry, it is forwarded to your email. Turn this option off if you want to reduce spam.

- **Freeze Database:**
  You can freeze your database to prevent write operations.
  When the database is frozen, all user write operations are blocked and only read operations are allowed. When this option is enabled, only the project owner can write to the database.

- **Allow Anonymous Posts to Database:**
  You can allow anonymous users (users who are not logged in) to post public records to the database.
  Use caution when enabling this option, as it may increase the risk of malicious submissions. Make sure your app includes defensive validation when handling anonymous records.

- **Enable/Disable:**
  You can temporarily disable your project.
  This is useful during maintenance when you need to block access without losing data.
  When your project is disabled, all requests are blocked, and it appears as disabled on the **My Projects** page.

:::warning
Disabling your project will not pause your subscription. You will still be charged for the project even when it is disabled.
:::
