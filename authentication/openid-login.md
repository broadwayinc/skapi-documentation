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
5. Setup the *Logger ID*. This is an identifier when using [`openidLogin()`](/api-reference/authentication/README.md#openidlogin).
6. Setup the *Username Key*. It should be an OpenID attribute name that hold unique identifier. Usually this can be **sub** or **email**.
7. Setup request parameters for your OpenID API.
8. Click **Save**

Once you have set up your *OpenID Logger*, your users can obtain a JWT Token from the OpenID provider. They can then use this token with Skapi to fetch their OpenID profile and automatically log in or create an account for your service using [`openidLogin()`](/api-reference/authentication/README.md#openidlogin).

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

### [`openidLogin(event?:SubmitEvent | params): Promise<string>`](/api-reference/authentication/README.md#openidlogin)