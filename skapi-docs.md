# What is Skapi?

Skapi is a serverless backend infrastructure platform for AI agents, web developers, and anyone who needs a secure, scalable backend without managing servers.

## What is backend infrastructure?

Backend infrastructure is the part of your service that users do not see directly. It handles authentication, data storage, permissions, and security.

For example, your frontend is what people interact with (buttons, pages, and forms). Your backend makes those features work safely and reliably behind the scenes.

Whether your project is a simple photo gallery or a large ticketing platform, you need backend infrastructure if your service runs online.

In Skapi, this backend infrastructure is called a **Service**.

With Skapi, you create one service per project. That service becomes the complete backend infrastructure for your web app.

## Creating a Service

1. Sign up for an account at [skapi.com](https://www.skapi.com/signup).
2. Log in, go to your services page, enter a service name, and click **Create**.

## Service Settings

You can set additional settings for your service.

- **Name:** The service name used to identify your service on the **My Services** page.

- **CORS:** Configure CORS to allow requests from specific domains. If left empty, CORS defaults to `*`. To restrict access, set one or more domains, for example, `https://example.com` or `https://example.com, https://example2.com`. Requests from domains not listed in CORS will be blocked. In production, set CORS to specific domains to help prevent unauthorized access to your service.

- **Allow Signup:**
  You can prevent user signups by turning off this option. This setting prevents new signups and account deletion in your service.
  When this option is off, only admins can create or disable user accounts from the **Users** page. This is useful for private services with a limited user group.

- **Allow Inquiries:**
  You can allow anonymous users to send inquiries to your service via [`sendInquiry()`](https://docs.skapi.com/api-reference/email/README.html#sendinquiry).
  When users send an inquiry, it is forwarded to your email. Turn this option off if you want to reduce spam.

- **Freeze Database:**
  You can freeze your database to prevent write operations.
  When the database is frozen, all user write operations are blocked and only read operations are allowed. When this option is enabled, only the service owner can write to the database.

- **Allow Anonymous Posts to Database:**
  You can allow anonymous users (users who are not logged in) to post public records to the database.
  Use caution when enabling this option, as it may increase the risk of malicious submissions. Make sure your app includes defensive validation when handling anonymous records.

- **Enable/Disable:**
  You can temporarily disable your service.
  This is useful during maintenance when you need to block access without losing data.
  When your service is disabled, all requests are blocked, and it appears as disabled on the **My Services** page.

:::warning
Disabling your service will not pause your subscription. You will still be charged for the service even when it is disabled.
:::

## Deleting Your Service

You can delete your service only under these conditions:
- your subscription has expired, or
- you are on the trial plan.

You can delete your service from the service settings page.

The **Delete Service** button is located at the bottom of the service settings page.

When you click **Delete Service**, you will be asked to confirm deletion.

:::danger
When you delete your service, all related data is permanently deleted and cannot be recovered.
:::

<br>


# Getting Started

After creating your service in Skapi, connect it to your frontend.

Your frontend is the part users see, such as pages, buttons, and forms. It can be plain HTML or a JavaScript framework like Vue or React.

Skapi works with vanilla HTML and modern JavaScript frameworks (for example Vue, React, and Angular).

To use Skapi, import the library and initialize it with your service ID.

### For HTML Projects

For vanilla HTML projects, import Skapi using a script tag and initialize the library as shown below.
Initialize the Skapi class in the HTML `<head>` of each page that uses Skapi.
When you initialize the class, use the exact service ID from your Skapi dashboard.

```html
<!-- index.html -->
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    const skapi = new Skapi('service_id');
</script>
```

::: tip NOTE
Replace `'service_id'` with your actual service ID from your Skapi dashboard after you create a service.

Example format: `'s1_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxx'`
:::

### For SPA Projects

To use Skapi in a Single Page Application (SPA) such as Vue, React, or Angular, install `skapi-js` with npm.

```sh
$ npm i skapi-js
```

Then import the library in your main JavaScript file:

```javascript
// main.js
import { Skapi } from "skapi-js";
const skapi = new Skapi('service_id');

export { skapi }

// You can now import skapi from anywhere in your project.
```

### For TypeScript Projects

Skapi includes TypeScript support, so you can import both the class and related types.

```typescript
import { Skapi } from 'skapi-js';
import type { RecordData, DatabaseResponse } from 'skapi-js';

const skapi = new Skapi('service_id');
let databaseRecords: DatabaseResponse<RecordData>;
```

### Node.js (CommonJS)

To use Skapi in Node.js (CommonJS), import the library as shown below:

```javascript
const { Skapi } = require('skapi-js');
const skapi = new Skapi('service_id');
```

### Node.js (ESM)

```javascript
import { Skapi } from 'skapi-js';
const skapi = new Skapi('service_id');
```

> **Note:** When running Skapi in Node.js, browser-specific features such as WebSocket, WebRTC, and Notifications are not available.



## Get Connection Information

After your client connects to Skapi, call [`getConnectionInfo()`](https://docs.skapi.com/api-reference/connection/README.html#getconnectioninfo) to retrieve connection details.

::: code-group
```html [HTML]
<!-- index.html -->
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    const skapi = new Skapi('service_id');
</script>
<script>
skapi.getConnectionInfo().then(info => {
    console.log(info);
    /*
    Returns:
    {
        service_name: "Your Service Name",
        user_ip: "Connected user's IP address",
        user_agent: "Connected user agent",
        user_location: "Connected user's country code",
        version: 'x.x.x' // Skapi library version
    }
    */
   window.alert(`Connected to ${info.service_name}`);
});
</script>
```

```javascript [SPA]
import { skapi } from '../location/of/your/main.js';
skapi.getConnectionInfo().then(info => {
    console.log(info);
    /*
    Returns:
    {
        service_name: "Your Service Name",
        user_ip: "Connected user's IP address",
        user_agent: "Connected user agent",
        user_location: "Connected user's country code",
        version: 'x.x.x' // Skapi library version
    }
    */
   window.alert(`Connected to ${info.service_name}`);
});
```
:::


## Advanced Settings

You can pass additional options when initializing the Skapi class.

### new Skapi(...)

```ts
class Skapi {
  constructor(
    service: string, // Skapi service ID
    options?: {
        autoLogin?: boolean;        // Default: true
        requestBatchSize?: number;  // Default: 30. Maximum number of requests processed per batch.
        eventListener?: {
            onLogin?: (user: UserProfile | null) => void; // Fires on initial page load (after Skapi initializes), on login/logout, and when a session expires. The callback receives a UserProfile object if the user is logged in; otherwise, it receives null.
            onUserUpdate?: (user: UserProfile | null) => void; // Fires on initial page load (after Skapi initializes), on login/logout, when a session expires, and when the user's profile is updated. The callback receives a UserProfile object if the user is logged in; otherwise, it receives null.
            onBatchProcess?: (process: {
                batchToProcess: number; // Number of batches left to process
                itemsToProcess: number; // Number of items left to process
                completed: any[]; // Results completed in this batch
            }) => void;
        }
    }) {
    ...
  }
  ...
}
```

Options overview:

- `autoLogin` (boolean, default: true)
    - Automatically restores the user's session on page load.
    - See: [Auto Login](https://docs.skapi.com/authentication/login-logout.html#auto-login)

- `requestBatchSize` (number, default: 30)
    - Maximum number of requests processed per batch.

- `eventListener` (callbacks for key events)
    - `onLogin(user: UserProfile | null)`
        - Fires on initial page load (after Skapi initializes), on login/logout, and when a session expires. The callback receives a `UserProfile` object if the user is logged in; otherwise, it receives `null`.
        - See: [Listening to Login/Logout Status](https://docs.skapi.com/authentication/login-logout.html#listening-to-login-logout-status)

    - `onUserUpdate(user: UserProfile | null)`
        - Fires on initial page load (after Skapi initializes), on login/logout, when a session expires, and when the user's profile is updated. The callback receives a `UserProfile` object if the user is logged in; otherwise, it receives `null`.
        - See: [Listening to User Profile Updates](https://docs.skapi.com/authentication/user-info.html#listening-to-user-s-profile-updates)

    - `onBatchProcess(process)`
        - Fires each time Skapi completes processing a request batch.

Type reference: See [UserProfile](https://docs.skapi.com/api-reference/data-types/README.html#userprofile).

<br>


# Working with HTML Forms

Skapi can handle HTML `onsubmit` events directly by passing the `SubmitEvent` as the first argument to Skapi methods.

This makes form handling much simpler. You can process and send form data without manually reading each field.

In this example, we use [`skapi.mock()`](https://docs.skapi.com/api-reference/connection/README.html#mock) to send a request and receive a response.

Here is an example of using a `<form>` with Skapi:

```html
<form onsubmit="skapi.mock(event).then(r => alert(r.hello)).catch(err => alert(err.message))">
  <input name="hello" placeholder="Say Hi">
  <input type="submit" value="Mock">
</form>
```

This is equivalent to writing the following code manually:

```html
<input id="hello" placeholder="Say Hi">
<button onclick="runMock()">Mock</button>
<script>
  async function runMock() {
    let helloMsg = document.getElementById("hello").value;

    try {
      let r = await skapi.mock({ hello: helloMsg });
      alert(r.hello);
    }
    catch (err) {
      alert(err.message);
    }
  }
</script>
```

When a form submit event is passed as the first argument to a Skapi method, Skapi automatically converts form input values into JavaScript key-value data. The input `name` becomes the key, and the value is resolved based on the input type.

## Nested Values and Arrays

You can create nested values and arrays by using the `[]` syntax in the `name` attribute.
The resolved data structure will depend on the input type.

If the key inside `[]` is a number, Skapi resolves the value as an array.

```html
<form onsubmit="skapi.mock(event).then(r => console.log(r))">
    <input name="user[name]" placeholder="Name"><br>
    <input name="user[age]" type="number" placeholder="Age"><br>
    Skills:<br>
    <input name="user[skills]" type="radio" value="JavaScript"> JavaScript<br>
    <input name="user[skills]" type="radio" value="Python"> Python<br>
    IDE:<br>
    <input name="user[ide]" type="checkbox" value="Vim">Vim<br>
    <input name="user[ide]" type="checkbox" value="Emacs">Emacs<br>
    Check:
    <input name="check[]" type="checkbox">
    <input name="check[]" type="checkbox">
    <br>
    <input type="submit" value='Mock'>
</form>
```

The above example will resolve to the following structure:

```ts
{
  user: {
    name: string,
    age?: number,
    skills?: "JavaScript" | "Python",
    ide?: "Vim" | "Emacs" | <"Vim" | "Emacs">[]
  },
  check: boolean[]
}
```

Skapi automatically structures user input based on input type and the `name` attribute.

Number inputs are resolved as numbers, radio inputs are resolved as the selected value, and checkbox inputs are resolved as boolean values or strings if a value is specified.

When multiple inputs share the same name without `[]`, Skapi attempts to convert the values into an array.


## Using Input Elements, Textarea, and Select Elements

Skapi also works with individual input elements, including text, number, radio, checkbox, textarea, and select elements.

```html
<input name="my_message" id="message_input">
<button onclick="skapi.mock(document.getElementById('message_input'))
  .then(r => alert(r.my_message))">Mock</button>
```

In this example, we use the `id` attribute to reference the input element and pass it directly to a Skapi method.

This approach is useful when you want to handle a single field instead of a full form.


## Using the `action` Attribute in the `<form>` Element

When you set a URL in a form's `action` attribute, the user is redirected to that page after a successful request.

On the destination page, use [`skapi.getFormResponse()`](https://docs.skapi.com/api-reference/connection/README.html#getformresponse) to retrieve the resolved data from the previous page.

The example below shows how to submit a form in `index.html` and read the resolved data in `welcome.html`.

For this example, create these two HTML files in the same directory.

```
.
├─ index.html
└─ welcome.html
```

:::code-group
```html [index.html]
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script>
    // Replace 'service_id' with the appropriate values from your Skapi dashboard.
    const skapi = new Skapi('service_id');
</script>

<form onsubmit="skapi.mock(event)" action="welcome.html">
  <input name="name">
  <input name="msg">
  <input type="submit">
</form>

```

```html [welcome.html]
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<h1>Welcome <span id='your_name'></span></h1>
<p id='message'></p>

<script>
    // Replace 'service_id' with the appropriate values from your Skapi dashboard.
    const skapi = new Skapi('service_id');
    
    skapi.getFormResponse()
      .then((r) => {
        // Resolved data from skapi.mock()
        your_name.innerText = r.name;
        message.innerText = r.msg;
      });
</script>
```
:::

::: tip
When building a static website, you can use the `action` attribute to redirect users to a new page after a successful request.

Each page should have the Skapi library imported and initialized.

In a single-page application, redirecting to another page is often unnecessary.
:::

<br>

# Working with AI Assistants

Skapi works smoothly with CLI-based AI coding assistants, such as Claude Code, OpenAI Codex, and Gemini CLI.

If you are building your project with an AI coding assistant, use the system prompt file below to help it understand how to integrate the Skapi API.

### 1. Download the system prompt file

<a href="https://docs.skapi.com/SKAPI.md" download="SKAPI.md">⬇️ SKAPI.md (Click to Download)</a>

### 2. Rename and add it to your project folder

Rename the downloaded `SKAPI.md` file to the filename your tool expects, then place it in your project root.

Examples:

- `AGENT.md` for OpenAI Codex
- `CLAUDE.md` for Anthropic Claude
- `GEMINI.md` for Gemini CLI

### 3. Start writing prompts

When you run your coding assistant, start with a prompt like this:

```
My Skapi service ID is: "s1_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxx".
Build me a [describe what you want].
```

Replace the placeholder service ID with your actual service ID before running your prompt.

<br>

# What is Authentication?

Authentication is the process of verifying the identity of a user.

It is a fundamental part of any application because it controls access to your app and its resources.

Authenticated users can be allowed to post data to your database and use your custom APIs.

Skapi provides a full-featured authentication system out of the box, with no additional configuration required.

In this section, you will learn how to let users create an account, log in, log out, and recover their account if they forget their password.


<br>


# Creating an Account

To let users create a new account in your service, you can use the [`signup()`](https://docs.skapi.com/api-reference/authentication/README.html#signup) method. 

### Example: Creating an Account

::: code-group

```html [Form]
<form action='login.html' onsubmit="skapi.signup(event).catch(err=>alert(err.message))">
    <h2>Sign-Up</h2>
    <hr>
    <label>
        Email<br>
        <input type="email" name="email" placeholder="user@email.com" required>
    </label><br><br>
    <label>
        Password<br>
        <input type="password" name="password" placeholder="Your password" required>
    </label><br><br>
    <label>
        Name<br>
        <input name="name" placeholder="Your name">
    </label><br><br>
    <input type="submit" value="Sign-Up">
</form>
```

```js [JS]
let parameters = {
  email: "user@email.com",
  password: "password", // Password must be between 6 and 60 characters.
  name: "User's name"
};

skapi.signup(parameters)
  .then(res => window.href = 'login.html')
  .catch(err => window.alert(err.message));
```

:::

The example above shows how to let users create their account in your service.
Once the user signup is successful, the user will be redirected to the login page.
The first argument takes the user's input (email, password, name) that will be used for signup.

::: warning
- If the user have not logged in to your service after account creation,
they will **NOT** appear on your user list in Skapi's admin page.

- If 7 days have passed since the account creation, and the user still have not logged in to your service,
user's signup will be automatically invalidated.
:::

## Login after Signup

The second argument takes additional options when creating an account.
You can also automatically login the user right after successful signup by setting `options.login` to `true` in options argument.

::: code-group

```html [Form]
<form onsubmit="skapi.signup(event, { login: true }).then(u=>alert('Hello ' + u.name))">
    <input type="email" name="email" placeholder="E-Mail" required><br>
    <input type="password" name="password" placeholder="Password" required><br>
    <input name="name" placeholder="Your name"><br>
    <input type="submit" value="Create Account">
</form>
```

```js [JS]
let parameters = {
  email: "user@email.com",
  password: "password", // Password must be between 6 and 60 characters.
  name: "User's name"
};

let options = {
  login: true // If set to true, users will be automatically logged in after signup.
};

skapi.signup(parameters, options)
  .then(res => u=>alert('Hello ' + u.name));
```

:::

When the `options.login` is set to `true`, the method will return the [UserProfile](https://docs.skapi.com/api-reference/data-types/README.html#userprofile) object.

For more detailed information on all the parameters and options available with the [`signup()`](https://docs.skapi.com/api-reference/authentication/README.html#signup) method, 
please refer to the API Reference below:

### [`signup(params, options?): Promise<UserProfile | string>`](https://docs.skapi.com/api-reference/authentication/README.html#signup)  



<br>


# Signup Confirmation

You can require users to confirm their signup via email.
This is useful for preventing malicious users from creating fake accounts.
The account is not fully activated until the user confirms it.

## E-Mail Confirmation on Signup

When an account is created with `options.signup_confirmation` set to `true` or a URL string,
the user receives a signup confirmation email.

The user must click on the confirmation link before logging into your service.
If the `options.signup_confirmation` value is a valid URL string,
the user is redirected to that URL after successful confirmation.

You can use either a full URL or a relative path on your website.

Once the user has confirmed their signup, their profile will automatically be marked as email verified.

:::code-group

```html [Form]
<form onsubmit="skapi.signup(event, { signup_confirmation: '/path/to/your/success/page' })
    .then(r=> {
        // SUCCESS: The account has been created. User's signup confirmation is required.
        console.log(r);
    })">
    <input type="email" name="email" placeholder="E-Mail" required><br>
    <input type="password" name="password" placeholder="Password" required><br>
    <input name="name" placeholder="Your name"><br>
    <input type="submit" value="Create Account">
</form>
```

```js [JS]
let parameters = {
  email: "user@email.com",
  password: "password",
  name: "User's name"
};

let options = {
  /** 
   * If set to true, the user will get a signup confirmation email with a confirmation link.
   * If set to a valid URL string, the user will be redirected to the url when the confirmation is successful.
   */
  signup_confirmation: '/path/to/your/success/page'
};

skapi.signup(parameters, options).then(res => {
    // "SUCCESS: The account has been created. User's signup confirmation is required."
    console.log(res);
});
```
:::

The example above shows how to create an account with signup confirmation enabled.

After signup succeeds, the user receives an email with a confirmation link.
After they click the link, the account is confirmed and the user is redirected to the URL you provided.

If the `signup_confirmation` value was `true`,
the user sees a blank browser tab with the message: 'Your signup has been successfully confirmed.'

:::danger
When setting the `signup_confirmation` value to a relative URL path (e.g. `/relative/path.html`), it will not work if the website is not hosted.

This happens because local files use paths like `file:///C:/Users/username/Desktop/website/index.html`, and Skapi cannot resolve folder paths on a user's local computer.

Set your redirect URL of `signup_confirmation` to be the full URL (e.g. `https://your.website.com/path/to/your/success/page`).
:::

You can also customize the signup confirmation email template.

For more info on email templates, see [Automated E-Mail](https://docs.skapi.com/email/email-templates.md).

## Resending Signup Confirmation Email


If you need to resend the confirmation email, use the [`resendSignupConfirmation()`](https://docs.skapi.com/api-reference/authentication/README.html#resendsignupconfirmation) method. 

:::code-group
```html [Form]
<form onsubmit="skapi.login(event)
    .then(u=>console.log('Successfully logged in.'))
    .catch(err => {
        if(err.code === 'SIGNUP_CONFIRMATION_NEEDED') {
          if(confirm('Your signup confirmation is required. Resend confirmation email?')) {
            skapi.resendSignupConfirmation().then(res=>{
              console.log(res); // 'SUCCESS: Signup confirmation e-mail has been sent.'
            });
          }
        }
        else throw err;
      }
    })">
    <input type="email" name="email" placeholder="E-Mail" required><br>
    <input id="password" type="password" name="password" placeholder="Password" required><br>
    <input type="submit" value="Login">
</form>
```

```js [JS]
skapi.login({email: 'user@email.com', password: 'password'})
    .then(u=>console.log('Successfully logged in.'))
    .catch(err=>{
        /**
         * {
         *  code: 'SIGNUP_CONFIRMATION_NEEDED',
         *  message: "User's signup confirmation is required.",
         *  name: 'SkapiError'
         * }
         */
        
        if(err.code === 'SIGNUP_CONFIRMATION_NEEDED') {
            let sendConfirmation = window.confirm('Your signup confirmation is required. Resend confirmation email?');
            
            if(sendConfirmation) {
                // now you can resend signup confirmation E-Mail to user@email.com.
                skapi.resendSignupConfirmation().then(res=>{
                console.log(res); // 'SUCCESS: Signup confirmation e-mail has been sent.'
                });
            }
        }

        else throw err;
    });
```
:::

In this example, the user tries to log in and receives a `SIGNUP_CONFIRMATION_NEEDED` error.

If needed, you can then call [`resendSignupConfirmation()`](https://docs.skapi.com/api-reference/authentication/README.html#resendsignupconfirmation) to resend the confirmation email.

For detailed information about all parameters and options of [`resendSignupConfirmation()`](https://docs.skapi.com/api-reference/authentication/README.html#resendsignupconfirmation),
see the API reference below:

### [`resendSignupConfirmation(): Promise<string>`](https://docs.skapi.com/api-reference/authentication/README.html#resendsignupconfirmation)

::: warning
- To resend signup confirmation emails, the user must have at least one login attempt to your service.
- If the user does not confirm within 7 days, the signup is invalidated and they must sign up again.
:::



<br>

# Login / Logout

Once a user has signed up, they can log in to your service using their email and password.

## Login

Use the [`login()`](https://docs.skapi.com/api-reference/authentication/README.html#login) method to log a user into your service.

If the login is not successful due to invalid password, or user may not have confirm their signup etc... the [`login()`](https://docs.skapi.com/api-reference/authentication/README.html#login) method will throw an error.

When successful, it will respond with the [`UserProfile`](https://docs.skapi.com/api-reference/data-types/README.html#userprofile) object.

:::warning
If `signup_confirmation` option was set to `true` during [`signup()`](https://docs.skapi.com/api-reference/authentication/README.html#signup),
users will not be able to log in until they have confirmed their account.
:::

:::info
When the user has successfully confirmed their signup and logged in, they will be sent a welcome email.
You can also customize the email template for the signup confirmation email.

For more info on email templates, see [Automated E-Mail](https://docs.skapi.com/email/email-templates.md).
:::

Below is an example of a login form that uses the [`login()`](https://docs.skapi.com/api-reference/authentication/README.html#login) method.
When the user successfully logs in, they will be redirected to the `welcome.html` page.

::: code-group

```html [Form]
<form
    action="welcome.html"
    onsubmit="skapi.login(event).catch(err=>alert(err.message))"
>
    <h2>Login</h2>
    <hr />
    <label>
        Email<br />
        <input
            type="email"
            name="email"
            placeholder="user@email.com"
            required
        /> </label
    ><br /><br />
    <label>
        Password<br />
        <input
            id="password"
            type="password"
            name="password"
            placeholder="Your password"
            required
        /> </label
    ><br /><br />
    <input type="submit" value="Login" />
</form>
```

```js [JS]
let parameters = {
    email: "user@email.com",
    password: "password",
};

skapi.login(parameters).then((user) => (window.href = "welcome.html"));
```

:::

For more detailed information on all the parameters and options available with the [`login()`](https://docs.skapi.com/api-reference/authentication/README.html#login) method,
please refer to the API Reference below:

### [`login(params): Promise<UserProfile>`](https://docs.skapi.com/api-reference/authentication/README.html#login)

## Auto Login

By default, once user login to your website, their login session is maintained until they logout.

To ensure that users' sessions are destroyed when they leave your website, you can set options.autoLogin to false in the third argument when initializing Skapi.

```javascript
const options = {
    autoLogin: false, // set to true to maintain the user's session
};

//Set the third argument as options
const skapi = new Skapi("service_id", options);
```

## Logout

The [`logout()`](https://docs.skapi.com/api-reference/authentication/README.html#logout) method logs the user out from the service.

:::code-group

```html [Form]
<form onsubmit="skapi.logout(event)" action="page_to_show_after_logout.html">
    <input type="submit" value="Logout" />
</form>
```

```js [JS]
skapi.logout().then((res) => {
    console.log(res); // 'SUCCESS: The user has been logged out.'
    window.location.replace("page_to_show_after_logout.html");
});
```

:::

## Global Logout

You can let the users logout and invalidate all tokens across all the users devices by setting `params.global` to `true`.

:::code-group

```html [Form]
<form onsubmit="skapi.logout(event)" action="page_to_show_after_logout.html">
    <input type="checkbox" name="global" checked />
    <input type="submit" value="Logout" />
</form>
```

```js [JS]
skapi.logout({ global: true }).then((res) => {
    console.log(res); // 'SUCCESS: The user has been logged out.'
    window.location.replace("page_to_show_after_logout.html");
});
```

:::

For more detailed information on all the parameters and options available with the [`logout()`](https://docs.skapi.com/api-reference/authentication/README.html#logout) method,
please refer to the API Reference below:

### [`logout(params?): Promise<string>`](https://docs.skapi.com/api-reference/authentication/README.html#logout)

## Listening to Login / Logout Status

You can listen to the updates of the user's login state by setting a callback function in the `option.eventListener.onLogin` option argument of the constructor argument in Skapi.

The `onLogin` callback is triggered in the following cases:

-   Skapi initializes with the user's current authentication state.
-   User logs in or logs out.
-   User loses their session due to an expired token.

If the user is logged in, the callback receives the [UserProfile](https://docs.skapi.com/api-reference/data-types/README.html#userprofile) object; otherwise, it receives `null`.

```js
const options = {
    eventListener: {
        onLogin: (profile) => {
            console.log(profile); // is null when user is logged out, User's information object when logged in.
        },
    },
};

const skapi = new Skapi("service_id", options);
```

You can also add multiple event listeners to the `onLogin` event after the Skapi object has been initialized.

```js
skapi.onLogin = (profile) => {
    console.log(profile); // null when user is logged out, User's information object when logged in.
};
```

This handler is useful for updating the UI when the user logs in, logs out.


<br>

# User Profile

Once a user has logged in, they can retrieve their profile information.
The profile data is structured as an OpenID-compliant JavaScript object.

## Requesting User Information

The [`getProfile()`](https://docs.skapi.com/api-reference/authentication/README.html#getprofile) method allows you to retrieve the user's information via promise method.
It returns the [UserProfile](https://docs.skapi.com/api-reference/data-types/README.html#userprofile) object.

If the user is not logged in, [`getProfile()`](https://docs.skapi.com/api-reference/authentication/README.html#getprofile) returns `null`.

This method is particularly useful for determining the user's authentication state when they first visit or reload your website.

```js
skapi.getProfile().then(profile=>{
  console.log(profile); // User's information

  if(profile === null) {
    // The user is not logged in
  }
})
```

You can also refresh the auth token and fetch the updated profile by passing `options.refreshToken` to `true`.

```js
skapi.getProfile({ refreshToken: true }).then(profile=>{
  console.log(profile); // Updated user's information

  if(profile === null) {
    // The user is not logged in
  }
})
```

This can be useful when the user needs to get their updated profile when it's updated from another device, or admin might have made change to the users profile, or you just want your users to update their token for some other security reasons.

For more detailed information on all the parameters and options available with the [`getProfile()`](https://docs.skapi.com/api-reference/authentication/README.html#getprofile) method, 
please refer to the API Reference below:

### [`getProfile(options?): Promise<UserProfile | null>`](https://docs.skapi.com/api-reference/authentication/README.html#getprofile)


## Listening to User's Profile Updates

You can listen to the updates of the user profiles by setting a callback function in the `option.eventListener.onUserUpdate` option argument of the constructor argument in Skapi.

The `onUserUpdate` callback function will be triggered in the following scenarios:
- Skapi initializes with the user's current authentication state.
- User logs in or logs out.
- User loses their session due to an expired token.
- User's profile information is updated.

If the user is logged in, the callback receives the [UserProfile](https://docs.skapi.com/api-reference/data-types/README.html#userprofile) object; otherwise, it receives `null`.

```js
const options = {
  eventListener: {
    onUserUpdate: (profile) => {
      console.log(profile); // is null when user is logged out, User's information object when logged in.
    }
  }
};

const skapi = new Skapi('service_id', options);
```

You can also add multiple event listeners to the `onUserUpdate` event after the Skapi object has been initialized.

```js
skapi.onUserUpdate = (profile) => {
  console.log(profile); // null when user is logged out, User's information object when logged in.
}
```

This handler is useful for updating the UI when the user logs in, logs out, or when their profile information changes.


<br>


# Forgot password

When the user forgets their password, they can request a verification code to reset their password.

:::warning
If the user's email is not verified, they will not be able to receive a verification code and may lose access to their account permanently.

It is recommended to encourage users to verify their email addresses.
For more info on email verification, see [Email Verification](https://docs.skapi.com/user-account/email-verification.md).
:::

## Step 1: Request Verification Code

Use the [`forgotPassword()`](https://docs.skapi.com/api-reference/authentication/README.html#forgotpassword) method to request a verification code.

In this example, the [`forgotPassword()`](https://docs.skapi.com/api-reference/authentication/README.html#forgotpassword) method is called with the user's email as a parameter.

The user will receive an email containing a verification code that they can use to reset their password.

:::code-group

```html [Form]
<form onsubmit="skapi.forgotPassword(event).then(res => {
    console.log(res) // SUCCESS: Verification code has been sent.
})">
    <input type="email" name="email" placeholder="E-Mail" required>
    <input type="submit" value="Request Verification Code">
</form>
```

```js [JS]
skapi.forgotPassword({email: 'someone@gmail.com'}).then(res=>{
  // User receives an e-mail with a verification code.
  // SUCCESS: Verification code has been sent.
  console.log(res);
});

```
:::

For more detailed information on all the parameters and options available with the [`forgotPassword()`](https://docs.skapi.com/api-reference/authentication/README.html#forgotpassword) method, 
please refer to the API Reference below:

### [`forgotPassword(params): Promise<string>`](https://docs.skapi.com/api-reference/authentication/README.html#forgotpassword)

::: info
Due to security reasons, [`forgotPassword()`](https://docs.skapi.com/api-reference/authentication/README.html#forgotpassword) will not tell the user whether the email exists.
:::

You can also customize the email template for the verification email.

For more info on email templates, see [E-Mail Templates](https://docs.skapi.com/email/email-templates.md).

## Step 2: Reset Password

The user will receive an email containing a verification code. After the user receives the verification code, they can use the [`resetPassword()`](https://docs.skapi.com/api-reference/authentication/README.html#resetpassword) method to reset their password.

The [`resetPassword()`](https://docs.skapi.com/api-reference/authentication/README.html#resetpassword) method is called with the user's email, the verification code received via email, and the new password.

Upon successful password reset, the user's account password will be set to the new password provided.

:::code-group

```html [Form]
<form onsubmit="skapi.resetPassword(event).then(res => {
    console.log(res); // SUCCESS: New password has been set.
})">
    <input type="email" name="email" placeholder="E-Mail" required><br>
    <input type="text" name="code" placeholder="Verification Code" required><br>
    <input type="password" name="new_password" placeholder="New Password" required><br>
    <input type="submit" value="Change Password">
</form>
```

```js [JS]
skapi.resetPassword({
  email: 'someone@gmail.com', 
  code: '123456', // code sent to user's registered email address
  new_password: 'new_password' // The password should be at least 6 characters and 60 characters maximum.
}).then(res => {
  console.log(res);
  // SUCCESS: New password has been set.
});
```
:::

For more detailed information on all the parameters and options available with the [`resetPassword()`](https://docs.skapi.com/api-reference/authentication/README.html#resetpassword) method, 
please refer to the API Reference below:

### [`resetPassword(params): Promise<string>`](https://docs.skapi.com/api-reference/authentication/README.html#resetpassword)

<br>

# OpenID Login

Skapi supports OpenID authentication profiles.

## What is OpenID?

OpenID is an authentication standard that lets users sign in with an identity provider (for example, Google) instead of creating a separate password for every app.

## Login with OpenID Profile

If you have access to an OpenID provider API, you can register an OpenID logger in your Skapi service settings.

Although providers differ in details, the overall process is:

1. You redirect the user to the provider's login page.
2. The provider authenticates the user.
3. The user is redirected back to your app.
4. Exchange the returned authorization code for an access token using a secure client secret request.
5. Call [`openidLogin()`](https://docs.skapi.com/api-reference/authentication/README.html#openidlogin) with that token.

## Google OAuth Example

This example shows how to implement Google OAuth authentication.

### 1. Set Up Google OAuth Service

Go to the [Google Cloud Console](https://console.cloud.google.com/) and create your OAuth service.

Follow Google's [setup instructions](https://support.google.com/cloud/answer/15549257?sjid=3416534526948669406-NC), and make sure your redirect URL points back to your web app.

### 2. Register Your OpenID Logger in Skapi

1. Log in to [skapi.com](https://www.skapi.com).
2. Open the service where you want to register an OpenID logger.
3. From the side menu, click on **OpenID Logger**.
4. Click **+** at the top-right of the table.
5. Fill in the logger form:

    - **Logger ID:**
        This value is used when calling [`openidLogin()`](https://docs.skapi.com/api-reference/authentication/README.html#openidlogin). You can use any name. For this guide, use **google**.

    - **Username Key:** An OpenID attribute that uniquely identifies the user. For this example, use **email**.
    - **Request URL:** The profile API URL. For this example, use `https://www.googleapis.com/oauth2/v3/userinfo`.
    
    - **Request Method:** Use the method required by the API. For this example, use `GET`.

    - **Condition**

        You can set conditions to allow login only when profile values match your rules.

        - **Profile Attribute Name:** The profile attribute to compare. Leave blank for this example.
        - **Profile Attribute Value:** The value to compare against. Leave blank for this example.
        - **Condition:** Comparison rule. Leave default for this example.
    
    - **Header [JSON]:** Request headers as JSON. Use:

        ```
        {
            "Authorization": "Bearer $TOKEN"
        }
        ```

    - **Get Parameter [JSON] | Post Body [JSON]**
    
    You can define query parameters or a request body in JSON format. Leave blank for this example.

6. Click **Save**.


### 3. Register Client Secret Key

To retrieve an access token from Google OAuth, you need a client secret key.

Because the client secret must not be exposed in frontend code, register it securely in Skapi.

1. In the service page, click on the **Client Secret Key** menu.
2. Click **+** at the top-right of the table.
3. In the form, enter:
    - **Name:** A key identifier. For this guide, use **ggltoken**.
    - **Client Secret Key:** The exact secret from your Google OAuth app.

4. Click **Save**.

For more information about registering a client secret key, see [Client Secret Keys](https://docs.skapi.com/api-bridge/client-secret-request.html).

### 4. Set Up Link to Google Login

Create a button that redirects users to Google's OAuth login page.

```html
<button onclick="googleLogin()">Google Login</button>
<script>
    const GOOGLE_CLIENT_ID = '1234567890123-your.google.client.id';
    const REDIRECT_URL = window.location.origin + window.location.pathname;

    function googleLogin() {
        const state = crypto.randomUUID();
        const authURL = new URL('https://accounts.google.com/o/oauth2/v2/auth');

        authURL.searchParams.set('client_id', GOOGLE_CLIENT_ID);
        authURL.searchParams.set('redirect_uri', REDIRECT_URL);
        authURL.searchParams.set('response_type', 'code');
        authURL.searchParams.set('scope', 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');
        authURL.searchParams.set('prompt', 'consent');
        authURL.searchParams.set('state', state);
        authURL.searchParams.set('access_type', 'offline');

        window.location.href = authURL.toString();
    }
</script>
```

### 5. Set Up Access Token Retrieval

After the user signs in with Google and is redirected back to your app, use [`clientSecretRequest()`](https://docs.skapi.com/api-bridge/client-secret-request) to exchange the authorization code for an access token.

Then call [`openidLogin(event?: SubmitEvent | params): Promise<string>`](https://docs.skapi.com/api-reference/authentication/README.html#openidlogin) to sign the user in to your Skapi service.

```html
<button onclick="googleLogin()">Google Login</button>
<script>
    const GOOGLE_CLIENT_ID = '1234567890123-your.google.client.id';
    const REDIRECT_URL = window.location.origin + window.location.pathname;

    function googleLogin() {
        const state = crypto.randomUUID();
        const authURL = new URL('https://accounts.google.com/o/oauth2/v2/auth');

        authURL.searchParams.set('client_id', GOOGLE_CLIENT_ID);
        authURL.searchParams.set('redirect_uri', REDIRECT_URL);
        authURL.searchParams.set('response_type', 'code');
        authURL.searchParams.set('scope', 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');
        authURL.searchParams.set('prompt', 'consent');
        authURL.searchParams.set('state', state);
        authURL.searchParams.set('access_type', 'offline');

        window.location.href = authURL.toString();
    }

    async function handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
            return;
        }

        try {
            const tokenResponse = await skapi.clientSecretRequest({
                clientSecretName: 'ggltoken',
                url: 'https://oauth2.googleapis.com/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    code,
                    client_id: GOOGLE_CLIENT_ID,
                    client_secret: '$CLIENT_SECRET',
                    redirect_uri: REDIRECT_URL,
                    grant_type: 'authorization_code'
                }
            });

            if (!tokenResponse?.access_token) {
                throw tokenResponse;
            }

            await skapi.openIdLogin({ id: 'google', token: tokenResponse.access_token });

            window.history.replaceState({}, document.title, REDIRECT_URL);
            window.location.href = '/';
        }
        catch (error) {
            console.error('Google OAuth login failed:', error);
            alert('Login failed. Please try again.');
        }
    }

    handleOAuthCallback();
</script>
```

:::warning
In this Google OAuth example, [`clientSecretRequest()`](https://docs.skapi.com/api-bridge/client-secret-request) securely exchanges the authorization code for an access token, and [`openidLogin()`](https://docs.skapi.com/api-reference/authentication/README.html#openidlogin) signs in the user with that token.

Make sure both your client secret key and OpenID logger are configured, and use the correct `clientSecretName` and logger ID.
:::

### [`openidLogin(event?:SubmitEvent | params): Promise<string>`](https://docs.skapi.com/api-reference/authentication/README.html#openidlogin)

## Merging an OpenID Account with a Previous Account

In some cases, you may want to merge a user's OpenID account with an existing account. Accounts created by admins cannot be merged.

To enable merging, set your OpenID Logger ID to `by_skapi`.
Then, when calling `openIdLogin`, use the `merge` option to control what gets merged. Set `merge: true` to merge all supported attributes, or pass an array to merge only specific fields.

For example, to merge only the user's "name" attribute:

```js
skapi.openIdLogin({ id: 'by_skapi', token: ACCESS_TOKEN, merge: ["name"] });
```

:::danger
After a merge, the user can no longer log in with a password. This action cannot be undone.
:::

:::tip
You can first attempt login without the `merge` parameter and only prompt the user to merge if the account already exists:

```js
skapi.openIdLogin({ id: 'by_skapi', token: ACCESS_TOKEN })
    .catch(err => {
        if (err.code === 'ACCOUNT_EXISTS') {
            if (confirm('An account already exists. Merge them now?')) {
                return skapi.openIdLogin({ id: 'by_skapi', token: ACCESS_TOKEN, merge: true });
            }
        }
        throw err; // Re-throw if not handled
    });
```
:::

<br>

# Updating User Profile

:::warning
You must be logged in to call this method.
:::

You can update a user's profile using [`updateProfile()`](https://docs.skapi.com/api-reference/user/README.html#updateprofile).
If successful, the method returns the updated [UserProfile](https://docs.skapi.com/api-reference/data-types/README.html#userprofile) object.

:::danger
-   If a user changes their email, their login email changes as well.
-   When the email is changed, it becomes unverified.
:::

In this example, the user's name is updated by passing a new `name` value.
If successful, the updated user profile is returned.

:::code-group

```html [Form]
<form onsubmit="skapi.updateProfile(event).then(user=>console.log(user))">
    <input type="text" name="name" placeholder="Name" required />
    <br />
    <input type="submit" value="Update Profile" />
</form>
```

```js [JS]
let params = {
    name: "New name",
    // email, // The user's login email address. The email will be unverified if it is changed.
    // address, // The user's address.
    // gender, // The user's gender. Can be "female" or "male", or other values if neither of these are applicable.
    // birthdate, // The user's birthdate in the format "YYYY-MM-DD".
    // phone_number, // The user's phone number.
    // email_public, // The user's email is public if this is set to true. The email should be verified.
    // phone_number_public, // The user's phone number is public if this is set to true. The phone number should be verified.
    // address_public, // The user's address is public if this is set to true.
    // gender_public, // The user's gender is public if this is set to true.
    // birthdate_public, // The user's birthdate is public if this is set to true.
    // picture, // URL of the profile picture.
    // profile, // URL of the profile page.
    // website, // URL of the website.
    // nickname, // Nickname of the user.
    // misc, // Additional string value for custom use. This value is visible only through skapi.getProfile().
};

skapi.updateProfile(params).then((user) => {
    console.log({ user }); // User's name is updated.
});
```

:::

For full details on parameters and options, see the API reference below:

### [`updateProfile(params): Promise<UserProfile>`](https://docs.skapi.com/api-reference/user/README.html#updateprofile)

:::tip
If you need to upload an image to a user's profile, first upload a public image file with [`postRecord()`](https://docs.skapi.com/api-reference/database/README.html#postrecord), then use the uploaded file URL in the profile attributes.
:::

## Public Attributes

Certain user profile attributes can be set as public or private.
When an attribute is public, other users can find it.
When an attribute is private, other users cannot find it.

The following attributes can be set to public or private:

-   `email`
-   `phone_number`
-   `address`
-   `gender`
-   `birthdate`

By default, these attributes are set to private.

Here is an example that makes the user's email public:

:::code-group

```html [Form]
<form onsubmit="skapi.updateProfile(event).then(user=>console.log(user))">
    <input type="checkbox" name="email_public" value="true" /> Make email public
    <br />
    <input type="submit" value="Update Profile" />
</form>
```

```js [JS]
let params = {
    email_public: true,
};

skapi.updateProfile(params).then((user) => {
    console.log({ user }); // User's email is now public.
});
```

:::

For full details on parameters and options, see the API reference below:

### [`updateProfile(params): Promise<UserProfile>`](https://docs.skapi.com/api-reference/user/README.html#updateprofile)


<br>

# E-Mail Verification

:::warning
User must be logged in to call this method
:::

User with verified E-Mail can:

- Reset their password if they've forgotten it.
- Receive newsletter from the service owner if they choose to.
- Recover their disabled account.
- Allow their email address to be public to other users if they choose.

You can verify your user's email address with [`verifyEmail()`](https://docs.skapi.com/api-reference/user/README.html#verifyemail).

:::tip
The user's email is automatically verified if [signup confirmation](https://docs.skapi.com/authentication/signup-confirmation.md) was requested in [`signup()`](https://docs.skapi.com/api-reference/authentication/README.html#signup).
:::

The example below shows how you can verify your users email address.

1. The first method call, without any arguments, sends a verification email to the user.
2. The second call completes the verification process by passing the verification code that user retrieved from their email.

``` js
  // Send verification code to user's E-Mail
  skapi.verifyEmail().then(res=>{
     // 'SUCCESS: Verification code has been sent.'
    console.log(res);

    // Prompt user to enter the verification code
    let code = prompt('Enter the verification code sent to your E-Mail');
    
    // Verify E-Mail with the code
    skapi.verifyEmail({ code }).then(res=>{
      // SUCCESS: "email" is verified.
      window.alert('Your email is verified');
    });
  });
```

For more detailed information on all the parameters and options available with the [`verifyEmail()`](https://docs.skapi.com/api-reference/user/README.html#verifyemail) method, 
please refer to the API Reference below:

### [`verifyEmail(params?): Promise(string)`](https://docs.skapi.com/api-reference/user/README.html#verifyemail)

:::warning
The user's email verified state will be lost if the user had changed their email address.
:::


<br>

# Changing Password

:::warning
User must be logged in to call this method.
:::

The [`changePassword()`](https://docs.skapi.com/api-reference/user/README.html#changepassword) method allows users who are logged-in to change their password. This method requires the user's current password and the new password as parameters. If the password change is successful, the method will return a success message.

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

For more detailed information on all the parameters and options available with the [`changePassword()`](https://docs.skapi.com/api-reference/user/README.html#changepassword) method, 
please refer to the API Reference below:


### [`changePassword(params): Promise<string>`](https://docs.skapi.com/api-reference/user/README.html#changepassword)

<br>

# Disable / Recover Account


## Disabling account

:::warning
User must be logged in to call this method
:::

:::warning
If your service does not allow users to signup, the users will not be able to disable their account.

For more information on how to allow/disallow users to signup from your service settings page, please refer to the [Service Settings](https://docs.skapi.com/service-settings/service-settings.md#allow-signup) page. 
:::

If user choose to leave your service, they can disable their account.
User's can disable their account by calling the [`disableAccount()`](https://docs.skapi.com/api-reference/user/README.html#disableaccount) method.
**All data related to the account will be deleted after 90 days**.
User will be automatically logged out once their account has been disabled.

``` js
skapi.disableAccount().then(()=>{
  // Account is disabled and user is logged out.
});
```

For more detailed information on all the parameters and options available with the [`disableAccount()`](https://docs.skapi.com/api-reference/user/README.html#disableaccount) method, 
please refer to the API Reference below:

### [`disableAccount(): Promise(string)`](https://docs.skapi.com/api-reference/user/README.html#disableaccount)

## Recovering a Disabled Account

Disabled accounts can be reactivated **within 90 days** using the [`recoverAccount()`](https://docs.skapi.com/api-reference/user/README.html#recoveraccount) method. This method allows users to reactivate their disabled accounts under the following conditions:

- The account email must be verified.
- The [`recoverAccount()`](https://docs.skapi.com/api-reference/user/README.html#recoveraccount) method must be called from the `catch` block of a failed [`login()`](https://docs.skapi.com/api-reference/authentication/README.html#login) attempt using the disabled account.

The [`recoverAccount()`](https://docs.skapi.com/api-reference/user/README.html#recoveraccount) method sends an email to the account owner, containing a confirmation link (The same signup confirmation email) for account recovery.

Additionally, you can provide an optional `string` argument to the [`recoverAccount()`](https://docs.skapi.com/api-reference/user/README.html#recoveraccount) method, which will redirect the user to the specified URL or relative path of your website upon successful account recovery.

:::code-group

```html [Form]
<form onsubmit="skapi.login(event)
    .then(u=>console.log('Login success.'))
    .catch(err=>{
        console.log(err.code); // USER_IS_DISABLED
        if(err.code === 'USER_IS_DISABLED') {
          // Send a recovery email to the user with a link.
          // When the user click on the link, the user will be redirected when account recovery is successful.

          let recover = confirm('Do you want to recover your account?')
          if(recover) {
            skapi.recoverAccount('/welcome/back/page').then(res=>{
              console.log(res); // SUCCESS: Recovery e-mail has been sent.
            });
          }
        }
    })">
    <input type="email" name="email" placeholder="E-Mail" required><br>
    <input id="password" type="password" name="password" placeholder="Password" required><br>
    <input type="submit" value="Login">
</form>
```

```js [JS]
// user attempt to login
skapi.login({email: 'user@email.com', password: 'password'})
    .then(u=>console.log('Login success.'))
    .catch(err=>{
        console.log(err.code); // USER_IS_DISABLED
        if(err.code === 'USER_IS_DISABLED') {
            // Send a recovery email to the user with a link.
            // When the user click on the link, the user will be redirected when account recovery is successful.

            let recover = window.confirm('Do you want to recover your account?')
            if(recover) {
            skapi.recoverAccount("/welcome/back/page").then(res=>{
                console.log(res); // SUCCESS: Recovery e-mail has been sent.
            });
            }
        }
    });
```

:::

In the example above, the [`recoverAccount()`](https://docs.skapi.com/api-reference/user/README.html#recoveraccount) method is called from the catch block of a failed login attempt using a disabled account.

If the login attempt fails with the error code `"USER_IS_DISABLED"`, user can choose to recover their account.

The [`recoverAccount()`](https://docs.skapi.com/api-reference/user/README.html#recoveraccount) method is called to send a recovery email to the user.
The recovery email contains a link, and when the user clicks on the link, they will be redirected to the relative path of the website URL: `/welcome/back/page` upon successful account recovery.

For more detailed information on all the parameters and options available with the [`recoverAccount()`](https://docs.skapi.com/api-reference/user/README.html#recoveraccount) method, 
please refer to the API Reference below:

### [`recoverAccount(redirect: boolean | string): Promise<string>`](https://docs.skapi.com/api-reference/user/README.html#recoveraccount)
 
:::danger
User should know their password, and have their account email verified.
Otherwise user's account cannot be recovered.
:::


<br>

# Searching Users

:::warning
User must be logged in to call this method
:::


Users can search, retrieve information of other users in your service using the [`getUsers()`](https://docs.skapi.com/api-reference/user/README.html#getusers) method. By default, [`getUsers()`](https://docs.skapi.com/api-reference/user/README.html#getusers) will return all users chronologically from the most recent sign-up.

User information retrieved from the database is returned as a list of [UserPublic](https://docs.skapi.com/api-reference/data-types/README.html#userpublic) objects.

:::info
Any attribute that is not set to public will not be retrieved.
:::


```js
skapi.getUsers().then(u=>{
  console.log(u.list); // List of all users in your service, sorted by most recent sign-up date.
});
```

In the example above, the [`getUsers()`](https://docs.skapi.com/api-reference/user/README.html#getusers) method is called without any parameters.
This retrieves a list of all user profiles in your service.

For more detailed information on all the parameters and options available with the [`getUsers()`](https://docs.skapi.com/api-reference/user/README.html#getusers) method, 
please refer to the API Reference below:

### [`getUsers(params?, fetchOptions?): Promise<DatabaseResponse<UserPublic>>`](https://docs.skapi.com/api-reference/user/README.html#getusers)

## Searching users with conditions

Following examples shows how you can search users based on attributes such as name, timestamp (account created timestamp), birthdate... etc

#### Search for users whose name starts with 'Baksa'

```js
let params = {
  searchFor: 'name',
  condition: '>=', // >= means greater or equal to given value. But on string value, it works as 'starts with' condition.
  value: 'Baksa'
}

skapi.getUsers(params).then(u=>{
  console.log(u.list); // List of users whose name starts with 'Baksa'
});
```

#### Search for users who joined before 2023 Jan 1

```js
let timestampParams = {
  searchFor: 'timestamp',
  condition: '<', // Less than given value
  value: 1672498800000 //2023 Jan 1
}

skapi.getUsers(timestampParams).then(u=>{
  console.log(u.list); // List of users who joined before 2023 jan 1
});
```

#### Search for users whose birthday is between 1985 ~ 1990

```js
let birthdateParams = {
  searchFor: 'birthdate',
  value: '1985-01-01',
  range: '1990-12-31' // Queries range of value from given value to given range value.
}

skapi.getUsers(birthdateParams).then(u=>{
  console.log(u.list); // List of users whose birthday is between 1985 ~ 1990
});
```

The `searchFor` parameter specifies the attribute to search for, and the value parameter specifies the search value.

#### The following attributes can be used in `searchFor` to search for users:

- `user_id`: unique user identifier, string
- `email`: user's email address, string
- `phone_number`: user's phone number, string
- `name`: user's profile name, string
- `address`: user's physical address, string
- `gender`: user's gender, string
- `birthdate`: user's birthdate in "YYYY-MM-DD" format, string
- `locale`: the user's locale, a string representing the country code (e.g "US" for United States).
- `subscribers`: number of subscribers the user has, number
- `timestamp`: timestamp of user's sign-up, number(13 digit unix time)
- `approved`: search by account approval status


#### The `condition` parameter allows you to set the search condition.

- `>`: Greater than the given value.
- `>=`: Greater or equal to the given value. When the value is `string`, it works as 'starts with' condition.
- `=`: Equal to the given value. (default)
- `<`: Lesser than the given value.
- `<=`: Lesser or equal to the given value.

When searching for a `string` attribute, `>` and `<` will search for strings that are higher or lower in the lexicographical order, respectively. And `>=` operator works as 'start with' condition.

:::info
- Conditional query does not work on `user_id`, `email`, `phone_number`. It must be searched with the '=' condition.
- Users cannot search for attributes that are not set to public.
:::


The `range` parameter enables searching for users based on a specific attribute value within a given range. For example, if searching by `timestamp` with a range of 1651748526 to 1651143726, only users created between the two timestamps will be returned. 

:::warning
The `range` parameter cannot be used with the `condition` parameter.
:::

<br>

# Skapi HTML Authentication Template

This is a plain HTML template for Skapi's authentication features.

This template packs all the authentication features you can use in your HTML application:

-   Signup
-   Signup email verification
-   Login
-   Forgot password
-   Change password
-   Update account profile
-   Remove account
-   Recover account

## Download

Download the full project [Here](https://github.com/kkb75281/skapi-auth-html-template/archive/refs/heads/main.zip)

Or visit our [Github page](https://github.com/kkb75281/skapi-auth-html-template)

## How To Run

Download the project, unzip, and open the `index.html`.

### Remote Server

For hosting on remote server, install package:

```
npm i
```

Then run:

```
npm run dev
```

The application will be hosted on port `3300`

:::danger Important!

Replace the `SERVICE_ID` value to your own service in `service.js`

<!-- Currently the service is running on **Trial Mode**. -->

<!-- **All the user data will be deleted every 14 days.** -->

You can get your own service ID from [Skapi](https://www.skapi.com)

:::


<br>

# What is a database?

A database is storage for your web application's data.

That data can be simple values (such as comments, likes, or ratings) or files (such as images, documents, and videos). It should be stored securely, read efficiently, and indexed in a way that makes searching and organizing easy.

With Skapi, you can store anything from small JSON objects to large binary files up to 5 TB per file. Skapi handles security, indexing, and file storage for you.

Files are served through a CDN, and access is controlled by the access group set by the uploader.

Skapi's database is user-centric, which means frontend developers can configure schema behavior and security rules directly.

With this approach, you can get started quickly without complex setup or rigid schema definitions.

In this section, you will learn how to store and retrieve data, and how Skapi's indexing system helps you search it efficiently.

<br>

# Creating a Record

Users can use the [`postRecord()`](https://docs.skapi.com/api-reference/database/README.html#postrecord) method to create a new record or update existing records in the database.

It takes two arguments:

- `data` The data to be saved in key-value pairs. It can be an object literal, `null`, `undefined`, or a form `SubmitEvent`. Once the record is uploaded, the given data will be stored as a value under the key name `data` in the returned [RecordData](https://docs.skapi.com/api-reference/data-types/README.html#recorddata).

- `config` (required): Configuration for the record to be uploaded. This is where you specify the table name, access group, index values, etc.

Refer to the example below:

:::code-group

```html [Form]
<form onsubmit="skapi.postRecord(event, { table: { name: 'my_collection', access_group: 'public' } }).then(rec => {
    console.log(rec);
    /*
    Returns:
    {
        data: { something: 'Hello World' },
        table: { name: 'my_collection', access_group: 'public' },
        ...
    }
    */
})">
    <input name="something" placeholder="Say something" value="Hello World"/>
    <input type="submit" value="Submit" />
</form>
```

```js [JS]
// Data to be saved in key:value pairs
let data = {
    something: "Hello World"
}

// Configuration for the record to be uploaded
let config = {
    table: { name: 'my_collection', access_group: 'public' }
}

skapi.postRecord(data, config).then(rec=>{
    console.log(rec);
    /*
    Returns:
    {
        data: { something: "Hello World" },
        table: { name: 'my_collection', access_group: 'public' },
        ...
    }
    */
});
```
:::

This example demonstrates using the [`postRecord()`](https://docs.skapi.com/api-reference/database/README.html#postrecord) method to create a record in the database.
When the request is successful, the [RecordData](https://docs.skapi.com/api-reference/data-types/README.html#recorddata) is returned.

In this example, the first argument takes the actual data to be uploaded to the database.
The data is a Javascript object that has string value in the key 'something'.
The given data will be stord under the key name `data` of the returned [RecordData](https://docs.skapi.com/api-reference/data-types/README.html#recorddata).

And in the second argument we have set table name to be `my_collection` and access group to be `public`.
`config.table` is a required parameter in the configuration object and the `config.table.name` should not contain any special characters.

::: tip
If `config.table` is given as a **string**, the given value will be set as `config.table.name` and the record will be uploaded with `config.table.access_group` set to `"public"`.
:::

When uploading the record with access restrictions, see [`Access Restrictions`](https://docs.skapi.com/database/access-restrictions.md).

::: danger
Both authenticated and anonymous users can upload data to your service using the [`postRecord()`](https://docs.skapi.com/api-reference/database/README.html#postrecord) method.

Limitations for anonymous (unsigned) users:
1. They can only create records in the `public` access group (see [`Access Restrictions`](https://docs.skapi.com/database/access-restrictions.md)).
2. They cannot edit or delete any records they create.
3. They cannot create records that use [`Subscription`](https://docs.skapi.com/database/subscription.md) features.
4. They cannot create records with [`Unique ID`](https://docs.skapi.com/database/unique-id.md) features.
:::

::: danger
When an anonymous user uploads a record, the `user_id` in the returned [`RecordData`](https://docs.skapi.com/api-reference/data-types/README.html#recorddata) is temporary and should NOT be used for user queries.
:::

For more detailed information on all the parameters and options available with the [`postRecord()`](https://docs.skapi.com/api-reference/database/README.html#postrecord) method, 
please refer to the API Reference below:

### [`postRecord(data, config):Promise<RecordData>`](https://docs.skapi.com/api-reference/database/README.html#postrecord)

:::tip Note
Skapi database does not require you to pre-setup your database schema.

If the specified table does not exist, it will be automatically created when you create the record.
Conversely, if a table has no records, it will be automatically deleted.
:::

<br>

# Fetching Records

The [`getRecords()`](https://docs.skapi.com/api-reference/database/README.html#getrecords) method allows you to fetch records from the database. It retrieves records based on the specified query parameters and returns a promise that resolves to the [DatabaseResponse](https://docs.skapi.com/api-reference/data-types/README.html#databaseresponse) containing the [RecordData](https://docs.skapi.com/api-reference/data-types/README.html#recorddata) object.

It takes two arguments:
- `query`: Specifies the query parameters for fetching records.
- `fetchOptions`: (optional)
    Specifies additional configuration options for fetching database records
    For more information, see [Database Fetch Options](https://docs.skapi.com/database/fetch.md#database-fetch-options).

### Fetching Records from a Table

```js
let query = {
    table: { name: 'my_collection', access_group: 'public' }
}

skapi.getRecords(query).then(response=>{
    // response
    /**
     * endOfList: true,
     * list: [
     *  ...
     * ],
     * startKey: 'end',
     * ...
     */
});
```

The example above retrieve records from a table named 'my_collection' with `access_group` that are `public`
The `table` parameter in the `query` argument sets the table name you want to fetch records from.
The retrieved records are accessed through the `response.list` property.

When fetching the records with access restrictions, see [`Access Restrictions`](https://docs.skapi.com/database/access-restrictions.md).

For more detailed information on all the parameters and options available with the [`getRecords()`](https://docs.skapi.com/api-reference/database/README.html#getrecords) method, 
please refer to the API Reference below:

### [`getRecords(query, fetchOptions?): Promise<DatabaseResponse<RecordData>>`](https://docs.skapi.com/api-reference/database/README.html#getrecords)

### Fetching Record by ID

You can fetch a record by its unique ID using the [`getRecords()`](https://docs.skapi.com/api-reference/database/README.html#getrecords) method. When fetching a record by ID, you don't need to provide any additional configuration parameters.

```js
let query = {
    record_id: 'record_id_to_fetch'
};

skapi.getRecords(query).then(response => {
    // response
    /**
     * endOfList: true,
     * list: [{
     *  ... // only 1 result
     * }],
     * startKey: null // startKey is null as no more records can be retrieved
     */
});
```

In this example, the `query` object includes the `record_id` property set to the ID of the record you want to fetch.
`record_id` is a unique identifier for each record in the database.

The `response.list` will contain the record data if the record exists.


## Database Fetch Options

[FetchOptions](https://docs.skapi.com/api-reference/data-types/README.html#fetchoptions) can control the number of the record per fetch, fetching the next batch of records, fetching the records by ascending/descending order... etc.

This is used globally for all database related methods that allows optional [FetchOptions](https://docs.skapi.com/api-reference/data-types/README.html#fetchoptions) argument.

See full list of parameters: [FetchOptions](https://docs.skapi.com/api-reference/data-types/README.html#fetchoptions)


#### Limit Results with `fetchOptions.limit`

By default, 50 sets of the data will be fetched per call.
You can adjust the limit to your preference, allowing up to **1000 sets of data**, by using the `limit` key.

#### Fetch More Results with `fetchOptions.fetchMore`

To fetch the next batch of results, you can set the `fetchOption.fetchMore` to `true`.
When set to `false`(default), database will always return the first batch of the data.

This allows you to retrieve results in batches until the end of the list is reached.

#### Order results with `fetchOptions.ascending`

By default, the database fetch the data in ascending order.
If set to `false`, list of data can be fetched in descending order

For example, let's say there is millions of record in the database table 'my_collection'.
We can fetch the first 100 data, then paginate to the next 100 data by setting `fetchOptions.fetchMore` to `true`.

``` js
let query = {
    table: { name: 'my_collection', access_group: 'public' }
}

let fetchOptions = {
  limit: 100, // Limit each fetch to 100 data.
  fetchMore: false, // When false, database always gives you the first batch of data.
  ascending: false // Fetch in decending order.
}

skapi.getRecords(query, fetchOptions).then(res=>{
  console.log(res.list); // List of up to 100 data in the database.
  
  if(!res.endOfList) {
    // If there is more data to fetch, and if user chooses to, they can retrieve the next batch of 100.

    fetchOptions.fetchMore = true;
    if(confirm('Fetch more records?')) {
        skapi.getUsers(query, fetchOptions)
            .then(res=>{
                console.log(res.list); // List of the next 100 data from the database.
            }
        );
    }
  }
});
```

In this example, after the first call to the database, we see the `endOfList` value is not `true`.
This means there are more data left to fetch in the database.

To fetch more data in the database, we set `fetchOptions.fetchMore` to `true` and call the method again.
This allows to fetch the next batch of 100 data on each execution until the end of the list is reached.

:::tip
When using the `fetchMore` parameter, you must check if the response's `endOfList` value is `true` before making the next call.
The database will always return an empty list if the `fetchOptions.fetchMore` is set to `true` and it had reached the end of list and.

You can however, initialize your fetch and refetch from start by toggling `fetchOptions.fetchMore` back to `false`.
:::

:::tip
You can fetch all the data at once by recursively calling the method until the `endOfList` value is `true`.
However for efficiency, avoid trying to fetch all the data at once. Fetch only data the user needs and paginate when necessary.
:::

<br>

# Unique ID

When uploading a record with [`postRecord()`](https://docs.skapi.com/api-reference/database/README.html#postrecord), you can set a unique ID for the record. This unique ID can be used to fetch the record later.
Unique ID must be a string and must be unique across all records in the table.

This feature is useful when you want to create a record with a unique identifier, such as a order ID, or any other unique identifier.

Unique ID can be used to fetch the record using the [`getRecords()`](https://docs.skapi.com/api-reference/database/README.html#getrecords) method.

Unique ID can be also used when fetching references of a record.
More on referencing can be found [here](https://docs.skapi.com/database/referencing.md).

:::warning
Anonymous (unsigned) users cannot create records using unique ID.
:::

## Creating a Record with Unique ID

```js
let data = {
    myData: "This is a record with a unique ID"
};

let config = {
    table: { name: 'my_table', access_group: 'public' },
    unique_id: 'My Unique ID %$#@'
};

skapi.postRecord(data, config).then(record => {
    console.log(record);
    /*
    Returns:
    {
        data: { myData: "This is a record with a unique ID" },
        table: { name: 'my_table', access_group: 'public' },
        unique_id: 'My Unique ID %$#@',
        ...
    }
    */
});
```

The example above demonstrates uploading a record with a unique ID.
When the request is successful, the [RecordData](https://docs.skapi.com/api-reference/data-types/README.html#recorddata) is returned.

## Fetching a Record with Unique ID

After uploading the record, you can fetch the record using the unique ID with [`getRecords()`](https://docs.skapi.com/api-reference/database/README.html#getrecords) method.

```js
let params = {
    unique_id: 'My Unique ID %$#@'
};

skapi.getRecords(params).then(response => {
    console.log(response.list);  // record with the unique ID
});
```

## Fetching Unique ID List

By using [`getUniqueId()`](https://docs.skapi.com/api-reference/database/README.html#getuniqueid) method, you can fetch list of unique ID's that are registered in your database.

Below is an example where you can fetch list of unique ID that starts with **"guitar_"**

```js
let params = {
    unique_id: 'guitar_',
    condition: '>='
};

skapi.getUniqueId(params).then(response => {
    console.log(response.list);  // [{unique_id: "...", record_id: "..."}, ...]
});
```

<br>


# Access Restrictions

Skapi database allows you to set access restrictions on records. This allows you to control who can access your records.

You can add additional settings to your `table` parameter by using an `object` instead of a `string` in your `config.table`.
This allows you to set access restrictions on records using the `access_group` parameter.

The following values can be set for `table.access_group`:

- Number 0 to 99: Integer from 0 to 99 can be set to define the access level.
- `private`: Only the uploader of the record will have access.
- `public`: The record will be accessible to everyone. (Equivalent to number 0)
- `authorized`: The record will only be accessible to users who are logged into your service. (Equivalent to number 1)
- `admin`: Only admin can use this group. The record will only be accessible to the admin of your service. (Equivalent to number 99)


If `access_group` is not set, the default value is `public`.

::: tip
Users can only access records that have an access group that is the same or a lower number than the access group defined in their user profile.

The user profile's access group can only be changed by the service owners.
:::

::: tip
Unless the user is referencing a private access granted record, the user cannot upload a record with `access_group` set to a higher level than their own access level.

You can read more about referencing records [here](https://docs.skapi.com/database/referencing.md).
:::

::: warning
Anonymous (unsigned) users can only create records with `access_group` set to `public`.
:::

## Creating Record With Access Restrictions

Here's an example that demonstrates uploading record with `authorized` level access:

```js
let data = {
    myData: "Only for authorized users"
};

let config = {
    table: {
        name: 'ForAuthorizedUsers',
        access_group: 'authorized'
    }
};

skapi.postRecord(data, config).then(record => {
    console.log(record); // Only the logged users will have access this record.
});
```


## Fetching Records with Access Restrictions

In order to fetch records with `access_group` that is not `public`, you need to specify the `access_group` you are trying to fetch from. In this example, we are trying to fetch records from the "ForAuthorizedUsers" table with `authorized` access.

```js
let config = {
    table: {
        name: 'ForAuthorizedUsers',
        access_group: 'authorized'
    }
};

skapi.getRecords(config)
    .then(response => {
        // response
        /**
         * endOfList: true,
         * list: [
         *  {
         *      data: { myData: "Only for authorized users" },
         *      table: { name: 'ForAuthorizedUsers', access_group: 'authorized' },
         *      ...
         *  }, ...
         * ],
         * startKey: 'end',
         * ...
         */
    });
```

## Private Records

Private records are only accessible to the uploader of the record.

**Even the admin of the service will not have access to view the user's private data.**

The example below demonstrates uploading a private record:

```js
let data = {
    myData: "My private data"
};

let config = {
    table: {
        name: 'PrivateCollection',
        access_group: 'private'
    }
};

skapi.postRecord(data, config).then(record => {
    console.log(record); // Only the uploader will be able to access this record.
});
```

Then, if someone else tries to fetch the record, they will get an error:

```js
let config = {
    record_id: 'record_id_of_the_private_record'
};

skapi.getRecords(config)
    .catch(err=>alert(err.message)); // User has no access to private record.
```

## Grant Private Access

Users can grant private access of their record to other users by using the [`grantPrivateRecordAccess(params)`](https://docs.skapi.com/api-reference/database/README.html#grantprivateaccess) method.

```js
skapi.grantPrivateRecordAccess({
    record_id: 'record_id_of_the_private_record',
    user_id: 'user_id_to_grant_access'
})
```

When the user is granted access to the record, they will be able to fetch the record either if it's private or even if it has higher access group than the user.

Access granted users can also see all the records that is referencing this record at all access groups including private records.

You can read more about referencing records [here](https://docs.skapi.com/database/referencing.md).

## Remove Private Access

Users can remove access of their private record from other users by using the [`removePrivateRecordAccess(params)`](https://docs.skapi.com/api-reference/database/README.html#removeprivateaccess) method.

```js
skapi.removePrivateRecordAccess({
    record_id: 'record_id_of_the_private_record',
    user_id: 'user_id_to_remove_access'
})
```

## Allowing Others to Grant Private Access to Others

By default, The owner of the record has access to grant private access of the uploaded record to others.

The owner of the record can also allow other granted users to grant private access of the uploaded record to others.

When uploading a record, if the uploader set `source.allow_granted_to_grant_others` to `true` users with private access to the record can grant access to other users as well.

```js
skapi.postRecord(null, {
    table: {
        name: 'record_can_be_granted',
        access_group: 'private'
    },
    source: {
        allow_granted_to_grant_others: true
    }
}).then(r=>{
    // now other users with an private access can also grant private access to the record (r) to others.
})
```


## Listing Private Access Grants

You can list records or users that have been granted private access using the [`listPrivateRecordAccess(params, fetchOptions)`](https://docs.skapi.com/api-reference/database/README.html#listprivaterecordaccess) method.

:::warning IMPORTANT
Provide either `record_id` or `user_id` (at least one is required).
:::

```js
skapi.listPrivateRecordAccess({
    // Optional: one or both of these fields
    record_id: 'record_can_be_granted',
    user_id: 'user_id_to_check_granted'
}).then(res => {
    // Response shape:
    // {
    //   list: [
    //     { user_id: 'xxxx-xxxx...', record_id: 'record_id_123' },
    //     ...
    //   ],
    //   ...
    // }
})
```


<br>


# Updating a Record

The [`postRecord()`](https://docs.skapi.com/api-reference/database/README.html#postrecord) method can also be used to update an existing record. You can specify the `record_id` in the `config` object in order to do so. 

[`postRecord()`](https://docs.skapi.com/api-reference/database/README.html#postrecord) will overwrite the user's record data to a new data.

For record config parameters, you only need to include the parameters you want to update along with the `record_id` parameter.
All other fields in the record will remain unchanged unless explicitly included in the method call.

:::warning
Users must be logged in to update a record.
:::

```js
let updatedData = {
  newData: "Overwritten with new data."
};

let config = {
  record_id: 'record_id_to_update',
  table: {
    name: 'new_table_name',
    access_group: 'private' // change access group to private
  }
};

skapi.postRecord(updatedData, config).then(record => {
  console.log(record);
});
```

Example above overwrites record data to a new data and updated to a new table name.

:::tip
To update only the `config` of the record with `data` untouched, you can leave the first argument `data` to `undefined`.
Then, only the `config` will be updated with the previous data untouched.

```js
let new_config = {
  record_id: 'record_id_to_update',
  table: {
    name: 'new_table_name',
    access_group: 'private' // change access group to private
  }
};

skapi.postRecord(undefined, new_config).then(record => {
  console.log(record);
});
```

:::danger
Always use `undefined` if you want to update only the record configurations.
If `null` is used instead of undefined, the record data will be overwritten to value `null`.
:::

:::

:::info
Only the owner of the record can update a record.
:::

## Readonly Record

You can let user upload a readonly record that is immutable once it is created.
To create a readonly record, you can set the `readonly` parameter in the `config` object to `true`.

```js
let data = {
  myData: "Hello World"
};

let config = {
  table: { name: 'my_collection', access_group: 'public' },
  readonly: true
};

let read_only_record_id;
skapi.postRecord(data, config).then(record => {
  console.log(record);
  read_only_record_id = record.record_id;
});
```

When the record is created with `readonly` set to `true`, the user will not be able edit or delete the record anymore.

```js
skapi.postRecord({ myData: "Can this be updated?" }, { record_id: read_only_record_id }).catch(err=>{
    alert(err.message); // Record is readonly.
})
```

<br>

# Handling Files

Skapi database is integrated with Skapi's cloud storage and CDN.
This allows you to upload any size of binary files to the database without any additional setup.

## Uploading Files

To upload files, you can pass the HTML form `SubmitEvent` or `FormData` that includes `FileList` object when calling the [`postRecord()`](https://docs.skapi.com/api-reference/database/README.html#postrecord) method.

Additionally, We can log the progress of the upload by passing a [ProgressCallback](https://docs.skapi.com/api-reference/data-types/README.html#progresscallback) in the `progress` parameter in the second argument of [`postRecord()`](https://docs.skapi.com/api-reference/database/README.html#postrecord).
This can be useful if the user is uploading huge files, you can show a progress bar.

Here's an example demonstrating how you can upload files using Skapi:

```html
<form
    onsubmit="skapi.postRecord(event, {
    table: {
        name: 'my_photos',
        access_group: 'authorized'
    },
    progress: (p)=>console.log(p) 
}).then(rec=>console.log(rec))"
>
    <input name="description" />
    <input name="picture" multiple type="file" />
    <input type="submit" value="Submit" />
</form>
```

The `name` attribute of the file input element will serve as the key name of the file data.
Regarless the file input is multi or single, the file(s) will **ALWAYS** be uploaded as an array of [BinaryFile](https://docs.skapi.com/api-reference/data-types/README.html#binaryfile) object under the key name `picture`(the name of the file input element) in the `bin` key of the [RecordData](https://docs.skapi.com/api-reference/data-types/README.html#recorddata) as shown below:

```js
// record data
{
    record_id: '...',
    ...,
    bin: {
        picture: [
            {
                access_group: 'authorized',
                filename: '...',
                url: 'https://...',
                path: '.../...',
                size: 1234,
                uploaded: 1234
                getFile: () => {...};
            },
            ...
        ]
    }
}
```

The `bin` data will contain array of [BinaryFile](https://docs.skapi.com/api-reference/data-types/README.html#binaryfile) objects.
This process is handled seamlessly without any complicated file handling required.

Once the files are uploaded, Skapi serves the files using a CDN with no additional setup required.

:::danger
If the file is uploaded in a record where the access group is not 'public', the URL value in the [BinaryFile](https://docs.skapi.com/api-reference/data-types/README.html#binaryfile) objects can expire for security reasons.
:::

## Progress Information

When uploading files via [`postRecord()`](https://docs.skapi.com/api-reference/database/README.html#postrecord) method, you can attach a [ProgressCallback](https://docs.skapi.com/api-reference/data-types/README.html#progresscallback) in the `progress` parameter when uploading files.
The [ProgressCallback](https://docs.skapi.com/api-reference/data-types/README.html#progresscallback) will trigger whenever there is a byte loaded to/from the backend.

```js
let progressCallback = (p) => {
    if (p.status === "upload" && p.currentFile) {
        console.log(`Progress: ${p.progress}%`);
        console.log("Current uploading file:" + p.currentFile.name);
    }
};
skapi.postRecord(someData, {
    table: { name: "my_photos", access_group: "authorized" },
    progress: progressCallback,
});
```

## Downloading Files

To download files from the record, you can use the `getFile()` method on the [BinaryFile](https://docs.skapi.com/api-reference/data-types/README.html#binaryfile) object in the record.

Below is an example of how you can download a file from a record:

```js
skapi.getRecords({ record_id: "record_id_with_file" }).then((rec) => {
    let record = rec.list[0]; // record with files attached.

    /*
    // record
    {
        table: {
            name: 'my_photos',
            access_group: 'authorized'
        },
        record_id: '...',
        ...,
        bin: {
            picture: [
                {
                    access_group: 'authorized',
                    filename: '...',
                    url: 'https://...',
                    path: '.../...',
                    size: 1234,
                    uploaded: 1234
                    getFile: () => {...};
                },
                ...
            ]
        }
    }
    */

    let fileToDownload = record.bin.picture[0]; // get the file object from the record

    fileToDownload.getFile(); // browser will download the file.
});
```

:::info
Uploaded files follow the access restrictions of the record.
User must have access to the record in order to download the file.
:::

`getFile()` allows you to download the file in various ways:

-   `blob`: Downloads the file as a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) object.
-   `base64`: Downloads the file as a base64 string.
-   `endpoint`: If the file access requires authentication or needs token update, you can request an updated endpoint of the file.
-   `download` (or omitted): Triggers file download from the web browser.
-   `text`: Downloads the file as text string.
-   `info`: Returns file information.

The method has three arguments:

-   `url`: The URL or file reference to download.
-   `config`: Optional configuration object with:
    -   `dataType`: Type of download - `blob`, `base64`, `endpoint`, `text`, `info` or `download`. Defaults to `download`
-   `progressCallback`: Optional progress callback function. Useful when downloading large files as blob to show progress bar. (Will not work with `endpoint` or `download` types.)

If the file has private access restriction, you must use the `endpoint` type to get the file endpoint URL.
The endpoint URL will be a signed URL that can expire after a certain amount of time.

If the file is an image or a video, you can use the url on img tag or video tag to display the file.

Below is an example of how you can get the endpoint URL of the access restricted private file (The user must have private access granted.):

```js
fileToDownload.getFile("endpoint").then((url) => {
    console.log(url); // endpoint of the file. https://...
});
```

Below is an example of how you can download a file as a blob, base64 with progress callback:

```js
let progressInfo = (p) => {
    console.log(p); // Download progress information
};

fileToDownload.getFile("blob", progressInfo).then((b) => {
    console.log(b); // Blob object of the file.
});

fileToDownload.getFile("base64", progressInfo).then((b) => {
    console.log(b); // base64 string
});
```

## Removing Files

To remove files, use the `remove_bin` parameter in the `config` argument of the [`postRecord()`](https://docs.skapi.com/api-reference/database/README.html#postrecord) method.
When updating a record, you can remove files by passing the `remove_bin` parameter as an array of [BinaryFile](https://docs.skapi.com/api-reference/data-types/README.html#binaryfile) objects or the endpoint URLs of the files that need to be removed from the record.

Here's an example demonstrating how you can remove files from a record:

```js
...
let fileToDelete = record.bin.picture[0]; // file object retrieved from the record.
skapi.postRecord(undefined, { record_id: 'record_id_with_file', remove_bin: [fileToDelete] });
```

If you have the endpoint URL of the file, you can also pass the URL as a string in the `remove_bin` parameter:

```js
skapi.postRecord(undefined, {
    record_id: "record_id_with_file",
    remove_bin: ["https://..."],
});
```

If you want to remove all files from the record, you can pass the `remove_bin` parameter as `null`:

```js
skapi.postRecord(undefined, {
    record_id: "record_id_with_file",
    remove_bin: null,
}); // removes all files from the record.
```

:::warning
The file that is targeted for removal should be in the record that you are updating.
:::

::: tip
If you remove the record that is holding the files, all files that the deleted record was holding will also be completely removed from the database.
:::

## Get File Information

You can use [`getFile()`](https://docs.skapi.com/api-reference/database/README.html#getfile) method to get the file information just from the endpoint URL of the file.

Below is an example of how you can get the file information from the endpoint URL:

```js
let fileUrl = "https://...";
skapi.getFile(fileUrl, { dataType: "info" }).then((fileInfo) => {
    console.log(fileInfo);
    /*
    {
        url: string,
        filename: string,
        access_group: number | 'private' | 'public' | 'authorized',
        filesize: number,
        record_id: string,
        uploader: string,
        uploaded: number,
        fileKey: string
    }
    */
});
```


<br>

# Deleting Records

:::warning
User must be logged in to call this method
:::

The [`deleteRecords()`](https://docs.skapi.com/api-reference/database/README.html#deleterecords) method allows users to delete records that they own.
When the record is deleted, all the files that were uploaded to the record will be deleted as well.

The `params` object accepts similar parameters as the [`getRecords()`](https://docs.skapi.com/api-reference/database/README.html#getrecords) method.

If the `record_id` is provided, it will delete the record with the given `record_id`.

## Deleting Records by Record IDs

Here's an example that demonstrates how to delete multiple records using an array of record IDs:

```js
let query = {
    record_id: ["record_a_record_id", "record_b_record_id"],
};

skapi.deleteRecords(query).then((response) => {
    // 'SUCCESS: records are being deleted. please give some time to finish the process.'
    console.log(response);
});
```

:::warning
You can only delete up to 100 record ID at a time.
:::

## Deleteing Records by Unique IDs

Here's an example that demonstrates how to delete multiple records using an array of unique IDs:

```js
let query = {
    unique_id: ["unique id of the record 1", "unique id of the record 2"],
};

skapi.deleteRecords(query).then((response) => {
    // 'SUCCESS: records are being deleted. please give some time to finish the process.'
    console.log(response);
});
```

:::warning
You can only delete up to 100 unique ID at a time.
:::

## Deleting User's Records with Database Query

Here's an example of deleting all user's records uploaded in the "A" table with a public access group.

```js
let query = {
    table: {
        name: "A",
        access_group: "public",
    },
};

skapi.deleteRecords(query).then((response) => {
    // 'SUCCESS: records are being deleted. please give some time to finish the process.'
    console.log(response);
});
```

You can use the database query however you like to let users delete bulk of records that they uploaded. (e.g. by access group, by table name, index, tag, reference, etc.)

:::tip
When deleting multiple records, the promise will return success immediately, but it may take some time for the deleted records to be reflected in the database.
:::

:::warning
When deleting records by database query, user will not delete records that they do not own, or records that are uploaded as read-only.

However, if the user is an admin, they can delete any records in the database. So be cafeful when admin is using this method.

Read more about admin access [here](https://docs.skapi.com/admin/intro.md).
:::

For more detailed information on all the parameters and options available with the [`deleteRecords()`](https://docs.skapi.com/api-reference/database/README.html#deleterecords) method,
please refer to the API Reference below:

### [`deleteRecords(params): Promise<string | DatabaseResponse<string>>`](https://docs.skapi.com/api-reference/database/README.html#deleterecords)


<br>

# Table Information

Skapi keeps track of all the tables in your database.
You can fetch a list of table names and number of records in each tables and total database size consumed in the table using the [`getTables()`](https://docs.skapi.com/api-reference/database/README.html#gettables) method.

You can fetch a list of table using the `getTables()` method.

```js
skapi.getTables().then(response=>{
    console.log(response); // List of all tables in the database
})
```

### Querying tables

You can query table names that meets the `condition`.

```js
skapi.getTables({
    table: 'C',
    condition: '>'
}).then(response => {
    console.log(response); // Table names starting from 'C'
})
```

In this example, the condition property is set to `>`, and `table` is set to `C`.
This query will return the table names that come after table 'C' in lexographic order, such as 'Cc', 'D', 'E', 'F', 'G'... and so on.

To fetch the table names that starts with 'C', you can set the condition to `>=` instead.

For more detailed information on all the parameters and options available with the [`getTables()`](https://docs.skapi.com/api-reference/database/README.html#gettables) method, 
please refer to the API Reference below:

### [`getTables(query, fetchOptions?): Promise<DatabaseResponse<Table>>`](https://docs.skapi.com/api-reference/database/README.html#gettables)


<br>


# Indexing

When uploading records, you can set additional configurations in the `index` property.
Indexing allows you to categorize and search for records based on specific criteria.
The `index` object consists of the index's `name`, used for indexing, and its corresponding `value`, which is searchable.

## Configuring Indexing for Records

For example, let's consider a table of music albums. You can create an index for the `name` "year" and its corresponding `value` as the release year. This can be set when uploading/updating a record.

This enables searching for music albums by release year when quering records.

```js
let album = {
    title: "Getz/Gilberto",
    artist: "Stan Getz, João Gilberto",
    tracks: 10
};

let config = {
    table: {name: "Albums", access_group: "public"},
    index: {
        name: "year",
        value: 1964
    }
};

skapi.postRecord(album, config);
```


## Querying with Index

Once indexed record is uploaded, you can fetch records based on the "year" in the "Albums" table.

```js
skapi.getRecords({
    table: {name: "Albums", access_group: "public"},
    index: {
        name: "year",
        value: 1964
    }
}).then(response => {
    console.log(response.list); // List of albums released on year 1964.
});
```


## Querying Index with Conditions

You can broaden your search by using the `condition` parameter within the `index` parameter.

```js
skapi.getRecords({
    table: {name: "Albums", access_group: "public"},
    index: {
        name: "year",
        value: 1960,
        condition: '>' // Greater than given value
    }
}).then(response => {
    console.log(response.list); // List of albums released after the year 1960.
});
```

The index value can be of type `number`, `string`, or `boolean`.

When the index value type is `number` or `boolean`, conditions work as they do with numbers.

When the index value type is `string`, `>` and `<` will search for strings that are higher or lower in the lexicographical order, respectively.
`>=` (more than or equal to) acts as a 'starts with' operation when searching for string values.

The `condition` parameter takes the following string values:

- `>`: Greater than the given value.
- `>=`: Greater or equal to the given value. When the value is `string`, it works as 'starts with' condition.
- `=`: Equal to the given value. (default)
- `<`: Lesser than the given value.
- `<=`: Lesser or equal to the given value.


:::warning
When querying an index with conditions, it will only return records with the same value type.

ex) '2' and 2 are different values.
:::

:::danger
`index.name` should NOT have special characters. Only allowed special characters are: [ ] ^ _ \` : ; < = > ? @ and period.

`index.value` should NOT have special characters. Only allowed special characters are: [ ] ^ _ \` : ; < = > ? @ and white space.
:::


## Query Index with Range

In addition to conditions, you can also retrieve records based on a range of values in the index.
To do so, specify the `range` parameter in the `index` object within the [`getRecords()`](https://docs.skapi.com/api-reference/database/README.html#getrecords) method.

For example, consider the following scenario:

```js
skapi.getRecords({
    table: {name: "Albums", access_group: "public"},
    index: {
        name: "year",
        value: 1960,
        range: 1970
    }
}).then(response => {
    console.log(response.list); // List of albums released from 1960 to 1970.
});
```

In the example above, the [`getRecords()`](https://docs.skapi.com/api-reference/database/README.html#getrecords) method will retrieve all records in the "Albums" table that have a "year" index value between 1960 and 1970 (inclusive).

:::warning
- When using the `range` parameter, the `value` and `range` parameter values should be same type of data.
- The `range` and `condition` parameter cannot be used simultaneously.
:::


## Query Index with Reserved Keywords

Skapi has reserved a few keywords to help with querying your records. 
The reserved keywords are:

- `$uploaded`: Fetches the timestamp(13 digits millisecond format) at which the record was created.
  
- `$updated`: Fetches the timestamp(13 digits millisecond format) at which the record was last updated.
  
- `$referenced_count`: Fetch by the number of records that are [referencing](https://docs.skapi.com/database/referencing.md) the record. This can be useful if you need a query like: 'Post that has the most comments'
  
- `$user_id`: Fetches list of record uploaded by given user ID.

With the exception of `$user_id`, all of these reserved keywords can be queried with `condition` and `range` just like any other index values. `$user_id` cannot be queried with condition or range.


## Querying Index with Reserved Keywords
For example, let's query records created after 2021:

```js
skapi.getRecords({
    table: {name: "Albums", access_group: "public"},
    index: {
        name: '$uploaded',
        value: 1609459200000, // this timestamp is 2021 January 1,
        condition: '>'
    }
}).then(response => {
    console.log(response.list); // List of albums uploaded after 2021.
});
 
```

## Compound Index Names

When posting records, you can use compound index names to have more control over querying the records.
This makes it more flexible to search and retrieve records.

### Uploading a Record with a compound index name

In the example below, we are uploading a record with a compound index name:

```js
let album_data = {
    title: "Dukkha",
    tracks: 7
};

skapi.postRecord(album_data, {
    table: {name: 'Albums', access_group: 'public'},
    index: {
        name: 'Band.AsianSpiceHouse.year',
        value: 2023
    }
})
```

In this example, we have created a compound index name by joining the artist type, artist name, and "year" with a period.
The `value` of this index can only be searched when using the full index name (Band.AsianSpiceHouse.year).

### Querying child level compound index names

When compound index name is used, you can also query records by artist type(Band), artist name(AsianSpiceHouse), or release year(2023).

For example, you can query all albums performed by a **'Band'** using the following code:

```js
skapi.getRecords({
    table: {name: 'Albums', access_group: 'public'},
    index: {
        name: 'Band.',
        value: '',
        condition: '>' // More than
    }
}).then(response=>{
    console.log(response.list); // All albums by "Band" type artists.
})
```

Notice `index.name` value includes a period at the end: **'Band.'**.

This allows you to query the child index name of the compound index name as a `string` value.
Since the `index.value` is an empty string and the condition is set to "more than",
this will retrieve all records where the index name begins with **'Band.'**.

The next example shows how you can query albums by artist name.

```js
skapi.getRecords({
    table: {name: 'Albums', access_group: 'public'},
    index: {
        name: 'Band.',
        value: 'Asian',
        condition: '>=' // Starts with
    }
}).then(response=>{
    console.log(response.list); // All albums by "Band" with band name starting with 'Asian'
})
```

In this example, the `value` of the index is set to "Asian" and the `condition` is set to "more than or equal".
This allows you to query all artist names starting with "Asian" where the index `name` begins with "Band."


### Querying with full compound index name

Finally, you can query the band Asian Spice House albums by release year as follows:

```js
skapi.getRecords({
    table: {name: 'Albums', access_group: 'public'},
    index: {
        name: 'Band.AsianSpiceHouse.year',
        value: 2010,
        condition: '>'
    }
}).then(response=>{
    console.log(response.list); // All albums by Asian Spice House released after 2010.
})
```

:::warning
When querying the child index names from the compound index, you need to specify the index respecting the hierarchy of the compound index name. 

From the example above, you cannot simply use **'Band.year'** as an index name to query by the year values.
You must provide the full **'Band.AsianSpiceHouse.year'** as an index name if you want to query the actual value of the index.
:::

## Fetching Index Information

Skapi tracks the index information in each table. You can fetch the index information using the [`getIndexes()`](https://docs.skapi.com/api-reference/database/README.html#getindex) method.

Index information is useful when you want to list all index names used in a table or find out the total number of the records indexed to that index name or average/total value of the index values.

The index information includes:

- `average_number`: The average of the number type values.
- `total_number`: The total sum of the number values.
- `number_count`: The total number of records with number as the index value.
- `average_bool`: The rate of true values for booleans.
- `total_bool`: The total number of true values for booleans.
- `bool_count`: The total number of records with boolean as the index value.
- `string_count`: The total number of records with string as the index value.
- `index_name`: The name of the index.


For example, let say we have a table called "VoteBoard" that lets user upload records with a compound index name such as "Vote.Beer".
The index value will be boolean.
```js
skapi.postRecord(null, {
    table: {name: 'VoteBoard', access_group: 'public'},
    index: {
        name: 'Vote.Beer',
        value: true // or false
    }
})
```

Then you can fetch information about the **"Vote.Beer"** index in the **"VoteBoard"** table to find out the rating of **"Vote.Beer"**.

```js
skapi.getIndexes({
    table: 'VoteBoard', // Table name is required
    index: 'Vote.Beer' // index name
}).then(response => {
    console.log(response.list[0]); // index information of "Vote.Beer"
});
```

For more detailed information on all the parameters and options available with the [`getIndexes()`](https://docs.skapi.com/api-reference/database/README.html#getindex) method, 
please refer to the API Reference below:

### [`getIndexes(query, fetchOptions?): Promise<DatabaseResponse<Index>>`](https://docs.skapi.com/api-reference/database/README.html#getindex)

### Querying index value

Suppose you want to list all the indexes in a table and order them in a specific order.
Maybe there is multiple indexes such as "Vote.Beer", "Vote.Wine", "Vote.Coffee" and so on.
And you may want to know the rating of each index and order them by the rating.
In that case, you can use the `order.by` parameter in the `query`.

Example below lists all indexes under the compound index `Vote.` in the **"VoteBoard"** table ordered by `average_bool` from highest value:

:::warning
`order.by` only works on the values under the index name.
If your index name is a [compound index name](#compound-index-names),
You should declare the parent index of your child compound index name.

For example, if you expect to get the index `Vote.Beer` from ordering `average_bool`, you should declare the parent index `Vote.` in the `index` parameter.
:::

```js
let config = {
    ascending: false
};

let query = {
    table: 'VoteBoard',
    index: 'Vote.',
    order: {
        by: 'average_bool'
    }
};

skapi.getIndexes(query, config).then(response => {
    console.log(response.list); // List of indexes ordered from high votes.
});
```

Note that in the `config` object, the `ascending` value is set to `false`.

So the list will be ordered in *descending* order from highest votes to lower votes.

For example, to list all indexes under "Vote." that has higher votes then 50% and order them by `average_bool`, you can do the following:

```js
let config = {
    ascending: false
};

let query = {
    table: 'VoteBoard',
    index: 'Vote.',
    order: {
        by: 'average_bool',
        value: 0.5,
        condition: '>'
    }
};

skapi.getIndexes(query, config).then(response => {
    console.log(response.list); // List of votes that rates higher then 50%, ordered from high votes.
});
```


<br>


# Tags

Tags are additional information that can be associated with a record. They provide additional search criteria to perform more detailed queries, either on their own or in combination with indexes. Unlike indexes, tags cannot be queried with conditional operators.

To add tags to a record, you can use the `config.tags` parameter in the [`postRecord()`](https://docs.skapi.com/api-reference/database/README.html#postrecord) method.
This parameter accepts a string or an array of strings or string with comma separated values, allowing you to add multiple tags to a single record.

## Adding Tags to a Record

Here's an example of how to add tags to a record:

```js
let record = {
    title: "Dukkha",
    artist: "Asian Spice House",
    tracks: 7
};

let config = {
    table: {name: 'Albums', access_group: 'public'},
    index: {
        name: "year",
        value: 2023
    },
    tags: ['Indie', 'Experimental']
}

skapi.postRecord(record, config);
```

:::danger
Tags should NOT have special characters. Only allowed special characters are: [ ] ^ _ ` : ; < = > ? @ and white space.
:::

## Querying Records by Tag

You can also utilize tags in your queries.

Example below lists albums released after 2020, that have the tag 'Experimental'.

```js
skapi.getRecords({
    table: {name: 'Albums', access_group: 'public'},
    index: {
        name: "year",
        value: 2020,
        condition: '>'
    },
    tag: 'Experimental'
}).then(response=>{
    // List of albums released after 2020, that have the tag 'Experimental'.
    console.log(response.list);
});
```

:::tip
To query multiple tags simultaneously, you can make multiple API calls and await them all at once in Javascript Promise.all().
Then you may sort the data as you wish.

Following Example below shows fetching albums with the tag 'Experimental' OR 'Indie'
:::

```js
let experimental = skapi.getRecords({
    table: {name: 'Albums', access_group: 'public'},
    tag: 'Experimental'
})

let indie = skapi.getRecords({
    table: {name: 'Albums', access_group: 'public'},
    tag: 'Indie'
});

Promise.all([experimental, indie]).then(res=>{
    let experimental = res[0].list;
    let indie = res[1].list;

    let or_list = {};
    for(let r of experimental) or_list[r.record_id] = r;
    for(let r of indie) or_list[r.record_id] = r;

    // 'Experimental' OR 'Indie' in { [record_id]: record } format.
    console.log(or_list);
})
```

## Fetching Tag Information

You can fetch all tags used in a table with [`getTags()`](https://docs.skapi.com/api-reference/database/README.html#gettags).

```js
skapi.getTags({
    table: 'MyTable'
}).then(response=>{
    console.log(response); // List of all tags in table named 'MyTable'
})
```
For more detailed information on all the parameters and options available with the [`getTags()`](https://docs.skapi.com/api-reference/database/README.html#gettags) method, 
please refer to the API Reference below:

### [`getTags(query, fetchOptions?): Promise<DatabaseResponse<Tag>>`](https://docs.skapi.com/api-reference/database/README.html#gettags)

### Querying tags

You can also query tags that meets the `condition`.

```js
skapi.getTags({
    table: 'MyTable',
    tag: 'A',
    condition: '>'
}).then(response=>{
    console.log(response); // List of all tags starting from 'A' in table named 'MyTable'
})
```

In this example, the condition property is set to `>`, and `table` is set to `A`.  This query will return the table names that come after table 'A' in lexographic order, such as 'Ab', 'B', 'C', 'D' and so on.


<br>

# Referencing

Users can reference another record when uploading a new record.

When records are referenced, users can retrieve records based on the one being referenced.

This feature is useful for building a discussion board similar to Reddit, comment section, rating board, tracking purchased items, like buttons etc.

To reference a record, you'll need to specify the `record_id` or `unique_id` of the record you want to reference in the `reference` parameter in the `config` object.

## Uploading a Record to be Referenced

First lets upload a record to be referenced.

```js
let data = {
    post: "What do you think of this post?"
};

let config = {
    unique_id: 'unique id of the post',
    table: { name: 'Posts', access_group: 'public' }
};

let referenced_record_id;

skapi.postRecord(data, config).then(response => {
    // The original post has been uploaded. Now, users can upload another record that references it.
    referenced_record_id = response.record_id;  // Record ID of the record to be referenced.
});
```

## Creating a Referencing Record

Note that we have uploaded a record to be referenced,
we can use the uploaded record's ID in `reference` when uploading a comment record.

```js
let commentRecord = {
    comment: "I like it!"
};

let commentConfig = {
    table: { name: 'Comments', access_group: 'public' },
    reference: referenced_record_id
};

skapi.postRecord(commentRecord, commentConfig);
```

## Fetching References

Now you can query all the records that references the original record by passing the record ID in the `reference` parameter in [`getRecords()`](https://docs.skapi.com/api-reference/database/README.html#getrecords) method.:

```js
skapi.getRecords({
    table: { name: 'Comments', access_group: 'public' },
    reference: referenced_record_id,
}).then(response => {
    console.log(response.list);  // Array of comments of the reference record.
});
```

:::tip
A user cannot reference a record with a higher access group or 'private' access.
However, if the uploader has granted the private access of the record to the user, the user will be able to reference it.
:::

:::danger
Users who have private access granted to a record will also have access to all other private/higher access group records that is referenced.
To avoid unintended sharing of private records, do not permit users to upload a private record that references another record.
:::

## Creating a Referencing Record with Unique ID

When uploading a record, you can also reference the record using the unique ID.

```js
skapi.postRecord({
    comment: "I like it!"
}, {
    table: { name: 'Comments', access_group: 'public' },
    reference: 'unique id of the post'
});
```


## Fetching References with Unique ID

If the reference record has a unique ID setup, you can also fetch records based on the unique ID of the record being referenced.

```js
skapi.getRecords({
    table: { name: 'Comments', access_group: 'public' },
    reference: 'unique id of the post'
}).then(response => {
    console.log(response.list);  // Array of records in 'Comments' table referencing the record with the unique ID.
});
```

More on unique ID can be found [here](https://docs.skapi.com/database/unique-id.md).


## Using reference to fetch certain user's post

You can also query all the records posted by certain user giving a `user_id` as a value of `reference` parameter.

```js
skapi.getRecords({
    table: { name: 'Comments', access_group: 'public' },
    reference: 'user-id-whose-post-you-want'
}).then(response => {
    console.log(response.list);  // Array of records in 'Comments' table posted by a certain user
});
```


## Removing a reference

To remove a reference, set the the `reference` parameter to `null` when updating the record.

```js
skapi.postRecord(undefined, {
    record_id: 'record_id_of_the_comment_to_remove',
    reference: null
}).then(record => {
    console.log(record);  // The reference has been removed.
});
```

## Reference source settings in [`postRecord()`](https://docs.skapi.com/api-reference/database/README.html#postrecord)

When uploading record via [`postRecord()`](https://docs.skapi.com/api-reference/database/README.html#postrecord), you can set restrictions on referencing from other records using additional parameters in `source`.

- `source.referencing_limit`: Allowed maximum number of times that other records can reference the uploading record.
  This is useful if you are building ticketing system where only a certain number of people purchase a ticket.
  If this parameter is set to `null`, the number of references is unlimited. The default value is `null`.
  Set `referencing_limit` to `0` to prevent others to reference the uploading record.

- `source.prevent_multiple_referencing`: If set to `true`, single user will be allowed to reference this record only once.
  This is useful for building a voting system where each users are allowed to vote only once.

- `source.can_remove_referencing_records`: If set to `true`, the owner of the record has an authority to remove the referencing records.
  When the owner removes the record, all the referenceing records will be removed.
  This can be useful when you want to build a discussion board where the owner can remove the comments.
  The default value is `false`.

- `source.only_granted_can_reference`: When set to `true`, only the user who has granted private access to the record can reference this record.

- `source.referencing_index_restrictions`: You can set list of restrictions on the index values of the referencing record.
  This is useful when you want to restrict the referencing record to have certain index names and values.
  This only affects referencing records that has an index.


## Referencing Index Restrictions

You can set restrictions on the index values of the referencing record.
This is useful when you want to restrict the referencing record to have certain index values.
This only affects referencing records that has an index.

For example, you can set the index value range so the total rating value does not exceed a certain value.

Example below shows how you can build a review board where only **10** people are allowed to rate **1** to **5** and each user can only rate once.

It is important to set restrictions on index values for cases like rating systems where you want to prevent users from posting malicious data to mess up your index informations.

```js
let pollPost = skapi.postRecord({
    title: `How would you rate Stan Getz, João Gilberto's album "Getz/Gilberto"?`,
    description: "Only 10 people are allowed to vote"
}, {
    unique_id: 'Review board of GetzGilberto',
    table: { name: 'ReviewBoard', access_group: 'public' },
    source: {
        prevent_multiple_referencing: true,
        referencing_limit: 10,
        referencing_index_restrictions: [
            {
                name: 'Review.Album.GetzGilberto',
                value: 1,
                range: 5
            }
        ]
    }
})
```

As shown in the example above, the `referencing_index_restrictions` parameter is an array of objects that contains the following properties:

- `name`: The name of the index value. (required)
- `value`: The value of the index. (optional)
- `range`: The range of the index value. (optional)
- `condition`: The condition of the index value. (optional)

You can set many index restrictions by adding more objects to the array.

When the index restriction is set, the referencing record must have the same index name with same typed value and within the specified range.

If all optional parameters not set, the referencing record must have the same index name.

If `value` is set, the referencing record must have the same index name with the same value.

If `range` is set, the referencing record must have the same index name with the value within the specified range.

If `condition` is set, the referencing record must have the same index name with the index value that satisfies the condition to the `value`.
For example, if you want your referencing record's index value to be less than **5**, you can set the parameter as shown below:

```js
let pollPost = skapi.postRecord({
    title: `How would you rate Stan Getz, João Gilberto's album "Getz/Gilberto"?`,
    description: "Only 10 people are allowed to vote"
}, {
    unique_id: 'Review board of GetzGilberto',
    table: { name: 'ReviewBoard', access_group: 'public' },
    source: {
        prevent_multiple_referencing: true,
        referencing_limit: 10,
        referencing_index_restrictions: [
            {
                name: 'Review.Album.GetzGilberto',
                value: 5,
                condition: '<'
            }
        ]
    }
})
```

`condition` can be one of the following: `=`, `!=`, `>`, `<`, `>=`, `<=`.

`condition` cannot be used with `range`.


## Creating a Poll with Restricted Referencing

Now people can post a review by referencing the **pollPost**:

```js
// Now only 10 people can post references for this record
skapi.postRecord({
    comment: "This rocks! I'd give 4.5 out of 5!"
}, {
    table: { name: 'ReviewBoard', access_group: 'public' },
    reference: 'Review board of GetzGilberto',
    index: {
        name: 'Review.Album.GetzGilberto',
        value: 4.5
    }
});
```

Note that the "Review.Album.GetzGilberto" `index` uses a `value` of type `number` so you can later retrieve the average rating and total sum of the values.


## Powerful Ways to Use Reference Records

1. Discussion board
   
   The owner of the reference record has all access to the referencing records.
   
   Meaning, the user who uploaded the source of the reference record can have authority to delete the referencing records owned by other users, have access to all access levels referencing records including private records.

   This is useful when you want to build a discussion board where the owner can remove the comments, let users post private comments to reference owner.
   
2. Rating/voting system
   
   You can set restrictions on the number of times a record can be referenced, prevent multiple referencing for each users, and restrict the index values of the referencing record.

   While Skapi database works as schema-less in nature, you can use this characteristic to have more control over how your users can post data to your service.

3. Sharing private data between limited users
   
   If the reference record has a private access group, only the users who have access to the reference record can access the referencing records.


<br>

# Subscription

## Posting Feeds

Skapi database includes a subscription feature.

This feature lets users subscribe to other users and view feed records from those subscriptions.

Uploaders can also block specific users from accessing subscription-level records.

You can let users upload records to the subscription table by setting `table.subscription.is_subscription_record` to `true` in [`postRecord()`](https://docs.skapi.com/api-reference/database/README.html#postrecord) parameters.

When `table.subscription.upload_to_feed` is set to `true`, subscribed users can fetch feed records from all subscribed users at once using [`getFeed()`](https://docs.skapi.com/api-reference/database/README.html#getfeed).

### Subscription options overview

The `table.subscription` object controls how a record behaves for subscribers.

-   `is_subscription_record`: Marks the record as subscription-scoped. Subscribed users can retrieve these records with [`getRecords()`](https://docs.skapi.com/api-reference/database/README.html#getrecords) (using `table.subscription`).
-   `upload_to_feed`: Publishes the record to subscriber feeds so it can appear in [`getFeed()`](https://docs.skapi.com/api-reference/database/README.html#getfeed).
-   `notify_subscribers`: Sends notifications to subscribers when the record is uploaded.
-   `feed_referencing_records`: Includes records that reference this record in subscriber feeds.
-   `notify_referencing_records`: Sends notifications when referencing records are created or updated.

You can enable these options independently or combine them depending on your product behavior.

For example:

-   Use `is_subscription_record: true` without `upload_to_feed` when records should be accessible to subscribers but not appear in feed timelines.
-   Use `upload_to_feed: true` for timeline-style content.
-   Add `notify_subscribers: true` when users should receive immediate alerts.

This is useful for social apps where users follow each other, consume feed content, and track subscriber counts.

Assume **user A** uploads a record in table `Posts` as a subscription record.

```js
// User A uploads a subscription record.
skapi.postRecord(null, {
    table: {
        name: "Posts",
        access_group: "authorized",
        subscription: {
            is_subscription_record: true
        },
    },
});
```

You can also configure full feed and notification behavior at upload time:

```js
skapi.postRecord({
    title: "New post",
    body: "Hello subscribers!"
}, {
    table: {
        name: "Posts",
        access_group: "authorized",
        subscription: {
            is_subscription_record: true,
            upload_to_feed: true,
            notify_subscribers: true,
            feed_referencing_records: false,
            notify_referencing_records: false
        }
    }
});
```

To allow other users to access records that require a subscription, they must first subscribe to the uploader using the [`subscribe()`](https://docs.skapi.com/api-reference/database/README.html#subscribe) method:

:::warning
Anonymous (unsigned) users cannot create subscription records.
:::

## Subscribing

:::warning
User must be logged in to call this method.
:::

Assume **user B** wants to access **user A**'s subscription records. **User B** must first subscribe to **user A**.

```js
// User B subscribes to user A.
skapi.subscribe({
    user_id: "user_id_of_user_A",
    get_feed: true, // Required to use getFeed() later.
});
```

:::tip
To use the [`getFeed()`](https://docs.skapi.com/database/subscription.html#getting-feed) method later, be sure to include `get_feed: true` in [`subscribe()`](https://docs.skapi.com/api-reference/database/README.html#subscribe).

`table.subscription.upload_to_feed` must be set to `true` for records to appear in subscriber feeds.
:::

:::warning
Subscribers will not get feeds that are posted prior to the subscription.
:::

Once **user B** subscribes to **user A**, **user B** can access records in that subscription table.

```js
// User B can now retrieve records that require subscription to user A.
skapi
    .getRecords({
        table: {
            name: "Posts",
            access_group: "authorized",
            subscription: "user_id_of_user_A",
        },
    })
    .then((response) => {
        console.log(response.list); // All records user A uploaded to the Posts table as subscription records.
    });
```

:::tip
Subscriber counts are tracked in the [UserPublic](https://docs.skapi.com/api-reference/data-types/README.html#userpublic) object,
which you can retrieve with [`getUsers()`](https://docs.skapi.com/api-reference/database/README.html#getusers).
:::


### [`subscribe(option): Promise<Subscription>`](https://docs.skapi.com/api-reference/database/README.html#subscribe)

## Unsubscribing

:::warning
User must be logged in to call this method.
:::

Users can unsubscribe using [`unsubscribe()`](https://docs.skapi.com/api-reference/database/README.html#unsubscribe).

```js
// User 'B'
skapi.unsubscribe({
    user_id: "user_id_of_user_A",
});
```

For full parameter and option details, see the API reference below:

### [`unsubscribe(option): Promise<string>`](https://docs.skapi.com/api-reference/database/README.html#unsubscribe)

:::warning
After unsubscribing, subscription information may need some time to update (usually almost immediate).
:::

## Blocking and Unblocking Subscribers

:::warning
User must be logged in to call this method.
:::

One benefit of the subscription feature is that users can block specific users from subscription-level records.
However, subscriptions are not a full security boundary.

Even when a user is blocked, they may still access files attached to records unless those files are private or use a higher access group.

Blocked users cannot access subscription-level record data.

To block a subscriber, call [`blockSubscriber()`](https://docs.skapi.com/api-reference/database/README.html#blocksubscriber):

### Blocking a Subscriber

```js
// User A blocks user B from subscription records.
skapi
    .blockSubscriber({
        user_id: "user_id_of_user_B",
    })
    .then((res) => {
        // User B no longer has access to user A's subscription records.
    });
```

For full parameter and option details, see the API reference below:

### [`blockSubscriber(option): Promise<string>`](https://docs.skapi.com/api-reference/database/README.html#blocksubscriber)

### Unblocking a Subscriber

```js
// User A unblocks user B.
skapi
    .unblockSubscriber({
        user_id: "user_id_of_user_B",
    })
    .then((res) => {
        // User B can access user A's subscription records again.
    });
```

For full parameter and option details, see the API reference below:

### [`unblockSubscriber(option): Promise<string>`](https://docs.skapi.com/api-reference/database/README.html#unblocksubscriber)

## Listing Subscriptions

The [`getSubscriptions()`](https://docs.skapi.com/api-reference/database/README.html#getsubscriptions) method retrieves subscription information from the database.

### Parameters

-   `subscriber`: User ID of the subscriber.
-   `subscription`: User ID of the user being subscribed to.
-   `blocked`: Set to `true` to return only blocked subscriptions.

Provide at least one of `params.subscriber` or `params.subscription`.

### Examples

```js
/**
 * Retrieve all subscriptions where user B is the subscriber.
 */
skapi
    .getSubscriptions({
        subscriber: "userB_user_id",
    })
    .then((response) => {
        console.log(response.list);
    });

/**
 * Retrieve all subscriptions where user A is being subscribed to.
 */
skapi
    .getSubscriptions({
        subscription: "userA_user_id",
    })
    .then((response) => {
        console.log(response.list);
    });

/**
 * Check whether user B is subscribed to user A.
 */
skapi
    .getSubscriptions({
        subscriber: "userB_user_id",
        subscription: "userA_user_id",
    })
    .then((response) => {
        console.log(response.list?.[0]);
    });
```

For full parameter and option details, see the API reference below:

### [`getSubscriptions(params, fetchOptions?): Promise<DatabaseResponse<Subscription>>`](https://docs.skapi.com/api-reference/database/README.html#getsubscriptions)

## Getting Feed

[`getFeed()`](https://docs.skapi.com/api-reference/database/README.html#getfeed) retrieves the current user's feed.

It returns feed records from users the current user has subscribed to.

You can use this method to build a feed page for the user.

### Examples

First, user A must upload a record to the feed.

```js
// User A uploads a record to the feed.
skapi.postRecord(null, {
    table: {
        name: 'Posts',
        access_group: 'authorized',
        subscription: {
            upload_to_feed: true
        }
    }
});
```

Then user B, who is subscribed to user A, can fetch feed records from subscribed users.

```js
/**
 * User B retrieves all feed records with access_group: "authorized".
 */
skapi.getFeed({ access_group: 'authorized' }).then((response) => {
    console.log(response.list); // Feed records from subscribed users in the 'authorized' access group.
});
```

:::danger
If the record was NOT uploaded with `table.subscription.upload_to_feed` set to `true`, it will not show up in the feed.
:::

:::danger
When a user unsubscribes from another user, all past records from that user will no longer show in their feed.
:::

:::warning
Users only see feed records from the time they subscribed onward.
:::

### [`getFeed(params?, fetchOptions?): Promise<DatabaseResponse<RecordData>>`](https://docs.skapi.com/api-reference/database/README.html#getfeed)


<br>

# Skapi HTML Database Full Example

This is a HTML example for building photo uploading application using Skapi's database features.

This example demonstrates complex database examples such as:

-   Posting an image file and description
-   Post as a private data
-   Posting comments
-   Like button
-   List post in order of most liked, most recent, most commented
-   Seach post via hashtag
-   Fetching more data (Pagination)
-   Subscribing to users and fetching subscription feeds

...All in a single HTML file - **welcome.html**

Users must login to post and fetch uploaded photos.

## Recommended VSCode Extention

For HTML projects we often tend to use element.innerHTML.

So we recommend installing innerHTML string highlighting extention like one below:

[es6-string-html](https://marketplace.visualstudio.com/items/?itemName=Tobermory.es6-string-html)

## Download

Download the full project [Here](https://github.com/kkb75281/skapi-database-html-template/archive/refs/heads/main.zip)

Or visit our [Github page](https://github.com/kkb75281/skapi-database-html-template)

## How To Run

Download the project, unzip, and open the `index.html`.

### Remote Server

For hosting on remote server, install package:

```
npm i
```

Then run:

```
npm run dev
```

The application will be hosted on port `3300`

:::danger Important!

Replace the `SERVICE_ID` value to your own service in `service.js`

<!-- Currently the service is running on **Trial Mode**. -->

<!-- **All the user data will be deleted every 14 days.** -->

You can get your own service ID from [Skapi](https://www.skapi.com)

:::

## Example

Below is part of the repository code, showing how it handles complex database scenarios.

Because this is only a portion of the full repository and does not include supporting files such as `service.js` and `main.css`, direct copy-and-paste will not work.

**welcome.html**

```html
<!DOCTYPE html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script src="service.js"></script>
<link rel="stylesheet" href="main.css" />

<main>
    <h1>Login Success</h1>
    <p id="WelcomeMessage"></p>
    <a href="logout.html">Logout</a>

    <script>
        /*
            Get user profile and display it on the page,
            Set user variable to use it later.
        */
        let user = skapi.getProfile().then(u => {
            if (u) {
                let welcomeMessage = document.getElementById("WelcomeMessage");
                if (welcomeMessage) {
                    welcomeMessage.innerHTML = `Welcome, ${u.name || u.email || u.user_id}!`;
                }
            }
            return u;
        });

        /*
            The following function disableForm() is for disabling the form while the user is submitting.
            It can be useful if you want to prevent the user from editing the form while it's uploading.
            You will see this function being used in the form submission thoughout the project.
        */
        function disableForm(form, disabled) {
            form.querySelectorAll('input').forEach(input => {
                input.disabled = disabled;
            });
            form.querySelectorAll('textarea').forEach(textarea => {
                textarea.disabled = disabled;
            });
            form.querySelectorAll('a').forEach(a => {
                return disabled ? a.setAttribute('disabled', '') : a.removeAttribute('disabled');
            });
        }
    </script>

    <br>
    <br>

    <!--
        Following <section> will allow the user to upload a post.
        When the user clicks the "Update" button, we will call the skapi.postRecord() function.
        skapi.postRecord() function will upload the image and description, tags to the database.
        When successful, it will prepend the post to the top of the page.
        When unsuccessful, it will show an alert with the error message.
    -->
    <section style="padding: 20px 0;">
        <script>
            function postPhoto(form, event) {
                disableForm(form, true);
                postButton.value = '0%';

                // Following params object will be passed to the skapi.postRecord() method.
                let params = {
                    table: {
                        name: 'posts',
                        access_group: input_private.checked ? 'private' : 'authorized', // Depending on the checkbox, we will set the access_group to private or authorized.
                        subscription: {
                            upload_to_feed: true // We will upload the post to the feed so subscribed users can also fetch all the posts from all the users they subscribed at once.
                        }
                    },
                    source: {
                        allow_multiple_reference: false // For each posts, we will allow posting only one reference per user. This will allow us to restrict users to like only once per post.
                    },
                    progress: p => {
                        // When the file is uploading, we will set the value of the postButton to the progress percentage.
                        // The p object will have the status of the upload, the current file, and the progress percentage.
                        if (p.status === 'upload' && p.currentFile) {
                            postButton.value = `${Math.floor(p.progress)}%`;
                        }
                    },
                    tags: input_tags.value || null
                }

                // Following code will upload the post to the database.
                skapi.postRecord(event, params).then(async r => {
                    // If the section_posts was initially empty, we will set it to empty string.
                    if (section_posts.innerHTML === 'No posts found.') {
                        section_posts.innerHTML = '';
                    }

                    /*
                        When the post is successful, we will prepend the post to the top of the page.
                        We will call createArticleContent() function that we will declare later.
                    */
                    section_posts.prepend(await createArticleContent(r));

                    // We will reset the form and set the image preview to empty.
                    img_preview.src = '';
                    form.reset();

                })
                    .catch(err => alert(err.message))
                    .finally(() => {
                        // Finally, we will set the value of the postButton to 'Update' and enable the form.
                        postButton.value = 'Post';
                        disableForm(form, false);
                    });
            }
        </script>
        <style>
            /*
                Following class will make the element clickable.
            */
            .clickable {
                cursor: pointer;
                color: blue;
            }

            .clickable:active {
                color: purple;
            }

            /*
                Following will style the image element.
                When the user clicks on the image preview, it will open the file input.
                If the user does not select a file, it will show "Choose Image" text.
            */
            img {
                width: 100%;
            }

            #img_preview[src=""]::before {
                content: '[Click to Select Photo]';
                font-weight: bold;
                color: #007bff;
                text-decoration: underline;
            }
        </style>
        <form onsubmit="postPhoto(this, event)">
            <h1>Post Photo</h1>
            <label for='input_fileInput' class="clickable">
                <img id='img_preview' src="">
            </label>

            <br><br>

            <small>Description (required)</small><br>
            <input name="description" placeholder="Describe the picture." required></input>

            <small>Tags (optional)</small><br>
            <input id='input_tags' pattern="[a-zA-Z0-9 ,]+"
                title="Only alphanumeric characters, spaces, and commas are allowed"
                placeholder="tag1, tag2, ..."></input>

            <br>

            <small>
                <label>
                    <input id="input_private" type="checkbox" name="private" value="private"> Make This Post Private
                </label>
            </small>

            <br><br>

            <input id='input_fileInput' type="file" name="pic" accept="image/*" hidden required>
            <input id='postButton' type="submit" value="Post">

            <style>
                /*
                        Following <style> will disable the submit button when the file input is empty.
                    */
                #input_fileInput:invalid+input[type=submit] {
                    pointer-events: none;
                    opacity: 0.5;
                }
            </style>

            <!--
                    Following <script> will preview the image file that the user will upload.
                    When the user selects a file, it will read the file and set the src attribute of the image tag to the data url(base64) of the file.
                -->
            <script>
                input_fileInput.onchange = function () {
                    let file = this.files[0];
                    if (!file) {
                        img_preview.src = '';
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
    </section>

    <!--
        Following <nav> will allow the user to filter the posts.
        When the user clicks the "Most Recent" link, it will show the most recent posts.
        When the user clicks the "Most Liked" link, it will show the most liked posts.
        When the user clicks the "Most Comment" link, it will show the most commented posts.
        When the user clicks the "My Posts" link, it will show the posts that the user has uploaded.
        When the user clicks the "My Private" link, it will show the posts that the user has uploaded and set to private.
        We will use the hash(#) in the url to identify how the posts should be fetched.
    -->
    <br><br>

    <nav style="text-align: center;">
        <a href="welcome.html">Most Recent</a>
        |
        <a href="#mostliked">Most Liked</a>
        |
        <a href="#mostcomment">Most Comment</a>
        |
        <a href="#myposts">My Posts</a>
        |
        <a href="#myprivate">My Private Posts</a>
        |
        <a href="#feed">Feed</a>

        <style>
            nav>a {
                display: inline-block;
            }
        </style>
    </nav>

    <br>

    <!--
        Following <section> will show the posts.
    -->
    <section id="section_posts" style="text-align: center;"></section>

    <br>

    <div style='text-align: center'>
        <!--
            Following <button> will allow the user to fetch more posts.
            If there are more posts to fetch, it will enable the button.
            When the user clicks the button, it will call the getPosts() function.
            We will declare the getPosts() function and onclick event later.
        -->
        <button id="fetchMoreButton" disabled>Fetch More Posts</button>
    </div>
    <br>
    <br>
    <br>
    <br>

    <style>
        /*
            #section_posts is the <section> tag that will show the posts.
            It will be empty when the page loads.
            Following css will allow us to show the loading message while the posts are being fetched.
        */
        #section_posts:empty::before {
            content: 'Fetching posts...';
            display: block;
        }

        article {
            text-align: left;
            border: solid;
            vertical-align: top;
            width: 100%;
            margin: 8px auto;
            padding: 8px;
            box-sizing: border-box;
        }

        /*
            Following css will style the LIKE button.
            data-like attribute will show the like status of the post.
            When the user clicks the LIKE button, it will change the data-like attribute to '❤️' or '🩶'.
        */
        article .like::before {
            content: attr(data-like);
        }


        /*
            Following css will style the Subscribe button.
            data-subscribe attribute will show the subscribtion status of the user.
            When the user clicks the Subscribe button, it will change the data-subscribe attribute value to 'Subscribe' or 'Subscribed'.
            The color and font-weight will change based on the value of the data-subscribe attribute.
        */
        article .subscribe::before {
            content: attr(data-subscribe);
        }

        article .subscribe[data-subscribe='Subscribe']::before {
            color: #007bff;
            font-weight: bold;
        }

        article .subscribe[data-subscribe='Subscribed']::before {
            color: #28a745;
            font-weight: bold;
        }
    </style>
</main>
<script>
    /*
        Following variable fetchQuery will be later set and used as a parameter for getRecords().
    */
    let fetchQuery = {
        // table: {
        //     name: 'posts',
        //     access_group: 'authorized' || 'private'
        // }
    };

    /*
        Following variable subscription_list will be used to store the subscription status of the user.
    */
    let subscription_list = {
        // user_id: subscription object // if the user is not subscribed value is false
    }

    /*
        Following variable likeId will be used to store the users likeed record_id.
        We will use this to save the users like status.
        This way we can show the user if they have liked the post or not, and also save unnecessary API calls.
    */
    let likeId = {};

    /*
        Following variable userInfo will be used to store the fetched user information of the post uploader.
        We will use this to save unnecessary API calls.
    */
    let userInfo = {};

    /*
        Following function will fetch the user information of the uploader.
    */
    async function getUserInfo(user_id) {
        // If the user information is not fetched, we will fetch the user information by the user_id.
        if (!userInfo[user_id]) {
            let user = await skapi.getUsers({
                searchFor: 'user_id',
                value: user_id
            });

            if (user.list.length === 0) {
                return {
                    email: 'User not found',
                    name: 'User not found',
                    picture: ''
                };
            }

            userInfo[user_id] = user.list[0];
        }

        return userInfo[user_id];
    }

    /*
        Following function will fetch posts from the database.
    */
    async function getPosts(fetchMore = true) {
        // While the user is trying to fetch posts, we will disable the fetchMore button.
        fetchMoreButton.disabled = true;

        /*
            In skapi.getRecords() method, we are passing the fetchQuery variable that we have declared above.
            In the second argument we are setting the fetch option to fetch 4 posts per call.
            The ascending is set to false so that we can get the most recent posts, or the most liked posts, most commented posts depending on the query.
            When the ascending is set to false, Skapi database fetches the records in descending order.
            The fetchMore option will allow us to fetch more posts when the user clicks the fetchMore button.
        */
        let posts = await skapi.getRecords(fetchQuery, { ascending: false, limit: 4, fetchMore });

        /*
            When fetchMore is false, it means the user will be fetching the posts from the start.
            When the user is trying to fetch post from the start, we should clear the #section_posts.
            If there are no posts, we will show "No posts found." message.
        */
        if (!fetchMore) {
            section_posts.innerHTML = '';
            if (posts.list.length === 0) {
                section_posts.innerHTML = 'No posts found.';
                return;
            }
        }

        /*
            When there is post, it will show the posts by creating the html elements and appending them to the #section_posts.
            The createArticleContent() function will create the html elements, and we will declare it later.
        */
        let articles = await Promise.all(posts.list.map(p => createArticleContent(p)))
        for (let articleEl of articles) {
            section_posts.appendChild(articleEl);
        }

        /*
            When there are no more posts to fetch, we will disable the fetchMore button.
            posts.endOfList will be true when there are no more posts to fetch.
            When there are more posts to fetch, it will enable the fetchMore button.
            We will also set the onclick event of the fetchMore button to call the getPosts() function.
            The reason we are setting the onclick event manually is
            because there is a case where the user may want to fetch post ordered by most commented,
            which we may have to call getMostCommentedPost() function instead. (we will write a script for this later)
        */
        fetchMoreButton.disabled = posts.endOfList;
        fetchMoreButton.onclick = () => getPosts();
    }

    async function getFeed(fetchMore = true) {
        // While the user is trying to fetch posts, we will disable the fetchMore button.
        fetchMoreButton.disabled = true;

        let posts = await skapi.getFeed({
            access_group: 'authorized',
        }, { ascending: false, limit: 4, fetchMore });

        if (!fetchMore) {
            section_posts.innerHTML = '';
            if (posts.list.length === 0) {
                section_posts.innerHTML = 'No posts found.';
                return;
            }
        }

        let articles = await Promise.all(posts.list.map(p => createArticleContent(p)))
        for (let articleEl of articles) {
            section_posts.appendChild(articleEl);
        }

        fetchMoreButton.disabled = posts.endOfList;
        fetchMoreButton.onclick = () => getFeed();
    }

    /*
        Following function will create the html elements for the post.
    */
    async function createArticleContent(p) {
        // p is the post object.

        /*
            Following code will get the user id of the logged in user.
            The user variable is declared on the <script> tag above where we check if the user is logged in.
            The user variable is a promise that will resolve to the user information.
        */
        let logged_user_id = (await user).user_id;

        let record_id = p.record_id;
        let uploader = await getUserInfo(p.user_id); // get user information of the post uploader

        /*
            Following variable html will compose the html string for the post.
            Notice that we are using the record_id of the post as the part of the element ID in various places.
            Will use these element id to identify the element later.

            If you are using VSCode, you can use the following extension to get syntax highlighting for html strings.
            https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html
        */
        let html = /*html*/`

            <span style='font-weight:bold'>${uploader.name}</span>

            <!--
                Following <strong> tag will allow the user to subscribe to the uploader.
                When the user clicks the <strong> element, it will call the subscribe() function.
                We will declare the subscribe() function later.
            -->
            <strong
                class='clickable subscribe strong_subs-${p.user_id}'
                onclick='subscribe(this, "${p.user_id}")'
                data-subscribe=''>
            </strong>

            <!--
                Following <button> will allow the user to delete the post.
                When the user clicks the <button>, it will show a confirmation dialog.
                If the user confirms, it will delete the post from the database.
                This will not show if the post is not uploaded by the uploader.
            -->
            <button
                style='float:right; width:auto; margin:0; margin-bottom:10px;'
                onclick='
                    let del = confirm("Would you like to remove this post?");
                    if(del) {
                    this.closest("article").remove();
                    if(!section_posts.innerHTML) {
                        section_posts.innerHTML = "No posts found.";
                    }
                    skapi.deleteRecords({record_id: "${record_id}"});
                }'
                ${logged_user_id !== p.user_id ? "hidden" : ""}>Delete Post
            </button>

            <br>

            <small>Posted: ${new Date(p.updated).toLocaleString()}</small>

            <br>

            <!--
                Following <img> will show the image of the post.
                All the files uploaded to the database are stored in the bin.
                The endpoint of the image is in bin.pic[0].url.
            -->
            <img src='${p.bin.pic[0].url}'>

            <br>

            <small>Liked: <span id="span_likedCount-${p.record_id}">${p.referenced_count}</span></small>

            <!--
                Following <strong> tag will allow the user to like the post.
                When the user clicks the <strong> element, it will call the like() function.
                We will declare the like() function later.
            -->
            <strong
                class='clickable like'
                style='float:right'
                id='strong_like-${p.record_id}'
                onclick='like("${p.record_id}")'
                data-like=''>
            </strong>

            <!--
                Following <p> will show the description of the post.
            -->
            <p>
                ${p.data?.description}
            </p>

            <!--
                Following <small> will show the tags of the post.
                When the user clicks the tag, it will redirect the user to the welcome.html page with the tag in the hash.
            -->
            <small>${p.tags ? 'Tags: ' + p.tags.map(t => `<a href='welcome.html#tag=${t}'>${t}</a>`).join(', ') : ''}</small>

            <!--
                Following <small> will show the comment count of the post.
                We will later fetch the comment count and set the textContent of the <span> tag.
            -->
            <small>Comments (<span id='span_commentCount-${p.record_id}'>0</span>)</small>

            <br><br>

            <!--
                Following <form> will allow the user to add a comment to the post.
                When the user submits the form, it will call the addComment() function.
                We will declare the addComment() function later.
            -->
            <form onsubmit='addComment(event, "${p.record_id}");' style='display:flex; flex-wrap:wrap; gap:8px; max-width:100%'>
                <input name='comment' placeholder='Write Comment' style="width: 0; flex-grow:9;">
                <input type='submit' style="width: unset; flex-grow:1;">
            </form>

            <!--
                Following <div> will show the comments of the post.
                We will later fetch the comments and append the <div> to the <div> tag.
            -->
            <div id='div_commentSection-${p.record_id}'></div>

            <!--
                Following <small> will allow the user to fetch more comments.
                When the user clicks the <small> element, it will call the getComments() function.
                We will declare the getComments() function later.
            -->
            <small
                style="text-align:right"
                class='clickable'
                id='small_moreComments-${p.record_id}'
                onclick='getComments("${p.record_id}", true).then(c=>{
                    for (let div of c.commentDivs) {
                        document.getElementById("div_commentSection-" + "${record_id}").appendChild(div);
                    }
                    document.getElementById("small_moreComments-${record_id}").style.display = c.endOfList ? "none" : "block";})'
                >Show More Comments</small>`;

        if (subscription_list.hasOwnProperty(p.user_id)) {
            let subbed = subscription_list[p.user_id];
            if (subbed) {
                html = html.replace("data-subscribe=''", 'data-subscribe="Subscribed"');
            } else {
                html = html.replace("data-subscribe=''", 'data-subscribe="Subscribe"');
            }
        }

        else if (p.user_id !== logged_user_id) {
            if(subscription_list[p.user_id]) {
                html = html.replace("data-subscribe=''", 'data-subscribe="Subscribed"');
            } else {
                if(subscription_list.hasOwnProperty(p.user_id)) {
                    html = html.replace("data-subscribe=''", 'data-subscribe="Subscribe"');
                }
                else {
                    skapi.getSubscriptions({
                        subscriber: logged_user_id,
                        subscription: p.user_id
                    }).then((response) => {
                        if (response.list.length) {
                            subscription_list[p.user_id] = response.list[0];
                            Array.from(document.querySelectorAll(`.strong_subs-${p.user_id}`)).forEach(el => { el.setAttribute('data-subscribe', 'Subscribed') });
                        } else {
                            subscription_list[p.user_id] = false;
                            Array.from(document.querySelectorAll(`.strong_subs-${p.user_id}`)).forEach(el => { el.setAttribute('data-subscribe', 'Subscribe') });
                        }
                    });
                }
            }
        }

        /*
            Following code will create the <article> tag and set the innerHTML to the html string we have composed above.
            We will also set the id of the <article> tag to the record_id of the post.
            We will use this id to identify the post.
        */
        let article = document.createElement('article');
        article.innerHTML = html;
        article.id = record_id;

        /*
            Following function getComments() will fetch the comments of the post and return the html elements.
            When resolved We will append the comments to the article element.
            We will declare the getComments() function later.
        */
        getComments(record_id).then(c => {
            for (let div of c.commentDivs) {
                article.querySelector(`#div_commentSection-${record_id}`).appendChild(div);
            }
            article.querySelector(`#small_moreComments-${record_id}`).style.display = c.endOfList ? 'none' : 'block';
        });

        /*
            Following code will fetch the comment count of the post and set the textContent of the <span> tag.
            Since indexed values and record counts are tracked, we are using skapi.getIndexes() method to get the comment count.
        */
        skapi.getIndexes({
            table: 'comments',
            index: 'comment.' + record_id
        }).then(commentInfo => {
            if (commentInfo.list.length) {
                let count = commentInfo.list[0].number_of_records;
                if (count) {
                    let commentCount = article.querySelector('#span_commentCount-' + record_id)
                    commentCount.innerHTML = count;
                }
            }
        });

        /*
            Following code will fetch the like status of the post and set the textContent of the <strong> tag.
            The likes will be stored in the reference of the post.
            We will use the skapi.getRecords() method to get the like status.
        */
        skapi.getRecords({
            table: { name: 'likes', access_group: 'public' },
            index: {
                name: '$user_id',
                value: logged_user_id
            },
            reference: record_id
        }).then(myLike => {
            if (myLike.list.length) {
                likeId[record_id] = myLike.list[0].record_id;
            }
            let likeButton = article.querySelector(`#strong_like-${record_id}`);
            likeButton.textContent = '';
            likeButton.setAttribute('data-like', myLike.list.length ? '❤️' : '🩶');
        });

        return article;
    }

    /*
        Following function getComments() will fetch the comments of the post and return the html elements.
        When resolved, we are appending the comments to the article element above.
        We are using the skapi.getRecords() method to get the comments.
        The comments are uploaded using compond index names. (ex: comment.1234)
    */
    async function getComments(record_id, fetchMore = false) {
        // get recent 4 comments (initial fetch)
        let comments = await skapi.getRecords(
            {
                table: {
                    name: 'comments',
                    access_group: "authorized"
                },
                index: {
                    name: 'comment.' + record_id,
                    value: true
                }
            },
            {
                ascending: false,
                limit: 4,
                fetchMore
            }
        );

        let commentDivs = [];
        for (let c of comments.list) {
            let div = document.createElement('div');
            let commenter = await getUserInfo(c.user_id);

            let commentHtml = /*html*/ `
                <small>
                    <strong>${commenter.name}</strong>
                    <span>(${new Date(c.updated).toLocaleString()})</span>
                    <br>
                    <span>${c.data.comment}</span>
                </small>`;
            div.innerHTML = commentHtml;
            commentDivs.push(div);
        }

        return { commentDivs, endOfList: comments.endOfList };
    }

    /*
        Following function addComment() will add a comment to the post.
        When the user submits the form, it will call the addComment() function.
        We are using the skapi.postRecord() method to upload the comment.
        The comments are uploaded using compond index names using the record ID. (ex: comment.record_id)
        This way we can get the comments of a post and also fetch the posts ordered by most commented.
    */
    async function addComment(event, record_id) {
        let userInfo = await user;

        disableForm(event.target, true);
        let postComment = await skapi.postRecord(event, {
            table: {
                name: "comments",
                access_group: "authorized"
            },
            index: {
                name: "comment." + record_id,
                value: true
            }
        }).finally(() => disableForm(event.target, false));

        // Following code will update the comment count of the post.
        let commentCounter = document.getElementById(`span_commentCount-${record_id}`);
        if (commentCounter) {
            commentCounter.textContent = Number(commentCounter.textContent) + 1;
        }

        event.target.reset();

        let div = document.createElement('div');
        let commentHtml = /*html*/ `
        <small>
            <strong>${userInfo.name}</strong>
            <span>(${new Date(postComment.updated).toLocaleString()})</span>
            <br>
            <span>${postComment.data.comment}</span>
        </small>`;

        div.innerHTML = commentHtml;
        document.getElementById(`div_commentSection-${record_id}`).prepend(div);
    }

    /*
        Following function like() will allow the user to like the post.
        When the user clicks the <strong> element, it will call the like() function.
        We are using the skapi.postRecord() method to upload the like.
        The likes will be stored in the reference of the post.
        This way we can get the like count of a post and fetch the posts ordered by most liked.
        Also, using the reference, we can restrict the user to like only once per post.
    */
    async function like(record_id) {
        let likeButton = document.getElementById(`strong_like-${record_id}`);
        let likedStatus = likeButton.getAttribute('data-like');
        let likedCount = Number(document.getElementById(`span_likedCount-${record_id}`).textContent);

        if (likedStatus === '🩶') {
            likeId[record_id] = (await skapi.postRecord(null, {
                table: { name: 'likes', access_group: 'public' },
                reference: record_id
            })).record_id;
            likeButton.setAttribute('data-like', '❤️');
            likedCount++;
        }
        else {
            await skapi.deleteRecords({ record_id: likeId[record_id] });
            likeButton.setAttribute('data-like', '🩶');
            likedCount--;
        }

        likeButton.textContent = '';
        document.getElementById(`span_likedCount-${record_id}`).textContent = likedCount.toString();
    }

    /*
        Following function subscribe() will allow the user to subscribe to the uploader.
        When the user clicks the <strong> element, it will call the subscribe() function.
        We are using the skapi.subscribe() method to subscribe the user.
        If the user is already subscribed, it will unsubscribe the user.
        The subscription status will be stored in the subscription_list variable that we have declared above.
    */
    async function subscribe(el, user_id) {
        let data_subscribe = el.getAttribute('data-subscribe');
        if (!data_subscribe) {
            return;
        }
        if (data_subscribe === 'Subscribe') {
            // If the user is not subscribed, we will subscribe the user.
            skapi.subscribe({
                user_id: user_id,
                get_feed: true // We will set get_feed to true so that the user can fetch the posts from the feed.
            }).then(sub => {
                subscription_list[user_id] = sub
            });

            let className = `strong_subs-${user_id}`;
            // If the user is not subscribed, we will set the data-subscribe attribute to 'Subscribed'.
            Array.from(document.querySelectorAll(`.${className}`)).forEach(el => {
                el.setAttribute('data-subscribe', 'Subscribed');
            });
        } else {
            // If the user is already subscribed, we will unsubscribe the user.
            skapi.unsubscribe({
                user_id: user_id,
            });

            subscription_list[user_id] = false;
            // If the user is already subscribed, we will set the data-subscribe attribute to 'Subscribe'.
            Array.from(document.querySelectorAll(`.strong_subs-${user_id}`)).forEach(el => {
                el.setAttribute('data-subscribe', 'Subscribe');
            });
        }
    }

    /*
        Following function initialFetch() will fetch the posts when the page loads, or when the url hash changes.
        We will use the location.hash to identify how the posts should be fetched.
    */
    async function initialFetch() {
        let hash = location.hash ? location.hash.slice(1) : '';

        switch (hash) {
            case 'mostliked':
                /*
                    For most liked posts, we will use the indexed values to get the most liked posts.
                    We can get posts ordered by referenced count by setting the reserved index name to '$referenced_count'.
                    Argument of getPosts() is set to false so that we can fetch the most liked posts from the start.
                */
                fetchQuery = {
                    table: {
                        name: 'posts',
                        access_group: 'authorized'
                    },
                    index: {
                        name: '$referenced_count',
                        value: 0,
                        condition: '>'
                    }
                };

                getPosts(false);
                break;

            case 'mostcomment':
                /*
                    For most commented posts, we will use getMostCommentedPost() function.
                    We will declare the getMostCommentedPost() function below.
                    Argument of getMostCommentedPost() is set to false so that we can fetch the most commented posts from the start.
                */
                getMostCommentedPost(false);
                break;
            case 'myposts':
                /*
                    For my posts, we will use the indexed values to get the posts uploaded by the logged in user.
                    We can get posts uploaded by the logged in user by setting the reserved index name to '$user_id'.
                */
                fetchQuery = {
                    table: {
                        name: 'posts',
                        access_group: 'authorized'
                    },
                    index: {
                        name: '$user_id',
                        value: (await user).user_id,
                    }
                };

                getPosts(false);
                break;
            case 'myprivate':
                /*
                    For my private posts, we can get posts uploaded by the logged in user by setting the reserved index name to '$user_id'.
                    And the table access_group is set to private.
                */
                fetchQuery = {
                    table: {
                        name: 'posts',
                        access_group: 'private'
                    },
                    index: {
                        name: '$user_id',
                        value: (await user).user_id,
                    }
                };

                getPosts(false);
                break;

            case 'feed':
                /*
                    For feed, we will use the getFeed() function.
                    We will declare the getFeed() function below.
                    Argument of getFeed() is set to false so that we can fetch the feed from the start.
                */
                getFeed(false);
                break;

            default:
                /*
                    By default, we will fetch all the post under the table 'posts'.
                    The posts is Skapi database are always ordered by the time it was uploaded.
                    Since we have set the fetch option ascending to false, we will get the most recent posts.
                */
                fetchQuery = {
                    table: {
                        name: 'posts',
                        access_group: 'authorized'
                    }
                };

                /*
                    If the hash starts with 'tag=', we will fetch the posts with the tag.
                    We will use the location.hash to identify how the posts should be fetched.
                    And we will set the fetchQuery.tag to the tag value.
                */
                if (hash.startsWith('tag=')) {
                    fetchQuery.tag = hash.slice(4);
                }

                getPosts(false);
                break;
        }
    }

    /*
        Following function getMostCommentedPost() will fetch the most commented posts.
    */
    async function getMostCommentedPost(fetchMore = true) {
        fetchMoreButton.disabled = true;

        /*
            We are using skapi.getIndexes() method to get all the index information of the comment.
            Since we are using the compond index names, we can get index information ordered by total index value under the compond index name 'comment.'.
            Ascending is set to false so that we can get the index information ordered by most commented posts.
        */
        let commentIndex = await skapi.getIndexes(
            {
                table: 'comments',
                index: 'comment.',
                order: {
                    by: 'total_bool'
                }
            },
            {
                ascending: false,
                limit: 4,
                fetchMore
            }
        );

        if (!fetchMore) {
            // clear the section_posts when fetching posts with fetchMore = false.
            section_posts.innerHTML = '';
            if (commentIndex.list.length === 0) {
                section_posts.innerHTML = 'No posts found.';
                return;
            }
        }

        /*
            Following code will get each comment post by the record_id.
            We know the record_id from the compond index name: (comment.record_id).
            Then we will call the createArticleContent() function that we have declared above to create the html elements.
            Lastly, we will append the html elements to the #section_posts.
        */
        let posts = await Promise.all(commentIndex.list.map(i => skapi.getRecords({
            record_id: i.index.split('.')[1],
        }).catch(err => null)));

        let articles = await Promise.all(posts.map(p => p ? createArticleContent(p.list[0]) : null));

        for (let articleEl of articles) {
            if (articleEl) {
                section_posts.appendChild(articleEl);
            }
        }

        /*
            When there are no more posts to fetch, we will disable the fetchMore button.
            When there are more posts to fetch, we will enable the fetchMore button.
            We will also set the onclick event of the fetchMore button to call the getMostCommentedPost() function.
        */
        fetchMoreButton.disabled = commentIndex.endOfList;
        fetchMoreButton.onclick = () => getMostCommentedPost();
    }

    /*
        We will call the initialFetch() function when the page loads, or when the url hash changes.
    */
    initialFetch();
    window.addEventListener('hashchange', initialFetch);
</script>
```


<br>

# Using Third-Party APIs

You can connect Skapi to third-party APIs (services outside your app), such as AI services, map services, payment services, or your own external APIs.

If the API requires a client secret, use [`clientSecretRequest()`](https://docs.skapi.com/api-reference/api-bridge/README.html#clientsecretrequest) to send secure `POST` or `GET` requests.

Because client secrets must never be exposed in frontend code, register each secret key securely in Skapi.

## Registering Client Secret Keys

1. In your Skapi service dashboard, click **Client Secret Key**.
2. Click **+** at the top-right of the table.
3. In the form, enter:
  - **Name:** A label for this key. You will use this value as `clientSecretName` in [`clientSecretRequest()`](https://docs.skapi.com/api-reference/api-bridge/README.html#clientsecretrequest).
  - **Client Secret Key:** The actual secret value. Use `$CLIENT_SECRET` in your `data`, `params`, `headers`, or `url` fields where the real secret should be inserted.
  - **Locked:** Controls access to this key. If **Locked** is enabled, only logged-in users can use it. If disabled, any user can use it.

4. Click **Save**.


## Sending Requests to Third-Party APIs

After you save your client secret key, use [`clientSecretRequest(params)`](https://docs.skapi.com/api-reference/api-bridge/README.html#clientsecretrequest) to send secure requests to third-party APIs.

The example below sends a `POST` request to a third-party API using a key saved as `YourSecretKeyName`. It places `$CLIENT_SECRET` in the `Authorization` header.

```js [JS]
skapi.clientSecretRequest({
    clientSecretName: 'YourSecretKeyName',
    url: 'https://third.party.com/api',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer $CLIENT_SECRET'
    }
})
```

The `params` object supports these fields:

- `clientSecretName`: Name of the client secret key saved in your Skapi service.
- `url`: Third-party API endpoint URL.
- `method`: HTTP method (`GET` or `POST`).
- `headers`: Request headers as key-value pairs.
- `data`: Request body as key-value pairs (used when `method` is `POST`).
- `params`: Query parameters as key-value pairs (used when `method` is `GET`).


:::warning
When using `clientSecretRequest()`, include the `$CLIENT_SECRET` placeholder in at least one of these values: `data`, `params`, `headers`, or `url`.
:::

For full parameter details, see the API reference below:

### [`clientSecretRequest(params): Promise<any>`](https://docs.skapi.com/api-reference/api-bridge/README.html#clientsecretrequest)


## OpenAI Images API

In this example, you will use Skapi to call the [OpenAI Images API](https://developers.openai.com/api/reference/resources/images/methods/generate) securely.

First, we review the OpenAI API request format. Then we build the same request with `clientSecretRequest()`.

#### Prerequisites

1. Create an OpenAI account and get your API secret key from [platform.openai.com](https://platform.openai.com/).
2. Save your OpenAI API secret key on the **Client Secret Key** page in Skapi.

  For this example, save the key with the name `openai`.

  You will use this name as `clientSecretName` in the request.

#### Understanding the API call

According to the API documentation, the endpoint is:

```
POST https://api.openai.com/v1/images/generations
```

This means the request uses `POST` to `https://api.openai.com/v1/images/generations`.

The curl example looks like this:

``` bash
curl https://api.openai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-image-1.5",
    "prompt": "A cute baby sea otter",
    "n": 1,
    "size": "1024x1024"
  }'
```

From this example, the request needs these headers:

- `Content-Type: application/json`
- `Authorization: Bearer $OPENAI_API_KEY`

The request body should include fields such as `model`, `prompt`, `n`, and `size`.

`$OPENAI_API_KEY` is a placeholder for your OpenAI secret key.

Because secrets must not be exposed in frontend code, use [`clientSecretRequest()`](https://docs.skapi.com/api-reference/api-bridge/README.html#clientsecretrequest) and pass `Bearer $CLIENT_SECRET` instead:
::: code-group

```html [Form]
<form onsubmit="skapi.clientSecretRequest(event).then(r=>console.log(r))">
  <input name="clientSecretName" hidden value="openai">
  <input name="url" hidden value="https://api.openai.com/v1/images/generations">
  <input name="method" hidden value="POST">
  <input name="headers[Content-Type]" hidden value='application/json'>
  <input name="headers[Authorization]" hidden value="Bearer $CLIENT_SECRET">
  <input name="data[model]" hidden value="gpt-image-1.5">
  <input name="data[n]" hidden type='number' value="1">
  <input name="data[size]" hidden value="1024x1024">
  <textarea name='data[prompt]' required>A cute baby sea otter</textarea>
  <input type="submit" value="Generate">
</form>
```

```js [JS]
skapi.clientSecretRequest({
    clientSecretName: 'openai',
    url: 'https://api.openai.com/v1/images/generations',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer $CLIENT_SECRET'
    },
    data: {
        model: "gpt-image-1.5",
        "prompt": "A cute baby sea otter",
        n: 1,
        size: "1024x1024"
    }
})
```
:::
The example above shows how to build request headers and body data for a secure OpenAI API call.
Use `$CLIENT_SECRET` in the `Authorization` header and set `clientSecretName` to `openai`, which is the key name saved in your Skapi dashboard.

When the request runs, Skapi replaces `$CLIENT_SECRET` with your stored secret key and returns the response from the OpenAI API.

<br>

# What is Realtime Connection?

Skapi's realtime connection features include WebSocket data exchange, WebRTC, and notifications.

These technologies enable real-time chat, data transfer, and audio/video communication between users.

Realtime messaging lets you transfer JSON data between users through either WebSocket connections or WebRTC.

Skapi WebRTC provides peer-to-peer connections that can transfer large amounts of data quickly, making it suitable for use cases such as video chat.

The notification feature allows your web apps and PWAs to receive real-time notifications.

<br>

# Connecting to Realtime

Skapi's realtime connection let's you transfer JSON data between users in realtime.
This is useful for creating chat applications, notifications, etc.

## Creating Connection

:::warning
User must be logged in to call this method
:::

Before you start sending realtime data, you must create a realtime connection.
You can create a realtime connection by calling [`connectRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#connectrealtime) method.

For more detailed information on all the parameters and options available with the [`connectRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#connectrealtime) method,
please refer to the API Reference below:

### [`connectRealtime(RealtimeCallback): Promise<WebSocket>`](https://docs.skapi.com/api-reference/realtime/README.html#connectrealtime)

Once the connection is established, you can start receiving realtime data from the [RealtimeCallback](https://docs.skapi.com/api-reference/data-types/README.html#realtimecallback).

```js
let RealtimeCallback = (rt) => {
    // Callback executed when there is data transfer between the users.
    /**
    rt = {
      type: 'message' | 'error' | 'success' | 'close' | 'notice' | 'private' | 'reconnect' | 'rtc:incoming' | 'rtc:closed';
      message?: any;
      connectRTC?: (params: RTCReceiverParams, callback: RTCEvent) => Promise<RTCResolved>; // Incoming RTC
      sender?: string; // user_id of the sender
      sender_cid?: string; // scid of the sender
      sender_rid?: string; // group of the sender
      code?: 'USER_LEFT' | 'USER_DISCONNECTED' | 'USER_JOINED' | null; // code for notice messages
      connectRTC?: (params: RTCReceiverParams, callback: RTCEvent) => Promise<RTCResolved>; // Incoming RTC calls.
      hangup?: () => void; Function to reject incoming RTC commection.
    }
    */
    console.log(rt);
};

skapi.connectRealtime(RealtimeCallback);
```

In the example above, the [RealtimeCallback](https://docs.skapi.com/api-reference/data-types/README.html#realtimecallback) function is executed whenever data is transferred between users.

When the callback runs, it receives a message object with the following properties:

-   `type` Shows the type of the received message as below:

    -   "message": When there is data broadcasted from the realtime group.

    -   "error": When there is an error. Usually websocket connection has an error and will be disconnected.

    -   "success": When the connection is established. This may fire on initial connection, or when the reconnection attempt is successful.

    -   "close": When the connection is intentionally closed by the user.

    -   "notice": When there is a notice. Usually notice users when the user in a realtime group has joined, left, or being disconnected.

    -   "private": When there is private data transfer between the users.

    -   "reconnect": When there is reconnection attempt. This happens after user leaves the browser tab or device screen is lock for certain amount of time, and the user comes back to the application. The websocket can disconnect when the application is left unfocus for some period of time.

    -   "rtc:incoming": When there is incoming WebRTC call.
    -   "rtc:closed": When the WebRTC connection is closed.

-   `message` is the data passed from the server. It can be any JSON data.
-   `sender` is the user ID of the message sender. It is only available when `type` is "message" or "private".
-   `sender_cid` is the connection ID of the message sender. It can be used to track the sender's connected device.
-   `sender_rid` is the group name of the received message.
-   `code` is a string identifier for notice messages.
-   `connectRTC`: Incoming RTC calls. Can answer by executing the callback.
-   `hangup`: Function to reject incoming RTC connection.

## Closing Connection

You can close the realtime connection by calling [`closeRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#closerealtime) method.

```js
skapi.closeRealtime();
```

When the connection is successfully closed, [RealtimeCallback](https://docs.skapi.com/api-reference/data-types/README.html#realtimecallback) will trigger with following callback data:

```ts
{
  type: 'close',
  message: 'WebSocket connection closed.'
}
```

For more detailed information on all the parameters and options available with the [`closeRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#closerealtime) method,
please refer to the API Reference below:

### [`closeRealtime(): Promise<void>`](https://docs.skapi.com/api-reference/realtime/README.html#closerealtime)

:::tip
When the user closes the tab or refresh the browser, the connection will be closed automatically.
And when the connection is closed user will be removed from the group.
:::


<br>

# Sending Realtime Data

Once the realtime connection is established, users can start sending realtime data to another user.

## Sending Data to a User

User can send any JSON data over to any users by using [`postRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#postrealtime) method.

For more detailed information on all the parameters and options available with the [`postRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#postrealtime) method,
please refer to the API Reference below:

### [`postRealtime(message, recipient, notification?): Promise<{ type: 'success', message: string }>`](https://docs.skapi.com/api-reference/realtime/README.html#postrealtime)

:::warning
The receiver must also be connected to the realtime connection to receive the data.
:::

::: code-group

```html [Form]
<form
    onsubmit="skapi.postRealtime(event, 'recipient_user_id').then(u=>console.log(u))"
>
    <input name="msg" required /><input type="submit" value="Send" />
</form>
```

```js [JS]
skapi
    .postRealtime({ msg: "Hello World!" }, "recipient_user_id")
    .then((res) => console.log(res));
```

:::

Example above shows how to send realtime data to a user with an id: 'recipient_user_id' (Should be the user_id of user's profile).

[`postRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#postrealtime) method can be used directly from the form element as shown in the example above.
[`postRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#postrealtime) takes two arguments:

-   `message`: The data to be sent to the recipient. It can be any JSON parsable data, or a SubmitEvent object.
-   `recipient`: The user ID of the recipient or the name of the group the user have joined.
-   `notification`: Notification to send with the realtime message, or notification to use when user is not connected to realtime. See [`Sending Notifications`](https://docs.skapi.com/notification/send-notifications.html#sending-notifications)

When the message is sent successfully, the method will return the following object:

```ts
{
  type: 'success',
  message: 'Message sent.'
}
```

## Receiving Data from a User

On the receiver’s side, the message is delivered to the [RealtimeCallback](https://docs.skapi.com/api-reference/data-types/README.html#realtimecallback) defined when creating the realtime connection with [`connectRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#connectrealtime). The callback receives an object whose `type` property is set to `"private"`.

Below is an example of how the other user receives the sent data from the RealtimeCallback function:

```js
let RealtimeCallback = (rt) => {
    /**
    {
        "type": "private",
        "message": {
            "msg": "Hello World!",
        },
        "sender": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "sender_cid": "cid:xx-xxxxxxxxxxxx=",
        "sender_rid": null,
        "code": null
    }
    */
};

skapi.connectRealtime(RealtimeCallback);
```


<br>

# Realtime Groups

Realtime groups are used to send realtime data to multiple users at once.
This can be used to create group chats, group notifications, etc.

## Joining a Group

Users can join a group by calling [`joinRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#joinrealtime) method.

params argument takes the following parameters:

-   `group`: The name of the group to join.

Group name can be anything you want.
If the group does not exist, it will be created automatically, otherwise the user will be joined to the existing group.

```js
skapi.joinRealtime({ group: "HelloWorld" }).then((res) => {
    console.log(res.message); // Joined realtime message group: "HelloWorld".
});
```

When the user is joined to the group successfully, the method will return the following object:

```ts
{
  type: 'success',
  message: 'Joined realtime message group: "HelloWorld".'.
}
```

For more detailed information on all the parameters and options available with the [`joinRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#joinrealtime) method,
please refer to the API Reference below:

### [`joinRealtime(params): Promise<{ type: 'success', message: string }>`](https://docs.skapi.com/api-reference/realtime/README.html#joinrealtime)

:::tip
Even if the user has joined the group, they can still receive realtime data sent individually to them.
:::

## Sending Data to a Group

Once the user has joined the group, they can send any JSON data to it using the [`postRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#postrealtime) method. The message (JSON data) will be broadcast to all users in the group.

The example below shows how to send realtime data to a group named "HelloWorld":

::: code-group

```html [Form]
<form
    onsubmit="skapi.postRealtime(event, 'HelloWorld').then(u=>console.log(u))"
>
    <input name="msg" required /><input type="submit" value="Send" />
</form>
```

```js [JS]
skapi
    .postRealtime({ msg: "Hello World!" }, "HelloWorld")
    .then((res) => console.log(res));
```

:::

For more detailed information on all the parameters and options available with the [`postRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#postrealtime) method,
please refer to the API Reference below:

## Receiving Data from the Group

When a message (JSON data) is broadcast in the group, every user receives it as an argument to the RealtimeCallback defined when creating the realtime connection with [`connectRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#connectrealtime). The callback receives an object whose `type` property is set to `"message"`.

The example below shows how other users receive the broadcasted data from the group named "HelloWorld" via [RealtimeCallback](https://docs.skapi.com/api-reference/data-types/README.html#realtimecallback) function:

```js
let RealtimeCallback = (rt) => {
    /**
    {
        "type": "message",
        "message": {
            "msg": "Hello World!",
        },
        "sender": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "sender_cid": "cid:xx-xxxxxxxxxxxx=",
        "sender_rid": "HelloWorld",
        "code": null
    }
    */
};

skapi.connectRealtime(RealtimeCallback);
```

### [`postRealtime(message, recipient, notification?): Promise<{ type: 'success', message: string }>`](https://docs.skapi.com/api-reference/realtime/README.html#postrealtime)

:::warning
The user must be joined to the group to send data to the group.
:::

## Leaving a Group

Also, if you want to leave the group, you can call [`joinRealtime(params)`](https://docs.skapi.com/api-reference/realtime/README.html#leaverealtime) method with a `params.group` value as empty `string` or `null`.

```js
skapi.joinRealtime({ group: null });
```

## Changing the Group

Users can join only one group at a time.
If you want your user to change groups, you can call [`joinRealtime(params)`](https://docs.skapi.com/api-reference/realtime/README.html#joinrealtime) method with a different `params.group` value.

```js
skapi.joinRealtime({ group: "Another Group Name" });
```

## Listing Groups

Users can get a list of realtime groups by calling [`getRealtimeGroups()`](https://docs.skapi.com/api-reference/realtime/README.html#getrealtimegroups) method.

Example below shows listing all groups existing in your service:

```js
skapi.getRealtimeGroups().then((res) => {
    console.log(res.list); // [{ group: 'HelloWorld', number_of_users: 1 }, ...]
});
```

You can search groups by the name.
Below example shows how to search group names that start with "Hello":

```js
skapi
    .getRealtimeGroups({ searchFor: "group", value: "Hello", condition: ">=" })
    .then((res) => {
        console.log(res.list); // [{ group: 'HelloWorld', number_of_users: 1 }, ...]
    });
```

You can also list groups that have more than 10 users:

```js
skapi
    .getRealtimeGroups({
        searchFor: "number_of_users",
        value: 10,
        condition: ">=",
    })
    .then((res) => {
        console.log(res.list); // [{ group: 'HelloUniverse', number_of_users: 11 }, ...]
    });
```

For more detailed information on all the parameters and options available with the [`getRealtimeGroups()`](https://docs.skapi.com/api-reference/realtime/README.html#getrealtimegroups) method,
please refer to the API Reference below:

### [`getRealtimeGroups(params?, fetchOptions?): Promise<DatabaseResponse<{ group: string; number_of_users: number; }>>`](https://docs.skapi.com/api-reference/realtime/README.html#getrealtimegroups)

## Listing Users in a Group

Users can get a list of users in a group by calling [`getRealtimeUsers()`](https://docs.skapi.com/api-reference/realtime/README.html#getrealtimeusers) method.

Example below shows listing all users in the "HelloWorld" group:

```js
skapi.getRealtimeUsers({ group: "HelloWorld" }).then((res) => {
    console.log(res.list); // [{user_id: 'user_a', cid: 'user_cid'}, ...]
});
```

You can also search users in the group by their user ID.
This is useful if you want to check if the user is in the group.

```js
skapi
    .getRealtimeUsers({ group: "HelloWorld", user_id: "user_a" })
    .then((res) => {
        console.log(res.list); // [{user_id: 'user_a', cid: 'user_cid'}]
    });
```

For more detailed information on all the parameters and options available with the [`getRealtimeUsers()`](https://docs.skapi.com/api-reference/realtime/README.html#getrealtimeusers) method,
please refer to the API Reference below:

### [`getRealtimeUsers(params?, fetchOptions?): Promise<DatabaseResponse<{ user_id:string; connection_id:string; }[]>>`](https://docs.skapi.com/api-reference/realtime/README.html#getrealtimeusers)


<br>

# WebRTC

Skapi makes WebRTC integration easy, allowing developers to quickly add real-time communication features to their applications.

WebRTC (Web Real-Time Communication) is a technology that enables peer-to-peer media and data streaming between two parties.
This can be used for video calls, voice calls, and data exchange, making it a versatile tool for various real-time communication needs.

:::danger HTTPS REQUIRED.
WebRTC only works in an HTTPS environment.
You need to set up an HTTPS environment when developing WebRTC features for your web application.

You can host your application on skapi.com or on your own servers.
:::

## Creating RTC Connection

To create an RTC connection, both parties must be online and connected to Realtime.

One user initiates the call with the other user's `cid` via [`connectRTC()`](https://docs.skapi.com/api-reference/realtime/README.html#connectrtc), and the other user receives an `rtc:incoming` event.

If media streaming is enabled, users must grant camera/microphone permission.

## Overall Flow

Before reading the full code, here is the call flow in plain language:

1. **Both users connect to Realtime**  
    Each browser starts a Realtime connection with [`connectRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#connectrealtime) and joins the same room with [`joinRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#joinrealtime).

2. **Users discover each other in the room**  
    When someone joins, Realtime sends a `USER_JOINED` notice via [RealtimeCallback](https://docs.skapi.com/api-reference/data-types/README.html#realtimecallback), which includes the user's connection info (`cid`).
    Both parties can also see each other's `connection ID (cid)` by calling [`getRealtimeUsers()`](https://docs.skapi.com/api-reference/realtime/README.html#getrealtimeusers).

3. **One user starts a call**  
    The caller uses the other user's `cid` with `connectRTC(...)` to begin WebRTC negotiation.

4. **The other user receives an incoming call**  
    The receiver gets an `rtc:incoming` event and can accept or reject.
    - If accepted, `connectRTC(...)` completes on the receiver side.
    - Both browsers request camera/microphone access if media is enabled.

5. **Media streams and connection events are handled**  
    - Local stream is shown in the local video element.
    - Remote stream arrives in the `track` event and is shown in the remote video element.
    - Connection lifecycle events (`connecting`, `connected`, `disconnected`, `failed`, `closed`) update UI and cleanup state.
    - Optional RTC data channel events (`open`, `message`, `close`, etc.) are handled in the same callback.

In short: **Realtime is used for signaling (who is online, incoming call events), and WebRTC is used for the actual peer-to-peer media/data connection.**


### 1. Basic UI Interface

Here we add video elements to display local and remote streams, and a simple dialog for incoming/outgoing calls.
The `call_dialog` &lt;dialog&gt; content is generated dynamically when an RTC call event occurs.

```html
<!-- skapi should be previously initialized... -->

<style>
    video {
        width: 320px;
        height: 240px;
        border: 1px solid black;
    }
</style>

<!-- Video elements for displaying local and remote media streams -->
<video id="localVideo" autoplay muted></video>
<video id="remoteVideo" autoplay hidden></video>

<!-- Dialog used for outgoing and incoming calls -->
<dialog id="call_dialog"></dialog>
```

### 2. Setting Up Realtime and RTC

Below is a simple example of setting up an RTC video call.

```js
let call = null; // This will later be set to the resolved RTC connection object.

// This RTCCallback is used in connectRTC() on both the calling and receiving sides.

function RTCCallback(e) {
    console.log("RTC Callback:", e);

    switch (e.type) {
        // RTC Events
        case "negotiationneeded":
            // RTC negotiation is needed. Send an offer.
            break;

        case "track":
            // Attach the incoming media stream to the remote video element.
            document.getElementById('remoteVideo').srcObject = e.streams[0];
            document.getElementById("remoteVideo").play();
            break;

        case "connectionstatechange":
            // RTC connection state

            if (
                e.state === "disconnected" ||
                e.state === "failed" ||
                e.state === "closed"
            ) {
                // RTC has disconnected. Hide the opponent video element.
                document.getElementById('remoteVideo').hidden = true;
                
            } else if (state === "connecting") {
                // Callback executed when the user is connected to RTC.
                // Show the opponent video element.
                document.getElementById('remoteVideo').hidden = false;
            }
            break;

        // Data Channel Events
        case "close":
            // Data channel is closed
            break;
        case "message":
            // Data channel message received from remote peer.
            console.log(`Message received from RTC data channel:`, e.data);
            break;
        case "open":
            // Data channel opened
            break;
        case "bufferedamountlow":
            // Data channel low buffer
            break;
        case "error":
            // Data channel error
            break;
    }
}

// Realtime event listener
// This callback listens for users joining the room.
function RealtimeCallback(rt) {
    if(rt.type === 'notice') {
        if(rt.code === 'USER_JOINED') {
            if(call) return;

            // When another user joins the room, start an RTC call.
            if(skapi.user.user_id !== rt.sender) {
                call = await skapi.connectRTC({cid: rt.sender_cid, media: { audio: true, video: true}}, RTCCallback);

                call_dialog.innerHTML = /*html*/`
                    <p>Outgoing call</p>
                    <button onclick="call.hangup(); call_dialog.close();">Reject</button>
                `;

                call_dialog.showModal(); // Display outgoing call dialog

                rtcConnection = await call.connection; // Save resolved RTC connection object
                document.getElementById('localVideo').srcObject = rtcConnection.media; // Show outgoing local media stream
            }
        }
    }

    if (rt.type === 'rtc:incoming') {
        // incoming RTC call
        call = rt;

        call_dialog.innerHTML = /*html*/`
            <p>Incoming call</p>
            <button onclick='
                call.connectRTC({ media: {audio: true, video: true} }, RTCCallback)
                    .then(rtc => {
                        rtcConnection = rtc; // Save resolved RTC connection object
                        document.getElementById("localVideo").srcObject = rtcConnection.media; // Show outgoing local media stream
                        call_dialog.close();
                    })
            '>Accept</button>
            <button onclick="call.hangup(); call_dialog.close();">Reject</button>
        `;

        call_dialog.showModal(); // Display incoming call dialog
    }

    else if (rt.type === 'rtc:closed') {
        // RTC connection is completely closed
        call = null;
    }
}

skapi.connectRealtime(RealtimeCallback); // Connect to Realtime
skapi.joinRealtime({ group: 'RTCCall' }); // Join a Realtime group
```

<br>

# Notifications

Skapi provides methods to manage push notifications, including subscribing, unsubscribing, and sending notifications. This guide explains how to implement push notifications using Skapi from the client side.

:::danger HTTPS REQUIRED.
Notifications only work in an HTTPS environment.
You need to set up HTTPS when developing notification features for your web application.

You can host your application on skapi.com or on your own servers.
:::

## Setting Up Service Worker

The first step for web push notifications is to set up a service worker. In this guide, we use a file named `sw.js` in the project folder. The service worker handles incoming notifications and user interactions in the background, so notifications can still arrive even when the site is closed. This file must exist in your project and be registered correctly, or push notifications will not work.

### sw.js
```js
self.addEventListener('push', function(event) {
    const data = event.data.json();
    const title = data.title || "Default Title";
    const options = {
        body: data.body || "Default Body",
        icon: 'icon-192x192.png',
        badge: 'icon-192x192.png'
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    let url = event.target.location.origin;
    event.waitUntil(
        clients.openWindow(url)
    );
});
```

## Subscribing to Notifications

To receive push notifications, users must subscribe first. This requires a VAPID key and a registered service worker. You can get the VAPID key by calling [`vapidPublicKey()`](https://docs.skapi.com/api-reference/realtime/README.html#vapidpublickey), then subscribe by calling [`subscribeNotification()`](https://docs.skapi.com/api-reference/realtime/README.html#subscribenotification).

### Steps:
1. Retrieve the VAPID key using [`vapidPublicKey()`](https://docs.skapi.com/api-reference/realtime/README.html#vapidpublickey).
2. Request notification permission from the user.
3. Add the service worker file (`sw.js`) to your project.
4. Register the service worker.
5. Subscribe to push notifications using `navigator.serviceWorker.pushManager.subscribe()`.
6. Send the subscription details to Skapi using [`subscribeNotification()`](https://docs.skapi.com/api-reference/realtime/README.html#subscribenotification).

### Code Example:
```js
/**
 * Converts a Base64 string into a Uint8Array, required for push subscriptions.
 * This function ensures correct padding and decoding.
 */
function urlBase64ToUint8Array(base64String) {
    // Ensure the Base64 string has the correct padding
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+") // Convert URL-safe characters back
        .replace(/_/g, "/");

    // Decode Base64 to binary
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    // Convert binary data into a Uint8Array
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
}

// Retrieve the VAPID public key from Skapi
const vapidResponse = await skapi.vapidPublicKey();
const vapid = vapidResponse.VAPIDPublicKey;

// Check if the browser supports service workers
if (!("serviceWorker" in navigator)) {
    alert("Service workers are not supported in this browser.");
    return;
}

// Request notification permission from the user
const permission = await Notification.requestPermission();
if (permission !== "granted") {
    alert("Permission not granted for notifications");
    return;
}

// Register the service worker (sw.js should handle push events)
const registration = await navigator.serviceWorker.register("/sw.js");

// Ensure the service worker is ready
await navigator.serviceWorker.ready;

// Subscribe to push notifications using the VAPID public key
const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true, // Ensures notifications are always visible to the user
    applicationServerKey: urlBase64ToUint8Array(vapid), // Convert VAPID key to Uint8Array
}).then(sub => sub.toJSON()); // Convert subscription object to JSON format

// Log the subscription object for debugging
console.log("Subscription object:", subscription);

// Send the subscription details to Skapi to store the user's push subscription
await skapi.subscribeNotification(subscription.endpoint, subscription.keys);
```

## Unsubscribing to Notifications

To stop receiving notifications, users must unsubscribe by calling [`unsubscribeNotification()`](https://docs.skapi.com/api-reference/realtime/README.html#unsubscribenotification) with the endpoint and keys.

### Steps:
1. Retrieve the current push subscription from `navigator.serviceWorker.ready.pushManager.getSubscription()`.
2. If a subscription exists, call `unsubscribe()` on it.
3. Notify Skapi by calling [`unsubscribeNotification()`](https://docs.skapi.com/api-reference/realtime/README.html#unsubscribenotification).

### Code Example:
```js
// Ensure the service worker is ready before interacting with push notifications
const registration = await navigator.serviceWorker.ready;

// Retrieve the current push subscription (if it exists)
const subscription = await registration.pushManager.getSubscription();

// Check if there is an active subscription
if (!subscription) {
    console.error("No subscription found"); // Log an error if the user is not subscribed
    return;
}

// Convert the subscription object to a plain JSON format
const subscriptionJSON = subscription.toJSON();

// Unsubscribe the user from push notifications
await subscription.unsubscribe();

// Inform Skapi to remove this subscription from its records
const response = await skapi.unsubscribeNotification(subscription.endpoint, subscriptionJSON.keys);
```

## Sending Notifications

You can let users send notifications to each other with [`postRealtime()`](https://docs.skapi.com/api-reference/realtime/README.html#postrealtime).
If the recipient is not connected to Realtime, set the `notification` argument to send a push notification message.

```js
skapi.postRealtime(
    { msg: "Hello World!" },
    'recipient_user_id',
    { 
        title: "New Message",
        body: "Someone sent you a message!"
    }
).then(res => console.log(res));
```

If the recipient has subscribed to the Push Notification API, they will receive the message set in the `notification` argument.

The example below shows how to send a notification regardless of whether the recipient is connected to Realtime. By setting `config.always` to `true`, a notification is always triggered for the recipient.

```js
skapi.postRealtime(
    { msg: "Hello World!" },
    'recipient_user_id',
    { 
        title: "New Message",
        body: "Someone sent you a message!",
        config: { always: true }
    }
).then(res => console.log(res));
```

## Sending Notifications (For Admins)

Admins can use the [`pushNotification()`](https://docs.skapi.com/api-reference/realtime/README.html#pushnotification) method to send notifications to users.
**Only admins** can use this method to send notifications to **all** users.
You can also target a specific user or multiple users by providing their IDs. If no user IDs are specified, the notification will be sent to all users who have subscribed to notifications in your system.

### Steps:
1. Call [`pushNotification()`](https://docs.skapi.com/api-reference/realtime/README.html#pushnotification) with the title and body.
2. Optionally, provide user IDs to send notifications to specific users.
3. If no user IDs are provided, the notification will be sent to all subscribers.

### Code Examples:
```js
skapi.pushNotification(
    { 
        title: "Hello",
        body: "Hi there!"
    }
); // Sends to all subscribers
```

```js
skapi.pushNotification(
    { 
        title: "Admin Alert",
        body: "Only for selected users"
    },
    ["user1", "user2"]
);
```


<br>

# Skapi HTML Chat Full Example

This is a HTML example for building basic chat application using Skapi's realtime features.

Users must login to post and fetch realtime messages.

This example features:

-   Creating, joining, and leaving chat rooms
-   Sending and receiving websocket messages
-   Fetching messengers info
-   Sending private messeges to user

All the main code is in **welcome.html**

## Recommended VSCode Extention

For HTML projects we often tend to use element.innerHTML.

So we recommend installing innerHTML string highlighting extention like one below:

[es6-string-html](https://marketplace.visualstudio.com/items/?itemName=Tobermory.es6-string-html)

## Download

Download the full project [Here](https://github.com/kkb75281/skapi-chat-html-template/archive/refs/heads/main.zip)

Or visit our [Github page](https://github.com/kkb75281/skapi-chat-html-template)

## How To Run

Download the project, unzip, and open the `index.html`.

### Remote Server

For hosting on remote server, install package:

```
npm i
```

Then run:

```
npm run dev
```

The application will be hosted on port `3000`

:::danger Important!

Replace the `SERVICE_ID` value to your own service in `service.js`

<!-- Currently the service is running on **Trial Mode**. -->

<!-- **All the user data will be deleted every 14 days.** -->

You can get your own service ID from [Skapi](https://www.skapi.com)

:::


## Example

Below is part of the repository code, showing how it handles more advanced chat app scenarios.

Because this is only a portion of the full repository and does not include supporting files such as `service.js` and `main.css`, you cannot copy and paste it directly.


**welcome.html**

```html
<!DOCTYPE html>
<meta charset="utf-8" />

<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="main.css" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<script src="service.js"></script>

<main>
    <div class="flex-wrap">
        <h1 id="WelcomeMessage"></h1>
        <a href="logout.html">Logout</a>
    </div>

    <script>
        /*
            Get user profile and display it on the page.
        */
        skapi.getProfile().then((u) => {
            if (u) {
                let welcomeMessage = document.getElementById("WelcomeMessage");
                if (welcomeMessage) {
                    welcomeMessage.innerHTML = `Welcome, ${
                        u.name || u.email || u.user_id
                    }!`;
                }

                let userInfo = document.getElementById("UserInfo");
                if (userInfo) {
                    userInfo.innerHTML = JSON.stringify(u, null, 2);
                }
            }
            return u;
        });

        let participants = {};
        let sendTo = null;

        let getUserInfo = async (user_id) => {
            if (!participants[user_id]) {
                // get user info from skapi if not already fetched
                // This is to avoid fetching the same user info multiple times.

                if (user_id === skapi.user.user_id) {
                    // If the user is the current user, return the current user info.
                    participants[user_id] = skapi.user;
                    return skapi.user;
                }

                let user = (
                    await skapi.getUsers({
                        searchFor: "user_id",
                        value: user_id,
                    })
                ).list?.[0];
                if (user) {
                    participants[user_id] = user;

                    // Append the user to the participants list
                    let strongTag = document.createElement("strong");
                    strongTag.id = user.user_id;
                    strongTag.innerText =
                        user.name || user.email || user.user_id;

                    let participantsList =
                        document.getElementById("participants");
                    participantsList.appendChild(strongTag);
                    participantsList.appendChild(document.createElement("br"));

                    // Add event listener to the user name to open the private message dialog.
                    // This is to avoid adding the event listener to the current user.
                    strongTag.classList.add("clickable");
                    strongTag.onclick = (e) => {
                        console.log({ e });
                        sendTo = user;
                        document.getElementById("privateMsgTo").innerText =
                            sendTo.name || sendTo.email || sendTo.user_id;
                        document.getElementById("privateMsgSender").showModal();
                    };
                }
            }

            return participants[user_id];
        };

        let RealtimeCallback = async (rt) => {
            // Callback executed when there is data transfer between the users.
            /**
            rt = {
                type: 'message' | 'private' | 'error' | 'success' | 'close' | 'notice',
                message: '...',
                ...
            }
            */
            console.log(rt);
            if (rt.type === "private") {
                // Private message

                if (rt.sender === skapi.user.user_id) {
                    // If the sender is the current user, do nothing.
                    return;
                }

                let msgSender = await getUserInfo(rt.sender);
                let username =
                    msgSender.name || msgSender.email || msgSender.user_id;

                let privateMsgFrom = document.getElementById("privateMsgFrom");
                privateMsgFrom.innerHTML = username;

                let privateMsg = document.getElementById("privateMsg");
                privateMsg.innerHTML = rt.message.msg;

                document.getElementById("privateMsgDialog").showModal();
            }
            if (rt.type === "message") {
                // Append the message to the chatbox
                let chatbox = document.getElementById("chatMessages");
                if (chatbox) {
                    let user_id = rt.sender;
                    let user = await getUserInfo(user_id);
                    let username = user.name || user.email || user.user_id;

                    let textAlign =
                        user_id === skapi.user.user_id ? "right" : "left";

                    let userClass =
                        user_id === skapi.user.user_id ? "user" : "";

                    chatbox.innerHTML += /*html*/ `<div style='word-wrap:break-word; margin-top: 12px; text-align: ${textAlign}'><strong>${username}</strong><br><p class="msg ${userClass}">${rt.message.chatmsg}</p></div>`;

                    chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom
                }
            } else if (rt.type === "error") {
                // alert(rt.message);
                console.error(rt.message);
            } else if (rt.type === "notice") {
                if (rt.message.includes("message group")) {
                    // User joined the group
                    let user_id = rt.sender;
                    let message = rt.message;

                    if (["USER_LEFT", "USER_DISCONNECTED"].includes(rt.code)) {
                        // remove the user from the participants list
                        let participantsList =
                            document.getElementById("participants");
                        let participant = document.getElementById(user_id);
                        let participantBr = participant.nextSibling;
                        participantsList.removeChild(participantBr);
                        participantsList.removeChild(participant);

                        let user = await getUserInfo(user_id);
                        let chatbox = document.getElementById("chatMessages");
                        message = message.replace(
                            /"([^"]+)"/,
                            `"${user.name || user.email || user.user_id}"`
                        );
                        chatbox.innerHTML += `<p>${message}</p>`;
                        chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom

                        delete participants[user_id];
                    } else if ("USER_JOINED" === rt.code) {
                        // Add the user to the participants list
                        let user = await getUserInfo(user_id);
                        let chatbox = document.getElementById("chatMessages");
                        message = message.replace(
                            /"([^"]+)"/,
                            `"${user.name || user.email || user.user_id}"`
                        );
                        chatbox.innerHTML += `<p>${message}</p>`;
                        chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom
                    }
                }
            }
        };

        // Connect to the realtime websocket
        skapi.connectRealtime(RealtimeCallback);
    </script>

    <section id="groupList" hidden>
        <br /><br />
        <script>
            async function checkIfGroupExists(event) {
                let group = (await skapi.getRealtimeGroups(event)).list;
                if (group.length) {
                    alert("Group already exists.");
                }
            }
        </script>
        <form action="#{value}" onsubmit="checkIfGroupExists(event)">
            <input name="searchFor" value="group" hidden />
            <input name="condition" value="=" hidden />
            <label
                >Create New Chat Group:
                <input
                    type="text"
                    id="el_inp_group"
                    name="value"
                    placeholder="Enter group name"
                    required
                />
            </label>
            <button type="submit">Create</button>
        </form>

        <br />

        <table>
            <thead>
                <tr>
                    <th>Chat Group</th>
                    <th>Users</th>
                </tr>
            </thead>
            <style>
                table {
                    border-collapse: collapse;
                    width: 100%;
                }

                th,
                td {
                    padding: 8px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }

                tr:hover {
                    background-color: #f5f5f5;
                }
                th {
                    background-color: #4caf50;
                    color: white;
                }
                th:first-child {
                    width: 70%;
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
                tr:nth-child(odd) {
                    background-color: #ffffff;
                }
            </style>
            <tbody id="RealtimeGroups">
                <tr>
                    <td>Loading...</td>
                    <td>...</td>
                </tr>
                <!-- Realtime groups will be displayed here -->
            </tbody>
            <script>
                skapi
                    .getRealtimeGroups({
                        searchFor: "groups",
                        condition: ">",
                        value: " ",
                    })
                    .then((res) => {
                        console.log("Realtime groups:", res); // [{ group: 'HelloWorld', number_of_users: 1 }, ...]
                        if (res.list.length) {
                            let RealtimeGroups =
                                document.getElementById("RealtimeGroups");
                            if (RealtimeGroups) {
                                RealtimeGroups.innerHTML = res.list
                                    .map(
                                        (group) =>
                                            /*html*/ `<tr><td><a href="#${group.group}">${group.group}</a></td><td>${group.number_of_users}</td></tr>`
                                    )
                                    .join("");
                            }
                        } else {
                            let RealtimeGroups =
                                document.getElementById("RealtimeGroups");
                            if (RealtimeGroups) {
                                RealtimeGroups.innerHTML = `<tr><td colspan="2">No groups found.</td></tr>`;
                            }
                        }
                    });
            </script>
        </table>
    </section>

    <section id="chatbox" hidden>
        <h2>Chat Group <span id="el_groupname"></span></h2>

        <div style="display: flex">
            <div id="chatMessages"></div>
            <div id="participants"></div>
        </div>

        <style>
            #chatMessages {
                height: 300px;
                overflow-y: auto;
                padding: 12px 16px;
                flex-grow: 1;
                border: 1px solid #ccc;
                border-radius: 8px;
                border-top-right-radius: 0;
                border-bottom-right-radius: 0;
            }
            #participants {
                width: 33%;
                overflow-x: auto;
                height: 300px;
                overflow-y: auto;
                padding: 12px 16px;
                border: 1px solid #ccc;
                border-radius: 8px;
                border-top-left-radius: 0;
                border-bottom-left-radius: 0;
                border-left: none;
                flex-shrink: 0;
            }
            .clickable {
                cursor: pointer;
                color: blue;
                text-decoration: underline;
            }

            .msg {
                margin: 4px 0 0;
                background-color: #eee;
                padding: 8px 12px;
                border-radius: 8px;
                width: fit-content;
                position: relative;
                word-break: break-all;
            }

            .msg:before {
                border-top: 0 solid #eee;
                border-left: 0 solid transparent;
                border-right: 10px solid #eee;
                border-bottom: 10px solid transparent;
                content: "";
                position: absolute;
                top: 8px;
                left: -8px;
            }

            .msg.user {
                margin-left: auto;
            }

            .msg.user:before {
                content: none;
            }

            .msg.user:after {
                border-top: 10px solid #eee;
                border-left: 0 solid transparent;
                border-right: 10px solid transparent;
                border-bottom: 0px solid transparent;
                content: "";
                position: absolute;
                top: 8px;
                right: -8px;
            }
        </style>
        <br />
        <form
            onsubmit="skapi.postRealtime(event, currentGroup).then(()=>this.reset())"
        >
            <input
                type="text"
                name="chatmsg"
                placeholder="Type your message..."
                required
            />
            <button type="submit">Send</button>
        </form>
        <br />

        <a href="welcome.html">Back to group list</a>
    </section>
</main>

<dialog id="privateMsgDialog">
    <strong>Private Message From: <span id="privateMsgFrom"></span></strong>
    <p id="privateMsg"></p>
    <button
        id="closeDialog"
        onclick="document.getElementById('privateMsgDialog').close()"
    >
        Close
    </button>
</dialog>

<dialog id="privateMsgSender">
    <div class="flex-wrap">
        <strong>Private Message To: <span id="privateMsgTo"></span></strong>
        <sup
            id="closeDialog"
            onclick="document.getElementById('privateMsgSender').close()"
            style="cursor: pointer; font-size: 22px"
            >&times;</sup
        >
    </div>

    <form
        onsubmit="skapi.postRealtime(event, sendTo.user_id).then(()=>{ this.reset(); document.getElementById('privateMsgSender').close(); });"
    >
        <input name="msg" placeholder="Write Message..." required />
        <input type="submit" value="Send" style="margin: 4px 0" />
    </form>
</dialog>

<script>
    let currentGroup = null;
    function joinGroup() {
        document.getElementById("participants").innerHTML = ""; // Clear participants
        document.getElementById("chatMessages").innerHTML = ""; // Clear chat messages

        // Clear participants except the current user
        for (let user_id in participants) {
            if (user_id !== skapi.user.user_id) {
                delete participants[user_id];
            }
        }

        console.log("Initial hash:", location.hash);
        if (location.hash) {
            document.getElementById("chatbox").hidden = false; // Show chatbox
            document.getElementById("groupList").hidden = true; // Hide group list

            // Get the new hash value
            currentGroup = location.hash.replace("#", "");
            document.getElementById(
                "el_groupname"
            ).innerText = `"${currentGroup}"`;

            skapi
                .getRealtimeUsers({
                    group: currentGroup,
                })
                .then((u) =>
                    Promise.all(
                        u.list.map((user) => getUserInfo(user.user_id))
                    ).then((res) => console.log(participants))
                );

            return skapi.joinRealtime({ group: currentGroup });
        } else {
            document.getElementById("chatbox").hidden = true; // Hide chatbox
            document.getElementById("groupList").hidden = false; // Show group list
            document.getElementById("el_groupname").innerText = "";
            return skapi.joinRealtime({ group: null }); // leave group
        }
    }
    // Add an event listener for the hashchange event
    window.addEventListener("hashchange", joinGroup);

    // Optionally, handle the initial hash when the page loads
    document.addEventListener("DOMContentLoaded", joinGroup);
</script>
```

<br>

# Skapi HTML Video Call Example

This is a HTML example for building basic video call application using Skapi's webrtc features.

Users must login to request or receive video calls.

This example features:

-   List available receivers
-   Requesting video call
-   Receive incomming video call
-   Hangup incomming, outgoing calls

All the main code is in **welcome.html**

## Recommended VSCode Extention

For HTML projects we often tend to use element.innerHTML.

So we recommend installing innerHTML string highlighting extention like one below:

[es6-string-html](https://marketplace.visualstudio.com/items/?itemName=Tobermory.es6-string-html)

## Download

Download the full project [Here](https://github.com/kkb75281/skapi-webrtc-html-template/archive/refs/heads/main.zip)

Or visit our [Github page](https://github.com/kkb75281/skapi-webrtc-html-template)

## How To Run

Download the project, unzip, and open the `index.html`.

### Remote Server

For hosting on remote server, install package:

```
npm i
```

Then run:

```
npm run dev
```

The application will be hosted on port `3000`

:::danger HTTPS REQUIRED.
WebRTC only works on HTTPS environment.
You need to setup a HTTPS environment when developing a WebRTC feature for your web application.

You can host your application in skapi.com or host from your personal servers.
:::

:::danger Important!

Replace the `SERVICE_ID` value to your own service in `service.js`

<!-- Currently the service is running on **Trial Mode**. -->

<!-- **All the user data will be deleted every 14 days.** -->

You can get your own service ID from [Skapi](https://www.skapi.com)

:::


## Example

Below is part of the repository code, showing how it handles more advanced video chat app scenarios.

Because this is only a portion of the full repository and does not include supporting files such as `service.js` and `main.css`, you cannot copy and paste it directly.


**welcome.html**

```html
<!DOCTYPE html>
<meta charset="utf-8" />

<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="main.css" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<script src="service.js"></script>

<dialog id="el_dl_calling"></dialog>
<dialog id="el_dl_incoming"></dialog>

<script>
    let call = null; // Calling object. This is assigned when the user is calling someone.
    let receiver = null; // Receiver object. This is assigned when the user is receiving a call.
    let rtcConnection = null; // Resolved RTC connection. This is assigned when the user is connected with a user via RTC.
    let participants = {}; // Participants object. This is used to cache user information of the available participants in the list.
    let cidList = {}; // Connection ID list. This is used to cache the connection ID of the participants in the list.
</script>

<main>
    <div class="flex-wrap">
        <h1 id="WelcomeMessage"></h1>
        <a href="logout.html">Logout</a>
    </div>

    <script>
        /*
            Get user profile and display it on the page.
        */
        skapi.getProfile().then((u) => {
            if (u) {
                let welcomeMessage = document.getElementById("WelcomeMessage");
                if (welcomeMessage) {
                    welcomeMessage.innerHTML = `Welcome, ${
                        u.name || u.email || u.user_id
                    }!`;
                }

                let userInfo = document.getElementById("UserInfo");
                if (userInfo) {
                    userInfo.innerHTML = JSON.stringify(u, null, 2);
                }
            }
            return u;
        });
    </script>

    <section id="el_dl_calllist">
        <h1>Connect WebRTC</h1>
        <label>
            <input type="checkbox" id="allow_video" checked /> Allow Video
        </label>
        <label>
            <input type="checkbox" id="allow_audio" checked /> Allow Audio
        </label>

        <br /><br />

        <table>
            <thead>
                <tr>
                    <th>Username</th>
                    <th style="text-align: right">Connection ID</th>
                </tr>
            </thead>
            <style>
                table {
                    border-collapse: collapse;
                    width: 100%;
                }

                th,
                td {
                    padding: 8px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }

                tr:hover {
                    background-color: #f5f5f5;
                }

                th {
                    background-color: #4caf50;
                    color: white;
                }

                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }

                tr:nth-child(odd) {
                    background-color: #ffffff;
                }
            </style>
            <tbody id="RealtimeParticipants">
                <!-- Available realtime participants will be displayed here -->
            </tbody>
        </table>
    </section>

    <br />

    <section style="text-align: center" id="el_video_call" hidden>
        <video id="local" autoplay muted></video>
        <video id="remote" autoplay muted></video>

        <style>
            video {
                max-width: 100%;
                width: 320px;
                height: 240px;
                border: solid 1px;
            }
        </style>

        <br /><br />

        <form
            onsubmit="event.preventDefault(); rtcConnection.channels.default.send(document.getElementById('el_input_rtcMessage').value); this.reset();"
        >
            <input
                type="text"
                id="el_input_rtcMessage"
                placeholder="Send RTC Message"
                name="message"
            />
            <input type="submit" value="Send" />
        </form>

        <br />

        <button type="button" onclick="rtcConnection.hangup()">
            Disconnect
        </button>
    </section>

    <section>
        <h1>Websocket Log</h1>
        <button
            type="button"
            onclick="document.getElementById('el_pre_rtcLog').innerText = ''"
        >
            Clear
        </button>
        <pre id="el_pre_rtcLog"></pre>
    </section>

    <style>
        pre {
            overflow-x: auto;
        }

        #el_pre_rtcLog {
            height: 320px;
            border: solid 1px #ccc;
            border-radius: 8px;
            padding: 16px;
        }
    </style>
</main>
<script>
    function RTCCallback(e) {
        let rtcLog = document.getElementById("el_pre_rtcLog"); // RTC Log
        console.log("RTC Callback:", e);

        switch (e.type) {
            // RTC Events
            case "negotiationneeded":
                rtcLog.innerText += `RTC negotiation needed. Sending offer..\n`;
                break;

            case "track":
                rtcLog.innerText += `Incoming Media Stream...\n`;
                document.getElementById("remote").srcObject = e.streams[0];
                document.getElementById("remote").play();
                break;

            case "connectionstatechange":
                let state = e.state;
                rtcLog.innerText +=
                    `RTC Connection:${e.type}:${state}\n` +
                    JSON.stringify(e, null, 2) +
                    "\n-\n";
                document.getElementById("el_dl_calling").close();
                document.getElementById("el_dl_incoming").close();

                let videoCallSection = document.getElementById("el_video_call");
                let callList = document.getElementById("el_dl_calllist");
                if (
                    state === "disconnected" ||
                    state === "failed" ||
                    state === "closed"
                ) {
                    videoCallSection.hidden = true;
                    callList.hidden = false;
                } else if (state === "connecting") {
                    // Callback executed when the user is connected to the server.
                    el_pre_rtcLog.innerText += "Connected\n";
                    videoCallSection.hidden = false;
                    callList.hidden = true;
                }
                break;

            // Data Channel Events
            case "close":
                rtcLog.innerText +=
                    `Data Channel:${e.target.label}:${e.type}\n` +
                    JSON.stringify(e, null, 2) +
                    "\n-\n";
                break;
            case "message":
                // Data Channel message received from remote peer
                rtcLog.innerText +=
                    `Data Channel:${e.target.label}:${e.type}\n` +
                    JSON.stringify(e.data, null, 2) +
                    "\n-\n";
                break;
            case "open":
            // Data Channel opened
            case "bufferedamountlow":
            case "error":
                rtcLog.innerText +=
                    `Data Channel:${e.target.label}:${e.type}\n` +
                    JSON.stringify(e, null, 2) +
                    "\n-\n";
                break;
        }
        // scroll to bottom
        rtcLog.scrollTop = el_pre_rtcLog.scrollHeight;
    }

    async function callRTC(cid) {
        event.preventDefault();

        let params = {
            media: {
                audio: document.getElementById("allow_audio").checked,
                video: document.getElementById("allow_video").checked,
            },
            cid,
        };

        call = await skapi.connectRTC(params, RTCCallback);

        document.getElementById("el_dl_calling").innerHTML = /*html*/ `
                <p>Calling</p>
                <button onclick="call.hangup()">Hangup</button>
            `;

        document.getElementById("el_dl_calling").showModal();
        rtcConnection = await call.connection;

        if (!rtcConnection) {
            alert("Call rejected.");
        }
        if (rtcConnection.media) {
            document.getElementById("local").srcObject = rtcConnection.media;
            document.getElementById("local").play();
        }
    }

    async function addCallList(user_id, cid) {
        if (user_id === skapi.user.user_id) {
            // If the user is the current user, return the current user info, and do not add to the list.
            participants[user_id] = skapi.user;
            return skapi.user;
        }

        let user = participants[user_id];
        if (!user) {
            user = (
                await skapi.getUsers({ searchFor: "user_id", value: user_id })
            ).list?.[0];
            participants[user_id] = user;
        }

        let RealtimeParticipants = document.getElementById(
            "RealtimeParticipants"
        );
        let username = `${user.name || user.email || user.user_id}`;

        // add the user to the list with the connection id and the call button
        RealtimeParticipants.innerHTML += /*html*/ `
            <tr id="el_tr_participant-${cid}">
                <td>
                    <strong>${username}</strong>
                </td>
                <td id="el_call-button-${cid}" style="text-align: right;">
                    ${cid}
                    <button type="button" onclick="callRTC('${cid}').catch(err=>alert(err.message))" style="width: fit-content">Call</button>
                </td>
            </tr>
        `;
        cidList[cid] = user_id;

        return participants[user_id];
    }

    function realtimeCallback(rt) {
        let log = rt;
        try {
            log = JSON.stringify(log, null, 2);
        } catch (err) {}

        el_pre_rtcLog.innerText += rt.type + ":\n" + log + "\n-\n";
        // scroll to bottom
        el_pre_rtcLog.scrollTop = el_pre_rtcLog.scrollHeight;
        if (rt.type === "notice") {
            // User joined the group
            let user_id = rt.sender;

            if (["USER_LEFT", "USER_DISCONNECTED"].includes(rt.code)) {
                // remove the user from the call list
                document
                    .getElementById(`el_tr_participant-${rt.sender_cid}`)
                    ?.remove();
                delete participants[rt.sender];
                delete cidList[rt.sender_cid];
            } else if (rt.code === "USER_JOINED") {
                // Add the user to the participants list
                addCallList(user_id, rt.sender_cid);
            }
        }

        if (rt.type === "rtc:incoming") {
            receiver = rt;
            let dl_incoming = document.getElementById("el_dl_incoming");
            // Show incoming call dialog
            dl_incoming.innerHTML = /*html*/ `
                <p>Incoming call</p>
                <button onclick='
                    receiver.connectRTC({
                        media: {
                            audio: document.getElementById("allow_audio").checked,
                            video: document.getElementById("allow_video").checked
                        }
                    }, RTCCallback)
                        .then(rtc => {
                            rtcConnection = rtc;
                            if(rtc.media) {
                                document.getElementById("local").srcObject = rtc.media;
                                document.getElementById("local").play();
                            }
                        })
                '>Accept</button>

                <button onclick="receiver.hangup();">Reject</button>
            `;

            dl_incoming.showModal();
        }
    }

    skapi.connectRealtime(realtimeCallback);

    function getRealtimeUsers(refresh) {
        skapi.getRealtimeUsers({ group: "RTCCall" }).then((res) => {
            res.list = res.list.filter((p) => p.user_id !== skapi.user.user_id); // remove current user from the list
            if (res.list.length) {
                res.list.map((p) => addCallList(p.user_id, p.cid));
            }
        });
    }

    skapi.joinRealtime({ group: "RTCCall" }).then((r) => {
        getRealtimeUsers();
    }); // Join a realtime group
</script>
```

<br>

# E-Mail Service

Skapi provides three very convenient email services:

- **Automated Emails**: Send automated emails to your users.

    When user signs up, or when user forgets their password, gets invited to your service, or needs a welcome email to be sent, you can use Skapi's automated email service to setup your email templates and send emails to your users.

- **Bulk Email Service**: Send bulk emails to your users.
  
    Skapi provides a built-in E-Mail service that allows you to send bulk emails to your users.
    You can immediately collect email addresses from your users, and send newsletters using Skapi's E-Mail service.

- **Receiving Inquiries**: Receive inquiries from your users.

    Skapi provides a built-in E-Mail service that allows you to receive inquiries from your users.
    You can immediately receive inquiries from your visitors, using Skapi's E-Mail service.

In this section, you will learn how to setup automated emails for your service, and how to send bulk emails to your users.

<br>

# Automated E-Mails

When the user signup, reset password, or change email, subscribes to public newsletters, get invited to your service,
the system will send an automated email to the user.
You can customize the email template of these service emails by sending your templates to the email endpoints.

E-Mail endpoints can be found in your `Service Emails` page in your Skapi admin page.

In the `Service Emails` page, select an email type you want to set the template.

- **Signup Confirmation**
  
  Endpoint for signup confirmation email template. The user receives this email when they are requested for confirmation on signup.

- **Welcome Email**
  
  Endpoint for welcome email template. The user receives this email when they signup, and have successfully verified their email, and logged in for the first time.

- **Verification Email**
  
  Endpoint for verification email template. The user receives this email when verifes their email or when they request the [`forgotPassword()`](https://docs.skapi.com/api-reference/authentication/README.html#forgotpassword).
  

- **Invitation Email**
  
  Endpoint for invitation email template. The user receives this email when they are invited to the service.
  You can send invitation to users from the `Users` page in your admin page in Skapi website.

- **Newsletter Subscription**
  
  Endpoint for public newsletter subscription confirmation email template. The user receives this email when they subscribe to the public newsletter.

Once you select the email type, the page will show the email endpoint address to set the template in the `Email Template` section.

Following example shows the format for email endpoints:

```
xxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@mail.skapi.com
```

You may view already set templates, copy the end point.

To customize the email template, just send your customized template via your e-mail to the endpoint address.

:::danger
- **DO NOT** share your email endpoint address with anyone. This endpoint is unique to your service and should be kept private.
- You must use the same email address that you used to signup to Skapi.
:::

## Template Placeholders

E-Mail templates takes custom placeholders that can be used to customize the email template.
If there is a placeholder character in your email content, it will be replaced with the corresponding value.

- **`${service_name}`**: Name of your service.
- **`${name}`**: User's name from the profile. If the user has not set their name, it will be replaced with empty string.
- **`${email}`**: User's email address.

## Required Placeholders for signup confirmation email

When sending signup confirmation email, you must include set a link with **`https://link.skapi`** as a url in your email content.
The dummy url **`https://link.skapi`** will be replaced with the actual link that confirms the user's signup.

Example below shows how to set the link with **`https://link.skapi`** url in gmail.
Any other email service should have similar way to set the link.

![gmail link](https://docs.skapi.com/linkexam.png)

Below shows an example of signup confirmation template. In this example we included **`${service_name}`** in the subject, and **`${name}`** with link in the content.

![signup confirmation template](https://docs.skapi.com/conftempexamp.png)


## Required Placeholders for verification email

When sending verification email, you must include **`${code}`** placeholders in your email content.
The **`${code}`** placeholder will be replaced with the verification code that the user can use to verify their email.

Example:
```
Your verification code is: ${code}
```


## Required Placeholders for invitation email

Below are the required placeholders for invitation email.

- **`https://link.skapi`**: Link to accept the invitation.
- **`${email}`**: Invited person's login email.
- **`${password}`**: Temporary password for the invited person.

When user clicks on the link, they will be able to login with the temporary password.

You can invite users to your service from the user page in your service page in Skapi website.

:::tip
To make the invitation email more personal, it would be good idea to include **`${name}`** placeholder in the template.
:::

## Required Placeholders for public newsletter subscription confirmation email

When user subscribes to your public newsletters user receives subscription confirmation email.
The subscription confirmation email contains a link to confirm the subscription.

you must include **`https://link.skapi`** placeholders in your email content.


<br>

# Sending Newsletters

You can send newsletters or service newsletters to your users by sending your email to the endpoint email address.
The following example shows the format for email endpoints for sending newsletters:

```
xxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@mail.skapi.com
```

Go to `Newsletters` page, select the email type, and the page will show the email endpoint address to send the newsletter.

## Sending Public Newsletters

You can send public newsletters to your users by sending your email to the endpoint email.

First, the users must subscribe to the public newsletter to receive your public newsletters:

:::code-group
```html [Form]
<form onsubmit="skapi.subscribeNewsletter(event).then(res => alert(res))">
    <input type="email" name="email" placeholder='your@email.com'/>
    <input hidden name="redirect" value="https://your.domain.com/successpage"/>
    <input hidden name="group" value="public"/>
    <input type="submit" value="Subscribe"/>
</form>
```

```js [JS]
skapi.subscribeNewsletter({
    email: 'users@email.com',
    redirect: 'https://your.domain.com/successpage',
    group: 'public'
}).then(res => alert(res));
```
:::

The example above shows how to let your visitors subscribe to the public newsletter by calling [`subscribeNewsletter()`](https://docs.skapi.com/api-reference/email/README.html#subscribenewsletter).

When the request is successful, user will receive a confirmation email to verify their email address.
User can confirm their email address by clicking the link in the email.
If the confirmation is successful, the user will be redirected to the redirect url provided in the [`subscribeNewsletter()`](https://docs.skapi.com/api-reference/email/README.html#subscribenewsletter) parameter.

All the public newsletters will have unsubscribe link at the bottom of the email.
When the user clicks the unsubscribe link, they will no longer receive your public newsletters.

For more detailed information on all the parameters and options available with the [`subscribeNewsletter()`](https://docs.skapi.com/api-reference/email/README.html#subscribenewsletter) method, 
please refer to the API Reference below:

### [`subscribeNewsletter(params, callbacks):Promise<string>`](https://docs.skapi.com/api-reference/email/README.html#subscribenewsletter)

:::warning
If the user is logged in, they will not be asked to confirm their email address.
Instead, they must have their [`email verifed`](https://docs.skapi.com/user-account/email-verification).
:::

## Sending Service Newsletters
  
You can send service newsletters to your users with an account. To subscribe to service newsletters the user must be logged in.
Service newsletters can be useful to send information, notifications, and other service-related emails.

First, user must subscribe to the service newsletter to receive the email.

:::warning
- User must be logged in to subscribe to your service newsletters.
- User must have their email verified to subscribe to your service newsletters.
:::

:::code-group

```html [Form]
<form onsubmit="skapi.subscribeNewsletter(event).then(res => alert(res))">
    <input hidden name="group" value="authorized"/>
    <input type="submit" value="Subscribe"/>
</form>
```

```js [JS]
skapi.subscribeNewsletter({
    group: 'authorized'
}).then(res => alert(res));
```
:::

The example above shows how to let your visitors subscribe to the service newsletters by calling [`subscribeNewsletter()`](https://docs.skapi.com/api-reference/email/README.html#subscribenewsletter).

## Requesting Newsletter Endpoint for Admins

The [`adminNewsletterRequest()`](https://docs.skapi.com/api-reference/email/README.html#adminnewsletterrequest) method allows administrators to request a personalized email endpoint for sending newsletters. Only users with administrator privileges (access group 99) can request this endpoint.

To send newsletters, an admin must first request a personalized endpoint using [`adminNewsletterRequest()`](https://docs.skapi.com/api-reference/email/README.html#adminnewsletterrequest). This method verifies admin privileges and returns a unique URL for sending emails.

```js [JS]
skapi.adminNewsletterRequest().then(response => {
    console.log("Your newsletter endpoint:", response)});
```

:::warning
This endpoint is specific to the requesting admin and can only receive emails from the admin’s registered email address.
:::

## Checking if the user is subscribed to the service newsletters

You can let the user check if they have subscribed to the service newsletters by calling [`getNewsletterSubscription()`](https://docs.skapi.com/api-reference/email/README.html#getnewslettersubscription).

```js
skapi.getNewsletterSubscription({
    group: 'authorized'
}).then(subs => {
    if (subs.length) {
        // user is subscribed to the service newsletter
    }
    else {
        // no subscription
    }
})
```

## Unsubscribing from the service newsletters

You can let the user unsubscribe from the service newsletters by calling [`unsubscribeNewsletter()`](https://docs.skapi.com/api-reference/email/README.html#unsubscribenewsletter).

```js
skapi.unsubscribeNewsletter({
    group: 'authorized'
}).then(res => {
    // user is unsubscribed from the service newsletter
})
```

## Fetching Sent Emails

You can fetch sent emails from the database by calling [`getNewsletters()`](https://docs.skapi.com/api-reference/email/README.html#getnewsletters).
By default, it fetches all the public newsletters from the database in descending timestamp.

In the newsletter object, the `url` is the URL of the html file of the newsletter. You can use the URL to fetch the newsletter content.

```js
skapi.getNewsletters().then(newsletters => {
    // newsletters.list is an array of newsletters
    /*
    {
        message_id: string; // Message ID of the newsletter
        timestamp: number; // Timestamp of the newsletter
        complaint: number; // Number of complaints
        read: number; // Number of reads
        subject: string; // Subject of the newsletter
        bounced: string; // Number of bounces
        url: string; // URL of the newsletter
    }  
    */
})
```

For more detailed information on all the parameters and options available with the [`getNewsletters()`](https://docs.skapi.com/api-reference/email/README.html#getnewsletters) method, 
please refer to the API Reference below:

### [`getNewsletters(params, options?): Promise<DatabaseResponse<Newsletter>>`](https://docs.skapi.com/api-reference/email/README.html#getnewsletters)

### Fetching Sent Emails with Conditions

You can fetch sent emails from the database with conditions by calling [`getNewsletters()`](https://docs.skapi.com/api-reference/email/README.html#getnewsletters).

Below is an example of fetching service newsletters that are sent to the service users before 24 hours ago in descending order.

For full parameters and options, see [`getNewsletters(params, options?)`](https://docs.skapi.com/api-reference/email/README.html#getnewsletters).

```js
skapi.getNewsletters({
    searchFor: 'timestamp',
    value: Date.now() - 86400000, // 24 hours ago
    condition: '<',
    group: 'authorized',
}, { ascending: false }).then(newsletters => {
    // newsletters.list is an array of newsletters
    /*
    {
        message_id: string; // Message ID of the newsletter
        timestamp: number; // Timestamp of the newsletter
        complaint: number; // Number of complaints
        read: number; // Number of reads
        subject: string; // Subject of the newsletter
        bounced: string; // Number of bounces
        url: string; // URL of the newsletter
    }  
    */
})
```

<br>

# Receiving Inquiries

Skapi provides a built-in E-Mail service that allows you to receive inquiries from your users.

You can use [`sendInquiry()`](https://docs.skapi.com/api-reference/email/README.html#sendinquiry) to let your visitors send inquiries to your e-mail.

## Sending Inquiry

:::code-group

```html [Form]
<form id="inquiry-form" onsubmit="skapi.sendInquiry(event).then(res => {
    alert(res) // 'SUCCESS: Inquiry has been sent.'
})">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
    <label for="subject">Subject:</label>
    <input type="text" id="subject" name="subject" required>
    <label for="message">Message:</label>
    <textarea id="message" name="message" required></textarea>
    <button type="submit">Send Inquiry</button>
</form>
```

```js [JS]
let params = {
    name: 'John Doe',
    email: 'john@doe.com',
    subject: 'Inquiry',
    message: 'Hello, I have a question.'
}
skapi.sendInquiry(params).then(inquiry => {
    console.log(inquiry); // 'SUCCESS: Inquiry has been sent.'
});
```
:::

:::warning
Be sure to turn on the `Allow Inquiries` option in the [Service Settings](https://docs.skapi.com/introduction/what-is-skapi.md#service-settings).
:::

<br>

# Admin Features

Skapi provides a set of methods for managing your service.

These methods are available only to users with the `admin` role.

Service owners can grant the `admin` role to other users.

:::danger NOTE
Before using admin methods, create an admin user from your Skapi service Users page. Then use that account to access admin methods, or grant admin access to other users.
:::

## What Admins Can Do

Admins use high access groups (`90` ~ `99`) and can perform the following actions:

- Read database data in any access group.
- Delete user accounts.
- Update user account profiles.
- Invite users to the service.
- Create users in the service.
- Assign higher access groups to users.
- Remove private record access from users.
- Block or unblock users.
- Delete any record, including private and read-only records.
- Send newsletters to newsletter subscribers.
- Send notifications to users.

## What Admins Cannot Do

Admins cannot perform the following actions:

- View private data of other users.
- Edit database records uploaded by other users.
- Change service settings.

These actions are available only to the service owner through the Skapi service pages.

Admin methods are useful when building services that require admin access to manage users and data.

:::danger
Admin methods are powerful and should be used with caution.
Admins can delete user accounts and data, which can cause irreversible damage to your application.
:::

## What Both Admins and Service Owners Cannot Do

- Change or view user account passwords.
- View private database data of other users.
- Upload private records to the database.
- Upload subscription records to the database.

## What Service Owners Cannot Do

- Upload read-only records to the database.

::: tip
Service owners can do everything that admins can do.
:::

<br>

# Inviting Users

Admins can invite users to the service by using the [`inviteUser()`](https://docs.skapi.com/api-reference/admin/README.html#inviteuser) method.

When a user is invited, an invitation email is sent to the user with a link to accept the invitation.

In the invitation email, the user will see the login email and randomly generated password, and a link to accept the invitation.

User should click on the link to accept the invitation within 7 days and they will be able to login to the service using the email and password provided in the invitation email.

This example demonstrates using the [`inviteUser()`](https://docs.skapi.com/api-reference/admin/README.html#inviteuser) method to invite a user to the service.
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

For more detailed information on all the parameters and options available with the [`inviteUser()`](https://docs.skapi.com/api-reference/admin/README.html#inviteuser) method,

## Send Invitations with Custom Templates

Invitation emails are sent using the default template configured in your Skapi service.

You can use your own custom HTML email template by providing a template URL and custom subject line.

:::code-group

```html [Form]
<form onsubmit="skapi.inviteUser(event, {
        template: {
            url: 'https\:\/\/your.custom.template/file.html',
            subject: 'Exclusive Invitation'
        }
    }).then(user => console.log(user))">
    <input name="email" placeholder="Email" required/>
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
For more information, see [Required Placeholders for Invitation Email](https://docs.skapi.com/email/email-templates.html#required-placeholders-for-invitation-email).
:::

## Resending Invitations

Admins can resend invitations to users who have not accepted the invitation by using the [`resendInvitation()`](https://docs.skapi.com/api-reference/admin/README.html#resendinvitation) method.

This example demonstrates using the [`resendInvitation()`](https://docs.skapi.com/api-reference/admin/README.html#resendinvitation) method to resend an invitation to a user.
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

Admins can get a list of invitations that have been sent by using the [`getInvitations()`](https://docs.skapi.com/api-reference/admin/README.html#getinvitations) method.

This example demonstrates using the [`getInvitations()`](https://docs.skapi.com/api-reference/admin/README.html#getinvitations) method to get a list of invitations that have been sent.
When the request is successful, the [DatabaseResponse](https://docs.skapi.com/api-reference/data-types/README.html#databaseresponse) containing the list of invitations is returned.

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

For more detailed information on all the parameters and options available with the [`getInvitations()`](https://docs.skapi.com/api-reference/admin/README.html#getinvitations) method,


## Cancelling Invitations

Admins can cancel invitations that have been sent by using the [`cancelInvitation()`](https://docs.skapi.com/api-reference/admin/README.html#cancelinvitation) method.

This example demonstrates using the [`cancelInvitation()`](https://docs.skapi.com/api-reference/admin/README.html#cancelinvitation) method to cancel an invitation that has been sent.
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


<br>

# Managing Users

Admins can manage user accounts by creating, deleting, blocking, and unblocking accounts. Admins can also grant access to users and cancel invitations.

## Assigning Access Group to Users

Users that have admin access can grant access to other users by using the [`grantAccess()`](https://docs.skapi.com/api-reference/admin/README.html#grantaccess) method.

This example demonstrates using the [`grantAccess()`](https://docs.skapi.com/api-reference/admin/README.html#grantaccess) method to grant access to a user.

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

Admins can create user accounts by using the [`createAccount()`](https://docs.skapi.com/api-reference/admin/README.html#createaccount) method.

This example demonstrates using the [`createAccount()`](https://docs.skapi.com/api-reference/admin/README.html#createaccount) method to create a user account.

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

[`createAccount()`](https://docs.skapi.com/api-reference/admin/README.html#createaccount) method does not require any confirmation from the user.

For more detailed information on all the parameters and options available with the [`createAccount()`](https://docs.skapi.com/api-reference/admin/README.html#createaccount) method.


## Deleting User Accounts

Admins can delete user accounts by using the [`deleteAccount()`](https://docs.skapi.com/api-reference/admin/README.html#deleteaccount) method.

This example demonstrates using the [`deleteAccount()`](https://docs.skapi.com/api-reference/admin/README.html#deleteaccount) method to delete a user account.

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

Admins can block user accounts by using the [`blockAccount()`](https://docs.skapi.com/api-reference/admin/README.html#blockaccount) method.

This example demonstrates using the [`blockAccount()`](https://docs.skapi.com/api-reference/admin/README.html#blockaccount) method to block a user account.

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

Admins can unblock user accounts by using the [`unblockAccount()`](https://docs.skapi.com/api-reference/admin/README.html#unblockaccount) method.

This example demonstrates using the [`unblockAccount()`](https://docs.skapi.com/api-reference/admin/README.html#unblockaccount) method to unblock a user account.

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



<br>

# Hosting your website

Skapi provides a straight forward hosting service for your website.
You can host your website with Skapi by simply uploading your website files in your `Web Hosting` page.

## Registering Your Subdomain

Before you upload your website files, you must register a subdomain for your website.
Go to `Web Hosting` page. If the service does not have a subdomain, it will ask you to make one.

<!-- 
![subdomain register](https://docs.skapi.com/hosting.png)
 -->

## Uploading Your Website Files

Once you have registered your subdomain, you can upload your website files by drag and dropping your files in the file section which is at the bottom section of your `Web Hosting` page.

When the files are uploaded, all the files will be hosted in your subdomain.
For example, if you registered `mywebsite` as your subdomain, and have uploaded a file named `yourfile.ext`, the file will be hosted publicly in `https://mywebsite.skapi.com/yourfile.ext`.

:::info
- When you overwrite a file with the same name, the file will be replaced with the new file.
- When overwriting or deleting a file, please allow couple of minutes (15 minutes max) for CDN to update it's cache.
:::

:::danger
Since the files are hosted publicly, **DO NOT** upload any sensitive files in your hosting page.
:::
## index.html

If you have an `index.html` file in your root level, it will be hosted in your subdomain's root directory.
<!-- 
![hosting uploaded](https://docs.skapi.com/hostuploaded.png) -->

For example, if `index.html` file is hosted in the root directory of the subdomain.
The `index.html` will also be served when the user visits `https://mywebsite.skapi.com/`.


## Setting the 404 Page

You can set the 404 page for your website from the `404 Page` section, which is in the upper section form on your `Web Hosting` page.
This HTML file will be served when the user visits a page that does not exist in your website.

:::danger
If you are using **SPA framework** such as Vue, React, or Angular, **YOU MUST** set the 404 page to your **`index.html`** file.
:::



<br>

