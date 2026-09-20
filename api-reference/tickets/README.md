# API Reference: Tickets

Below are the parameters and return data type references for the methods in TypeScript format.

Tickets are registered from the dashboard's **Tickets** page by the project owner. The SDK has no public register method. See [Tickets](/tickets/introduction.md).

You can import the types in a TypeScript project as below:

```ts
import type {
    TicketAction,
    TicketCondition,
    TicketConditionRow,
    TicketError,
} from "skapi-js";
```

## consumeTicket

```ts
consumeTicket(
    params: {
        ticket_id: string; // The ticket to consume.
        method: 'GET' | 'POST'; // 'POST' sends data as the JSON body. 'GET' sends it as the query string.
        auth?: boolean; // Consume on the signed-in endpoint, as the logged-in user. POST only.
        data?: { [key: string]: any }; // The request data. This is the data root the ticket's condition rows and actions read.
    }
): Promise<{
    ticket_id: string;  // The ticket consumed.
    consume_id: string; // Id of this consumption: base62 of the timestamp in milliseconds, followed by 4 random characters.
    user_id: string;    // The consumer. The user id on the signed-in endpoint, else "<ip>(<user agent>)".
    is_test: boolean;   // Always false here: dry runs go through the check URL, which consumeTicket() never calls.
    timestamp: number;  // When the consumption happened, in milliseconds. Decoded from consume_id.
    hash: string;       // Proof string of the consumption.
}>
```

Sends the request to `https://<first 4 characters of the project id>.skapi.dev/`: `POST /tpa/` with `auth`, `POST /tp/` anonymous, and `GET /tg/` with `data` as the query string.

