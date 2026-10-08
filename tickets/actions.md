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

## Actions in the Dashboard

The **Actions** section of a ticket is the chain as cards, one per action, in the order they run.

![The Actions section of a ticket: a Post record card with its table, data, index, tags and unique id fields, its open error chain holding a second Post record card, and a Set access group card below](/screenshots/tickets-actions.webp)

*Two actions and one error chain. The first card posts the order and, when that fails, its On error chain writes the failure to a second table. The second card lifts the buyer's access group.*

- The select at the top of a card picks the action: **Post record** (`pstr`), **HTTP request** (`req`), **Set access group** (`acsg`) or **Grant record access** (`acsr`). The arrows reorder cards, the cross removes one, and **+ Add action** appends one. The label on the card, such as `actions[0]`, is the path the log and the error body use for it.
- Each field is one key of `exe`. The **${ }** button next to a field writes a reference for you, and **[Show every reference]** at the top of the section lists every root and what it reads.
- **[Show advanced (JSON)]** holds the keys a card groups together, such as a `pstr`'s reference, readonly, source and subscription. **[Show other fields (JSON)]** holds keys the card has no control for; they are merged into the action on save.
- **[Show on error]** opens the card's error chain, labelled **On error** with its level. It is a chain like any other, and its cards read the failure as `${error[...]}`. An **HTTP request** card also has **[Check the response]** for its response condition and **[Show then]** for the nested chain that reads the answer as `${response[...]}`.
- The line under the section title counts the actions used of the fifty a ticket may hold, and nesting stops at eight levels.

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
| `req` | `url`, `headers`, `data`, `params` |
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

The targets are `user_id` (one id or a list; on the dashboard, ids separated by commas), or the consumer. `record_id` must be a record id, not a unique id.

The grant is made on behalf of the record's uploader, so the rules of [`grantPrivateRecordAccess()`](/api-reference/database/README.md#grantprivateaccess) apply: a grantee must be an approved user or an invitation, and the project owner cannot be a grantee. The uploader must be a user of the project or the project owner; a record uploaded anonymously fails with `ACTION_FAILED` and `Record uploader is not a user.`. When none of the targets could be granted, the action fails with `No eligible user.`.

Result: `{ record_id, user_id: [...] }`, the users requested.

```json
{ "act": "acsr", "exe": { "record_id": "9x2K4mQ1pL8vB3nR6tW5yZ0cA7dF" } }
```

## `pstr`: post a record

Posts one record to the project's database, the way [`postRecord()`](/api-reference/database/README.md#postrecord) does from the SDK: the same keys, limits and errors. The one key of its own is `user_id`, which decides who posts it. The full type is the `pstr` member of [`TicketAction`](/api-reference/tickets/README.md#ticketaction).

```ts
{
  act: "pstr",
  exe: {
    table: {                                  // required; a plain name such as "orders" also works
      name: string;                           // required
      access_group?: "public" | "authorized" | "admin" | "private" | number; // 0 to 99
      subscription?: {
        is_subscription_record?: boolean;
        upload_to_feed?: boolean;
        notify_subscribers?: boolean;
        feed_referencing_records?: boolean;
        notify_referencing_records?: boolean;
      } | null;
    } | string;
    data?: any;                               // the record's data: any JSON
    index?: { name: string; value: string | number | boolean };
    tags?: string[];
    unique_id?: string;
    record_id?: string;                       // update this record instead of creating one
    reference?: string | null;                // a record ID or unique ID
    readonly?: boolean;
    source?: {
      referencing_limit?: number | null;
      prevent_multiple_referencing?: boolean;
      can_remove_referencing_records?: boolean;
      only_granted_can_reference?: boolean;
      allow_granted_to_grant_others?: boolean;
      referencing_index_restrictions?: {
        name: string;
        value?: string | number | boolean;
        range?: string | number | boolean;
        condition?: "=" | "!=" | ">" | ">=" | "<" | "<=";
      }[] | null;
    };
    user_id?: string;                         // a user ID: post as this user. Absent: the project owner
  };
  err?: TicketAction[];                       // error chain
}
```

### Parameters

