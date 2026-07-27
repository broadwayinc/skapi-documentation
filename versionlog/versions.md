# Version History

### Current version: 1.8.0

**1.8.0**

- `getRecords()` and `deleteRecords()`: `condition: '<='` on a `string` index value is now an **'ends with'** search. It was a lexicographic 'lesser or equal' comparison before, so any query that relied on the old meaning has to be rewritten. `>=` is unchanged and still means 'starts with', `>` and `<` are still lexicographic, and `number` / `boolean` values compare as before. When the index `name` is a compound name ending in a period, `>=` and `<=` match the child name segment from its start and its end respectively. This behavior is served by the API, so it applies to every client version; the SDK type declarations were updated to describe it. See [Indexing](/database/indexing.html#ends-with-string-values).
- `clientSecretRequestHistory()` items, and the object a `poll()` resolves with, now carry a `created` timestamp: the time the request was made, in milliseconds, set once and never changed. `updated` keeps its meaning as the time of the most recent status change, which for a settled request is when its response arrived. See [Fetching Request History](/api-bridge/request-history.html).

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

- Added `clientSecretRequestHistory()` to retrieve past client-secret request results, with optional polling for items still in `pending` status. See [Client Secret Keys](/api-bridge/client-secret-request.html#fetching-request-history).
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
- Skapi now provides more advanced class initialization options, including event listeners for login state, user profile updates, and batch processing. See [Advanced Settings](/introduction/getting-started.html#_4-advanced-settings).
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