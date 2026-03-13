# Updating User Profile

:::warning
You must be logged in to call this method.
:::

You can update a user's profile using [`updateProfile()`](/api-reference/user/README.md#updateprofile).
If successful, the method returns the updated [UserProfile](/api-reference/data-types/README.md#userprofile) object.

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

### [`updateProfile(params): Promise<UserProfile>`](/api-reference/user/README.md#updateprofile)

:::tip
If you need to upload an image to a user's profile, first upload a public image file with [`postRecord()`](/api-reference/database/README.md#postrecord), then use the uploaded file URL in the profile attributes.
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

### [`updateProfile(params): Promise<UserProfile>`](/api-reference/user/README.md#updateprofile)
