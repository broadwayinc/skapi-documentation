# API Reference: User Account

Below are the parameters and return data type references for the methods in TypeScript format.

## updateProfile

```ts
updateProfile(
    params: SubmitEvent | {
        name?: string; // Name of the user.
        email?: string; // Max 64 characters.
        phone_number?: string; // Must be in "+0012341234" format.
        address?: string; // or you can use OpenID Standard Claims https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
        gender?: string; // Can be any string
        birthdate?: string; // Must be in YYYY-MM-DD format
        email_public?: boolean; // When set to true, email attribute is visible to others.
        phone_number_public?: boolean; // When set to true, phone_number attribute is visible to others.
        address_public?: boolean; // When set to true, address attribute is visible to others.
        gender_public?: boolean; // When set to true, gender attribute is visible to others.
        birthdate_public?: boolean; // When set to true, birthdate attribute is visible to others.
        picture?: string; // URL of the profile picture.
        profile?: string; // URL of the profile page.
        website?: string; // URL of the website.
        nickname?: string; // Nickname of the user.
        misc?: string; // Additional string value that can be used freely. This value is only visible from skapi.getProfile()
    }
): Promise<UserProfile>
```

See [UserProfile](/api-reference/data-types/README.md#userprofile)

## changePassword

```ts
changePassword(params: SubmitEvent | {
    new_password: string; // At least 6 characters and a maximum of 60 characters.
    current_password: string;
}): Promise<`SUCCESS: Password has been changed.`>
```


## verifyEmail

```ts
verifyEmail(params?: SubmitEvent | {
    /**
     * When code value is given, Skapi will try to verify the code.
     * When Called with out any argument, Skapi will issue a new verification.
     */
    code: string;
}): Promise<'SUCCESS: Verification code has been sent.' | 'SUCCESS: "email" is verified.'>
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

## disableAccount

```ts
disableAccount(): Promise<'SUCCESS: account has been disabled.'>;
```


## getUsers

```ts
getUsers({ 
    params?: {
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
            'approved';
        value: string | number | boolean | { by: 'admin' | 'skapi' | 'master'; approved?: boolean }; // Appropriate value type for searchFor, Object for 'approved'
        
        /**
         * Cannot be used with range. Default = '='.
         * '>' means more than. '<' means less than.
         * For strings, '>=' means 'starts with'.
         */
        condition?: '>' | '>=' | '=' | '<' | '<=' | 'gt' | 'gte' | 'eq' | 'lt' | 'lte';
        range?: string | number | boolean; // Cannot be used with condition.
    } | null;
    fetchOptions?: FetchOptions
}): Promise<DatabaseResponse<UserPublic>>;

```

See [FetchOptions](/api-reference/data-types/README.md#fetchoptions)

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [UserPublic](/api-reference/data-types/README.md#userpublic)


## recoverAccount

```ts
recoverAccount(redirect: boolean | string): Promise<'SUCCESS: Recovery e-mail has been sent.'>;
```
