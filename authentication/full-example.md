# Full Example: Implementing Authentication

The examples shows how to build an authentication system for your website.

Below, are the files for this example:

```
.
├─ confirmation_required.html
├─ create_account.html
├─ forgot_password.html
├─ index.html
└─ login.html
```

- `confirmation_required.html`: Page to notify users to confirm their signup
- `create_account.html`: Page for creating a new user account
- `forgot_password.html`: Page for resetting a forgotten password
- `index.html`: Main page to show when user is logged in
- `login.html`: Page for logging in

You create these files put them in the same directory.

:::warning
Be sure to replace the 'service_id', 'owner_id' in `new Skapi()` on all example pages.
You can get your 'service_id' and 'owner_id' from your service dashboard.

For more information see [Getting Started](/introduction/getting-started.md)
:::

## create_account.html

This page lets users create a new account on your service.

It uses an HTML form to make a signup request to the Skapi server and redirects them to the login page on success.
Besides the _required_ `email` and `password` fields, the form includes optional fields to set user profile attributes.

Users can confirm their signup via email by setting `signup_confirmation` is set to `true` in the second argument of [`signup()`](/api-reference/authentication/README.md#signup) method.
User will not be able to login to their account unless signup is confirmed.

```html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<form action="confirmation_required.html"
    onsubmit="skapi.signup(event, { signup_confirmation: true }).catch(err => alert(err.message))">
    <fieldset>
        <legend>
            <h1>Create Account</h1>
        </legend>

        <label>Login E-mail:<br>
            <input type="email" name="email" placeholder="user@email.com" required>
        </label><br><br>

        <label>Password:<br>
            <input type="password" name="password" placeholder="At least 6 characters" minlength="6" required>
        </label><br><br>

        <label>Name:<br>
            <input name="name" placeholder="(optional)">
        </label><br><br>

        <label>Address:<br>
            <input name="address" placeholder="(optional)">
        </label><br><br>

        <label>Gender:<br>
            <input name="gender" placeholder="(optional)">
        </label><br><br>

        <label>Birthdate:<br>
            <input type="date" name="birthdate">
        </label><br><br>

        <input type="submit" value="Create Account">
    </fieldset>
</form><br>
<a href="login.html">Cancel</a>

<script>
    const skapi = new Skapi('servce_id', 'owner_id');
</script>
```

## confirmation_required.html

When users signup for their account, users will be redirected to this page.
This page is shown to notify user to confirm their signup.

[`skapi.resendSignupConfirmation()`](/api-reference/authentication/README.md#resendsignupconfirmation) can be used to resend signup confirmation email to the user.

```html
<!DOCTYPE html>
<h1>Signup confirmation is required</h1>

Please check your email to complete the process.<br><br>

Did not get the email?
<button onclick="skapi.resendSignupConfirmation()
    .then(()=>alert('Signup confirmation e-mail has been sent'))
    .catch(err=>alert(err.message))">Resend E-Mail</button>

<br><br>

<a href='login.html'>Back to Login</a>

<script>
    const skapi = new Skapi('service_id', 'owner_id');
</script>
```

## login.html

This page lets users log in to your website.

The url in form attribute `action` will redirect user to `index.html` upon successful login.
Below the form, there is a link for forgot password and create account page.

When user tries to login before their signup is confirmed, They will be redirected to `confirmation_required.html`.
When the account is a disabled account, Option to recover the users will account show up.

See [recovering a disabled account](/user-account/disable-recover-account.md#recovering-a-disabled-account).

```html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<form onsubmit="skapi.login(event).catch(handleError)" action="index.html">
    <fieldset>
        <legend>
            <h1>Login</h1>
        </legend>
        <label>
            E-Mail:<br>
            <input type="email" name="email" required placeholder="E-Mail">
        </label><br><br>
        <label>
            Password:<br>
            <input type="password" name="password" required placeholder="Password">
        </label><br><br>
        <input type="submit" value="Login">
    </fieldset>
</form><br>

<a href="create_account.html">Create Account</a> |
<a href="forgot_password.html">Forgot Password?</a>

<script>
    const skapi = new Skapi('service_id', 'owner_id');

    function handleError(err) {
        switch (err?.code) {
            case 'USER_IS_DISABLED':
                if (window.confirm('Your account was deleted. Do you want to recover?')) {
                    skapi.recoverAccount().then(r => {
                        alert('Confirmation e-mail has been sent.');
                    });
                }
                break;

            case 'SIGNUP_CONFIRMATION_NEEDED':
                window.location.replace('confirmation_required.html');
                break;

            default:
                alert(err?.message || 'ERROR. Please try again.');
        }
    }
</script>
```

## forgot_password.html

This page lets the user reset the forgotten password.

The user must click the 'Request Code' button to receive a verification code via email.
Once the verification code is sent, form for reset password will be displayed.

```html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<div id='request' style='display:block;'>
    <h1>Request verification code</h1>
    <hr>
    <form onsubmit="skapi.forgotPassword(event)
        .then(res => {
            alert('Reset your password with the verification code received in your email.');
            toggleVisibility('request');
            toggleVisibility('reset');
        })
        .catch(err => alert(err.message)">
        <input id='email' type='email' name="email" placeholder="Login email" required><br>
        <input type="submit" value="Request Code">
    </form>
</div>
<div id='reset' style='display:none;'>
    <h1>Reset Password</h1>
    <hr>
    <form
        onsubmit="skapi.resetPassword(event).then(resetSuccess).catch(err => alert(err.message))">
        <input name="email" placeholder="Login email" required><br>
        <input name="code" placeholder="Verification Code" required><br>
        <input name="new_password" type='password' placeholder="New Password" required><br>
        <input type="submit" value="Reset Password">
    </form>
</div>
<script>
    let skapi = new Skapi('service_id', 'owner_id');
    function resetSuccess() {
        window.alert('Your password has been reset.');
        window.location.replace('login.html');
    }
    function toggleVisibility(id) {
        let div = document.getElementById(id);
        div.style.display = div.style.display !== 'none' ? 'none' : 'block';
    }
</script>
```

## index.html

This page is the main page users will see after logging in.

The [`getProfile()`](/api-reference/authentication/README.md#getprofile) method retrieves the account information.
If the user is not logged in, user will be redirected to `login.html`.
The text content in the `h1` and `p` are replaced with the actual values.

User can also log out of their account by clicking 'Logout' button.

```html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<h1 id="welcome">Welcome #name</h1>
<p id="your_email">Your e-mail is: #email</p>

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
    });
</script>
```

