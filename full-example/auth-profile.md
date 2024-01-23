# Authentication and User Profile

When building a web application, authentication is one of the most important features to implement.
And yet, it is also one of the most difficult features to implement.

This tutorial will show you how to implement full authentication and updating user profile in your web application using Skapi.

## Files to Read

```
.
├─ authentication
│  ├─ change_password.html
│  ├─ create-account.html
│  ├─ email-verification.html
│  ├─ forgot-password.html
│  ├─ profile-pic.html
│  ├─ recover-account.html
│  ├─ remove-account.html
│  ├─ reset-password.html
│  └─ update-profile.html
├─ custom.css
├─ index.html
└─ service.js
```

All the files in this tutorial are located in the `authentication` folder.
The `index.html` file is the main page of the application, and the `service.js` file will contain the initialized Skapi library.

## Connecting to your Service

### service.js

```javascript
/*
    This service.js code will be loaded on almost every page of your website.
    Each page will have access to the skapi object.
*/

/*
    Below, is the initializing code for Skapi.
    Make sure you replace the first, and the second argument: "ap220wfRHl9Cw2QqeFEc", "f8e16604-69e4-451c-9d90-4410f801c006" to your own service ID and owner ID.
    You can retrieve the service ID and the owner ID from www.skapi.com.
    For more information, checkout the Getting Started: https://docs.skapi.com/introduction/getting-started.html

    The third argument we are passing is an object with a property called autoLogin.
    If autoLogin is set to true, then the user will always be automatically logged in when the page loads.
*/
const skapi = new Skapi("ap220wfRHl9Cw2QqeFEc", "f8e16604-69e4-451c-9d90-4410f801c006", { autoLogin: true });

/*
    The following function disableForm() is for disabling the form while the user is submitting.
    It can be useful if you want to prevent the user from submitting the form multiple times.
    You will see this function being used in the form submission thoughout the project.
*/
function disableForm(form, disabled) {
    form.querySelectorAll('input').forEach(input => {
        if (input.type !== 'radio' && input.type !== 'checkbox')
            input.disabled = disabled
    });

    form.querySelectorAll('a').forEach(a => {
        return disabled ? a.setAttribute('disabled', '') : a.removeAttribute('disabled');
    });
}
```

## Main Page

### index.html

