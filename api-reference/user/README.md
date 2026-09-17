# API Reference: User Account

Below are the parameters and return data type references for the methods in TypeScript format.

## updateProfile

```ts
updateProfile(
    params: SubmitEvent | {
        user_id?: string; // Optional, admins only. Another user's ID updates that account through updateUserAttributes(). Your own ID is ignored and your own profile is updated.
        name?: string; // Name of the user.
        email?: string; // Max 64 characters. Becomes unverified, and the account's email login is removed until the user verifies the new address with verifyEmail().
        phone_number?: string; // Must be in "+0012341234" format.
        address?: string | {
            formatted: string;
            locality: string;
            region: string;
            postal_code: string;
            country: string;
        }; // OpenID Standard Claims object is also supported.
        gender?: string; // Can be any string
        birthdate?: string; // Must be in YYYY-MM-DD format
        picture?: string; // URL of the profile picture.
        profile?: string; // URL of the profile page.
        website?: string; // URL of the website.
        nickname?: string; // Nickname of the user.
        misc?: string; // Additional string value that can be used freely. This value is only visible from skapi.getProfile()
        email_public?: boolean; // When set to true, email attribute is visible to others.
        phone_number_public?: boolean; // When set to true, phone_number attribute is visible to others.
        address_public?: boolean; // When set to true, address attribute is visible to others.
        gender_public?: boolean; // When set to true, gender attribute is visible to others.
        birthdate_public?: boolean; // When set to true, birthdate attribute is visible to others.
    }
): Promise<UserProfile>
```

See [UserProfile](/api-reference/data-types/README.md#userprofile)

Called with the `user_id` of **another** user, this sends the same request as
[`updateUserAttributes()`](/api-reference/admin/README.md#updateuserattributes), so the admin rules and
errors apply and it resolves with `'SUCCESS: User attributes updated.'` instead of a profile. Only
admins may do that, and no admin may name their own `user_id` there. Called with your **own** `user_id`,
the ID is dropped and your own profile is updated, which is what every user does.

Changing your own `email` makes it unverified and takes the account's email login with it. The new
address logs the account in once you verify it with [`verifyEmail()`](#verifyemail), a few seconds later
on the next token. Your `username`, and the address a no-username account was created with, are
unaffected. See [Which ID logs a user in](/user-account/update-account.md#which-id-logs-a-user-in).

## changePassword

```ts
changePassword(params: SubmitEvent | {
    new_password: string; // At least 6 characters and a maximum of 60 characters.
    current_password: string;
}): Promise<'SUCCESS: Password has been changed.'>
```


## verifyEmail

```ts
verifyEmail(params?: SubmitEvent | {
    /**
     * When code value is given, Skapi will try to verify the code.
     * When Called with out any argument, Skapi will issue a new verification.
     */
    code: string;
}, options?: {
    /**
     * Per-call e-mail template override. Applies to the call that issues a new
     * verification code, and is ignored when a code is being verified.
     * See [Automated Emails](/email/email-templates.md#overriding-the-template-for-a-single-call).
     */
    template?: {
        /** message_id of the template to use for the verification e-mail. */
        verification?: string;
    };
}): Promise<string>
```

#### Errors
```ts
{
    code: "LimitExceededException";
    message: "Attempt limit exceeded, please try after some time.";
}
|
{
    code: "CodeMismatchException";
    message: "Invalid verification code provided, please try again.";
}
```

Verifying the address is also what grants the account its **email login**: from then on the address logs
the account in, a few seconds later on the account's next token rather than in this response. If another
account of the project was already granted that address as a login ID, the email login is not granted,
and the account keeps logging in with the ID it was created with. An email login another account holds
**without** having verified the address is removed, and the address goes to the account that verified
it. See [Login IDs](/admin/permissions.md#login-ids).

## disableAccount

```ts
disableAccount(): Promise<'SUCCESS: account has been disabled.'>;
```


## getUsers

```ts
getUsers(
    params?: SubmitEvent | {
        searchFor:
            'user_id' |
            'name' |
            'email' |
            'phone_number' |
            'address' |
            'gender' |
            'birthdate' |
            'locale' |
            'subscribers' |
            'timestamp' |
            'access_group' |
            'approved';
        value: string | number | string[]; // Appropriate value type for searchFor
        
        /**
         * Cannot be used with range. Default = '='.
         * '>' means more than. '<' means less than.
         * For strings, '>=' means 'starts with'.
         */
        condition?: '>' | '>=' | '=' | '<' | '<=' | 'gt' | 'gte' | 'eq' | 'lt' | 'lte';
        range?: string | number; // Cannot be used with condition.
    },
    fetchOptions?: FetchOptions
): Promise<DatabaseResponse<UserPublic>>;

```

See [FetchOptions](/api-reference/data-types/README.md#fetchoptions)

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [UserPublic](/api-reference/data-types/README.md#userpublic)


## recoverAccount

```ts
recoverAccount(redirect?: boolean | string): Promise<'SUCCESS: Recovery e-mail has been sent.'>;
```
