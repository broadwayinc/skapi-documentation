# Actions

Actions are what a ticket does once its condition passes. A ticket holds an ordered list of them, the **action chain**, and each action can carry its own **error chain** that runs when it fails.

```ts
Action = {
  act: "srvc" | "acsg" | "acsr" | "pstr" | "req",
  exe: { ... },            // parameters, templated
  err?: Action[]           // error chain
}
```

Four actions are available to you:

| `act` | does |
|---|---|
| `acsg` | set the access group of a user |
| `acsr` | grant private access to a record |
| `pstr` | post a record |
| `req` | send an HTTP request, check its response, and run a nested chain on it |

`srvc` (update a Skapi service) is internal: it exists for skapi.com's own billing webhooks. Registration refuses it on a project, the engine refuses to run it outside a Skapi-owned service with `ACTION_FORBIDDEN`, and the dashboard never offers it.

## How a Chain Runs

Actions run in order. Each produces a **result** object, which the next action in the same chain can read as `result[...]`.

When an action raises, its `err` chain runs (with the data root unchanged and `error[...]` set), and then the whole consumption **stops** and that error is answered. An `err` action that itself raises runs its own `err` chain and stops the error chain; the error originally reported is unchanged. Nothing is retried and nothing is rolled back.

On a failure the count is not consumed, the per-user counter is not incremented, and a log row with `fail: true` is written. Actions that ran before the failure stay applied.

:::warning No rollback
There is no rollback. When the second action fails, the record the first one posted stays posted, and the sender may retry the whole request. Make every ticket safe to repeat:

- Give a `pstr` action a `unique_id` built from something unique in the request, such as `order-${data[object][id]}`. A retried webhook then **updates** the same record instead of creating a second one.
- Turn on `return200` for webhooks that retry on non-2xx answers, so a consumption that was refused on purpose (an event type you do not handle, say) is not retried for days.

Together these keep a retried webhook idempotent.
:::

### Limits and the time budget

- At most **50 actions** in the whole tree of a ticket, error chains and nested chains included, nested at most **8** deep. The dashboard enforces both while you edit.
- The whole consumption must finish within **25 seconds** of the request. Before each action and each HTTP call the engine checks what is left; when the budget is gone, the consumption fails with `TIMEOUT` for the action about to run, that action's `err` chain is skipped, and the failure is logged.
- Each HTTP call (a `req` action, or a `request` condition) has a **10 second** timeout, answered as `REQUEST_FAILED` with `reason: "timeout"`.

## What is Templated

An action's parameters are templated right before it runs, by the rules in [Templating](/tickets/conditions.md#templating). Which keys are templated:

| action | templated keys |
|---|---|
| `req` | `url`, `method`, `headers`, `data`, `params` |
| `acsg`, `acsr`, `pstr` | every key of `exe` |
| `srvc` | none of the above; internal legacy substitution |

A `req` action's `condition`, `match` and `actions` are never templated up front: the condition and match rows are evaluated against the response, and the nested chain is templated action by action when it runs, with the response body as its data root.

Templating only touches string **values**. `"amount": "data[object][amount_total]"` becomes the number the request carried; `"table": "orders"` stays the text `orders`.

## `acsg`: set the access group of a user

```ts
exe: { group: number (1..99) | "admin", user_id?: string }
```

The target is `user_id`, or the consumer when `user_id` is absent (on an anonymous endpoint that raises `AUTH_REQUIRED`). `"admin"` is access group `99`.

