# Automated Emails

When the user signup, reset password, or change email, subscribes to public newsletters, get invited to your project,
the system will send an automated email to the user.
You can customize the email template of these automated emails by sending your templates to the email endpoints.

E-Mail endpoints can be found in your `Automated Emails` page in your Skapi admin page.

:::warning Register an email alias first
Automated emails are sent from your project's **email alias**, so a template can only be set once the project has one. Register it in your project's `Settings` page. Until then the `Automated Emails` page asks you to register it, and a template sent to an endpoint is not saved: Skapi replies to your address with a notice saying that an email alias is needed. Templates you already set keep being sent.
:::

:::warning Your address must pass the sender trust check
Skapi only accepts a template from an address whose mail passes **SPF, DKIM and DMARC**, the checks that prove an email really comes from the address it names.
Mail that fails any of them, or comes from a domain that publishes none of them, is treated as suspicious and is not processed. Skapi replies to your address with a notice that lists each check and its result.
If you get that notice, ask your email provider, or whoever manages your domain, to check the trust settings (SPF, DKIM and DMARC) of your address, then send it again.
Addresses at the large email providers usually pass these checks already.
:::

:::warning Templates and the sending address are project settings
Setting or deleting a template, and choosing the address your automated emails are sent from, belong to the **project owner's Skapi account**, and to Skapi staff when you ask Skapi for help. An [admin](/admin/permissions.md#project-settings-belong-to-the-project-owner) of your project, access group `99` included, is refused with `INVALID_REQUEST` and `Only the project owner can change project settings.`

A template is set by sending it **from the project's email address**, the project owner's, to the endpoint the `Automated Emails` page shows. Mail from any other address is not processed. When that address passes the sender trust check below, Skapi replies to it that only the project owner can set templates.
:::

In the `Automated Emails` page, select an email type you want to set the template.

