# Project Settings

Go to your project page and click on the **Project Settings** menu.

On this page, you can configure settings for your project.

## Project Name

You can set the project name in your project settings.

The project name can be used to identify your project in the **My Projects** page, and also can be used to replace [`Automated E-Mail's placeholders`](/email/email-templates.md#template-placeholders).


## CORS

In your project settings, you can set the CORS setting to allow the request from the specific domain.

When left empty, the CORS setting will be set to `*` by default. Otherwise, you can set the CORS setting to the specific domain, for example, `https://example.com`.
You can also set multiple domains by separating them with a comma, for example, `https://example.com,https://example2.com`.

When the CORS setting is configured, requests from other domains will be blocked.

In production, it is recommended to set the CORS setting to the specific domain to prevent unauthorized access to your project.


## Secret Key

Skapi provides API bridge to your custom APIs.

For example, you might have your own external server that you want your users to connect to.

You can set your own secret key to protect your own APIs from unauthorized access.

For more information, refer [secure post request](/api-bridge/secure-post-request.html#secure-post-request) to your custom APIs.


## Disable/Enable

You can disable your project temporarily from the project dashboard.

This is useful when you need to go under maintainance while temporarily blocking the access to your project without losing the data.
When you disable your project, all the requests to your project will be blocked, and the project will be shown as disabled in the **My Projects** page.

:::warning
Disabling your project will not pause your subscription. You will still be charged for the project even when it is disabled.
:::


## Allow Signup

You can prevent user signup by turning off this option.
This setting will prevent anyone to signup or prevent anyone from removing their account in your project.

If this option is turned off, only the admin can create, disable user accounts from the **Users** page.
This is useful when you want to create a private project for a specific group of users.


## Prevent Inquiry

You can prevent users from sending inquiries to your project by turning off this option.

This is useful when you are not planning to use the [`sendInquiry()`](/api-reference/email/README.md#sendinquiry) method, and want to prevent spam.


## Require Login

When this is on, database reads are refused to a visitor who is not signed in.

The SDK refuses them first: [`getRecords()`](/api-reference/database/README.md#getrecords), `getTables()`, `getTags()`, `getIndexes()` and `getUniqueId()` throw `REQUIRE_LOGIN` from a session with no signed-in user. Signed-in users are unaffected.

The four metadata listings are enforced on the **server** as well.
[`getTables()`](/api-reference/database/README.md#gettables), [`getTags()`](/api-reference/database/README.md#gettags), [`getIndexes()`](/api-reference/database/README.md#getindex) and [`getUniqueId()`](/api-reference/database/README.md#getuniqueid) are refused with `INVALID_REQUEST` when the request arrives with no signed-in user, so a direct API call, a script, or an older SDK with no gate is refused too.
A project that has **never set** this option counts as on, which is the same default every client already receives as `conf.require_login`.

:::warning
Those four listings used to be served to anyone who knew the project ID.
If you have an integration that reads table, tag, index or unique ID metadata without signing a user in, it will start getting an error. Turn this option off if that is what you intend.
:::

It is returned to every client as `conf.require_login` on [`getConnectionInfo()`](/api-reference/connection/README.md#getconnectioninfo), so a page can tell before any login whether it should show its own sign-in screen first.

**For the records themselves this is still a guard rail, not an access control.** Records in `access_group: 0` remain readable by anyone calling the API directly, whether or not this setting is on: only the SDK refuses `getRecords()`. What it prevents is your own app leaking public records through a signed-out page by accident. If data must not be readable without an account, do not store it in access group 0 - use `authorized`, `private`, or a higher group.

### What a signed-in caller still sees

This setting decides **whether** a caller reads the metadata, not how much of it they read, and only `getTables()` filters its answer by the caller.

- [`getTables()`](/api-reference/database/README.md#gettables) lists every table name in the project, whatever access group the records inside it live in. Its per access group record counters **are** filtered: the public counter for everyone, the counters up to and including the caller's own access group for a signed-in user, and the private and admin counters for admins and the project owner. `number_of_records` and `size` stay totals over every group.
- [`getTags()`](/api-reference/database/README.md#gettags) and [`getIndexes()`](/api-reference/database/README.md#getindex) are **not** filtered by access group at all, and cannot be: a tag row and an index row are stored keyed by table name with the access group left out of the key, so one row aggregates every group. Any caller allowed to read those listings sees the project's whole tag and index vocabulary, and record counts, sums and averages spanning every access group, including values only `private` or `admin` records contributed.
- [`getUniqueId()`](/api-reference/database/README.md#getuniqueid) is not filtered either. Called with no `unique_id` it lists every unique ID in the project and the record ID each one maps to.

The records behind all of this stay gated: fetching one still goes through the usual access group checks. What these listings expose is the **shape** of the database, so treat a table, tag, index or unique ID name as visible to every signed-in user, and do not encode anything sensitive in one.

It is also unrelated to anonymous **writes**: whether users without an account may create records is governed separately, and access group 0 is the only group they could ever write to.


## Freeze Database

You can freeze your database to prevent write operations by non-admin users.

When the database is frozen, all users with an access level below 99 will be blocked from performing write operations. Only read operations will be allowed.

When this is enabled, only the project owner can write to the database.