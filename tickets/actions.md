# Actions

Actions are what a ticket does once its condition passes. A ticket holds an ordered list of them, the **action chain**, and each action can carry its own **error chain** that runs when it fails.

```ts
Action = {
  act: "acsg" | "acsr" | "pstr" | "req",
  exe: { ... },            // parameters, templated
  err?: Action[]           // error chain
}
```

There are four actions:

| `act` | does |
|---|---|
| `acsg` | set the access group of a user |
| `acsr` | grant private access to a record |
| `pstr` | post a record |
| `req` | send an HTTP request, check its response, and run a nested chain on it |

## How a Chain Runs

Actions run in order. Each produces a **result** object, which the next action in the same chain can read as `${result[...]}`.

When an action raises, its `err` chain runs (with `${error[...]}` set, and `${data}` still the request the ticket received), and then the whole consumption **stops** and that error is answered. An `err` action that itself raises runs its own `err` chain and stops the error chain; the error originally reported is unchanged. Nothing is retried and nothing is rolled back.

On a failure the count is not consumed, the per-user counter is not incremented, and a log row with `fail: true` is written. Actions that ran before the failure stay applied.

:::warning No rollback
There is no rollback. When the second action fails, the record the first one posted stays posted, and the sender may retry the whole request. Make every ticket safe to repeat:

- Give a `pstr` action a `unique_id` built from something unique in the request, such as `order-${data[payment][id]}`. A retried webhook then **updates** the same record instead of creating a second one.
- Turn on `return200` for webhooks that retry on non-2xx answers, so a consumption that was refused on purpose (an event type you do not handle, say) is not retried for days.

Together these keep a retried webhook idempotent.
:::

### Limits and the time budget

- At most **50 actions** in the whole tree of a ticket, error chains and nested chains included, nested at most **8** deep. The dashboard enforces both while you edit.
- The whole consumption must finish within **25 seconds** of the request. Before each action and each HTTP call the engine checks what is left; when the budget is gone, the consumption fails with `TIMEOUT` for the action about to run, that action's `err` chain is skipped, and the failure is logged.
- Each HTTP call of a `req` action has a **10 second** timeout, answered as `REQUEST_FAILED` with `reason: "timeout"`.

## What is Templated

An action's parameters are templated right before it runs, by the rules in [Templating](/tickets/conditions.md#templating): only text inside `${ }` is a reference, such as `${data[payment][id]}` or `${placeholder[BUYER]}`, and everything else is used as written. Which keys are templated:

| action | templated keys |
|---|---|
| `req` | `url`, `method`, `headers`, `data`, `params` |
| `acsg`, `acsr`, `pstr` | every key of `exe` |

A `req` action's `method` is one of the four methods and `secretName` is the literal name of a Secret Key; neither holds a reference. Its `condition` and `actions` are not templated up front: the condition rows are literal and are checked against the response, and each nested action is templated when it runs, where `${response}` reads that response. Two things apply to a `req` only: a value interpolated into its `url` is [percent-encoded](#url-and-address-rules), and `${CLIENT_SECRET}` resolves in its `headers`, `data` and `params` values when it names a Secret Key (see [Sending a Secret Key](#sending-a-secret-key)).

Templating only touches string **values**, never object keys. `"amount": "${data[payment][amount_total]}"` becomes the number the request carried; `"table": "orders"` stays the text `orders`.

## `acsg`: set the access group of a user

```ts
exe: { group: number (1..99) | "admin", user_id?: string }
```

The target is `user_id`, or the consumer when `user_id` is absent (on an anonymous endpoint that raises `AUTH_REQUIRED`). `"admin"` is access group `99`.

