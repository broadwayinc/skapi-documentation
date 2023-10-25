# Automated E-Mails

When the user signup, reset password, or change email, subscribes to public newsletters, get invited to your service,
the system will send an automated email to the user.
You can customize the email template of the automated emails by sending your templates to the email endpoints.

E-Mail endpoints can be found in your `Mail` page in your service page.

In the `Mail` page, you can find the following endpoints:
- **Welcome**
  
  Endpoint for welcome email template. The user receives this email when they signup, and have successfully verified their email, and logged in for the first time.

- **Verification**
  
  Endpoint for verification email template. The user receives this email when verifes their email or when they request the [`forgotPassword()`](/api-reference/authentication/README.md#forgotpassword).
  
- **Signup Confirmation**
  
  Endpoint for signup confirmation email template. The user receives this email when they are requested for confirmation on signup.

- **Invitation**
  
  Endpoint for invitation email template. The user receives this email when they are invited to the service.

- **Newsletter Subscription**
  
  Endpoint for public newsletter subscription confirmation email template. The user receives this email when they subscribe to the public newsletter.

The following example shows the format for email endpoints:

```
xxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@mail.skapi.com
```

To customize the email template, just send your customized template via your e-mail to the endpoint address.

:::danger
- **DO NOT** share your email endpoint address with anyone. This endpoint is unique to your service and should be kept private.
- You must use the same email address that you used to signup to Skapi.
:::

## Template Placeholders

E-Mail templates takes custom placeholders that can be used to customize the email template.
If there is a placeholder character in your email content, it will be replaced with the corresponding value.

- **`${service_name}`**: Name of your service.
- **`${name}`**: User's name from the profile. If the user has not set their name, it will be replaced with empty string.
- **`${email}`**: User's email address.

## Required Placeholders for verification email

When sending verification email, you must include **`${code}`** placeholders in your email content.
The **`${code}`** placeholder will be replaced with the verification code that the user can use to verify their email.

Example:
```
Your verification code is: ${code}
```

## Required Placeholders for signup confirmation email

When sending signup confirmation email, you must include **`${link}`** or set a link with **`${link}`** placeholders in your email content.
The **`${link}`** placeholder will be replaced with the link that the user can use to confirm their signup.

Example below shows how to set the link with **`${link}`** placeholders in gmail.
Any other email service should have similar way to set the link.

![gmail link](/conflink.png)

Below shows an example of signup confirmation template. In this example we included **`${service_name}`** in the subject, and **`${name}`** with link in the content.

![signup confirmation template](/conftemp.png)


## Required Placeholders for invitation email

Below are the required placeholders for invitation email.

- **`${link}`**: Link to accept the invitation.
- **`${email}`**: Invited persons email address.
- **`${password}`**: Temporary password for the invited person.

When user clicks on the link, they will be able to login with the temporary password.

You can invite users to your service from the user page in your service page in Skapi website.

:::tip
To make the invitation email more personal, it would be good idea to include **`${name}`** placeholder in the template.
:::

## Required Placeholders for public newsletter subscription confirmation email

When user subscribes to your public newsletters user receives subscription confirmation email.
The subscription confirmation email contains a link to confirm the subscription.

you must include **`${link}`** placeholders in your email content.
