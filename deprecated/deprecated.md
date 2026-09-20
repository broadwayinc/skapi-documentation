# Deprecated

This page collects everything the rest of the documentation no longer describes: renamed methods, retired options, older request forms, and the ways older versions of `skapi-js` behave differently.

New code never needs any of it. It is here for when you maintain code written against an older name or version, or support users who have not upgraded yet.
When each change shipped is listed in the [Version History](/versionlog/versions.md).

## clientSecretRequest() is now forwardRequest()

[`forwardRequest(form, options)`](/api-reference/api-bridge/README.md#forwardrequest) and its companions replace the `clientSecretRequest()` family.
`forwardRequest()` is the same method as `clientSecretRequest()`, renamed. Everything that method does, the new one does, through the same code: the queue, the polling handle, `stream`, `realtime`, `expires`, and the direct non-queued path. Two things are new, and both are optional: the **first argument is a form**, and the **secret key is optional**.

**Every old name still works and is not going away.** Each is marked deprecated in the SDK with the name that replaces it.

| deprecated | use |
|---|---|
| `clientSecretRequest(params)` | [`forwardRequest(form, options)`](/api-reference/api-bridge/README.md#forwardrequest) |
| `clientSecretRequestStream()` | [`forwardRequestStream()`](/api-reference/api-bridge/README.md#forwardrequeststream) |
| `clientSecretRequestFinalize()` | [`forwardRequestFinalize()`](/api-reference/api-bridge/README.md#forwardrequestfinalize) |
| `clientSecretRequestHistory()` | [`forwardRequestHistory()`](/api-reference/api-bridge/README.md#forwardrequesthistory) |
| `cancelClientSecretRequest()` | [`cancelForwardRequest()`](/api-reference/api-bridge/README.md#cancelforwardrequest) |
| `stopClientSecretPolling()` | [`stopForwardRequestPolling()`](/api-reference/api-bridge/README.md#stopforwardrequestpolling) |
| `clientSecretRequestQueueCount()` | [`forwardRequestQueueCount()`](/api-reference/api-bridge/README.md#forwardrequestqueuecount) |
| `isPollStopped()` | [`isPollStopped()`](/api-reference/api-bridge/README.md#ispollstopped), unchanged and shared |

Everything but `forwardRequest()` itself is an **alias**: the same function under a second name, with the same arguments and the same return. A request started under either name is read, polled, cancelled, finalized and counted by both, so you can move one call at a time.

- [`forwardRequestHistory()`](/api-reference/api-bridge/README.md#forwardrequesthistory) lists requests sent under **either** name: the history is the request's own, not the method's, so a request dispatched by `clientSecretRequest()` is listed there, and one dispatched by `forwardRequest()` is listed by `clientSecretRequestHistory()`.
- `stopClientSecretPolling()` and `stopForwardRequestPolling()` share one registry of live polls, so either name stops a poll started under the other. A poll stopped by either reads the same way to [`isPollStopped()`](/api-reference/api-bridge/README.md#ispollstopped).

### Moving a clientSecretRequest() call

`forwardRequest()` is the exception to the aliases, because its first argument is the form. Moving a `clientSecretRequest(params)` call to it means splitting the old single argument: the request body becomes the first argument, and everything else stays in the options.

```js
// Before
skapi.clientSecretRequest({
    clientSecretName: 'my_secret',
    url: 'https://api.example.com/v1/report',
    method: 'POST',
    headers: { Authorization: 'Bearer $CLIENT_SECRET' },
    data: { report: 'quarterly' }
});

// After
skapi.forwardRequest({ report: 'quarterly' }, {
    secretName: 'my_secret',
    url: 'https://api.example.com/v1/report',
    method: 'POST',
    headers: { Authorization: 'Bearer $CLIENT_SECRET' }
});
```

### clientSecretName is now secretName

`secretName` names one of your project's [Secret Keys](/api-bridge/client-secret-request.md#registering-secret-keys). It is **optional**, which is the one behavioural difference from the old `clientSecretName`: every `clientSecretRequest()` call has to name a key, while a `forwardRequest()` call that names none is forwarded with only what you supplied.

The request field is `secretName`, and the server accepts `clientSecretName` as an alias, preferring `secretName` when both are present. That is what keeps an older build of the SDK working against a current server.

### Types under the old names

The TypeScript signatures the SDK declares for the deprecated names still write `method` as the original four, `'GET' | 'POST' | 'DELETE' | 'PUT'`, and `clientSecretRequestStream()` writes its `onStream` as `(chunk: string, seq: number) => void`. At runtime every one of these is the new function, so `PATCH` and `HEAD` work through the old names as well, and `onStream` receives `via` too. A TypeScript caller that wants `PATCH` or `HEAD` calls the method under its new name.

The second argument of `forwardRequestStream()` is documented as [`ForwardRequestStreamOptions`](/api-reference/data-types/README.md#forwardrequeststreamoptions). It was called `ClientSecretStreamOptions` in these docs before the method was renamed. Neither name is importable from `skapi-js`: the type is written inline in the method's signature.

### Deprecated method reference

#### clientSecretRequest

**Deprecated. Use [forwardRequest](/api-reference/api-bridge/README.md#forwardrequest), which takes the form as its first argument and makes the secret key optional.**

```ts
clientSecretRequest(
    params: {
        clientSecretName: string; // REQUIRED here, unlike secretName on forwardRequest(). The name of the secret key registered in your Skapi project.
        url: string; // The third-party API endpoint URL.
        method: 'GET' | 'POST' | 'DELETE' | 'PUT'; // The HTTP method.
        headers?: { [key: string]: string }; // Request headers as a key-value object.
        data?: { [key: string]: any }; // Request body as a key-value object (used when method is POST or PUT).
        params?: { [key: string]: string }; // Query parameters as a key-value object (used when method is GET or DELETE).
        poll?: number; // Optional polling interval in milliseconds. Must be a non-negative number.
        queue?: string; // Optional queue name. Requests sharing the same queue are processed sequentially on the server side.
        expires?: number; // Optional expiration time in seconds for the request record.
        stream?: boolean; // Read the destination's response INCREMENTALLY. Requires a queue, and mints one when you did not name one. Defaults to false.
        realtime?: boolean; // ALSO push each relayed piece over skapi's websocket. Only meaningful alongside stream and onStream. Defaults to false.
        onStream?: (chunk: string, seq: number, via?: 'socket' | 'poll') => void; // Called with each relayed piece, in order. Raw text, never parsed.
        onResponse?: (res: any, meta?: { executed?: number }) => void; // Called with the final API response once polling resolves, or immediately for non-queued direct responses. See forwardRequest for what `meta` carries.
        onError?: (err: any) => void; // Called when polling or the initial request fails.
    }
): Promise<any | {
    id: string;
    status: 'pending';
    queue_name: string;
    in_queue: number;
    realtime_group?: string;
    poll?: (arg?: { latency?: number; onStream?: (chunk: string, seq: number, via?: 'socket' | 'poll') => void }) => Promise<any>;
}>
```

Both names dispatch the same request through the same code. The differences are all at the door:
`clientSecretName` is **required** here, there is no form argument, and `multipart`, `skapiHeaders`,
`responseType` and `signal` are options of `forwardRequest()` only. Everything else, including the
queue, the poll handle, `stream`, `realtime` and `expires`, is identical.

#### clientSecretRequestStream

**Deprecated. Use [forwardRequestStream](/api-reference/api-bridge/README.md#forwardrequeststream), which is this same function.**

Identical in every way. Its TypeScript signature writes `method` as `'GET' | 'POST' | 'DELETE' | 'PUT'`
and its `onStream` as `(chunk: string, seq: number) => void`; the running function is the new one, `via` included.

#### clientSecretRequestFinalize

**Deprecated. Use [forwardRequestFinalize](/api-reference/api-bridge/README.md#forwardrequestfinalize), which is this same function.**

Identical in every way. Its TypeScript signature writes `method` as `'GET' | 'POST' | 'DELETE' | 'PUT'`.

#### clientSecretRequestHistory

**Deprecated. Use [forwardRequestHistory](/api-reference/api-bridge/README.md#forwardrequesthistory), which is this same function.**

Identical in every way, and a request sent under either name is listed by both. Its TypeScript
signature writes `method` as `'GET' | 'POST' | 'DELETE' | 'PUT'`.

#### cancelClientSecretRequest

**Deprecated. Use [cancelForwardRequest](/api-reference/api-bridge/README.md#cancelforwardrequest), which is this same function.**

Identical in every way. Its TypeScript signature writes `method` as `'GET' | 'POST' | 'DELETE' | 'PUT'`.

#### stopClientSecretPolling

**Deprecated. Use [stopForwardRequestPolling](/api-reference/api-bridge/README.md#stopforwardrequestpolling), which is this same function.**

Identical in every way, and the two share one registry of live polls, so either name stops a poll
started under the other. Its TypeScript signature writes `method` as `'GET' | 'POST' | 'DELETE' | 'PUT'`.

#### clientSecretRequestQueueCount

**Deprecated. Use [forwardRequestQueueCount](/api-reference/api-bridge/README.md#forwardrequestqueuecount), which is this same function.**

Identical in every way.

## The retired forwardRequest()

An earlier `forwardRequest(form, options)` relayed a request to **your own backend** over a different path. It held a live HTTP connection open to that backend and pushed its chunks straight through, injected your project's API key into a header of your choosing with `apiKeyHeader` and `apiKeyScheme`, refused a caller who was not signed in, always sent `x-skapi-user` and `x-skapi-service`, and resolved with a live `Response` under `responseType: 'response'`.

The SDK no longer calls that path, and the name now means the queued forwarder described in [Forwarding Requests](/api-bridge/forward-request.md). Your own backend is simply another destination for it. What changes when you move from the old method:

- **The API key is not injected any more.** No `x-api-key` is sent on your behalf. Store the key on the [Secret Keys](/api-bridge/client-secret-request.md#registering-secret-keys) page, name it with `secretName`, and put `$CLIENT_SECRET` where the key went.
- **`skapiHeaders` is off by default.** The old forwarder always sent `x-skapi-user` and `x-skapi-service`; now you ask for them. `x-skapi-user` is now the caller's **user id** on its own rather than a JSON profile.
- **Signing in is not required.** A signed-out visitor can call the new method, and the key's own **Locked** setting decides whether they may use it.
- **Streaming goes through the chunk store.** The response is relayed into a chunk store, read by polling, survives a reload through [`forwardRequestStream()`](/api-bridge/streaming-request.md#reading-a-request-you-did-not-start), and stays stored until you finalize it. An `AbortSignal` in `signal` still stops **this client** receiving the rest and still leaves the request running, exactly as it did before.

### apiKeyHeader and apiKeyScheme

`apiKeyHeader` and `apiKeyScheme` are **refused** with `INVALID_PARAMETER` rather than ignored: a silently dropped key is a request that reaches the destination unauthenticated and fails there, which is a much longer way to find out. A destination that wants a key now names a stored secret with `secretName` and puts `$CLIENT_SECRET` where the key goes:

```js
skapi.forwardRequest({ report: 'quarterly' }, {
    secretName: 'my_backend_key',
    url: 'https://api.yourbackend.com/report',
    method: 'POST',
    headers: { 'x-api-key': '$CLIENT_SECRET' },
    skapiHeaders: true
});
```

`skapiHeaders: true` is how your backend still learns who is calling.

### responseType: 'response'

The SDK's TypeScript still declares `'response'` among the values of `responseType`, for the retired method's callers, but it is **refused** at runtime with `INVALID_PARAMETER`. The destination is called server side and its body is relayed, so there is no live `Response` object to hand back. The destination's own status code is the `status_code` of the row [`forwardRequestHistory()`](/api-bridge/request-history.md) lists.

## Tickets

### signature.secret is now secretName

A ticket's `condition.signature.secretName`, the name of the Secret Key that signs the sender's requests, was called `secret` before 2026-09-18. That name is still accepted when you register a ticket and is converted to `secretName`, which is what gets stored. It is still read on tickets stored earlier, so no registered ticket breaks.

### Tickets with a placeholder map

Tickets registered before the current ticket format stored a `placeholder` map (`{ "NAME": "path" }`) and a single `action` object. They keep working and are converted when read: each map entry becomes a capture-only row (in `data`, or in `params` when the method is GET), the action object becomes an `actions` list in the order request, update service, access group, record access, and every `$NAME` inside the condition and the converted actions becomes `${placeholder[NAME]}`. Opening such a ticket in the dashboard shows the converted form, and saving it stores that form. Until you save it, the old `$NAME` replacement still runs on every consumption as it always did.

### The long-form consume endpoints

Every ticket also still answers on the older long-form routes, which carry the owner ID beside the project's service ID. They behave exactly like the [current endpoints](/tickets/introduction.md#endpoints):

| route | auth | same as |
|---|---|---|
| `POST/GET /publ/consume/<service_id>/<owner_id>/<ticket_id>` | none | `POST /tp/...` and `GET /tg/...` |
| `POST /auth/consume/<service_id>/<owner_id>/<ticket_id>` | Cognito | `POST /tpa/...` |

## The service ID and owner ID pair

A project used to be identified by two values, a service ID and an owner ID. The `Skapi` constructor still accepts that pair in place of the single [project ID](/introduction/getting-started.md), and converts it to the same project ID.

The [full example](/full-example/intro.md) tutorial's `service.js` still passes the pair. It connects to the same project as the project ID shown on that page.

## E-mail templates

### https://link.skapi

`https://link.skapi` is the original form of the [link placeholder](/email/email-templates.md#the-link-placeholder), and it still works everywhere. Templates that use it do not need to be changed. The screenshots on the [Automated Emails](/email/email-templates.md) page still show it.

`https://link.skapi.com` replaced it because it reads as a real web address, so mail editors that refuse a link to `https://link.skapi` accept it.

### Templates saved before template checks

Templates sent before Skapi started [checking templates](/email/email-templates.md#when-a-template-is-rejected) are not checked again. Invitation templates are now checked for `${email}` and `${password}` as well as the link, so an invitation template without them that was accepted before is rejected if you send it again.

## Older versions of skapi-js

### signup() and the EXISTS code

A signup is refused when its login ID is already a login ID another account of the project was granted. `signup()` reports that refusal with code `EXISTS` from skapi-js 2.0.6. Earlier versions report it differently:

- **1.2.14-beta.1 through 2.0.5** (stable releases 1.5.0 through 2.0.5): code `INVALID_REQUEST`, with
  the same message as 2.0.6.
- **1.2.9 through 1.2.14-beta.0** (stable releases 1.2.9 through 1.2.12): code `INVALID_REQUEST`, with
  Cognito's whole error text as the message, for example
  `PreSignUp failed with error #EXISTS: E-mail "user@email.com" is already a login ID in this service.`
- **1.0.97-beta.4 through 1.2.8**: Cognito's own error, passed on unchanged rather than as a skapi error,
  with code `UserLambdaValidationException` and the same whole text as its message.

If your app handles `EXISTS` and has to support those versions, also accept code `INVALID_REQUEST` or
`UserLambdaValidationException` with a message ending in `is already a login ID in this service.` or
`is already used by another account in this service.`, which matches every form.
`createAccount()` and `inviteUser()` report `EXISTS` in every version.

See [When a login ID is already taken](/authentication/create-account.md#when-a-login-id-is-already-taken) for the current behaviour.

### A user's own e-mail change

When a user changes their **own** email with
[`updateProfile()`](/api-reference/user/README.md#updateprofile), skapi-js 2.0.5 and earlier add a login
handle for the new address to the same request. The server removes such a handle again on the account's
next token, because the address is not verified, so the address ends up logging the account in only once
it is verified either way. Two things still differ while an old version is in use:

- The change is refused outright when another account of your project already holds that address as a
  login ID, verified or not. From 2.0.6 the email is changed and only the login is withheld.
- The unverified new address logs the account in for the few seconds before the handle is removed.

An email an admin changes with
[`updateUserAttributes()`](/api-reference/admin/README.md#updateuserattributes), or with
`updateProfile()` and another user's `user_id`, is not affected: the server ignores any login handle the
request sends, in every SDK version.

Those handles are also where most e-mail logins held **without** a verified address come from. Such a login grants nothing: it is removed, and the address goes to the account that proves it. See [Login IDs](/admin/permissions.md#login-ids).

Upgrade to skapi-js 2.0.6 or later, or pin a CDN URL to it, to get the behaviour described in [Create Account](/authentication/create-account.md#e-mail-and-username).

### Large record data

Record `data` larger than 32 KB is stored as a file, and the SDK puts it back together for you. A build of `skapi-js` from before this feature does not know how to fetch the value back. The server fills the payload into the response for such a build instead, but that fallback is bounded by the size of a single response, so a read of several large records can still hand an older build a `{ "__data__": ... }` marker where its data should be.

Pin a version by all means, and upgrade it before you start storing large payloads. See [Large record data](/introduction/plans.md#large-record-data).

### Encrypted records

An older SDK reading an [encrypted record](/database/encryption.md) sees the raw envelope. It loses nothing, but it cannot read it. Upgrade every client before you start encrypting records.

### Require Login and the metadata listings

[`getTables()`](/api-reference/database/README.md#gettables), [`getTags()`](/api-reference/database/README.md#gettags), [`getIndexes()`](/api-reference/database/README.md#getindex) and [`getUniqueId()`](/api-reference/database/README.md#getuniqueid) used to be served to anyone who knew the project ID. With [Require Login](/service-settings/service-settings.md#require-login) on, which is also the setting of a project that has never set it, the backend now refuses them to a request with no signed-in user. That includes an older SDK, which has no `REQUIRE_LOGIN` gate of its own and sends the request anyway.

An integration that lists them without a signed-in user now gets an error where it used to get a list. If a signed-out page genuinely needs the listing, turn Require Login off in the project settings.
