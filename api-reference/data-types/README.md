# API Reference: Data Types

Below are the data type references in TypeScript format.

You can import types in a TypeScript project as below:

```ts
import type {
    BinaryFile,
    Condition,
    Connection,
    ConnectionInfo,
    DatabaseResponse,
    DelRecordQuery,
    EncryptionOptions,
    FetchOptions,
    FileInfo,
    Form,
    GetRecordQuery,
    Index,
    Newsletter,
    NewsletterGroup,
    ProgressCallback,
    RTCChannelOption,
    RTCConnector,
    RTCConnectorParams,
    RTCEncodingOption,
    RTCEvent,
    RTCFileInfo,
    RTCIceOption,
    RTCMediaOption,
    RTCMediaSource,
    RTCReceiverParams,
    RTCResolved,
    RTCScreenOption,
    RTCSendFileOptions,
    RTCShareOptions,
    RealtimeCallback,
    RecordData,
    RecordEncryptionInfo,
    RequestHistory,
    Subscription,
    Table,
    Tag,
    Ticket,
    TicketAction,
    TicketCondition,
    TicketConditionOperator,
    TicketConditionRow,
    TicketError,
    TicketErrorCode,
    TicketResponseCondition,
    TicketSignatureCondition,
    UniqueId,
    UserAttributes,
    UserProfile,
    UserPublic,
    WebSocketMessage,
} from "skapi-js";
```

## BinaryFile

```ts
type BinaryFile = {
    access_group: number | 'private' | 'public' | 'authorized' | 'admin';
    filename: string;
    /** For an ENCRYPTED file this url serves CIPHERTEXT. Use getFile() below, which decrypts;
     *  an <img src> or a plain <a href> on it will not work. */
    url: string;
    path: string;
    /** The PLAINTEXT byte length. For an encrypted file the object on storage is larger:
     *  see stored_size. */
    size: number;
    uploaded: number;
    /** Present and true only on an encrypted attachment. Set on the plain data, not just
     *  on the getFile closure, so it survives being structured-cloned or JSON round-tripped. */
    encrypted?: boolean;
    /** Byte length of the encrypted object as stored. Present only when encrypted is true. */
    stored_size?: number;
    getFile: (dataType?: 'base64' | 'download' | 'endpoint' | 'blob' | 'text' | 'info', progress?: ProgressCallback) => Promise<Blob | string | void | FileInfo>;
}
```

## Condition

```ts
type Condition = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | '>' | '>=' | '<' | '<=' | '=';
```

On a `string`, `>=` and `<=` are searches: `>=` matches what **starts with** the given value, and `<=` matches what **ends with** it.
`>` and `<` remain lexicographic, and `number` / `boolean` values compare normally, so `<=` on a number is a plain 'lesser or equal' comparison.

That holds wherever a `Condition` is compared with text:

