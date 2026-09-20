# API Reference: Authentication

Below are the parameters and return data type references for the methods in TypeScript format.

## signup

```ts
signup(
    params: SubmitEvent | { 
        email: string; // Required. Must be in email format. ex) user@email.com
        username?: string; // Optional. Becomes the account's PERMANENT login ID and can never be changed. The email logs the account in as well once that address is VERIFIED (not before), unless it is already a login ID another account was granted. A changed email logs the account in only after it is verified too.
        password: string; // At least 6 characters and a maximum of 60 characters.
        name?: string;
        phone_number?: string; // Must be in "+0012341234" format.
        address?: string | {
            formatted: string;
            locality: string;
            region: string;
            postal_code: string;
            country: string;
        }; // OpenID Standard Claims object is also supported.
        gender?: string;
        birthdate?: string; // Must be in YYYY-MM-DD format
        picture?: string; // URL of the profile picture.
        profile?: string; // URL of the profile page.
        website?: string; // URL of the website.
        nickname?: string; // Nickname of the user.
        misc?: string; // Additional string value that can be used freely. Visible to the account owner, to admins and to the project owner.
        email_public?: boolean; // Default = false
        phone_number_public?: boolean; // Default = false
        address_public?: boolean; // Default = false
        gender_public?: boolean; // Default = false
        birthdate_public?: boolean; // Default = false
    },
    options?: {
        /**
         * When true, user is required to confirm their signup confirmation on first login. (Default = false).
         * When URL or relative path of the website is given, It will redirect the user after successful confirmation.
         * NOTE: Relative path will not work if the website is not hosted.
         */
        signup_confirmation?: boolean | string;

        /** When true, user is subscribed to Service Email (group 1) and can receive it from the admin. (Default = false) */
        email_subscription?: boolean;

        /** When true, user is logged in soon as the signup process is sucessful.
         * Cannot use with 'signup_confirmation'. (Default = false)
         */
        login?: boolean;

        /**
         * Per-call e-mail template overrides.
         * Each value is the message_id of a template already uploaded to your project's
         * Automated Emails page. Overrides your project's template for this call only.
         * See [Automated Emails](/email/email-templates.md#overriding-the-template-for-a-single-call).
         */
        template?: {
            /**
             * message_id of the template to use for the signup confirmation e-mail.
             * 'signup_confirmation' must also be set, otherwise throws INVALID_PARAMETER.
             */
            signup_confirmation?: string;

            /** message_id of the template to use for the welcome e-mail. */
            welcome?: string;
        };
    }
): Promise<
    UserProfile |
    "SUCCESS: The account has been created. User's signup confirmation is required." |
    "SUCCESS: The account has been created.">
```

