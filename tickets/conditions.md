# Conditions and Placeholders

A ticket's **condition** says what an incoming request must look like. When it fails, the consumption stops before any action runs, and the answer names the first thing that did not match. While it runs, it can also **capture** values from the request into **placeholders** for the actions to use.

The condition is one object. Every key is optional, and an empty condition passes every request:

```ts
{
    return200?: boolean,                 // answer 200 even when the consumption fails (webhook friendly)
    method?: "GET" | "POST",             // absent = both allowed
    signature?:  { header: string, secret: string, scheme: "stripe" | "hmac-sha256" },
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
    { "key": "type", "operator": "=", "value": "checkout.session.completed" },
    { "key": "type", "operator": "=", "value": "checkout.session.async_payment_succeeded" },
    { "key": "livemode", "operator": "=", "value": true }
]
```

Here `type` may be either event, and `livemode` must be `true` as well.

## `return200` and `method`

`return200: true` answers HTTP 200 even when the consumption fails. The body still carries the error, so a caller that reads it knows what happened, but a webhook sender that retries on non-2xx answers stops retrying. It covers every failure raised once the ticket has been read, `TICKET_EXPIRED`, `TICKET_EXHAUSTED`, `USER_LIMIT_REACHED` and `ISSUER_CANNOT_CONSUME` included. Only `INTERNAL_ERROR` is still answered with 500. See [`return200`](/tickets/errors.md#return200).

`method` restricts the ticket to GET or POST. A request with the other method is refused with `METHOD_NOT_ALLOWED` and `detail: { expected, received }`. When absent, both are allowed.

## Signature

`signature` verifies that the body was signed by the sender you expect. It is checked over the **raw body as received**, before anything is parsed.

```json
"signature": { "header": "stripe-signature", "secret": "stripe_webhook", "scheme": "stripe" }
```

- `header`: the request header that carries the signature.
- `secret`: the **name** of a Secret Key of your project, never the secret itself. Save the sender's signing secret on the dashboard's **Secret Keys** page, the same store [`clientSecretRequest()`](/api-bridge/client-secret-request.md#registering-client-secret-keys) resolves `$CLIENT_SECRET` from, and write its name here. A key from the project's legacy `client_secret` store is accepted as well.
- `scheme`:
  - `stripe`: the header is `t=<timestamp>,v1=<hex>`. Skapi signs `<timestamp>.<raw body>` with HMAC-SHA256 using the secret, compares the result against every `v1` in constant time, and refuses a timestamp more than 300 seconds away from now.
  - `hmac-sha256`: the header value is the hex HMAC-SHA256 of the raw body, with an optional `sha256=` prefix. This is the `sha256=<hex>` form GitHub and many other senders use. A base64-encoded HMAC header, such as Shopify's, is not supported.

A header value that is not hex is a mismatch, never an error. A missing header, a signature that does not verify, and a `secret` that names no key all fail the same way: `CONDITION_FAILED` with `detail: { "field": "signature" }`.

The key must exist when you register: a `secret` that names no Secret Key is refused with `INVALID_PARAMETER`. If the key is deleted later, the condition fails on every consumption instead.

:::warning
`headers`, `ip` and `user_agent` rows are **not authentication**. Anyone can send any header, and addresses and user agents are trivially forged or shared. Use them to filter noise. Use `signature`, or the signed-in endpoint with `user` rows, to decide who gets to run your actions.
:::

## IP, User Agent and Headers

`ip` and `user_agent` each take one `operator` and a `value` or list of values. With `>=` meaning starts with, an address range or a user-agent family is one row:

```json
"ip": { "operator": ">=", "value": ["203.0.113.", "198.51.100."] },
"user_agent": { "operator": ">=", "value": "Stripe/" }
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
    { "key": "type", "operator": "=", "value": "checkout.session.completed" },
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

A condition row names a path into the request, such as `data[object][id]`; the leading `data` there is the request's own key (Stripe wraps every event in `data`), not the row list. Give the row a `placeholder` name and the value at that path is remembered under that name; leave out operator and value and the row only captures. In an action, write the path itself, `placeholder[NAME]`, or embed either in text with `${...}`. A whole-value path keeps the value's type; inside text it becomes a string. Bare words are literal text; to read a top-level key write `${code}`. You need a placeholder only when the value must survive into a request action, whose paths read the response instead.

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
Paths start at the **received JSON body**, not at the condition. A Stripe event is `{ "type": ..., "data": { "object": { ... } } }`, so everything about the object is addressed as `data[object][...]`. A `data` row whose key is `data[object][id]` is reading the body's `data` key, not the row list it sits in.
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
| `"${type}"` | `{ "type": "checkout.session.completed" }` | `"checkout.session.completed"` |
| `"order-${data[object][id]}"` | `{ "data": { "object": { "id": "cs_test_a1B2c3" } } }` | `"order-cs_test_a1B2c3"` |
| `"items: ${items}"` | `{ "items": [1, 2] }` | `"items: [1,2]"` |
| `"orders"` | anything | `"orders"`, bare words are literal |
| `"type"` | anything | `"type"`, no bracket and no `${}` means literal |
| `"$${price}"` | anything | `"${price}"` |
| `"\\items[0]"` (the JSON spelling of `\items[0]`) | anything | `"items[0]"` |

Which keys are templated depends on the action. See [What is Templated](/tickets/actions.md#what-is-templated).

## Legacy Tickets

Tickets registered before this version stored a `placeholder` map (`{ "NAME": "path" }`) and a single `action` object. They keep working and are converted when read: each map entry becomes a capture-only row (in `data`, or in `params` when the method is GET), the action object becomes an `actions` list in the order request, update service, access group, record access, and every `$NAME` inside the condition and the converted actions becomes `${placeholder[NAME]}`. Opening such a ticket in the dashboard shows the converted form, and saving it stores that form. Until you save it, the old `$NAME` replacement still runs on every consumption as it always did.
