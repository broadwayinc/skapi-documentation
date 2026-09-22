# Examples

Four tickets, each explained line by line. Paste any of them into the **Edit as JSON** view of the dashboard's Tickets page, click **Apply**, and register.

## A Payment Webhook

Your payment provider reports a completed payment. The ticket records the order, lifts the buyer's access group, and asks your fulfilment API to ship. The whole ticket:

```json
{
  "ticket_id": "order-paid",
  "description": "Payment completed",
  "condition": {
    "return200": true,
    "method": "POST",
    "signature": {
      "secretName": "payment_webhook",
      "header": "x-signature",
      "separator": ",",
      "parts": ["t=${timestamp}", "v1=${signature}"],
      "signed": "${timestamp}.${body}",
      "timestamp": "${timestamp}"
    },
    "data": [
      { "key": "type", "operator": "=", "value": "payment.completed" },
      { "key": "payment[metadata][user_id]", "placeholder": "BUYER" }
    ]
  },
  "actions": [
    { "act": "pstr",
      "exe": { "table": { "name": "orders", "access_group": "admin" },
               "unique_id": "order-${data[payment][id]}",
               "index": { "name": "buyer", "value": "${placeholder[BUYER]}" },
               "data": { "payment": "${data[payment][id]}", "amount": "${data[payment][amount_total]}",
                         "country": "${data[payment][customer][country]}", "note": "paid via ${data[payment][payment_methods][0]}" } },
      "err": [ { "act": "req", "exe": { "url": "https://hooks.example.com/alert", "method": "POST",
                 "headers": { "content-type": "application/json" },
                 "data": { "text": "order record failed: ${error[message]}" } } } ] },
    { "act": "acsg", "exe": { "group": 2, "user_id": "${placeholder[BUYER]}" } },
    { "act": "req",
      "exe": { "url": "https://api.example.com/fulfil", "method": "POST",
               "headers": { "content-type": "application/json" },
               "data": { "user_id": "${result[user_id]}", "payment": "${data[payment][id]}" },
               "condition": { "data": [ { "key": "status", "operator": "=", "value": "ok" } ] },
               "actions": [ { "act": "pstr", "exe": { "table": "shipments",
                              "data": { "id": "${response[shipment][id]}", "carrier": "${response[carrier]}",
                                        "payment": "${data[payment][id]}" } } } ] } }
  ]
}
```

The event this ticket expects looks like this, with the signature in the `x-signature` header:

```json
{ "type": "payment.completed",
  "payment": { "id": "pay_a1B2c3", "amount_total": 4200, "payment_methods": ["card"],
               "metadata": { "user_id": "<the Skapi user id>" }, "customer": { "country": "KR" } } }
```