| key | type | required | dashboard field | what it does |
|---|---|---|---|---|
| `table` | object, or a table name | yes | | Where the record goes. A plain name, `"orders"`, is read as `{ "name": "orders" }`. |
| `table.name` | string | yes | **Table** | The table, 1 to 256 characters. See [Creating Records](/database/create.md). |
| `table.access_group` | `"public"`, `"authorized"`, `"admin"`, `"private"`, or a number from 0 to 99 | yes on the dashboard and in Edit as JSON | **Access group** | Who can read the record. Left out: public on a create, unchanged on an update. `"private"` needs `user_id`. See [Access Restrictions](/database/access-restrictions.md). |
| `table.subscription` | object of `true`/`false` flags, or `null` | no | **Show advanced (JSON)**, as `"subscription"` | Subscription settings: who sees the record in a feed and who is notified. Needs `user_id`. `null` clears them on an update. See [Subscription options](/database/subscription.md#subscription-options-overview). |
| `data` | any JSON | no | **Data** | The record's data. |
| `index` | `{ "name": string, "value": string, number or boolean }` | no | **Index name** and **Index value** | One index to query the record by. See [Indexing](/database/indexing.md). |
| `tags` | array of strings | no | **Tags**, separated by commas | See [Tags](/database/tags.md). |
| `unique_id` | string | no | **Unique ID** | A name of your own for the record. Posting the same unique ID again updates that record, so a retried webhook does not duplicate it. See [Unique ID](/database/unique-id.md). |
| `record_id` | string | no | **Record ID** | The record to update. With it, the action updates instead of creating. See [Updating Records](/database/update-record.md). |
| `reference` | string or `null` | no | **Show advanced (JSON)** | The record ID or unique ID of a record this one refers to. See [Referencing](/database/referencing.md). |
| `readonly` | `true` or `false` | no | **Show advanced (JSON)** | `true` makes the record read-only. Needs `user_id`. See [Readonly Record](/database/update-record.md#readonly-record). |
| `source` | object | no | **Show advanced (JSON)** | Rules for the records that reference this one. See [Reference source settings](/database/referencing.md#reference-source-settings-in-postrecord). |
| `user_id` | string: a user ID | no | **Post as user** | Who posts the record. See [Who posts the record](#who-posts-the-record). |

Every value may hold references, such as `${data[order][id]}` or `${placeholder[BUYER]}`, filled in right before the action runs ([What is Templated](#what-is-templated)). A value that is one whole reference keeps its type, so `"value": "${placeholder[AMOUNT]}"` can put a number in the index.

Any other key is refused when the ticket is registered, with `Unknown key "<key>" in "actions[0].exe".`. That includes the `postRecord()` options a ticket does not take: `notification`, `remove_bin`, `reference_private_key` and `progress`. A ticket cannot attach files to a record.

### Who posts the record

- **Without `user_id`**, the project owner posts it. The project owner is not a user of the project, so a record it creates cannot be private, read-only or carry subscription settings (see [What Project Owners Cannot Do](/admin/intro.md#what-project-owners-cannot-do)); the post is refused and the action fails with `ACTION_FAILED`. The exception is an update of another user's record (`record_id`), which the project owner may make read-only or whose subscription settings it may change.
- **With `user_id`**, that user posts it and the record is theirs. Write `${user[user_id]}` for the signed-in consumer ([signed requests](/tickets/conditions.md#user) only), or a placeholder a condition row captured, such as `${placeholder[BUYER]}`. Once its references are filled in, the value must be:
  - a user ID, which is a UUID such as `8f3a2c1e-4b5d-4e6f-9a7b-1c2d3e4f5a6b`. Anything else, an empty value included, fails with `ACTION_FAILED`, code `INVALID_PARAMETER` and `Post as user ("user_id") is not a valid user ID (UUID).`
  - not the project owner's own ID, which fails with `Post as user cannot be the project owner. Leave it empty to post as the project owner.`
  - a user of this project who is active, otherwise the action fails with `User does not exist.` or `User is not active.`

Any other refusal of the post fails the action with `ACTION_FAILED`, with the operation's `code` and `message` in `detail`.

### On the dashboard

- **Access group** starts at **Public** and is always saved with the action. An action saved without one opens as **Public**.
- **Show advanced (JSON)** takes `reference`, `readonly`, `source` and `subscription` only: the first three go into the post, `subscription` into the table. Saving refuses any other key, a value of the wrong type and a misspelt flag. A key the card has its own field for, such as `table` or `data`, is refused with the field to use.
- Saving refuses an action that creates a private or read-only record, or one with subscription settings, while **Post as user** is empty, and marks the field that asks for it. An action with a `record_id` is checked when it runs instead, since the project owner may keep another user's record private or make it read-only.

### Result

The [`RecordData`](/api-reference/data-types/README.md#recorddata) the post returned, so the next action can read `${result[record_id]}`. Records posted by a ticket are written on the server, so they are never client-side [encrypted](/database/encryption.md), even into `private`.

```json
{
  "act": "pstr",
  "exe": {
    "table": {
      "name": "orders",
      "access_group": "admin"
    },
    "unique_id": "order-${data[payment][id]}",
    "index": {
      "name": "buyer",
      "value": "${placeholder[BUYER]}"
    },
    "data": {
      "payment": "${data[payment][id]}",
      "amount": "${data[payment][amount_total]}"
    },
    "user_id": "${placeholder[BUYER]}"
  }
}
```

:::tip
A `unique_id` makes a retried webhook **update** the same record instead of duplicating it. Build it from the sender's own id for the event or the object, as above. See [Unique ID](/database/unique-id.md).
:::

## `req`: HTTP request with its own condition and chain

Sends one HTTP request from the server, checks the answer, and can run more actions on it. The full type is the `req` member of [`TicketAction`](/api-reference/tickets/README.md#ticketaction).

```ts
{
  act: "req",
  exe: {
    url: string;                                     // required
    method?: "GET" | "POST" | "PUT" | "DELETE";      // default "GET"
    secretName?: string;                             // the name of a Secret Key
    headers?: { [name: string]: string };
    data?: any;                                      // the body: POST and PUT only
    params?: { [key: string]: any };                 // the query string
    condition?: {                                    // checks the response
      headers?: { key: string; operator: Operator; value: string | string[] }[];
      data?: TicketConditionRow[];
      user?: { key: string; operator: Operator; value: any }[];
      record_access?: string;
    };
    actions?: TicketAction[];                        // run on the response, read as ${response}
  };
  err?: TicketAction[];                              // error chain
}
// Operator: "=" | "!=" | ">" | ">=" | "<" | "<="
```

### Parameters

| key | type | required | dashboard field | what it does |
|---|---|---|---|---|
| `url` | string | yes | **URL** | Where the request goes: `http://` or `https://` and a hostname. References in it are percent-encoded. See [URL and address rules](#url-and-address-rules). |
| `method` | `"GET"`, `"POST"`, `"PUT"` or `"DELETE"` | no, default `"GET"` | **Method** | Written out, never a reference. |
| `secretName` | string | no | **Secret key** | The name of a [Secret Key](/api-bridge/client-secret-request.md#registering-secret-keys) of the project, written out. Its value replaces `${CLIENT_SECRET}` in `headers`, `data` and `params`. See [Sending a Secret Key](#sending-a-secret-key). |
| `headers` | object of header name to string | no | **Headers**, a JSON object | Request headers, their values templated. `Host` and `X-Skapi-Ticket` cannot be set. See [Headers](#headers). |
| `data` | any JSON | no | **Body**, shown for POST and PUT | The request body. Sent as JSON when a `content-type` header says `application/json`, otherwise form encoded. Not sent on GET or DELETE. |
| `params` | object | no | **Query**, a JSON object | Added to the URL's query string on every method. A value that is not text is sent as compact JSON: `2` as `2`, `["a","b"]` as `["a","b"]`. |
| `condition` | object | no | **[Check the response]** | Checks the answer: `headers` rows against the response headers, `data` rows ([`TicketConditionRow`](/api-reference/tickets/README.md#ticketconditionrow)) against the response body, `user` and `record_access` against the consumer. Literal, never templated. See [Checking the response](#checking-the-response). |
| `actions` | array of actions | no | **[Show then]** | A chain run after the check passes. Its actions read the answer as `${response}` and `${response[key]}`; `${data}` is still the request the ticket received. |

`url`, `headers`, `data` and `params` are templated right before the call ([What is Templated](#what-is-templated)); `method`, `secretName` and `condition` are used as written, and each nested action is templated when it runs. Any other key is refused when the ticket is registered, with `Unknown key "<key>" in "actions[0].exe".`.

Every request also carries `X-Skapi-Ticket: <service_id>/<ticket_id>`, so your server can tell which ticket is calling.

### Headers

`headers` are sent as written, their values templated. Two headers are the engine's own, and a ticket cannot set either: registration refuses them whatever their case or surrounding spaces.

- **`Host`** is always the host of the `url`: `"actions[0].exe.headers.host": the "Host" header cannot be set: it is always the host of the URL.`
- **`X-Skapi-Ticket`** is added to every call: `"actions[0].exe.headers.X-Skapi-Ticket": the "X-Skapi-Ticket" header cannot be set: Skapi adds it to every request a ticket sends.` A copy in a ticket saved before this rule is dropped from the call.

A header name must be ASCII, with no `:`, line break or NUL. A header value cannot hold a line break, NUL or a character outside Latin-1. What you write is checked when you register, so a header that could never be sent is refused before it is saved:

- a name: `"actions[0].exe.headers.X-Näme": the "X-Näme" header cannot be sent: a header name is ASCII, without ":", line breaks or NUL.`
- the text of a value outside its `${...}` references (a `$${...}` counts as the `${...}` it writes): `"actions[0].exe.headers.X-Name": the "X-Name" header cannot be sent: a header value cannot hold line breaks, NUL or characters outside Latin-1 (send such values in the body).` The message never quotes the value.

What a reference fills in is known only when the call is made, and a value read from the request easily breaks the rule (a customer name in Korean, say). Such a call fails with `REQUEST_FAILED` and `detail: { "reason": "invalid_header", "header": "<name>" }` before anything is sent, with the same rule in its message: `The "X-Name" header of the request to "api.example.com" cannot be sent: a header value cannot hold line breaks, NUL or characters outside Latin-1 (send such values in the body).` Send such values in the body.

### Failures and the result

A status of 300 or above, a refused address, a connection error or a timeout raises `REQUEST_FAILED`, with `detail: { status, body }` or `detail: { reason }`. `body` is the parsed answer, or, when its text is longer than 4 KB, the first 4 KB of that text (compact JSON for a JSON answer). Redirects are never followed: a 3xx is a failure. The response check runs only on an answer below 300.

Result: the parsed response body.

```json
{
  "act": "req",
  "exe": {
    "url": "https://api.example.com/fulfil",
    "method": "POST",
    "headers": {
      "content-type": "application/json"
    },
    "data": {
      "user_id": "${result[user_id]}",
      "payment": "${data[payment][id]}"
    },
    "condition": {
      "data": [
        {
          "key": "status",
          "operator": "=",
          "value": "ok"
        }
      ]
    },
    "actions": [
      {
        "act": "pstr",
        "exe": {
          "table": {
            "name": "shipments",
            "access_group": "admin"
          },
          "data": {
            "id": "${response[shipment][id]}",
            "carrier": "${response[carrier]}",
            "payment": "${data[payment][id]}"
          }
        }
      }
    ]
  }
}
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
{
  "act": "req",
  "exe": {
    "url": "https://api.example.com/v1/orders/${data[order][id]}",
    "method": "GET",
    "secretName": "orders_api_key",
    "headers": {
      "Authorization": "Bearer ${CLIENT_SECRET}"
    }
  }
}
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
  {
    "act": "pstr",
    "exe": {
      "table": {
        "name": "orders",
        "access_group": "admin"
      },
      "unique_id": "order-${data[payment][id]}",
      "data": {
        "amount": "${data[payment][amount_total]}"
      }
    }
  },
  {
    "act": "req",
    "exe": {
      "url": "https://api.example.com/notify",
      "method": "POST",
      "headers": {
        "content-type": "application/json"
      },
      "data": {
        "record": "${result[record_id]}",
        "table": "${result[table][name]}"
      }
    }
  }
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
{
  "act": "pstr",
  "exe": {
    "table": {
      "name": "orders",
      "access_group": "admin"
    },
    "data": {
      "payment": "${data[payment][id]}"
    }
  },
  "err": [
    {
      "act": "req",
      "exe": {
        "url": "https://hooks.example.com/alert",
        "method": "POST",
        "headers": {
          "content-type": "application/json"
        },
        "data": {
          "text": "order record failed: ${error[message]}",
          "payment": "${data[payment][id]}"
        }
      }
    }
  ]
}
```

After the alert is sent, the consumption stops and answers the `pstr` failure, not the alert's outcome. An error chain is for telling someone, or for writing a record of the failure; it cannot make the consumption succeed.
