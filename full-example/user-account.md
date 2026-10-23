# Full Example: User Account

The User Account pages demonstrate Skapi's account system end to end. Every step is one method call, usually with a plain HTML form as its argument.

<FullExampleDemo page="account.html" label="Open the User Account demo" />

You need your [project ID](/full-example/intro.md#have-your-project-id-ready) to open the demo.

![The User Account page of the template: a description of each account feature with a link to its page, and the logged-in user's name with a Logout button](/screenshots/template-account.webp)

*`account.html`, the hub of the account pages, with a user logged in.*

![The Login page of the template: an email address field, a password field and a Login button](/screenshots/template-login.webp)

*`login.html`. The form is passed to `login()` as it is.*

![The Sign up page of the template: email address, password, name and the other optional fields, and a Sign up button](/screenshots/template-signup.webp)

*`signup.html`. Email address and password are required; the other fields are optional.*

## What it demonstrates

| Page | Method | What happens |
| --- | --- | --- |
| `signup.html` | [signup()](/authentication/create-account.md) | Creates an account from an email address, a password and a name. With the `signup_confirmation` option a confirmation email is sent, and the account can log in only after the link in it is clicked. |
| `login.html` | [login()](/authentication/login-logout.md) | Signs the user in. The form's `action` is the page Skapi opens afterwards, so a visitor sent here from another page goes back to it. The `autoLogin` option logs the user in again on their next visit. |
| `account.html` | [anonymousLogin()](/authentication/anonymous-login.md) | The **Continue as a guest** button creates a temporary account with no email address and no password and logs the visitor in with it, so the visitor can use the pages that need an account. The account is deleted 30 minutes after the visitor leaves, or at once on logout. The project owner turns it on with **Anonymous Login** in the project settings. |
| `email-verification.html` | [verifyEmail()](/user-account/email-verification.md) | Sends a 6 digit code to the user's email address, then verifies the address with that code. A verified address is needed to reset a password and to recover an account. |
| `forgot-password.html`, `reset-password.html` | [forgotPassword(), resetPassword()](/authentication/forgot-password.md) | Sends a verification code, then sets a new password with it. |
| `change-password.html` | [changePassword()](/user-account/change-password.md) | Changes the password of the logged-in user. |
| `update-profile.html` | [updateProfile()](/user-account/update-account.md) | Edits the name, birthdate and email address, and whether the email address is shown to other users. |
| `remove-account.html` | [disableAccount()](/user-account/disable-recover-account.md) | Removes the account. It is disabled rather than deleted right away, so it can still be recovered. |
| `recover-account.html` | [recoverAccount()](/user-account/disable-recover-account.md) | When a removed account tries to log in, the login fails with `USER_IS_DISABLED` and the login page offers to send a recovery email. The link in it enables the account again. |

`account.html` ties the pages together: it describes each feature, links to its page, offers the guest login, and shows who is logged in with a logout button ([logout()](/authentication/login-logout.md)). A guest sees that their account is temporary; logging out deletes it.

## Download

The pages are part of the full template: [skapi-templates.zip](https://cdn.broadwayinc.com/temp/v3/skapi-templates.zip). See [Full Examples](/full-example/intro.md) for how to run it.