The same guards apply as to [`grantAccess()`](/api-reference/admin/README.md#grantaccess): the target must be a user of this project, confirmed and not suspended, and the project owner cannot be a target. A refusal is `ACTION_FAILED`, with the operation's own `code` and `message` in `detail`.

Result: `{ user_id, group }`.

```json
{ "act": "acsg", "exe": { "group": 2, "user_id": "placeholder[BUYER]" } }
```

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

Result: the [`RecordData`](/api-reference/data-types/README.md#recorddata) the post returned, so the next action can read `result[record_id]`.

```json
{ "act": "pstr",
  "exe": { "table": { "name": "orders", "access_group": "admin" },
           "unique_id": "order-${data[object][id]}",
           "index": { "name": "buyer", "value": "placeholder[BUYER]" },
           "data": { "session": "data[object][id]", "amount": "data[object][amount_total]" } } }
```

:::tip
A `unique_id` makes a retried webhook **update** the same record instead of duplicating it. Build it from the sender's own id for the event or the object, as above. See [Unique ID](/database/unique-id.md).
:::

## `req`: HTTP request with its own condition and chain

```ts
exe: {
  url: string, method?: "GET" | "POST" | "PUT" | "DELETE" (default GET),
  headers?: { [name]: string }, data?: any (POST/PUT body), params?: { [key]: string } (query),
  match?: [ { key, operator, value } ],          // LEGACY, applied to the response body like data rows
  condition?: { headers?, data?, user?, record_access?, request? },   // against the RESPONSE
  actions?: Action[]                             // nested chain; data root = response body
}
```

`req` sends a request and then treats the response like a new incoming request: it evaluates `condition` against it, then runs `actions` with the response body as the data root.

`data` is sent as JSON when a `content-type` header says `application/json`, otherwise form encoded. Every request carries `X-Skapi-Ticket: <service_id>/<ticket_id>`, so your server can tell which ticket is calling.

A status of 300 or above, a refused address, a connection error or a timeout raises `REQUEST_FAILED`, with `detail: { status, body }` (the body parsed when possible, truncated to 4 KB) or `detail: { reason }`. Redirects are never followed: a 3xx is a failure.

Then `condition` is evaluated against the response:

- `headers` rows against the response headers (lowercase names),
- `data` rows against the parsed body. Captures land in the shared placeholder pool, and `setValueWhenMatch` works as at the ticket level,
- `user` and `record_access` against the consumer,
- `request` as a nested request condition.

A response has no method, no query string and no status policy, so `method`, `params`, `return200`, `signature`, `ip` and `user_agent` are refused inside a `req` condition.

Then `actions` run, with the response body as their data root. A failure anywhere inside, in the HTTP call, in the condition or in the nested chain, is the failure of this `req` action: its `err` chain runs, and `error[path]` names the innermost action that failed. It is answered with `stage: "action"` and, in `action`, the innermost action that failed (this `req` for its HTTP call or response condition, the nested action for the nested chain), never as a bare condition failure, and is always logged.

Result: the parsed response body.

```json
{ "act": "req",
  "exe": { "url": "https://api.example.com/fulfil", "method": "POST",
           "headers": { "content-type": "application/json" },
           "data": { "user_id": "result[user_id]", "session": "data[object][id]" },
           "condition": { "data": [ { "key": "status", "operator": "=", "value": "ok" },
                                    { "key": "shipment[id]", "placeholder": "SHIPMENT" } ] },
           "actions": [ { "act": "pstr", "exe": { "table": "shipments",
                          "data": { "id": "placeholder[SHIPMENT]", "carrier": "${carrier}" } } } ] } }
```

Inside the nested `pstr`, `${carrier}` reads the response's top-level `carrier`, not the original request. `placeholder[SHIPMENT]` was captured from the response one step earlier. A value from the original request has to have been captured at the ticket level to be reachable here.

### URL and address rules

These rules apply to a `req` action and to a `request` condition. Registration validates the shape of the URL; consumption vets the address on every call.

- The URL must be `http://` or `https://` with a hostname: no IP literal, no user info.
- The engine resolves the host and refuses loopback, link-local (`169.254/16`, `fe80::/10`), private (`10/8`, `172.16/12`, `192.168/16`, `fc00::/7`), unspecified and IPv4-mapped forms of those.
- Any host under the API domain (`*.skapi.dev`) and any `*.execute-api.*.amazonaws.com` host is refused. A consume request that arrives carrying an `X-Skapi-Ticket` header is refused as well, with `CONDITION_FAILED` and `field: "request"`, so a ticket cannot call tickets. That refusal is checked on every consumption, before the condition and even when the ticket has none, and is never logged.
- The connection is pinned to the vetted address. Redirects are never followed; a 3xx is `REQUEST_FAILED` with its status.
- Every request carries `X-Skapi-Ticket: <service_id>/<ticket_id>`.

A refused address is `REQUEST_FAILED` with `reason: "refused_address"`.

## Chaining With `result[...]`

`result[...]` reads the result object of the previous action **in the same chain**. It is unset before the first action, and a nested chain starts without one.

```json
"actions": [
    { "act": "pstr", "exe": { "table": "orders", "unique_id": "order-${data[object][id]}",
                              "data": { "amount": "data[object][amount_total]" } } },
    { "act": "req", "exe": { "url": "https://api.example.com/notify", "method": "POST",
                             "headers": { "content-type": "application/json" },
                             "data": { "record": "result[record_id]", "table": "result[table][name]" } } }
]
```

The `req` reads the record id the `pstr` produced. Had a third action followed, its `result[...]` would be the `req`'s response body, so a value needed further down a chain is best captured into a placeholder, or read again from the data root.

## Error Chains With `error[...]`

An `err` chain is a normal chain that runs only when its action fails. Inside it, `error[...]` describes the failure:

| path | value |
|---|---|
| `error[code]` | the error code, such as `ACTION_FAILED` |
| `error[message]` | its one-sentence message |
| `error[detail]` | the code-specific detail object |
| `error[action]` | the `act` that failed |
| `error[path]` | its chain path, such as `actions[2].actions[0]` |

The data root is unchanged, so the original request is still readable, and the placeholder pool holds everything captured so far.

```json
{ "act": "pstr",
  "exe": { "table": { "name": "orders", "access_group": "admin" }, "data": { "session": "data[object][id]" } },
  "err": [
      { "act": "req",
        "exe": { "url": "https://hooks.example.com/alert", "method": "POST",
                 "headers": { "content-type": "application/json" },
                 "data": { "text": "order record failed: ${error[message]}", "session": "data[object][id]" } } }
  ] }
```

After the alert is sent, the consumption stops and answers the `pstr` failure, not the alert's outcome. An error chain is for telling someone, or for writing a record of the failure; it cannot make the consumption succeed.

## `srvc`: update a Skapi service (internal)

Only Skapi's own proxy services carry this action. It is listed here so that the `act` value is not a surprise when it appears in a log: registering it on a project is refused, and running it outside a Skapi-owned service answers `ACTION_FORBIDDEN`.