```html
<!--
    index.html is the first page your user will see when they visit your website.
    It will show either the login dialog or the main page of your website.
-->
<!DOCTYPE html>
<meta name="viewport" content="width=device-width, initial-scale=1" />

<!--
    Following <script> tag will import skapi.js that is hosted on jsdelivr CDN, so you don't need to download it.
-->
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<!--
    Import the service.js code that contains your initialization of Skapi class,
    and the disableForm() function that will be used in this tutorial.
-->
<script src="service.js"></script>

<!--
    Following <link> tag will import init.css that is hosted on jsdelivr CDN.
    This is a CSS file that will reset the default styling of html to modern standard, which is a great starting point for your website.
    For more information: https://github.com/broadwayinc/modern-init-css
-->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/modern-init-css@latest/init.css">

<!--
    Following <link> tag will import custom.css that is hosted on your own website.
    We provided a custom.css file for minimal styling of your website.
    Feel free to modify it to your liking.
-->
<link rel="stylesheet" href="custom.css">

<!--
    Following <dialog> contains the login form.
    It will be shown when the user is not logged in.
-->
<dialog id="dialog_login">
    <h2>Login</h2>
    <form onsubmit="
            /*
                Following disableForm() is a function that is imported from service.js.
                It will disable all input elements inside the form.
                This is to prevent the user from submitting the form multiple times.
                You can find the implementation of this function in every form in the tutorial.
            */
            disableForm(this, true);

            /*
                skapi.login() will login the user with the provided email and password.
                skapi.login() takes submit event directly as the first parameter.
                If the login is successful, it will call the main() function.
                The main() function will be declared at the end of the page in the <script> tag.
                The main() function will decide to show the main page or the login form depending on the login status.
                If the login is unsuccessful, it will show an alert with the error message.
                Finally, it will call disableForm() with second argument value to [true] to enable all the input elements back again.
            */
            skapi.login(event).then(main).catch(async err=>{
                if(err.code === 'USER_IS_DISABLED') {
                    /*
                        If the user account is disabled, you can ask the user if they want to recover their account.
                        If they do, we will call skapi.recoverAccount() to send a recovery email to the user.
                        Then we will redirect the user to the authentication/recover-account.html page that gives the user instructions to recover their account.
                    */
                    let recover = confirm('Your account is disabled. Would you like to recover your account?');
                    if(recover) {
                        await skapi.recoverAccount();
                        location.href = 'authentication/recover-account.html';
                        return;
                    }
                }
                else {
                    alert(err.message);
                }
            }).finally(()=>disableForm(this, false));
    ">
        <!--
            Following <table> contains the login form.
            Note that all input elements are required to have "name" attributes.
            The "name" attribute value will be used as the key of the data that will be sent to the server.
        -->
        <table>
            <tr>
                <td>Email</td>
                <td>
                    <input type='email' name="email" placeholder='your@email.com' required autocomplete="email">
                </td>
            </tr>
            <tr>
                <td>Password</td>
                <td>
                    <input type="password" name="password" placeholder='Your Password' required autocomplete="off">
                </td>
            </tr>
            <tr>
                <td></td>
                
                <!--
                    Following <td> contains a class "alignRight" that will align the content to the right.
                    For convenience, we have provided some predefined style classes in custom.css.
                -->
                <td class="alignRight">
                    <!--
                        Following <a> tag will link to the forgot-password.html page.
                        This page will allow the user to reset their password.

                        Style class "alignRight" is used to align the <a> tag to the right.
                        You can find more predefined style classes in custom.css.
                    -->
                    <a href="authentication/forgot-password.html">
                        <small>Forgot Password?</small>
                    </a>
                </td>
            </tr>
        </table>
        <br>
        <div class="alignRight">
            <!--
                Following <a> tag will link to the create-account.html page.
                This page will allow the user to create a new account.
            -->
            <a href="authentication/create-account.html">
                <small>Create Account</small>
            </a>
            &nbsp;&nbsp;
            <input type="submit" value="Login">
        </div>
    </form>
</dialog>

<!--
    Following <main> contains the main page of your website.
    It will be shown when the user is logged in.
    It will show the user's profile picture, name, email, and birthday when available.
    It will also show links to the other pages of this tutorial.
-->
<main id="main_page">
    <section>
        <img src="" id="img_profilePic" class="profilePic">
        You're Logged In

        <h1 id="h1_helloText"></h1>
        <h3 id="h3_yourEmail"></h3>
        <h3 id="h3_birthdayReminder"></h3>
    </section>

    <nav class="alignRight">
        <div>
            <a href="instaclone/instaclone.html">Instaclone</a>
            |
            <a href="chatroom/chatroom.html">Chat Room</a>
            |
            <a href="image-generator/image-generator.html">Image Generator</a>
            |
            <a href="authentication/update-profile.html">Update Profile</a>
        </div>
        <br>

        <!--
            Following <button> tag will logout the user when clicked.
            It will call skapi.logout() to logout the user.
            Then it will call the main() function to decide to show the main page or the login form depending on the login status.
        -->
        <button onclick="skapi.logout().then(main)">Logout</button>
    </nav>
</main>

<script>
    /*
        Following main() function will decide to show the main page or the login form depending on the login status.
        The main() function calls skapi.getProfile() to get the user's profile.
        If the user is logged in, skapi.getProfile() will return the user's profile when the promise is resolved.
        If the user is not logged in, skapi.getProfile() will return null when the promise is resolved.
        Then the main() function will show the main page if the user is logged in, or show the login form if the user is not logged in.
    */
    let main = () => skapi.getProfile().then(u => {
        if (u) {
            /*
                If the user is logged in, we will show the main page.
                The resolved value of skapi.getProfile() is the user's profile object.
                We will also show the user's profile picture, name, email, and birthday when available.
            */
            main_page.style.display = 'block';
            h1_helloText.textContent = `Hello "${u.name}"!`;
            h3_yourEmail.textContent = `Your login email is: ${u.email}`;
            h3_birthdayReminder.textContent = u.birthdate ? `And you were born in ${new Date(u.birthdate).toDateString()}!` : '';
            img_profilePic.src = u.picture || '';
            dialog_login.close();
        }
        else {
            main_page.style.display = 'none';
            dialog_login.showModal();
        }

        return u;
    });
    main();
</script>
```

