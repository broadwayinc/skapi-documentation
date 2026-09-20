# API Reference: Admin

Below are the parameters and return data type references for the methods in TypeScript format.

## inviteUser

```ts
inviteUser(
    params: SubmitEvent | {
        email: string; // Required. The invitation, with the temporary password and the link to accept, is sent here.
        username?: string; // Optional. Becomes the invited account's PERMANENT login ID and can never be changed. Accepting the invitation verifies the email address, so the email logs the account in as well from then on.
        name?: string;
        nickname?: string;
        phone_number?: string; // Must be in "+0012341234" format.
        address?: string | {
            formatted: string;
            locality: string;
            region: string;
            postal_code: string;
            country: string;
        }; // OpenID Standard Claims object is also supported.
        gender?: string;
        birthdate?: string; // Must be in YYYY-MM-DD format.
        picture?: string; // URL of the profile picture.
        profile?: string; // URL of the profile page.
        website?: string; // URL of the website.
        misc?: string; // Additional string value that can be used freely. Visible to the account owner, to admins and to the project owner.
        email_public?: boolean; // Default = false. When true, the email is visible to other users.
        phone_number_public?: boolean; // Default = false. When true, the phone number is visible to other users.
        address_public?: boolean; // Default = false. When true, the address is visible to other users.
        gender_public?: boolean; // Default = false. When true, the gender is visible to other users.
        birthdate_public?: boolean; // Default = false. When true, the birthdate is visible to other users.
        openid_id?: string; // ID of an OpenID logger registered in the project, to link the invited account to it.
        access_group?: number; // 1~99. Default = 1. 99 is admin level. An admin cannot set it higher than their own access group.
    },
    options?: {
        /**
         * URL the user is taken to after they accept the invitation.
         * Must not contain the "#" character.
         */
        confirmation_url?: string;

        /**
         * When true, the user is subscribed to Service Email (group 1) once they accept.
         * Requires 'confirmation_url' to be set. (Default = false)
         */
        email_subscription?: boolean;

        /**
         * A custom HTML template for this invitation e-mail, used instead of the project's.
         * Both fields are required. See [Required Placeholders for Invitation E-Mail](/email/email-templates.md#required-placeholders-for-invitation-email).
         */
        template?: {
            url: string; // URL of the HTML template.
            subject: string; // Subject line of the e-mail.
        };
    }
): Promise<'SUCCESS: Invitation has been sent. (User ID: xxx...)'>
```

Every profile attribute given here is written to the account when the invitation is sent, and is kept
unchanged when the user accepts. Accepting only activates the account and marks its email verified.

#### Errors
```ts
{
  code: 'INVALID_REQUEST';
  message: "User needs to login." | "Invalid access."; // Only admins (access_group 90 and above) can invite.
}
|
{
  code: 'INVALID_REQUEST';
  message: "Email is required." | "User limit exceeded." | "Cannot give a user an access group higher than your own." | "OpenID logger not found." | 'Character "#" is not allowed in signup confirmation url.' | "Too many requests.";
}
|
{
  code: 'EXISTS';
  message: "User is already invited."; // The email already has a pending invitation, whatever the 'username' of either invitation. Or the login ID this invitation would be created with ('username', or the email when there is none) is the one another account was already created or invited with, for example the same 'username' again, whatever the email. See "Inviting the same email again" below.
}
|
{
  code: 'EXISTS';
  message: 'E-mail "user@email.com" is already a login ID in this service.' | 'Username "jane@email.com" is already a login ID in this service.' | "The login ID is already used by another account in this service.";
  // Any invitation without 'openid_id'. Which message, and exactly when, is listed below.
}
|
{
  code: 'INVALID_PARAMETER';
  message: '"options.confirmation_url" is required for email subscription.' | '"options.template" should be type: <object> with "url" and "subject".';
}
```

Every invitation, with or without `openid_id`, is first checked for a pending invitation to the same
email, and refused with `User is already invited.` when there is one: an invitation that has not been
accepted, cancelled or expired, sent to an account whose email is still that address. After that,
every invitation without `openid_id` is checked before the account is created:

