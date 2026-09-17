# Errors and Logs

A consumption either succeeds, and answers `{ tkid, hash }`, or fails at one of three stages: `ticket` (the service and the ticket itself), `condition`, or `action`. Every failure is answered with the same flat JSON body, and most failures are written to the ticket's log.

## The Error Body

```json
{
  "code": "<CODE>",
  "message": "<human readable, one sentence>",
  "stage": "ticket" | "condition" | "action",
  "action": { "act": "req", "path": "actions[1].err[0]" },   // only when stage == "action"
  "detail": { ... },                                          // optional, code specific, JSON safe
  "ticket_id": "<ticket_id>"
}
```

A success body never has `stage`; an error body always does. That is how [`consumeTicket()`](/api-reference/tickets/README.md#consumeticket) tells them apart, whatever the HTTP status.

The status is `400`, or `200` when the ticket's `return200` is on. `INTERNAL_ERROR` is always `500`; `return200` never downgrades it.

`action.path` names the action that failed, counted from the ticket's `actions` list: `actions[1].err[0]` is the first action of the error chain of the second action, and `actions[2].actions[0]` is the first nested action of the third, a `req`.

## Error Codes

| code | stage | when | detail |
|---|---|---|---|
| `INVALID_SERVICE` | ticket | region prefix does not match the host, or service not found | |
| `SERVICE_DISABLED` | ticket | the service's `active` is below 1, checked right after `INVALID_SERVICE` on every route, before the ticket is read | |
| `TICKET_NOT_FOUND` | ticket | no ticket with that id | |
| `TICKET_EXPIRED` | ticket | `time_to_live < now` | `{ "expired_at": <time_to_live> }` |
| `TICKET_EXHAUSTED` | ticket | `count <= 0` | |
| `USER_LIMIT_REACHED` | ticket | per-user limit hit | `{ "limit": <limit_per_user>, "used": <consumptions by this user> }` |
| `ISSUER_CANNOT_CONSUME` | ticket | consumer is the ticket issuer | |
| `AUTH_REQUIRED` | ticket, condition or action | a user is needed and the route is anonymous, or the token is from another project | |
| `METHOD_NOT_ALLOWED` | condition | `condition.method` mismatch | `{ "expected": "POST", "received": "GET" }` |
| `CONDITION_FAILED` | condition | any matcher mismatch | `{ "field": "signature"\|"headers"\|"ip"\|"user_agent"\|"data"\|"params"\|"user"\|"record_access"\|"request", "keys": [ ...unmatched keys ] }` (`keys` empty for signature/ip/user_agent/record_access) |
| `PATH_NOT_FOUND` | condition or action | a path could not be resolved | `{ "path": "data[object][id]" }` |
| `PLACEHOLDER_MISSING` | action | `placeholder[NAME]` referenced but never captured | `{ "placeholder": "NAME" }` |
| `REQUEST_FAILED` | condition (`condition.request`) or action (`req`) | HTTP status >= 300, refused address, connection error, or per-call timeout | `{ "status": 502, "body": <parsed or text, truncated to 4 KB> }` or `{ "reason": "timeout" \| "refused_address" \| "connection" }` |
| `TIMEOUT` | action | the 25 s consumption budget ran out before an action (or request) could start; its `err` chain is skipped | `{ "elapsed_ms": n }` |
| `ACTION_FAILED` | action | the underlying Skapi operation refused (record post, access grant, group update) | `{ "code": "<the operation's code>", "message": "<its message>" }` |
| `ACTION_FORBIDDEN` | action | `srvc` outside a skapi-owned service | |
| `INTERNAL_ERROR` | any | unexpected exception (reported to Skapi) | |

The ticket-stage codes are the checks of [step 1 of a consumption](/tickets/introduction.md), the condition-stage codes come from [Conditions and Placeholders](/tickets/conditions.md), and the action-stage codes from [Actions](/tickets/actions.md).

A code raised inside a `req` action, by its HTTP call, its response condition or its nested chain, is reported with `stage: "action"` and, in `action`, the innermost action that failed: the `req` itself when its HTTP call or its response condition failed, the nested action when its nested chain failed. A `CONDITION_FAILED` from a response condition therefore carries `action: { "act": "req", "path": "actions[2]" }`, while a record post failing inside the nested chain carries `action: { "act": "pstr", "path": "actions[2].actions[0]" }`.

## What `consumeTicket()` Rejects With

[`consumeTicket()`](/api-reference/tickets/README.md#consumeticket) reads the body whatever the HTTP status. A body with `stage` is an error, and the promise rejects with a `SkapiError` whose `message` and `code` come from the body and whose `cause` is the whole body:

```js
try {
    await skapi.consumeTicket({ ticket_id: 'launch-coupon', method: 'GET', data: { code: 'WRONG' } });
}
catch (err) {
    console.log(err.code);          // 'CONDITION_FAILED'
    console.log(err.message);       // one sentence
    console.log(err.cause.stage);   // 'condition'
    console.log(err.cause.detail);  // { field: 'params', keys: ['code'] }
    console.log(err.cause.action);  // { act: 'req', path: 'actions[2]' } on an action failure, else undefined
    console.log(err.cause.ticket_id);
}
```

`err.cause` is a [`TicketError`](/api-reference/tickets/README.md#ticketerror).

Errors raised before the request is sent, such as a missing `ticket_id` or `auth: true` with `method: 'GET'`, are plain `INVALID_PARAMETER` errors with no `cause`.

## `return200`

Webhook senders retry when an endpoint answers anything but 2xx. Most of the time a failed consumption is a request you chose not to handle, such as an event type the condition filters out, and a retry would fail the same way, so the retries only fill the log. `return200: true` answers `200` in those cases. The body is unchanged, so a caller that reads it still sees the error, the Log tab still shows the failure, and `consumeTicket()` still rejects, because it discriminates on `stage` and not on the status.

`return200` covers every failure raised once the ticket has been read, `TICKET_EXPIRED`, `TICKET_EXHAUSTED`, `USER_LIMIT_REACHED` and `ISSUER_CANNOT_CONSUME` included. `INVALID_SERVICE`, `SERVICE_DISABLED`, `TICKET_NOT_FOUND` and the `AUTH_REQUIRED` for a token from another project are raised before the ticket is read, so they are always `400`.

`INTERNAL_ERROR` is the exception: it is always answered with `500`, so the sender does retry, and by then the fault may be gone.

## What Gets Logged

Every successful consumption is logged, and so is every dry run once the ticket has been read, whatever fails after that. Failures of a real consumption are logged when they are worth reading:

- every action-stage failure,
- every condition failure on the signed-in endpoint,
- on an anonymous endpoint, a condition failure only when the request passed `method`, `signature`, `ip`, `user_agent` and `headers` and failed on `data`, `params`, `user`, `record_access` or `request` (except the `X-Skapi-Ticket` loop-guard refusal, which is never logged on a real consumption). Such a request came from a caller that already looks like the intended sender.

Ticket-stage failures of a real consumption (`TICKET_NOT_FOUND`, `TICKET_EXPIRED`, `TICKET_EXHAUSTED` and the rest) and failures of `method`, `signature`, `ip`, `user_agent` and `headers` on an anonymous endpoint are not logged, so a scanner hitting your endpoints does not fill the log.

A failed consumption does not take from the count, and does not count toward the per-user limit.

## The Log Row

A log row's `description` is a JSON string of this shape:

```json
{
  "data": <query string (raw strings) or POST body as received>,
  "method": "post" | "get",
  "headers": { ... },                 // as received, lowercase names; authorization and cookie replaced by "<redacted>"
  "user_agent": "...", "ip": "...", "timestamp": <ms>,
  "note": "...",                      // the consumer's `description` string, when sent
  "outcome": {
    "ok": true | false,
    "check": true,                    // dry run only
    "placeholders": { NAME: value },  // the pool at the end (values truncated to 1 KB of JSON each)
    "actions": [ { "path": "actions[0]", "act": "req", "ok": true, "result": <truncated 1 KB> }
               | { "path": "actions[1]", "act": "pstr", "ok": false, "error": { code, message, detail } } ],
    "error": { code, message, stage, action?, detail? }   // when ok == false
  }
}
```

`outcome.actions` lists every action that ran, in order, with its result or its error, so you can see how far a chain got. `outcome.placeholders` is the pool at the end. The whole string is capped at 60 KB: `data` is truncated first, then the action results.

`note` is the `description` key of the request data (the POST body, or the query string on a GET), when it is a string, cut to 500 characters. It is kept for you to read and replaces nothing.

`headers` never holds a credential: `authorization` and `cookie` are stored as `"<redacted>"`, and `consumer[headers][...]` reads the same redacted values.

`data` holds the query string values as the raw strings they arrived as, before the JSON parsing described in [What the request carries](/tickets/introduction.md#what-the-request-carries).

## Reading the Log in the Dashboard

Open the ticket on the **Tickets** page and switch to the **Log** tab. Each row shows the time, the consumer (the user id, or the address of an anonymous caller) and the result: `ok`, `failed: <code>`, or `check` for a dry run. **Details** opens the full JSON above, with the `note` in its header when there is one. Rows are newest first; **Load more** pages further back.

Only the project owner sees the log, in the dashboard or by calling [`getTickets()`](#who-may-call-gettickets) with `ticket_id: '#<id>#'`.

## `getConsumedTickets()`

A signed-in user can list their own consumptions with [`getConsumedTickets()`](/api-reference/tickets/README.md#getconsumedtickets). Only consumptions made on the signed-in endpoint are attributed to a user, so anonymous ones never appear here. `ticket_id` narrows the list to one ticket.

```js
let consumed = await skapi.getConsumedTickets({ ticket_id: 'unlock-guide' });

for (let row of consumed.list) {
    let log = JSON.parse(row.description);   // the log row above
    console.log(row.ticket_id, row.consume_id, new Date(row.timestamp), log.outcome.ok);
}
```

## Who May Call `getTickets()`

[`getTickets()`](/api-reference/tickets/README.md#gettickets) lists the tickets of the project. Any signed-in user may call it, and sees the public part of each ticket: `ticket_id`, `description`, `count`, `time_to_live` and `timestamp`. Conditions, actions and the log are only returned to the project owner: in the dashboard, or when the owner calls `getTickets()` from the SDK. The owner's rows carry `limit_per_user`, `updated`, `condition` and `actions` as well, and the owner may pass `ticket_id: '#<id>#'` to read that ticket's log rows, the way the dashboard's Log tab does. Every other signed-in user, an admin of the project included, is refused a `ticket_id` containing `#` with `INVALID_REQUEST: Invalid ticket id.`.

```js
let tickets = await skapi.getTickets({});
console.log(tickets.list);
/*
[
    { ticket_id: 'launch-coupon', description: 'Launch coupon', count: 87, timestamp: 1757721600000 },
    { ticket_id: 'unlock-guide', description: 'Unlock the members guide', timestamp: 1757808000000 }
]
*/
```