The same guards apply as to [`grantAccess()`](/api-reference/admin/README.md#grantaccess): the target must be a user of this project, confirmed and not suspended, and the project owner cannot be a target. A refusal is `ACTION_FAILED`, with the operation's own `code` and `message` in `detail`.

Result: `{ user_id, group }`.

```json
{ "act": "acsg", "exe": { "group": 2, "user_id": "${placeholder[BUYER]}" } }
```

`group` may be a reference too, such as `${placeholder[GROUP]}` filled by a [lookup table](/tickets/conditions.md#lookup-tables).

## `acsr`: grant private access to a record

```ts
exe: { record_id: string, user_id?: string | string[] }
```

The targets are `user_id` (one id or a list), or the consumer. `record_id` must be a record id, not a unique id.

The grant is made on behalf of the record's uploader, so the rules of [`grantPrivateRecordAccess()`](/api-reference/database/README.md#grantprivateaccess) apply: a grantee must be an approved user or an invitation, and the project owner cannot be a grantee. The uploader must be a user of the project or the project owner; a record uploaded anonymously fails with `ACTION_FAILED` and `Record uploader is not a user.`. When none of the targets could be granted, the action fails with `No eligible user.`.

Result: `{ record_id, user_id: [...] }`, the users requested.

```json
{ "act": "acsr", "exe": { "record_id": "9x2K4mQ1pL8vB3nR6tW5yZ0cA7dF" } }
```

## `pstr`: post a record

```ts
exe: {
  table: string | { name: string, access_group?: number | "public" | "authorized" | "admin" | "private", subscription?: {...} },
  data?: any, index?: { name, value }, tags?: string[], unique_id?: string,
  record_id?: string,           // update instead of create
  reference?: string, readonly?: boolean, source?: { ... },
  user_id?: string              // post as this user instead of the project owner
}
```

Everything except `user_id` is exactly what [`postRecord()`](/database/create.md) sends: `data` plus the [`PostRecordConfig`](/api-reference/data-types/README.md#postrecordconfig) keys, validated as if the SDK had sent them. So the rules you already know apply. `table` is a name or an object with an `access_group`, `record_id` updates instead of creating, `unique_id` names the record, and what the posting identity may not upload is refused here too, as `ACTION_FAILED` with the operation's `code` and `message` in `detail`.

By default the record is posted **as the project owner**. Set `user_id` to post it as that user instead; the user must exist in the project and be active, otherwise the action fails with `User does not exist.` or `User is not active.`. Keep in mind [what the project owner cannot upload](/admin/intro.md#what-project-owners-cannot-do): a private, subscription or read-only record needs a `user_id`.

Records posted by a ticket are written on the server, so they are never client-side [encrypted](/database/encryption.md), even into `private`.

Result: the [`RecordData`](/api-reference/data-types/README.md#recorddata) the post returned, so the next action can read `${result[record_id]}`.

```json
{ "act": "pstr",
  "exe": { "table": { "name": "orders", "access_group": "admin" },
           "unique_id": "order-${data[payment][id]}",
           "index": { "name": "buyer", "value": "${placeholder[BUYER]}" },
           "data": { "payment": "${data[payment][id]}", "amount": "${data[payment][amount_total]}" } } }
```

:::tip
A `unique_id` makes a retried webhook **update** the same record instead of duplicating it. Build it from the sender's own id for the event or the object, as above. See [Unique ID](/database/unique-id.md).
:::

## `req`: HTTP request with its own condition and chain

```ts
exe: {
  url: string, method?: "GET" | "POST" | "PUT" | "DELETE" (default GET),
  secretName?: string,                           // a Secret Key: ${CLIENT_SECRET} in headers, data and params values
  headers?: { [name]: string }, data?: any (POST/PUT body), params?: { [key]: string } (query),
  condition?: { headers?, data?, user?, record_access? },   // checked against the RESPONSE
  actions?: Action[]                             // nested chain; ${response} = the response body
}
```

`req` sends a request and then checks its answer: `condition` against the response, then `actions`, which read the response body as `${response}` and `${response[key]}`. `${data}` is still the request the ticket received.

`data` is sent as JSON when a `content-type` header says `application/json`, otherwise form encoded. Every request carries `X-Skapi-Ticket: <service_id>/<ticket_id>`, so your server can tell which ticket is calling.

`headers` are sent as written, their values templated. Two headers are the engine's own, and a ticket cannot set either: registration refuses them whatever their case or surrounding spaces.

- **`Host`** is always the host of the `url`: `"actions[0].exe.headers.host": the "Host" header cannot be set: it is always the host of the URL.`
- **`X-Skapi-Ticket`** is added to every call: `"actions[0].exe.headers.X-Skapi-Ticket": the "X-Skapi-Ticket" header cannot be set: Skapi adds it to every request a ticket sends.` A copy in a ticket saved before this rule is dropped from the call.

A header name must be ASCII, with no `:`, line break or NUL. A header value cannot hold a line break, NUL or a character outside Latin-1. What you write is checked when you register, so a header that could never be sent is refused before it is saved:

- a name: `"actions[0].exe.headers.X-Näme": the "X-Näme" header cannot be sent: a header name is ASCII, without ":", line breaks or NUL.`
- the text of a value outside its `${...}` references (a `$${...}` counts as the `${...}` it writes): `"actions[0].exe.headers.X-Name": the "X-Name" header cannot be sent: a header value cannot hold line breaks, NUL or characters outside Latin-1 (send such values in the body).` The message never quotes the value.

What a reference fills in is known only when the call is made, and a value read from the request easily breaks the rule (a customer name in Korean, say). Such a call fails with `REQUEST_FAILED` and `detail: { "reason": "invalid_header", "header": "<name>" }` before anything is sent, with the same rule in its message: `The "X-Name" header of the request to "api.example.com" cannot be sent: a header value cannot hold line breaks, NUL or characters outside Latin-1 (send such values in the body).` Send such values in the body.

A status of 300 or above, a refused address, a connection error or a timeout raises `REQUEST_FAILED`, with `detail: { status, body }` or `detail: { reason }`. `body` is the parsed answer, or, when its text is longer than 4 KB, the first 4 KB of that text (compact JSON for a JSON answer). Redirects are never followed: a 3xx is a failure. The response check runs only on an answer below 300.

Result: the parsed response body.

```json
{ "act": "req",
  "exe": { "url": "https://api.example.com/fulfil", "method": "POST",
           "headers": { "content-type": "application/json" },
           "data": { "user_id": "${result[user_id]}", "payment": "${data[payment][id]}" },
           "condition": { "data": [ { "key": "status", "operator": "=", "value": "ok" } ] },
           "actions": [ { "act": "pstr", "exe": { "table": "shipments",
                          "data": { "id": "${response[shipment][id]}", "carrier": "${response[carrier]}",
                                    "payment": "${data[payment][id]}" } } } ] } }
```

The condition row's key `status` is a path in the response body. Inside the nested `pstr`, `${response[shipment][id]}` and `${response[carrier]}` read the answer, while `${data[payment][id]}` still reads the request the ticket received.

### Checking the response

`condition` checks the answer with the same condition system as the ticket, and the same rules: every part you fill in must pass, an empty part is not checked, and the first part that fails is the one reported. On the dashboard it is the **Check the response** block of an HTTP request action.

- `headers` rows against the response headers. Every header listed must be in the answer and match; rows on the same header are alternatives, and names ignore case.
- `data` rows against the parsed body, their keys paths in it (`status` is the response's `status`), under [the key rule](/tickets/conditions.md#rows-on-the-same-key) of the ticket's own `data` rows: every key listed must pass, rows on the same key are alternatives, and a missing field is a mismatch. [`null` and `undefined`](/tickets/conditions.md#null-and-undefined), captures, `setValueWhenMatch` and [lookup tables](/tickets/conditions.md#lookup-tables) work the same way. A replacement lands in the response, so `${response[...]}` reads it, and captures land in the shared placeholder pool.
- `user` and `record_access` against the consumer. Like the ticket's own, they work only for [signed requests](/tickets/conditions.md#user): a webhook has no session, so they always fail for webhooks.

A response has no method, no query string and no status policy, so `method`, `params`, `return200`, `signature`, `ip` and `user_agent` are refused inside a `req` condition.

Then `actions` run, reading the answer as `${response}`. They may be any action, another `req` with a Secret Key of its own included, whose own nested actions read its answer as `${response}`. A failure anywhere inside, in the HTTP call, in the response check or in the nested chain, is the failure of this `req` action: its `err` chain runs, and `${error[path]}` names the innermost action that failed. It is answered with `stage: "action"` and, in `action`, the innermost action that failed (this `req` for its HTTP call or response check, the nested action for the nested chain), never as a bare condition failure, and is always logged.

### Sending a Secret Key

A `req` can send one of your project's [Secret Keys](/api-bridge/client-secret-request.md#registering-secret-keys), such as the API key of the service it calls, without the key ever being written into the ticket. Name the key in `secretName` (on the dashboard, the **Secret key** select of an HTTP request action), and write `${CLIENT_SECRET}` where its value goes:

```json
{ "act": "req",
  "exe": { "url": "https://api.example.com/v1/orders/${data[order][id]}",
           "method": "GET",
           "secretName": "orders_api_key",
           "headers": { "Authorization": "Bearer ${CLIENT_SECRET}" } } }
```

- **`secretName`** is the literal name of a Secret Key, never templated. It must exist when you register; otherwise registration is refused with `"actions[0].exe.secretName": no secret key named "orders_api_key" in Secret Keys.`
- **`${CLIENT_SECRET}`** is replaced by that key's value, in the **values** of this same `req`'s `headers`, `data` and `params`, and nowhere else. Write it with braces: the bare `$CLIENT_SECRET` of `forwardRequest()` is plain text in a ticket.
- **Where it is refused.** Registration refuses `${CLIENT_SECRET}` in the `url`, in a header name or any other key, in a `req` without `secretName`, in every other action, and in condition rows. Each refusal says where it was found and why.
- **A written-out host.** With `secretName` set, the URL's scheme and host must be written out, with no reference before the path, so a request can never choose where the key goes: `https://api.example.com/v1/orders/${data[order][id]}` is accepted, `https://${placeholder[HOST]}/v1/orders` is refused.
- **Nothing in the request can reach it.** The key is read on the server when the action runs. A request that sends a field called `CLIENT_SECRET`, or the text `${CLIENT_SECRET}` in a value that ends up in the call, sends exactly that text: templating runs once and never expands a value it has just filled in.
- **Never shown back.** Before the response is checked, handed to the nested actions, written to the log, or put into a `REQUEST_FAILED` error, the key's value is replaced by the text `${CLIENT_SECRET}` wherever it is found: in the body, in the response headers, and in the text of a connection error. A copy is found as sent, and escaped up to three times over. Each time it is escaped, any of these notations may be used, mixed character by character: percent-encoding (hex in either case, and `%uXXXX`), backslash escapes (`\uXXXX`, `\u{...}`, `\xXX`, `\/` and the other short escapes), and HTML character references (`&#x2F;`, `&#47;`, `&sol;`). So a key percent-encoded twice inside a redirect link, or written with `&#37;2F` for its `/`, is still found. There are two limits. A copy escaped four times over is not found. And a copy is not guaranteed to be found when one round of escaping escapes only part of an escape the round before it wrote, and the part it leaves as written still reads as an escape on its own: that part is then decoded one round too early, as another character. For a character outside ASCII, the escape is the whole run of `%XX` bytes that writes it. For example, `%&#68;0%BA` is the `%D0%BA` of `к` with only its first `D` escaped, so `%BA` is read alone; `&#3&#x32;&#X3B;` is the `&#32;` of a space with only `2;` escaped, so `&#3` is read alone, since a reference without its `;` is accepted. Percent-encoding, backslash escaping and HTML escaping, each applied to the whole text, never split an escape this way. A space and a `+` count as the same character. When the text right before a copy runs into it as the start of an escape (`5%` before a copy that begins with `ab`), the replacement starts where that escape starts. All of this happens before a long error `body` is cut to 4 KB, and a cut that would end partway into a copy of the key, or partway into an escape, drops that part. The call itself is never logged.
- **Long answers.** An answer of any size is searched whole and passed on whole: nothing is cut, so a JSON body of any size still parses, and the response check, `${response}` and the log read all of it. A body longer than 131,072 characters is searched that many characters at a time, and a copy that runs from one stretch into the next is found as if the body were read at once. While it searches, the call checks the [25 second budget](#limits-and-the-time-budget) about every 131,072 characters. When the budget runs out while the answer is being searched, the action fails with `REQUEST_FAILED`, `detail: { "reason": "timeout" }` and the message `The request to "<host>" timed out.`, and nothing of the answer is passed on. Only the answer to a `req` that names a `secretName` is searched, so no other call can fail this way.
- **Missing key.** When the key no longer exists in Secret Keys, the action fails with `REQUEST_FAILED` and `detail: { "reason": "secret_missing", "secretName": "orders_api_key" }`, and nothing is sent.
- **Locked** does not apply. A ticket reads the key on the server, on your behalf, so the key's Locked setting, which is about which users may call `forwardRequest()`, plays no part.

Each call is held to the **Destinations** of the key it carries, the per-key allowlist described under [Restricting Where a Key Can Be Sent](/api-bridge/client-secret-request.md#restricting-where-a-key-can-be-sent). A key with no destinations may be sent anywhere a ticket can call. A call that carries no key is not restricted by any key. A refused call fails with `REQUEST_FAILED` and `detail: { "reason": "refused_address" }` before the address is resolved or dialled. The list is read with the key itself, from a lookup held for at most 60 seconds, so narrowing a key's Destinations takes effect within a minute.

:::tip
Give every key a ticket sends Destinations that cover only the API it is for, such as `https://api.example.com/v1/orders`. Then no edit to the ticket, and nothing a request carries, can send it anywhere else.
:::

### URL and address rules

Registration validates the shape of the URL; consumption vets the address on every call.

- The URL must start with `http://` or `https://` written out, followed by a hostname: no IP literal, no userinfo (`user@` or `user:password@` before the host). A URL that is one whole reference, such as `${placeholder[URL]}`, is refused.
- A value interpolated into the URL with `${...}` is **percent-encoded** as one piece, `/`, `?`, `#`, `&` and `=` included, so a value from the request cannot add path segments or query parameters. A value that is `.` or `..` is refused with `REQUEST_FAILED` and `reason: "refused_address"`.
- The URL is sent the way a browser sends it. A tab or line break anywhere in it is removed, not encoded: `/a<tab>b` goes out as `/ab`. So are spaces and control characters up to U+001F before the scheme. A hostname outside ASCII is IDNA-encoded: `https://bücher.example/` calls `xn--bcher-kva.example`. In the path and query, a space, any other control character and every character outside ASCII is percent-encoded as UTF-8: `/a b/é` goes out as `/a%20b/%C3%A9`. Text that is already percent-encoded is sent as written. Every rule below reads the encoded hostname, so a name that only looks different, such as one written in fullwidth letters, is judged as the host it reaches.
- A Secret Key's Destinations are compared with the URL as sent, so list what is sent: a hostname outside ASCII in its encoded form (`https://xn--bcher-kva.example`), and a path outside ASCII percent-encoded with uppercase hex, as the engine writes it (`https://api.example.com/caf%C3%A9`, not `/café`, which can never match). A path your URL already writes percent-encoded is compared as you wrote it.
- Registration refuses a hostname that cannot be encoded, such as `bü..x`, or that holds a character standing for `/`, `?`, `#`, `@` or `:` once normalized, such as the fullwidth `／` of `ex／ample.com`, with `"actions[0].exe.url": URL has an invalid hostname.` It refuses a hostname that is an IP address once encoded, such as `１２７.０.０.１` in fullwidth digits or `8.8.8.8.` with a trailing dot, and any `[` or `]` in the host, with `"actions[0].exe.url": URL must use a hostname, not an IP address.` A call made from a stored URL is refused the same way, with `REQUEST_FAILED` and `reason: "refused_address"`.
- The engine resolves the host and refuses loopback, link-local (`169.254/16`, `fe80::/10`), private (`10/8`, `172.16/12`, `192.168/16`, `fc00::/7`), unspecified and IPv4-mapped forms of those.
- Any host under the API domain (`*.skapi.dev`) and any `*.execute-api.*.amazonaws.com` host is refused. A consume request that arrives carrying an `X-Skapi-Ticket` header is refused as well, with `CONDITION_FAILED` and `field: "loop"`, so a ticket cannot call tickets. That refusal is checked on every consumption, before the condition and even when the ticket has none. It is never logged on a real consumption; a [dry run](/tickets/introduction.md#dry-run) logs it like any other failure.
- The connection is pinned to the vetted address. Redirects are never followed; a 3xx is `REQUEST_FAILED` with its status.
- A call that carries a Secret Key must be on that key's Destinations, when it has any. See [Sending a Secret Key](#sending-a-secret-key).
- Every request carries `X-Skapi-Ticket: <service_id>/<ticket_id>`.

A refused address is `REQUEST_FAILED` with `reason: "refused_address"`.

## Chaining With `${result}`

`${result}` and `${result[key]}` read the result object of the previous action **in the same chain**. It is unset before the first action, and a nested chain and an `err` chain start without one.

```json
"actions": [
    { "act": "pstr", "exe": { "table": "orders", "unique_id": "order-${data[payment][id]}",
                              "data": { "amount": "${data[payment][amount_total]}" } } },
    { "act": "req", "exe": { "url": "https://api.example.com/notify", "method": "POST",
                             "headers": { "content-type": "application/json" },
                             "data": { "record": "${result[record_id]}", "table": "${result[table][name]}" } } }
]
```

The `req` reads the record id the `pstr` produced. Had a third action followed, its `${result}` would be the `req`'s response body, so a value needed further down a chain is best captured into a placeholder, or read again with `${data[...]}`.

## Error Chains With `${error}`

An `err` chain is a normal chain that runs only when its action fails. Inside it, `${error}` and its keys describe the failure:

| reference | value |
|---|---|
| `${error[code]}` | the error code, such as `ACTION_FAILED` |
| `${error[message]}` | its one-sentence message |
| `${error[detail]}` | the code-specific detail object |
| `${error[action]}` | the `act` that failed |
| `${error[path]}` | its chain path, such as `actions[2].actions[0]` |

`${data}` is still the request the ticket received, and the placeholder pool holds everything captured so far.

```json
{ "act": "pstr",
  "exe": { "table": { "name": "orders", "access_group": "admin" }, "data": { "payment": "${data[payment][id]}" } },
  "err": [
      { "act": "req",
        "exe": { "url": "https://hooks.example.com/alert", "method": "POST",
                 "headers": { "content-type": "application/json" },
                 "data": { "text": "order record failed: ${error[message]}", "payment": "${data[payment][id]}" } } }
  ] }
```

After the alert is sent, the consumption stops and answers the `pstr` failure, not the alert's outcome. An error chain is for telling someone, or for writing a record of the failure; it cannot make the consumption succeed.
