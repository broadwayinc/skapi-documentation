
# Creating an Account

### [`signup(params, options?): Promise<UserProfile | string>`](/api-reference/authentication/README.md#signup)

To create a new account (user) in your service, you can use the [`signup()`](/api-reference/authentication/README.md#signup) method. 

### Example: Creating an Account

::: code-group

```html [Form]
<form action='login.html' onsubmit="skapi.signup(event).catch(err=>alert(err.message))">
    <h2>Sign-Up</h2>
    <hr>
    <label>
        Email<br>
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
  .then(res => window.href = 'login.html')
  .catch(err => window.alert(err.message));
```

:::

The example above shows how to let users create their account in your servce.
Once the user signup is successful, the user will be redirected to the login page.
The first argument takes the user's input (email, password, name) that will be used for signup.

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
  .then(res => u=>alert('Hello ' + u.name));
```

:::
When the `options.login` is set to `true`, the method will return the [UserProfile](/api-reference/data-types/README.md#userprofile) object.

::: info
- If the user have not logged in to your service after account creation,
They will not appear on your Skapi service dashboard.

- If 24 hours have passed since the account creation, and user still have not logged in to your service,
user's signup will be automatically invalidated.
:::