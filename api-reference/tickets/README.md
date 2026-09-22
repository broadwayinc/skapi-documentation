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
        auth?: boolean; // Consume on the signed-in endpoint, as the logged-in user. POST only. Needed by a ticket whose condition has user or record_access.
        data?: { [key: string]: any }; // The request data: the JSON body of a POST, read by data rows and ${data}, or the query string of a GET, read by params rows and ${params}.
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
    legacy?: boolean;                  // true: marked "previous rules" on the dashboard. It runs by the rules it was saved with until it is registered again.
}[]>>
```

The user must be logged in.

A ticket with `legacy: true` keeps running by the rules it was saved with until it is registered again, which applies the current rules. Its `condition` and `actions` are returned converted to the current format. See [Tickets saved before this release](/deprecated/deprecated.md#tickets-saved-before-this-release).

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
    return200?: boolean; // Answer 200 even when the consumption fails (webhook friendly). Never changes whether it fails.
    method?: 'GET' | 'POST'; // Absent = both allowed.
    signature?: { // An HMAC of the request, made with a secret shared with the sender. Verified first, over the raw body.
        secretName: string; // The NAME of a Secret Key of the project, never the secret itself. Must exist at registration. Only read to verify; never sent anywhere.
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
    ip?: { // Passes when the caller's IP matches any value ('!=': none of them). A value that is "", [], null or missing is no check.
        operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';
        value: string | string[];
    };
    user_agent?: { // Passes when the user agent matches any value ('!=': none of them). A value that is "", [], null or missing is no check.
        operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';
        value: string | string[];
    };
    headers?: { // Every header listed must be sent and match. Rows on the same header are alternatives. Every row needs a value: null is refused.
        key: string; // Header name, matched case-insensitively.
        operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';
        value: string | string[];
    }[];
    data?: TicketConditionRow[];   // Rows against the POST body. Refused on a GET ticket: a GET request has no body.
    params?: TicketConditionRow[]; // Rows against the query string, on GET and POST.
    user?: { // Signed requests only: an app user calling consumeTicket() with auth: true. A webhook always fails these (AUTH_REQUIRED). Actions read the same attributes as ${user[key]}.
        key: string; // A consumer attribute, such as "email_verified" or "access_group".
        operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';
        value: string | number | boolean | (string | number | boolean)[]; // Required: null is refused.
    }[];
    record_access?: string; // Signed requests only. A record id the consumer must own or have been granted. A webhook always fails it (AUTH_REQUIRED). Actions read it as ${record_access}.
}
```

The parts are evaluated in the order `method`, `signature`, `ip`, `user_agent`, `headers`, `data`, `params`, `user`, `record_access`. The first one that fails is the one reported, and an empty or absent part is not checked.

