# Version History

### Current version: 2.0.0

**2.0.0**

- Added `forwardRequest()`. It relays a request to a destination of your choosing **from the server** and streams the destination's response back as it arrives. The body is relayed verbatim, so an HTML form reaches the destination as the same `multipart/form-data` the browser would have sent, files included, and the project's API key is attached server side where the browser cannot read it. Unlike `secureRequest()`, nothing is flattened into JSON and nothing waits for the whole response before the first byte reaches you. See [Forward Request](/api-bridge/forward-request.html).
- `forwardRequest()` streams when you pass `onStream`. The callback fires per chunk of text as it arrives and the promise still resolves with the complete body, so a caller can render progressively without giving up the final value. See [Streaming a Response](/api-bridge/forward-request.html#example-streaming-a-response).
- `forwardRequest()` passes the destination's status code and response headers back to the caller, apart from hop-by-hop headers, `set-cookie`, and `access-control-*`. Those last are written from the project's CORS setting, and a second copy of them would make the browser refuse the response outright. `options.headers` travel **outbound only** and have no bearing on what the browser is allowed to read. See [What the Client Receives](/api-bridge/forward-request.html#what-the-client-receives).
- `forwardRequest()` accepts `apiKeyHeader` and `apiKeyScheme` for backends that expect the key somewhere other than `x-api-key`, for example `Authorization: Bearer <key>`. A project with no API key set still sends the header, with the value `"none"`, so a backend can treat a missing header as "this did not come from skapi". See [What Your Backend Receives](/api-bridge/forward-request.html#what-your-backend-receives).
- `forwardRequest()` accepts `responseType`. It defaults to `'json'` when the destination says JSON and `'text'` otherwise; `'response'` hands back the whole response so a caller can read the status code and headers. An error status throws a `SkapiError` in every mode, so reading the code off a failed request needs `'response'`. See [Errors](/api-bridge/forward-request.html#errors).
- `forwardRequest()` accepts `signal`. Aborting stops **the client receiving** the response; the request already sent to the destination is not cancelled and runs to completion. Anything the destination does with it has already happened. See [Aborting](/api-bridge/forward-request.html#aborting).
- `forwardRequest()` is form-decorated like the other form-taking methods, so `onsubmit="skapi.forwardRequest(event, {...})"` works without the caller calling `preventDefault()`. One caveat for a **streaming** call: a form carrying an `action` attribute makes the decorator serialize the resolved value and navigate there, which throws the stream away. Streaming forms should have no `action`.
- `forwardRequest()` throws `forwardRequest is not available on this service region yet.` when the project's region has not published the endpoint it needs, instead of failing later as an opaque network error. The SDK now boots from the `v2` per-region endpoint file, which carries the forwarder's address; `v1` has no slot for it.
- **A service is now called a project.** The documentation uses "project" throughout: project ID, project settings, project dashboard, project owner. The SDK keeps the older names in its API surface for backward compatibility, so `getConnectionInfo()` still returns `service_name` and `service_description`, and the `service` parameter and `refetchServiceInfo` option are unchanged.
- The service ID is now called the **project ID**, and the single-token form (`"xxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxx"`) is the primary way to initialize: `new Skapi("<Project ID>")`. The legacy service ID + owner ID pair is still accepted and is converted internally.
- New `skapi.project_id` class property: the public project ID token, composed from the connected project and its owner. Empty string when the project has no user owner.
- `getConnectionInfo()` now returns `project_id` alongside the existing fields.
- `clientSecretRequestHistory()` accepts `compact`. Request and response bodies can be far larger than the listing that shows them (file contents, long AI conversations), and a page of them was downloaded in full just to render a list. A compact listing returns label stubs instead, and the bodies never leave the server. See [Compact Listings](/api-bridge/request-history.html#compact-listings).
- `RequestHistory` items from a compact listing carry `request_text`, `response_text`, `response_complete_marker` and `compact`, and omit `request_body` / `response_body`. `compact` is what tells a caller the bodies were deliberately left out rather than empty; re-fetch without `compact`, or `poll()` a live item, to get a full body. See [RequestHistory](/api-reference/data-types/README.md#requesthistory).
- `clientSecretRequestHistory()` accepts `queue_exact`. A `queue` filter matches as a **prefix**, so a listing for queue `"jobs"` also returned `"jobs-retry"` and every other queue starting with those characters. `queue_exact: true` restricts it to exactly the named queue. The inverse, `queue_exclude`, drops one queue's rows from a listing. Both are applied after the range read, so a page can come back short while more matches remain: keep paging by `startKey` / `endOfList`, never by a page's length. See [Exact Queue Matching](/api-bridge/request-history.html#exact-queue-matching).
- Fixed: `clientSecretRequestHistory()` ignored `url` and `method` whenever a `queue` was given, so the listing returned every request queued under that name regardless of which endpoint it was sent to. Two different APIs sharing a queue name reported each other's requests. The listing is now scoped to the `url` and `method` as it is without a queue.
- Every example in the documentation now initializes with the placeholder `new Skapi("<Project ID>")`, angle brackets included, so it is obvious the value has to be replaced. The constructor's unreplaced-placeholder check accepts any of the forms the docs have used (`"<Project ID>"`, `project_id`, `service_id`), and still answers with `Replace "<value>" with your actual Project ID.` rather than a confusing owner ID error.
- Fixed: an uncaught `QuotaExceededError` while saving the session cache. The cache is written on tab switch and page unload, and a large paged request history could exceed the session storage quota, which surfaced as an uncaught error on every tab switch. The write now retries without the paging state, and drops a stale snapshot rather than restoring one that disagrees with the current session. The cache is an optimization, so losing it costs a refetch and never correctness.

**1.8.3**

- Private files in a record's `bin` are now cached by the browser for a week. A private file is served under a URL that changes on every read, so browsers could never reuse it and the same file was downloaded again on every read. The first `getFile()` now downloads it and the rest are served locally, with no network request; take the URL from `getFile("endpoint")` to get the cached one. The `url` property on the bin object is unchanged, since that is the string `remove_bin` and `deleteFiles` expect back. Files reached through a granted private access key are unchanged, since their URL cannot be minted in a cacheable form.
- `getFile()` accepts `browserCache` and `refresh`. A URL requested with `expires` is signed fresh on every call, and since browsers cache by URL, the same unchanged file was downloaded again on every page load. `browserCache` caches the request that mints the URL instead, so the same URL comes back and the copy already downloaded stays usable, while `expires` stays as short as you like. `refresh` bypasses that cached URL, for a file that has changed or a load that failed because the cached URL had expired. See [Caching Expiring Files](/database/handling-files.html#caching-expiring-files).
- Fixed: the client refused values the API accepts. Every key-segment length limit was checked against an SDK-only cap that was stricter than the platform's, so legal values were rejected before a request was ever sent: a tag was capped at **64** characters and a `table.name` / `index.name` at **128**, where the API allows **256** for each. All three now match the API. `index.value` was already correct at 256.
- `table.name`, `index.name` and each tag are limited to 256 characters, and `/`, `!`, `*`, `#` and `%` count as **3 characters each** toward that limit. A value that only overflows because of them is now refused with a message saying so, instead of failing as an opaque server error. `index.value` has no such rule: every character counts as one.
- Fixed: a `table.name`, `index.name` or tag containing a `%` came back changed. A tag written as `100%25off` was returned as `100%off`, and `a%2Fb` as `a/b`. Any string now reads back exactly as it was written.
- Fixed: a string `index.value` containing a `%` came back changed the same way, so `a%2Fb` was returned as `a/b`. Index values now read back exactly as written, and still compare exactly as written for `>`, `<`, `range`, and the `>=` 'starts with' and `<=` 'ends with' forms.
- Fixed: `getTables()`, `getTags()` and `getIndexes()` could not find a table or tag whose name contains `/`, `!`, `*` or `#`; the lookup returned nothing. They now match. An empty filter paired with a condition still means 'list everything'.
- Fixed: a file whose name contains a `%` went missing from `record.bin` entirely, and one named `50%20off.pdf` came back renamed to `50 off.pdf`, which no longer matched the stored file. Filenames now come back exactly as uploaded, agreeing with `getFile(url, { dataType: 'info' })`. For the same reason `remove_bin` now removes such a file instead of silently doing nothing.
- Fixed: `source.referencing_index_restrictions[].name` came back altered when it contained `/`, `!`, `*` or `#`, unlike `index.name` for the same string. Reading a record and re-saving it then broke referencing with 'Index value does not match the reference index restriction'.
- Fixed: a nest query (an `index.name` ending in a period, which matches the children of a compound index) could not find a child whose name contains `/`, `!`, `*`, `#` or `%`. A compound index such as `Band.Rock/Pop.year` returned nothing from the query meant to find it. `index.value`, `index.range`, and `order.value` on `getIndexes()` when `order.by` is `index_name`, all match now.

**1.8.2**

- Fixed: the local unique ID cache introduced in 1.7.1 was not scoped to a service, so one Skapi instance used across several services could resolve a unique ID to a record ID belonging to a **different** service. The symptom was a post whose `reference` was a unique ID being rejected with `NOT_EXISTS`, naming a record ID the caller never supplied. It only showed up when the same unique ID existed in more than one service, for example the same filename uploaded to two projects, and whichever service wrote to the cache last won. The cache is now keyed by service and owner, so a unique ID only ever resolves within the service the call targets.
- `bulkPostRecords()` result items now carry the reason a record was refused. The API reports a per-record rejection as an element inside the returned list rather than by throwing, and that element used to arrive as an empty record with the reason stripped, so a caller could not tell a rejection from a save. A refused element still has an empty `record_id`, which remains the test for whether a record saved, and now also carries `error` with the API's `code` and `message`. See [RecordData](/api-reference/data-types/README.md#recorddata).

**1.8.0**

- `getRecords()` and `deleteRecords()`: `condition: '<='` on a `string` index value is now an **'ends with'** search. It was a lexicographic 'lesser or equal' comparison before, so any query that relied on the old meaning has to be rewritten. `>=` is unchanged and still means 'starts with', `>` and `<` are still lexicographic, and `number` / `boolean` values compare as before. When the index `name` is a compound name ending in a period, `>=` and `<=` match the child name segment from its start and its end respectively. This behavior is served by the API, so it applies to every client version; the SDK type declarations were updated to describe it. See [Indexing](/database/indexing.html#ends-with-string-values).
- `clientSecretRequestHistory()` items now carry a `created` timestamp: the time the request was made, in milliseconds, stamped once and never rewritten. `updated` keeps its meaning as the time of the most recent status change, which for a settled request is when its response arrived. See [Fetching Request History](/api-bridge/request-history.html).

**1.7.7**

- Added `stopClientSecretPolling()` to stop polling for client-secret requests without cancelling them. The request continues on the server; only the client stops asking. Stop a single request by `id`, a whole queue by `queue`, or every live poll by passing no arguments. Returns the number of polls stopped.
- Added `isPollStopped()` to tell a stopped poll apart from a real API result.
- The promise returned by `poll()` now carries a `stop()` method that stops that one poll.
- A stopped poll resolves with `{ id, status: 'stopped' }` instead of rejecting, and its `onResponse` / `onError` callbacks are not called. Stopping a request that is still waiting in a queue also removes it from that queue, freeing the slot for the next request.
- Backend (ships with the API, not the SDK): `queue_name` is now the plain queue name on every response that carries it. Polling a single request previously returned the internal queue id (`"<service>:<queue>|<sequence>"`) in that field, while history listings returned the plain name.

**1.7.1**

- `postRecord()` and `bulkPostRecords()` now accept a unique ID in place of `record_id` when updating a record. A locally known unique ID is resolved to its record ID on the client; otherwise the value is passed through for the server to resolve.

**1.7.0**

- Added the `refetchServiceInfo` class initialization option. When `true`, cached service info is bypassed and fresh service info is fetched on load.
- Fixed a bug where large bulk uploads could fail while persisting the local unique-ID map. Writes to session storage are now debounced and guarded, so a full or unavailable session storage no longer interrupts an upload.

**1.6.3**

- Added routing for the file text-extraction endpoint, enabling server-side text extraction from uploaded files.

**1.6.2**

- `getRecords()` `table` parameter now accepts a plain string as shorthand for `{ name: <table> }`.
- `getRecords()` `reference` parameter now accepts an object form `{ record_id?, unique_id?, user_id? }` in addition to a string.
- `getUniqueId()` `condition` now supports `'ne'` / `'!='` for negated matching, and its parameters are now optional.
- `subscribeNewsletter()` `email` now accepts an array to subscribe multiple addresses at once.
- New searchable index values: `access_group` in `getUsers()`, `bounced` in newsletter queries, and `number_of_records` in `getTables()`.
- `getRealtimeUsers()` `group` is now optional and defaults to the realtime group the user is currently joined to.
- Corrected many type declarations to match runtime behavior, making previously required parameters optional across `getTables()`, `getTags()`, `getProfile()`, `getInvitations()`, `getRealtimeGroups()`, `inviteUser()`, `createAccount()`, and others.

**1.6.1**

- `getConnectionInfo()` now returns a `conf` object exposing service flags: `freeze_database`, `prevent_signup`, `prevent_inquiry`, and `prevent_anonymous`.

**1.6.0**

- Added `clientSecretRequest()` support for secure third-party API calls using saved client secrets.
- Added automatic polling with `poll` and manual polling via returned `poll()` when status is `running` or `pending`.
- Added optional `queue` support so requests with the same queue name are processed sequentially.
- Added `clientSecretRequestHistory()` to list and filter past request results by `url`, `method`, `status`, or `queue`.
- Added `cancelClientSecretRequest()` to cancel pending queued client-secret requests.
- Added `clientSecretRequestQueueCount()` to check how many requests are waiting in a named queue.

**1.5.8**

- `clientSecretRequest()` and `clientSecretRequestHistory()` now reject negative `poll` values with an `INVALID_PARAMETER` error.

**1.5.7**

- `signup()` and `openidLogin()` accept `template` options for welcome and signup-confirmation emails.
- Email and phone-number verification methods accept optional `template` parameters.

**1.5.6**

- `getConnectionInfo()` now supports a `refresh` parameter to force-refresh the cached connection info.

**1.5.5**

- Added `ai_agent`, `service_description`, and `prevent_anonymous` fields to the service connection type.

- Table names, index names/values, and tag strings are no longer restricted from using delimiter characters.

**1.5.4**

- Added `queue` parameter to `clientSecretRequest()` and `clientSecretRequestHistory()`. Requests sharing the same `url`, `method`, and `queue` are processed sequentially in the order they are received. See [Client Secret Keys](/api-bridge/client-secret-request.html).

**1.5.3**

- Fixed access-group condition handling in `getTables()`.

**1.5.2**

- Added `clientSecretRequestHistory()` to retrieve past client-secret request results, with optional polling for items still in `pending` status. See [Client Secret Keys](/api-bridge/request-history.html).
- Added `poll` parameter to `clientSecretRequest()` — polling interval in milliseconds for long-running third-party API calls.
- `getTables()` now returns dynamic record counts per access group.

**1.5.1**

- Improved internal logging.

**1.5.0**

- Works with any JavaScript build setup: Node.js, HTML, ESM, CJS, UMD, and TypeScript-based projects.
- New service ID format: "xxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxx" (backward compatible).
- Refactored and separated internal dependencies: [cocochex](https://github.com/broadwayinc/cocochex), [qpass](https://github.com/broadwayinc/qpass).
- Optimized and reduced build size.

**1.2.11**

- HOT FIX: Fixed bug for fetchMore parameter for all requests.

**1.2.10**

- Fixed error code on `signup()`.

**1.2.9**

- Removed dependency on Queuecumber.
- Fixed issues with uploading subscription records and feeds.
- Updated README.md.

**1.2.7**
- Fixed types, removed deprecated parameters.

**1.2.2**

- Corrected argument types in the class constructor.

**1.2.0**

- From 1.2.0 onward, the Skapi class can be initialized with just the service ID, without the owner ID. (Backward compatible)
- When initializing with a single service ID, use this format: `xxxxxxxxxxxx-xxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**1.1.10**

- Fixed a bug where `updateProfile()` could become unresponsive.

**1.1.8**

- Added several utility features. See [Utilities](/util/introduction.md)

**1.1.6**

- `openidLogin()` now supports the `merge` parameter, allowing users to merge their OpenID account into an existing account. See [Merging an OpenID Account with a Previous Account](/authentication/openid-login.html#merging-an-openid-account-with-a-previous-account)
- `inviteUser()` now supports custom invitation email templates via a provided HTML URL. See [Send Invitations with Custom Templates](/admin/invite.html#send-invitations-with-custom-templates)
- Refactored authentication flow for efficiency.

**1.1.5**

- Fixed a bug where multiple `getRecords()` requests sometimes resolve with empty record data.

**1.1.4**

- Fixed a bug in `listPrivateRecordAccess()` parameter handling.

**1.1.3**

- Corrected type declarations for the constructor options.
- Now users can list granted users of private records via `listPrivateRecordAccess()`. See [List Private Access Grants](/database/access-restrictions.html#listing-private-access-grants)

**1.1.2**

- No breaking changes in this release.
- Skapi now queues requests in batches for efficiency (Default: 30 requests per batch).
- Skapi now provides more advanced class initialization options, including event listeners for login state, user profile updates, and batch processing. See [Advanced Settings](/introduction/getting-started.html#advanced-settings).
- `getNewsletters()` can now search for bounced emails and display delivery counts per email.

**1.0.265**

- Bug fix: Minor fix for admin purposes.

**1.0.264**

- Anonymous users can now use `skapi.postRecord()`. Only limited to public records.
- Bug fix: `skapi.getTags()` not resolving proper data.

**1.0.262**

- Corrected the casing of the resolved string returned by [`resendSignupConfirmation()`](/api-reference/authentication/README.md#resendsignupconfirmation) to: `"SUCCESS: Signup confirmation e-mail has been sent."`

- During class initialization, if the constructor arguments are set to `"service_id"` and `"owner_id"`, a browser alert displays: `Replace "service_id" and "owner_id" with your actual Service ID and Owner ID.`

**1.0.260:**

- Service admin user invitations are now supported. [Learn more](https://docs.skapi.com/admin/invite.html)
- Custom unique ID features have been added to the database. [Learn more](https://docs.skapi.com/database/unique-id.html)
- Database referencing now offers index restriction controls, enabling fine-grained data ownership management. [Learn more](https://docs.skapi.com/database/referencing.html#referencing-index-restrictions)
- The database subscription feature is now available. [Learn more](https://docs.skapi.com/database/subscription.html)
- [WebRTC](https://docs.skapi.com/realtime/webRTC.html) and [Web notification](https://docs.skapi.com/notification/send-notifications.html) are now available, making it easy to build video chat and notification features for your application.
- Fixed various minor bugs.