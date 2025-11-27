# Login / Logout

Once a user has signed up, they can log in to your service using their email and password.

## Login

Use the [`login()`](/api-reference/authentication/README.md#login) method to log a user into your service.

If the login is not successful due to invalid password, or user may not have confirm their signup etc... the [`login()`](/api-reference/authentication/README.md#login) method will throw an error.

When successful, it will respond with the [`UserProfile`](/api-reference/data-types/README.md#userprofile) object.

:::warning
If `signup_confirmation` option was set to `true` during [`signup()`](/api-reference/authentication/README.md#signup),
users will not be able to log in until they have confirmed their account.
:::

:::info
When the user has successfully confirmed their signup and logged in, they will be sent a welcome email.
You can also customize the email template for the signup confirmation email.

For more info on email templates, see [Automated E-Mail](/email/email-templates.md).
:::

Below is an example of a login form that uses the [`login()`](/api-reference/authentication/README.md#login) method.
When the user successfully logs in, they will be redirected to the `welcome.html` page.

::: code-group

```html [Form]
<form action='welcome.html' onsubmit="skapi.login(event).catch(err=>alert(err.message))">
    <h2>Login</h2>
    <hr>
    <label>
        Email<br>
        <input type="email" name="email" placeholder="user@email.com" required>
    </label><br><br>
    <label>
        Password<br>
        <input id="password" type="password" name="password" placeholder="Your password" required>
    </label><br><br>
    <input type="submit" value="Login">
</form>
```

```js [JS]
let parameters = {
  email: 'user@email.com',
  password: 'password'
}

skapi.login(parameters)
  .then(user => window.href = 'welcome.html');
```
:::

For more detailed information on all the parameters and options available with the [`login()`](/api-reference/authentication/README.md#login) method, 
please refer to the API Reference below:

### [`login(params): Promise<UserProfile>`](/api-reference/authentication/README.md#login)

## Auto Login

By default, once user login to your website, their login session is maintained until they logout.

To ensure that users' sessions are destroyed when they leave your website, you can set options.autoLogin to false in the third argument when initializing Skapi.

```javascript
const options = {
  autoLogin: false, // set to true to maintain the user's session
};

//Set the third argument as options
const skapi = new Skapi('service_id', options);
```

## Logout

The [`logout()`](/api-reference/authentication/README.md#logout) method logs the user out from the service.

:::code-group

```html [Form]
<form onsubmit='skapi.logout(event)' action='page_to_show_after_logout.html'>
  <input type='submit' value='Logout'>
</form>
```

```js [JS]
skapi.logout().then(res=>{
  console.log(res); // 'SUCCESS: The user has been logged out.'
  window.location.replace("page_to_show_after_logout.html");
});
```
:::


## Global Logout

You can let the users logout and invalidate all tokens across all the users devices by setting `params.global` to `true`.

:::code-group

```html [Form]
<form onsubmit='skapi.logout(event)' action='page_to_show_after_logout.html'>
  <input type='checkbox' name='global' checked>
  <input type='submit' value='Logout'>
</form>
```

```js [JS]
skapi.logout({global: true}).then(res=>{
  console.log(res); // 'SUCCESS: The user has been logged out.'
  window.location.replace("page_to_show_after_logout.html");
});
```
:::


For more detailed information on all the parameters and options available with the [`logout()`](/api-reference/authentication/README.md#logout) method, 
please refer to the API Reference below:

### [`logout(params?): Promise<string>`](/api-reference/authentication/README.md#logout)

## Listening to Login / Logout Status

You can listen to the updates of the user's login state by setting a callback function in the `option.eventListener.onLogin` option argument of the constructor argument in Skapi.

The `onLogin` callback is triggered in the following cases:
- Skapi initializes with the user's current authentication state.
- User logs in or logs out.
- User loses their session due to an expired token.

If the user is logged in, the callback receives the [UserProfile](/api-reference/data-types/README.md#userprofile) object; otherwise, it receives `null`.

```js
const options = {
  eventListener: {
    onLogin: (profile) => {
      console.log(profile); // is null when user is logged out, User's information object when logged in.
    }
  }
};

const skapi = new Skapi('service_id', options);
```

You can also add multiple event listeners to the `onLogin` event after the Skapi object has been initialized.

```js
skapi.onLogin = (profile) => {
  console.log(profile); // null when user is logged out, User's information object when logged in.
}
```

This handler is useful for updating the UI when the user logs in, logs out, or when their profile information changes.