Rows of `headers`, `data`, `params` and `user` follow one rule: rows with the same `key` are alternatives, rows with different keys must all be satisfied, and a field the request does not carry is a mismatch (a row compared with `null` or `undefined` aside, see [TicketConditionRow](#ticketconditionrow)). A failure is `CONDITION_FAILED` with `detail: { field, keys }`, `keys` listing every key that failed.

On two strings `>=` means "starts with" and `<=` means "ends with"; on two numbers they compare as numbers. `=` and `!=` compare strictly (`1` is not `"1"`). Ordering operators never pass on mixed types, booleans, `null` or a missing field. A `value` list passes `=` and the ordering operators when any member matches, and `!=` when none does.

`user` and `record_access` only pass for signed requests: an app user of this project calling [consumeTicket](#consumeticket) with `auth: true`. A third-party webhook has no session, so a ticket using either always fails for webhooks.

A `signature` that does not verify, for any reason, fails with `CONDITION_FAILED` and `detail: { field: "signature" }`. Public-key signatures (RSA, ECDSA, Ed25519) are not supported. See [Signature](/tickets/conditions.md#signature).

See [Conditions and Placeholders](/tickets/conditions.md)

## TicketConditionRow

```ts
type TicketConditionRow = {
    key: string; // A path relative to its own list, written without ${ }: "id" is the body's id, "order[id]" its order.id; in a response check, a path in the response body. Never templated.
    operator?: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'; // A match row. Without it: a capture-only row, which never passes or fails anything.
    value?: string | number | boolean | null | undefined | Array<string | number | boolean | null>; // A literal, never templated. A match row with no value compares with undefined.
    setValueWhenMatch?: any; // When this row is the first to match its key, replaces the value at key (in the request, or in the response for a response check), so ${data[...]} or ${response[...]} reads the replacement. null replaces nothing.
    placeholder?: string; // Stores the value at key (after any replacement) under this name, when the row matches or is capture-only. Actions read it as ${placeholder[NAME]}. Must match ^[A-Za-z_][A-Za-z0-9_]*$
}
```

A row of `condition.data` (the POST body) or `condition.params` (the query string), and of the `data` of a `req` action's response check.

- Rows are read in order. For each key the first match row that matches wins: its `setValueWhenMatch` applies and its `placeholder` captures, and later match rows on that key are skipped. A match row that does not match captures nothing.
- A capture-only row captures whenever its path exists, and leaves the placeholder unset otherwise.
- Query string values are JSON-parsed when they parse, otherwise they stay strings: `?qty=2` is the number `2`, so a `params` row matches it with `value: 2`, not `"2"`. Header values are always strings.
- `null` and `undefined` keep their JavaScript meaning, and a missing field is `undefined`: `= null` passes on a field that is there and `null`; `!= null` on anything else, a missing field included; `= undefined` on a missing field; `!= undefined` on a field that is there, `null` included. Ordering operators never pass with either. `undefined` is a single value, never a list member.

See [Data and Params](/tickets/conditions.md#data-and-params)

## TicketAction

```ts
type TicketAction =
    | {
        act: 'acsg'; // Set the access group of a user.
        exe: {
            group: number | 'admin' | string; // 1..99. 'admin' is 99. Or a reference that gives one, such as "${placeholder[GROUP]}".
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
            url: string; // Starts with http:// or https:// and a hostname, and resolves to a public address. Values put in with ${...} are percent-encoded. A URL that is one whole reference is refused. Sent as a browser sends it: a tab or line break removed, a hostname outside ASCII IDNA-encoded, a space, another control character or a character outside ASCII in the path or query percent-encoded.
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; // Default GET.
            secretName?: string; // A Secret Key of the project. Must exist at registration. ${CLIENT_SECRET} in the values of headers, data and params is its value. With it, the url's scheme and host must be written out.
            headers?: { [name: string]: string }; // Values templated. A Host or X-Skapi-Ticket header is refused: the engine sets both. A name that is not ASCII or holds ':', a line break or NUL is refused, and so is a value whose text outside ${...} holds a line break, NUL or a character outside Latin-1. A value that breaks that rule once its references are filled in fails the call (REQUEST_FAILED, reason 'invalid_header').
            data?: any; // POST/PUT body. Sent as JSON when a content-type header says application/json, else form encoded.
            params?: { [key: string]: string }; // Query.
            condition?: Pick<TicketCondition, 'headers' | 'data' | 'user' | 'record_access'>; // Checks the RESPONSE, under the same rules as the ticket's condition. Row keys are paths in the response body.
            actions?: TicketAction[]; // Nested chain, any action. Reads the response body as ${response} and ${response[key]}; ${data} is still the request the ticket received.
        };
        err?: TicketAction[];
    };
```

Every string value of `exe` is templated right before the action runs (for `req`: `url`, `method`, `headers`, `data` and `params`; `secretName`, the nested `condition` and `actions` are not). Only text inside `${ }` is a reference, and everything outside it is used as written: `"orders"` and `"order[id]"` are plain text. A string that is exactly one `${...}` keeps the value's type; inside longer text the value becomes text. `$${...}` writes a literal `${...}`.

| reference | reads |
|---|---|
| `${data}`, `${data[key]}` | the request body the ticket received, at every depth. `${data[order][id]}` is the body's `order.id` |
| `${params}`, `${params[key]}` | the query string, on GET and POST |
| `${headers[name]}` | a request header, case-insensitive. `authorization` and `cookie` read `<redacted>` |
| `${placeholder[NAME]}` | a value a condition row captured |
| `${user}`, `${user[key]}` | the signed-in consumer's attributes. Signed requests only |
| `${ip}`, `${user_agent}`, `${method}` | the caller's IP address, user agent and HTTP method |
| `${record_access}` | the record id the condition's `record_access` names. Signed requests only |
| `${response}`, `${response[key]}` | the response body of the enclosing `req`, in its nested `actions` only |
| `${result}`, `${result[key]}` | the result of the previous action in the same chain |
| `${error}`, `${error[key]}` | in an `err` chain: `code`, `message`, `detail`, `action`, `path` |
| `${ticket}`, `${ticket[key]}` | this consumption: `id`, `service`, `owner`, `consume_id`, `timestamp` |
| `${CLIENT_SECRET}` | reserved: see below |

Registration refuses anything else inside `${ }` (`${id}`, `${ip[x]}`, `${placeholder}`, `${[ip]}`), and a reference that can never resolve where it is written (`${response}` outside a `req`'s nested actions, `${error}` outside an `err` chain), with `INVALID_PARAMETER` and a message that lists the valid forms. A reference that does not resolve when the action runs fails the action before it does anything: `PATH_NOT_FOUND`, `PLACEHOLDER_MISSING`, or `AUTH_REQUIRED` for `${user}` on a request that is not signed in. See [Templating](/tickets/conditions.md#templating).

`${CLIENT_SECRET}` is only allowed in the `headers`, `data` and `params` values of a `req` that names a `secretName`, and registration refuses it anywhere else. Each call is held to the Destinations of the Secret Key it carries, and every copy of the key's value in the response, as sent or escaped up to three times over with percent-encoding, backslash escapes and HTML character references (mixed character by character), is replaced by the text `${CLIENT_SECRET}` before it is checked, logged or returned in an error. A copy escaped four times over is not found, and one is not guaranteed to be found when a round of escaping left part of an earlier round's escape readable on its own, such as the `%BA` of `%&#68;0%BA`. The whole response is searched and passed on, never cut. When the 25 second budget runs out while a long one is searched, the action fails with `REQUEST_FAILED` and `detail: { reason: "timeout" }`. A key that no longer exists fails the action with `REQUEST_FAILED` and `detail: { reason: "secret_missing", secretName }`. See [Sending a Secret Key](/tickets/actions.md#sending-a-secret-key).

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
        act: 'acsg' | 'acsr' | 'pstr' | 'req';
        path: string; // The failed action's place in the ticket, such as "actions[1].err[0]".
    };
    detail?: { [key: string]: any }; // Code specific, such as { field, keys } on CONDITION_FAILED and { status, body } or { reason } on REQUEST_FAILED. See the error table.
    ticket_id: string;
}
```

The flat error body every consume endpoint answers with, and the `cause` of the `SkapiError` that [consumeTicket](#consumeticket) rejects with. A success body never has `stage`; an error body always does.

See [Error Codes](/tickets/errors.md#error-codes)