Every value the actions fill in is a reference inside `${ }`, and everything outside `${ }` is sent as written. `${data[...]}` reads this event, `${placeholder[BUYER]}` the value a condition row captured, `${result[...]}` the previous action's result, `${response[...]}` the fulfilment API's answer, and `${error[...]}` the failure an `err` chain handles. See [References](/tickets/conditions.md#references).

### The ticket

`"ticket_id": "order-paid"` is the last segment of the endpoint. The webhook URL to paste into your payment provider's webhook settings is `https://<reg>.skapi.dev/tp/<service_id>/order-paid`, copied from the **Endpoints** section of the ticket.

`"description"` is what the list shows. There is no `count`, `limit_per_user` or `time_to_live`: the ticket is unlimited and never expires. A per-user limit would not apply anyway, because the provider calls the anonymous endpoint.

### The condition

`"return200": true`. Webhook senders usually retry an endpoint that answers anything but 2xx. An event the condition turns away would fail the same way on every retry, so failures are answered with 200. The error body still says what failed, and the Log tab still records it.

`"method": "POST"`. A GET is answered `METHOD_NOT_ALLOWED`.

`"signature"`. The provider signs every event with a signing secret it gives you when you add the endpoint. This example assumes it sends `t=<timestamp>,v1=<hex>` in the `x-signature` header, where the hex is the HMAC-SHA256 of `<timestamp>.<raw body>`:

- `"separator": ","` splits the header into its `t=...` and `v1=...` items.
- `"parts"` captures the timestamp from the `t=` item and the signature from every `v1=` item.
- `"signed": "${timestamp}.${body}"` rebuilds the text the provider signed.
- `"timestamp": "${timestamp}"` refuses an event more than 300 seconds (the default `tolerance`) away from now, so a captured request cannot be replayed later.

These `${timestamp}`, `${signature}` and `${body}` are the signature's own tokens, not references. `algorithm` and `encoding` are left at their defaults, SHA-256 and hex. If your provider lays the header out differently or signs other bytes, change these fields to match its documentation; [Describing a sender](/tickets/conditions.md#describing-a-sender) shows other common shapes. Save the signing secret as a [Secret Key](/api-bridge/client-secret-request.md#registering-secret-keys) named `payment_webhook`; `"secretName": "payment_webhook"` is that **name**. Skapi recomputes the HMAC over the raw body and compares in constant time. Without this condition, anyone who knows the URL could post a fake event and run your actions.

`{ "key": "type", "operator": "=", "value": "payment.completed" }`. `type` is a top-level key of the event. Any other event type fails here with `CONDITION_FAILED` and `detail: { field: "data", keys: ["type"] }`, answered 200 because of `return200`, and logged, because it carried a valid signature and so came from your provider.

`{ "key": "payment[metadata][user_id]", "placeholder": "BUYER" }`. A capture-only row: no operator, no value. The key is a path in the event body, written without `${ }`: `payment`, then its `metadata`, then `user_id`, which you set when you create the payment with the provider (`metadata: { user_id: <the Skapi user id> }`). The value is remembered as `BUYER`, a shorter name for a value two actions use. A payment without it does not fail here; the first action that reads `${placeholder[BUYER]}` raises `PLACEHOLDER_MISSING` instead.

### The actions

**`actions[0]`: post the order record.**

`"table": { "name": "orders", "access_group": "admin" }`. The record goes into `orders`, readable by admins only. The name has no `${ }`, so it is the text `orders`.

`"unique_id": "order-${data[payment][id]}"`. A reference inside text: the payment id `pay_a1B2c3` becomes the unique id `order-pay_a1B2c3`. When the provider retries the event, the same unique id makes this an update of the same record instead of a second record.

`"index": { "name": "buyer", "value": "${placeholder[BUYER]}" }`. A value that is one whole reference keeps its type, so the index value is the captured user id, and `getRecords({ table: { name: 'orders', access_group: 'admin' }, index: { name: 'buyer', value: userId } })` finds one buyer's orders.

`"data"`. Four keys, each read from the event. `payment` and `amount` are whole references and keep their types, so `amount` is the number the provider sent (`4200`, in the smallest unit of the currency). `country` reads a nested key. `note` puts a list element into text and becomes `paid via card`.

`"err"`. When the post fails, this chain runs. It is one `req` action that POSTs `{ "text": "order record failed: <the message>" }` to an alert hook, `${error[message]}` being the failed action's message. After it the consumption stops and answers the `pstr` failure; the alert cannot make it succeed.

**`actions[1]`: lift the buyer's access group.**

`{ "act": "acsg", "exe": { "group": 2, "user_id": "${placeholder[BUYER]}" } }` sets the buyer to access group `2`, so records posted with `access_group: 2` become readable to them. Its result is `{ user_id, group }`.

**`actions[2]`: call your fulfilment API.**

`"data": { "user_id": "${result[user_id]}", "payment": "${data[payment][id]}" }`. `${result[user_id]}` reads the previous action's result, the buyer's id. `${data[payment][id]}` reads the provider's event.

`"condition"` is checked against the **response**, and its row key `status` is a path in the response body. `status` must be `ok`, else the `req` fails with `CONDITION_FAILED` and `field: "data"`, answered with `stage: "action"` and `action: { act: "req", path: "actions[2]" }` because the failure happened inside the action.

`"actions"` is the nested chain. It reads the answer as `${response[...]}`: a `shipments` record is posted with the answer's `shipment.id` and `carrier`, and `${data[payment][id]}` still reads the provider's event, as it does at every depth.

### What you see afterwards

Consuming the ticket writes a log row whose `outcome.actions` lists the actions with their results, and whose `outcome.placeholders` holds `BUYER`. The `orders` table has one record per payment, indexed by buyer. The buyer is in access group `2`.

## A Coupon Link

A link you hand out at launch. The first hundred visits with the right code each write a `coupons` record.

```json
{ "ticket_id": "launch-coupon", "description": "Launch coupon", "count": 100, "limit_per_user": 1,
  "condition": { "method": "GET", "params": [ { "key": "code", "operator": "=", "value": "LAUNCH24" } ] },
  "actions": [ { "act": "pstr", "exe": { "table": "coupons", "data": { "code": "${params[code]}", "ip": "${ip}" } } } ] }
```

`"count": 100`. The first hundred successful consumptions take one each; the next answers `TICKET_EXHAUSTED`. Failed calls do not count.

`"limit_per_user": 1`. Once per signed-in user. This ticket is GET, and signed-in consumption is POST only, so on this link the limit never applies and the count alone caps it. To make it once per user, drop `"method": "GET"`, move the row from `params` to `data`, write `${data[code]}` in the action, and have the page call `consumeTicket({ ticket_id: 'launch-coupon', method: 'POST', auth: true, data: { code } })`.

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

A wrong code answers `400` with `CONDITION_FAILED` and `detail: { field: "params", keys: ["code"] }`, and is logged. A link without `code` fails the same way: a field that is not there does not match.

`"data": { "code": "${params[code]}", "ip": "${ip}" }`. `${params[code]}` reads `code` from the query string, the string `LAUNCH24`, and `${ip}` is the caller's address. Without the `${ }`, `params[code]` would be stored as that very text: only text inside `${ }` is a reference.

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

`"user"`. The consumer's `email_verified` must be `true`. `user` rows work only for signed requests, which is what this ticket is for: on an anonymous POST this row raises `AUTH_REQUIRED` before the action runs (an anonymous GET already fails on `method`), so nobody can reach the action without an account. For the same reason a `user` row never belongs on a webhook ticket, which it would fail every time. An action can read the same attributes, such as `${user[email]}`.

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
To hand the unlock out with a purchase instead of to everyone, add a `data` row on a code the page sends, or name a receipt record the user already holds in `record_access`. Both are evaluated before the action runs.
:::

## Calling an API With Your Secret Key

A service you use sends a webhook when an order changes, but the event is only a notice: it carries the order id and little else. This ticket fetches the order from that service's API with your API key, checks the answer, maps the order's plan to an access group, and sets the buyer's group. Because it reads the order's current state every time, a repeated or late event applies the same result.

```json
{
  "ticket_id": "order-changed",
  "description": "Order changed: fetch it and set the buyer's plan",
  "condition": {
    "return200": true,
    "method": "POST",
    "signature": {
      "secretName": "orders_webhook",
      "header": "x-signature",
      "separator": ",",
      "parts": ["t=${timestamp}", "v1=${signature}"],
      "signed": "${timestamp}.${body}",
      "timestamp": "${timestamp}"
    },
    "data": [
      { "key": "type", "operator": "=", "value": ["order.created", "order.updated"] }
    ]
  },
  "actions": [
    { "act": "req",
      "exe": {
        "url": "https://api.example.com/v1/orders/${data[order][id]}",
        "method": "GET",
        "secretName": "orders_api_key",
        "headers": { "Authorization": "Bearer ${CLIENT_SECRET}" },
        "condition": {
          "data": [
            { "key": "status", "operator": "=", "value": "paid" },
            { "key": "plan", "operator": "=", "value": "basic", "setValueWhenMatch": 2, "placeholder": "GROUP" },
            { "key": "plan", "operator": "=", "value": ["pro", "team"], "setValueWhenMatch": 3, "placeholder": "GROUP" },
            { "key": "plan", "operator": "!=", "value": null, "setValueWhenMatch": 1, "placeholder": "GROUP" }
          ]
        },
        "actions": [
          { "act": "acsg", "exe": { "group": "${placeholder[GROUP]}", "user_id": "${response[metadata][user_id]}" } }
        ]
      }
    }
  ]
}
```

The webhook event looks like this, signed like the one in [A Payment Webhook](#a-payment-webhook):

```json
{ "type": "order.updated", "order": { "id": "ord_8Kq2" } }
```

and the service's API answers `GET https://api.example.com/v1/orders/ord_8Kq2` with the order:

```json
{ "id": "ord_8Kq2", "status": "paid", "plan": "pro", "metadata": { "user_id": "<the Skapi user id>" } }
```

### Before you register

Save two [Secret Keys](/api-bridge/client-secret-request.md#registering-secret-keys): the service's webhook signing secret as `orders_webhook`, and your API key for the service as `orders_api_key`. Both must exist when you register, or registration names the one that is missing.

Give `orders_api_key` the **Destinations** `https://api.example.com/v1/orders`. The `req` that carries it may then only call that API, and a call anywhere else fails with `REQUEST_FAILED` and `detail: { "reason": "refused_address" }` before anything is sent. The signing secret needs none: it is only read to verify the signature and is never sent.

### The condition

`"return200": true`. Every failure is answered with 200, so the service does not retry an order that is not paid. The Log tab still shows each failure. If you would rather have a failed call to the API retried, leave `return200` off: then every failure, an unpaid order included, answers 400 and the service sends the event again later.

`"signature"` is read exactly as in [A Payment Webhook](#the-condition), with this ticket's own signing secret.

`{ "key": "type", "operator": "=", "value": ["order.created", "order.updated"] }`. A value list: the row passes for either event type.

### The request

`"url": "https://api.example.com/v1/orders/${data[order][id]}"`. `${data[order][id]}` reads the order id from the event. The scheme and host are written out, which a `req` with a `secretName` requires, so no event can send your key to another host. The order id is percent-encoded as it goes in, so an id such as `../customers` stays one path segment.

`"secretName": "orders_api_key"` and `"Authorization": "Bearer ${CLIENT_SECRET}"`. The key's value goes into this header of this call, and nowhere else. Wherever the answer repeats it, as sent or escaped up to three times over, the Log tab shows the text `${CLIENT_SECRET}` instead. See [Sending a Secret Key](/tickets/actions.md#sending-a-secret-key).

A failed call (an answer of 300 or above, a timeout, a refused address) fails the action with `REQUEST_FAILED`, and the rest of the `req` is skipped.

### Checking the answer

The `condition` rows read the order the API returned, under the [same rules](/tickets/actions.md#checking-the-response) as the ticket's own rows. Their keys are paths in the answer:

- `status` must be `paid`. Any other status fails the check with `CONDITION_FAILED`, `detail: { field: "data", keys: ["status"] }` and `action: { act: "req", path: "actions[0]" }`, and nothing else runs.
- The three `plan` rows are a [lookup table](/tickets/conditions.md#lookup-tables). The first row that matches wins, so `basic` captures `GROUP` = `2`, `pro` and `team` capture `3`, and the last row, the catch-all, captures `1` for any other plan, so an unknown plan does not fail the ticket.

### The nested action

`{ "act": "acsg", "exe": { "group": "${placeholder[GROUP]}", "user_id": "${response[metadata][user_id]}" } }` sets the group the lookup table chose for the Skapi user id you stored on the order when it was created, read from the answer with `${response[...]}`. For the order above, it moves the buyer to access group `3`.

### What you see afterwards

The log row's `outcome.placeholders` holds `GROUP`, and `outcome.actions` lists the `req` at `actions[0]`, with the order as its result, and the access group change at `actions[0].actions[0]`. The buyer is in the access group of their current plan, however many times the service sends the event.