## Create Account

### authentication/create-account.html

```html
<!--
    This page for account creation.
-->
<!DOCTYPE html>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script src="../service.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/modern-init-css@latest/init.css">
<link rel="stylesheet" href="../custom.css">
<script>
    /*
        We will check if the user is logged in.
        If the user is logged in, it means that the user already has an account.
        So we will redirect the user to the home page.
    */
    skapi.getProfile().then(user => {
        if (user) {
            location.href = '../index.html';
        }
    });
</script>

<main id="main_page">
    <!--
        Following <form> will create an account for the user.
        When user submits, we will use the skapi.signup() function to create an account.
        On the second argument of skapi.signup(), we set login to true so that the user will be logged in right after account creation is successful.
        On the form action, we set it to ../index.html so that the user will be redirected to the home page after account creation.
    -->
    <form action='../index.html' onsubmit="
        disableForm(this, true);
        skapi.signup(event, {login:true}).catch(err=>alert(err.message)).finally(()=>disableForm(this, false));
    ">
        <div class="spaceBetween">
            <h2>Create Account</h2>
            <a href="../index.html">Back</a>
        </div>
        <hr>
        <table>
            <tr>
                <td>Login Email</td>
                <td>
                    <input name="email" placeholder='your@email.com' required>
                </td>
            </tr>
            <tr>
                <td>Set Password</td>
                <td>
                    <input type="password" name="password" minlength="6" placeholder='At least 6 characters' required>
                </td>
            </tr>
            <tr>
                <td>Your Name</td>
                <td>
                    <input name="name" placeholder='Your name (required)' required>
                </td>
            </tr>
            <tr>
                <td></td>
                <td class="alignRight">
                    <input type="submit" value="Create">
                </td>
            </tr>
        </table>
    </form>
</main>
```

## Forgot Password

### authentication/forgot-password.html

```html
<!--
    This is the forgot password page.
    It has a simple form with a single input field for the user to input his/her login email address.
    User can request for a verification code to be sent to his/her email address for resetting their password.
-->
<!DOCTYPE html>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script src="../service.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/modern-init-css@latest/init.css">
<link rel="stylesheet" href="../custom.css">
<main id="main_page">
    <!--
        Following <form> will send the verification code to the user's email address.
        We will use the skapi.forgotPassword() method to send the verification code to the user's email address.
        When the form is submitted, 6 digits verification code will be sent to the user's email address.
        Then, the user will be redirected to reset-password.html.
        Note that the form action is 'reset-password.html#{email}'.
        Skapi will automatically replace the placeholder {email} to the value of the input named "email", which will be the users address.
        We can use the value of the placeholder in the reset-password.html page to pre-fill the email address input field.
    -->
    <form action='reset-password.html#{email}' onsubmit="
        disableForm(this, true);
        skapi.forgotPassword(event).catch(err=>alert(err.message)).finally(()=>disableForm(this, false));
    ">
        <div class="spaceBetween">
            <h2>Forgot Password</h2>
            <a href="../index.html">Back</a>
        </div>
        <hr>
        <p>
            Input your login email address below and click on 'Submit'.
            You will receive an email with a 6 digits verification code for resetting your password.
        </p>
        <br>
        <div class="alignCenter">
            <input type="email" name="email" placeholder="your@account.email">
            <input type="submit" value="Submit">
            <style>
                input {
                    margin: 4px 0;
                }
            </style>
        </div>
        <br>
        <p><strong>Note: </strong>If your account's email address is not verified, you will not be able to reset your password.</p>
    </form>
</main>
```

