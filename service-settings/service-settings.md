# Project Settings

Go to your project page and click on the **Project Settings** menu.

On this page, you can configure settings for your project.
The button that deletes the project is at the bottom of the page. See [Deleting a Project](/service-settings/deleteservice.md).

:::warning Only the project owner can change these
Every setting on this page belongs to the **project owner's Skapi account**, and to Skapi staff when you ask Skapi for help. An [admin](/admin/permissions.md#project-settings-belong-to-the-project-owner) of your project, access group `99` included, is refused with `INVALID_REQUEST` and `Only the project owner can change project settings.`
:::

## Web Hosting Address

The **Web Hosting** card registers the subdomain your hosted website is served on, as `https://<name>.skapi.com`, and changes or removes it later. The files themselves are uploaded on the project's **Web Hosting** page. See [Hosting your website](/hosting/hosting.md).

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

## Anonymous Login

When this is on, visitors can sign in with a temporary anonymous account through [`anonymousLogin()`](/api-reference/authentication/README.md#anonymouslogin): no e-mail, no password, access group `1`.
The account lives while a page holds its session and is deleted 30 minutes after the visitor leaves, with everything it owns.
See [Anonymous Login](/authentication/anonymous-login.md).

It is off until you turn it on. While it is off, `anonymousLogin()` fails with `INVALID_REQUEST` and `Anonymous login is not enabled for this service.`

It does not depend on **Allow Signup**: a project can close signups and still let visitors in anonymously.
It is unrelated to **Prevent Anonymous** below, which is about visitors **without** an account writing public records.

Anonymous accounts count as users of the project while they exist, toward the plan's user limit and the month's active users.
It is returned to every client as `conf.anonymous_login` on [`getConnectionInfo()`](/api-reference/connection/README.md#getconnectioninfo).


## Prevent Inquiry

You can prevent users from sending inquiries to your project by turning off this option.

This is useful when you are not planning to use the [`sendInquiry()`](/api-reference/email/README.md#sendinquiry) method, and want to prevent spam.


## Require Login

When this is on, the SDK refuses [`getRecords()`](/api-reference/database/README.md#getrecords) from a session with no signed-in user: it throws `REQUIRE_LOGIN` before the request leaves the browser. Signed-in users are not affected. A project that has never set this option counts as on, which is the default every client receives as `conf.require_login` on [`getConnectionInfo()`](/api-reference/connection/README.md#getconnectioninfo), so a page can tell before any login whether it should show its own sign-in screen first.

**This is a guard rail, not an access control.** Records in `access_group: 0` remain readable by anyone calling the API directly, whether or not this setting is on: only the SDK refuses `getRecords()`. Data that must not be readable without an account has to live outside access group 0.

The metadata listings are not gated by this setting. [`getTables()`](/api-reference/database/README.md#gettables), [`getTags()`](/api-reference/database/README.md#gettags), [`getIndexes()`](/api-reference/database/README.md#getindex) and [`getUniqueId()`](/api-reference/database/README.md#getuniqueid) answer any caller that knows the project ID, signed in or not. What each one shows is on its own page: [table information](/database/table-info.md#who-can-read-table-information) filters its per access group counters to the caller, while [tags](/database/tags.md#who-can-read-tag-information) and [indexes](/database/indexing.md#who-can-read-index-information) are not filtered by access group at all.

## Freeze Database

You can freeze your database to prevent write operations by non-admin users.

When the database is frozen, every user below access group `90` is blocked from performing write operations. Only read operations will be allowed. They are refused with `Database is frozen. Write access is denied for this user.`, and on a delete with `Database is frozen. Delete access is denied for this user.`

Admins (access groups `90` ~ `99`) and the project owner still write as usual, so a frozen project stays manageable: they upload, update and delete records and files while it is frozen. See [Admin Permissions](/admin/permissions.md#a-frozen-database).