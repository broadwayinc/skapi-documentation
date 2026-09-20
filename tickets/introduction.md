# Tickets

A ticket is an HTTP endpoint that you register once as the project owner, and that anyone can call afterwards: a webhook sender such as your payment provider, a browser, or a signed-in user of your project. Each call is a **consumption**.

On every consumption Skapi:

1. checks the service and the ticket itself (service active, ticket exists, not expired, count left, per-user limit, issuer, token belongs to this project),
2. evaluates the ticket's **condition** against the incoming request and captures **placeholders** from it,
3. runs the ticket's **actions** in order (an action chain), each with its own **error chain**,
4. writes a consumption log row you can inspect from the dashboard,
5. answers with `{ tkid, hash }` on success or a standardized JSON error.

A ticket is how a request from outside your frontend reaches your database without a server of your own. A payment your payment provider reports becomes an `orders` record and lifts the buyer's access group. A coupon link writes one record per visit. A signed-in user unlocks a private record by calling one URL.

There is no rollback: actions that already ran stay applied when a later one fails. Design tickets so that a repeated call is harmless. See [Actions](/tickets/actions.md#how-a-chain-runs).

## Registering a Ticket

Tickets are registered from the dashboard. Open your project, click **Tickets** in the project menu, then **+ Register Ticket**.

Only the project owner can register, update or delete a ticket. An admin of your project (access group `99`) is refused with `INVALID_REQUEST: Only the project owner can register tickets.`, and the SDK has no public register method.

The detail view has these sections:

- **Ticket**: the identity and the limits of the ticket, listed below.
- **Endpoints**: the URLs the ticket answers on, with copy buttons. They appear as soon as you type an id.
- **Condition**: what an incoming request must look like. See [Conditions and Placeholders](/tickets/conditions.md).
- **Actions**: what happens once the condition passes. See [Actions](/tickets/actions.md).
- **Log**: on an existing ticket, every consumption. See [Reading the Log in the Dashboard](/tickets/errors.md#reading-the-log-in-the-dashboard).

### Ticket fields

- **Ticket ID**: the last segment of the endpoint URL. Must match `^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$`; `#`, `!` and `/` are reserved. It cannot be changed after creation.
- **Description**: up to 500 characters, shown in the list.
- **Remaining consumptions** (`count`): every successful consumption takes one. At `0` the ticket answers `TICKET_EXHAUSTED`. Blank keeps the current value when you update a ticket, and means unlimited on a new one. `0` exhausts the ticket. Tick **Unlimited** to remove the count from an existing ticket.
- **Limit per user** (`limit_per_user`): how many times one user may consume the ticket. `1` means once. Blank means unlimited. Only signed-in consumptions are counted, so it has no effect on the anonymous endpoints.
- **Expires** (`time_to_live`): a date and time after which the ticket answers `TICKET_EXPIRED`. Blank means never. When set it must be in the future.
- **Always answer 200** (`return200`): answer HTTP 200 even when the consumption fails, for webhooks that retry on errors.
- **Method**: Any, GET or POST.

Updating a ticket replaces its whole definition, but the per-user usage counters survive an update, so editing the count does not hand every user a fresh allowance. Deleting a ticket deletes the counters and keeps the log.

### Edit as JSON

The **Edit as JSON** toggle shows the same ticket as one JSON document, which is the form the examples in this guide use:

```json
{
  "ticket_id": "launch-coupon",
  "description": "Launch coupon",
  "count": 100,
  "limit_per_user": 1,
  "time_to_live": null,
  "condition": { "method": "GET", "params": [ { "key": "code", "operator": "=", "value": "LAUNCH24" } ] },
  "actions": [ { "act": "pstr", "exe": { "table": "coupons", "data": { "code": "${code}", "ip": "consumer[ip]" } } } ]
}
```

`count`, `limit_per_user` and `time_to_live` are optional. `count: null` means unlimited and `time_to_live: null` means never; `time_to_live` is otherwise an absolute time in milliseconds since the epoch. Paste a document, click **Apply**, and the builder fills in from it.

## Endpoints

Every ticket answers on a regional host, `https://<reg>.skapi.dev`, where `<reg>` is the first 4 characters of your project id. The dashboard shows the exact URLs in the **Endpoints** section of the ticket.

| route | auth | notes |
|---|---|---|
| `POST /tp/<service_id>/<ticket_id>` | none | body = JSON (or raw text) |
| `GET  /tg/<service_id>/<ticket_id>` | none | query string = data |
| `POST /tpa/<service_id>/<ticket_id>` | Cognito id token in `Authorization` | consumer = the user. POST only |
| `GET/POST /publ/check/<service_id>/<owner_id>/<ticket_id>` | none | dry run: service and ticket checks + condition only, no actions, no count change; log row with `:CHK` |

Signed-in consumption is POST only. The signed-in endpoint is what [`consumeTicket()`](/api-reference/tickets/README.md#consumeticket) calls with `auth: true`; the SDK sends the token, you never handle it.

On the anonymous endpoints the consumer is identified by IP address and user agent. On the signed-in endpoint the consumer is the user, and the token must belong to this project: a token from another Skapi project is refused with `AUTH_REQUIRED`.

### What the request carries

- A POST body is parsed as JSON. A body that is not JSON is kept as a raw string, and every path into it fails.
- A GET query string is the data. Each value is JSON-parsed on its own when it parses (`1` becomes the number `1`, `true` becomes `true`, `{"a":1}` becomes an object), otherwise it stays a string. `?code=LAUNCH24&qty=2` is read as `{ "code": "LAUNCH24", "qty": 2 }`. A GET without a query string has the data `{}`.

The received data is the **data root** that condition rows and action parameters read. See [Paths](/tickets/conditions.md#paths).

## Consuming From a Browser

Use [`consumeTicket()`](/api-reference/tickets/README.md#consumeticket). `method` picks the endpoint, `auth` picks the signed-in one, and `data` is the JSON body of a POST or the query string of a GET.

```js
// anonymous GET: data becomes the query string
let coupon = await skapi.consumeTicket({
    ticket_id: 'launch-coupon',
    method: 'GET',
    data: { code: 'LAUNCH24' }
});

// signed-in POST: the consumer is the logged-in user
let unlocked = await skapi.consumeTicket({
    ticket_id: 'unlock-guide',
    method: 'POST',
    auth: true
});

console.log(unlocked);
/*
{
    ticket_id: 'unlock-guide',
    consume_id: 'UwdAhf6k3Qp',
    user_id: 'f2b6c9e1-3a4d-4c8b-9e0f-1a2b3c4d5e6f',
    is_test: false,
    timestamp: 1757721600000,
    hash: '...'
}
*/
```

`auth: true` with `method: 'GET'` throws `INVALID_PARAMETER: Signed-in consumption is POST only.` before anything is sent.

A failed consumption rejects with a `SkapiError` whose `code` is the ticket error code and whose `cause` is the whole error body. See [What consumeTicket() Rejects With](/tickets/errors.md#what-consumeticket-rejects-with).

:::warning
A browser sends whatever the page tells it to, so the request data of a `consumeTicket()` call is not something a condition can trust on its own. Decide who may run your actions with a [signature](/tickets/conditions.md#signature), or with the signed-in endpoint and rows on the consumer's account.
:::

## Consuming From a Webhook

A webhook sender only needs the URL. Paste the POST endpoint into the sender's settings, or call it with plain HTTP:

```sh
curl -X POST https://eu73.skapi.dev/tp/eu73kXm2PqA9vLb4/order-paid \
  -H 'content-type: application/json' \
  -d '{ "type": "payment.completed", "data": { "object": { "id": "pay_a1B2c3" } } }'
```

Success answers `200` with `application/json`:

```json
{ "tkid": "#order-paid#UwdAhf6k3Qp#203.0.113.7(curl/8.5.0)", "hash": "..." }
```

A failure answers `400`, or `200` when the ticket has **Always answer 200** on, with a flat JSON error:

```json
{
  "code": "CONDITION_FAILED",
  "message": "The \"data\" condition did not match.",
  "stage": "condition",
  "detail": { "field": "data", "keys": ["type"] },
  "ticket_id": "order-paid"
}
```

Every error body has `stage`; a success body never does. See [Errors and Logs](/tickets/errors.md).

## Dry Run

`/publ/check/<service_id>/<owner_id>/<ticket_id>` runs the service and ticket checks and the condition, and stops there: no action runs and the count does not change. It accepts GET and POST, so both kinds of ticket can be tried. The dashboard shows the URL with your owner id filled in.

```sh
# a GET ticket: the query string is the data
curl 'https://eu73.skapi.dev/publ/check/eu73kXm2PqA9vLb4/f2b6c9e1-3a4d-4c8b-9e0f-1a2b3c4d5e6f/launch-coupon?code=LAUNCH24'

# a POST ticket: the body is the data
curl -X POST https://eu73.skapi.dev/publ/check/eu73kXm2PqA9vLb4/f2b6c9e1-3a4d-4c8b-9e0f-1a2b3c4d5e6f/order-paid \
  -H 'content-type: application/json' \
  -d '{ "type": "payment.completed", "data": { "object": { "id": "pay_a1B2c3" } } }'
```

A passing dry run answers the JSON string `"SUCCESS: Ticket check passed. No action taken."`. A failing one answers the same error body a real consumption would. Once the ticket has been read, a dry run is always logged, whatever fails after that: a passing one shows as `check` in the Log tab, with the captured placeholders in its details before an action ever runs, and a failing one shows as `failed: <code>` with `"check": true` in its details, an expired ticket or a signature that does not verify included. Only a dry run that never reaches the ticket (`INVALID_SERVICE`, `SERVICE_DISABLED`, `TICKET_NOT_FOUND`) leaves no row.

:::tip
The dry run evaluates the whole condition, a signature included. To try a signed webhook, point the sender's test mode, or its "send test event" feature, at the check URL and read the Log tab. You can also sign a request yourself. For a ticket with the signature of the [payment webhook example](/tickets/examples.md#a-payment-webhook):

```sh
body='{ "type": "payment.completed", "data": { "object": { "id": "pay_a1B2c3" } } }'
ts=$(date +%s)
sig=$(printf '%s.%s' "$ts" "$body" | openssl dgst -sha256 -hmac "$SIGNING_SECRET" | sed 's/^.* //')
curl -X POST https://eu73.skapi.dev/publ/check/eu73kXm2PqA9vLb4/f2b6c9e1-3a4d-4c8b-9e0f-1a2b3c4d5e6f/order-paid \
  -H 'content-type: application/json' \
  -H "x-signature: t=$ts,v1=$sig" \
  --data-raw "$body"
```

A row marked `failed: CONDITION_FAILED` whose details say `"field": "signature"` means the secret name, the secret itself, or the way the signature fields describe the header is wrong; a `check` row means the signature verified and the placeholders were captured.
:::

## Next

- [Conditions and Placeholders](/tickets/conditions.md): what a request must look like, and how values are read out of it.
- [Actions](/tickets/actions.md): what a ticket does, chaining and error chains.
- [Errors and Logs](/tickets/errors.md): every error code, and the consumption log.
- [Examples](/tickets/examples.md): a payment webhook, a coupon link, and a signed-in unlock.
