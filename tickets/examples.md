# Examples

Three tickets, each explained line by line. Paste any of them into the **Edit as JSON** view of the dashboard's Tickets page, click **Apply**, and register.

## A Stripe Checkout Webhook

A Stripe checkout completes. The ticket records the order, lifts the buyer's access group, and asks your fulfilment API to ship. The whole ticket:

```json
{
  "ticket_id": "order-paid",
  "description": "Stripe checkout completed",
  "condition": {
    "return200": true,
    "method": "POST",
    "signature": { "header": "stripe-signature", "secret": "stripe_webhook", "scheme": "stripe" },
    "data": [
      { "key": "type", "operator": "=", "value": "checkout.session.completed" },
      { "key": "data[object][metadata][user_id]", "placeholder": "BUYER" },
      { "key": "data[object][customer_details][address][country]", "placeholder": "COUNTRY" }
    ]
  },
  "actions": [
    { "act": "pstr",
      "exe": { "table": { "name": "orders", "access_group": "admin" },
               "unique_id": "order-${data[object][id]}",
               "index": { "name": "buyer", "value": "placeholder[BUYER]" },
               "data": { "session": "data[object][id]", "amount": "data[object][amount_total]",
                         "country": "placeholder[COUNTRY]", "note": "paid via ${data[object][payment_method_types][0]}" } },
      "err": [ { "act": "req", "exe": { "url": "https://hooks.example.com/alert", "method": "POST",
                 "headers": { "content-type": "application/json" },
                 "data": { "text": "order record failed: ${error[message]}" } } } ] },
    { "act": "acsg", "exe": { "group": 2, "user_id": "placeholder[BUYER]" } },
    { "act": "req",
      "exe": { "url": "https://api.example.com/fulfil", "method": "POST",
               "headers": { "content-type": "application/json" },
               "data": { "user_id": "result[user_id]", "session": "data[object][id]" },
               "condition": { "data": [ { "key": "status", "operator": "=", "value": "ok" },
                                        { "key": "shipment[id]", "placeholder": "SHIPMENT" } ] },
               "actions": [ { "act": "pstr", "exe": { "table": "shipments",
                              "data": { "id": "placeholder[SHIPMENT]", "carrier": "${carrier}" } } } ] } }
  ]
}
```

### The ticket

`"ticket_id": "order-paid"` is the last segment of the endpoint. The webhook URL to paste into Stripe is `https://<reg>.skapi.dev/tp/<service_id>/order-paid`, copied from the **Endpoints** section of the ticket.

`"description"` is what the list shows. There is no `count`, `limit_per_user` or `time_to_live`: the ticket is unlimited and never expires. A per-user limit would not apply anyway, because Stripe calls the anonymous endpoint.

### The condition

`"return200": true`. Stripe retries an endpoint that answers anything but 2xx. An event the condition turns away would fail the same way on every retry, so failures are answered with 200. The error body still says what failed, and the Log tab still records it.

`"method": "POST"`. A GET is answered `METHOD_NOT_ALLOWED`.

`"signature"`. Stripe signs every event with the endpoint's signing secret and sends `t=<timestamp>,v1=<hex>` in the `stripe-signature` header. Save that secret (it starts with `whsec_`) as a [Client Secret Key](/api-bridge/client-secret-request.md#registering-client-secret-keys) named `stripe_webhook`; `"secret": "stripe_webhook"` is that **name**. Skapi recomputes the HMAC over the raw body, compares in constant time, and refuses a timestamp more than five minutes off. Without this row, anyone who knows the URL could post a fake event and run your actions.

`{ "key": "type", "operator": "=", "value": "checkout.session.completed" }`. `type` is a top-level key of Stripe's event. Any other event type fails here with `CONDITION_FAILED` and `detail: { field: "data", keys: ["type"] }`, answered 200 because of `return200`, and logged, because it carried a valid signature and so came from Stripe.

`{ "key": "data[object][metadata][user_id]", "placeholder": "BUYER" }`. A capture-only row: no operator, no value. The path starts at the event body: `data`, then `object` (the checkout session), then its `metadata`, then `user_id`, which you set when creating the session on the Stripe side (`metadata: { user_id: <the Skapi user id> }`). The value is remembered as `BUYER`. A session without it does not fail here; the first action that reads `placeholder[BUYER]` raises `PLACEHOLDER_MISSING` instead.

`{ "key": "data[object][customer_details][address][country]", "placeholder": "COUNTRY" }`. The same, for the buyer's country.

### The actions

**`actions[0]`: post the order record.**

`"table": { "name": "orders", "access_group": "admin" }`. The record goes into `orders`, readable by admins only.

`"unique_id": "order-${data[object][id]}"`. Interpolation inside text: the session id `cs_test_a1B2c3` becomes the unique id `order-cs_test_a1B2c3`. When Stripe retries the event, the same unique id makes this an update of the same record instead of a second record.

`"index": { "name": "buyer", "value": "placeholder[BUYER]" }`. A whole-value path, so the index value is the captured user id, and `getRecords({ table: { name: 'orders', access_group: 'admin' }, index: { name: 'buyer', value: userId } })` finds one buyer's orders.

`"data"`. Four keys. `session` and `amount` are whole-value paths and keep their types, so `amount` is the number Stripe sent (`4200`, in the smallest unit of the currency). `country` reads the placeholder. `note` interpolates a list element and becomes `paid via card`.

`"err"`. When the post fails, this chain runs. It is one `req` action that POSTs `{ "text": "order record failed: <the message>" }` to an alert hook, `${error[message]}` being the failed action's message. After it the consumption stops and answers the `pstr` failure; the alert cannot make it succeed.