**Behavior:**
- The body is inspected whatever the HTTP status. A body with `stage` is an error, including a `200` from a ticket with `return200`, and the promise rejects with `new SkapiError(body.message, { code: body.code, cause: body })`, so `err.code`, `err.cause.stage`, `err.cause.action` and `err.cause.detail` are available. `err.cause` is a [TicketError](#ticketerror).
- A body without `stage` is a success, and the promise resolves with the object above.
- `auth: true` with `method: 'GET'` throws before anything is sent.
- `SkapiError.cause` is typed `Error | TicketError`. In TypeScript, narrow it with `'stage' in err.cause` before reading the ticket keys.

#### Errors
```ts
{
    code: "INVALID_PARAMETER";
    message: "Signed-in consumption is POST only.";
}
|
{
    code: TicketError['code'];
    message: TicketError['message'];
    cause: TicketError;
}
```

See [Errors and Logs](/tickets/errors.md)

## getTickets

```ts
getTickets(
    params: {
        ticket_id?: string; // One ticket. Omit for every ticket. An id containing '#' is refused unless the caller is the project owner.
    },
    fetchOptions?: FetchOptions
): Promise<DatabaseResponse<{
    ticket_id: string;
    description: string;
    count?: number;         // Remaining consumptions. Absent = unlimited.
    time_to_live?: number;  // Absolute expiry, in milliseconds since the epoch. Absent = never.
    timestamp: number;      // Registered at, in milliseconds.

    // The keys below are only returned to the project owner. A user of your project
    // always gets the five keys above and nothing else.
    limit_per_user?: number | boolean; // true = once per user, n = n times. Absent or 0 = unlimited.
    updated?: number;                  // Last registered at, in milliseconds.
    condition?: TicketCondition;
    actions?: TicketAction[];
}[]>>
```

The user must be logged in.

The project owner may also pass `ticket_id: '#<ticket_id>#'` to read the consumption log of that ticket. The rows then have the shape [getConsumedTickets()](#getconsumedtickets) returns, plus `failed: true` on a failed consumption.

#### Errors
```ts
{
    code: "INVALID_REQUEST";
    message: "Invalid ticket id."; // A ticket_id containing '#' from a caller who is not the project owner.
}
```

See [FetchOptions](/api-reference/data-types/README.md#fetchoptions)

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

## getConsumedTickets

```ts
getConsumedTickets(
    params: {
        ticket_id?: string; // Only consumptions of this ticket. Omit for every ticket.
    },
    fetchOptions?: FetchOptions
): Promise<DatabaseResponse<{
    ticket_id: string;
    consume_id: string;
    user_id: string;     // The caller's own user id.
    is_test: boolean;    // Always false here: dry runs go through the check URL, which is anonymous, so they are never attributed to a user.
    timestamp: number;   // When the consumption happened, in milliseconds. Decoded from consume_id.
    description: string; // The consumption log as a JSON string. JSON.parse() it; outcome.ok says whether the consumption succeeded.
}[]>>
```

Lists the caller's own consumptions, which means the consumptions made on the signed-in endpoint. Anonymous consumptions are attributed to an address, not to a user, and never appear here. The user must be logged in.

See [The Log Row](/tickets/errors.md#the-log-row)

See [FetchOptions](/api-reference/data-types/README.md#fetchoptions)

See [DatabaseResponse](/api-reference/data-types/README.md#databaseresponse)

## TicketCondition

```ts
type TicketCondition = {
    return200?: boolean; // Answer 200 even when the consumption fails (webhook friendly).
    method?: 'GET' | 'POST'; // Absent = both allowed.
    signature?: { // An HMAC of the request, made with a secret shared with the sender. Verified first, over the raw body.
        secretName: string; // The NAME of a Secret Key of the project, never the secret itself. Must exist at registration. When the named key carries Destinations, EVERY outbound call this ticket makes is held to that list.
        header: string; // The request header carrying the signature. Case-insensitive. Up to 256 characters.
        algorithm?: 'sha256' | 'sha1' | 'sha512'; // Default 'sha256'.
        encoding?: 'hex' | 'base64'; // How the signature in the header is written. Default 'hex'.
        separator?: string; // Splits the header value into items, each trimmed. 1 to 8 characters. Absent: the whole value is one item.
        parts?: string[]; // Patterns matched against each item, each with at most one ${name} capture. At least one captures ${signature}. Up to 10, each up to 256 characters. Default ['${signature}'].
        signed?: string; // Template of the signed bytes. Tokens: ${body}, ${method}, ${header:Name} and the captures of parts. Up to 512 characters. Default '${body}'.
        timestamp?: string; // Template resolving to unix time in seconds, or milliseconds above 10^12. Same tokens. Absent: no time check.
        tolerance?: number; // Seconds the timestamp may be away from now, 1 to 86400. Only used with timestamp. Default 300.
        secret_encoding?: 'raw' | 'base64' | 'hex'; // How the stored secret becomes the HMAC key. Default 'raw'.
        secret_prefix?: string; // Removed from the start of the stored secret before decoding. Up to 64 characters.
    };
    ip?: {
        operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';
        value: string | string[];
    };
    user_agent?: {
        operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';
        value: string | string[];
    };
    headers?: {
        key: string; // Header name, matched case-insensitively.
        operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';
        value: string | string[];
    }[];
    data?: TicketConditionRow[];   // Rows against the POST body.
    params?: TicketConditionRow[]; // Rows against the GET query string.
    user?: {
        key: string; // A consumer attribute, such as "email_verified" or "access_group".
        operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';
        value: any | any[];
    }[]; // Rows against the consumer's attributes. Signed-in endpoint only.
    record_access?: string; // Record id the consumer must own or have been granted. Signed-in endpoint only.
    request?: {
        url: string; // Templated. Must be http(s) with a hostname and resolve to a public address.
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        headers?: { [name: string]: string }; // Templated.
        data?: any; // Templated. Sent as JSON when a content-type header says application/json, else form encoded.
        params?: { [key: string]: string }; // Templated.
        match?: {
            key: string; // A path into the response body.
            operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';
            value: any | any[];
        }[];
    };
}
```

On a string value `>=` means "starts with". A `value` list passes when any member matches. Rows with the same `key` are alternatives; rows with different keys must all match. The parts are evaluated in the order `method`, `signature`, `ip`, `user_agent`, `headers`, `data`, `params`, `user`, `record_access`, `request`.

A `signature` that does not verify, for any reason, fails with `CONDITION_FAILED` and `detail: { field: "signature" }`. Public-key signatures (RSA, ECDSA, Ed25519) are not supported. See [Signature](/tickets/conditions.md#signature).

When the Secret Key named in `signature.secretName` carries Destinations, every outbound call the ticket makes must be to a URL on that list, and one that is not fails with `REQUEST_FAILED` and `detail: { reason: "refused_address" }`. See [Where a signature secret may be sent](/tickets/conditions.md#where-a-signature-secret-may-be-sent).

See [Conditions and Placeholders](/tickets/conditions.md)

## TicketConditionRow

```ts
type TicketConditionRow = {
    key: string; // A path into the data root, such as "data[object][id]". Never templated.
    operator?: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'; // With value: a match row. Without: a capture-only row that never fails.
    value?: any | any[]; // A literal, never templated. A list passes when any member matches.
    setValueWhenMatch?: any; // When the row matches, replaces the value at key in the data root before anything else reads it.
    placeholder?: string; // Stores the value at key (after any replacement) under this name. Must match ^[A-Za-z_][A-Za-z0-9_]*$
}
```

A row of `condition.data` (the POST body) or `condition.params` (the query string), and of a `req` action's response condition.

See [Data and Params](/tickets/conditions.md#data-and-params)

## TicketAction

```ts
type TicketAction =
    | {
        act: 'acsg'; // Set the access group of a user.
        exe: {
            group: number | 'admin'; // 1..99. 'admin' is 99.
            user_id?: string; // The target. Absent = the consumer.
        };
        err?: TicketAction[]; // Error chain, run when this action fails.
    }
    | {
        act: 'acsr'; // Grant private access to a record.
        exe: {
            record_id: string; // A record id, not a unique id.
            user_id?: string | string[]; // The grantees. Absent = the consumer.
        };
        err?: TicketAction[];
    }
    | {
        act: 'pstr'; // Post a record. Everything except user_id is the postRecord() payload.
        exe: {
            table: string | {
                name: string;
                access_group?: number | 'public' | 'authorized' | 'admin' | 'private';
                subscription?: {
                    is_subscription_record?: boolean;
                    upload_to_feed?: boolean;
                    notify_subscribers?: boolean;
                    feed_referencing_records?: boolean;
                    notify_referencing_records?: boolean;
                };
            };
            data?: any;
            index?: { name: string; value: string | number | boolean };
            tags?: string[];
            unique_id?: string; // A retried webhook then updates the same record instead of duplicating it.
            record_id?: string; // Update instead of create.
            reference?: string;
            readonly?: boolean;
            source?: PostRecordConfig['source'];
            user_id?: string; // Post as this user instead of the project owner.
        };
        err?: TicketAction[];
    }
    | {
        act: 'req'; // HTTP request with its own condition and chain.
        exe: {
            url: string; // Must be http(s) with a hostname and resolve to a public address.
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; // Default GET.
            headers?: { [name: string]: string };
            data?: any; // POST/PUT body. Sent as JSON when a content-type header says application/json, else form encoded.
            params?: { [key: string]: string }; // Query.
            match?: {
                key: string;
                operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';
                value: any | any[];
            }[]; // LEGACY, applied to the response body like data rows.
            condition?: Pick<TicketCondition, 'headers' | 'data' | 'user' | 'record_access' | 'request'>; // Against the RESPONSE.
            actions?: TicketAction[]; // Nested chain. Data root = the response body.
        };
        err?: TicketAction[];
    }
    | {
        act: 'srvc'; // Update a Skapi service. Internal: never available to project owners.
        exe: { [key: string]: any };
        err?: TicketAction[];
    };
```

Every string value of `exe` is templated right before the action runs (for `req`: `url`, `method`, `headers`, `data` and `params`; the nested `condition`, `match` and `actions` are not). A string that is entirely a path keeps the value's type; `${...}` inside text becomes a string; bare words are literal.

See [Actions](/tickets/actions.md)

See [PostRecordConfig](/api-reference/data-types/README.md#postrecordconfig)

## TicketError

```ts
type TicketError = {
    code:
        'INVALID_SERVICE' |
        'SERVICE_DISABLED' |
        'TICKET_NOT_FOUND' |
        'TICKET_EXPIRED' |
        'TICKET_EXHAUSTED' |
        'USER_LIMIT_REACHED' |
        'ISSUER_CANNOT_CONSUME' |
        'AUTH_REQUIRED' |
        'METHOD_NOT_ALLOWED' |
        'CONDITION_FAILED' |
        'PATH_NOT_FOUND' |
        'PLACEHOLDER_MISSING' |
        'REQUEST_FAILED' |
        'TIMEOUT' |
        'ACTION_FAILED' |
        'ACTION_FORBIDDEN' |
        'INTERNAL_ERROR';
    message: string; // Human readable, one sentence.
    stage: 'ticket' | 'condition' | 'action';
    action?: { // Only when stage is 'action'.
        act: 'srvc' | 'acsg' | 'acsr' | 'pstr' | 'req';
        path: string; // The failed action's place in the ticket, such as "actions[1].err[0]".
    };
    detail?: { [key: string]: any }; // Code specific. See the error table.
    ticket_id: string;
}
```

The flat error body every consume endpoint answers with, and the `cause` of the `SkapiError` that [consumeTicket](#consumeticket) rejects with. A success body never has `stage`; an error body always does.

See [Error Codes](/tickets/errors.md#error-codes)
