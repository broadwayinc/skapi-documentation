# Inviting Users

Admins can invite users to the project by using the [`inviteUser()`](/api-reference/admin/README.md#inviteuser) method.

When a user is invited, an invitation email is sent to the user with a link to accept the invitation.

In the invitation email, the user will see the login email and randomly generated password, and a link to accept the invitation.

User should click on the link to accept the invitation within 7 days and they will be able to login to the project using the email and password provided in the invitation email. Accepting the invitation verifies the email address, so for an invitation created with a `username` both the username and the email log the account in from that moment, unless that address is already a login ID another account was granted; see [Setting the Invited User's Profile](#setting-the-invited-user-s-profile).

This example demonstrates using the [`inviteUser()`](/api-reference/admin/README.md#inviteuser) method to invite a user to the project.
When the request is successful, the string "SUCCESS: Invitation has been sent. (User ID: xxx...)" is returned.

:::code-group

```html [Form]
<form onsubmit="skapi.inviteUser(event).then(user => console.log(user))">
    <input name="email" placeholder="E-Mail" required/>
    <input type="submit" value="Invite" />
</form>
```

```js [JS]
skapi.inviteUser(
    { 
        email: 'user@email'
    },
).then(user => {
    console.log(user);
    /*
    Returns:
    "SUCCESS: Invitation has been sent. (User ID: xxx...)"
    */
});
```
:::

:::tip
The user will be able to login to the project using the email and password provided in the invitation email.
It is recommended to change the password after the first login.
:::

:::warning
An invitation is refused with `EXISTS` when its email is already a login ID another account was granted,
its own login ID or an address it has verified, for example the verified email of a user who was created
with a `username`, and, for an invitation with a `username`, also when the email is the login ID another
account was created with:
`E-mail "user@email.com" is already a login ID in this service.` A `username` is refused the same way
only when it is an e-mail address another account was granted that way:
`Username "jane@email.com" is already a login ID in this service.` An email login another account holds
without having verified the address blocks nothing: it is removed, that account keeps logging in with the
login ID it was created with, and the invitation goes out. See
[Login IDs](/admin/permissions.md#login-ids). While an invitation to an email is
still pending, a second invitation to that email is refused with `User is already invited.`, whatever the
`username` of either invitation. Once the first invitation was accepted, `User is already invited.` means
the invitation's own login ID (its `username`, or its email without one) was already used to create or
invite another account, and otherwise the result depends on the `username` of both invitations. See
[inviteUser() errors](/api-reference/admin/README.md#inviteuser),
[Inviting the same email again](/api-reference/admin/README.md#inviting-the-same-email-again) and
[When a login ID is already taken](/authentication/create-account.md#when-a-login-id-is-already-taken).
:::

For more detailed information on all the parameters and options available with the [`inviteUser()`](/api-reference/admin/README.md#inviteuser) method,
please refer to the API Reference below:

### [`inviteUser(params, options?): Promise<'SUCCESS: Invitation has been sent. (User ID: xxx...)'>`](/api-reference/admin/README.md#inviteuser)

## Setting the Invited User's Profile

You can fill in the invited user's profile as part of the invitation. Every attribute you pass is
written to the account when the invitation is sent, and it stays as you set it when the user accepts:
accepting only activates the account and marks its email verified.

:::code-group

```html [Form]
<form onsubmit="skapi.inviteUser(event).then(res => console.log(res))">
    <input name="email" placeholder="E-Mail" required/>
    <input name="username" placeholder="Username (optional)"/>
    <input name="name" placeholder="Name"/>
    <input name="phone_number" placeholder="+0012341234"/>
    <input name="access_group" type="number" min="1" max="99" placeholder="Access Group"/>
    <input type="submit" value="Invite" />
</form>
```

```js [JS]
skapi.inviteUser(
    {
        email: 'user@email.com',
        username: 'jane_doe',
        name: 'Jane Doe',
        phone_number: '+0012341234',
        birthdate: '1990-01-01',
        access_group: 10
    }
).then(res => {
    console.log(res);
    // SUCCESS: Invitation has been sent. (User ID: xxx...)
});
```
:::

A few of these behave in ways worth knowing:

- **`username`** is optional. When you set one it is the account's permanent login ID and can never be
  changed. Accepting the invitation verifies the email address, so the email it was sent to logs the
  account in as well from then on, unless that address is already a login ID another account was
  granted. While the invitation is pending, the email does not log the account in. See
  [E-Mail and username](/authentication/create-account.md#e-mail-and-username).
- **`access_group`** defaults to `1` when left out. Set it here to invite someone straight into a
  higher group instead of granting access after they accept. An admin cannot invite someone into an
  access group higher than their own.
- **`email_public`** and the other `*_public` flags default to `false`.

To show the username in the invitation e-mail itself, use the optional `${username}` placeholder in
your template. See [Optional placeholders](/email/email-templates.md#optional-placeholders).

## Redirecting After Acceptance

Pass `confirmation_url` to send the user to a page of your own once they accept the invitation.
Setting it also lets you subscribe them to [Service Email](/email/newsletters.md#sending-service-email) at the same time with `email_subscription`,
which is only accepted together with `confirmation_url`.

:::code-group

```html [Form]
<form onsubmit="skapi.inviteUser(event, {
        confirmation_url: 'https\:\/\/your.website.com/welcome',
        email_subscription: true
    }).then(res => console.log(res))">
    <input name="email" placeholder="E-Mail" required/>
    <input type="submit" value="Invite" />
</form>
```

```js [JS]
skapi.inviteUser(
    { email: 'user@email.com' },
    {
        confirmation_url: 'https://your.website.com/welcome',
        email_subscription: true
    }
).then(res => {
    console.log(res);
    // SUCCESS: Invitation has been sent. (User ID: xxx...)
});
```
:::

:::warning
`confirmation_url` must not contain the `#` character, and `email_subscription` without a
`confirmation_url` throws `INVALID_PARAMETER`.
:::

## Send Invitations with Custom Templates

Invitation emails are sent using the default template configured in your Skapi project.

You can use your own custom HTML email template by providing a template URL and custom subject line.

:::code-group

```html [Form]
<form onsubmit="skapi.inviteUser(event, {
        template: {
            url: 'https\:\/\/your.custom.template/file.html',
            subject: 'Exclusive Invitation'
        }
    }).then(user => console.log(user))">
    <input name="email" placeholder="E-Mail" required/>
    <input type="submit" value="Invite" />
</form>
```

```js [JS]
skapi.inviteUser(
    { 
        email: 'user@email'
    },
    {
        template: {
            url: 'https://your.custom.template/file.html',
            subject: 'Exclusive Invitation'
        }
    }
).then(user => {
    console.log(user);
    /*
    Returns:
    "SUCCESS: Invitation has been sent. (User ID: xxx...)"
    */
});
```
:::

:::danger
The template must include required placeholders in the HTML content.
For more information, see [Required Placeholders for Invitation E-Mail](/email/email-templates.html#required-placeholders-for-invitation-email).
:::

The optional `${name}` and `${username}` placeholders are available as well. `${username}` renders the
account's login username when the invitation was created with one, and the invited person's e-mail
address otherwise. A resent invitation renders the same value as the first e-mail; see
[Resending Invitations](#resending-invitations) for the one exception.

## Resending Invitations

Admins can resend invitations to users who have not accepted the invitation by using the [`resendInvitation()`](/api-reference/admin/README.md#resendinvitation) method.

This example demonstrates using the [`resendInvitation()`](/api-reference/admin/README.md#resendinvitation) method to resend an invitation to a user.
When the request is successful, the string "SUCCESS: Invitation has been re-sent. (User ID: xxx...)" is returned.

:::code-group

```html [Form]
<form onsubmit="skapi.resendInvitation(event).then(user => console.log(user))">
    <input name="email" placeholder="E-Mail" required/>
    <input type="submit" value="Resend Invitation" />
</form>
```

```js [JS]
skapi.resendInvitation(
    { 
        email: 'user@email'
    },
).then(user => {
    console.log(user);
    /*
    Returns:
    "SUCCESS: Invitation has been re-sent. (User ID: xxx...)"
    */
});
```
:::

The resent e-mail carries the same temporary password as the first one and renders `${username}` as the first e-mail did:
the login username for an invitation created with a `username`, the email otherwise. The exception is an
invitation sent before the backend started keeping the plain username with the invitation: its resend
renders the email, even though that address does not log a `username` invitee in until they accept.

Resending is refused with `No invitation found for: user@email.com.` (`NOT_EXISTS`) when no invitation
is found for the email, and with `User already exists.` (`EXISTS`) when the account found for it is not a
pending invitation. Which of the two an accepted invitation gives depends on how it was made: one made
without a `username` gives `User already exists.`, and one made with a `username` gives
`No invitation found for: user@email.com.` See
[`resendInvitation()`](/api-reference/admin/README.md#resendinvitation).

## Getting Sent Invitations

Admins can get a list of invitations that have been sent by using the [`getInvitations()`](/api-reference/admin/README.md#getinvitations) method.

This example demonstrates using the [`getInvitations()`](/api-reference/admin/README.md#getinvitations) method to get a list of invitations that have been sent.
When the request is successful, the [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse) containing the list of invitations is returned.

The `email` parameter can be used to filter the invitations by email.
When the `email` parameter is set, only invitations with the email starting with the given string will be returned.

:::code-group

```html [Form]
<form onsubmit="skapi.getInvitations(event).then(invitations => console.log(invitations))">
    <input name="email" placeholder="Search for email"/>
    <input type="submit" value="Get Invitations" />
</form>
```

```js [JS]
skapi.getInvitations(
    { 
        email: 'user@email'
    },
).then(invitations => {
    console.log(invitations);
    /*
    Returns:
    {
        list: [
            {
                email: 'user@email',
                ...
            },
            ...
        ],
        ...
    }
    */
});
```
:::

For more detailed information on all the parameters and options available with the [`getInvitations()`](/api-reference/admin/README.md#getinvitations) method,
please refer to the API Reference below:

### [`getInvitations(params?, fetchOptions?): Promise<DatabaseResponse<UserProfile>>`](/api-reference/admin/README.md#getinvitations)


## Cancelling Invitations

Admins can cancel invitations that have been sent by using the [`cancelInvitation()`](/api-reference/admin/README.md#cancelinvitation) method.

This example demonstrates using the [`cancelInvitation()`](/api-reference/admin/README.md#cancelinvitation) method to cancel an invitation that has been sent.
When the request is successful, the string "SUCCESS: Invitation has been canceled." is returned.

:::code-group

```html [Form]
<form onsubmit="skapi.cancelInvitation(event).then(response => console.log(response))">
    <input name="email" placeholder="E-Mail" required/>
    <input type="submit" value="Cancel Invitation" />
</form>
```

```js [JS]
skapi.cancelInvitation(
    { 
        email: 'user@email'
    },
).then(response => {
    console.log(response);
    /*
    Returns:
    "SUCCESS: Invitation has been canceled."
    */
});
```
:::