### authentication/reset-password.html

```html
<!--
    This is the reset password page
    User is redirected to this page from the forgot password page.
-->
<!DOCTYPE html>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script src="../service.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/modern-init-css@latest/init.css">
<link rel="stylesheet" href="../custom.css">

<main id="main_page">
    <!--
        The form below is the reset password form.
        The user needs to enter the verification code and the new password.
        When successful the user will be redirected to ../index.html page where he/she can login.
    -->
    <form action='../index.html' onsubmit="
        disableForm(this, true);
        skapi.resetPassword(event).then(()=>alert('Password has been reset.')).catch(err=>alert(err.message)).finally(()=>disableForm(this, false));
    ">
        <div class="spaceBetween">
            <h2>Reset Password</h2>
            <a href="../index.html">Back</a>
        </div>
        <hr>
        <p>Enter the 6 digits verification code you may have received in your email and set new password below.</p>
        <input type="email" name="email" placeholder="E-Mail" required hidden>
        <script>
            /*
                The email address is passed from the forgot password page.
                We can get the email address from the hash of the url.
                The hash is the part of the url after the # sign.
                We can get the hash using location.hash.
                We can get the email address by removing the # sign from the hash.
                Then, we can set the value of the email input field for the user.
                Email input field is hidden but it is required for the reset password method.
            */
            let email = location.hash.slice(1);
            document.querySelector('input[name=email]').value = email;
        </script>
        <table>
            <tr>
                <td>Code</td>
                <td>
                    <input type="text" name="code" placeholder="6 digits code" required>
                </td>
            </tr>
            <tr>
                <td>New Password</td>
                <td>
                    <input type="password" name="new_password" placeholder="New Password" required>
                </td>
            </tr>
            <tr>
                <td></td>
                <td class="alignRight">
                    <input type="submit" value="Change Password">
                </td>
            </tr>
        </table>
        <br>
        <br>
        If you have not received the code,
        <br>
        please check your spam folder.
        <br>
        <br>
        <span>
            Or click <ins class='clickable' onclick="
                /*
                    When this is clicked, we will manually execute the skapi.forgotPassword() method to re-send the verification code to the user's email address.
                    When successful, we will replace the content of the parent element of this element with a message: Verification code has been sent.
                */
                let userConfirm = confirm(`We will send a verification code to ${email}. Continue?`);
                if (userConfirm) {
                    skapi.forgotPassword({email}).then(()=>this.parentElement.innerHTML = 'Verification code has been sent.').catch(err=>alert(err.message));
                }
            ">HERE</ins> to resend.
        </span>
        <br>
        <p><strong>Note: </strong>If your account's email address is not verified, you will not be able to reset your
            password.</p>
    </form>
</main>
```

## Recover Account

### authentication/recover-account.html

```html
<!--
    This page displays instructions to the user to recover their account.
    The page is redirected from the ../index.html page when user tries to login to a disabled account, then confirms to recover the account.
    At this point, the user has already received the recovery email.
-->
<!DOCTYPE html>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script src="../service.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/modern-init-css@latest/init.css">
<link rel="stylesheet" href="../custom.css">

<main id="main_page">
    <div class="spaceBetween">
        <h2>Recover Account</h2>
        <a href="../index.html">Back</a>
    </div>
    <hr>
    <p>
        Account recovery email has been sent to your email address.
        Please check your email and follow the instructions to recover your account.
    </p>
    <p>
        If you have not received the email,
        <br>
        please check your spam folder.
    </p>
    <p><strong>Note: </strong>You will not receive the recovery email if your account does not have a verified email address.</p>
</main>
```

## Update Profile

### authentication/update-profile.html

