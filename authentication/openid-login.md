# Open ID Login

Skapi provides logger for OpenID profiles.

## What is OpenID?

OpenID is an open standard and decentralized authentication protocol that allows users to be authenticated by relying on a third-party service, called an OpenID provider, without needing to have a separate identity and password for each service. This simplifies the login process for users and enhances security by reducing the number of passwords that need to be managed.

With OpenID, users can log in to multiple websites using a single set of credentials from an OpenID provider such as Google, Facebook, or other identity providers. This process involves redirecting the user to the OpenID provider's login page, where they authenticate themselves, and then returning to the original website with a token that confirms their identity.

## Login with OpenID profile

If you have access to OpenID providers API, you can register your open ID logger from your Skapi's service page.

1. Login to [skapi.com](https://www.skapi.com).
2. Click on the service you wish to register your OpenID Logger.
3. From the side menu, click on **OpenID Logger**
4. Click **Register Logger**
5. Set your *Logger ID*, *Username Key*, and all the request parameter to make to your Open ID API service.
6. Click **Save**

Once you have setup your *OpenID Logger*, you can let your users to obtain the JWT Token and use it to make request to Skapi to automatically login/create an account for your service with [`openidLogin()`](/api-reference/authentication/README.md#openidlogin)

```js
skapi.openidLogin({
    token: "Token.fetched.from.openid.service",
    id: "Your Registered OpenID Logger ID"
}).then(result => {
    // User is logged in!
    console.log(result);

    // {
    //     userProfile: {
    //         ...
    //     },
    //     openid: {
    //         ... Attributes from open id API service
    //     }
    // }
});
```