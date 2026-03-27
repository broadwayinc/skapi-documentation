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
5. Call [`openIdLogin()`](/api-reference/authentication/README.md#openidlogin) with that token.

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


### 3. Register Client Secret Key

To retrieve an access token from Google OAuth, you need a client secret key.

Because the client secret must not be exposed in frontend code, register it securely in Skapi.

1. In the service page, click on the **Client Secret Key** menu.
2. Click **+** at the top-right of the table.
3. In the form, enter:
    - **Name:** A key identifier. For this guide, use **ggltoken**.
    - **Client Secret Key:** The exact secret from your Google OAuth app.

4. Click **Save**.

For more information about registering a client secret key, see [Client Secret Keys](/api-bridge/client-secret-request.html).

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

After the user signs in with Google and is redirected back to your app, use [`clientSecretRequest()`](/api-bridge/client-secret-request) to exchange the authorization code for an access token.

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
In this Google OAuth example, [`clientSecretRequest()`](/api-bridge/client-secret-request) securely exchanges the authorization code for an access token, and [`openIdLogin()`](/api-reference/authentication/README.md#openidlogin) signs in the user with that token.

Make sure both your client secret key and OpenID logger are configured, and use the correct `clientSecretName` and logger ID.
:::

### [`openIdLogin(event?: SubmitEvent | params): Promise<{ userProfile: UserProfile; openid: { [attribute: string]: string } }>`](/api-reference/authentication/README.md#openidlogin)

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