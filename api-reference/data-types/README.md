# API Reference: Data Types

Below are the data type references in TypeScript format.

## ConnectionInfo

```ts
type ConnectionInfo = {
    service_name: string; // Connected Service Name
    user_ip: string; // Connected user's IP address
    user_agent: string; // Connected user agent.
    user_location: string; // Connected user's country code
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
    number_of_records: string; // Number records tagged
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