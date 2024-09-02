# E-Mail Verification

:::warning
User must be logged in to call this method
:::

User with verified E-Mail can:

- Reset their password if they've forgotten it.
- Receive newsletter from the service owner if they choose to.
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
    let code = prompt('Enter the verification code');
    
    // Verify E-Mail with the code
    skapi.verifyEmail({ code }).then(res=>{
      // SUCCESS: "email" is verified.
      window.alert('Your email is verified');
    });
  });
```

For more detailed information on all the parameters and options available with the [`verifyEmail()`](/api-reference/user/README.md#verifyemail) method, 
please refer to the API Reference below:

### [`verifyEmail(params?): Promise(string)`](/api-reference/user/README.md#verifyemail)

:::warning
The user's email verified state will be lost if the user had changed their email address.
:::
