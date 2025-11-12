# API Reference: Connection

Below are the parameters and return data type references for the methods in TypeScript format.

## getConnectionInfo

```ts
getConnectionInfo(): Promise<ConnectionInfo>
```

See [ConnectionInfo](/api-reference/data-types/README.md#connectioninfo)

#### Errors

```ts
{
    code: "NOT_EXISTS";
    message: "Service does not exists. Register your service at skapi.com"
}
```

## mock

```ts
mock(
    data: SubmitEvent | { [key: string]: any } & { raise?: 'ERR_INVALID_REQUEST' | 'ERR_INVALID_PARAMETER' | 'SOMETHING_WENT_WRONG' | 'ERR_EXISTS' | 'ERR_NOT_EXISTS'; },
    options?: {
        auth?: boolean; // Requires authentication
        method?: string; // HTTP method. Default is 'POST'
        responseType?: 'blob' | 'json' | 'text' | 'arrayBuffer' | 'formData' | 'document'; // Response data type. Default is 'json'
        contentType?: string; // Content-Type header. Default is 'application/json'
        progress?: ProgressCallback;
    }
): Promise<{[key:string]: any}>
```

See [ProgressCallback](/api-reference/data-types/README.md#progresscallback)

## getFormResponse

```ts
getFormResponse(): Promise<any>
```

<br>

# API Reference: Authentication

Below are the parameters and return data type references for the methods in TypeScript format.

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
        token: string; // ID/Access token fetched from OpenID API service
        id: string; // OpenID Logger ID registered in the service page.
        merge: boolean | string[] // When true, merges with previous account. When string[] is given, account is merged with the specified OpenID attribute values.
    }
): Promise<{
    userProfile: UserProfile;
    openid: { [attribute:string]: any };
}>
```

#### Errors
```ts
{
    code: "ACCOUNT_EXISTS";
    message: "The account already exists."
}
```

<br>

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
): Promise<DatabaseResponse<UserPublic>>;

```

