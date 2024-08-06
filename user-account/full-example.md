# Full Example: User Account Page

The examples shows how to build a user account page where users can retrieve and edit their account information.

:::warning
Since these examples are extension from the previous example: [Full Example: Implementing Authentication](/authentication/full-example.md).
The files from the previous examples should all be present in the same directory.
:::

```
.
├─ bye.html
├─ change_password.html
├─ confirmation_required.html
├─ create_account.html
├─ forgot_password.html
├─ index.html
├─ login.html
├─ user_account.html
└─ index.html
```

Below, are the modified/added files for this example:

- `bye.html`: Page displayed when the user disables their account.
- `change_password.html`: Page for changing the user's password.
- `index.html`: The main page that displays on successful login.
- `user_account.html`: User account page.

:::warning
Be sure to replace the 'service_id', 'owner_id' in `new Skapi()` on all example pages.
You can get your 'service_id' and 'owner_id' from your service dashboard.

For more information see [Getting Started](/introduction/getting-started.md)
:::

## index.html

This is an extended version of `index.html` from the [previous tutorial](/authentication/full-example.md#index-html).

Link to the user account, change password is added.
Verified badge is displayed if the user's email is verified.
Or else, button for verifing user's email will be displayed.

``` html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<h1 id="welcome">Welcome #name</h1>
<p id="your_email">Your e-mail is: #email</p>

<a href='user_account.html'>User Account</a> |
<a href='change_password.html'>Change Password</a> |

<button id='verifyEmail' onclick='emailVerification()' hidden>Verify Your E-Mail</button>

<form style='display: inline-block;' onsubmit="skapi.logout(event)" action="login.html">
    <input type="submit" value="Logout">
</form>

<script>
    const skapi = new Skapi('service_id', 'owner_id');
    let user = null;

    skapi.getProfile().then(u => {
        user = u;

        if (user === null) {
            // user is not logged in!
            // redirect to login page.
            return window.location.replace("login.html");
        }

        // welcome text
        welcome.textContent = welcome.textContent.replace('#name', user.name || '');

        // display user's email
        your_email.textContent = your_email.textContent.replace('#email', user.email);

        if (user?.email_verified) {
            // add verified badge
            your_email.textContent = your_email.textContent + ' [Verified]';
        }
        else {
            // show 'Verify Your E-Mail' button
            verifyEmail.removeAttribute('hidden');
        }
    });

    async function emailVerification() {
        // Sends verification code to user's E-Mail
        try {
            await skapi.verifyEmail();
            let code = prompt('Enter the verification code sent to your e-mail');
            if (code !== null) {
                // Verify code
                await skapi.verifyEmail({ code });
                window.alert('Your E-Mail is verified!');
            }
        }
        catch (err) {
            window.alert(err.message);
            throw err;
        }
    }
</script>
```

## user_account.html

This page is where user can view/update their account profile or disable their account.

User will get redirected back to `index.html` once the update is successful.

```html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<form onsubmit='skapi.updateProfile(event).catch(err=>alert(err.message))' action="index.html">
    <fieldset>
        <legend>
            <h1>User Account</h1>
        </legend>

        <label>E-mail:<br>
            <input type="email" name="email">
        </label><br><br>

        <label>Name:<br>
            <input name="name">
        </label><br><br>

        <label>Address:<br>
            <input name="address">
        </label><br><br>

        <label>Gender:<br>
            <input name="gender">
        </label><br><br>

        <label>Birthdate:<br>
            <input type="date" name="birthdate">
        </label><br><br>

        <label>
            <input type="checkbox" name="email_public"> Make E-Mail public
        </label><br><br>
        <label>
            <input type="checkbox" name="address_public"> Make Address public
        </label><br><br>
        <label>
            <input type="checkbox" name="gender_public"> Make Gender public
        </label><br><br>
        <label>
            <input type="checkbox" name="birthdate_public"> Make Birthdate public
        </label><br><br>
        <input type="submit" value='Update Profile'>
    </fieldset>
</form><br>
<button type='button' onclick='disableAccount()'>Disable account</button><br><br>
<a href="index.html">Back to main</a>

<script>
    const skapi = new Skapi('service_id', 'owner_id');

    skapi.getProfile().then(user => {
        if (user === null) {
            // user is not logged in!
            // redirect to login page.
            return window.location.replace("login.html");
        }

        let profileKeys = [
            'email',
            'email_public',
            'name',
            'address',
            'gender',
            'birthdate',
            'address_public',
            'gender_public',
            'birthdate_public'
        ];

        for (let k of profileKeys) {
            let input = document.querySelector(`input[name=${k}]`);
            if (k.includes('public') && user[k]) {
                // it's a checkbox
                input.checked = true;
                continue;
            }

            input.value = user[k] || '';
        }
    });

    function disableAccount() {
        if (confirm('Are you sure you want to disable your account?')) {
            skapi.disableAccount().then(() => {
                window.location.replace("bye.html");
            });
        }
    }
</script>
```

## bye.html

User will be redirected to this page when they disables their account.

```html
<!DOCTYPE html>
<h1>Your account is disabled. Sad to see you go :(</h1>
```


## change_password.html

This page is where user can change their password.

User will get redirected back to `index.html` once change password is successful.

```html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<form onsubmit='skapi.changePassword(event).catch(err => alert(err.message))' action="index.html">
    <fieldset>
        <legend>
            <h1>Change Password</h1>
        </legend>
        <label>
            <pre>Old password: <input type="password" name="current_password"></pre>
        </label>
        <label>
            <pre>New password: <input type="password" name="new_password"></pre>
        </label>
        <input type="submit" value='Change password'>
    </fieldset>
</form><br>
<a href="index.html">Cancel</a>

<script>
    const skapi = new Skapi('service_id', 'owner_id');

    skapi.getProfile().then(user => {
        if (user === null) {
            // user is not logged in!
            // redirect to login page.
            return window.location.replace("login.html");
        }
    });
</script>
```