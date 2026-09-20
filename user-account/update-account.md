# Updating User Profile

:::warning
You must be logged in to call this method.
:::

You can update a user's profile using [`updateProfile()`](/api-reference/user/README.md#updateprofile).
If successful, the method returns the updated [UserProfile](/api-reference/data-types/README.md#userprofile) object.

:::danger
-   When the email is changed, it becomes unverified.
-   Changing the email does **not** hand email login to the new address. The new address logs the
    account in only once the user verifies it with
    [`verifyEmail()`](/api-reference/user/README.md#verifyemail), and then a few seconds later, on the
    account's next token rather than in the `verifyEmail()` response.
-   The old address stops logging the account in on that same next token. A `username`, if the account
    has one, is permanent and is not affected, and neither is the address a no-username account was
    created with. See [Which ID logs a user in](#which-id-logs-a-user-in) below.
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

## Which ID logs a user in

An account has **one or two** ways in:

-   The **login ID it was created with**: its `username` when it was created with one, otherwise the
    email address it signed up with. It is permanent, no method changes it, and it keeps working after
    the account changes its email.
-   Its **email login**: the account's current email address, and only once that address is **verified**.

**Account created with a username.** The username is the permanent login ID and never changes. The
current email logs the user in too, once it is verified. Change the email and the account is left with
its username alone: the old address stops working on the next token, and the new one starts working a
few seconds after [`verifyEmail()`](/api-reference/user/README.md#verifyemail) succeeds.

**Account created without a username.** The address the account signed up with keeps working as a login
ID forever, even after the email is changed, because that original address is what identifies the
account internally. A changed address is an email login on top of it, so it works only once it is
verified, and it stops working when the email is changed again.

So if you need an address to stop being a way in, give the account a `username` at creation. Only then
does the original address lose its hold.

An email address proves the account owns it when the user clicks the signup confirmation link, accepts
an invitation, or calls `verifyEmail()` successfully. Until then it does not reach the account at all,
and it answers `INCORRECT_USERNAME_OR_PASSWORD`. If the address is already a login ID another account of
the project was granted, email login is not enabled and the account's own login ID still works. See
[E-Mail and username](/authentication/create-account.md#e-mail-and-username) and
[Login IDs](/admin/permissions.md#login-ids).

:::warning An admin changing the email takes email login away at once
An email an admin sets with [`updateUserAttributes()`](/api-reference/admin/README.md#updateuserattributes),
or with `updateProfile()` and another user's `user_id`, is written unverified and the account's email
login is removed inside that request, whoever sent it. The account keeps its own login ID, and gets an
email login back only after the user verifies the new address.
:::