```html
<!--
    This page is for updating user profile.
    It is a form that allows user to update their profile picture, name, birthday, option to make their email address available to public or change their login email.
    It also shows the last login time and allows user to verify their email.
    It also allows user to change their password and remove their account.
-->
<!DOCTYPE html>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script src="../service.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/modern-init-css@latest/init.css">
<link rel="stylesheet" href="../custom.css">

<main id="main_page">
    <form action='../index.html' onsubmit="
        disableForm(this, true);
        /*
            skapi.updateProfile() will update the user profile with the provided data.
            skapi.updateProfile() takes submit event directly as the first parameter.
            If the update is successful, it will redirect the user to ../index.html page.
            If the update is unsuccessful, it will show an alert with the error message.
            Finally, it will call disableForm() with second argument value to [true] to enable all the input elements back again.
        */
        skapi.updateProfile(event).catch(err=>alert(err.message)).finally(()=>disableForm(this, false));
    ">
        <div class="spaceBetween">
            <h2>Update Profile</h2>
            <a href="../index.html">Back</a>
        </div>
        <small>
            Last login time: <span id="span_logTime"></span>
        </small>
        <hr>
        <table>
            <tr>
                <td>
                    <span>
                        Profile Picture
                    </span>
                </td>
                <td>
                    <!--
                        When the user clicks on the profile picture, it will open the profile-pic.html page,
                        where user can upload a new profile picture.
                    -->
                    <a class='imgLink' href="profile-pic.html">
                        <img src="" id="img_profilePic" class="profilePic">
                        Update Profile Picture
                    </a>
                    <style>
                        a.imgLink {
                            text-decoration: none;
                        }
                    </style>
                </td>
            </tr>
            <tr>
                <td>
                    <span>
                        Login Email
                    </span>
                </td>
                <td>
                    <input id='input_email' name="email" placeholder='your@email.com' required>

                </td>
            </tr>
            <tr>
                <td>
                    <span>
                        Your Name
                    </span>
                </td>
                <td>
                    <input id='input_name' name="name" placeholder='Your name (required)' required>
                </td>
            </tr>
            <tr>
                <td>
                    <span>
                        Birthday
                    </span>
                </td>
                <td>
                    <input id='input_birthdate' name="birthdate" type="date">
                </td>
            </tr>
            <tr>
                <td>
                    <span>
                        Email to Public
                    </span>
                </td>
                <td>
                    <input id='input_emailPublic' name="email_public" type="checkbox">
                    <small class="inlineBlock">(Email verification required)</small>
                    <style>
                        /*
                            We will disable the checkbox if the user's email is not verified.
                            We will hide the preceding small tag noting 'Email verification required' if the checkbox is enabled.
                        */
                        #input_emailPublic:not([disabled])+small {
                            display: none;
                        }
                    </style>
                </td>
            </tr>
            <tr>
                <td>
                    <span>
                        Email Verified
                    </span>
                </td>
                <td>
                    <span id="span_emailVerified"></span>
                    <ins class='clickable inlineBlock' onclick="
                        /*
                            When the user clicks on (Click to verify your email), it will ask user to received a verification email.
                            If the user confirms, it will send a verification email to the user.
                            Then, the user will be redirected to the email-verification.html page where the user can enter the verification code to verify their email address.
                        */
                        let userConfirm = confirm(`We will send a verification email to ${user.email}. Continue?`);
                        if(userConfirm) {
                            skapi.verifyEmail().then(()=>location.href = 'email-verification.html').catch(err=>alert(err=>alert(err.message)));
                        }
                    ">
                        <small>
                            (Click to verify your email)
                        </small>
                        <style>
                            /*
                                We are using css to show the email verification status dynamically.
                                We will show 'Yes' if the email is verified and 'No' if the email is not verified.
                                We will hide the preceding clickable small tag (Click to verifiy your email) if the email is verified.
                            */
                            #span_emailVerified.false::before {
                                content: 'No ';
                                display: inline-block;
                            }

                            #span_emailVerified.true::after {
                                content: 'Yes';
                            }

                            #span_emailVerified.true+ins {
                                display: none;
                            }
                        </style>
                    </ins>
                </td>
            </tr>
            <tr>
                <td>
                    <span>
                        Password
                    </span>
                </td>
                <td>
                    <!--
                        When the user clicks the link below, it will open the change-password.html page, where the user can change their password.
                    -->
                    <a href="change-password.html">Change Password</a>
                </td>
            </tr>
        </table>
        <br>
        <div class="alignRight">
            <input type="submit" value="Update">
            <br>
            <br>
            <small>
                <!--
                    When the user clicks the link below, it will open the remove-account.html page, where the user can remove their account.
                -->
                <a href="remove-account.html">Remove Account</a>
            </small>
        </div>
    </form>
</main>

<script>
    let user;
    skapi.getProfile().then(u => {
        if (!u) {
            /*
                If the user is not logged in, redirect the user to the index.html page.
            */
            location.href = '../index.html';
            return;
        }

        /*
            We will set the user variable to the user object.
            We will use the user variable to access the user email to show confirmation dialog when the user clicks on (Click to verify your email).
        */
        user = u;

        span_logTime.textContent = new Date(user.log * 1000).toLocaleString();
        input_email.value = user.email;
        input_name.value = user.name;
        input_birthdate.value = user.birthdate || "";
        img_profilePic.src = user.picture || "";

        span_emailVerified.classList.add(user.email_verified.toString());
        if (!user.email_verified) {
            /*
                If the user's email is not verified, we will disable the email public checkbox.
                User needs to verify their email before they can make their email public.
            */
            input_emailPublic.disabled = true;
        }

        /*
            We will set the email public checkbox to checked if the user's email is public and verified.
        */
        input_emailPublic.checked = user.email_public && user.email_verified;
    });
</script>
```

