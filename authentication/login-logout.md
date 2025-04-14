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

For more info on email templates, see [Automated E-Mail](../email/email-templates.md).
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

## Getting User Information

When user is logged in to your service, you can retrieve their information from `user` property of the Skapi object.
This property is getter-only, and will not be object reference.

It returns the [UserProfile](/api-reference/data-types/README.md#userprofile) object.

```js
console.log(skapi.user); // null when user is logged out, User's information object when logged in.
```

## Requesting User Information

The [`getProfile()`](/api-reference/authentication/README.md#getprofile) method allows you to retrieve the user's information via promise method.
It returns the [UserProfile](/api-reference/data-types/README.md#userprofile) object.

If the user is not logged in, [`getProfile()`](/api-reference/authentication/README.md#getprofile) returns `null`.

```js
skapi.getProfile().then(profile=>{
  console.log(profile); // User's information

  if(profile === null) {
    // The user is not logged in
  }
})
```

You can also refresh the auth token and fetch the updated profile by passing `options.refreshToken` to `true`.

```js
skapi.getProfile({ refreshToken: true }).then(profile=>{
  console.log(profile); // Updated user's information

  if(profile === null) {
    // The user is not logged in
  }
})
```

This can be useful when the user needs to get their updated profile when it's updated from another device, or admin might have made change to the users profile, or you just want your users to update their token for some other security reasons.

For more detailed information on all the parameters and options available with the [`getProfile()`](/api-reference/authentication/README.md#getprofile) method, 
please refer to the API Reference below:

### [`getProfile(options?): Promise<UserProfile | null>`](/api-reference/authentication/README.md#getprofile)


## Auto Login

By default, once user login to your website, their login session is maintained until they logout.

To ensure that users' sessions are destroyed when they leave your website, you can set options.autoLogin to false in the third argument when initializing Skapi.

```javascript
const options = {
  autoLogin: false, // set to true to maintain the user's session
};

//Set the third argument as options
const skapi = new Skapi('service_id', 'owner_id', options);
```

## Listening to Login Status

You can listen to the login status of the user by setting a callback function in the `option.eventListener.onLogin` option argument of the constructor argument in Skapi.

The `onLogin` callback function will be called when Skapi instance is ready with user's login status (either logged in or out), whenever the user logs in, logs out, or even when their profile is updated.

The callback function will receive the [UserProfile](/api-reference/data-types/README.md#userprofile) object as an argument.

```js
const options = {
  eventListener: {
    onLogin: (profile) => {
      console.log(profile); // null when user is logged out, User's information object when logged in.
    }
  }
};

const skapi = new Skapi('service_id', 'owner_id', options);
```

You can also add multiple event listeners to the `onLogin` event after the Skapi object has been initialized.

```js
skapi.onLogin = (profile) => {
  console.log(profile); // null when user is logged out, User's information object when logged in.
}
```

This handler can be useful for updating the UI when the user logs in or logs out.


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
