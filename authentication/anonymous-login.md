# Anonymous Login

A visitor can use the parts of your app that need an account, such as chat, private records or realtime, without signing up.
[`anonymousLogin()`](/api-reference/authentication/README.md#anonymouslogin) signs the visitor in with a **temporary anonymous account**: no e-mail, no password, created by the one call.

The account lives while a page holds its session and is deleted 30 minutes after the visitor leaves.

:::warning Turn it on first
Anonymous login is off until the project owner turns on **Anonymous Login** in [Project Settings](/service-settings/service-settings.md#anonymous-login).
While it is off, `anonymousLogin()` fails with `INVALID_REQUEST` and `Anonymous login is not enabled for this service.`
It works whether or not **Allow Signup** is on, so a project can close signups and still let visitors in anonymously.
:::

## Signing a visitor in

```js
let user = await skapi.anonymousLogin();
console.log(user.anonymous); // true
```

`anonymousLogin()` resolves to the [`UserProfile`](/api-reference/data-types/README.md#userprofile) of the new account, which carries `anonymous: true`, access group `1` and no e-mail.
From then on the visitor is a logged-in user: `skapi.user` is set, the login listeners run, and every method that needs a login works, with the exceptions listed below.

Call it where your app decides a visitor needs an account, for example when the chat opens. It is safe to call on every page load:

- When the page already holds an anonymous session, it resolves to that account instead of creating another.
- When another user is logged in, it fails with `INVALID_REQUEST`. Log that user out first if that is what you intend.

A page can tell whether anonymous login is on before any call: [`getConnectionInfo()`](/api-reference/connection/README.md#getconnectioninfo) returns it as `conf.anonymous_login`.

## How long the account lives

The SDK keeps the account alive while a page holds its session: it sends a keep-alive every 10 minutes, and once more when a page load restores the session from storage.
The account is deleted 30 minutes after the last keep-alive, which happens 30 to 40 minutes after the visitor closed the last page holding the session.

So:

- Reloading the page or opening it again within 30 minutes keeps the account and its data. The session is restored from the browser's storage, as for any login.
- A tab in the background keeps its account: browsers slow a background tab's timers, but not below the 10-minute beat.
- A laptop asleep for an hour comes back to a deleted account. The next keep-alive learns this, signs the page out (`skapi.user` becomes `null` and the login listeners run with `null`), and the page can call `anonymousLogin()` again for a new account.

[`logout()`](/api-reference/authentication/README.md#logout) deletes an anonymous account at once. So does [`signup()`](/api-reference/authentication/README.md#signup), which logs out before it creates the new account.
[`login()`](/api-reference/authentication/README.md#login) and [`openIdLogin()`](/api-reference/authentication/README.md#openidlogin) replace the session without a logout; the anonymous account they leave behind is deleted 30 minutes later.

When the account is deleted, everything it owns goes with it: its records, files, subscriptions and realtime state, as when any account is deleted.

## What an anonymous account cannot do

A temporary account stays temporary. It cannot:

- edit its profile with [`updateProfile()`](/api-reference/user/README.md#updateprofile),
- change its password with [`changePassword()`](/api-reference/user/README.md#changepassword), or reset it with [`forgotPassword()`](/api-reference/authentication/README.md#forgotpassword),
- verify an e-mail or a phone number with [`verifyEmail()`](/api-reference/user/README.md#verifyemail) or `verifyPhoneNumber()`,
- subscribe to newsletters,
- disable itself with [`disableAccount()`](/api-reference/user/README.md#disableaccount) or be recovered.

Each of these fails with `INVALID_REQUEST` and a message starting with `Anonymous accounts cannot`. The refusal holds on the server as well, so a call made around the SDK is refused too.

Everything the feature is for stays allowed: records, files, realtime, subscriptions to other users, tickets, [`getProfile()`](/api-reference/authentication/README.md#getprofile) and [`logout()`](/api-reference/authentication/README.md#logout).

## Telling anonymous users apart

- In your app: `skapi.user.anonymous` is `true` on an anonymous session and absent otherwise.
- In [`getUsers()`](/api-reference/user/README.md#getusers) results: an anonymous account's row carries `anonymous: true`.
- On the **Users** page of your project: an anonymous account shows **Anonymous** in the Email column with a crossed-out account icon. See [Managing User Accounts](/admin/account.md).

An anonymous account counts as a user of your project while it exists, toward the plan's user limit and the month's active users. When the project is at its user limit, `anonymousLogin()` fails with `INVALID_REQUEST` and `User limit exceeded.`, as a signup does.

## Example: chat for visitors

```js
async function openChat() {
    if (!skapi.user) {
        try {
            await skapi.anonymousLogin();
        }
        catch (err) {
            alert(err.message); // anonymous login is off, or the project is at its user limit
            return;
        }
    }
    showChatWindow();
}

skapi.onLogin = (user) => {
    if (!user) {
        // the anonymous account expired while the page was away: close the chat, let the visitor open it again
        hideChatWindow();
    }
};
```