## Email Verification

### authentication/email-verification.html

```html
<!--
    This page is for email verification.
    This page is redirect from update-profile.html after the user clicks on the "(Click to verify your email)" button.
    At this point, the user will receive the verification code in the email.
-->
<!DOCTYPE html>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script src="../service.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/modern-init-css@latest/init.css">
<link rel="stylesheet" href="../custom.css">
<script>
    /*
        Following code will check if the user is logged in.
        If the user is not logged in, it will redirect the user to ../index.html page.
        Also, if the user has already verified the email, it will redirect the user to update-profile.html page.
    */
    let user;
    skapi.getProfile().then(u => {
        if (!u) {
            location.href = '../index.html';
            return;
        }
        if (u.email_verified) {
            location.href = 'update-profile.html';
        }
        user = u;
    });
</script>

<main id="main_page">
    <!--
        Following <form> will verify the email of the user.
        When successful, it will show an alert with the message "Your email is verified." and redirect the user back to update-profile.html page.
        When unsuccessful, it will show an alert with the error message.
    -->
    <form action='update-profile.html' onsubmit="
        disableForm(this, true);
        skapi.verifyEmail(event).then(r=>alert('Your email is verified.')).catch(err=>alert(err.message)).finally(()=>disableForm(this, false));
    ">
        <div class="spaceBetween">
            <h2>Email Verification</h2>
            <a href="update-profile.html">Back</a>
        </div>
        <hr>
        <p>
            Please check your email for the verification code.
            <br>
            Enter the received code below and click verify.
        </p>
        <br>
        <div id="div_singleInput">
            <input type="text" name="code" placeholder="6 digits code">
            <input type="submit" value="Verify">
            <style>
                #div_singleInput {
                    text-align: center;
                }

                input {
                    margin: 4px 0;
                }
            </style>
        </div>
        <br>
        <br>
        If you have not received the code,
        <br>
        please check your spam folder.
        <br>
        <br>
        <span>
            Or click <ins class='clickable' onclick="
                let userConfirm = confirm(`We will send a verification email to ${user.email}. Continue?`);
                if (userConfirm) {
                    skapi.verifyEmail()
                        .then(()=>this.parentElement.innerHTML = 'Verification email has been sent.')
                        .catch(err=>alert(err.message));
                }
            ">HERE</ins> to resend.
        </span>
    </form>
</main>
```

