# Full Example: Implementing Authentication

The examples shows how to build a full authentication system using Skapi.
The examples are simplified HTML files and do not include any CSS styling.

Below, are the files for this example:

```
.
├─ confirmation_required.html
├─ forgot_password.html
├─ index.html
├─ login.html
├─ reset_password.html
└─ signup.html
```

- `confirmation_required.html`: Page to notify users to confirm their signup
- `forgot_password.html`: Page for requesting a verification code to reset password
- `index.html`: Main page to show when user is logged in
- `login.html`: Page for logging in
- `reset_password.html`: Page for resetting a forgotten password
- `signup.html`: Page for creating a new user account

You create these files put them in the same directory.

:::warning
Be sure to replace the 'service_id', 'owner_id' in `new Skapi()` on all example pages.
You can get your 'service_id' and 'owner_id' from your service dashboard.

For more information see [Getting Started](/introduction/getting-started.md)
:::

## index.html

This page is the main page the users will see when they visit your website.

The [`getProfile()`](/api-reference/authentication/README.md#getprofile) method checks the login status and retrieves the account information.

If the user is logged in, the page will show the user's name and email.
The text content in the `h1` and `p` are replaced with the actual values.
User can also log out of their account by clicking 'Logout' button.

If the user is not logged in, the page will show a message to log in or sign up.

```html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    const skapi = new Skapi("service_id", "owner_id");
</script>

<main id="logged_in" hidden>
    <h1 id="welcome_msg">Welcome #name</h1>
    <p id="your_email">Your e-mail is: #email</p>    
    
    <form onsubmit="skapi.logout(event)" action="login.html">
        <input type="submit" value="Logout">
    </form>
</main>

<main id="logged_out" hidden>
    <h1>You are not logged in!</h1>
    <p>Please <a href="login.html">Login</a> to access this page.</p>
    <p>Don't have an account? <a href="signup.html">Sign Up</a> now!</p>
</main>

<script>
    skapi.getProfile().then(user => {
        // show/hide elements based on user's login status
        logged_in.hidden = !user;
        logged_out.hidden = !!user;

        if (user) {
            // when user is logged in, display a welcome text
            welcome_msg.textContent = welcome_msg.textContent.replace('#name', user.name || '');

            // display user's email
            your_email.textContent = your_email.textContent.replace('#email', user.email);
        }
    });
</script>
```

## signup.html

This page lets users create a new account on your service.

The [`signup()`](/api-reference/authentication/README.md#signup) method is used to make a signup request to the Skapi server and redirects them to the confirmation page on success.

Besides the _required_ `email` and `password` fields, the form includes optional fields to set user profile attributes.

E-mail verification is required for the user to log in to their account.

```html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    const skapi = new Skapi("service_id", "owner_id");
</script>

<a href="index.html">Back to Main</a>

<form action="confirmation_required.html" onsubmit="skapi.signup(event, { signup_confirmation: true }).catch(err => alert(err.message))">
    <h1>Create Account</h1>

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

    <input type="submit" value="Sign Up">
</form>
```

## confirmation_required.html

When users signup for their account, users will be redirected to this page.

This page is shown to notify user to confirm their signup.

[`skapi.resendSignupConfirmation()`](/api-reference/authentication/README.md#resendsignupconfirmation) is used to resend signup confirmation email to the user.

```html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    const skapi = new Skapi("service_id", "owner_id");
</script>

<h1>Signup confirmation is required</h1>
<p>Please check your e-mail to complete the process.</p>

<p>
    Did not get the e-mail?
    <button onclick="
        skapi.resendSignupConfirmation()
            .then(() => {
                alert('Signup confirmation e-mail has been sent');
                // disable the button to prevent spamming
                this.disabled = true;
            })
            .catch(err=>alert(err.message))
    ">
        Resend E-Mail
    </button>
</p>

<a href="login.html">Login</a>
```

## login.html

This page lets users log in to your website.

The url in form attribute `action` will redirect user to `index.html` upon successful login.
Below the form, there is a link for forgot password page.

When user tries to login before their signup is confirmed, They will be redirected to `confirmation_required.html`.

When the account is a disabled account, user will be asked if they want to recover their account.

See [recovering a disabled account](/user-account/disable-recover-account.md#recovering-a-disabled-account).

```html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    const skapi = new Skapi("service_id", "owner_id");
</script>

<a href="index.html">Back to Main</a>

<form onsubmit="skapi.login(event).catch(handleError)" action="index.html">
    <h1>Login</h1>
    
    <label>E-Mail:<br>
        <input type="email" name="email" required placeholder="E-Mail">
    </label><br><br>

    <label>Password:<br>
        <input type="password" name="password" required placeholder="Password">
    </label><br><br>
    
    <input type="submit" value="Login">

</form>

<br>

<a href="forgot_password.html">Forgot Password?</a>

<script>
    async function handleError(err) {
        switch (err?.code) {
            case 'USER_IS_DISABLED':
                if (window.confirm('Your account was deleted. Do you want to recover?')) {
                    await skapi.recoverAccount();
                    alert('Confirmation e-mail has been sent.');
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

The user must enter their e-mail and click the 'Request Code' button to receive a verification code via email.

Once the verification code is sent, user will be redirect to reset password page.

```html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    const skapi = new Skapi("service_id", "owner_id");
</script>

<a href="index.html">Back to Main</a>

<h1>Forgot Password</h1>
<p>Enter your e-mail to receive the verification code to reset your password.</p>

<form onsubmit="
    skapi.forgotPassword(event)
        .then(res => {
            alert('Verification code has been sent.');
            // Redirect to reset_password.html with email query parameter
            window.location.replace('reset_password.html?email=' + email.value);
        })
        .catch(err => alert(err.message))
">
    <input id="email" type="email" name="email" placeholder="login@email.com" required>
    <input type="submit" value="Request Code">
</form>
```


## reset_password.html

This page lets the user reset the forgotten password.

The user must enter their verification code, new password, and click the 'Change Password' button to reset the password.

```html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    const skapi = new Skapi("service_id", "owner_id");
</script>

<a href="index.html">Back to Main</a>

<h1>Reset Password</h1>
<p>Enter your verification code, and the new password.</p>

<form action="login.html" onsubmit="
    skapi.resetPassword(event)
        .then(()=>window.alert('Your password has been reset.'))
        .catch(err => alert(err.message))
">
    <input id="email" type="email" name="email" required hidden>
    <script>
        // Get email from query parameter, and set it to the hidden email input
        email.value = new URLSearchParams(window.location.search).get('email');
    </script>

    <label>
        Verification Code:<br>
        <input name="code" placeholder="Verification Code" required><br>
    </label><br>
    
    <label>
        New Password:<br>
        <input name="new_password" type='password' placeholder="New Password" required><br>
    </label><br>

    <input type="submit" value="Reset Password">
</form>
```

