# Updating User Profile

:::warning
User must be logged in to call this method
:::

User's profile can be updated using [`updateProfile()`](/api-reference/user/README.md#updateprofile).
If the update is successful, the updated [UserProfile](/api-reference/data-types/README.md#userprofile) object is returned if the request was successful.

:::danger

-   When the user change their email, they will be also changing their login email as well.
-   When user's email is changed, the email will be unverified.
    :::

In this example, the user's name is updated by providing a new `name` value.
If the update is successful, the updated user profile is returned.

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
    // misc, // Additional string value that can be used freely. This value is only visible from skapi.getProfile(). Not to others.
};

skapi.updateProfile(params).then((user) => {
    console.log({ user }); // User's name is updated.
});
```

:::

For more detailed information on all the parameters and options available with the [`updateProfile()`](/api-reference/user/README.md#updateprofile) method,
please refer to the API Reference below:

### [`updateProfile(params): Promise<UserProfile>`](/api-reference/user/README.md#updateprofile)

:::danger
Be aware that user profile attributes only take `string` as a value.

If you need to upload an image files to the user's profile, use [`postRecord()`](/api-reference/database/README.md#postrecord) method to upload a public image file first and use the uploaded file's URL as a value in the user profile attributes.
:::

## Public Attributes

Certain user profile attributes can be configured as public or private.
When the profile is public, the user's profile information can be searched by other users.
When the profile is private, the user's profile information cannot be searched by other users.

The following attributes can be set to public or private:

-   `email`
-   `phone_number`
-   `address`
-   `gender`
-   `birthdate`

By default, these attributes are set to private.

Here is an example of setting the user's email to public:

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

For more detailed information on all the parameters and options available with the [`updateProfile()`](/api-reference/user/README.md#updateprofile) method,
please refer to the API Reference below:

### [`updateProfile(params): Promise<UserProfile>`](/api-reference/user/README.md#updateprofile)