## Change Password

### authentication/change-password.html

```html
<!--
    This page is used to change the password of the user.
-->
<!DOCTYPE html>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script src="../service.js"></script>
<script>
    /*
        Following code will check if the user is logged in.
        If the user is not logged in, it will redirect the user to ../index.html page.
    */
    skapi.getProfile().then(user => {
        if (!user) {
            location.href = '../index.html';
        }
    });
</script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/modern-init-css@latest/init.css">
<link rel="stylesheet" href="../custom.css">

<main id="main_page">
    <!--
        Following <form> will change the password of the user.
        When user submits, we will use the skapi.changePassword() method to change the password.
        When successful, it will show an alert with the message "Password has been changed." and redirect the user back to update-profile.html page.
        When unsuccessful, it will show an alert with the error message.
    -->
    <form action='update-profile.html' onsubmit="
        disableForm(this, true);
        skapi.changePassword(event).then(()=>alert('Password has been changed.')).catch(err=>alert(err.message)).finally(()=>disableForm(this, false));
    ">
        <div class="spaceBetween">
            <h2>Change Password</h2>
            <a href="update-profile.html">Back</a>
        </div>
        <hr>
        <table>
            <tr>
                <td>
                    <span>
                        Current Password
                    </span>
                </td>
                <td>
                    <input type="password" name="current_password" placeholder="Current Password">
                </td>
            </tr>
            <tr>
                <td>
                    <span>
                        New Password
                    </span>
                </td>
                <td>
                    <input type="password" name="new_password" placeholder="New Password">
                </td>
            </tr>
        </table>
        <br>
        <div class="alignRight">
            <input type="submit" value="Change">
        </div>
    </form>
</main>
```

## Remove Account

### authentication/remove-account.html

```html
<!--
    This page is used to remove the user's account.
    The page is redirected from the update-profile.html page when the user clicks the "Remove Account" link.
-->
<!DOCTYPE html>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script src="../service.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/modern-init-css@latest/init.css">
<link rel="stylesheet" href="../custom.css">

<!--
    Following <script> will check if the user is logged in.
    If the user is not logged in, it will redirect the user to ../index.html page.
-->
<script>
    skapi.getProfile().then(u => {
        if (!u) {
            location.href = '../index.html';
        }
    });
</script>

<main id="main_page">
    <form action='../index.html' onsubmit="
        disableForm(this, true);
        skapi.disableAccount(event).then(()=>alert('Your account is removed.')).catch(err=>alert(err.message)).finally(()=>disableForm(this, false));
    ">
        <div class="spaceBetween">
            <h2>Remove Account</h2>
            <a href="update-profile.html">Back</a>
        </div>
        <hr>
        <h3>Would you like to remove your account?</h3>
        <p>
            Once you remove your account, your account will still be recoverable within 6 months by logging in again and
            verifing your email address.
            <br>
            After 6 months, all your data will be deleted and cannot be recovered.
        </p>
        <p><strong>Note: </strong>Your account cannot be recovered if you have not verified your email address.</p>
        <p>If you would like to proceed, please click the button below.</p>
        <br>
        <div class="alignCenter">
            <input type="submit" value="Remove Account">
        </div>
    </form>
</main>
```

## Profile Picture

### authentication/profile-pic.html

