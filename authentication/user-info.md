# User Profile

Once a user has logged in, they can retrieve their profile information.
The profile data is structured as an OpenID-compliant JavaScript object.

## Requesting User Information

The [`getProfile()`](/api-reference/authentication/README.md#getprofile) method allows you to retrieve the user's information via promise method.
It returns the [UserProfile](/api-reference/data-types/README.md#userprofile) object.

If the user is not logged in, [`getProfile()`](/api-reference/authentication/README.md#getprofile) returns `null`.

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

For more detailed information on all the parameters and options available with the [`getProfile()`](/api-reference/authentication/README.md#getprofile) method, 
please refer to the API Reference below:

### [`getProfile(options?): Promise<UserProfile | null>`](/api-reference/authentication/README.md#getprofile)


## Listening to User's Profile Updates

You can listen to the updates of the user profiles by setting a callback function in the `option.eventListener.onUserUpdate` option argument of the constructor argument in Skapi.

The `onUserUpdate` callback function will be triggered in the following scenarios: when the webpage loads and the Skapi instance is initialized with the user's current authentication state, when a user logs in or logs out, and when their profile information is updated, and when the user loses their session due to an expired token.

If the user is logged in, the callback receives the [UserProfile](/api-reference/data-types/README.md#userprofile) object; otherwise, it receives `null`.

```js
const options = {
  eventListener: {
    onUserUpdate: (profile) => {
      console.log(profile); // is null when user is logged out, User's information object when logged in.
    }
  }
};

const skapi = new Skapi('service_id', 'owner_id', options);
```

You can also add multiple event listeners to the `onUserUpdate` event after the Skapi object has been initialized.

```js
skapi.onUserUpdate = (profile) => {
  console.log(profile); // null when user is logged out, User's information object when logged in.
}
```

This handler is useful for updating the UI when the user logs in, logs out, or when their profile information changes.
