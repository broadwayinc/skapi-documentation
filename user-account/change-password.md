# Changing Password

:::warning
User must be logged in to call this method.
:::

The [`changePassword()`](/api-reference/user/README.md#changepassword) method allows users who are logged-in to change their password. This method requires the user's current password and the new password as parameters. If the password change is successful, the method will return a success message.

Password should be at least 6 characters and no more than 60 characters.

:::code-group

```html [Form]
<form onsubmit="skapi.changePassword(event).then(res => alert(res))">
    <input type="password" name="current_password" placeholder="Current Password" required><br>
    <input type="password" name="new_password" placeholder="New Password" required><br>
    <input type="submit" value="Change Password">
</form>
```

``` js [JS]
let params = {
    current_password: 'current password',
    new_password: 'new password'
}

skapi.changePassword(params)
  .then(res => {
    alert(res); // SUCCESS: Password has been changed.
  });
```

:::

For more detailed information on all the parameters and options available with the [`changePassword()`](/api-reference/user/README.md#changepassword) method, 
please refer to the API Reference below:


### [`changePassword(params): Promise<string>`](/api-reference/user/README.md#changepassword)