- **Without `username`**, it is refused with `E-mail "user@email.com" is already a login ID in this service.`
  when the email is a login ID another account was **granted** through its email login: an address that
  account has verified. An email that is another account's original login ID (its `username`, or the
  email it was created with when it has none) is a duplicate instead and gives `User is already invited.`
- **With `username`**, it is refused with the same `E-mail` error when the email is a login ID another
  account was granted in any way: as that account's original login ID, or as an address it has verified.
  It is refused with `Username "jane@email.com" is already a login ID in this service.` when the
  `username` is such an address, which only an e-mail address can be, so a `username`
  such as `jane_doe` never gets this error. A `username` that another account was created or invited
  with gives `User is already invited.`

An email login another account holds **without** having verified the address is not a login ID anyone
was granted. It refuses nothing: it is removed, that account keeps logging in with the login ID it was created with, and the
invitation goes out. See [Login IDs](/admin/permissions.md#login-ids).

These checks are lookups made just before the account is created, not reservations: two invitations
for the same email sent at the same moment can both pass them. The account creation itself checks the
invitation's own login ID once more, and refuses one that already logs another account in through its
email login with `E-mail "user@email.com" is already a login ID in this service.` (without `username`) or
`The login ID is already used by another account in this service.` (with `username`). When a check
cannot get an answer in time, the invitation is not refused by it.

When `username` is given, the email starts logging the account in when the user accepts the invitation,
because accepting verifies the address, and not while it is pending. If that address is already a login
ID another account was granted by then, email login is not enabled and the username still logs the
account in. An invitation with `openid_id` never gets email login.

#### Inviting the same email again

While the first invitation is still pending, a second invitation to the same email is refused with
`User is already invited.`, whatever the `username` of either invitation. Once the first invitation was
accepted, what happens depends on the `username` of both invitations, because an invitation's login ID
is its `username` when it has one, and its email otherwise:

- **The same `username` again**, with the same email or another one: `User is already invited.`, also
  while the first invitation is pending.
- **No `username` both times**: `User is already invited.`
- **A `username` in either invitation, and not the same one**:
  `E-mail "user@email.com" is already a login ID in this service.`, since the email then logs the first
  account in.

To change the `username` of a pending invitation, cancel it with [`cancelInvitation()`](#cancelinvitation)
first, then invite again.

## resendInvitation

```ts
resendInvitation(
    params: {
        email: string; // Required. Max 64 characters.
    }
): Promise<'SUCCESS: Invitation has been re-sent. (User ID: xxx...)'>
```

A resent invitation renders `${username}` the same way as the first e-mail: the login username for an
invitation created with a `username`, the email otherwise. An invitation sent before the backend started
keeping the plain username with the invitation is the exception: a resend of it renders the email even
when it has a `username`, although that email does not log the invitee in until they accept.

#### Errors
```ts
{
  code: 'NOT_EXISTS';
  message: "No invitation found for: user@email.com."; // No invitation is found for the email. This is also the answer for an invitation made WITH a 'username' that has already been accepted.
}
|
{
  code: 'EXISTS';
  message: "User already exists."; // The account found for the email is not a pending invitation, for example an invitation made WITHOUT a 'username' that has already been accepted.
}
```

## getInvitations

```ts
getInvitations(params?: {
    email?: string; // When set, only invitations with the email starting with the given string will be returned.
}, fetchOptions?: FetchOptions): Promise<DatabaseResponse<UserProfile>>
```

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse).

See [UserProfile](/api-reference/data-types/README.md#userprofile).

See [FetchOptions](/api-reference/data-types/README.md#fetchoptions).


## cancelInvitation

```ts
cancelInvitation(params: {
    email: string; // email of the user to cancel the invitation.
}): Promise<"SUCCESS: Invitation has been canceled.">
```

## grantAccess

```ts
grantAccess(params: {
    user_id: string; // User ID to grant access.
    access_group: number; // Access group level of the user. (1~99) 99 is admin level. An admin cannot grant higher than their own access group, and cannot act on an account whose access group is the same as their own or higher.
}): Promise<'SUCCESS: Access has been granted to the user.'>
```

#### Errors
```ts
{
  code: 'INVALID_REQUEST';
  message: "No access to modify admin."; // The caller is an admin in access groups 90 ~ 98 and the account's access group is the same as or higher than their own. Nothing is changed.
}
|
{
  code: 'INVALID_REQUEST';
  message: "No access to expel admin."; // Changing the access group of an access group 99 account, from anyone but an access group 99 admin and the project owner.
}
|
{
  code: 'INVALID_REQUEST';
  message: "Cannot grant an access group higher than your own." | "User cannot self grant access." | "Cannot grant access to suspended user." | "User signup is not confirmed." | "No access."; // "No access." is an account of another project.
}
|
{
  code: 'INVALID_PARAMETER';
  message: '"access_group" should be within range: 0 ~ 99.';
}
|
{
  code: 'NOT_EXISTS';
  message: "User does not exists.";
}
```

An admin in access groups `90` ~ `98` can change the access group only of accounts whose access group is
lower than their own, and only to a group up to their own. A
[disabled](/user-account/disable-recover-account.md) account counts with the access group it had before
it was disabled. Admins in access group `99` and the project owner are limited by neither rule. See
[Admin Permissions](/admin/permissions.md#granting-an-access-group).

## createAccount

```ts
createAccount(
    params: {
        name?: string;
        email: string; // Required.
        phone_number?: string;
        address?: string | {
            formatted: string;
            locality: string;
            region: string;
            postal_code: string;
            country: string;
        };
        gender?: string;
        birthdate?: string;
        misc?: string;
        picture?: string;
        profile?: string;
        website?: string;
        nickname?: string;
        email_public?: boolean; // When set to true, email attribute is visible to others.
        phone_number_public?: boolean; // When set to true, phone_number attribute is visible to others.
        address_public?: boolean; // When set to true, address attribute is visible to others.
        gender_public?: boolean; // When set to true, gender attribute is visible to others.
        birthdate_public?: boolean; // When set to true, birthdate attribute is visible to others.
        password: string; // Required. At least 6 characters and a maximum of 60 characters.
        username?: string; // Optional. Becomes the account's PERMANENT login ID and can never be changed. The email logs the account in only once the user verifies it with verifyEmail(): creating the account does not verify the address.
        access_group?: number; // 1~99. Default = 1. An admin cannot set it higher than their own access group.
    }
): Promise<UserProfile & { email_admin: string; username: string; }>
```

See [UserProfile](/api-reference/data-types/README.md#userprofile).

#### Errors
```ts
{
  code: 'INVALID_REQUEST';
  message: "User needs to login." | "Invalid access."; // Only admins (access_group 90 and above) can create accounts.
}
|
{
  code: 'INVALID_REQUEST';
  message: "User limit exceeded." | "Cannot give a user an access group higher than your own." | "OpenID logger not found." | "Too many requests.";
}
|
{
  code: 'EXISTS';
  message: "User already exists."; // The login ID this account would be created with ('username', or the email when there is none) is the one another account was already created or invited with, for example the same 'username' again, whatever the email, or the same email again, both times without 'username'.
}
|
{
  code: 'EXISTS';
  message: 'E-mail "user@email.com" is already a login ID in this service.' | 'Username "jane@email.com" is already a login ID in this service.' | "The login ID is already used by another account in this service.";
  // Any request without 'openid_id'. The same conditions as inviteUser().
}
```

Every request without `openid_id` is checked before the account is created, with the same login ID
conditions and messages as [`inviteUser()`](#inviteuser):

- **Without `username`**, `E-mail "user@email.com" is already a login ID in this service.` when the email
  is a login ID another account was granted through its email login, meaning an address that account has
  verified. An email that another account was itself created or invited with, without `username`, is a
  duplicate and gives `User already exists.`
- **With `username`**, the same `E-mail` error when the email is a login ID another account was granted
  in any way, and `Username "jane@email.com" is already a login ID in this service.` when the `username`
  is an e-mail address another account was granted that way. A `username` that another
  account was created or invited with is a duplicate and gives `User already exists.`

The account creation checks the account's own login ID once more, the same way as for an invitation, and
refuses it with `E-mail "user@email.com" is already a login ID in this service.` (without `username`) or
`The login ID is already used by another account in this service.` (with `username`). Unlike
`inviteUser()`, `createAccount()` does not check for a pending invitation to the same email.

A pending invitation that has a `username` does not hold its email as a login ID yet: the email starts
logging that account in when the invitation is accepted. Creating an account with that email,
without a `username` or with a different one, is therefore not refused: it creates a separate account,
and the invited account logs in with its username only once accepted.

When `username` is given, the email does **not** log the account in yet. `createAccount()` does not
verify the address, so the account logs in with its username until the user verifies the address with
[`verifyEmail()`](/api-reference/user/README.md#verifyemail), after which email login starts on the
account's next token, a few seconds later. An account created without a `username` logs in with the
address it was created with from the start, because that address is its own permanent login ID. See
[Login IDs](/admin/permissions.md#login-ids).

## updateUserAttributes

```ts
updateUserAttributes(
    params: {
        user_id: string; // Required. The ID of the user whose attributes will be updated.
        name?: string;
        email?: string; // Written unverified, and the account's email login is removed. The new address logs the account in only after the user verifies it with verifyEmail(). Refused with EXISTS when the address is already a login ID another account was granted. A 'username' is permanent and never changes.
        phone_number?: string;
        address?: string | {
            formatted: string;
            locality: string;
            region: string;
            postal_code: string;
            country: string;
        };
        gender?: string;
        birthdate?: string;
        misc?: string;
        picture?: string;
        profile?: string;
        website?: string;
        nickname?: string;
        email_public?: boolean; // When set to true, email attribute is visible to others.
        phone_number_public?: boolean; // When set to true, phone_number attribute is visible to others.
        address_public?: boolean; // When set to true, address attribute is visible to others.
        gender_public?: boolean; // When set to true, gender attribute is visible to others.
        birthdate_public?: boolean; // When set to true, birthdate attribute is visible to others.
    }
): Promise<'SUCCESS: User attributes updated.'>
```

At least one attribute must be provided in addition to the required `user_id`.

#### Errors
```ts
{
  code: 'INVALID_REQUEST';
  message: "No access to modify admin."; // The caller is an admin in access groups 90 ~ 98 and the account's access group is the same as or higher than their own. Nothing is changed.
}
|
{
  code: 'INVALID_REQUEST';
  message: "Cannot modify attributes of the current user."; // The 'user_id' is the caller's own. Refused for everyone, the project owner and access group 99 admins included, before anything is read or written. Use updateProfile() with no 'user_id' instead.
}
|
{
  code: 'EXISTS';
  message: 'E-mail "user@email.com" is already a login ID in this service.'; // The new 'email' is already a login ID another account was granted: that account's original login ID (its 'username', or the email it was created with when it has none), or an address it has verified.
}
|
{
  code: 'INVALID_REQUEST';
  message: "The login username is permanent and cannot be changed."; // A request that sets the login handle ('preferred_username') without 'email'. updateUserAttributes() never sends one on its own.
}
|
{
  code: 'NOT_EXISTS';
  message: "User not found"; // No account of this project has the 'user_id'.
}
```

An admin in access groups `90` ~ `98` can update only accounts whose access group is lower than their
own: an admin in access group `95` can update an account in access group `94`, but not one in `95` or
`99`. Any other target is refused with `No access to modify admin.` before anything is changed. A
[disabled](/user-account/disable-recover-account.md) account counts with the access group it had before
it was disabled. The project owner and admins in access group `99` are not limited by this rule. See
[The rank rule](/admin/permissions.md#the-rank-rule).

Nobody updates their own account with this method. A `user_id` equal to the caller's own is refused with
`Cannot modify attributes of the current user.`, for the project owner and access group `99` admins as
well, both in the SDK before the request leaves and on the server. Use
[`updateProfile()`](/api-reference/user/README.md#updateprofile) with no `user_id`.

When `email` changes, the server derives the account's email login from the new address itself and
ignores any login handle the request sends. Before anything is written it checks that the address is not
already a login ID another account was granted, and refuses the whole request with the `EXISTS` error
above when it is, so none of the other attributes in that request are changed either. An email login
another account holds without having verified the address is removed instead, and the request goes
through. If a check cannot be made, the request fails without changing anything and can be sent again.
No admin method changes a login `username`.

The new `email` is written unverified and the account's **email login is removed** in the same request,
whoever sends it, the project owner and admins in access group `99` included: this method cannot mark an
e-mail address verified. The account keeps logging in with its `username`, or with the address it was
created with when it has none, and gets an email login back only after the user runs
[`verifyEmail()`](/api-reference/user/README.md#verifyemail) on the new address, on the account's next
token a few seconds later.

Sending the address the account already has, already verified, is not treated as a change: it is left
out of the request, and the account keeps its verification and its email login.

[`updateProfile()`](/api-reference/user/README.md#updateprofile) called with the `user_id` of another
user sends this same request, so the same rules and errors apply, and it resolves with the same
`'SUCCESS: User attributes updated.'`. It leaves out every value that equals the caller's own profile,
so use `updateUserAttributes()` to set another user's attribute to the value the caller has.

## deleteAccount

```ts
deleteAccount(params: {
    user_id: string; // An admin in access groups 90 ~ 98 can delete only accounts in a lower access group than their own. Your own user_id deletes your own account.
}): Promise<'SUCCESS: Account has been deleted.'>
```

#### Errors
```ts
{
  code: 'INVALID_REQUEST';
  message: "No access to modify admin."; // The caller is an admin in access groups 90 ~ 98 and the account's access group is the same as or higher than their own. Nothing is deleted.
}
|
{
  code: 'INVALID_REQUEST';
  message: "Admin access only." | "No access."; // Deleting another account from an account that is not an admin, or an account of another project.
}
|
{
  code: 'NOT_EXISTS';
  message: "User does not exists.";
}
```

## blockAccount

```ts
blockAccount(params: {
    user_id: string; // An admin in access groups 90 ~ 98 can block only accounts in a lower access group than their own.
}): Promise<'SUCCESS: The user has been blocked.'>
```

#### Errors
```ts
{
  code: 'INVALID_REQUEST';
  message: "No access to modify admin."; // The caller is an admin in access groups 90 ~ 98 and the account's access group is the same as or higher than their own. Nothing is changed.
}
|
{
  code: 'INVALID_REQUEST';
  message: "User cannot block self.";
}
|
{
  code: 'NOT_EXISTS';
  message: "User does not exists.";
}
```

## unblockAccount

```ts
unblockAccount(params: {
    user_id: string; // An admin in access groups 90 ~ 98 can unblock only accounts in a lower access group than their own.
}): Promise<'SUCCESS: The user has been unblocked.'>
```

#### Errors
```ts
{
  code: 'INVALID_REQUEST';
  message: "No access to modify admin."; // The caller is an admin in access groups 90 ~ 98 and the account's access group is the same as or higher than their own, so a lower admin cannot let back in an account a higher admin blocked.
}
|
{
  code: 'INVALID_REQUEST';
  message: "User cannot unblock self.";
}
|
{
  code: 'NOT_EXISTS';
  message: "User does not exists.";
}
```

For all three methods a [disabled](/user-account/disable-recover-account.md) account counts with the
access group it had before it was disabled, and admins in access group `99` and the project owner are
not limited by the rank rule. See [Admin Permissions](/admin/permissions.md#the-rank-rule).
