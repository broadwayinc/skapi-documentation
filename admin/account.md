# Managing Users

Admins can manage user accounts by creating, deleting, blocking, and unblocking accounts. Admins can also grant access to users and cancel invitations.

## Assigning Access Group to Users

Users that have admin access can grant access to other users by using the [`grantAccess()`](/api-reference/admin/README.md#grantaccess) method.

This example demonstrates using the [`grantAccess()`](/api-reference/admin/README.md#grantaccess) method to grant access to a user.

When the request is successful, the string "SUCCESS: Access has been granted to the user." is returned.

You can grant user access group levels from 1 to 99.

99 is the admin group.

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
    <input name="email" placeholder="Email" required/>
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
    "SUCCESS: Account has been created."
    */
});
```
:::

When the request is successful, the string "SUCCESS: Account has been created." is returned.

And the user will be able to log in with the created email and password right away.

[`createAccount()`](/api-reference/admin/README.md#createaccount) method does not require any confirmation from the user.

For more detailed information on all the parameters and options available with the [`createAccount()`](/api-reference/admin/README.md#createaccount) method.


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


## Blocking User Accounts

Admins can block user accounts by using the [`blockAccount()`](/api-reference/admin/README.md#blockaccount) method.

This example demonstrates using the [`blockAccount()`](/api-reference/admin/README.md#blockaccount) method to block a user account.

When the request is successful, the string "SUCCESS: Account has been blocked." is returned.

```js [JS]
skapi.blockAccount(
    { 
        user_id: 'xxx...' // User ID to block.
    },
).then(response => {
    console.log(response);
    /*
    Returns:
    "SUCCESS: Account has been blocked."
    */
});
```

Once an account is blocked, the user will not be able to log in to the service.

## Unblocking User Accounts

Admins can unblock user accounts by using the [`unblockAccount()`](/api-reference/admin/README.md#unblockaccount) method.

This example demonstrates using the [`unblockAccount()`](/api-reference/admin/README.md#unblockaccount) method to unblock a user account.

When the request is successful, the string "SUCCESS: Account has been unblocked." is returned.

```js [JS]

skapi.unblockAccount(
    { 
        user_id: 'xxx...' // User ID to unblock.
    },
).then(response => {
    console.log(response);
    /*
    Returns:
    "SUCCESS: Account has been unblocked."
    */
});
```

