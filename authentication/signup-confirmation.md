
# Signup Confirmation

You can require users to confirm their signup via email.
This is useful for preventing malicious users from creating fake accounts.
The account is not fully activated until the user confirms it.

## E-Mail Confirmation on Signup

When an account is created with `options.signup_confirmation` set to `true` or a URL string,
the user receives a signup confirmation email.

The user must click on the confirmation link before logging into your service.
If the `options.signup_confirmation` value is a valid URL string,
the user is redirected to that URL after successful confirmation.

You can use either a full URL or a relative path on your website.

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

The example above shows how to create an account with signup confirmation enabled.

After signup succeeds, the user receives an email with a confirmation link.
After they click the link, the account is confirmed and the user is redirected to the URL you provided.

If the `signup_confirmation` value was `true`,
the user sees a blank browser tab with the message: 'Your signup has been successfully confirmed.'

:::danger
When setting the `signup_confirmation` value to a relative URL path (e.g. `/relative/path.html`), it will not work if the website is not hosted.

This happens because local files use paths like `file:///C:/Users/username/Desktop/website/index.html`, and Skapi cannot resolve folder paths on a user's local computer.

Set your redirect URL of `signup_confirmation` to be the full URL (e.g. `https://your.website.com/path/to/your/success/page`).
:::

You can also customize the signup confirmation email template.

For more info on email templates, see [Automated E-Mail](/email/email-templates.md).

## Resending Signup Confirmation E-Mail


If you need to resend the confirmation email, use the [`resendSignupConfirmation()`](/api-reference/authentication/README.md#resendsignupconfirmation) method. 

:::code-group
```html [Form]
<form onsubmit="skapi.login(event)
    .then(u=>console.log('Successfully logged in.'))
    .catch(err => {
        if(err.code === 'SIGNUP_CONFIRMATION_NEEDED') {
          if(confirm('Your signup confirmation is required. Resend confirmation email?')) {
            skapi.resendSignupConfirmation().then(res=>{
              console.log(res); // 'SUCCESS: Signup confirmation e-mail has been sent.'
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
                console.log(res); // 'SUCCESS: Signup confirmation e-mail has been sent.'
                });
            }
        }

        else throw err;
    });
```
:::

In this example, the user tries to log in and receives a `SIGNUP_CONFIRMATION_NEEDED` error.

If needed, you can then call [`resendSignupConfirmation()`](/api-reference/authentication/README.md#resendsignupconfirmation) to resend the confirmation email.

For detailed information about all parameters and options of [`resendSignupConfirmation()`](/api-reference/authentication/README.md#resendsignupconfirmation),
see the API reference below:

### [`resendSignupConfirmation(): Promise<'SUCCESS: Signup confirmation e-mail has been sent.'>`](/api-reference/authentication/README.md#resendsignupconfirmation)

::: warning
- To resend signup confirmation emails, the user must have at least one login attempt to your service.
- If the user does not confirm within 7 days, the signup is invalidated and they must sign up again.
:::

