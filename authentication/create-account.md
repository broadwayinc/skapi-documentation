
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
the account's permanent login ID, and the email logs the account in as well. Leave `username` out and
the email alone is the login ID, which is what most projects want.

The username is permanent. It is fixed when the account is created and there is no API to change it.
The email is not: when a user updates their email, email login moves to the new address and the
username is unaffected. See
[Which ID logs a user in](/user-account/update-account.md#which-id-logs-a-user-in).

```js
skapi.signup({ email: 'user@email.com', password: 'password', username: 'my_username' })
    .then(() => {
        // Both of these log the same account in.
        skapi.login({ username: 'my_username', password: 'password' });
        skapi.login({ email: 'user@email.com', password: 'password' });
    });
```

The email keeps every other job it had: it is still the address verification and password-reset
e-mails go to, and it is still what `email_public` exposes.

