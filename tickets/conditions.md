# Conditions and Placeholders

A ticket's **condition** says what an incoming request must look like. When it fails, the consumption stops before any action runs, and the answer names the first thing that did not match. While it runs, it can also **capture** values from the request into **placeholders** for the actions to use.

The condition is one object. Every key is optional, and an empty condition passes every request:

```ts
{
    return200?: boolean,                 // answer 200 even when the consumption fails (webhook friendly)
    method?: "GET" | "POST",             // absent = both allowed
    signature?:  { secretName, header, algorithm?, encoding?, separator?, parts?, signed?, timestamp?, tolerance?, secret_encoding?, secret_prefix? }, // an HMAC of the request
    ip?:         { operator, value: string | string[] },
    user_agent?: { operator, value: string | string[] },
    headers?: [ { key, operator, value } ],                                  // key = header name, matched case-insensitively
    data?:    [ { key, operator?, value?, setValueWhenMatch?, placeholder? } ], // rows against the POST body
    params?:  [ { key, operator?, value?, setValueWhenMatch?, placeholder? } ], // rows against the GET query string
    user?:    [ { key, operator, value } ],                                  // rows against the consumer's attributes (signed-in only)
    record_access?: string,              // record id the consumer must own or have been granted (signed-in only)
    request?: { url, method?, headers?, data?, params?, match?: [ { key, operator, value } ] }   // an outbound request that must succeed
}
```

The parts are evaluated in this order, and the first failure is the one reported: `method`, `signature`, `ip`, `user_agent`, `headers`, `data`, `params`, `user`, `record_access`, `request`.

## Operators and Rows

`operator` is one of `=`, `!=`, `>`, `>=`, `<`, `<=`. The word forms `eq`, `ne`, `gt`, `gte`, `lt`, `lte` are accepted and stored as the symbols.

- `value` may be a list. The row passes when any member of the list matches.
- On a string, `>=` means **starts with**, as it does in a record index query.
- Comparing values of different types (a number against a string, say) is a mismatch, never an error.

Rows in `headers`, `data`, `params` and `user` combine by key. Rows with the **same** `key` are alternatives: one of them matching satisfies that key. Rows with **different** keys must all match.

```json
"data": [
    { "key": "type", "operator": "=", "value": "payment.completed" },
    { "key": "type", "operator": "=", "value": "payment.captured" },
    { "key": "live", "operator": "=", "value": true }
]
```

Here `type` may be either event, and `live` must be `true` as well.

## `return200` and `method`

