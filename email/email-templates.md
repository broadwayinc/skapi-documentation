# Automated Emails

When the user signup, reset password, or change email, subscribes to public newsletters, get invited to your project,
the system will send an automated email to the user.
You can customize the email template of these automated emails by sending your templates to the email endpoints.

E-Mail endpoints can be found in your `Automated Emails` page in your Skapi admin page.

In the `Automated Emails` page, select an email type you want to set the template.

- **Signup Confirmation**
  
  Endpoint for signup confirmation email template. The user receives this email when they are requested for confirmation on signup.

- **Welcome E-Mail**
  
  Endpoint for welcome email template. The user receives this email when they signup, and have successfully verified their email, and logged in for the first time.

- **Verification E-Mail**
  
  Endpoint for verification email template. The user receives this email when verifes their email or when they request the [`forgotPassword()`](/api-reference/authentication/README.md#forgotpassword).
  

- **Invitation E-Mail**
  
  Endpoint for invitation email template. The user receives this email when they are invited to the project.
  You can send invitation to users from the `Users` page in your admin page in Skapi website.

- **Newsletter Subscription**
  
  Endpoint for public newsletter subscription confirmation email template. The user receives this email when they subscribe to the public newsletter.

Once you select the email type, the page will show the email endpoint address to set the template in the `E-Mail Template` section.

Following example shows the format for email endpoints:

```
xxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@mail.skapi.com
```

You may view already set templates, copy the end point.

To customize the email template, just send your customized template via your e-mail to the endpoint address.

:::danger
- **DO NOT** share your email endpoint address with anyone. This endpoint is unique to your project and should be kept private.
- You must use the same email address that you used to signup to Skapi.
:::

## Overriding the template for a single call

The template you set in the `Automated Emails` page is your project's template: every e-mail of that
type uses it. Some methods also take a `template` option that replaces it for one call only, which is
useful when a single flow needs different wording, branding, or a different language from the rest of
your project.

Each value is the `message_id` of a template you have already sent to the e-mail endpoint. Open the
`Automated Emails` page and select the e-mail type: every template you have uploaded is listed there
with its `message_id`.

The e-mail that actually goes out is chosen in this order:

1. the `message_id` passed in the `template` option of the call
2. your project's template for that e-mail type
3. Skapi's built in default

Methods that accept it:

| Method | Argument | Type |
|---|---|---|
| [`signup()`](/api-reference/authentication/README.md#signup) | `options.template` | `{ signup_confirmation?: string; welcome?: string }` |
| [`verifyEmail()`](/api-reference/user/README.md#verifyemail) | `options.template` | `{ verification?: string }` |
| `verifyPhoneNumber()` | `options.template` | `{ verification?: string }` |
| [`forgotPassword()`](/api-reference/authentication/README.md#forgotpassword) | `options.template` | `{ verification?: string }` |
| [`openIdLogin()`](/api-reference/authentication/README.md#openidlogin) | `params.template` | `{ welcome?: string }` |

Every value is an optional non empty `string`. Any other type, including an empty string, throws
`INVALID_PARAMETER`. Keys you leave out simply fall through to your project's template, so you can
override the welcome e-mail while leaving the signup confirmation alone.

:::warning
`option.template.signup_confirmation` requires `option.signup_confirmation` to be set on the same
call. Without it there is no confirmation e-mail to apply the template to, and the call throws
`INVALID_PARAMETER`.
:::

Overriding the signup confirmation and welcome e-mails:

```js
skapi.signup(
    { email: 'user@email.com', password: 'password' },
    {
        signup_confirmation: true,
        template: {
            signup_confirmation: 'signupconfirmationtemplateidxxxxxxxxxxxx',
            welcome: 'welcometemplateidxxxxxxxxxxxxxxxxxxxxxxx'
        }
    }
).then(res => {
    console.log(res); // SUCCESS: The account has been created. User's signup confirmation is required.
});
```

Overriding the verification e-mail. `verifyEmail()` with no code issues a new one, so the template
applies there; when you pass the code back to verify it, no e-mail is sent and the option is ignored:

```js
skapi.verifyEmail(undefined, {
    template: { verification: 'verificationtemplateidxxxxxxxxxxxxxxxxxx' }
}).then(res => {
    console.log(res); // SUCCESS: Verification code has been sent.
});
```

The same option covers the password reset code, since it is sent as a verification e-mail:

```js
skapi.forgotPassword(
    { email: 'user@email.com' },
    { template: { verification: 'verificationtemplateidxxxxxxxxxxxxxxxxxx' } }
).then(res => {
    console.log(res); // SUCCESS: Verification code has been sent.
});
```

If the `message_id` given for a verification e-mail cannot be found in your project, Skapi falls back
to your project's template rather than failing the call, and the e-mail is still sent.

## Template Placeholders

E-Mail templates takes custom placeholders that can be used to customize the email template.
If there is a placeholder character in your email content, it will be replaced with the corresponding value.

- **`${service_name}`**: Name of your project.
- **`${name}`**: User's name from the profile. If the user has not set their name, it will be replaced with empty string.
- **`${email}`**: User's email address.

## Required Placeholders for signup confirmation email

When sending signup confirmation email, you must include set a link with **`https://link.skapi`** as a url in your email content.
The dummy url **`https://link.skapi`** will be replaced with the actual link that confirms the user's signup.

Example below shows how to set the link with **`https://link.skapi`** url in gmail.
Any other email service should have similar way to set the link.

![gmail link](/linkexam.png)

Below shows an example of signup confirmation template. In this example we included **`${service_name}`** in the subject, and **`${name}`** with link in the content.

![signup confirmation template](/conftempexamp.png)


## Required Placeholders for verification email

When sending verification email, you must include **`${code}`** placeholders in your email content.
The **`${code}`** placeholder will be replaced with the verification code that the user can use to verify their email.

Example:
```
Your verification code is: ${code}
```


## Required Placeholders for invitation email

Below are the required placeholders for invitation email.

- **`https://link.skapi`**: Link to accept the invitation.
- **`${email}`**: Invited person's login email.
- **`${password}`**: Temporary password for the invited person.

When user clicks on the link, they will be able to login with the temporary password.

You can invite users to your project from the user page in your project page in Skapi website.

### Optional placeholders

These are not required. A template that leaves them out keeps working exactly as before.

- **`${name}`**: The invited person's name. Worth including to make the e-mail less anonymous.
- **`${username}`**: The account's permanent login username, when the invitation was created with one.
  It renders as empty for an invitation with no username, so only use it in a line that still reads
  correctly when it is blank, or send a template with it only to invitations that have one.

An account invited with a username can sign in with either that username or the e-mail address the
invitation was sent to, so `${email}` remains correct either way.

## Required Placeholders for public newsletter subscription confirmation email

When user subscribes to your public newsletters user receives subscription confirmation email.
The subscription confirmation email contains a link to confirm the subscription.

you must include **`https://link.skapi`** placeholders in your email content.
