# Disable / Recover Account


## Disabling account

:::warning
User must be logged in to call this method
:::

If user choose to leave your service, they can disable their account.
User's can disable their account by calling the [`disableAccount()`](/api-reference/user/README.md#disableaccount) method.
**All data related to the account will be deleted after 3 months**.
User will be automatically logged out once their account has been disabled.

``` js
skapi.disableAccount().then(()=>{
  // Account is disabled and user is logged out.
});
```

For more detailed information on all the parameters and options available with the [`disableAccount()`](/api-reference/user/README.md#disableaccount) method, 
please refer to the API Reference below:

### [`disableAccount(): Promise(string)`](/api-reference/user/README.md#disableaccount)

## Recovering a Disabled Account

Disabled accounts can be reactivated **within 3 months** using the [`recoverAccount()`](/api-reference/user/README.md#recoveraccount) method. This method allows users to reactivate their disabled accounts under the following conditions:

- The account email must be verified.
- The [`recoverAccount()`](/api-reference/user/README.md#recoveraccount) method must be called from the `catch` block of a failed [`login()`](/api-reference/authentication/README.md#login) attempt using the disabled account.

The [`recoverAccount()`](/api-reference/user/README.md#recoveraccount) method sends an email to the account owner, containing a confirmation link (The same signup confirmation email) for account recovery.

Additionally, you can provide an optional `string` argument to the [`recoverAccount()`](/api-reference/user/README.md#recoveraccount) method, which will redirect the user to the specified URL or relative path of your website upon successful account recovery.

:::code-group

```html [Form]
<form onsubmit="skapi.login(event)
    .then(u=>console.log('Login success.'))
    .catch(err=>{
        console.log(err.code); // USER_IS_DISABLED
        if(err.code === 'USER_IS_DISABLED') {
          // Send a recovery email to the user with a link.
          // When the user click on the link, the user will be redirected when account recovery is successful.

          let recover = confirm('Do you want to recover your account?')
          if(recover) {
            skapi.recoverAccount('/welcome/back/page').then(res=>{
              console.log(res); // SUCCESS: Recovery e-mail has been sent.
            });
          }
        }
    )">
    <input type="email" name="email" placeholder="E-Mail" required><br>
    <input id="password" type="password" name="password" placeholder="Password" required><br>
    <input type="submit" value="Login">
</form>
```

```js [JS]
// user attempt to login
skapi.login({email: 'user@email.com', password: 'password'})
    .then(u=>console.log('Login success.'))
    .catch(err=>{
        console.log(err.code); // USER_IS_DISABLED
        if(err.code === 'USER_IS_DISABLED') {
            // Send a recovery email to the user with a link.
            // When the user click on the link, the user will be redirected when account recovery is successful.

            let recover = window.confirm('Do you want to recover your account?')
            if(recover) {
            skapi.recoverAccount("/welcome/back/page").then(res=>{
                console.log(res); // SUCCESS: Recovery e-mail has been sent.
            });
            }
        }
    });
```

:::

In the example above, the [`recoverAccount()`](/api-reference/user/README.md#recoveraccount) method is called from the catch block of a failed login attempt using a disabled account.

If the login attempt fails with the error code `"USER_IS_DISABLED"`, user can choose to recover their account.

The [`recoverAccount()`](/api-reference/user/README.md#recoveraccount) method is called to send a recovery email to the user.
The recovery email contains a link, and when the user clicks on the link, they will be redirected to the relative path of the website URL: `/welcome/back/page` upon successful account recovery.

For more detailed information on all the parameters and options available with the [`recoverAccount()`](/api-reference/user/README.md#recoveraccount) method, 
please refer to the API Reference below:

### [`recoverAccount(redirect: boolean | string): Promise<string>`](/api-reference/user/README.md#recoveraccount)
 
:::danger
User should know their password, and have their account email verified.
Otherwise user's account cannot be recovered.
:::
