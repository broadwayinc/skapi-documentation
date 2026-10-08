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

![The Tickets page of a project: the Register Ticket button, a search box, and a table of registered tickets with their id, description, remaining count, per-user limit, expiry and actions](/screenshots/tickets-list.webp)

*The Tickets page. Every registered ticket is one row. Click a row to open it, search by id or description, and tick rows to delete several at once.*

An AI agent can do this for you. The Skapi MCP server registers, updates and deletes tickets and reads their logs from a prompt, so a webhook endpoint is one sentence away. See [Connecting the Skapi MCP server](/introduction/getting-started.md#connecting-the-skapi-mcp-server).

Only the project owner can register, update or delete a ticket. An admin of your project (access group `99`) is refused with `INVALID_REQUEST: Only the project owner can register tickets.`, and the SDK has no public register method.

The detail view has these sections:

- **Ticket**: the identity and the limits of the ticket, listed below.
- **Endpoints**: the URLs the ticket answers on, with copy buttons. They appear as soon as you type an id.
- **Condition**: what an incoming request must look like. See [Conditions and Placeholders](/tickets/conditions.md).
- **Actions**: what happens once the condition passes. See [Actions](/tickets/actions.md).
- **Log**: on an existing ticket, every consumption. See [Reading the Log in the Dashboard](/tickets/errors.md#reading-the-log-in-the-dashboard).

![A ticket opened in the dashboard: the Ticket and Log tabs, the Edit as JSON toggle, the Ticket fields, and the Endpoints section with the POST, GET, signed-in and dry run URLs](/screenshots/tickets-register.webp)

*A ticket opened from the list. The same form registers a new ticket, and its Endpoints appear as soon as you type an id.*

### Ticket fields

- **Ticket ID**: the last segment of the endpoint URL. Must match `^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$`; `#`, `!` and `/` are reserved. It cannot be changed after creation.
- **Description**: up to 500 characters, shown in the list.
- **Remaining** (`count`): every successful consumption takes one. At `0` the ticket answers `TICKET_EXHAUSTED`. Blank keeps the current value when you update a ticket, and means unlimited on a new one. `0` exhausts the ticket. Tick **Unlimited** to remove the count from an existing ticket.
- **Limit per user** (`limit_per_user`): how many times one user may consume the ticket. `1` means once. Blank means unlimited. Only signed-in consumptions are counted, so it has no effect on the anonymous endpoints.
- **Expires** (`time_to_live`): a date and time after which the ticket answers `TICKET_EXPIRED`, entered in your local time. Blank means never. When set it must be in the future.
- **Always 200** (`return200`): answer HTTP 200 even when the consumption fails, for webhooks that retry on errors.
- **Method**: Any, GET or POST. Any accepts both; with GET or POST, a request with the other method fails with `METHOD_NOT_ALLOWED`. See [`return200` and `method`](/tickets/conditions.md#return200-and-method).

Updating a ticket replaces its whole definition, but the per-user usage counters survive an update, so editing the count does not hand every user a fresh allowance. Deleting a ticket deletes the counters and keeps the log.

### Edit as JSON

The **Edit as JSON** toggle at the top of the form shows the same ticket as one JSON document, which is the form the examples in this guide use:

![The same ticket in JSON mode: the Edit as JSON toggle is on, the Ticket JSON editor holds the whole document, and an Apply button sits under it](/screenshots/tickets-json.webp)

*JSON mode. Edit or paste the whole ticket, click Apply to load it into the builder, then Register or Update to save.*

```ts
type Ticket = {
  ticket_id: string;                 // letters, digits, _ and -, up to 64 characters
  description?: string;              // up to 500 characters
  count?: number | null;             // uses left; null = unlimited
  limit_per_user?: number | boolean | null; // per signed-in user; true = 1; false, 0 or null = no limit
  time_to_live?: number | null;      // expiry, ms since the epoch; null = never
  condition?: {
    return200?: boolean;               // answer 200 even when it fails
    method?: "GET" | "POST";           // absent = both
    signature?: {
      secretName: string;                // a Secret Key's name
      header: string;                    // the header holding the signature
      algorithm?: "sha256" | "sha1" | "sha512";
      encoding?: "hex" | "base64";
      separator?: string;
      parts?: string[];
      signed?: string;
      timestamp?: string;
      tolerance?: number;
      secret_encoding?: "raw" | "base64" | "hex";
      secret_prefix?: string;
    };
    ip?: { operator: "=" | "!=" | ">" | ">=" | "<" | "<="; value: string | string[] };
    user_agent?: { operator: "=" | "!=" | ">" | ">=" | "<" | "<="; value: string | string[] };
    headers?: Matcher[];                   // request headers
    data?: Matcher[];                      // POST body
    params?: Matcher[];                    // query string
    user?: Matcher[];                      // signed requests only
    record_access?: string;            // signed requests only
  };
  actions: Action[];                 // required; [] = no actions; up to 50 in total
};

type Matcher = {
  key: string;                       // "keyname" or a path, such as "param[keyname][0]"
  operator?: "=" | "!=" | ">" | ">=" | "<" | "<="; // absent = capture only
  value?: string | number | boolean | null | (string | number | boolean | null)[];
  setValueWhenMatch?: any;           // the placeholder holds this instead of the field's value
  placeholder?: string;              // captures the field's value as ${placeholder[NAME]}
};

type Action =
  | { act: "pstr"; exe: PostRecord; err?: Action[] } // post a record
  | { act: "acsg"; exe: { group: number | "admin"; user_id?: string }; err?: Action[] } // set the access group of a user
  | { act: "acsr"; exe: { record_id: string; user_id?: string | string[] }; err?: Action[] } // grant private access to a record
  | { act: "req"; exe: HttpRequest; err?: Action[] }; // send an HTTP request, check its response, and run a nested chain on it

type PostRecord = {
  table: {
    name: string;
    access_group: "public" | "authorized" | "admin" | "private" | number; // required in JSON mode
    subscription?: {                 // needs user_id: the project owner's records cannot have one
      is_subscription_record?: boolean;     // only the uploader's subscribers can read it
      upload_to_feed?: boolean;             // shows in subscribers' getFeed()
      notify_subscribers?: boolean;         // pushes to subscribers when created
      feed_referencing_records?: boolean;
      notify_referencing_records?: boolean;
    } | null;                        // null clears every setting
  };
  data?: any;
  index?: { name: string; value: any };
  tags?: string[];
  unique_id?: string;
  record_id?: string;                // update this record instead of creating one
  reference?: string;
  readonly?: boolean;
  source?: object;
  user_id?: string;                  // post as this user; absent = the project owner
};

type HttpRequest = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE"; // absent = GET
  secretName?: string;               // fills ${CLIENT_SECRET}
  headers?: { [name: string]: string };
  data?: any;                        // body, POST and PUT only
  params?: { [key: string]: string };
  condition?: { headers?: Matcher[]; data?: Matcher[]; user?: Matcher[]; record_access?: string }; // checked against the response
  actions?: Action[];                // read the response as ${response}
};
```

Every string in `exe` may hold references such as `${data[order][id]}`; see [Conditions](/tickets/conditions.md) and [Actions](/tickets/actions.md) for what each part does. Paste a document of this shape, click **Apply**, and the builder fills in from it. **Apply** refuses a document that leaves out a required parameter and names it: `actions` (write `[]` for a ticket with no actions) and the `access_group` of every `pstr` table, as in `"table": { "name": "orders", "access_group": "public" }`.

JSON mode is the quickest way to register a ticket from an example on these pages, or to copy a ticket from one project to another: switch the toggle on, paste the document, **Apply**, then **Register** or **Update**. The toggle refuses to switch while a field holds something the ticket cannot be saved with, and marks that field, so fix it first. Switching back to the builder with edits you have not applied asks whether to discard them.

Each action card in the builder also has **Show other fields (JSON)**. It holds the keys of that action the card has no control for, or could not load, and they are merged into the action when you save. When a control above fills the same key, the control wins.

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

- **The body.** A POST body is parsed as JSON. A body that is not JSON is kept as its text, so no row key finds anything in it, but an action can still read the whole text as `${data}`. A GET has no body, and reads it as `{}`. `data` rows read the body, and actions read it as `${data}` or `${data[key]}`.
- **The query string**, on both methods. Each value is JSON-parsed on its own when it parses (`1` becomes the number `1`, `true` becomes `true`, `{"a":1}` becomes an object), otherwise it stays a string: `?code=LAUNCH24&qty=2` is read as `{ "code": "LAUNCH24", "qty": 2 }`. A request without a query string reads it as `{}`. `params` rows read the query string, and actions read it as `${params}` or `${params[key]}`.
- **The caller**: its headers, IP address, user agent and method, and on the signed-in endpoint the user. See [References](/tickets/conditions.md#references).

A GET ticket's data is its query string: use `params` rows and `${params[...]}` there.

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
  -d '{ "type": "payment.completed", "payment": { "id": "pay_a1B2c3" } }'
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
  "detail": {
    "field": "data",
    "keys": [
      "type"
    ]
  },
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
  -d '{ "type": "payment.completed", "payment": { "id": "pay_a1B2c3" } }'
```

A passing dry run answers the JSON string `"SUCCESS: Ticket check passed. No action taken."`. A failing one answers the same error body a real consumption would. Once the ticket has been read, a dry run is always logged, whatever fails after that: a passing one shows as `check` in the Log tab, with the captured placeholders in its details before an action ever runs, and a failing one shows as `failed: <code>` with `"check": true` in its details, an expired ticket or a signature that does not verify included. Only a dry run that never reaches the ticket (`INVALID_SERVICE`, `SERVICE_DISABLED`, `TICKET_NOT_FOUND`) leaves no row.

:::tip
The dry run evaluates the whole condition, a signature included. To try a signed webhook, point the sender's test mode, or its "send test event" feature, at the check URL and read the Log tab. You can also sign a request yourself. For a ticket with the signature of the [payment webhook example](/tickets/examples.md#a-payment-webhook):

```sh
body='{ "type": "payment.completed", "payment": { "id": "pay_a1B2c3" } }'
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
- [Examples](/tickets/examples.md): a payment webhook, a coupon link, a signed-in unlock, and a call to an API with your Secret Key.
