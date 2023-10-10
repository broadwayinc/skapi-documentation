# Login / Logout

Once a user has signed up, they can log in to your service using their email and password.

## Login

### [`login(params): Promise<UserProfile>`](/api-reference/authentication/README.md#login)

Use the [`login()`](/api-reference/authentication/README.md#login) method to log a user into your service.
If `signup_confirmation` option was set to `true` during [`signup()`](/api-reference/authentication/README.md#signup),
users will not be able to log in until they have confirmed their account.

::: code-group

```html [Form]
<form onsubmit="skapi.login(event).then(user=>alert('You are logged in!'))">
    <input type="email" name="email" placeholder="E-Mail" required><br>
    <input id="password" type="password" name="password" placeholder="Password" required><br>
    <input type="submit" value="Login">
</form>
```

```js [JS]
let parameters = {
  email: 'user@email.com',
  password: 'password'
}

skapi.login(parameters)
  .then(user => window.alert(user.name));
```
:::

If the login is not successful due to invalid password, or user may not have confirm their signup etc... the [`login()`](/api-reference/authentication/README.md#login) method will throw an error.

When successful, it will respond with the [`UserProfile`](/api-reference/data-types/README.md#userprofile) object.

## Checking the Login status

### [`getProfile(options?): Promise<UserProfile | null>`](/api-reference/authentication/README.md#getprofile)

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


## Auto Login

By default, once user leaves the website, their login session is destroyed.

In order for users to maintain their login session when they revisit your website,
you can set `options.autoLogin` to `true` in the third argument of the Skapi class constructor.

```javascript
const options = {
  autoLogin: true, // set to true to maintain the user's session
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
