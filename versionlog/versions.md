# Version History

### Current version: 2.0.2

**2.0.2**

- Added **named newsletter groups**. A project can now run several separately addressable newsletters (a `bunnyquery` list and a `skapi` list, say), each with its own subscribers, its own sending address and its own sent mail history, next to the numeric groups, which keep working exactly as before. `subscribeNewsletter()`, `unsubscribeNewsletter()`, `getNewsletterSubscription()` and `getNewsletters()` all take a group name in `group`, wherever they took a number, `'public'` or `'authorized'`. See [Named Newsletters](/email/newsletters.html#named-newsletters).
- Added `registerNewsletterGroup()`, `deleteNewsletterGroup()` and `newsletterGroupEndpoint()`, all project owner only. A group is registered with a `group` name, a `restriction` (`0` lets anyone subscribe with an e-mail confirmation, `1` requires a signed in user, `2` to `99` requires that access group; default `0`) and an optional display `name` of up to 60 characters. A project holds up to 20 groups, and a group's name and restriction are fixed once it is registered. `deleteNewsletterGroup()` removes the group **and every subscription in it**; a very large group may need more than one call, the response says how many subscriptions were removed, and the group is only gone once the call succeeds. `newsletterGroupEndpoint()` lists the project's groups with their restriction, label, subscriber count and sending address (`endpoint`, an empty string while the project has no sender e-mail). The `NewsletterGroup` type is exported. See [registerNewsletterGroup](/api-reference/email/README.md#registernewslettergroup), [deleteNewsletterGroup](/api-reference/email/README.md#deletenewslettergroup) and [newsletterGroupEndpoint](/api-reference/email/README.md#newslettergroupendpoint).
- A group name is 2 to 20 lowercase alphanumeric characters with at least one letter. It cannot be one of the reserved names `tp`, `admin`, `public`, `authorized`, `newsletter`, `forward`, `all`, `true`, `false` and `null`, and it cannot read as a number such as `1e5`, because a GET parameter is JSON parsed on the server and would arrive as something other than a string. One shared validator now enforces this in every group taking method, and it also refuses a numeric group that is not an integer between `0` and `99`. **`'admin'` is no longer accepted as a `group`**: it was sent to the server as the literal word and never meant the admin access group, so pass `99` instead.
- Fixed: `subscribeNewsletter()` accepted an alphanumeric group name while `unsubscribeNewsletter()` and `getNewsletterSubscription()` refused every string, and `getNewsletterSubscription()` ran the stored token through `parseInt`, so a named subscription could be created and then never removed or read back. All four methods now speak the same grammar.
- `getNewsletterSubscription()` no longer requires `group`: omit it, or pass `null`, to list every group the user is subscribed to. The `group` on each returned item is a number for the numeric groups and the group name for a named one. `unsubscribeNewsletter()` takes a named group too, and `null` still means every group.
- `getNewsletters()` reads a named group's sent mail for anyone its restriction allows, signed in or not; a signed out caller reads a restriction `0` group through the public route. Each returned newsletter now carries `group`: a number for the `0` to `99` groups, the name for a named one. See [Newsletter](/api-reference/data-types/README.md#newsletter).

**2.0.1**

- Fixed: `new Skapi("<Project ID>")` threw `Service ID is invalid` for a project in any region past the first ten in the region alphabet. A project in `eu-west-3`, the first such region to open, could not connect at all. The region travels inside the project ID as one character of an alphabet that runs through the ten digits and then `a` to `l`, and it was read back as a base62 digit, where `a` is 36 rather than 10. It is now read back by its position in that alphabet, which is identical for the ten digit regions, so every existing project ID decodes exactly as it did. Backend (ships with the API, not the SDK): the server side decoder carries the matching fix. Upgrade every client that decodes project IDs before creating a project in one of the newer regions.

**2.0.0**

- The `table: 'name'` shorthand no longer pins an access group on an **update**. Written as a plain string, a table still means access group `0`: `getRecords()`, `deleteRecords()` and a `postRecord()` that **creates** a record all send `{ name: 'name', access_group: 0 }`, which is what the string form has always meant. What changed is `postRecord()` with a `record_id`. 1.8.3 sent that same `access_group: 0` on an update, so writing the table as a string quietly **moved** the record to public whenever it had been living in some other group, and the only way to update it in place was to repeat the group on every call. An update now sends the table name with no access group at all, and the record keeps the group it is already in; pass `table: { name: 'name', access_group: ... }` when you actually want to move it. The object form is unchanged in both directions: it sends exactly the keys you wrote, so `table: { name: 'name' }` sends no access group and leaves the scope to the backend. See [The `table` shorthand and `access_group`](/database/access-restrictions.html#the-table-shorthand-and-access-group).

- Added the project setting **`require_login`**, returned by `getConnectionInfo()` as `conf.require_login`. When a project sets it to `true`, the SDK refuses `getRecords()`, `getTables()`, `getTags()`, `getIndexes()` and `getUniqueId()` from a session with no signed-in user, throwing `REQUIRE_LOGIN`. Signed-in callers are unaffected, and the check applies only when the flag is present and exactly `true`, so every existing project behaves as it always did.
- `require_login` is a **guard rail, not an access control**. The backend still serves `access_group: 0` records to any unauthenticated caller, so anything reachable without the SDK stays reachable; what the flag prevents is an app leaking its public records through a signed-out page by accident. Records that must not be readable without an account should not be in access group 0. It is also unrelated to `prevent_anonymous`, which governs whether anonymous users may WRITE records.

- Added **client-side encryption for private records**. `new Skapi("<Project ID>", { encryption: true })` encrypts the `data` of every record saved to `access_group: 'private'`, and the contents of the files attached to it, in the browser, before any of it reaches the database. The key is derived from the user's own password and never leaves their device, so a provider who dumps the database, the storage bucket and every request log cannot recover the payload without a successful offline guess against that password. Writing and reading do not change: `postRecord()` seals, `getRecords()` opens, and there is no key for the end user to manage. **The option only takes effect when the class is initialized**, there is no method that turns it on later, and enabling it does not go back and encrypt what was already saved. Only `data` and the **contents** of files are covered: `index.name`, `index.value`, `tags`, filenames, sizes, timestamps and the record graph stay in plain text, because that is what the database queries on. The strength is capped by the user's password, since the Web Crypto API offers no memory-hard KDF. Read [Encrypting Private Record Data](/database/encryption.html) in full before turning it on.
- `encryption` also accepts an object: `iterations` (PBKDF2 cost, default 600000, minimum 100000), `minPasswordLength` (refuses to enroll a weaker password, default off), `persistDevice` (stays unlocked across page reloads on that device, default `true`), `recovery` (`'code'` or `'none'`, default `'code'`), `trustPolicy` (`'tofu'` or `'strict'`, how a recipient's public key is trusted when sharing), `withheld` (`'null'` or `'sentinel'`, what `data` becomes when a record cannot be decrypted) and `table` (the reserved keyring table, default `__skapi__keyring`). See [Advanced Settings](/introduction/getting-started.html#advanced-settings).
- Added `getEncryptionStatus()`, `unlockEncryption()`, `lockEncryption()`, `takeRecoveryCode()`, `unlockWithRecoveryCode()`, `regenerateRecoveryCode()` and `isWithheld()`. A browser session is unlocked by logging in and stays unlocked across reloads; `unlockEncryption({ password })` is for a session restored from a token on a device that has never been unlocked, and for Node, which has no IndexedDB and is therefore always locked after a token restore.
- A **one-time recovery code** is minted in the browser at enrollment and parked for a single `takeRecoveryCode()` call, which returns it and forgets it. It is never transmitted, only the wrap of the master key is stored, and there is deliberately no way to fetch it again. Show it to the user once and have them confirm they saved it, because `forgotPassword()` and `resetPassword()` are unauthenticated and cannot touch the keyring: after a password reset the next login is **locked**, and `unlockWithRecoveryCode({ code, password })` is what repairs it, re-wrapping the keyring under the new password and returning a replacement code. A forgotten password with no recovery code and no unlocked device means those records are unreadable for good. `recovery: 'none'` opts out of issuing one.
- Sharing an encrypted record is the same call it always was and now carries the key with it. `grantPrivateRecordAccess()` wraps the record's data key to the recipient's published public key and writes it onto the record before granting access at the ACL level, so a failure never leaves a grant the recipient cannot use, and the owner does not need to be online when the grantee reads. `removePrivateRecordAccess()` removes the wrap and **rolls the data key**, so revocation is forward-only. Only the record's owner can share or revoke an encrypted record, delegated granting through `source.allow_granted_to_grant_others` does not work on them, and granting to a user who has never logged in with encryption enabled throws `ENCRYPTION_RECIPIENT_HAS_NO_KEY` and changes nothing.
- Files attached to a private record are sealed under a key derived from that record's data key, so anyone who can read the record can open its files with no extra key distribution. `getFile()` decrypts every form it returns, `file.size` is the plain text byte length and `file.stored_size` the real size on storage. **`record.bin[].url` serves the ciphertext for an encrypted file**, so `<img src>`, media elements, inline viewers, a plain `<a href>` download link, `updateProfile({ picture })` and any tool that renders the url directly stop working for those files, and byte-range requests go with them, which regresses video seeking and resumable downloads. Anything that needs the bytes has to call `getFile()`. Files on non-private records are untouched.
- A record you cannot decrypt never throws and never fails a whole page. Its `data` comes back as `null` and a new `encrypted` field carries the `status`, the `reason` (`NO_SESSION_KEY`, `NOT_A_RECIPIENT`, `BAD_KEY`, `BINDING_MISMATCH`, `CORRUPT`, `UNSUPPORTED_VERSION`, `ENCRYPTION_DISABLED` or `DATA_UNAVAILABLE`) and the list of user IDs that can. `withheld: 'sentinel'` returns a frozen, self-describing placeholder instead of `null`, tested with `isWithheld()`; writing that placeholder back is refused with `ENCRYPTION_CANNOT_REWRITE_WITHHELD`. A record stored in plain text has no `encrypted` field at all, which is how existing records keep working unchanged. This applies to the master account as well: it still reads and deletes any record in its project, and now receives the payload withheld, so **any dashboard or support tool that reads customer record data needs to be identified before this is turned on**.
- Changing a record's access group converts it in whichever direction it is going. Moving a record out of `'private'` writes its `data` back **decrypted** and returns its files to plain text, so a bare group change is a publish; moving one in encrypts both. Each direction is ordered so that an interruption leaves the record readable and re-running the update finishes the job, and neither can be done by a session that cannot decrypt the record. It is not a cheap operation: every attachment is downloaded, re-encoded and re-uploaded.
- Backend (ships with the API, not the SDK): moving a record **into or out of `access_group: 'private'` now clears every private-access grant on it**, whether or not encryption is enabled. In `'private'` a grant is the whole of a named user's access to that one record, while in any other group it only widens what an already-qualifying user may do, so grants between two non-private groups are left untouched. Grant the users again if they should still have access after the change.
- Limits worth knowing before enabling it: `crypto.subtle` needs a secure context, so a page served over plain http, localhost aside, cannot use the feature at all; OpenID accounts get no protection and stay locked with `OPENID_UNSUPPORTED`, because the backend mints their password; `data` is one sealed blob, so changing a single field means read, modify, write and requires decrypt access, while a metadata-only `postRecord(null, { record_id })` still leaves the payload alone; the payload inflates by about 33%, which puts the practical ceiling for a single-recipient record near 1.5MB and throws `ENCRYPTED_DATA_TOO_LARGE` past it; `__skapi_enc__` joins `__json__` and `__data__` as a reserved key in record data; keys are derived per project, so a cross-project write is refused; and an older SDK reading an encrypted record sees the raw envelope, so upgrade every client first. The claim also assumes you control the bundle: pin an exact version and self-host it, because a build served by the provider could ship code that takes the key.
- Added `forwardRequest()`. It relays a request to a destination of your choosing **from the server** and streams the response back as it arrives, with the project's API key attached server side where the browser cannot read it. See [Forward Request](/api-bridge/forward-request.html).
- **A service is now called a project**, and the service ID is now the **project ID**. The single-token form is the primary way to initialize: `new Skapi("<Project ID>")`. The legacy service ID + owner ID pair is still accepted, and the SDK keeps the older names in its API surface, so `service_name`, `service_description`, the `service` parameter and `refetchServiceInfo` are unchanged. Documentation examples now use the `"<Project ID>"` placeholder, angle brackets included.
- New `skapi.project_id` class property, also returned by `getConnectionInfo()`: the public project ID token, composed from the connected project and its owner. Empty string when the project has no user owner.
- `clientSecretRequest()` accepts **`stream`** and **`onStream`**. With `stream` omitted or `false` nothing changes: the response is downloaded whole and stored on the request row, which is byte for byte what every existing caller already gets. With `stream: true` the server reads the destination's response **incrementally** and relays the raw bytes into a chunk store as they arrive, and `onStream(chunk, seq)` hands them to you in order, so a page can render an answer while the destination is still producing it. Streaming needs a queue, because the relayed text is appended to a polling row and only a queued request has one; the SDK mints a queue name when you do not give one. See [Streaming the Response](/api-bridge/streaming-request.html) and [clientSecretRequest](/api-reference/api-bridge/README.md#clientsecretrequest).
- **Skapi does not parse the stream.** It relays bytes, and whatever format those bytes are in (Server-Sent Events, NDJSON, plain prose, anything at all) belongs to you and your destination: the framing, the parsing, and the buffering of a chunk that ended in the middle of a frame are all yours. That is deliberate, and it is why streaming works against **any** destination on day one rather than only the ones skapi knows about. Chunk boundaries are set by how fast the destination writes, never by your format, though a multi-byte character is never split across two chunks. The presence of `onStream` is what makes the poll loop fetch chunks at all, so a second reader can poll the very same request without it and get exactly the response it got before streaming existed.
- `stream` says how **skapi** reads the response; asking the destination to produce one incrementally is part of your own request and goes in `data` as that API requires. The two halves fail quietly on their own: with only the body's flag set, skapi buffers the whole event transcript into the stored response, where a reader expecting that API's normal document finds a wall of `data: {...}` lines; with only skapi's, the destination answers one plain document that is honestly relayed in pieces, so an incremental reader finds no records in it. Skapi catches neither, because your request body is yours and is never inspected.
- Added `clientSecretRequestStream(requestId, options)`, which reads a streamed request **this call did not start**: a page reload, a second tab, or a request opened from history that was never finalized. `onStream` on `clientSecretRequest()` only reaches the caller that made the request, so this is the way back to one. Still running, it polls and delivers text through `onStream` until the request settles, then resolves with the terminal status; already settled and not finalized, it reads every chunk once (paging internally) and resolves, which is what makes an unfinalized request re-readable; already finalized, it resolves with the stored body and streams nothing, since the chunks were released. `since` starts the read after a sequence number you already hold, the returned promise carries a `stop()`, and `stopClientSecretPolling()` reaches it exactly as it reaches a normal poll. A status envelope always carries `status`, `id` and `in_queue` together; a resolved value carrying none of them is **a finalized body**, which is how the two resolutions are told apart. Testing `status` alone is not enough, since a body you finalized may have a `status` field of its own. Only the caller who made a request can read it back: the identity half of a request id is taken from the request context on the server and never travels. See [clientSecretRequestStream](/api-reference/api-bridge/README.md#clientsecretrequeststream) and [StreamPollResult](/api-reference/data-types/README.md#streampollresult).
- `clientSecretRequest()` also accepts **`realtime`**. With `realtime: true` the server pushes each relayed piece over skapi's websocket as it relays it, so `onStream` fires as the text is produced instead of on the next poll tick. It is purely an accelerator and never the source of truth: the poll keeps running against the same chunk store, and a missing websocket, a session that cannot open one, a room already taken by another streaming read or a connection that drops mid-response are none of them errors and none of them reported, because the read simply continues at poll speed. Nothing is delivered twice and nothing arrives out of order whichever transport carried it, and every piece is in the chunk store either way, so the response stays re-readable in full with `clientSecretRequestStream()`. Only meaningful alongside `stream: true` and an `onStream` callback: without somewhere to put the text, skapi will not open a connection your application did not ask for.
- `onStream` gained a third argument, `via`, which is `'socket'` when the websocket carried the piece and `'poll'` when the poll did. Both transports hand their text to the same callback by design, so this is the only thing that distinguishes a response delivered live from one polled the whole way. It is there to be observed, not acted on, and a callback that ignores it reads exactly as it did before. `new Skapi(id, owner, { network_logs: true })` also prints the transport to the console: one line the first time each transport carries a piece, and a tally when the read ends.
- Skapi's realtime connection is shared, so a `realtime: true` read borrows it carefully. A connection your application already opened is not replaced, its callback is not changed, and it is not closed; the pieces are read off the socket directly, so your own realtime callback never sees them. A connection skapi opens for a read is closed by that read. Joining a room **replaces** the room the connection was in, and the room is left rather than restored when the read settles, so re-join yours after the request settles if your application uses rooms of its own. One connection is in one room at a time, so of two responses streaming at once the first takes the room and the second reads at poll speed rather than evicting a reader mid-response. An application that never calls `connectRealtime()` has none of this to think about.
- The reply to a `realtime: true` request carries **`realtime_group`**, and `clientSecretRequestStream()` accepts it as `realtimeGroup` so a re-attached read is live too. It cannot be rebuilt from a request ID, so keep it beside the ID you keep; a read without it works exactly as it always has, at poll speed. See [Faster delivery over the websocket](/api-bridge/streaming-request.html#faster-delivery-over-the-websocket).
- A streamed request settles with a **status and no body**, because the text was the stream. Added `clientSecretRequestFinalize(requestId, data, options)` to store the version you want **kept** as that request's history and release the relayed chunks it was assembled from. What you send becomes the request's stored result: the value `clientSecretRequestHistory()` lists as `response_body` and the value a later poll hands back. The content is entirely yours, and skapi neither validates nor interprets it: assembled text, a rebuilt response object, a summary, a single word. Only the caller who made the request can finalize it, only a **settled** request can be finalized, and a buffered request cannot, since its stored result is the destination's own answer and that answer is not yours to overwrite. Those cases come back as `{ finalized: false, message }` rather than throwing. Finalizing twice replaces the kept version, so a call lost to the network can simply be repeated, and a `failed` request is finalizable too, which is how you keep the 80% of a response that arrived before the stream died. See [clientSecretRequestFinalize](/api-reference/api-bridge/README.md#clientsecretrequestfinalize).
- **A streamed request's chunks are kept indefinitely until you finalize it.** Nothing expires them on a timer. Until then every read of that request has to fetch and re-parse all of its chunks, so a request nobody finalized gets slower and more expensive to open, forever, and its history entry stays empty. Finalize as soon as you have what you want: it is what turns a pile of relayed bytes into an ordinary history entry. The only things that clear chunks otherwise are `expires`, which removes the request and its chunks together when its history expires, and `cancelClientSecretRequest()`, which discards them, so finalize first if you want to keep the part that arrived.
- `clientSecretRequestHistory()` accepts `compact`, `queue_exact` and `queue_exclude`. `compact` returns label stubs in place of request and response bodies, which can be far larger than the listing that shows them; `queue_exact` restricts a `queue` filter to exactly the named queue instead of matching it as a prefix, and `queue_exclude` drops one queue's rows. Queue filters apply after the range read, so a page can come back short while more matches remain: keep paging by `startKey` / `endOfList`, never by a page's length. See [Request History](/api-bridge/request-history.html) and [RequestHistory](/api-reference/data-types/README.md#requesthistory).
- Fixed: `url` and `method` were ignored whenever a `queue` was given, so two different APIs sharing a queue name reported each other's requests.
- Fixed: an uncaught `QuotaExceededError` while saving the session cache. A large paged request history could exceed the session storage quota, which surfaced as an uncaught error on every tab switch.
- A record's `data` is now stored as JSON text and parsed back on read, so it returns exactly what was posted, whatever it is. Payloads that could not be saved at all before now round-trip: one containing an empty key (`{ "": "value" }`), one nested more than 32 levels deep, and one carrying a key longer than 65535 bytes. All three used to fail with an opaque server error naming neither the field nor the key. `data: null` now stores a null rather than removing the field, so it reads back as `null`; passing no `data` at all is still the metadata-only update that keeps what is stored. `NaN` and `Infinity` are not JSON: they are stored as `null`, and the record returned by `postRecord()` shows that `null` too, so what you get back is what was saved. **Records written this way can only be read back by this version of the SDK or later**, and `data` is roughly 10 to 30% larger in storage, so a record near the size limit is more likely to be offloaded to file storage.
- Fixed: a list in a record's `data` lost its order and its duplicates. `[1, 1, 1]` was stored as a database set and came back as `[1]`; it now reads back as written. An empty list and an empty object are stored as themselves too.
- Fixed: a string in `data` containing `*add` or `*sub` corrupted the record on update. The text was read as an internal counter instruction, which replaced `data` with a set of the remaining words.
- `deleteRecords()` now returns the records it deleted in the same shape every other method returns, so `record_id`, `table.name` and `data` read normally. It was the one record-returning method that never normalized, so it handed back raw database items with short keys and encoded values.

- `table.access_group` accepts `'*'` as shorthand for `'private'` on `postRecord()`, `bulkPostRecords()`, `getRecords()` and `deleteRecords()`. The SDK converts it to `'private'` before the request goes out, so the wire and the backend are unchanged, and an encrypted project seals a `'*'` write exactly like a `'private'` one. For reference, `'public'` is `0`, `'authorized'` is `1` and `'admin'` is `99`.

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