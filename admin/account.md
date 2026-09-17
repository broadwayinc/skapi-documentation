# Managing Users

Admins can manage user accounts by creating, deleting, blocking, and unblocking accounts. Admins can also grant access to users and cancel invitations.

## Assigning Access Group to Users

Users that have admin access can grant access to other users by using the [`grantAccess()`](/api-reference/admin/README.md#grantaccess) method.

This example demonstrates using the [`grantAccess()`](/api-reference/admin/README.md#grantaccess) method to grant access to a user.

When the request is successful, the string "SUCCESS: Access has been granted to the user." is returned.

You can grant user access group levels from 1 to 99.

Access groups `90` and above are admins, and `'admin'` is accepted as a name for `99`, the group that is exempt from the access group rules on this page. See [Roles](/admin/permissions.md#roles).

An admin cannot grant an access group higher than their own: an admin in access group `95` can grant up to `95`, and the request fails with `Cannot grant an access group higher than your own.` otherwise. The project owner has no such limit.

An admin in access group `99` cannot be expelled by a lower admin: only another access group `99` admin or the project owner can change their access group. Anyone else gets `No access to expel admin.`

An admin in access groups `90` ~ `98` also cannot change the access group of an account that is already in the same access group as their own or a higher one. That request is refused with `INVALID_REQUEST` and `No access to modify admin.`, and nothing is changed. Admins in access group `99` and the project owner are not limited by it. See [The rank rule](/admin/permissions.md#the-rank-rule).

The account must be usable, too: a blocked account is refused with `Cannot grant access to suspended user.`, and an account that has not confirmed its signup with `User signup is not confirmed.` You cannot change your own access group: `User cannot self grant access.`

:::code-group
```html [Form]
<form onsubmit="skapi.grantAccess(event).then(response => console.log(response))">
    <input name="user_id" placeholder="User ID" required/>
    <input name="access_group" placeholder="Access Group" required/>
    <input type="submit" value="Grant Access" />
</form>
```

```js [JS]
skapi.grantAccess(
    { 
        user_id: 'user_id',
        access_group: 1
    },
).then(response => {
    console.log(response);
    /*
    Returns:
    "SUCCESS: Access has been granted to the user."
    */
});
```
:::


## Creating User Accounts

Admins can create user accounts by using the [`createAccount()`](/api-reference/admin/README.md#createaccount) method.

This example demonstrates using the [`createAccount()`](/api-reference/admin/README.md#createaccount) method to create a user account.

**You should provide the user's email and password.** Other user attributes are optional.

:::code-group
```html [Form]
<form onsubmit="skapi.createAccount(event).then(response => console.log(response))">
    <input name="email" placeholder="E-Mail" required/>
    <input name="password" placeholder="Password" required/>
    <input name="name" placeholder="Name"/>
    <input type="submit" value="Create Account" />
</form>
```

```js [JS]
skapi.createAccount(
    { 
        email: 'user@email',
        password: 'password',
        name: 'User Name'
    },
).then(response => {
    console.log(response);
    /*
    Returns:
    The created user's profile object (UserProfile & { email_admin: string; username: string }).
    */
});
```
:::

When the request is successful, the created user's profile object (UserProfile & { email_admin: string; username: string }) is returned.

And the user will be able to log in with the created email and password right away, when you create the account without a `username`: that address is then the account's own login ID.

[`createAccount()`](/api-reference/admin/README.md#createaccount) method does not require any confirmation from the user.

If you pass a `username`, it is the account's permanent login ID and cannot be changed later. The account
logs in with that username right away, and with its email only once that address is verified.

:::warning An account created with a username has no email login yet
`createAccount()` does not verify the email address, whoever creates the account. So an account you
create with a `username` logs in with that username alone until the user verifies the address with
[`verifyEmail()`](/api-reference/user/README.md#verifyemail), and email login then starts a few seconds
later, on the account's next token. An account created without a `username` is unaffected: the address
it was created with is its own permanent login ID and works from the start. See
[Login IDs](/admin/permissions.md#login-ids).
:::

Without a `username`, the request is refused with `EXISTS` and
`E-mail "user@email.com" is already a login ID in this service.` when the email is already a login ID
another account was granted: the address that account logs in with, or an address it has verified.
An email that another account was itself created or invited with, without a `username`, is the same
login ID again and gives `User already exists.` instead.

With a `username`, the same `E-mail` error is given whenever the email is a login ID another account was
granted, either as the login ID that account was created or invited with or as its verified email. The
`username` itself is refused only when it is an e-mail address another account was granted that way
(`Username "jane@email.com" is already a login ID in this service.`, or
`The login ID is already used by another account in this service.` when the refusal comes from the check
made as the account is created). A `username` that another account was already created or invited with
gives `User already exists.`, for example when the same account is created twice. See the
[`createAccount()` errors](/api-reference/admin/README.md#createaccount) and
[When a login ID is already taken](/authentication/create-account.md#when-a-login-id-is-already-taken).

An email login another account holds **without** having verified the address blocks nothing. It is
removed, that account keeps logging in with the login ID it was created with, and your request goes
through.

For more detailed information on all the parameters and options available with the [`createAccount()`](/api-reference/admin/README.md#createaccount) method.


## Updating User Attributes

Admins can update any user's profile attributes by using the [`updateUserAttributes()`](/api-reference/admin/README.md#updateuserattributes) method.

You must provide the target user's `user_id`, along with at least one attribute to update. Any attribute you omit is left unchanged.

When the request is successful, the string "SUCCESS: User attributes updated." is returned.

:::code-group
```html [Form]
<form onsubmit="skapi.updateUserAttributes(event).then(response => console.log(response))">
    <input name="user_id" placeholder="User ID" required/>
    <input name="name" placeholder="Name"/>
    <input name="misc" placeholder="Misc"/>
    <input type="submit" value="Update Attributes" />
</form>
```

```js [JS]
skapi.updateUserAttributes(
    {
        user_id: 'xxx...', // User ID to update.
        name: 'New Name',
        misc: 'Updated by admin'
    },
).then(response => {
    console.log(response);
    /*
    Returns:
    "SUCCESS: User attributes updated."
    */
});
```
:::

The updatable attributes are the same profile attributes used in [`createAccount()`](/api-reference/admin/README.md#createaccount): `name`, `email`, `phone_number`, `address`, `gender`, `birthdate`, `misc`, `picture`, `profile`, `website`, `nickname`, and the `*_public` visibility flags.

:::warning Changing a user's email takes their email login away
The new address is written **unverified**, whoever sends the request, the project owner and admins in
access group `99` included: this method cannot mark an e-mail address verified. The account's email
login is removed in the same request, so no email reaches it until the user verifies the new address
with [`verifyEmail()`](/api-reference/user/README.md#verifyemail), and then a few seconds later, on the
account's next token rather than in the `verifyEmail()` response.

The account keeps logging in with its `username`, or with the address it was created with when it was
created without one. Make sure the new value is correct before setting the matching `email_public` or
`phone_number_public` flag. See [Login IDs](/admin/permissions.md#login-ids).
:::

Sending the address the account already has, already verified, is not a change: it is left out of the
request, and the account keeps its verification and its email login.

An admin in access groups `90` ~ `98` can update only accounts whose access group is lower than their
own. Updating an account in the same access group or a higher one is refused with
`INVALID_REQUEST` and `No access to modify admin.`, and nothing in that request is changed. A
[disabled](/user-account/disable-recover-account.md) account counts with the access group it had before
it was disabled. The project
owner and admins in access group `99` can update every account. See
[The rank rule](/admin/permissions.md#the-rank-rule).

Nobody updates their **own** account with this method, the project owner and admins in access group `99`
included. Your own `user_id` is refused with `INVALID_REQUEST` and
`Cannot modify attributes of the current user.`, before anything is read or written. Update your own
profile with [`updateProfile()`](/api-reference/user/README.md#updateprofile) and no `user_id`, the same
call any user makes.

An `email` that is already a login ID another account was granted, as the login ID that account was
created with or as an address it has verified, is refused with `EXISTS` and
`E-mail "user@email.com" is already a login ID in this service.`, and nothing in that request is changed.
An email login another account holds without having verified the address is removed instead, and your
request goes through. The server derives the email login from the new address itself.
A login `username` is permanent: no admin method changes it, and a request that tries to set the login
handle without an `email` is refused with `INVALID_REQUEST` and
`The login username is permanent and cannot be changed.` See
[`updateUserAttributes()`](/api-reference/admin/README.md#updateuserattributes).

[`updateProfile()`](/api-reference/user/README.md#updateprofile) called with another user's `user_id`
sends this same request, so it follows the same rules and gives the same errors. Called with your own
`user_id` it drops the ID and updates your own profile instead, which is the call every user makes.


## Deleting User Accounts

Admins can delete user accounts by using the [`deleteAccount()`](/api-reference/admin/README.md#deleteaccount) method.

This example demonstrates using the [`deleteAccount()`](/api-reference/admin/README.md#deleteaccount) method to delete a user account.

When the request is successful, the string "SUCCESS: Account has been deleted." is returned.

```js [JS]
skapi.deleteAccount(
    { 
        user_id: 'xxx...' // User ID to delete.
    },
).then(response => {
    console.log(response);
    /*
    Returns:
    "SUCCESS: Account has been deleted."
    */
});
```

:::warning
This action is irreversible. Once an account is deleted, it cannot be recovered.
All the user's data will be deleted from the database.
:::

An admin in access groups `90` ~ `98` can delete only accounts whose access group is lower than their
own. Any other account is refused with `INVALID_REQUEST` and `No access to modify admin.`, and nothing
is deleted. A [disabled](/user-account/disable-recover-account.md) account counts with the access group
it had before it was disabled. Admins in access group `99` and the project owner can delete any account
of the project. See [The rank rule](/admin/permissions.md#the-rank-rule).

Passing your own `user_id` deletes your own account, and is not ranked.


## Blocking User Accounts

Admins can block user accounts by using the [`blockAccount()`](/api-reference/admin/README.md#blockaccount) method.

This example demonstrates using the [`blockAccount()`](/api-reference/admin/README.md#blockaccount) method to block a user account.

When the request is successful, the string "SUCCESS: The user has been blocked." is returned.

```js [JS]
skapi.blockAccount(
    { 
        user_id: 'xxx...' // User ID to block.
    },
).then(response => {
    console.log(response);
    /*
    Returns:
    "SUCCESS: The user has been blocked."
    */
});
```

Once an account is blocked, the user will not be able to log in to the project.

An admin in access groups `90` ~ `98` can block only accounts whose access group is lower than their own.
Any other account is refused with `INVALID_REQUEST` and `No access to modify admin.`, and nothing is
changed. Your own `user_id` is refused with `User cannot block self.` See
[The rank rule](/admin/permissions.md#the-rank-rule).

## Unblocking User Accounts

Admins can unblock user accounts by using the [`unblockAccount()`](/api-reference/admin/README.md#unblockaccount) method.

This example demonstrates using the [`unblockAccount()`](/api-reference/admin/README.md#unblockaccount) method to unblock a user account.

When the request is successful, the string "SUCCESS: The user has been unblocked." is returned.

```js [JS]

skapi.unblockAccount(
    { 
        user_id: 'xxx...' // User ID to unblock.
    },
).then(response => {
    console.log(response);
    /*
    Returns:
    "SUCCESS: The user has been unblocked."
    */
});
```

Unblocking follows the same rule as blocking: an admin in access groups `90` ~ `98` is refused an
account in the same access group as their own or a higher one with `No access to modify admin.`, so a
lower admin cannot let back in an account a higher admin blocked. Your own `user_id` is refused with
`User cannot unblock self.`

For the full policy, including what neither admins nor the project owner can do, see
[Admin Permissions](/admin/permissions.md).