`return200: true` answers HTTP 200 even when the consumption fails. The body still carries the error, so a caller that reads it knows what happened, but a webhook sender that retries on non-2xx answers stops retrying. It covers every failure raised once the ticket has been read, `TICKET_EXPIRED`, `TICKET_EXHAUSTED`, `USER_LIMIT_REACHED` and `ISSUER_CANNOT_CONSUME` included. Only `INTERNAL_ERROR` is still answered with 500. See [`return200`](/tickets/errors.md#return200).

`method` restricts the ticket to GET or POST. A request with the other method is refused with `METHOD_NOT_ALLOWED` and `detail: { expected, received }`. When absent, both are allowed.

## Signature

`signature` verifies an HMAC that the sender computed over the request with a secret it shares with you. It is checked before anything else, over the **raw body as received**, never over a parsed or re-serialized copy. Every field is plain data, so any sender that signs with HMAC-SHA256, HMAC-SHA1 or HMAC-SHA512 can be described.

```json
"signature": {
    "secretName": "webhook_secret",
    "header": "x-signature",
    "separator": ",",
    "parts": ["t=${timestamp}", "v1=${signature}"],
    "signed": "${timestamp}.${body}",
    "timestamp": "${timestamp}"
}
```

This one reads a header such as `x-signature: t=1757721600,v1=<hex>`, signs `<timestamp>.<raw body>` with HMAC-SHA256, and refuses a timestamp more than 300 seconds away from now.

| field | default | meaning |
|---|---|---|
| `secretName` | required | The **name** of a Secret Key of your project, never the secret itself. Save the sender's signing secret on the dashboard's **Secret Keys** page, the same store [`forwardRequest()`](/api-bridge/client-secret-request.md#registering-secret-keys) resolves `$CLIENT_SECRET` from, and write its name here. See also [Where a signature secret may be sent](#where-a-signature-secret-may-be-sent). |
| `header` | required | The request header that carries the signature, matched case-insensitively. Up to 256 characters. |
| `algorithm` | `"sha256"` | The HMAC hash: `"sha256"`, `"sha1"` or `"sha512"`. |
| `encoding` | `"hex"` | How the signature in the header is written: `"hex"` or `"base64"`. |
| `separator` | none | Splits the header value into items, and each item is trimmed. 1 to 8 characters; a single space is allowed. Without it, the whole header value is one item. |
| `parts` | `["${signature}"]` | The patterns each item is matched against. See [Header parts](#header-parts). Up to 10 patterns of up to 256 characters each. |
| `signed` | `"${body}"` | A template of the bytes the sender signed. See [Tokens](#tokens). Up to 512 characters. |
| `timestamp` | none | A template that resolves to a unix time: seconds, or milliseconds when the number is above 10^12. Without it, no time check is made. Up to 512 characters. |
| `tolerance` | `300` | How many seconds the timestamp may be away from now, 1 to 86400. Only used with `timestamp`. |
| `secret_encoding` | `"raw"` | How the stored secret becomes the HMAC key: `"raw"` uses its text as is, `"base64"` and `"hex"` decode it. |
| `secret_prefix` | none | Text removed from the start of the stored secret before it is decoded. Up to 64 characters. |

### Header parts

Each pattern in `parts` is literal text with at most **one** capture, `${name}`, where the name uses letters, digits and `_`. Each header item is tried against the patterns in order, and the first pattern whose literal text before and after the capture fits the item captures the rest of it. Literal text is compared exactly, case included. An item that matches no pattern is ignored.

- `${signature}` captures a signature to compare. Several items may carry one, as happens while a sender rotates its secret; the request passes when any one of them matches.
- Any other name, such as `${timestamp}` or `${id}`, becomes a token for `signed` and `timestamp`. When several items capture the same name, the first one wins. `body` and `method` are built-in tokens and cannot be capture names.
- At least one pattern must capture `${signature}`. A request whose header yields no signature fails.

With `"separator": ","` and `"parts": ["t=${timestamp}", "v1=${signature}"]`, the header `t=1757721600,v1=5f2b,v1=9c0d` yields the token `timestamp` = `1757721600` and the two signature candidates `5f2b` and `9c0d`.

### Tokens

`signed` and `timestamp` are literal text in which these tokens are replaced:

| token | value |
|---|---|
| `${body}` | the raw request body, byte for byte as received |
| `${method}` | the HTTP method, upper case |
| `${header:Name}` | the value of the request header `Name`, matched case-insensitively. An absent header fails the verification |
| `${name}` | a capture from `parts` (not `${signature}`) |

Everything else is copied as is. A token that is none of these is refused when you register.

### How verification works

1. When `timestamp` is set, it is resolved and must be a whole number within `tolerance` seconds of now.
2. `signed` is resolved into the bytes to sign.
3. The key is the stored secret with `secret_prefix` removed, decoded according to `secret_encoding`.
4. The HMAC of the signed bytes is computed with `algorithm` and compared, in constant time, with every `${signature}` candidate decoded according to `encoding`. One match passes.

Anything that goes wrong on the way is a plain mismatch, never a server error: a missing header, no signature candidate, a timestamp that is not a number or is out of tolerance, a secret that does not decode, a candidate that is not valid hex or base64, or a `secretName` that names no key. They all fail the same way: `CONDITION_FAILED` with `detail: { "field": "signature" }`.

The key must exist when you register: a `secretName` that names no Secret Key is refused with `INVALID_PARAMETER`. If the key is deleted later, the condition fails on every consumption instead.

### Describing a sender

Look up three things in the sender's documentation: which header carries the signature and how its value is laid out, which bytes are signed, and how the signing secret is given to you. Each answer maps to the fields above. Some common shapes:

A header carrying `t=<timestamp>,v1=<hex>` pairs over `<timestamp>.<body>`:

```json
{ "secretName": "webhook_secret", "header": "x-signature", "separator": ",",
  "parts": ["t=${timestamp}", "v1=${signature}"],
  "signed": "${timestamp}.${body}", "timestamp": "${timestamp}" }
```

The hex HMAC of the body, after a `sha256=` prefix:

```json
{ "secretName": "webhook_secret", "header": "x-signature-256", "parts": ["sha256=${signature}"] }
```

The base64 HMAC of the body, alone in the header:

```json
{ "secretName": "webhook_secret", "header": "x-hmac-sha256", "encoding": "base64" }
```

`v0=<hex>` over `v0:<timestamp>:<body>`, with the timestamp in a header of its own:

```json
{ "secretName": "webhook_secret", "header": "x-request-signature", "parts": ["v0=${signature}"],
  "signed": "v0:${header:X-Request-Timestamp}:${body}", "timestamp": "${header:X-Request-Timestamp}" }
```

Space-separated `v1,<base64>` items over `<id>.<timestamp>.<body>`, with the id and the timestamp in headers of their own and a base64 secret that starts with a fixed prefix:

```json
{ "secretName": "webhook_secret", "header": "x-signature", "separator": " ", "parts": ["v1,${signature}"],
  "signed": "${header:X-Id}.${header:X-Timestamp}.${body}", "timestamp": "${header:X-Timestamp}",
  "encoding": "base64", "secret_encoding": "base64", "secret_prefix": "key_" }
```

Public-key signatures (RSA, ECDSA, Ed25519) are not supported: this condition only verifies an HMAC made with a shared secret.

### Where a signature secret may be sent

A Secret Key can carry **Destinations**, the per-key URL allowlist described under [Restricting Where a Key Can Be Sent](/api-bridge/client-secret-request.md#restricting-where-a-key-can-be-sent). When the key named in `signature.secretName` has one, **this ticket may only call URLs on that list**, on every outbound call it makes: `req` actions, a `request` condition, the nested actions of a `req`, and `err` chains alike.

A key with no destinations is unrestricted, exactly as everywhere else, and so is a ticket with no `signature`.

:::warning Restricting a signature secret restricts the whole ticket
This is deliberately broader than "the one call that carries the secret", because no action can inject a secret value: there is no token for it, and the stored secret is read by the verifier alone. The rule is therefore about the ticket, not about one call.

The consequence to plan for: restricting a signature key to the sender's own domain also stops that ticket calling **anything else**, including your own alert webhook. Either leave the key unrestricted, or list every address the ticket calls.
:::

A refused address is an ordinary action failure and never a server error: `REQUEST_FAILED` with `detail: { "reason": "refused_address" }`, raised before the address is resolved or dialled. Every call a ticket makes has redirects turned off already, which is the other half of the rule the [forwardRequest](/api-bridge/forward-request.md) path applies to a restricted key.

The list is read with the key itself, on consumption, from a lookup held for at most 60 seconds, so narrowing a key's Destinations changes where its tickets may call within a minute.

:::warning
`headers`, `ip` and `user_agent` rows are **not authentication**. Anyone can send any header, and addresses and user agents are trivially forged or shared. Use them to filter noise. Use `signature`, or the signed-in endpoint with `user` rows, to decide who gets to run your actions.
:::

## IP, User Agent and Headers

`ip` and `user_agent` each take one `operator` and a `value` or list of values. With `>=` meaning starts with, an address range or a user-agent family is one row:

```json
"ip": { "operator": ">=", "value": ["203.0.113.", "198.51.100."] },
"user_agent": { "operator": ">=", "value": "MyService/" }
```

`headers` rows match request headers. `key` is the header name, compared case-insensitively.

```json
"headers": [ { "key": "x-webhook-source", "operator": "=", "value": "inventory" } ]
```

A mismatch is `CONDITION_FAILED` with `field` set to `"ip"`, `"user_agent"` or `"headers"`; for headers, `detail.keys` lists the header names that did not match.

## Data and Params

`data` rows read the POST body and `params` rows read the query string. That is fixed whatever `method` says: on a GET request the body root is `{}`, and on a POST the query root is `{}`, so a `data` row on a GET ticket finds nothing. A row's `key` is a **path** into that data (see [Paths](#paths) below), and is never templated. Its `value` is a literal, and is never templated either. A row key always reads its own root: `placeholder[...]`, `consumer[...]` and the other [reserved roots](#reserved-roots) exist only for action values and `${...}`, so a row key `ticket[id]` reads the request's own `ticket` key. A key that is not a path is refused when you register.

A row with `operator` and `value` is a **match row**. A mismatch raises `CONDITION_FAILED` with `field: "data"` (or `"params"`) and the keys that did not match in `detail.keys`. A path that does not exist in the request raises `PATH_NOT_FOUND` with the path in `detail.path`.

Two more keys turn a row into more than a check:

- `setValueWhenMatch`: when the row matches, the value at `key` in the data root is **replaced** by this value before anything else reads it. The actions then see the replacement.
- `placeholder`: a name. After the row is evaluated, the value at `key` (after any replacement) is stored under that name for the actions to read.

A row with `placeholder` but no `operator` and `value` is a **capture-only row**. It never fails: when the path is missing, the placeholder simply stays unset.

```json
"data": [
    { "key": "type", "operator": "=", "value": "payment.completed" },
    { "key": "data[object][metadata][user_id]", "placeholder": "BUYER" },
    { "key": "data[object][mode]", "operator": "=", "value": "payment", "setValueWhenMatch": "one-time" }
]
```

The first row is a match row. The second captures the buyer's user id as `BUYER` and never fails. The third, when it matches, rewrites `data[object][mode]` to `"one-time"` for the actions.

## User

`user` rows read the consumer's account, so they only work on the signed-in endpoint. On an anonymous endpoint they raise `AUTH_REQUIRED`.

```json
"user": [
    { "key": "email_verified", "operator": "=", "value": true },
    { "key": "access_group", "operator": ">=", "value": 2 }
]
```

The keys are the consumer's [`UserProfile`](/api-reference/data-types/README.md#userprofile) attributes (`user_id`, `email`, `name`, `locale`, `email_verified`, `email_public` and so on; the verified and public flags are booleans), plus `access_group` as a number and `timestamp` (the approval time in milliseconds, taken from the account's `approved` attribute). Two more, `records` (how many records the user uploaded) and `subscribers`, are looked up only when a row names them.

## Record Access

`record_access` names a record id. The consumer must be the record's uploader, or have been granted private access to it with [`grantPrivateRecordAccess()`](/database/access-restrictions.md#grant-private-access). Signed-in only; on an anonymous endpoint it raises `AUTH_REQUIRED`.

```json
"record_access": "9x2K4mQ1pL8vB3nR6tW5yZ0cA7dF"
```

## Request

`request` sends an HTTP request of its own and fails the condition when it does not succeed. It is the older way to check something on another server before acting, and is kept as it was. A [`req` action](/tickets/actions.md#req-http-request-with-its-own-condition-and-chain) does the same with a response condition and a nested chain, and is the better fit for a new ticket.

```json
"request": {
    "url": "https://api.example.com/licences/${licence}",
    "method": "GET",
    "headers": { "x-api-key": "k_4f9a1c" },
    "match": [ { "key": "status", "operator": "=", "value": "active" } ]
}
```

`url`, `headers`, `data` and `params` are templated with the placeholders captured so far (see [Templating](#templating)). `match` rows are not; they are evaluated against the response body like `data` rows. The URL follows the [address rules](/tickets/actions.md#url-and-address-rules) of the `req` action. A status of 300 or above, a refused address, a connection error or a 10 second timeout raises `REQUEST_FAILED`; a `match` mismatch raises `CONDITION_FAILED` with `field: "request"`.

## Paths

A condition row names a path into the request, such as `data[object][id]`; the leading `data` there is the request's own key (many webhook senders wrap the event's object in `data`), not the row list. Give the row a `placeholder` name and the value at that path is remembered under that name; leave out operator and value and the row only captures. In an action, write the path itself, `placeholder[NAME]`, or embed either in text with `${...}`. A whole-value path keeps the value's type; inside text it becomes a string. Bare words are literal text; to read a top-level key write `${code}`. You need a placeholder only when the value must survive into a request action, whose paths read the response instead.

| you write | where | reads |
|---|---|---|
| `type` | a row `key` | the top-level key `type` of the request |
| `data[object][id]` | a row `key` or an action value | the request's `data`, then its `object`, then its `id` |
| `items[data][0][price][id]` | a row `key` or an action value | the first element of the `data` list, then deeper |
| `placeholder[BUYER]` | an action value | what a row captured as `BUYER` |
| `${type}` | an action value | the top-level key `type`, as a whole value |
| `order-${data[object][id]}` | an action value | the text `order-` followed by the id |
| `orders` | an action value | the literal text `orders` |

:::warning
Paths start at the **received JSON body**, not at the condition. When the body is an event such as `{ "type": ..., "data": { "object": { ... } } }`, everything about the object is addressed as `data[object][...]`. A `data` row whose key is `data[object][id]` is reading the body's `data` key, not the row list it sits in.
:::

A **path** is a bare root segment followed by zero or more bracketed segments: `type`, `data[object][id]`, `items[data][0][price][id]`, `placeholder[SERVICE_ID]`. Segments are literal keys. A segment that is all digits indexes a list when the value is a list, and is a key when the value is an object. There is no escaping inside segments. The root segment may hold letters, digits, `_`, `.` and `-` (`[A-Za-z0-9_][A-Za-z0-9_.\-]*`); a row key that does not fit this grammar is refused at registration.

### The data root

The **data root** is the received data at the ticket level: the POST body parsed as JSON, or the query string for a GET. A POST body that is not JSON is kept as the raw string, and every path into it fails. Inside a `req` action's nested `condition` and `actions`, the data root is that request's **response body** (parsed JSON when possible, else the raw text).

### Reserved roots

In an action value or a `${...}`, the root segment of a path is first checked against the reserved roots below; otherwise it is a key of the data root. Reserved names are always reserved there: a request key with a reserved name is unreachable, and a reserved root used where it is not available raises `PATH_NOT_FOUND` (`result`, `error`) or `AUTH_REQUIRED` (`consumer` user attributes on an anonymous endpoint). Condition row keys never see the reserved roots: a `data` or `params` row key reads the data root and a `user` row key reads the consumer's attributes, whatever the root segment is called.

| reserved root | available | value |
|---|---|---|
| `placeholder[NAME]` | everywhere | the placeholder pool (captures from every condition evaluated so far, including nested `req` conditions) |
| `consumer[...]` | everywhere | `consumer[ip]`, `consumer[user_agent]`, `consumer[method]`, `consumer[headers][<name>]` (lowercase header names; `authorization` and `cookie` read `<redacted>`), and on the signed-in endpoint every consumer attribute of the [`user` rows](#user) (`consumer[user_id]`, `consumer[email]`, ...) |
| `ticket[...]` | everywhere | `ticket[id]`, `ticket[service]`, `ticket[owner]`, `ticket[consume_id]`, `ticket[timestamp]` |
| `result[...]` | inside action chains | the result object of the PREVIOUS action in the same chain. Unset before the first action |
| `error[...]` | inside `err` chains | `error[code]`, `error[message]`, `error[detail]`, `error[action]` (the `act` that failed), `error[path]` (its chain path) |

## Placeholders

The **placeholder pool** is where captures go. It starts empty, every row with a `placeholder` adds to it (rows in a `req` action's response condition included), and every action can read it as `placeholder[NAME]`. A name must match `^[A-Za-z_][A-Za-z0-9_]*$`.

Reading a name that was never captured raises `PLACEHOLDER_MISSING` with `detail: { "placeholder": "NAME" }`. A capture-only row whose path was missing leaves the name unset, so the error surfaces at the action that needs the value, not at the row.

You need a placeholder in two cases. The first is a `req` action: inside its response condition and its nested actions, paths read the response, so a value from the original request must have been captured first. The second is readability: `placeholder[BUYER]` says more than `data[object][metadata][user_id]` when the same value is used in several actions.

At the end of a consumption the pool is written to the log row, so the Log tab shows what was captured.

## Templating

Action parameters are templated right before the action runs, over every **string value** (never a key) of that action's templated keys. Three rules apply:

1. **Whole-value substitution**. A string that is entirely one path with at least one bracket segment (`data[object][amount_total]`, `placeholder[COUNTRY]`), or entirely `${<path>}` (`${type}`), is replaced by the resolved value **with its type kept**: number, boolean, object, list or null.
2. **Interpolation**. Every `${<path>}` inside a longer string is replaced by the value's string form: strings as they are; `null`, `true`, `false`, numbers, objects and lists as compact JSON.
3. **Errors and escapes**. A path that does not resolve raises `PATH_NOT_FOUND`; an unset placeholder raises `PLACEHOLDER_MISSING`. `$${...}` emits a literal `${...}`, and a leading backslash makes a whole-value string literal: `\items[0]` emits `items[0]`. In a JSON ticket the backslash itself is escaped, so the document spells it `"\\items[0]"`.

| action value | request | becomes |
|---|---|---|
| `"data[object][amount_total]"` | `{ "data": { "object": { "amount_total": 4200 } } }` | `4200`, a number |
| `"${type}"` | `{ "type": "payment.completed" }` | `"payment.completed"` |
| `"order-${data[object][id]}"` | `{ "data": { "object": { "id": "pay_a1B2c3" } } }` | `"order-pay_a1B2c3"` |
| `"items: ${items}"` | `{ "items": [1, 2] }` | `"items: [1,2]"` |
| `"orders"` | anything | `"orders"`, bare words are literal |
| `"type"` | anything | `"type"`, no bracket and no `${}` means literal |
| `"$${price}"` | anything | `"${price}"` |
| `"\\items[0]"` (the JSON spelling of `\items[0]`) | anything | `"items[0]"` |

Which keys are templated depends on the action. See [What is Templated](/tickets/actions.md#what-is-templated).
