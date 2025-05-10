# Open ID Login

Skapi provides logger for OpenID profiles.

## What is OpenID?

OpenID is an open standard and decentralized authentication protocol that allows users to be authenticated by relying on a third-party service, called an OpenID provider, without needing to have a separate identity and password for each service. This simplifies the login process for users and enhances security by reducing the number of passwords that need to be managed.

With OpenID, users can log in to multiple websites using a single set of credentials from an OpenID provider such as Google, Facebook, or other identity providers. This process involves redirecting the user to the OpenID provider's login page, where they authenticate themselves, and then returning to the original website with a token that confirms their identity.

## Login with OpenID profile

If you have access to OpenID providers API, you can register your open ID logger from your Skapi's service page.

Although all OpenID providers have different ways to authenticate their users, generally it follows such process:

1. Register open ID logger in Skapi
2. Redirect user to OpenID provider's login page
3. Redirect authenticated user's back to your webpage
4. Retrive access token to call [`openidLogin()`](/api-reference/authentication/README.md#openidlogin)
5. User will get logged in to your Skapi application.

## Google OAuth Example

In this example, we will show implementing Google OAuth as an example.

### 1. Setup Google OAuth Service

Go to your [Google Cloud Console](https://console.cloud.google.com/)
and create your OAuth service.

Follow their [Instructions](https://support.google.com/googleapi/answer/6158849?hl=en).
Make sure to setup correct redirect URL that points to your web application.

### 2. Register Your OpenID logger in Skapi

1. Login to [skapi.com](https://www.skapi.com).
2. Click on the service you wish to register your OpenID Logger.
3. From the side menu, click on **OpenID Logger**
4. Click **Register Logger**
5. Setup the *Logger ID*. This is an identifier when using [`openidLogin()`](/api-reference/authentication/README.md#openidlogin). It can be anything you want. But for this example set it to **google**
6. Setup request URL to Google API where you can retrieve user's profile. Set it to **https://www.googleapis.com/oauth2/v3/userinfo**
7. Setup the *Username Key*. It should be an OpenID attribute name that hold unique identifier. For this example set it to **email**.
8. Setup request headers as below:
    ```
    {
        "Authorization": "Bearer $TOKEN"
    }
    ```
9. Click **Save**


### 3. Register Client Secret Key

When retriving token for Google OAuth authentication, Google API requires client secret key.

Since client secret key should not be exposed, register the client secret key of your OAuth service in Skapi.

1. In the service page, click on **Client Secret Key** menu.
2. Click on **Register Client Secret Key**.
3. Give a name to your secret key. It can be anything you want. But for this example, lets set it to **ggltoken**
4. Enter the client secret key you obtained from your new google OAuth service.
5. Click on the check to save.

### 4. Setup Link To Google Login

Create a link url and the button to google OAuth login page.

```html
<button onclick='googleLogin()'>Google Login</button>
<script>
    const GOOGLE_CLIENT_ID = "1234567890123-your.google.client.id"; // Replace this to your actual client id
    const REDIRECT_URL = window.location.href.split('?')[0]; // current URL to redirect back from google login page.

    function googleLogin() {
        let rnd = Math.random().toString(36).substring(2); // Generate a random string

        // Bulid link to login page
        let url = 'https://accounts.google.com/o/oauth2/v2/auth';
        url += '?client_id=' + GOOGLE_CLIENT_ID;
        url += '&redirect_uri=' + encodeURIComponent(REDIRECT_URL);
        url += '&response_type=code';
        url += '&scope=' + encodeURIComponent('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');
        url += '&prompt=consent';
        url += '&state=' + encodeURIComponent(rnd);
        url += '&access_type=offline';

        // Redirect user to the url
        window.location.href = url;
    }
</script>
```

### 5. Setup to Retrieve Access Token

When user is authenticated and redirected back to your web application,
Use [`clientSecretRequest()`](/api-bridge/client-secret-request) to retrieve the access token.
You need to add code that runs when the user is redirected back from the google login page.

Once the access token is fetched, you can call [`openidLogin(event?:SubmitEvent | params): Promise<string>`](/api-reference/authentication/README.md#openidlogin) to actually log your users to your web application.

```html
<button onclick='googleLogin()'>Google Login</button>
<script>
    const GOOGLE_CLIENT_ID = "1234567890123-your.google.client.id"; // Replace this to your actual client id
    const REDIRECT_URL = window.location.href.split('?')[0]; // current URL to redirect back from google login page.

    function googleLogin() {
        let rnd = Math.random().toString(36).substring(2); // Generate a random string

        // Bulid link to login page
        let url = 'https://accounts.google.com/o/oauth2/v2/auth';
        url += '?client_id=' + GOOGLE_CLIENT_ID;
        url += '&redirect_uri=' + encodeURIComponent(REDIRECT_URL);
        url += '&response_type=code';
        url += '&scope=' + encodeURIComponent('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');
        url += '&prompt=consent';
        url += '&state=' + encodeURIComponent(rnd);
        url += '&access_type=offline';

        // Redirect user to the url
        window.location.href = url;
    }

    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('code')) { // When the webpage is loaded, check if it's redirected from the google login page.
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

            // use openIdLogin to login
            await skapi.openIdLogin({ id: 'google', token: data.access_token });
            window.location.href = '/';
        })()
    }
</script>
```


### [`openidLogin(event?:SubmitEvent | params): Promise<string>`](/api-reference/authentication/README.md#openidlogin)