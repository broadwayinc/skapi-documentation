
# Forgot password

When the user forgets their password, they can request a verification code to reset their password.

:::warning
If the user's email is not verified, they will not be able to receive a verification code and may lose access to their account permanently.

It is recommended to encourage users to verify their email addresses.
For more info on email verification, see [Email Verification](../user-account/email-verification.md).
:::

## Step 1: Request Verification Code

Use the [`forgotPassword()`](/api-reference/authentication/README.md#forgotpassword) method to request a verification code.

In this example, the [`forgotPassword()`](/api-reference/authentication/README.md#forgotpassword) method is called with the user's email as a parameter.

The user will receive an email containing a verification code that they can use to reset their password.

:::code-group

```html [Form]
<form onsubmit="skapi.forgotPassword(event).then(res => {
    console.log(res) // SUCCESS: Verification code has been sent.
})">
    <input type="email" name="email" placeholder="E-Mail" required>
    <input type="submit" value="Request Verification Code">
</form>
```

```js [JS]
skapi.forgotPassword({email: 'someone@gmail.com'}).then(res=>{
  // User receives an e-mail with a verification code.
  // SUCCESS: Verification code has been sent.
  console.log(res);
});

```
:::

For more detailed information on all the parameters and options available with the [`forgotPassword()`](/api-reference/authentication/README.md#forgotpassword) method, 
please refer to the API Reference below:

### [`forgotPassword(params): Promise<string>`](/api-reference/authentication/README.md#forgotpassword)

::: info
Due to security reasons, [`forgotPassword()`](/api-reference/authentication/README.md#forgotpassword) will not tell the user whether the email exists.
:::

You can also customize the email template for the verification email.

For more info on email templates, see [E-Mail Templates](../email/email-templates.md).

## Step 2: Reset Password

The user will receive an email containing a verification code. After the user receives the verification code, they can use the [`resetPassword()`](/api-reference/authentication/README.md#resetpassword) method to reset their password.

The [`resetPassword()`](/api-reference/authentication/README.md#resetpassword) method is called with the user's email, the verification code received via email, and the new password.

Upon successful password reset, the user's account password will be set to the new password provided.

:::code-group

```html [Form]
<form onsubmit="skapi.resetPassword(event).then(res => {
    console.log(res); // SUCCESS: New password has been set.
})">
    <input type="email" name="email" placeholder="E-Mail" required><br>
    <input type="text" name="code" placeholder="Verification Code" required><br>
    <input type="password" name="new_password" placeholder="New Password" required><br>
    <input type="submit" value="Change Password">
</form>
```

```js [JS]
skapi.resetPassword({
  email: 'someone@gmail.com', 
  code: '123456', // code sent to user's registered email address
  new_password: 'new_password' // The password should be at least 6 characters and 60 characters maximum.
}).then(res => {
  console.log(res);
  // SUCCESS: New password has been set.
});
```
:::

For more detailed information on all the parameters and options available with the [`resetPassword()`](/api-reference/authentication/README.md#resetpassword) method, 
please refer to the API Reference below:

### [`resetPassword(params): Promise<string>`](/api-reference/authentication/README.md#resetpassword)