```html
<!--
    This page is used to update the profile picture of the user.
    It uses Skapi database to upload the image file and update the user's profile with the endpoint of the image url.
-->
<!DOCTYPE html>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script src="../service.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/modern-init-css@latest/init.css">
<link rel="stylesheet" href="../custom.css">

<main id="main_page">
    <!--
        Following <form> will update the profile picture to the database, and update the user's profile with the endpoint of the image url.
        When user submits, we will call updateProfilePic() function that we will declare later.
    -->
    <form class='alignCenter' onsubmit="
        disableForm(this, true);
        updateProfilePic(event).finally(()=>disableForm(this, false));
    ">
        <div class="spaceBetween">
            <h2>Profile Pic</h2>
            <a id="a_backLink" href="update-profile.html">Back</a>
        </div>
        <hr>
        <!--
            Following <label> will be used to preview the image file that the user will upload.
            Because the image is wrapped in a <label> tag that is targeted to the file input element,
            when the user clicks on the image, it will open the file dialog.
        -->
        <label for='input_fileInput' class="clickable">
            <img id='img_preview' src="">
            <br>
            <style>
                /*
                    Following CSS will make the empty image look like a button with 'Choose Image' text.
                */
                img {
                    width: 100%;
                    object-fit: cover;
                    vertical-align: middle;
                    position: relative;
                }

                img[src=""]::before {
                    content: 'Choose Image';
                    margin-top: 1em;
                    padding: 8px;
                    background-color: blue;
                    display: block;
                    color: white;
                    font-weight: bold;
                }
            </style>
        </label>
        <br>
        <br>
        <input id='input_fileInput' type="file" name="pic" accept="image/*" hidden required>
        <input type="submit" value="Update">
        <style>
            /*
                Following CSS will disable the submit button when the file input is empty.
            */
            #input_fileInput:invalid+input[type=submit] {
                pointer-events: none;
                opacity: 0.5;
            }
        </style>
        <script>
            /*
                Following code will preview the image file that the user will upload.
                When the user selects a file, it will read the file and set the src attribute of the image tag to the data url(base64) of the file.
            */
            input_fileInput.onchange = function () {
                let file = this.files[0];
                if (!file) {
                    return;
                }

                let reader = new FileReader();
                reader.onload = function () {
                    img_preview.src = reader.result;
                };
                reader.readAsDataURL(file);
            };
        </script>
    </form>
</main>

<script>
    /*
        Following code will check if the user is logged in.
        If the user is not logged in, it will redirect the user to ../index.html page.
        If user is logged in, it will set the user variable to the user object to use later.
    */
    let user;
    skapi.getProfile().then(u => {
        if (!u) {
            location.href = '../index.html';
            return;
        }
        img_preview.src = u.picture || "";
        user = u;
    });

    /*
        Following function will update the profile picture to the database, and update the user's profile with the endpoint of the image url.
    */
    async function updateProfilePic(event) {
        a_backLink.textContent = `0%`;

        /*
            Following recordParams object will be used to upload the image file to the database.
            It will set the table to 'profile_pic' to upload the image file to the 'profile_pic' table.
            In case the user already has a profile picture and is updating the profile picture, it will set the record_id to the record id of the user's profile picture.
        */
        let recordParams = {
            record_id: user.picture ? user.picture.split('/records/')[1].split('/')[0] : null,
            table: 'profile_pic',
            progress: (p) => {
                /*
                    The progress callback function to update the progress text.
                    It will update the progress text only when the status is 'upload' and the currentFile is not null.
                */
                if (p.status === 'upload' && p.currentFile) {
                    a_backLink.textContent = `${Math.floor(p.progress)}%`;
                }
            }
        }

        if (user.picture) {
            /*
                If the user already has a profile picture and is updating the profile picture,
                it will set the remove_bin property to the user's profile picture.
                This will remove the user's profile picture from the database.
                You can give either file object or the endpoint of the image url to the remove_bin property.
                In this case, we will give the endpoint of the image url to the remove_bin property.
            */
            recordParams.remove_bin = [user.picture];
        }

        try {
            let record = await skapi.postRecord(event, recordParams);

            /*
                Following code will update the user's profile with the endpoint of the image url.
                It will call skapi.updateProfile() method to update the user's profile.
                It will set the picture property to the endpoint of the image url which will be the last url in the bin array.
                Then it will redirect the user back to update-profile.html page.
            */
            await skapi.updateProfile({picture: record.bin.pic.slice(-1)[0].url});
            location.href = '../index.html';
        }
        catch (err) {
            /*
                If there is an error, it will show an alert with the error message.
            */
            alert(err.message);
        }

        a_backLink.textContent = 'Back';
    }
</script>
```