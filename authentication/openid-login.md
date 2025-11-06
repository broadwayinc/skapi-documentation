# OpenID Login

Skapi provides support for OpenID authentication profiles.

## What is OpenID?

OpenID is an open standard and decentralized authentication protocol that allows users to be authenticated by relying on a third-party service, called an OpenID provider, without needing to have a separate identity and password for each service. This simplifies the login process for users and enhances security by reducing the number of passwords that need to be managed.

With OpenID, users can log in to multiple websites using a single set of credentials from an OpenID provider such as Google, Facebook, or other identity providers. This process involves redirecting the user to the OpenID provider's login page, where they authenticate themselves, and then returning to the original website with a token that confirms their identity.

## Login with OpenID Profile

If you have access to an OpenID provider's API, you can register your OpenID logger from your Skapi service page.

Although OpenID providers have different authentication methods, the general process follows these steps:

1. Register an OpenID logger in Skapi
2. Redirect the user to the OpenID provider's login page
3. Redirect the authenticated user back to your webpage
4. Retrieve the access token to call [`openidLogin()`](/api-reference/authentication/README.md#openidlogin)
5. The user will be logged into your Skapi application

## Google OAuth Example

In this example, we'll demonstrate implementing Google OAuth authentication.

### 1. Set Up Google OAuth Service

Go to the [Google Cloud Console](https://console.cloud.google.com/) and create your OAuth service.

Follow their [instructions](https://support.google.com/googleapi/answer/6158849?hl=en). Make sure to set up the correct redirect URL that points to your web application.

### 2. Register Your OpenID Logger in Skapi

1. Log in to [skapi.com](https://www.skapi.com).
2. Click on the service where you want to register your OpenID Logger.
3. From the side menu, click on **OpenID Logger**.
4. Click **+** on the top right side of the table to add logger.
5. Set up the *Logger ID*. This is an identifier used when calling [`openidLogin()`](/api-reference/authentication/README.md#openidlogin). You can use any name, but for this example, set it to **google**.
6. Set up the *Username Key*. This should be an OpenID attribute name that holds a unique identifier. For this example, set it to **email**.
7. Set up the *request URL* to the Google API where you can retrieve the user's profile. Set it to `https://www.googleapis.com/oauth2/v3/userinfo`.
8. Set up the Header [JSON] as shown below:
    ```
    {
        "Authorization": "Bearer $TOKEN"
    }
    ```
9. Click **Save**.


### 3. Register Client Secret Key

When retrieving an access token for Google OAuth, the Google API requires a client secret key.

Since the client secret key should not be exposed, register the client secret key of your OAuth service in Skapi.

1. In the service page, click on the **Client Secret Key** menu.
2. Click **+** on the top right side of the table to add key.
3. Give a name to your secret key. You can use any name, but for this example, set it to **ggltoken**.
4. Enter the client secret key you obtained from your Google OAuth service.
5. Click **Save**.

### 4. Set Up Link to Google Login

Create a link URL and button for the Google OAuth login page.

```html
<button onclick='googleLogin()'>Google Login</button>
<script>
    const GOOGLE_CLIENT_ID = "1234567890123-your.google.client.id"; // Replace this with your actual client ID
    const REDIRECT_URL = window.location.href.split('?')[0]; // Current URL to redirect back from Google login page

    function googleLogin() {
        let rnd = Math.random().toString(36).substring(2); // Generate a random string

        // Build link to login page
        let url = 'https://accounts.google.com/o/oauth2/v2/auth';
        url += '?client_id=' + GOOGLE_CLIENT_ID;
        url += '&redirect_uri=' + encodeURIComponent(REDIRECT_URL);
        url += '&response_type=code';
        url += '&scope=' + encodeURIComponent('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');
        url += '&prompt=consent';
        url += '&state=' + encodeURIComponent(rnd);
        url += '&access_type=offline';

        // Redirect user to the URL
        window.location.href = url;
    }
</script>
```

### 5. Set Up Access Token Retrieval

When the user is authenticated and redirected back to your web application, use [`clientSecretRequest()`](/api-bridge/client-secret-request) to retrieve the access token. You need to add code that runs when the user is redirected back from the Google login page.

Once the access token is fetched, you can call [`openidLogin(event?:SubmitEvent | params): Promise<string>`](/api-reference/authentication/README.md#openidlogin) to log your users into your web application.

```html
<button onclick='googleLogin()'>Google Login</button>
<script>
    const GOOGLE_CLIENT_ID = "1234567890123-your.google.client.id"; // Replace this with your actual client ID
    const REDIRECT_URL = window.location.href.split('?')[0]; // Current URL to redirect back from Google login page

    function googleLogin() {
        let rnd = Math.random().toString(36).substring(2); // Generate a random string

        // Build link to login page
        let url = 'https://accounts.google.com/o/oauth2/v2/auth';
        url += '?client_id=' + GOOGLE_CLIENT_ID;
        url += '&redirect_uri=' + encodeURIComponent(REDIRECT_URL);
        url += '&response_type=code';
        url += '&scope=' + encodeURIComponent('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');
        url += '&prompt=consent';
        url += '&state=' + encodeURIComponent(rnd);
        url += '&access_type=offline';

        // Redirect user to the URL
        window.location.href = url;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code'); // Get the authorization code from URL parameters
        
    if (code) { // When the webpage is loaded, check if it's redirected from the Google login page.
        (async ()=>{
            // Safely retrieve access token using clientSecretRequest
            const data = await skapi.clientSecretRequest({
                clientSecretName: "ggltoken",
                url: 'https://oauth2.googleapis.com/token',
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                data: {
                    code: code,
                    client_id: GOOGLE_CLIENT_ID,
                    client_secret: "$CLIENT_SECRET",
                    redirect_uri: REDIRECT_URL,
                    grant_type: 'authorization_code'
                }
            });

            if (data.error) {
                console.error(data);
                throw data
            }

            // Use openIdLogin to log in
            await skapi.openIdLogin({ id: 'google', token: data.access_token });
            window.location.href = '/';
        })()
    }
</script>
```

:::warning
For this Google OAuth example, we use [`clientSecretRequest()`](/api-bridge/client-secret-request) to request an access token with a secured client secret key, and [`openidLogin()`](/api-reference/authentication/README.md#openidlogin) to actually sign up/log in the user to your service using the obtained access token.

Be sure to set up both Client Secret Keys and OpenID Loggers, and use the clientSecretName and OpenID Logger ID to securely make requests from the frontend.
:::

### [`openidLogin(event?:SubmitEvent | params): Promise<string>`](/api-reference/authentication/README.md#openidlogin)