| Method | `>=` starts with, `<=` ends with |
| --- | --- |
| [`getRecords()`](/api-reference/database/README.md#getrecords), [`deleteRecords()`](/api-reference/database/README.md#deleterecords) | A `string` index value. With a compound index name ending in a period, the child name segment. See [Indexing](/database/indexing.html#ends-with-string-values). |
| [`getTables()`](/api-reference/database/README.md#gettables) | The table name. See [Table Information](/database/table-info.html). |
| [`getTags()`](/api-reference/database/README.md#gettags) | The tag, in `table`, or in every table when `table` is omitted. See [Tags](/database/tags.html#querying-tags). |
| [`getUniqueId()`](/api-reference/database/README.md#getuniqueid) | The unique ID. See [Unique ID](/database/unique-id.html#fetching-unique-id-list). |
| [`getIndexes()`](/api-reference/database/README.md#getindex) | The index name, when `order.by` is `index_name`. See [Searching index names](/database/indexing.html#searching-index-names). Ordered by anything else, `order.value` is a number and compares normally. |

An 'ends with' search returns its matches in the order of the text read from its last character backwards, not in the order of the text itself.

`condition` is optional, and the SDK never fills in a value for it: an omitted `condition` is simply absent from the request and the backend decides what it means.
The default is not the same on every method:

| Method | `condition` omitted |
| --- | --- |
| [`getTables()`](/api-reference/database/README.md#gettables) | Exact match on `table`. With `table` omitted as well, every table. |
| [`getTags()`](/api-reference/database/README.md#gettags) | Exact match on `tag` when **both** `table` and `tag` are given. With only `table` given, `>=` (prefix), so every tag in the table. With neither, every tag in the project, ordered by record count, descending. |
| [`getIndexes()`](/api-reference/database/README.md#getindex) | No top level `condition` exists. `order.condition` omitted is an exact match against `order.value`, and `order.condition` requires `order.value`. With `order.value` omitted as well, every index, in the order of `order.by`. |

Omit the key, do not blank it out. Passing `condition` explicitly as `undefined` or `null` is rejected with `INVALID_PARAMETER`, while leaving the key out works.
When you assemble a query object programmatically, `delete` the key rather than setting it to `undefined`.

A `condition` also needs something to compare against, and it is the value key that supplies it.
Sending a `condition` with that key left out is an error, not a listing: [`getTables()`](/api-reference/database/README.md#gettables) with no `table` is rejected with `"table" is required for condition.`, [`getTags()`](/api-reference/database/README.md#gettags) with neither `table` nor `tag` with `"table" or "tag" is required for condition.`, and [`getIndexes()`](/api-reference/database/README.md#getindex) rejects `order.condition` without `order.value`.
To list everything instead, leave the `condition` out as well.

While you are exploring and do not know the exact spelling, pass `gte`: it is a prefix search, so it also surfaces related entries.
An entity whose name is recorded two ways, such as `Asian Spice House` and `Asian Spice House (alias)`, is only found by the prefix.
When you already know the exact name, omitting `condition` is the exact match you want.

## Connection

```ts
type Connection = {
    /** User's locale */
    locale: string;
    user_agent: string;
    /** Connected user's IP address */
    ip: string;
    /** Project group */
    group: number;
    /** Project name */
    service_name: string;
    /** Project description */
    service_description: string;
    /** Project options */
    opt: {
        freeze_database: boolean;
        prevent_inquiry: boolean;
        prevent_signup: boolean;
        prevent_anonymous: boolean;
    }
    /* AI agent info */
    ai_agent?: string;
}
```

## ConnectionInfo

```ts
type ConnectionInfo = {
    project_id: string; // Public project ID of the connected project (single token composed from the project and its owner). Also available directly as skapi.project_id.
    user_ip: string;
    user_agent: string;
    user_location: string;
    service_name: string;
    service_description: string;
    version: string;
    ai_agent: string;
    conf: {
        freeze_database: boolean;
        prevent_signup: boolean;
        prevent_inquiry: boolean;
        prevent_anonymous: boolean;
        // When true, the SDK refuses database READS from a signed-out visitor
        // (getRecords, getTables, getTags, getIndexes, getUniqueId) with
        // code 'REQUIRE_LOGIN'. Defaults to true.
        require_login?: boolean;
    }
};
```

## DatabaseResponse

```ts
type DatabaseResponse<T> = {
    list: T[];
    startKey: { [key: string]: any; } | 'end';
    endOfList: boolean;
    startKeyHistory: string[];
}
```

## DelRecordQuery

```ts
type DelRecordQuery = GetRecordQuery & {
    unique_id?: string;
    record_id?: string;
};
```

## FetchOptions

```ts
type FetchOptions = {
    limit?: number;
    fetchMore?: boolean;
    ascending?: boolean;
    startKey?: { [key: string]: any; };
    progress?: ProgressCallback;
}
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

## Form

```ts
type Form<T> = HTMLFormElement | FormData | SubmitEvent | T;
```

## ForwardRequestStreamOptions

```ts
type ForwardRequestStreamOptions = {
    /** The URL the request was sent to. Required unless the request ID is an already-composed full ID. */
    url?: string;
    /** The method it was sent with. Required unless the request ID is an already-composed full ID. */
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';
    /** Called with each relayed piece, in order, with the sequence number it was stored under
     *  and which transport carried it ('socket' when skapi's websocket got there first,
     *  'poll' when the poll did). Raw text: skapi relays bytes and parses none of them. */
    onStream?: (chunk: string, seq: number, via?: 'socket' | 'poll') => void;
    /** The `realtime_group` the dispatching forwardRequest() handed back. With it, this
     *  read ALSO listens on skapi's websocket while the request is still running, so text
     *  arrives as it is relayed instead of on each poll tick. The group cannot be rebuilt
     *  from a request ID, so keep it beside the ID. Without it the read works exactly as it
     *  always has, at poll speed. */
    realtimeGroup?: string;
    /** Start after this sequence number instead of from the beginning, so a reader that already
     *  holds part of a turn does not receive it twice. Default 0. */
    since?: number;
    /** Polling interval in milliseconds while the request is still running. Default 1000.
     *  Must be a finite, non-negative number. */
    poll?: number;
    /** Called once with whatever the read resolves with. Not called when the read is stopped.
     *  `meta` carries facts about the REQUEST rather than the response: a settled poll resolves
     *  with the destination's own answer, and that answer is the destination's, not a place to
     *  attach skapi's fields. `meta.executed` is when the worker BEGAN running the request, in
     *  milliseconds (the same value forwardRequestHistory() reports as `executed`), so
     *  `updated - executed` times the call while `updated - created` also counts the queue wait.
     *  Present only when this request was QUEUED and therefore polled, and absent even then for a
     *  request that began and ended between two ticks, so treat it as optional and show nothing
     *  rather than substituting `created`. A one-argument callback is unaffected. */
    onResponse?: (res: any, meta?: { executed?: number }) => void;
    /** Called if the read itself fails. */
    onError?: (err: any) => void;
    service?: string;
    owner?: string;
}
```

The second argument of [`forwardRequestStream()`](/api-reference/api-bridge/README.md#forwardrequeststream).
It is written inline in that method's signature, so it is not importable from `skapi-js` under this name.

See [Streaming Request](/api-bridge/streaming-request.html)

## GetRecordQuery

```ts
type GetRecordQuery = {
    unique_id?: string; // When unique_id is given, it will fetch the record with the given unique_id.
    record_id?: string; // When record_id is given, it will fetch the record with the given record_id. This overrides all other parameters.

    /** Table name not required when "record_id" is given. A bare string is shorthand for { name: <string> }. */
    table?: string | {
        /** Max 256 characters, where / ! * # % each count as 3. Blocks control chars and sentinel 􏿿. */
        name: string;
        /** Number range: 0 ~ 99. 'public' = 0, 'authorized' = 1, 'admin' = 99. '*' is shorthand for 'private'. Default: 'public' */
        access_group?: number | 'private' | '*' | 'public' | 'authorized' | 'admin';
        /** User ID of subscription */
        subscription?: string;
    };

    reference?: string | { record_id?: string; unique_id?: string; user_id?: string }; // Referenced record ID or unique ID. If user_id is given (object form), it will fetch records that are uploaded by the user.

    /** Index condition and range cannot be used simultaneously.*/
    index?: {
        /** Custom names: max 256 characters, where / ! * # % each count as 3. Cannot start with "$". Blocks control chars and sentinel 􏿿. Reserved names: $uploaded, $updated, $referenced_count, $user_id. */
        name: string | '$updated' | '$uploaded' | '$referenced_count' | '$user_id';
        /** String value max 256 characters. Any punctuation is allowed and counts as one character, and values compare exactly as written. Blocks control chars and sentinel 􏿿. */
        value: string | number | boolean;
        /** For a string value: '>=' = 'starts with', '<=' = 'ends with'. When the name is a compound name ending in '.', '>=' / '<=' match the child name segment (starts / ends with). '>' / '<' are lexicographic; numbers/booleans compare normally. */
        condition?: Condition;
        range?: string | number | boolean;
    };
    tag?: string;
}
```

## Index

```ts
type Index = {
    table: string;
    index: string;
    number_of_records: number;
    string_count: number;
    number_count: number;
    boolean_count: number;
    total_number: number;
    total_bool: number;
    average_number: number;
    average_bool: number;
}
```

## Newsletter

```ts
type Newsletter = {
    /** Newsletter id */
    message_id: string;
    /** Time sent out */
    timestamp: number;
    /** Number of complaints */
    complaint: number;
    /** Number of read */
    read: number;
    /** Subject */
    subject: string;
    /**
     * Number of bounced.<br>
     * When e-mail address is bounced, skapi no longer sends e-mail to the bounced address.
     */
    bounced: string;
    /**
     * Url of the message html.
     */
    url: string;
    /** Number users delivered */
    delivered: number;
    /** true on a newsletter saved without sending (the list's "nd" address); absent once it went out. */
    dry?: boolean;
    /** When a stored newsletter was last sent from the Newsletters page or by a ticket's nlsd action, in milliseconds. */
    sent?: number;
    /**
     * Newsletter group the message was sent to.<br>
     * A number for the 0 ~ 99 groups, the group name for a named newsletter group.
     */
    group: number | string;
}
```

## ProgressCallback

```ts
type ProgressCallback = (e: {
    status: 'upload' | 'download';
    progress: number; // 0 ~ 100, number of percent completed.
    loaded: number; // Number of bytes loaded.
    total: number; // Total number of bytes to be loaded.
    currentFile?: File, // Only for uploadFiles()
    completed?: File[]; // Only for uploadFiles()
    failed?: File[]; // Only for uploadFiles()
    abort: () => void;
}) => void;
```

## PostRecordsItem

One item of [`postRecords()`](/api-reference/database/README.md#postrecords): the two arguments of `postRecord()` as one object.

```ts
type PostRecordsItem = {
    data?: { [key: string]: any } | null; // The record's data. Leave it out to keep a record's stored data as it is on an update.
    config: PostRecordConfig; // The record's configuration, as postRecord() takes it.
}
```

## PostRecordsResult

What [`postRecords()`](/api-reference/database/README.md#postrecords) resolves with. `list.length + failed.length` is the number of items given.

```ts
type PostRecordsResult = {
    list: RecordData[]; // The records that were saved, in the order their items were given.
    failed: {
        index: number; // The item's position in the `items` given.
        code: string; // The code postRecord() would have rejected the item with.
        message: string;
    }[];
}
```

## UploadFilesResult

What [`uploadFiles()`](/api-reference/database/README.md#uploadfiles) resolves with.

```ts
type UploadFilesResult = {
    completed: File[]; // Files that are stored.
    failed: File[]; // Files storage did not accept.
    errors: FileUploadError[]; // Why each file in `failed` was not stored, one entry per file in the same order. Empty when every file was stored.
    bin_endpoints: string[]; // The endpoint of every file, in the order they were given, whether or not it was stored.
}
```

## FileUploadError

One file of an [`uploadFiles()`](/api-reference/database/README.md#uploadfiles) call that storage did not accept.

```ts
type FileUploadError = {
    file: File; // The File as it was given: the same object that is listed in `failed`.
    name: string; // The file's name.
    error: SkapiError; // Why it was not stored.
}
```

`error.code` is the storage code (`AccessDenied`, `EntityTooLarge` ...), or `NETWORK_ERROR`, `TIMEOUT` (the upload took longer than the `timeout` given), `ABORTED` (the progress callback's `abort()` was called), `TOO_MANY_REQUESTS`, or `UPLOAD_FAILED` when storage gave no code. `error.cause` holds the raw response or rejection, when there was one.

## RealtimeCallback

```ts
type RealtimeCallback = (rt: WebSocketMessage) => void;
```

## RecordData

```ts
type RecordData = {
    record_id: string;
    unique_id?: string;
    user_id: string;
    updated: number;
    uploaded: number;
    referenced_count: number;

    table: {
        name: string;
        /** Number range: 0 ~ 99 */
        access_group: number | 'private' | 'public' | 'authorized' | 'admin';
        /** Subscription settings of the record */
        subscription?: {
            is_subscription_record: boolean; // When true, this record is a subscription record.
            upload_to_feed: boolean; // When true, record will be uploaded to the feed of the subscribers.
            notify_subscribers: boolean; // When true, creating the record sent a push notification to the uploader's subscribers who subscribed with get_notified.
            feed_referencing_records: boolean; // When true, records referencing this record are added to the feed of this record's uploader.
            notify_referencing_records: boolean; // When true, every new record referencing this one sends a push notification to the uploader's subscribers who subscribed with get_notified.
        };
    };
    source: {
        referencing_limit: number; // Default: null (Infinite)
        prevent_multiple_referencing: boolean; // If true, a single user can reference this record only once.
        can_remove_referencing_records: boolean; // When true, owner of the record can remove any record that are referencing this record. Also when this record is deleted, all the record referencing this record will be deleted.
        only_granted_can_reference: boolean; // When true, only the user who has granted private access to the record can reference this record.
        referencing_index_restrictions?: {
            name: string; // Allowed index name
            value?: string | number | boolean; // Allowed index value
            range?: string | number | boolean; // Allowed index range
            condition?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne' | '>' | '>=' | '<' | '<=' | '=' | '!='; // Allowed index value condition. Checked when a referencing record is posted: on a string value '>=' is a 'starts with' check, while '<=' is a plain 'lesser or equal' comparison and is not 'ends with'.
        }[];
    };
    reference?: string; // record id of the referenced record.
    index?: {
        name: string;
        value: string | number | boolean;
    };
    /** null (or the withheld placeholder) when this session could not decrypt it: see `encrypted`.
     *  { __is_private__: null } when it is another user's private record that the project owner or an
     *  admin in access group 99 has no access to: the database withheld the payload itself, so no
     *  `encrypted` field comes with it and isWithheld() does not report it.
     *  See /database/access-restrictions.md#private-records */
    data?: Record<string, any>;
    /** Present ONLY when the record's data passed through the client-side encryption layer.
     *  Its ABSENCE means the record was stored in the clear, which is how existing plaintext
     *  records keep working after the feature is enabled.
     *
     *  status 'encrypted' means `data` above is the decrypted value.
     *  status 'failed' means `data` is null (or the sentinel) and `reason` says why:
     *    NOT_A_RECIPIENT     this user has no key wrap on the record (a user who was granted
     *                        private access to it, but no key, lands here; unlocking cannot help)
     *    NO_SESSION_KEY      this user IS a recipient but encryption is locked; unlock and retry
     *    BAD_KEY             the key wrap did not open (usually a rolled key)
     *    BINDING_MISMATCH    the stored envelope does not belong to this record
     *    CORRUPT             the payload failed its authentication tag
     *    DATA_UNAVAILABLE    the payload is offloaded to storage and could not be fetched
     *    UNSUPPORTED_VERSION written by a newer SDK than this one
     *    ENCRYPTION_DISABLED the record is encrypted but this instance has the flag off */
    encrypted?: {
        status: 'encrypted' | 'failed';
        reason?: string;
        /** user_ids that hold a key wrap on this record. Metadata, not content. */
        recipients?: string[];
    };
    tags?: string[];
    bin: { [key: string]: BinaryFile[] };
    ip: string;
    readonly: boolean;
    /** Present ONLY on an element of a bulkPostRecords() result that the API refused.
     *  Such an element is an empty record (record_id is ""), and this carries the reason,
     *  e.g. { code: 'NOT_EXISTS', message: 'Record of "reference.unique_id": "src::report.xlsx" does not exists.' }.
     *  A saved record never has it, so record_id stays the test for "did this save". */
    error?: { code?: string; message?: string; [key: string]: any };
}
```
## RequestHistory

```ts
type RequestHistory = { 
    id: string; // request id. Format: {stamp}:{entropy}
    status_code: number; // http status code of the request
    response_body: any; // null on a STREAMED request until it is finalized: its text lives in the relayed chunks, not on the request. forwardRequestFinalize() is what stores a body here.
    error?: any;
    created: number; // timestamp of when the request was created, in milliseconds. Set once and never changes.
    updated: number; // timestamp of the last update of the request status (e.g. when the response arrived), in milliseconds.
    executed?: number; // timestamp of when the worker actually BEGAN executing the request, in milliseconds. Distinct from created, which is when it was enqueued: a request can wait in the queue first, so updated - executed is the execution time while updated - created also includes the wait. Absent on a request that has not started yet, and on rows written before the worker recorded it.
    responded?: number; // timestamp of when the destination's response finished arriving, in milliseconds. Recorded once and never moved, unlike updated: finalizing a streamed request stores its response later and moves updated to that moment, so on a streamed request this is the only field that still says when the response came back. responded - executed is how long the call took. Absent on a request that has not settled, on one that failed before any response arrived, and on rows written before the worker recorded it.
    request_body: any;
    expires?: number; // timestamp of when the request history will be deleted in epoch time (seconds).
    status: 'pending' | 'running' | 'resolved' | 'failed';
    queue_name?: string; // queue name if the request is in queue, empty string if the request is not in queue.
    // Compact-listing stubs. Present ONLY when the history was fetched with compact: true,
    // in which case request_body/response_body are omitted (the full bodies never leave the
    // server). Re-fetch without compact, or poll the item, when a full body is needed.
    request_text?: string; // stub: first text of the request's LAST user message, truncated. Missing when the request body's shape was unrecognisable.
    response_text?: string; // stub: the head of the response text, truncated.
    response_complete_marker?: boolean; // stub: whether the response carried the indexing completion marker.
    compact?: boolean; // true on items returned by a compact: true listing, so consumers can tell "bodies omitted" from "bodies empty".
    poll?: (arg?: {
        latency?: number;
        onResponse?: (res:any, meta?: { executed?: number })=>void; // called when the request settles. `meta` carries request-level facts, which cannot ride on `res`: a settled poll resolves with the DESTINATION's own answer. `meta.executed` is when the worker BEGAN running this request, in milliseconds, matching the `executed` on a RequestHistory item -- `updated - executed` is the call, `updated - created` is the call plus the queue wait. A poll built from a forwardRequestHistory() item starts out already knowing it, taken from that listing, so it is delivered even when the request settles on the poll's first read; otherwise it is learned from a running tick, and a request that began and ended between two ticks has none. Optional either way: show nothing rather than falling back to `created`.
        onError?: (err:any)=>void;
        onStream?: (chunk: string, seq: number, via?: 'socket' | 'poll')=>void; // reads a STREAMED item's text as it arrives, same as on the dispatch path. "via" names the transport that carried the piece: 'socket' when skapi's websocket got there first, 'poll' when the poll did. Supplying it is what makes the poll fetch chunks. An item that already settled has nothing left to poll: read that one back with forwardRequestStream().
    }) => Promise<any>; // function to poll the request status until it settles. The promise resolves with the final result of the request: the third-party API response body when it resolves, or the error payload when it fails. It does not resolve with a RequestHistory item, so "created" and "updated" are not on the polled value. A poll stopped by stopForwardRequestPolling() resolves with { id, status: 'stopped' }. Optional argument "latency" can be used to set the latency of the polling in milliseconds. Default latency is 1000ms. A STREAMED request has no body to resolve with until it is finalized, so it resolves with a StreamPollResult instead: the text arrived through onStream.
}
```

## RTCChannelOption

```ts
type RTCChannelOption = RTCDataChannelInit | 'default' | 'text-chat' | 'file-transfer' | 'video-chat' | 'voice-chat' | 'gaming';
```

A data channel to open: a preset name, or `RTCDataChannelInit` with `protocol` as the channel's label. A string that is not a preset opens a channel of that name with the default options. A `negotiated` channel needs an `id`, and both sides open it.

| Preset | Options |
| --- | --- |
| `default` | ordered, 10 retransmits |
| `text-chat` | ordered, 10 retransmits |
| `file-transfer` | unordered, packets live 3000 ms |
| `video-chat` | ordered, 10 retransmits |
| `voice-chat` | ordered, 10 retransmits |
| `gaming` | unordered, packets live 100 ms |

## RTCConnector

```ts
type RTCConnector = {
    hangup: () => void; // cancels the call while it rings, hangs up once it is up
    connection: Promise<RTCResolved>; // resolves once the other side answers
}
```

## RTCConnectorParams

```ts
type RTCConnectorParams = RTCReceiverParams & {
    cid: string;
    meta?: Record<string, any>; // a JSON object the other side reads on its rtc:incoming message, before it answers
    ringTimeout?: number; // milliseconds to wait for an answer; none by default
}
```

See [RTCReceiverParams](#rtcreceiverparams) for the options both sides share.

## RTCEncodingOption

```ts
type RTCEncodingOption = {
    video?: {
        codecs?: string[]; // preferred first, by name ('VP9', 'H264', 'AV1') or mime type ('video/VP9'); the rest keep their order after them
        maxBitrate?: number; // bits per second
        maxFramerate?: number;
        scaleResolutionDownBy?: number; // 2 sends half the width and height
    };
    audio?: {
        codecs?: string[];
        maxBitrate?: number; // bits per second
    };
}
```

Applied to every track of the kind, those on the call now and those `share()` adds later.

## RTCEvent

```ts
type RTCEvent = {
    type: 'track' | 'trackmute' | 'trackunmute' | 'trackended' | 'unshare' | 'connectionstatechange' | 'close' | 'message' | 'open' | 'bufferedamountlow' | 'error' | 'file' | 'fileprogress' | 'icecandidate' | 'icecandidateend' | 'icecandidateerror' | 'iceconnectionstatechange' | 'icegatheringstatechange' | 'negotiationneeded' | 'signalingstatechange' | 'ringtimeout';
    [key: string]: any;
}
```

| `type` | What it carries |
| --- | --- |
| `track` | A track of the other side arrived: `track`, `streams`, `source` (what the other side says it is: `camera`, `microphone`, `screen`, `custom`, or a name it gave `share()`), `mid`. |
| `trackmute`, `trackunmute`, `trackended` | That track stopped arriving (the other side paused it, took it off the call, or the network stalled), resumed, or is gone for good. Same fields as `track`. |
| `unshare` | A local track left the call: `track`, `source`, and `ended` (true when the track ended on its own, for example by the browser's own Stop sharing button). |
| `connectionstatechange` | `state`: `connecting`, `connected`, `disconnected`, `failed` or `closed`. |
| `open`, `message`, `close`, `error`, `bufferedamountlow` | A data channel event: `label` names the channel, `message` carries `data`. The SDK's own file channel raises `open`, `close` and `error`, never `message`. |
| `fileprogress`, `file` | A file the other side sends with `sendFile()`: `id`, `name`, `size`, `mime` and, while it arrives, `received`; the `file` event adds `file`, the whole thing as a `File`. |
| `ringtimeout` | Nobody answered within `ringTimeout`. The call is closed right after; a `connectionstatechange` with `closed` follows. |
| `negotiationneeded`, `signalingstatechange`, `icecandidate`, `icecandidateend`, `icecandidateerror`, `iceconnectionstatechange`, `icegatheringstatechange` | The browser's own connection events, with the states at that moment. |

## RTCFileInfo

```ts
type RTCFileInfo = {
    id: string;
    name: string;
    size: number;
    mime: string; // the file's type, or application/octet-stream when the sender's browser knew none
}
```

What `sendFile()` resolves with, and the fields of the `fileprogress` and `file` events on the receiving side.

## RTCIceOption

```ts
type RTCIceOption = string | Array<{ urls: string | string[]; username?: string; credential?: string }>;
```

One STUN url, or a list of ICE servers in the browser's own `RTCIceServer` format. A TURN entry needs its `username` and `credential`. Omitted: Skapi's STUN server and TURN relay, with a credential for the user. See [The relay](/realtime/webRTC.md#the-relay).

## RTCMediaOption

```ts
type RTCMediaOption = MediaStream | {
    audio?: boolean | MediaTrackConstraints; // the microphone, with getUserMedia()
    video?: boolean | MediaTrackConstraints; // the camera, with getUserMedia()
    screen?: RTCScreenOption; // the screen, with getDisplayMedia()
}
```

What a side sends. A `MediaStream` is sent as it is. Omitted, or everything false, sends no media; a data channel is enough for a connection.

## RTCMediaSource

```ts
type RTCMediaSource = 'camera' | 'microphone' | 'screen' | 'custom' | string;
```

What a local track is. The SDK names the tracks it captures itself; a stream or track the app passes is `custom`, unless the app names it in `share()`. The other side reads the name as `source` on its `track` events.

## RTCReceiverParams

```ts
type RTCReceiverParams = {
    ice?: RTCIceOption; // Omitted: Skapi's STUN server and TURN relay, with a credential for the user. See "The relay" in the WebRTC guide
    icePolicy?: 'all' | 'relay'; // 'relay' sends everything through the relay, even where a direct path exists
    media?: RTCMediaOption;
    receive?: { audio?: boolean; video?: boolean }; // take a kind you do not send yourself, without a renegotiation
    encoding?: RTCEncodingOption;
    channels?: RTCChannelOption[]; // channels this side opens. Omitted: the caller opens 'default', the answering side none
}
```

The options of the answering side's `connectRTC()`, on its `rtc:incoming` message. The caller's `connectRTC()` takes the same, plus `cid`, `meta` and `ringTimeout`.

## RTCResolved

```ts
type RTCResolved = {
    cid: string; // the other side's connection id
    target: RTCPeerConnection;
    channels: {
        [protocol: string]: RTCDataChannel // by label. One the other side opened under a label this side already uses is kept as "label#id"
    };
    hangup: () => void;
    media: MediaStream; // every local track on the call: camera, microphone, screen, and what share() added
    meta: Record<string, any>; // what the caller passed as `meta`, on both sides
    tracks: (source?: RTCMediaSource) => MediaStreamTrack[]; // the local tracks, all or those of one source
    share: (what: 'screen' | 'camera' | 'microphone' | MediaStream | MediaStreamTrack, options?: RTCShareOptions) => Promise<MediaStreamTrack[]>; // adds to the call; resolves with the tracks added
    unshare: (what: RTCMediaSource | MediaStreamTrack) => void; // takes the tracks of a source, or one track, off the call and stops them
    replace: (what: RTCMediaSource | MediaStreamTrack, track: MediaStreamTrack) => Promise<void>; // swaps a track for another of the same kind, without a new negotiation; the old one is stopped
    mute: (what: { audio?: boolean; video?: boolean; screen?: boolean }) => void; // true pauses, false resumes, omitted leaves it. `video` is the camera and other video, `screen` the screen
    addChannel: (protocol: string, init?: RTCDataChannelInit) => RTCDataChannel; // opens a data channel during the call
    sendFile: (file: Blob, options?: RTCSendFileOptions) => Promise<RTCFileInfo>; // sends a file straight to the other side, over a reliable channel the SDK opens itself; resolves once the other side has it whole
}
```

Hanging up stops every local track of the call. A track that ends on its own (the browser's Stop sharing button, a camera unplugged) comes off the call and raises an `unshare` event.

## RTCScreenOption

```ts
type RTCScreenOption = boolean | (DisplayMediaStreamOptions & { contentHint?: 'text' | 'detail' | 'motion' });
```

`true` captures the screen with the browser's defaults. The object form is passed to `getDisplayMedia()` (`video`, `audio` for the tab or system sound where the browser offers it), and `contentHint` is set on the video track: `text` keeps text on the screen sharp, `motion` favours smooth movement.

## RTCSendFileOptions

```ts
type RTCSendFileOptions = {
    name?: string; // the name the other side gets; the file's own name by default
    onProgress?: (sent: number, total: number) => void; // bytes handed to the connection so far
}
```

## RTCShareOptions

```ts
type RTCShareOptions = {
    [key: string]: any;
    contentHint?: 'text' | 'detail' | 'motion';
    source?: string;
}
```

The second argument of `share()`. For `'screen'`, the `getDisplayMedia()` options plus `contentHint`. For `'camera'` and `'microphone'`, the track constraints, for example `{ facingMode: 'environment' }`. For a stream or track of your own, `source`: its name on the other side's `track` events (`custom` when omitted).

## StreamChunk

```ts
type StreamChunk = {
    /** Sequence number this piece was stored under. Ascending within one request, and the
     *  value a reader sends back as its cursor. */
    seq: number;
    /** Raw relayed text, exactly as the destination wrote it and in whatever format the
     *  destination chose. Skapi parses none of it. Empty string when the chunk was written
     *  without text, which still advances seq. */
    txt: string;
}
```

One piece of a streamed request's relayed response, as a poll hands it back. `onStream(chunk, seq, via)`
receives the `txt` and `seq` of each of these, in order, and never fires for an empty `txt`.

This shape is written inline in the SDK, so it is not importable from `skapi-js` under this name.

See [Streaming Request](/api-bridge/streaming-request.html)

## StreamPollResult

```ts
type StreamPollResult = {
    id: string;         // Request ID in "stamp:entropy" format.
    status: 'pending' | 'running' | 'resolved' | 'failed' | 'cancelled'; // Everything but 'pending' and 'running' is terminal: nothing further is written to the request or to its chunks.
    queue_name: string; // The plain queue name, or an empty string when the request is not queued.
    in_queue: number;   // Unresolved requests in this queue.
    // The fields below are present ONLY when the poll asked for chunks by sending a cursor:
    // forwardRequest()'s poll() does that when an onStream callback was supplied, and
    // forwardRequestStream() always does. Without a cursor you get exactly the four fields
    // above, the same response polling returned before streaming existed.
    stream: boolean;      // Whether the request was made with stream: true. false means there are no chunks to read, ever.
    chunks: StreamChunk[]; // The pieces with seq greater than the cursor that was sent, oldest first.
    last_seq: number;      // The sequence number to send as the next cursor. Stays at the requested value when nothing new arrived.
    more: boolean;         // This read was CAPPED, not the end of the data. See below.
    error?: any;           // Present only on a failed streamed request: what the server recorded about the failure, alongside the chunks that did arrive before the stream died.
}
```

What a poll of a **streamed** request resolves with while it has not been finalized. A buffered
request, and a streamed one that was finalized, resolve with the stored body itself instead: a
response with no `status` field is a body, not this envelope. Like `StreamChunk`, this is a response
shape rather than an exported type name, so there is nothing to import under it.

`more: true` means one read was capped by a size budget, not that the request is unfinished. Ask
again immediately with `last_seq` rather than waiting out the polling interval. The one exception is
`more: true` with no new chunks and an unchanged `last_seq`: that is the server saying the chunk read
itself failed, and re-asking immediately hammers a store that is already in trouble. The SDK's own
readers tell the two apart by whether the cursor moved, and back off on the second.

See [forwardRequest](/api-reference/api-bridge/README.md#forwardrequest) and
[forwardRequestStream](/api-reference/api-bridge/README.md#forwardrequeststream).

See [Streaming Request](/api-bridge/streaming-request.html)

## Subscription

```ts
type Subscription = {
    subscriber: string; // User ID of the subscriber.
    subscription: string; // User ID of the user subscribed to.
    timestamp: number;
    blocked: boolean;
    get_feed: boolean; // Records the user posts with upload_to_feed appear in the subscriber's getFeed().
    get_notified: boolean; // The subscriber gets push notifications for records the user posts with notify_subscribers, and for new references to the user's records with notify_referencing_records.
    get_email: boolean;
}
```

## Table

```ts
type Table = {
    table: string;
    number_of_records: string;
    size: number;
    number_of_records_in_access_group_public?: number;
    number_of_records_in_access_group_private?: number;
    number_of_records_in_access_group_authorized?: number;
    number_of_records_in_access_group_admin?: number;
    [number_of_records_in_access_group_xx: string]: number | string | undefined; // for other access groups
}
```

## Tag

```ts
type Tag = {
    table: string;
    tag: string;
    number_of_records: number;
}
```

## UniqueId

```ts
type UniqueId = {
    unique_id: string;
    record_id: string;
}
```

## UserAttributes

```ts
type UserAttributes = {
    /** User's name */
    name?: string;
    /**
     * User's E-Mail for signin.<br>
     * 64 character max.<br>
     * When E-Mail is changed, E-Mail verified state will be changed to false.
     * E-Mail is only visible to others when set to public.
     * E-Mail should be verified to set to public.
     * */
    email?: string;
    /**
     * User's phone number. Format: "+0012341234"<br>
     * When phone number is changed, phone number verified state will be changed to false.
     * Phone number is only visible to others when set to public.
     * Phone number should be verified to set to public.
     */
    phone_number?: string;
    /** User's address, only visible to others when set to public. */
    address?: string | {
        /**
         * Full mailing address, formatted for display or use on a mailing label. This field MAY contain multiple lines, separated by newlines. Newlines can be represented either as a carriage return/line feed pair ("\r\n") or as a single line feed character ("\n").
         * street_address
         * Full street address component, which MAY include house number, street name, Post Office Box, and multi-line extended street address information. This field MAY contain multiple lines, separated by newlines. Newlines can be represented either as a carriage return/line feed pair ("\r\n") or as a single line feed character ("\n").
        */
        formatted: string;
        // City or locality component.
        locality: string;
        // State, province, prefecture, or region component.
        region: string;
        // Zip code or postal code component.
        postal_code: string;
        // Country name component.
        country: string;
    };
    /**
     * User's gender. Can be "female" and "male".
     * Other values may be used when neither of the defined values are applicable.
     * Only visible to others when set to public.
     */
    gender?: string;
    /** User's birthdate. String format: "1969-07-16", only visible to others when set to public.*/
    birthdate?: string;

    /** Additional string value that can be used freely. This is only accessible to the owner of the account and the admins. */
    misc?: string;
    picture?: string;
    profile?: string;
    website?: string;
    nickname?: string;
    /** User's E-Mail is public when true. E-Mail should be verified. */
    email_public?: boolean;
    /** User's phone number is public when true. Phone number should be verified. */
    phone_number_public?: boolean;
    /** User's address is public when true. */
    address_public?: boolean;
    /** User's gender is public when true. */
    gender_public?: boolean;
    /** User's birthdate is public when true. */
    birthdate_public?: boolean;
}
```

## UserProfile

```ts
type UserProfile = {
    /** Project id of the user account. */
    service: string;
    /** User ID of the project owner. */
    owner: string;
    /** Access level of the user's account. */
    access_group: number;
    /** User's ID. */
    user_id: string;
    /** Country code of where user first signed up from. */
    locale: string;
    /**
    Account approval info and timestamp.
    Comes with string with the following format: "{approver}:{approved | suspended}:{approved_timestamp}"
    
    {approver} is who approved the account:
        [by_master] is when account approval is done manually from skapi admin panel,
        [by_admin] is when approval is done by the admin account with api call within your project.
        [by_skapi] is when account approval is automatically done.
        Open ID logger ID will be the value if the user is logged with openIdLogin()
        This timestamp is generated when the user confirms their signup, or recovers their disabled account.
    
    {approved | suspended}
        [approved] is when the account is approved.
        [suspended] is when the account is blocked by the admin or the master.
    
    {approved_timestamp} is the timestamp when the account is approved or suspended.

     */
    approved: string;
    /** Last login timestamp(Seconds). */
    log: number;
    /** Shows true when user has verified their E-Mail. */
    email_verified?: boolean;
    /** Shows true when user has verified their phone number. */
    phone_number_verified?: boolean;
    /** User's E-Mail is public when true. E-Mail should be verified. */
    email_public?: boolean;
    /** User's phone number is public when true. Phone number should be verified. */
    phone_number_public?: boolean;
    /** User's address is public when true. */
    address_public?: boolean;
    /** User's gender is public when true. */
    gender_public?: boolean;
    /** User's birthdate is public when true. */
    birthdate_public?: boolean;

    /** User's name */
    name?: string;
    /**
     * User's E-Mail for signin.<br>
     * 64 character max.<br>
     * When E-Mail is changed, E-Mail verified state will be changed to false.
     * E-Mail is only visible to others when set to public.
     * E-Mail should be verified to set to public.
     * */
    email?: string;
    /**
     * User's phone number. Format: "+0012341234"<br>
     * When phone number is changed, phone number verified state will be changed to false.
     * Phone number is only visible to others when set to public.
     * Phone number should be verified to set to public.
     */
    phone_number?: string;
    /** User's address, only visible to others when set to public. */
    address?: string | {
        /**
         * Full mailing address, formatted for display or use on a mailing label. This field MAY contain multiple lines, separated by newlines. Newlines can be represented either as a carriage return/line feed pair ("\r\n") or as a single line feed character ("\n").
         * street_address
         * Full street address component, which MAY include house number, street name, Post Office Box, and multi-line extended street address information. This field MAY contain multiple lines, separated by newlines. Newlines can be represented either as a carriage return/line feed pair ("\r\n") or as a single line feed character ("\n").
        */
        formatted: string;
        // City or locality component.
        locality: string;
        // State, province, prefecture, or region component.
        region: string;
        // Zip code or postal code component.
        postal_code: string;
        // Country name component.
        country: string;
    };
    /**
     * User's gender. Can be "female" and "male".
     * Other values may be used when neither of the defined values are applicable.
     * Only visible to others when set to public.
     */
    gender?: string;
    /** User's birthdate. String format: "1969-07-16", only visible to others when set to public.*/
    birthdate?: string;

    /** Additional string value that can be used freely. This is only accessible to the owner of the account and the admins. */
    misc?: string;
    picture?: string;
    profile?: string;
    website?: string;
    nickname?: string;
};
```

## UserPublic

```ts
type UserPublic = {
    /** Access level of the user's account. */
    access_group: number;
    /** User's ID. */
    user_id: string;
    /** Country code of where user first signed up from. */
    locale: string;
    /**
    Account approval info and timestamp.
    Comes with string with the following format: "{approver}:{approved | suspended}:{approved_timestamp}"
    
    {approver} is who approved the account:
        [by_master] is when account approval is done manually from skapi admin panel,
        [by_admin] is when approval is done by the admin account with api call within your project.
        [by_skapi] is when account approval is automatically done.
        Open ID logger ID will be the value if the user is logged with openIdLogin()
        This timestamp is generated when the user confirms their signup, or recovers their disabled account.
    
    {approved | suspended}
        [approved] is when the account is approved.
        [suspended] is when the account is blocked by the admin or the master.
    
    {approved_timestamp} is the timestamp when the account is approved or suspended.

     */
    approved: string;
    /** Account created timestamp(13 digit milliseconds). */
    timestamp: number;
    /** Last login timestamp(Seconds). */
    log: number;
    /** Number of the user's subscribers. */
    subscribers: number;
    /** Number of subscription the user has made */
    subscribed: number;
    /** Number of the records the user have created. */
    records: number;

    /** User's name */
    name?: string;
    /**
     * User's E-Mail for signin.<br>
     * 64 character max.<br>
     * When E-Mail is changed, E-Mail verified state will be changed to false.
     * E-Mail is only visible to others when set to public.
     * E-Mail should be verified to set to public.
     * */
    email?: string;
    /**
     * User's phone number. Format: "+0012341234"<br>
     * When phone number is changed, phone number verified state will be changed to false.
     * Phone number is only visible to others when set to public.
     * Phone number should be verified to set to public.
     */
    phone_number?: string;
    /** User's address, only visible to others when set to public. */
    address?: string | {
        /**
         * Full mailing address, formatted for display or use on a mailing label. This field MAY contain multiple lines, separated by newlines. Newlines can be represented either as a carriage return/line feed pair ("\r\n") or as a single line feed character ("\n").
         * street_address
         * Full street address component, which MAY include house number, street name, Post Office Box, and multi-line extended street address information. This field MAY contain multiple lines, separated by newlines. Newlines can be represented either as a carriage return/line feed pair ("\r\n") or as a single line feed character ("\n").
        */
        formatted: string;
        // City or locality component.
        locality: string;
        // State, province, prefecture, or region component.
        region: string;
        // Zip code or postal code component.
        postal_code: string;
        // Country name component.
        country: string;
    };
    /**
     * User's gender. Can be "female" and "male".
     * Other values may be used when neither of the defined values are applicable.
     * Only visible to others when set to public.
     */
    gender?: string;
    /** User's birthdate. String format: "1969-07-16", only visible to others when set to public.*/
    birthdate?: string;

    picture?: string;
    profile?: string;
    website?: string;
    nickname?: string;
};
```

## WebSocketMessage

```ts
type WebSocketMessage = {
    type: 'message' | 'error' | 'success' | 'close' | 'notice' | 'private' | 'reconnect' | 'rtc:incoming' | 'rtc:closed';
    message?: any;
    connectRTC?: (params: RTCReceiverParams, callback: (e: RTCEvent) => void) => Promise<RTCResolved>; // rtc:incoming: answers the call
    hangup?: () => void; // Reject incoming RTC connection.
    meta?: Record<string, any>; // rtc:incoming: what the caller passed as `meta`
    sources?: string[]; // rtc:incoming: what the caller sends, e.g. ['camera', 'microphone'] or ['screen']
    sender?: string; // user_id of the sender
    sender_cid?: string; // scid of the sender
    sender_rid?: string; // group of the sender
    code?: 'USER_LEFT' | 'USER_DISCONNECTED' | 'USER_JOINED' | null; // code for notice messeges
}
```
