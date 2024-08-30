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

For more info on email templates, see [E-Mail Templates](../email/email-templates.md).
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

## Checking the Login status


The [`getProfile()`](/api-reference/authentication/README.md#getprofile) method allows you to retrieve the user's information.
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

For more detailed information on all the parameters and options available with the [`getProfile()`](/api-reference/authentication/README.md#getprofile) method, 
please refer to the API Reference below:

### [`getProfile(options?): Promise<UserProfile | null>`](/api-reference/authentication/README.md#getprofile)

## Auto Login

By default, once user login to your website, their login session is maintained until they logout.

In order for users to destroy their login session when they leave your website,
you can set `options.autoLogin` to `false` in the third argument of the Skapi class constructor.

```javascript
const options = {
  autoLogin: false, // set to true to maintain the user's session
};

const skapi = new Skapi('service_id', 'owner_id', options);
```

## Logout
### [`logout(event?:SubmitEvent): Promise<string>`](/api-reference/authentication/README.md#logout)

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

:::tip
For convenience, `event`:SubmitEvent argument is there just to use with `<form>` element.
You can use `action` attributes in form to redirect user after logout.
:::