See [FetchOptions](/api-reference/data-types/README.md#fetchoptions)

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [UserPublic](/api-reference/data-types/README.md#userpublic)


## recoverAccount

```ts
recoverAccount(redirect: boolean | string): Promise<'SUCCESS: Recovery e-mail has been sent.'>;
```


<br>

# API Reference: Database

Below are the parameters and return data type references for the methods in TypeScript format.

## postRecord

```ts
postRecord(
    data: SubmitEvent | { [key: string] : any } | null,
    config: {
        record_id?: string; // Used only when updating an existing record; not available to anonymous users.
        unique_id?: string; // Unique ID to set to the record; not available to anonymous users. If null is given, it will remove the previous unique ID when updating.
        /** When the table is given as a string value, the value is the table name. */
        /** 'table' is optional when 'record_id' or 'unique_id' is used. */
        /** When the table is given as a string value, the given value will be set as table.name and table.access_group will be 'public' **/
        table: string | {
            name: string; // Other than space and period, special characters are not allowed.
            access_group?: number | 'private' | 'public' | 'authorized' | 'admin';  // Default: 'public', otherwise not available to anonymous users.
            /** Subscription settings; not available to anonymous users. */
            subscription?: {
                is_subscription_record?: boolean; // When true, record will be uploaded to subscription table.
                upload_to_feed: boolean; // When true, record will be shown in the subscribers feeds that is retrieved via getFeed() method.
                notify_subscribers?: boolean; // When true, subscribers will receive notification when the record is uploaded.
                feed_referencing_records?: boolean; // When true, records referencing this record will be included to the subscribers feed.
                notify_referencing_records?: boolean; // When true, records referencing this record will be notified to subscribers.
            };
        };
        readonly?: boolean; // Default: false. When true, the record cannot be updated. (Not available to anonymous users)
        index?: {
            name: string; // Only alphanumeric and period allowed.
            value: string | number | boolean; // Only alphanumeric and spaces allowed.
        };
        tags?: string | string[]; // Only alphanumeric and spaces allowed. It can also be an array of strings or a string with comma separated values.
        source?: {
            referencing_limit?: number; // Default: null (Infinite)
            prevent_multiple_referencing?: boolean; // If true, a single user can reference this record only once.
            only_granted_can_reference?: boolean; // When true, only the user who has granted private access to the record can reference this record.
            can_remove_referencing_records?: boolean; // When true, owner of the record can remove any record that are referencing this record. Also when this record is deleted, all the record referencing this record will be deleted.
            referencing_index_restrictions?: {
                /** Not allowed: White space, special characters. Allowed: Alphanumeric, Periods. */
                name: string; // Allowed index name
                /** Not allowed: Periods, special characters. Allowed: Alphanumeric, White space. */
                value?: string | number | boolean; // Allowed index value
                range?: string | number | boolean; // Allowed index range
                condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | '>' | '>=' | '<' | '<=' | '=' | '!='; // Allowed index value condition
            }[];
            allow_granted_to_grant_others?: boolean; // When true, the user who has granted private access to the record can grant access to other users.
        };
        reference?: string; // Reference to another record. When value is given, it will reference the record with the given value. Can be record ID or unique ID.
        remove_bin?: BinaryFile[] | string[] | null; // If the BinaryFile object or the url of the file is given, it will remove the bin data(files) from the record. The file should be uploaded to this record. If null is given, it will remove all the bin data(files) from the record. (not available to anonymous users)
        progress: ProgressCallback; // Progress callback function. Usefull when uploading files.
    };
): Promise<RecordData>
```

See [RecordData](/api-reference/data-types/README.md#recorddata)

See [ProgressCallback](/api-reference/data-types/README.md#progresscallback)

See [BinaryFile](/api-reference/data-types/README.md#binaryfile)

## getRecords

```ts
getRecords(
    query: {
        record_id?: string; // When record ID is given, it will fetch the record with the given record ID. all other parameters are bypassed and will override unique ID.
        unique_id?: string; // Unique ID of the record. When unique ID is given, it will fetch the record with the given unique ID. All other parameters are bypassed.
        /** When the table is given as a string value, the given value will be set as table.name and table.access_group will be 'public' **/
        /** 'table' is optional when 'record_id' or 'unique_id' is used. */
        table: string | {
            name: string,
            access_group?: number | 'private' | 'public' | 'authorized' | 'admin'; // 0 to 99 if using number. Default: 'public'
            subscription?: string; // User ID that requester is subscribed to.
        };

        /**
         * When unique ID is given, it will fetch the records referencing the given unique ID.
         * When record ID is given, it will fetch the records referencing the given record ID.
         * When user ID is given, it will fetch the records uploaded by the given user ID.
         */
        reference?: string;

        index?: {
            /** '$updated' | '$uploaded' | '$referenced_count' | '$user_id' are the reserved index names. */
            name: string | '$updated' | '$uploaded' | '$referenced_count' | '$user_id';
            value: string | number | boolean;
            condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | '>' | '>=' | '<' | '<=' | '='; // cannot be used with range. Default: '='
            range?: string | number | boolean; // cannot be used with condition
        };

        tag?: string; // Queries records with the given tag.
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<RecordData>>
```

See [RecordData](/api-reference/data-types/README.md#recorddata)

See [FetchOptions](/api-reference/data-types/README.md#fetchoptions)

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

## grantPrivateAccess
```ts
grantPrivateRecordAccess(
    params: {
        record_id: string;
        user_id: string | string[];
    }
): Promise<'SUCCESS: granted x users private access to record: xxxx...'>
  
```

#### Errors
```ts
{
    code: "INVALID_REQUEST";
    message: "Private access cannot be granted to service owners.";
}
|
{
    code: "INVALID_REQUEST";
    message: "Record should be owned by the user.";
}
|
{
    code: "INVALID_REQUEST";
    message: "cannot process more than 100 users at once.";
}
|
{
    code: "INVALID_REQUEST";
    message: "At least 1 user id is required.";
}
```


## removePrivateAccess
```ts
removePrivateRecordAccess(
    params: {
        record_id: string;
        user_id: string | string[];
    }
): Promise<'SUCCESS: granted x users private access to record: xxxx...'>
  
```

#### Errors
```ts
{
    code: "INVALID_REQUEST";
    message: "Private access cannot be granted to service owners.";
}
|
{
    code: "INVALID_REQUEST";
    message: "Record should be owned by the user.";
}
|
{
    code: "INVALID_REQUEST";
    message: "cannot process more than 100 users at once.";
}
|
{
    code: "INVALID_REQUEST";
    message: "At least 1 user id is required.";
}
```

## listPrivateRecordAccess
```ts
listPrivateRecordAccess(
    params: {
        record_id?: string;
        user_id?: string;
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<{
    user_id: string;
    record_id: string;
}>>
```

See [FetchOptions](/api-reference/data-types/README.md#fetchoptions)

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)


## deleteRecords

```ts
deleteRecords({
    record_id?: string | string[]; // Record ID or an array of record IDs to delete. When record ID is given, it will delete the record with the given record ID. It will bypass all other parameters and will override unique ID.
    unique_id?: string | string[]; // Unique ID or an array of unique IDs to delete. When unique ID is given, it will delete the record with the given unique ID. It will bypass all other parameters except record_id.

    /** Delete bulk records by query. Query will be bypassed when "record_id" is given. */
    /** When deleteing records by query, It will only delete the record that user owns. */
    /** When the table is given as a string value, the value is the table name. */
    /** 'table' is optional when 'record_id' or 'unique_id' is used. */
    table: string | {
        name: string,
        access_group?: number | 'private' | 'public' | 'authorized' | 'admin'; // 0 to 99 if using number. Default: 'public'
        subscription?: {
            user_id: string;
            /** Number range: 0 ~ 99 */
            group: number;
        };
    };

    /**
     * When unique ID is given, it will fetch the records referencing the given unique ID.
     * When record ID is given, it will fetch the records referencing the given record ID.
     * When user ID is given, it will fetch the records uploaded by the given user ID.
     * When fetching record by record_id or unique_id that user has restricted access, but the user has been granted access to reference, user can fetch the record if the record ID or the unique ID of the reference is set to reference parameter.
     */
    reference?: string;

    index?: {
        /** '$updated' | '$uploaded' | '$referenced_count' | '$user_id' are the reserved index names. */
        name: string | '$updated' | '$uploaded' | '$referenced_count' | '$user_id';
        value: string | number | boolean;
        condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | '>' | '>=' | '<' | '<=' | '=' | '!='; // cannot be used with range. Default: '='
        range?: string | number | boolean; // cannot be used with condition
    };

    tag?: string; // Queries records with the given tag.
}): Promise<string | DatabaseResponse<string>>
```

## getTables

```ts
getTables(
    query: {
        table: string;
        condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | '>' | '>=' | '<' | '<=' | '=';
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<Table>>
```
See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [Table](/api-reference/data-types/README.md#table)


## getIndex

```ts
getIndexes(
    query: {
        table: string;
        index?: string;
        order?: {
            by: 'average_number' | 'total_number' | 'number_count' | 'average_bool' | 'total_bool' | 'bool_count' | 'string_count' | 'index_name';
            value?: number | boolean | string;
            condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | '>' | '>=' | '<' | '<=' | '=';
        };
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<Index>>
```
See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [Index](/api-reference/data-types/README.md#index)


## getTags

```ts
getTags(
    query: {
        table: string;
        tag?: string;
        condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | '>' | '>=' | '<' | '<=' | '=';
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<Tag>>
```
See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [Tag](/api-reference/data-types/README.md#tag)


## getUniqueId

```ts
getUniqueId(
    query: {
        unique_id?: string;
        condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | '>' | '>=' | '<' | '<=' | '=';
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<UniqueId>>
```
See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [UniqueId](/api-reference/data-types/README.md#uniqueid)


## subscribe
```ts
subscribe(
    { user_id: string; get_feed?: boolean; get_notified?: boolean; get_email?: boolean; }
): Promise<Subscription>
```

See [Subscription](/api-reference/data-types/README.md#subscription)


## unsubscribe
```ts
unsubscribe(
    {
        user_id: string;
    }
): Promise<'SUCCESS: The user has unsubscribed.'>
```


## blockSubscriber

```ts
blockSubscriber(
    {
        user_id: string;
    }
): Promise<'SUCCESS: Blocked user id "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".'>
```

## unblockSubscriber

```ts
unblockSubscriber(
    {
        user_id: string;
    }
): Promise<'SUCCESS: Unblocked user id "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".'>
```


## getSubscriptions

```ts
getSubscriptions(
    params: {
        // Must have either subscriber and/or subscription value
        subscriber?: string; // User ID of the subscriber (User who subscribed)
        subscription?: string; // User ID of the subscription (User being subscribed to)
        blocked?: boolean; // When true, fetches only blocked subscribers. Default = false
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<Subscription>>
```
See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [Subscription](/api-reference/data-types/README.md#subscription)


## getFeed

```ts
getFeed(params?: { access_group?: number; }, fetchOptions?: FetchOptions): Promise<DatabaseResponse<RecordData>>
```

## getFile
    
```ts
getFile(
    url: string,
    config?: {
        dataType: 'base64' | 'download' | 'endpoint' | 'blob' | 'text' | 'info';
    },
    progressCallback?: ProgressCallback
): Promise<Blob | string | FileInfo | void>
```

See [FileInfo](/api-reference/data-types/README.md#fileinfo)

See [ProgressCallback](/api-reference/data-types/README.md#progresscallback)

<br>

# API Reference: Email

Below are the parameters and return data type references for the methods in TypeScript format.

## subscribeNewsletter

```ts
subscribeNewsletter({
    params: SubmitEvent | <{
        group: 'public' | 'authorized';
        email?: string; // only for public newsletters
        redirect?: string; // only for public newsletters. User will be redirected to this URL when confirmation link is clicked.
    }>,
    callbacks: {
        response?(response: any): any;
        onerror?(error: Error): any;
    }
}): Promise<string>
```

## unsubscribeNewsletter

```ts
unsubscribeNewsletter(
    params: { 
        group: 'authorized';
    }
): Promise<string>
```

## adminNewsletterRequest

```ts
adminNewsletterRequest(): Promise<string>
```

## getNewsletterSubscription

```ts
getNewsletterSubscription(
    params: { 
        group: 'authorized';
    }
): Promise<any[]>
```

## getNewsletters

```ts
getNewsletters(
    params?: {
        /**
         * Search points.
         * 'message_id' and 'subject' value should be string.
         * Others in numbers.
         */
        searchFor: 'message_id' | 'timestamp' | 'read' | 'complaint' | 'subject' | 'bounced';
        value: string | number;
        group: 'public' | 'authorized' | number;
        range?: string | number;
        /**
         * Defaults to '='
         */
        condition?: '>' | '>=' | '=' | '<' | '<=' | 'gt' | 'gte' | 'eq' | 'lt' | 'lte';
    },
    fetchOptions?: FetchOptions;
): Promise<DatabaseResponse<Newsletter>>
```

See [FetchOptions](/api-reference/data-types/README.md#fetchoptions)

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

See [Newsletter](/api-reference/data-types/README.md#newsletter)


## sendInquiry

```ts
sendInquiry(
    params: {
        name: string;
        email: string;
        subject: string;
        message: string;
    }
): Promise<'SUCCESS: Inquiry has been sent.'>
```

<br>

# API Reference: Realtime Connection

Below are the parameters and return data type references for the methods in TypeScript format.

## connectRealtime

```ts
connectRealtime(cb: RealtimeCallback): Promise<WebSocket>
```

See [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback)

#### Errors
```ts
{
  code: 'INVALID_REQUEST';
  message: "Callback must be a function.";
}
|
{
  code: 'ERROR';
  message: "Skapi: WebSocket connection error.";
}
```

## postRealtime

```ts
postRealtime(
    message: SubmitEvent | any,
    recipient: string, // User's ID or a group name
    notification?: {
      title: string;
      body: string;
      config?: {
        always: boolean; // When true, notification will always trigger the receiver's device regardless their connection state.
      }
    }
): Promise<{ type: 'success', message: 'Message sent.' }>
```

#### Errors
```ts
{
  code: 'INVALID_REQUEST';
  message: "No realtime connection. Execute connectRealtime() before this method.";
}
|
{
  code: 'INVALID_REQUEST';
  message: "User has not joined to the recipient group. Run joinRealtime('...')";
}
|
{
  code: 'INVALID_REQUEST';
  message: "Realtime connection is not open. Try reconnecting with connectRealtime().";
}
```

## joinRealtime

```ts
joinRealtime(SubmitEvent | params: {
    group: string, // Group name
}
): Promise<{ type: 'success', message: string }>
```

#### Errors
```ts
{
  code: 'INVALID_REQUEST';
  message: "No realtime connection. Execute connectRealtime() before this method.";
}
```

## getRealtimeGroups

```ts
getRealtimeGroups(SubmitEvent | params?: {
        searchFor: 'group' | 'number_of_users';
        value?: string | number; // Group name or number of users
        condition?: '>' | '>=' | '=' | '<' | '<=' | '!=' | 'gt' | 'gte' | 'eq' | 'lt' | 'lte' | 'ne';
        range?: string | number | boolean; // Cannot be used with condition.
    } | null,
    fetchOptions?: FetchOptions
): Promise<DatabaseResponse<{ group: string; number_of_users: number; }>>
```

## getRealtimeUsers

```ts
getRealtimeUsers(SubmitEvent | params?: {
        group: string; // Group name
        user_id?: string; // User ID in the group
    },
    fetchOptions?: FetchOptions
): Promise<DatabaseResponse<{ user_id:string; cid:string; }[]>>
```

See [FetchOptions](/api-reference/data-types/README.md#fetchoptions)

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)


## closeRealtime
    
```ts
closeRealtime(): Promise<void>
```

## connectRTC

```ts
connectRTC({
    cid: string; // Client id of the opponent
    ice?: string; // stun:your.stun.server:3468 (optional)
    media?: {
        video: boolean; // When true, video will be streamed
        audio: boolean; // When true, audio will be streamed
    } | MediaStream; // MediaStream object can be used
    channels?: Array<{
        ordered: 'boolean',
        maxPacketLifeTime: 'number',
        maxRetransmits: 'number',
        protocol: 'string'
    } | "text-chat" | "file-transfer" | "video-chat" | "voice-chat" | "gaming">; // Can create data channels with optimal setting for given task
}): Promise<RTCConnector>
```

See [RTCConnector](/api-reference/data-types/README.md#rtcconnector)

#### Errors
```ts
{
  code: 'DEVICE_NOT_FOUND';
  message: "Requested media device not found.";
}
|
{
  code: 'INVALID_REQUEST';
  message: 'Data channel with the protocol "{protocol name}$" already exists.';
}
```

## vapidPublicKey

```ts
vapidPublicKey(): Promise<{ VAPIDPublicKey: string }>
```

## subscribeNotification

```ts
subscribeNotification({
    params: {
        endpoint: string; // The endpoint URL for the device to subscribe to notifications.
        keys: {
            p256dh: string; // The encryption key to secure the communication channel.
            auth: string; // The authentication key to authenticate the subscription.
        };
    }
}): Promise<'SUCCESS: Subscribed to receive notifications.'>
```

## unsubscribeNotification

```ts
unsubscribeNotification({
    params: {
        endpoint: string; // The endpoint URL for the device to unsubscribe from notifications.
        keys: {
            p256dh: string; // The encryption key to secure the communication channel.
            auth: string; // The authentication key to authenticate the unsubscription.
        };
    }
}): Promise<'SUCCESS: Unsubscribed from notifications.'>
```

## pushNotification

```ts
pushNotification({
    params: {
        {
            title: string; // The title of the notification.
            body: string; // The body content of the notification.
        },
        user_ids?: string | string[]; // Optional parameter to specify the user(s) for whom to send the notification.
    }
}): Promise<"SUCCESS: Notification sent.">
```

<br>

# API Reference: API Bridge

Below are the parameters and return data type references for the methods in TypeScript format.

## secureRequest

```ts
secureRequest(
    params: {
        url: string;
        data?: any;
    }
): Promise<any>
```

## clientSecretRequest

```ts
clientSecretRequest(
    params: {
        url: string;
        clientSecretName: string;
        method: 'get' | 'post' | 'GET' | 'POST';
        headers?: { [key: string]: string };
        data?: { [key: string]: any };
        params?: { [key: string]: string };
    }
): Promise<any>
```

<br>

# API Reference: Admin

Below are the parameters and return data type references for the methods in TypeScript format.

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


<br>

# API Reference: Data Types

Below are the data type references in TypeScript format.

## ConnectionInfo

```ts
type ConnectionInfo = {
    service_name: string; // Connected Service Name
    user_ip: string; // Connected user's IP address: "xxx.xxx.xxx.xxx"
    user_agent: string; // Connected user agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (..."
    user_location: string; // Connected user's 2 letter country code
    version: string; // Skapi library version: 'xxx.xxx.xxx' (major.minor.patch)
}
```

## UserProfile

```ts
type UserProfile = {
    service:string; // The service ID of the user's account.
    owner:string; // The user ID of the service owner.
    access_group:number; // The access level of the user's account.
    user_id:string; // The user's ID.
    locale:string; // The country code of the user's location when they signed up.

    /**
    Account approval info and timestamp.
    Comes with string with the following format: "{approver}:{approved | suspended}:{approved_timestamp}"
    
    {approver} is who approved the account:
        [by_master] is when account approval is done manually from skapi admin panel,
        [by_admin] is when approval is done by the admin account with api call within your service.
        [by_skapi] is when account approval is automatically done.
        Open ID logger ID will be the value if the user is logged with openIdLogin()
        This timestamp is generated when the user confirms their signup, or recovers their disabled account.
    
    {approved | suspended}
        [approved] is when the account is approved.
        [suspended] is when the account is blocked by the admin or the master.
    
    {approved_timestamp} is the timestamp when the account is approved or suspended.

     */
    approved: string;
    log:number; // Last login timestamp(Seconds).

    /**
     The user's email address.
     This should be a maximum of 64 characters and is only visible to others if the email_public option is set to true.
     The email will be unverified if it is changed.
     */
    email?:string;
    email_verified?:boolean; // Set to true if the user has verified their email.
    
    /**
     The user's phone number.
     This should be in the format "+0012341234" and is only visible to others if the phone_number_public option is set to true.
     The phone number will be unverified if it is changed.
     */
    phone_number?:string;
    phone_number_verified?:boolean;// Set to true if the user has verified their phone number.
    name?:string; // The user's name.
    address?:string // The user's address.
    gender?:string // The user's gender. Can be "female" or "male"; or other values if neither of these are applicable.
    birthdate?:string; // The user's birthdate in the format "YYYY-MM-DD".
    email_public?:boolean; // The user's email is public if this is set to true.
    phone_number_public?:boolean; // The user's phone number is public if this is set to true.
    address_public?:boolean; // The user's address is public if this is set to true.
    gender_public?:boolean; // The user's gender is public if this is set to true.
    birthdate_public?:boolean; // The user's birthdate is public if this is set to true.
    picture?: string; // URL of the profile picture.
    profile?: string; // URL of the profile page.
    website?: string; // URL of the website.
    nickname?: string; // Nickname of the user.
    misc?: string; // Additional string value that can be used freely. This value is only visible from skapi.getProfile(). Not to others.
}
```

## UserPublic

```ts
type UserPublic = {
    access_group:number; // The access level of the user's account.
    user_id:string; // The user's ID.
    locale:string; // The country code of the user's location when they signed up.

    /**
     Account approval timestamp.
     This timestamp is generated when the user confirms their signup, or recovers their disabled account.
     [by_skapi | by_admin | by_master] : [approved | suspended] : [timestamp]
     [by_master | by_admin]: When the account is created by either master or admin.
     [by_skapi]: When the user account is created by either signup confirmation or invitation.
     [other]: When logged in by openidLogger, the approval indicating string will be the OpenID Logger's ID that the master has setup in the service.
     */
    approved: string;
    timestamp:number; // Account created timestamp(13 digit milliseconds).
    log:number; // Last login timestamp(13 digit milliseconds).
    subscribers: number; // The number of accounts subscribed to the user.  
    subscribed: number; // The number of accounts the user is subscribed to.  
    records: number; // Total number of records user has produced in the database.
    /**
     The user's email address.
     This should be a maximum of 64 characters and is only visible to others if the email_public option is set to true.
     The email will be unverified if it is changed.
     */
    email?:string;
    
    /**
     The user's phone number.
     This should be in the format "+0012341234" and is only visible to others if the phone_number_public option is set to true.
     The phone number will be unverified if it is changed.
     */
    phone_number?:string;
    name?:string; // The user's name.
    address?:string // The user's address.
    gender?:string // The user's gender. Can be "female" or "male"; or other values if neither of these are applicable.
    birthdate?:string; // The user's birthdate in the format "YYYY-MM-DD".
    picture?: string; // URL of the profile picture.
    profile?: string; // URL of the profile page.
    website?: string; // URL of the website.
    nickname?: string; // Nickname of the user.
}
```

## DatabaseResponse

```ts
type DatabaseResponse<T> = {
    list: T[]; // List of data from the database.
    startKey: { [key: string]: any; }; // Use this start key to fetch more data on the next api call.
    endOfList: boolean; // true, when the query has reached the end of data.
    startKeyHistory: string[]; // List of stringified start keys.
};
```

## RecordData

```ts
type RecordData = {
    record_id: string; // Record ID of this record
    unique_id?: string; // Unique ID of this record
    user_id: string; // Uploaders user ID.
    updated: number; // Timestamp in milliseconds.
    uploaded: number; // Timestamp in milliseconds.
    ip: string; // IP address of uploader.
    readonly: boolean; // Is true if this record is readonly.
    bin: { [fileKeyName: string]: BinaryFile[] }; // List of file info the record is holding in each fileKeyName.
    referenced_count: number;
    
    table: {
        name: string; // Table name
        access_group: number | 'private' | 'public' | 'authorized' | 'admin'; // Allowed access level of this record.
        subscription?: {
            is_subscription_record: boolean; // true if the record is posted in subscription table.
            upload_to_feed: boolean; // When true, record will be shown in the subscribers feeds that is retrieved via getFeed() method.
            notify_subscribers: boolean; // When true, subscribers will receive notification when the record is uploaded.
            feed_referencing_records: boolean; // When true, records referencing this record will be included to the subscribers feed.
            notify_referencing_records: boolean; // When true, records referencing this record will be notified to subscribers.
        }
    };
    source: {
        referencing_limit: null, // Number of reference this record is allowing. Infinite if null.
        prevent_multiple_referencing: false, // Is true if this record prevents a single user to upload a record referencing this record multiple times.
        can_remove_referencing_records: false, // Is true if the owner of the record can remove the referenced records.
        only_granted_can_reference: false, // Is true if only the users who have been granted access to the record can reference this record.
        referencing_index_restrictions?: {
            /** Not allowed: White space, special characters. Allowed: Alphanumeric, Periods. */
            name: string; // Allowed index name
            /** Not allowed: Periods, special characters. Allowed: Alphanumeric, White space. */
            value?: string | number | boolean; // Allowed index value
            range?: string | number | boolean; // Allowed index range
            condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | '>' | '>=' | '<' | '<=' | '=' | '!='; // Allowed index value condition
        }[],
        allow_granted_to_grant_others?: boolean; // When true, the user who has granted private access to the record can grant access to other users.
    },
    reference?: string; // Reference ID of this record.
    index?: {
        name: string; // Index name.
        value: string | number | boolean; // Value of the index.
    };
    tags?: string[]; // List of tags attached to the record.
    data?: { [key: string]: any }; // Uploaded key value data.
};
```

## BinaryFile

```ts
type BinaryFile = {
    access_group: number | 'private' | 'public' | 'authorized' | 'admin'; // Allowed access level of this file.
    filename: string; // Filename of the file.
    url: string; // Full URL endpoint of the file including the token. Token can be expired and will require to be updated by calling getFile('endpoint')
    path: string; // Path of the file.
    size: number; // Size of the file in bytes.
    uploaded: number; // Timestamp in milliseconds.
    getFile: (dataType?: 'base64' | 'download' | 'endpoint' | 'blob' | 'text' | 'info'; progress?: ProgressCallback) => Promise<Blob | string | void | FileInfo>;
}
```

## ProgressCallback

```ts
type ProgressCallback = (p: {
    status: 'download' | 'upload'; // Current status
    progress: number; // Progress in percentage
    loaded: number; // Loaded bytes of the data
    total: number; // Total bytes of the data
    currentFile?: File, // Current loading file.
    completed?: File[]; // Current files that completed loading.
    failed?: File[]; // Failed files.
    abort: () => void; // Aborts current data transfer. When abort is triggered during fileUpload(), it will continue to next file.
}) => void;
```

## FileInfo

```ts
type FileInfo = {
    url: string;
    filename: string;
    access_group: number | 'private' | 'public' | 'authorized';
    filesize: number;
    record_id: string;
    uploader: string;
    uploaded: number;
    fileKey: string;
}
```

## FetchOptions

```ts
type FetchOptions = {
    limit?: number; // Max number of data to fetch per call. Max 1000. Default = 50.
    fetchMore?: boolean; // Fetches next batch of data if true. Default = false.
    ascending?: boolean; // Results in ascending order if true
    startKey?: { [key: string]: any; }; // When start key is given, database query starts from the given key.
    progress?: ProgressCallback // Callback executed when there is data transfer between the server. Can be useful when building progress bar.
}
```

## Table

```ts
type Table = {
    table: string; // Table name in the database.
    number_of_records: string; // Number of records in the table.
    size: number; // Size in bytes currently consumed in the table. (This does not include cloud storage size which is consumed by binary files)
}
```


## Index

```ts
type Index = {
    table: string; // Table name of the index
    index: string; // Index name
    number_of_records: number; // Number of records in the index
    string_count: number; // Number of string type value in the index
    number_count: number; // Number of number type value in the index
    boolean_count: number; // Number of boolean type value in the index
    total_number: number; // Sum of all number values in the index
    total_bool: number; // Number of true(boolean) values in the index
    average_number: number; // Average of all numbers in the index
    average_bool: number; // Percentage of true(boolean) values in the index
}
```


## Tag

```ts
type Tag = {
    table: string; // Table name of the tag
    tag: string; // Tag name
    number_of_records: number; // Number records tagged
}
```

## UniqueId

```ts
type UniqueId = {
    unqiue_id: string; // Unique ID of the record
    record_id: string; // Record ID of the unique ID
}
```

## Subscription

```ts
type Subscription = {
    subscriber: string; // Subscriber ID
    subscription: string; // Subscription ID
    timestamp: number; // Subscribed UNIX timestamp
    blocked: boolean; // True when subscriber is blocked by subscription
    get_feed: boolean; // True when subscriber gets feed
    get_notified: boolean; // True when subscriber gets notified
    get_email: boolean; // True when subscriber gets email
}
```

## RealtimeCallback

```ts
type RealtimeCallback = (rt: {
    type: 'message' | 'error' | 'success' | 'close' | 'notice' | 'private' | 'reconnect' | 'rtc:incoming' | 'rtc:closed';
    message?: any;
    connectRTC?: (params: RTCReceiverParams, callback: RTCEvent) => Promise<RTCResolved>; // Incoming RTC
    hangup?: () => void; // Reject incoming RTC connection.
    sender?: string; // user_id of the sender
    sender_cid?: string; // scid of the sender
    sender_rid?: string; // group of the sender
    code?: 'USER_LEFT' | 'USER_DISCONNECTED' | 'USER_JOINED' | null; // code for notice messeges
}) => void;
```

## Newsletter

```ts
type Newsletter = {
    message_id: string; // Message ID of the newsletter
    timestamp: number; // Timestamp of the newsletter
    complaint: number; // Number of complaints
    read: number; // Number of reads
    subject: string; // Subject of the newsletter
    bounced: string; // Number of bounces
    url: string; // URL of the html file of the newsletter
    delivered: number; // Number users delivered 
}
```

## RTCConnector

```ts
type RTCConnector = {
    hangup: () => void; // When executed, user can hangup before the opponent accepts the call.
    connection: Promise<RTCResolved>; // Resolves RTC object.
}
```

## RTCResolved

```ts
type RTCResolved = {
    target: RTCPeerConnection;
    channels: {
        [protocol: string]: RTCDataChannel
    };
    hangup: () => void;
    media: MediaStream;
}
```

## RTCEvent

```ts
type RTCEvent = (e: {
    type: 'track' | 'connectionstatechange' | 'close' | 'message' | 'open' | 'bufferedamountlow' | 'error' | 'icecandidate' | 'icecandidateend' | 'icegatheringstatechange' | 'negotiationneeded' | 'signalingstatechange';
    [key: string]: any;
}) => void
```

<br>