**`actions[1]`: lift the buyer's access group.**

`{ "act": "acsg", "exe": { "group": 2, "user_id": "placeholder[BUYER]" } }` sets the buyer to access group `2`, so records posted with `access_group: 2` become readable to them. Its result is `{ user_id, group }`.

**`actions[2]`: call your fulfilment API.**

`"data": { "user_id": "result[user_id]", "session": "data[object][id]" }`. `result[user_id]` reads the previous action's result, the buyer's id. `data[object][id]` still reads the Stripe event, because at this level the data root is the original request.

`"condition"` is evaluated against the **response**. `status` must be `ok`, else the `req` fails with `CONDITION_FAILED` and `field: "data"`, answered with `stage: "action"` and `action: { act: "req", path: "actions[2]" }` because the failure happened inside the action. `shipment[id]` is captured as `SHIPMENT` from the response.

`"actions"` is the nested chain, and its data root is the response body. `placeholder[SHIPMENT]` reads what was just captured, and `${carrier}` reads the response's top-level `carrier`. A `shipments` record is posted with both.

### What you see afterwards

Consuming the ticket writes a log row whose `outcome.actions` lists the three actions with their results, and whose `outcome.placeholders` holds `BUYER`, `COUNTRY` and `SHIPMENT`. The `orders` table has one record per session, indexed by buyer. The buyer is in access group `2`.

## A Coupon Link

A link you hand out at launch. The first hundred visits with the right code each write a `coupons` record.

```json
{ "ticket_id": "launch-coupon", "description": "Launch coupon", "count": 100, "limit_per_user": 1,
  "condition": { "method": "GET", "params": [ { "key": "code", "operator": "=", "value": "LAUNCH24" } ] },
  "actions": [ { "act": "pstr", "exe": { "table": "coupons", "data": { "code": "${code}", "ip": "consumer[ip]" } } } ] }
```

`"count": 100`. The first hundred successful consumptions take one each; the next answers `TICKET_EXHAUSTED`. Failed calls do not count.

`"limit_per_user": 1`. Once per signed-in user. This ticket is GET, and signed-in consumption is POST only, so on this link the limit never applies and the count alone caps it. To make it once per user, drop `"method": "GET"`, move the row from `params` to `data`, and have the page call `consumeTicket({ ticket_id: 'launch-coupon', method: 'POST', auth: true, data: { code } })`.

`"method": "GET"` and `"params"`. The data is the query string, and `params` rows read it. `code` is a top-level key of that query, so the link is:

```
https://eu73.skapi.dev/tg/eu73kXm2PqA9vLb4/launch-coupon?code=LAUNCH24
```

or, from a page:

```js
let coupon = await skapi.consumeTicket({
    ticket_id: 'launch-coupon',
    method: 'GET',
    data: { code: 'LAUNCH24' }
});
```

A wrong code answers `400` with `CONDITION_FAILED` and `detail: { field: "params", keys: ["code"] }`, and is logged. A link without `code` answers `PATH_NOT_FOUND` with `detail: { path: "code" }`.

`"data": { "code": "${code}", "ip": "consumer[ip]" }`. `${code}` reads the top-level `code` of the query, the string `LAUNCH24`. A bare `code` would have stored the text `code`, since bare words are literal and `code` has no bracket. `consumer[ip]` is a reserved root, the caller's address.

The record is posted as the project owner into the public `coupons` table.

## A Signed-In Unlock

A private record, the members guide, that a signed-in user with a verified e-mail can unlock once by calling one endpoint.

```json
{
  "ticket_id": "unlock-guide",
  "description": "Unlock the members guide",
  "limit_per_user": 1,
  "condition": {
    "method": "POST",
    "user": [ { "key": "email_verified", "operator": "=", "value": true } ]
  },
  "actions": [
    { "act": "acsr", "exe": { "record_id": "9x2K4mQ1pL8vB3nR6tW5yZ0cA7dF" } }
  ]
}
```

`"limit_per_user": 1`. Once per user. A second call from the same user answers `USER_LIMIT_REACHED` with `detail: { limit: 1, used: 1 }`. Signed-in consumption is the only kind that is counted per user, and this ticket only makes sense signed in.

`"method": "POST"`. Signed-in consumption is POST only, so this is the only method that could work.

`"user"`. The consumer's `email_verified` must be `true`. On an anonymous POST this row raises `AUTH_REQUIRED` before the action runs (an anonymous GET already fails on `method`), so nobody can reach the action without an account.

`{ "act": "acsr", "exe": { "record_id": "9x2K4mQ1pL8vB3nR6tW5yZ0cA7dF" } }`. `record_id` is the guide's record id (not its unique id). With no `user_id`, the grantee is the consumer. The grant is made on behalf of the record's uploader, so the guide must have been uploaded by a user of your project, an admin account for instance, or by you as the owner.

The page calls it like this:

```js
await skapi.consumeTicket({
    ticket_id: 'unlock-guide',
    method: 'POST',
    auth: true
});

// the guide is now readable to this user
let guide = await skapi.getRecords({ record_id: '9x2K4mQ1pL8vB3nR6tW5yZ0cA7dF' });
```

The user can see the consumption afterwards with `getConsumedTickets({ ticket_id: 'unlock-guide' })`, and you can see it in the ticket's Log tab with the user id as the consumer.

:::tip
To hand the unlock out with a purchase instead of to everyone, add a `data` row on a code the page sends, or put a `record_access` row on a receipt record the user already holds. Both are evaluated before the action runs.
:::
