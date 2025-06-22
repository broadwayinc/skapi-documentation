# API Reference: Authentication

## signup

```ts
signup(
    params: SubmitEvent | { 
        email: string; // Must be in email format. ex) user@email.com
        password: string; // At least 6 characters and a maximum of 60 characters.
        name?: string;
        phone_number?: string; // Must be in "+0012341234" format.
        address?: string; // or you can use OpenID Standard Claims https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
        gender?: string;
        birthdate?: string; // Must be in YYYY-MM-DD format
        email_public?: boolean; // Default = false
        phone_number_public?: boolean; // Default = false
        address_public?: boolean; // Default = false
        gender_public?: boolean; // Default = false
        birthdate_public?: boolean; // Default = false
        picture?: string; // URL of the profile picture.
        profile?: string; // URL of the profile page.
        website?: string; // URL of the website.
        nickname?: string; // Nickname of the user.
        misc?: string; // Additional string value that can be used freely. This value is only visible to the account owner.
    },
    options?: {
        /**
         * When true, user is required to confirm their signup confirmation on first login. (Default = false).
         * When URL or relative path of the website is given, It will redirect the user after successful confirmation.
         * NOTE: Relative path will not work if the website is not hosted.
         */
        signup_confirmation?: boolean | string;

        /** When true, user can receive newsletter from the admin. (Default = false) */
        email_subscription?: boolean;

        /** When true, user is logged in soon as the signup process is sucessful.
         * Cannot use with 'signup_confirmation'. (Default = false)
         */
        login?: boolean;
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
  message: "user already exists.";
}
```

## resendSignupConfirmation

```ts
resendSignupConfirmation(): Promise<'SUCCESS: Signup confirmation E-Mail has been sent.'>
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
        email: string; 
        password: string;
    }
): Promise<UserProfile>
```

See [UserProfile](/api-reference/data-types/README.md#userprofile)

#### Errors
```ts
{
  code: "SIGNUP_CONFIRMATION_NEEDED";
  message: "User's signup confirmation is required.";
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
        refreshToken: boolean;
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
    }
): Promise<'SUCCESS: Verification code has been sent.'>
```

#### Errors
```ts
{
    code: "LimitExceededException";
    message: "Attempt limit exceeded, please try after some time."
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

## openidLogin

```ts
openidLogin(
    params: SubmitEvent | {
        token: string; // ID/Access token fetched from open id API service
        id: string; // OpenID Logger ID registered in the service page.
    }
): Promise<{
    userProfile: UserProfile;
    openid: { [attribute:string]: any };
}>
```