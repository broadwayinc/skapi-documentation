# API Reference: Admin

## inviteUser

```ts
inviteUser(
    userAttributes: {
        email: string; // Required. Max 64 characters.
        name?: string; // Name of the user.
        access_group: number; // Access group level of the user. (1~99) 99 is admin level.
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
    },
    options?: {
        confirmation_url?: string; // URL to redirect the user after the invitation is accepted.
        email_subscription: boolean; // When true, the user will receive service newsletters.
    }
): Promise<'SUCCESS: Invitation has been sent. (User ID: xxx...)'>
```

## resendInvitation

```ts
resendInvitation(
    userAttributes: {
        email: string; // Required. Max 64 characters.
    }
): Promise<'SUCCESS: Invitation has been re-sent. (User ID: xxx...)'>
```

## getInvitations

```ts
getInvitations(params: {
    email?: string; // When set, only invitations with the email starting with the given string will be returned.
}, fetchOptions: FetchOptions): Promise<DatabaseResponse<UserProfile>>
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
    access_group: number; // Access group level of the user. (1~99) 99 is admin level.
}): Promise<'SUCCESS: Access has been granted to the user.'>
```

## createAccount

```ts
createAccount(
    userAttributes: {
        email: string; // Required. Max 64 characters.
        password: string; // Required. At least 6 characters and a maximum of 60 characters.
        name?: string; // Name of the user.
        phone_number?: string; // Must be in "+0012341234" format.
        address?: string; // or you can use OpenID Standard Claims https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
        gender?: string; // Can be any string
        birthdate?: string; // Must be in YYYY-MM-DD format
        email_public?: boolean; // When set to true, email attribute is visible to others when the user confirms the email later.
        phone_number_public?: boolean; // When set to true, phone_number attribute is visible to others when the user confirms the phone umber later.
        address_public?: boolean; // When set to true, address attribute is visible to others.
        gender_public?: boolean; // When set to true, gender attribute is visible to others.
        birthdate_public?: boolean; // When set to true, birthdate attribute is visible to others.
        picture?: string; // URL of the profile picture.
        profile?: string; // URL of the profile page.
        website?: string; // URL of the website.
        nickname?: string; // Nickname of the user.
        misc?: string; // Additional string value that can be used freely. This value is only visible from skapi.getProfile(). Not to others.
    }
): Promise<UserProfile>
```

See [UserProfile](/api-reference/data-types/README.md#userprofile).

## deleteAccount

```ts
deleteAccount(params: {
    user_id: string;
}): Promise<'SUCCESS: Account has been deleted.'>
```

## blockAccount

```ts
blockAccount(params: {
    user_id: string;
}): Promise<'SUCCESS: The user has been blocked.'>
```

## unblockAccount

```ts
unblockAccount(params: {
    user_id: string;
}): Promise<'SUCCESS: The user has been unblocked.'>
```
