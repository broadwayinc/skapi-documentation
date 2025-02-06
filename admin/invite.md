# Inviting Users

Admins can invite users to the service by using the [`inviteUser()`](/api-reference/admin/README.md#inviteuser) method.

When a user is invited, an invitation email is sent to the user with a link to accept the invitation.

In the invitation email, the user will see the login email and randomly generated password, and a link to accept the invitation.

User should click on the link to accept the invitation within 7 days and they will be able to login to the service using the email and password provided in the invitation email.

This example demonstrates using the [`inviteUser()`](/api-reference/admin/README.md#inviteuser) method to invite a user to the service.
When the request is successful, the string "SUCCESS: Invitation has been sent." is returned.

:::code-group

```html [Form]
<form onsubmit="skapi.inviteUser(event).then(user => console.log(user))">
    <input name="email" placeholder="Email" required/>
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
The user will be able to login to the service using the email and password provided in the invitation email.
It is recommended to change the password after the first login.
:::

For more detailed information on all the parameters and options available with the [`inviteUser()`](/api-reference/admin/README.md#inviteuser) method,

## Resending Invitations

Admins can resend invitations to users who have not accepted the invitation by using the [`resendInvitation()`](/api-reference/admin/README.md#resendinvitation) method.

This example demonstrates using the [`resendInvitation()`](/api-reference/admin/README.md#resendinvitation) method to resend an invitation to a user.
When the request is successful, the string "SUCCESS: Invitation has been re-sent." is returned.

:::code-group

```html [Form]
<form onsubmit="skapi.resendInvitation(event).then(user => console.log(user))">
    <input name="email" placeholder="Email" required/>
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


## Cancelling Invitations

Admins can cancel invitations that have been sent by using the [`cancelInvitation()`](/api-reference/admin/README.md#cancelinvitation) method.

This example demonstrates using the [`cancelInvitation()`](/api-reference/admin/README.md#cancelinvitation) method to cancel an invitation that has been sent.
When the request is successful, the string "SUCCESS: Invitation has been cancelled." is returned.

:::code-group

```html [Form]
<form onsubmit="skapi.cancelInvitation(event).then(response => console.log(response))">
    <input name="email" placeholder="Email" required/>
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
    "SUCCESS: Invitation has been cancelled."
    */
});
```
:::