See [UserProfile](/api-reference/data-types/README.md#userprofile)

#### Errors
```ts
{
  code: 'EXISTS';
  message: "The account already exists.";
}
|
{
  code: 'EXISTS';
  message: 'E-mail "user@email.com" is already a login ID in this service.' | "The login ID is already used by another account in this service.";
  // 'E-mail': a signup without 'username' whose email is already the email login another account was GRANTED by verifying that address. The other: a 'username' that is such an address, which only an e-mail address such as "jane@email.com" can be.
}
|
{
  code: 'REQUEST_EXCEED';
  message: "Too many attempts. Please try again later.";
}
|
{
  code: 'CODE_DELIVERY_FAILURE';
  message: "Failed to deliver verification code.";
}
|
{
  code: 'INVALID_REQUEST';
  message: "Signup validation failed.";
}
|
{
  code: 'ERROR';
  message: "Failed to signup.";
}
```

A signup is refused when its login ID is already a login ID another account of the project was granted,
for example a signup without `username` using the verified email of an account that was created with a
username. A login ID an account holds without proof, such as an email login for an address it never
verified, refuses nothing: it is removed and the signup goes through.
A login ID another account was itself created with gives `The account already exists.` instead. A signup
with a `username` whose email is already another account's login ID is not refused: the account is
created and only its username logs it in. See
[When a login ID is already taken](/authentication/create-account.md#when-a-login-id-is-already-taken).

## resendSignupConfirmation

```ts
resendSignupConfirmation(): Promise<'SUCCESS: Signup confirmation e-mail has been sent.'>
```

#### Errors
```ts
{
  code: 'INVALID_REQUEST',
  message: 'Least one login attempt is required.'
}
```

## login

```ts
login(
    params: SubmitEvent | {
        username?: string; // The account's permanent login username, when it was created with one.
        email: string; // The account's current email, once it is verified, or the address the account was created with when it has no username. Required unless 'username' is given. An unverified address answers INCORRECT_USERNAME_OR_PASSWORD.
        password: string;
    }
): Promise<UserProfile>
```

See [UserProfile](/api-reference/data-types/README.md#userprofile)

#### Errors
```ts
{
  code: "SIGNUP_CONFIRMATION_NEEDED";
  message: "The account signup needs to be confirmed.";
}
|
{
  code: 'USER_IS_DISABLED';
  message: 'This account is disabled.';
}
|
{
  code: 'INCORRECT_USERNAME_OR_PASSWORD';
  message: 'Incorrect username or password.';
}
|
{
  code: 'REQUEST_EXCEED';
  message: 'Too many attempts. Please try again later.';
}
```

## getProfile

```ts
getProfile(
    options?: {
        /** When true, JWT token is refreshed before fetching the user attributes. (Default = false) */
        refreshToken?: boolean;
    }
): Promise<null | UserProfile>
```

See [UserProfile](/api-reference/data-types/README.md#userprofile)

## logout

```ts
logout(params?: { global: boolean; }): Promise<'SUCCESS: The user has been logged out.'>
```

## forgotPassword

```ts
forgotPassword(
    params: SubmitEvent | {
        email: string;
    },
    options?: {
        /**
         * Per-call e-mail template override.
         * See [Automated Emails](/email/email-templates.md#overriding-the-template-for-a-single-call).
         */
        template?: {
            /** message_id of the template to use for the e-mail carrying the password reset code. */
            verification?: string;
        };
    }
): Promise<'SUCCESS: Verification code has been sent.'>
```

#### Errors
```ts
{
    code: "NOT_EXISTS";
    message: "Username/client id combination not found."
}
|
{
    code: "INVALID_REQUEST";
    message: "User is disabled." | "User password cannot be reset in the current state."
}
|
{
    code: "REQUEST_EXCEED";
    message: "Attempt limit exceeded, please try after some time." | "Rate exceeded";
}
|
{
    code: "CODE_DELIVERY_FAILURE";
    message: "Unable to deliver code to user"
}
```

## resetPassword

```ts
resetPassword(
    params: SubmitEvent | {
        email: string;
        code: string | number;
        new_password: string; // At least 6 characters and a maximum of 60 characters.
    }
): Promise<'SUCCESS: New password has been set.'>
```

## openIdLogin

```ts
openIdLogin(
    params: SubmitEvent | {
        token: string; // ID/Access token fetched from OpenID API service
        id: string; // OpenID Logger ID registered in the project page.
        merge?: boolean | string[] // When true, merges with the previous account whose original login ID matches this OpenID account's. When string[] is given, account is merged with the specified OpenID attribute values. Never matches through an email login alias.

        /**
         * Per-call e-mail template override.
         * See [Automated Emails](/email/email-templates.md#overriding-the-template-for-a-single-call).
         */
        template?: {
            /** message_id of the template to use for the welcome e-mail, sent the first time this OpenID account is created. */
            welcome?: string;
        };
    }
): Promise<{
    userProfile: UserProfile;
    openid: { [attribute:string]: string };
}>
```

#### Errors
```ts
{
    code: "ACCOUNT_EXISTS";
    message: "The account already exists."; // This occurs when the user's OpenID unique ID has already been registered through a basic signup.
}
|
{
    code: "INVALID_REQUEST";
    message: "The account needs to be confirmed."; // This occurs when the account is already signed up and requires confirmation from the user
}
|
{
    code: "EXISTS";
    message: "The login ID of this OpenID account is already used by another account."; // This occurs, with or without 'merge', when the OpenID login ID is the email login another account of the project was GRANTED by verifying that address, and in the rare case where an unproven email login on another account cannot be removed safely.
}
```

`merge` matches an existing account by its original login identifier: the value it was created with,
its `username` if it has one, otherwise the email it signed up with. It never matches through an email
login alias. With a logger whose Username Key is `email`, that means:

- An account created without a `username` using that email is merged into, even if its email has been
  changed since.
- An account created with a `username` whose email is that address is **not** merged into.
- An account created without a `username` whose email was later changed to that address is **not**
  merged into either.

In the last two cases `openIdLogin()` never merges, because merging replaces the account's password and
must never act on an account that only answers to that email through its email login. What happens
instead depends on whether that account has **verified** the address:

- It has verified it, so the email login is one it was granted: `openIdLogin()` fails with the `EXISTS`
  error above, whether `merge` is set or not. The rare case where an unverified email login cannot be
  removed safely gives the same error.
- It has not verified it: that email login is removed, and a **new** OpenID account is created for the
  address, so two accounts of the project then carry the same email address. The other account keeps
  logging in with the login ID it was created with. The removal happens before signup restrictions are
  checked, so it stands even when the login is then refused because signup is off or the user limit is
  reached.

See [Login IDs](/admin/permissions.md#login-ids).