- **Signup Confirmation**
  
  Sent when a user signs up with `signup_confirmation` on in [`signup()`](/api-reference/authentication/README.md#signup), or when they call [`resendSignupConfirmation()`](/api-reference/authentication/README.md#resendsignupconfirmation). It carries the link that activates the account.

- **Welcome E-Mail**
  
  Sent at a user's first login if their email address is already verified, for example after a confirmed signup, an accepted invitation, or a first [`openIdLogin()`](/api-reference/authentication/README.md#openidlogin).

- **Verification E-Mail**
  
  Sent with a one-time code by [`verifyEmail()`](/api-reference/user/README.md#verifyemail) for an unverified email address, or by [`forgotPassword()`](/api-reference/authentication/README.md#forgotpassword) for a verified one.

- **Invitation E-Mail**
  
  Sent by [`inviteUser()`](/api-reference/admin/README.md#inviteuser) and [`resendInvitation()`](/api-reference/admin/README.md#resendinvitation), with the generated password and the link that accepts the invitation.
  You can also invite users from the `Users` page in your admin page in Skapi website.

- **Newsletter Subscription**
  
  Sent when a visitor who is not logged in subscribes to your public newsletter, with a link to confirm the subscription.

The tabs on the page are named **Signup**, **Welcome**, **Verification**, **Invitation** and **Newsletter**. Once you select one, the page shows:

- **Set Template**: the template setter, the email endpoint that takes templates for the selected type. Click the address to copy it, or click **[Compose]** to open a new message to it in your mail app. Every type has its own address.
- **Placeholders**: the placeholders the selected type fills in, split into **Required** and **Optional**.
- **Current template**: the subject of the template in use, or `Built-in default`, and when this type of email is sent. **[Preview]** opens it.

Below them is the list of the templates you have sent for that type.

![The Automated Emails page on the Signup tab: the Set Template address with a Compose link, the required and optional placeholders, the current template with a Preview link, and the list of uploaded templates with an In use column](/screenshots/mail-page.webp)

*The Automated Emails page. The Set Template address takes templates for the selected tab.*

### Placeholder information

Hover over a placeholder, or move to it with the keyboard, to see what it turns into for the selected type. Click it to copy it, then paste it into your template.

![A tooltip over the ${name} placeholder: the user's name from their profile, or empty when they have not set one, with Click to copy under it](/screenshots/mail-placeholders.webp)

*Every placeholder explains itself and copies with one click.*

See [Template Placeholders](#template-placeholders) for the full list per type.

### Choosing the template in use

Every template you send is added to the list of its type, newest first, with its subject and when it was received. The filled circle in the **In use** column marks the one your project sends. To switch, click the empty circle of another template and click **Confirm**.

![The Set as template confirmation: use "Welcome to ${service_name}! Confirm your email" as the Signup Confirmation template, with Cancel and Confirm buttons](/screenshots/mail-set-template.webp)

*New emails of this type use the chosen template right away. The template it replaces stays in the list.*

![The template list after the change: the newest template is marked In use and Current template shows its subject](/screenshots/mail-in-use.webp)

*The chosen template is marked In use, and Current template shows its subject.*

To remove templates, tick their rows and click the trash icon. Deleting the template in use sends that type back to the built-in default.

### Opening a template

Click a row of the list, or **[Preview]** on the **Current template** row, to open the template the way a recipient sees it. **Fill placeholders** is on when the preview opens, and swaps every placeholder, in the subject and in the body, for a sample value taken from your own account and project.

![The template preview with Fill placeholders on: the subject reads Welcome to Padaria Aurora, and the body greets Marina by name with her email address](/screenshots/mail-preview-filled.webp)

*Fill placeholders on: the email as a user would receive it.*

Turn **Fill placeholders** off to see the template as you wrote it, with every placeholder in place. This is the quickest way to check that a template carries the placeholders its type needs.

![The same preview with Fill placeholders off: ${service_name}, ${name} and ${email} appear as written](/screenshots/mail-preview-raw.webp)

*Fill placeholders off: the raw template.*

### Sending a template

Following example shows the format for email endpoints:

```
tpxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxx@mail.skapi.com
```

Endpoints in the older `xxxxxxxxxxxxxxxxxxxx-tpxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@mail.skapi.com` format keep working, so a saved address does not need to be updated.

To customize the email template, write it as an ordinary email in your own mail app and send it to the endpoint address:

1. Put the **Set Template** address of the type in **To**. **[Compose]** fills it in for you.
2. Write the **subject** and the **body**. The subject of your email becomes the subject of the automated email, and both can hold placeholders.
3. For the types that carry a link, select the link text and set its URL to **`https://link.skapi.com`**, using your mail app's insert link or edit link tool.
4. Send it **from your project's email address**.

![A mail compose window: From the project owner's address, To the Set Template address, a subject with ${service_name}, a body with ${name} and ${email}, and an Edit link dialog setting the link URL to https://link.skapi.com](/screenshots/mail-compose-template.webp)

*Composing a signup confirmation template. Any mail app with a link tool works the same way.*

Skapi checks the template when it arrives (see [When a template is rejected](#when-a-template-is-rejected)) and replies to you by email.
A template that passes is added to the list for its type: choose it there to use it.

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

E-Mail templates take placeholders: text that Skapi replaces with a value when the email is sent.
Each email type fills in its own set. A **required** placeholder must appear in the template, or the template is rejected when it arrives.
An **optional** one is filled in wherever you use it.

| Email type | Required | Optional |
|---|---|---|
| Signup Confirmation | `https://link.skapi.com` | `${email}`, `${name}`, `${service_name}` |
| Welcome E-Mail | none | `${email}`, `${name}`, `${service_name}` |
| Verification E-Mail | `${code}` | `${email}`, `${name}`, `${service_name}` |
| Invitation E-Mail | `https://link.skapi.com`, `${email}`, `${password}` | `${name}`, `${service_name}`, `${username}` |
| Newsletter Subscription | `https://link.skapi.com` | `${service_name}` |

- **`${service_name}`**: Name of your project.
- **`${name}`**: User's name from the profile. If the user has not set their name, it will be replaced with empty string.
- **`${email}`**: User's email address.

A placeholder's value is always inserted as **text**. A user's name, email address or password can hold any characters, and characters such as `<`, `>` and `&` show exactly as the user typed them, so a value can never add a link, an image or any other markup to your template. In the subject line, a line break in a value becomes a space.

The newsletter subscription confirmation is sent to an email address rather than to a user account, so it has no `${name}` or `${email}`.

In the `Automated Emails` page, hover over a placeholder to see what it turns into for the selected type, and click it to copy it. See [Placeholder information](#placeholder-information).

## The link placeholder

Signup confirmation, invitation and newsletter subscription emails carry a link. Put **`https://link.skapi.com`** in your template as the URL of a link, and Skapi replaces it with the real link when the email is sent.

- **`https://link.skapi.app`** is accepted as well.
- Use the placeholder on its own as the URL, with nothing added to it. A trailing `/` is fine, but a longer domain such as `https://link.skapi.company` does not count as the placeholder.

## When a template is rejected

Skapi checks every template it receives before saving it. A template is rejected when:

- it is missing one or more of the required placeholders for its type, or
- its HTML is larger than 240kb. Images and attachments are stored separately and do not count toward this.

A rejected template is not saved and does not appear in the template list. Skapi replies to the address that sent it with an email that names the template type and the subject, and lists every required placeholder that was missing and what each one is for. Add the missing placeholders and send the template again to the same endpoint.

A template that passes gets a reply saying it has been uploaded. It is not used until you select it in the `Automated Emails` page.


## Required Placeholders for signup confirmation email

When sending signup confirmation email, you must include a link with **`https://link.skapi.com`** as its URL in your email content.
The placeholder URL **`https://link.skapi.com`** will be replaced with the actual link that confirms the user's signup.

Select the link text in your mail app, open its insert link or edit link tool, and set the web address to **`https://link.skapi.com`**. The example in [Sending a template](#sending-a-template) does exactly this, with **`${service_name}`** in the subject and **`${name}`** and **`${email}`** in the body.


## Required Placeholders for verification email

When sending verification email, you must include **`${code}`** placeholders in your email content.
The **`${code}`** placeholder will be replaced with the verification code that the user can use to verify their email.

Example:
```
Your verification code is: ${code}
```


## Required Placeholders for invitation email

Below are the required placeholders for invitation email.

- **`https://link.skapi.com`**: Link to accept the invitation.
- **`${email}`**: Invited person's login email.
- **`${password}`**: Temporary password for the invited person.

When user clicks on the link, they will be able to login with the temporary password.

You can invite users to your project from the user page in your project page in Skapi website.

### Optional placeholders

These are not required. A template that leaves them out keeps working exactly as before.

- **`${name}`**: The invited person's name. Worth including to make the e-mail less anonymous.
- **`${username}`**: The account's permanent login username, when the invitation was created with one.
  For an invitation with no username it renders the invited person's e-mail address instead, which is
  that account's login ID, so a line such as `Sign in with ${username}` reads correctly either way. It is
  never empty. A resent invitation renders the same value, except for an invitation sent before the
  backend started keeping the plain username with the invitation, whose resend renders the e-mail address.

Once an account invited with a username accepts the invitation, the e-mail address the invitation was
sent to logs it in as well as the username, because accepting verifies the address, so `${email}` is
correct for it too. The address does not log the account in while the invitation is pending, and if it
is already a login ID another account of the project was granted by the time the invitation is accepted,
email login is not enabled and only the username logs the account in. See
[Login IDs](/admin/permissions.md#login-ids).

## Required Placeholders for public newsletter subscription confirmation email

When user subscribes to your public newsletters user receives subscription confirmation email.
The subscription confirmation email contains a link to confirm the subscription.

You must include a link with **`https://link.skapi.com`** as its URL in your email content. `${service_name}` is the only other placeholder this email fills in.
