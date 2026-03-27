# API Reference: Admin

Below are the parameters and return data type references for the methods in TypeScript format.

## inviteUser

```ts
inviteUser(
    params: {
        name?: string;
        email?: string;
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
        openid_id: string;
        access_group: number;
    },
    options?: {
        confirmation_url?: string;
        email_subscription?: boolean;
        template?: {
            url: string;
            subject: string;
        }
    }
): Promise<'SUCCESS: Invitation has been sent. (User ID: xxx...)'>
```

## resendInvitation

```ts
resendInvitation(
    params: {
        email: string; // Required. Max 64 characters.
        confirmation_url?: string;
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
    params: {
        name?: string;
        email?: string;
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
        access_group: number;
    }
): Promise<UserProfile & { email_admin: string; username: string; }>
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
