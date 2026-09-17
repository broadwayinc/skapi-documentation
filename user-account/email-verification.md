# E-Mail Verification

:::warning
User must be logged in to call this method
:::

User with verified E-Mail can:

- Log in with their email address, when the account was created with a `username`. See [Which ID logs a user in](/user-account/update-account.md#which-id-logs-a-user-in).
- Reset their password if they've forgotten it.
- Receive newsletter from the project owner if they choose to.
- Recover their disabled account.
- Allow their email address to be public to other users if they choose.

You can verify your user's email address with [`verifyEmail()`](/api-reference/user/README.md#verifyemail).

:::tip
The user's email is automatically verified if [signup confirmation](/authentication/signup-confirmation.md) was requested in [`signup()`](/api-reference/authentication/README.md#signup).
:::

The example below shows how you can verify your users email address.

1. The first method call, without any arguments, sends a verification email to the user.
2. The second call completes the verification process by passing the verification code that user retrieved from their email.

``` js
  // Send verification code to user's E-Mail
  skapi.verifyEmail().then(res=>{
     // 'SUCCESS: Verification code has been sent.'
    console.log(res);

    // Prompt user to enter the verification code
    let code = prompt('Enter the verification code sent to your E-Mail');
    
    // Verify E-Mail with the code
    skapi.verifyEmail({ code }).then(res=>{
      // SUCCESS: "email" is verified.
      window.alert('Your email is verified');
    });
  });
```

For more detailed information on all the parameters and options available with the [`verifyEmail()`](/api-reference/user/README.md#verifyemail) method, 
please refer to the API Reference below:

### [`verifyEmail(params?, options?): Promise<'SUCCESS: Verification code has been sent.' | 'SUCCESS: "email" is verified.'>`](/api-reference/user/README.md#verifyemail)

:::warning
The user's email verified state will be lost if the user had changed their email address, or if an admin
changed it for them. Email login goes with it: the account logs in with its `username`, or with the
address it was created with when it has none, until the new address is verified. Verifying it grants the
email login again a few seconds later, on the account's next token. See
[Login IDs](/admin/permissions.md#login-ids).
:::

`options` takes a `template` argument, which lets a single call use a specific uploaded template for
the verification e-mail instead of the template set for your project. It applies to the call that
issues a new code, and is ignored when you pass a code back to verify it. For more info, see
[Overriding the template for a single call](/email/email-templates.md#overriding-the-template-for-a-single-call).
