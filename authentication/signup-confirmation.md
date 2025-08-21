
# Signup Confirmation

You can require users to confirm their signup via email.
This is useful for preventing malicious users from creating fake accounts.
User data will not be created unless the user confirms their account.

## E-Mail Confirmation on Signup

When an account is created with `options.signup_confirmation` set to `true` or URL string,
users will receive an email with the signup confirmation link.

The user must click on the confirmation link before logging into your service.
If the `options.signup_confirmation` value is a valid URL string,
the user will be redirected to that url after successful signup confirmation.

The URL string will work either with a full URL or relative path of your website.

Once the user has confirmed their signup, their profile will automatically be marked as email verified.

:::code-group

```html [Form]
<form onsubmit="skapi.signup(event, { signup_confirmation: '/path/to/your/success/page' })
    .then(r=> {
        // SUCCESS: The account has been created. User's signup confirmation is required.
        console.log(r);
    })">
    <input type="email" name="email" placeholder="E-Mail" required><br>
    <input type="password" name="password" placeholder="Password" required><br>
    <input name="name" placeholder="Your name"><br>
    <input type="submit" value="Create Account">
</form>
```

```js [JS]
let parameters = {
  email: "user@email.com",
  password: "password",
  name: "User's name"
};

let options = {
  /** 
   * If set to true, the user will get a signup confirmation email with a confirmation link.
   * If set to a valid URL string, the user will be redirected to the url when the confirmation is successful.
   */
  signup_confirmation: '/path/to/your/success/page'
};

skapi.signup(parameters, options).then(res => {
    // "SUCCESS: The account has been created. User's signup confirmation is required."
    console.log(res);
});
```
:::

The example above shows how you can create a user account with the signup confirmation.

When the signup is successful, the user will get an email containing the confirmation link.
Once clicked, the user will be confirmed by your service and be redirected to the given URL.

If the `signup_confirmation` value was `true`,
the user will see 'Your signup has been successfully confirmed.' message in their blank web browser tab.

:::danger
When setting the `signup_confirmation` value to a relative URL path (e.g. `/relative/path.html`), it will not work if the website is not hosted.

It's because on local file systems your actual file url would be something like: `file:///C:/Users/username/Desktop/website/index.html`. And skapi does not collect folder informations of the user's local computer.

Set your redirect URL of `signup_confirmation` to be the full URL (e.g. `https://your.website.com/path/to/your/success/page`).
:::

You can also customize the email template for the signup confirmation email.

For more info on email templates, see [Automated E-Mail](/email/email-templates.md).

## Resending Signup Confirmation Email


If you need to resend the confirmation email, use the [`resendSignupConfirmation()`](/api-reference/authentication/README.md#resendsignupconfirmation) method. 

:::code-group
```html [Form]
<form onsubmit="skapi.login(event)
    .then(u=>console.log('Successfully logged in.'))
    .catch(err => {
        if(err.code === 'SIGNUP_CONFIRMATION_NEEDED') {
          if(confirm('Your signup confirmation is required. Resend confirmation email?')) {
            skapi.resendSignupConfirmation().then(res=>{
              console.log(res); // 'SUCCESS: Signup confirmation E-Mail has been sent.'
            });
          }
        }
        else throw err;
      }
    })">
    <input type="email" name="email" placeholder="E-Mail" required><br>
    <input id="password" type="password" name="password" placeholder="Password" required><br>
    <input type="submit" value="Login">
</form>
```

```js [JS]
skapi.login({email: 'user@email.com', password: 'password'})
    .then(u=>console.log('Successfully logged in.'))
    .catch(err=>{
        /**
         * {
         *  code: 'SIGNUP_CONFIRMATION_NEEDED',
         *  message: "User's signup confirmation is required.",
         *  name: 'SkapiError'
         * }
         */
        
        if(err.code === 'SIGNUP_CONFIRMATION_NEEDED') {
            let sendConfirmation = window.confirm('Your signup confirmation is required. Resend confirmation email?');
            
            if(sendConfirmation) {
                // now you can resend signup confirmation E-Mail to user@email.com.
                skapi.resendSignupConfirmation().then(res=>{
                console.log(res); // 'SUCCESS: Signup confirmation E-Mail has been sent.'
                });
            }
        }

        else throw err;
    });
```
:::

In this example, the user tries to login and receives a `SIGNUP_CONFIRMATION_NEEDED` error.

Then, if the user chooses to, you can use the [`resendSignupConfirmation()`](/api-reference/authentication/README.md#resendsignupconfirmation) method to resend the confirmation email to the user's email address.

For more detailed information on all the parameters and options available with the [`resendSignupConfirmation()`](/api-reference/authentication/README.md#resendsignupconfirmation) method, 
please refer to the API Reference below:

### [`resendSignupConfirmation(): Promise<string>`](/api-reference/authentication/README.md#resendsignupconfirmation)

::: warning
- To resend signup confirmation emails, the user must have at least one login attempt to your service.
- If the user fails to confirm within 7 days, their signup will be invalidated, and they will need to sign up again. 
:::

