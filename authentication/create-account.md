
# Creating an Account

To let users create a new account in your project, you can use the [`signup()`](/api-reference/authentication/README.md#signup) method. 

### Example: Creating an Account

::: code-group

```html [Form]
<form action='login.html' onsubmit="skapi.signup(event).catch(err=>alert(err.message))">
    <h2>Sign-Up</h2>
    <hr>
    <label>
        E-Mail<br>
        <input type="email" name="email" placeholder="user@email.com" required>
    </label><br><br>
    <label>
        Password<br>
        <input type="password" name="password" placeholder="Your password" required>
    </label><br><br>
    <label>
        Name<br>
        <input name="name" placeholder="Your name">
    </label><br><br>
    <input type="submit" value="Sign-Up">
</form>
```

```js [JS]
let parameters = {
  email: "user@email.com",
  password: "password", // Password must be between 6 and 60 characters.
  name: "User's name"
};

skapi.signup(parameters)
  .then(res => window.location.href = 'login.html')
  .catch(err => window.alert(err.message));
```

:::

The example above shows how to let users create their account in your project.
Once the user signup is successful, the user will be redirected to the login page.
The first argument takes the user's input (email, password, name) that will be used for signup.

::: warning
- If the user have not logged in to your project after account creation,
they will **NOT** appear on your user list in Skapi's admin page.

- If 7 days have passed since the account creation, and the user still have not logged in to your project,
user's signup will be automatically invalidated.
:::

## Login after Signup

The second argument takes additional options when creating an account.
You can also automatically login the user right after successful signup by setting `options.login` to `true` in options argument.

::: code-group

```html [Form]
<form onsubmit="skapi.signup(event, { login: true }).then(u=>alert('Hello ' + u.name))">
    <input type="email" name="email" placeholder="E-Mail" required><br>
    <input type="password" name="password" placeholder="Password" required><br>
    <input name="name" placeholder="Your name"><br>
    <input type="submit" value="Create Account">
</form>
```

```js [JS]
let parameters = {
  email: "user@email.com",
  password: "password", // Password must be between 6 and 60 characters.
  name: "User's name"
};

let options = {
  login: true // If set to true, users will be automatically logged in after signup.
};

skapi.signup(parameters, options)
  .then(u => alert('Hello ' + u.name));
```

:::

When the `options.login` is set to `true`, the method will return the [UserProfile](/api-reference/data-types/README.md#userprofile) object.

For more detailed information on all the parameters and options available with the [`signup()`](/api-reference/authentication/README.md#signup) method, 
please refer to the API Reference below:

### [`signup(params, options?): Promise<UserProfile | string>`](/api-reference/authentication/README.md#signup)  

`options` also takes a `template` argument, which lets a single `signup()` call use a specific
uploaded template for the signup confirmation and welcome e-mails instead of the template set for
your project. For more info, see [Overriding the template for a single call](/email/email-templates.md#overriding-the-template-for-a-single-call).

### E-Mail and username

`email` is always required. Every account needs one, because it is what signup confirmation, e-mail
verification, password reset and account recovery all work through. An account cannot be created
without it.

`username` is optional, and when you pass one the account gets **two** ways in. The username becomes
the account's permanent login ID, and once the email is verified it logs the account in as well. Leave
`username` out and the email alone is the login ID, which is what most projects want.

The username is permanent. It is fixed when the account is created and there is no API to change it.
The email is not, but changing it does not hand email login to the new address on its own. The new
address logs the account in only once the user verifies it with
[`verifyEmail()`](/api-reference/user/README.md#verifyemail), and it starts working a few seconds
after the verification succeeds, not in the `verifyEmail()` response. An email an admin changes with
[`updateUserAttributes()`](/api-reference/admin/README.md#updateuserattributes) is written unverified
and takes the account's email login away at once, until the user verifies the new address.

The username is unaffected either way, and so is the address the account signed up with when it was
created without a `username`: that original address is the account's own login ID, not an email login,
and it keeps working after an email change. See
[Which ID logs a user in](/user-account/update-account.md#which-id-logs-a-user-in).

```js
skapi.signup({ email: 'user@email.com', password: 'password', username: 'my_username' })
    .then(() => {
        // The username logs the account in from the moment it is created.
        skapi.login({ username: 'my_username', password: 'password' });
        // The email logs the same account in once it is verified, and not before.
        skapi.login({ email: 'user@email.com', password: 'password' });
    });
```

The email keeps every other job it had: it is still the address verification and password-reset
e-mails go to, and it is still what `email_public` exposes.

For an account created with a `username`, email login starts once that email is **verified**, never
before. An email only proves the account owns it once one of these happens:

- the user clicks the confirmation link, when `signup_confirmation` is used,
- the user accepts the invitation, for an account made with
  [`inviteUser()`](/api-reference/admin/README.md#inviteuser),
- the user calls [`verifyEmail()`](/api-reference/user/README.md#verifyemail) and it succeeds, which
  is what a `signup()` without `signup_confirmation` and an account made with
  [`createAccount()`](/api-reference/admin/README.md#createaccount) need. Creating the account proves
  nothing about the address, so it logs in with its username alone until the user verifies. Email
  login then arrives a few seconds later, on the account's next token, rather than in the
  `verifyEmail()` response.

Until then the email does not reach the account at all, even while the invitation or the confirmation
link is pending. A user who types their email before opening the confirmation link gets
`INCORRECT_USERNAME_OR_PASSWORD`, not `SIGNUP_CONFIRMATION_NEEDED`, and that attempt does not let
[`resendSignupConfirmation()`](/api-reference/authentication/README.md#resendsignupconfirmation) send
the link again. A login attempt with the username does both.

If that email is already a login ID another account of your project was **granted**, email login is not
enabled for the new account, and the username still logs it in. `signup()` creates such an account
anyway; `createAccount()` and `inviteUser()` refuse it up front with `EXISTS` (see below).

### When a login ID is already taken

A login ID can only ever lead to one account. So an account is refused when its own login ID is already
a login ID another account of your project was **granted**: the ID that account was created with, or an
address it has verified. The usual case is signing up without a `username` with the verified email of an
account that was created with one:

```js
// 'user@email.com' is the email of an account that was created with a username.
skapi.signup({ email: 'user@email.com', password: 'password' })
    .catch(err => {
        // err.code: 'EXISTS'
        // err.message: 'E-mail "user@email.com" is already a login ID in this service.'
    });
```

`signup()` refuses a `username` the same way, with the message
`The login ID is already used by another account in this service.`, when that `username` is an address
another account was granted as its email login. Only an e-mail address can be one, for example a
`username` of `jane@email.com` when `jane@email.com` is the verified email of an account created with a
username. A login ID that another account was itself created with (the same `username`, or the same
email both times without a `username`) is a plain duplicate and gives `The account already exists.`
instead.

`createAccount()` and `inviteUser()` run this check for every request without `openid_id`, with or
without a `username`, and they also refuse an account created with a `username` whose email is already a
login ID another account was granted, including the email that account was created with. See the
`EXISTS` errors of [`inviteUser()`](/api-reference/admin/README.md#inviteuser) and
[`createAccount()`](/api-reference/admin/README.md#createaccount).

:::warning Your permanent login ID is never taken away
The account's permanent login ID is fixed:
- if the account was created with a username, that username is the permanent login ID;
- if the account was created without a username, the original email is the permanent login ID.

That permanent login ID stays with the account and is never reassigned to another account.

What can be taken away is a separate email login that is not the account's permanent login ID. If another
account proves it owns the same email and verifies it, that separate email login can be reassigned to the
other account. See [Login IDs](/admin/permissions.md#login-ids).
:::

