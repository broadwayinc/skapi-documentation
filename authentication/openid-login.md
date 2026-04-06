# OpenID Login

Skapi supports OpenID authentication through configurable OpenID Loggers.

## What is OpenID?

OpenID is an authentication standard that lets users sign in with an identity provider (for example, Google) instead of creating a separate password for every app.

## Login with OpenID Profile

If you have access to an OpenID provider API, you can register an OpenID Logger in your Skapi service settings.

Although providers differ in details, the overall process is:

1. You redirect the user to the provider's login page.
2. The provider authenticates the user.
3. The user is redirected back to your app.
4. Exchange the returned authorization code for an access token using a secure client secret request.
5. Call [`openIdLogin()`](/api-reference/authentication/README.md#openidlogin) with the token.

## Google OAuth Example

This example shows how to implement Google OAuth authentication.

### 1. Set Up Google OAuth Service

Go to the [Google Cloud Console](https://console.cloud.google.com/) and create your OAuth app.

Follow Google's [setup instructions](https://support.google.com/cloud/answer/15549257?sjid=3416534526948669406-NC), and make sure your redirect URL points back to your web app.

### 2. Set Up Link to Google Login

After setting up OAuth in [Google Cloud Console](https://console.cloud.google.com/), create a button that sends users to Google's OAuth login URL with the parameters registered for your app.

```html
<button onclick="googleLogin()">Google Login</button>
<script>
    const GOOGLE_CLIENT_ID = '1234567890123-your.google.client.id';
    const REDIRECT_URL = window.location.origin + window.location.pathname; // URL user to redirect back to on successful login.

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

### 3. Register Client Secret Key

After a successful Google login, the user is redirected back to your page with a `code` query parameter.

You must exchange this `code` for an access token. Because this step requires a client secret, store the secret in Skapi and request the token with [`clientSecretRequest()`](/api-bridge/client-secret-request.md).

To register a client secret key in Skapi:

1. In the service page, click on the **Client Secret Keys** menu.
2. Click **+** at the top-right of the table.
3. In the form, enter:
    - **Name:** A key identifier. For this guide, use **ggltoken**.
    - **Client Secret Key:** The exact secret from your Google OAuth app.

4. Click **Save**.

For more information about registering a client secret key, see [Client Secret Keys](/api-bridge/client-secret-request.md).

After registering the client secret, run the following code on the redirect page to exchange the authorization code for an access token:

```js
// Page user has redirected to

const GOOGLE_CLIENT_ID = '1234567890123-your.google.client.id';
const REDIRECT_URL = window.location.origin + window.location.pathname;
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

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
const ACCESS_TOKEN = tokenResponse?.access_token;
```

### 4. Register Your OpenID Logger in Skapi

To log users into your Skapi service with the token, you must register an OpenID Logger.

The logger configuration tells Skapi how to request user profile attributes from the OAuth provider and which attribute to use as the unique account identifier.

1. Log in to [skapi.com](https://www.skapi.com).
2. Open the service where you want to register an OpenID logger.
3. From the side menu, click on **OpenID Logger**.
4. Click **+** at the top-right of the table.
5. Fill in the logger form:

    - **Logger ID:**
        This value is used when calling [`openIdLogin()`](/api-reference/authentication/README.md#openidlogin). You can use any name. For this guide, use **google**.

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

Now call [`openIdLogin()`](/api-reference/authentication/README.md#openidlogin) with the logger ID and the access token to sign in (or create) the user.

In this example, the logger ID is `google`.

```js
skapi.openIdLogin({ id: 'google', token: ACCESS_TOKEN }).then(user => {
    // User has logged in!
});
```

### [`openIdLogin(event?: SubmitEvent | params): Promise<{ userProfile: UserProfile; openid: { [attribute: string]: string } }>`](/api-reference/authentication/README.md#openidlogin)

### Wrapping up: All in one page

This example shows the entire flow in one page. After the user signs in with Google and is redirected back to your app, use [`clientSecretRequest()`](/api-bridge/client-secret-request.md) to exchange the authorization code for an access token.

Then call [`openIdLogin(event?: SubmitEvent | params): Promise<{ userProfile: UserProfile; openid: { [attribute: string]: string } }>`](/api-reference/authentication/README.md#openidlogin) to sign the user in to your Skapi service.

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

            const ACCESS_TOKEN = tokenResponse.access_token;

            await skapi.openIdLogin({ id: 'google', token: ACCESS_TOKEN });

            window.history.replaceState({}, document.title, REDIRECT_URL);
            
            // User has now logged in. Do whatever you want from here... 
            alert('Login Success!');
        }
        catch (error) {
            console.error('Google OAuth login failed:', error);
            alert('Login failed. Please try again.');
        }
    }

    handleOAuthCallback();
</script>
```

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