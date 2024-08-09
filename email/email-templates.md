# Automated E-Mail

When the user signup, reset password, or change email, subscribes to public newsletters, get invited to your service,
the system will send an automated email to the user.
You can customize the email template of the automated emails by sending your templates to the email endpoints.

E-Mail endpoints can be found in your `Automated Email` page in your Skapi admin page.

In the `Automated Email` page, select an email type you want to set the template.

- **Signup Confirmation**
  
  Endpoint for signup confirmation email template. The user receives this email when they are requested for confirmation on signup.

- **Welcome Email**
  
  Endpoint for welcome email template. The user receives this email when they signup, and have successfully verified their email, and logged in for the first time.

- **Verification Email**
  
  Endpoint for verification email template. The user receives this email when verifes their email or when they request the [`forgotPassword()`](/api-reference/authentication/README.md#forgotpassword).
  

- **Invitation Email**
  
  Endpoint for invitation email template. The user receives this email when they are invited to the service.
  You can send invitation to users from the `Users` page in your admin page in Skapi website.

<!-- - **Newsletter Subscription**
  
  Endpoint for public newsletter subscription confirmation email template. The user receives this email when they subscribe to the public newsletter. -->

Once you select the email type, the page will show the email endpoint address to set the template.
Following example shows the format for email endpoints:

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

You can invite users to your service from the user page in your service page in Skapi website.

:::tip
To make the invitation email more personal, it would be good idea to include **`${name}`** placeholder in the template.
:::

<!-- ## Required Placeholders for public newsletter subscription confirmation email

When user subscribes to your public newsletters user receives subscription confirmation email.
The subscription confirmation email contains a link to confirm the subscription.

you must include **`https://link.skapi`** placeholders in your email content. -->
