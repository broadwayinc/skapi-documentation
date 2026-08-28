# Encrypting Private Record Data

Skapi can encrypt the `data` of your private records **in the browser**, before it reaches
the database. The keys are derived from the user's own password and never leave their device,
so the service provider running the backend cannot read the contents of a record its owner
keeps to themselves.

This is off by default, and the guarantee is narrower than "your data is encrypted". Read
this whole page before turning it on. In particular:

- Only the `data` attribute and the contents of attached files are covered. Index values,
  tags and filenames are not, and for many applications those are the sensitive part.
- An encrypted file's `url` stops being directly fetchable, so `<img src>` and plain
  download links break for those files.
- The strength is capped by the user's password, because Web Crypto offers no memory-hard KDF.
- **Sharing** a record involves a public key that the provider serves, which is a weaker
  footing than the rest of the design and needs to be described accurately to a customer.
- A forgotten password with no recovery code and no unlocked device means the data is gone.

## What is protected, and what is not

Only the **value of the `data` attribute** is encrypted, and only on records whose
`access_group` is `'private'`.

Everything the database queries on stays in plaintext, because that is the only way your
queries keep working:

| Plaintext (the provider sees this) | Encrypted |
| --- | --- |
| `record_id`, `unique_id` | `data` |
| `table.name`, `access_group` | the **contents** of files in `bin` |
| `index.name` and `index.value` | |
| `tags` | |
| `reference` and the whole record graph | |
| file **names**, sizes and upload times | |
| `uploaded` / `updated` timestamps, record sizes | |
| the list of users a record is shared with | |

Only the `data` attribute and the **bytes** of attached files are covered. A file's name is
part of its storage key, so it stays visible.

::: warning For many apps, the index is the sensitive part
If your index value is a patient name, an email address, or a salary, encrypting `data`
protects almost nothing. Encryption cannot cover anything you need to search, sort, or
range-query on, because those comparisons happen in the database.
:::

## The security claim, stated exactly

The claim is not one sentence, it is two, because a record a user keeps to themselves and a
record they share with someone else rest on different foundations.

**For a user's own private records, never shared:**

> A service provider who dumps the database, the storage bucket, and every request log
> cannot recover the record's `data` without a successful offline guess against the user's
> password.

No key comes from the server on this path. The master key is derived in the browser from the
password, so this holds on cryptography alone.

**For records the user has shared with someone else:**

> The provider cannot recover the record's `data` by reading its own database. It *can*
> obtain that record's data key by serving a forged public key at the moment the user
> shares, which the user can detect by comparing key fingerprints, and which
> `trustPolicy: 'strict'` prevents outright.

Sharing requires fetching the other person's public key, and the provider serves that
directory. See [Key substitution](#key-substitution-the-residual-risk-in-sharing) for the
full picture, because this is the first thing a security auditor will test.

### The ceiling on both

Both are bounded by **password entropy**, because the Web Crypto API offers only PBKDF2 (no
Argon2id, no memory-hard KDF). Skapi's default minimum password is six characters, and a
six-character password falls to an offline attack in minutes.

If you are making this promise to a customer, set `minPasswordLength` and enforce a real
password policy in your signup form. A user who keeps their [recovery
code](#recovery-codes) is better off, since that is 128 random bits rather than a
memorable string, but the password remains the floor for anyone who does not.

## Turning it on

```js
const skapi = new Skapi("<Project ID>", { encryption: true });
```

`encryption` is an option of the Skapi class, and it only takes effect when the class is
initialized. There is no method that turns it on later: an instance built without this
option saves the `data` of every record as plain text for its entire lifetime, and enabling
it afterwards does not go back and encrypt what was already saved. It is listed with the
rest of the initialization options in
[Advanced Settings](/introduction/getting-started.html#advanced-settings).

With options:

```js
const options = {
    encryption: {
        iterations: 600000,      // PBKDF2 cost. Default 600000, minimum 100000.
        minPasswordLength: 12,   // refuse to enroll a weaker password. Default 0 (off).
        persistDevice: true,     // stay unlocked across a page reload. Default true.
        recovery: 'code',        // issue a one-time recovery code. Default 'code'.
        trustPolicy: 'tofu',     // 'tofu' (default) or 'strict'. See Sharing.
        withheld: 'null'         // 'null' (default) or 'sentinel'. See below.
    }
};

const skapi = new Skapi("<Project ID>", options);
```

Then write records exactly as you always have:

```js
await skapi.postRecord(
    { diagnosis: 'confidential' },
    { table: { name: 'notes', access_group: 'private' } }
);

const res = await skapi.getRecords({ table: { name: 'notes', access_group: 'private' } });
console.log(res.list[0].data); // { diagnosis: 'confidential' }
```

There is no key to manage and nothing for the end user to do. Logging in unlocks
encryption; a page reload stays unlocked.

## Changing the access group

If you change a record's access group to anything other than `'private'`, the data is
written back **decrypted**, as an ordinary object. A record that is no longer private is
no longer unreadable:

```js
// starts encrypted
const rec = await skapi.postRecord(
    { note: 'secret' },
    { table: { name: 'notes', access_group: 'private' } }
);

// now stored in the clear, readable by anyone
await skapi.postRecord(
    { note: 'secret' },
    { record_id: rec.record_id, table: { name: 'notes', access_group: 0 } }
);
```

The reverse also holds: moving a public record to `'private'` encrypts it on the way in.

::: warning A group change alone publishes the plaintext
You do not have to pass the data along with the group change, and that is worth knowing
before you write the call. Moving an encrypted record to a non-private group **without**
restating its data does not leave the ciphertext stranded: the SDK decrypts what is stored
and writes it back in the clear, because a record nothing will ever try to decrypt is
worse than one that is readable on purpose.

The consequence is that a bare access-group change is a publish. If the intent was only to
reorganize a table, move the record to another private group instead.

The SDK can only do this while encryption is unlocked and the caller can actually read the
record. A session that cannot decrypt it is refused rather than allowed to strand or
destroy the payload.
:::

### Attachments move with the record

Files are converted in whichever direction the record is going: sealed files come back to
plaintext when a record leaves `'private'`, and plaintext files are sealed when it arrives.
Without this, declassifying produced a public record holding files nobody could ever open
again, because the payload was decrypted while the key went with the envelope.

The order is what makes each direction safe to interrupt:

| Direction | Order | If it dies halfway |
| --- | --- | --- |
| `private` to anything | files first, then the group flip | still private, some files already plaintext. Readable, and re-running finishes it |
| anything to `private` | group flip first, then the files | private with its data sealed, some files still in the clear. Less protected than intended, nothing lost |

Neither is atomic and neither can be: a group change is one write, and every file is a
separate object. What they are is **monotonic**. No interruption destroys content, and
re-running the same update completes the job.

::: warning This costs requests
A group change on a record with attachments downloads, re-encodes and re-uploads every one
of them. An update that states a non-private group also costs one extra read, to find out
whether there are any sealed files at all. Changing the access group of a record with many
large files is not a cheap operation.
:::

### The service owner cannot change these settings for someone else

A master account can update any record in its project, but **not** move someone else's
record into or out of `'private'`. That is refused in both directions, and the SDK refuses
it earlier with `ENCRYPTION_NOT_RECORD_OWNER` so the reason is clear before a round trip:

- Making **someone else's record private** would seal it under the master's key, with the
  envelope naming the master as owner while the record belongs to someone else. The binding
  check then refuses it for everyone, the real owner included. The record would be destroyed
  and the call would report success.
- **Declassifying someone else's** encrypted record cannot work either, since the master has
  no key to decrypt what it would have to write back in the clear.

Encryption operates only on records you own, whatever access level you hold. A master who
needs one of these changes has to have the owner make it.

This is enforced in the **backend**, not only in the SDK, so an older client or a direct
REST call is refused too:

> Only the owner of a record can move it into or out of the private access group.

A master may still move a record freely between any two **non-private** groups, and may do
anything at all to its own records. The rule is specifically about the private boundary,
because `'private'` is the only group whose contents may be encrypted, and no amount of
privilege substitutes for a key that only the owner has.

## Private grants are cleared at the boundary

Crossing into or out of `'private'` **removes every private-access grant on the record**.

`'private'` is the only access group where a grant means *"this named user may read this one
record"*. In every other group a grant only widens what an already-qualifying user may do,
such as referencing the record, so those grants stay meaningful and are left alone.

| Change | Grants |
| --- | --- |
| `private` to anything | **cleared** |
| anything to `private` | **cleared** |
| between two non-private groups | untouched |
| no group change | untouched |

Leaving them in place on the way *out* would keep an access model the record no longer uses.
Leaving them in place on the way *back in* would silently re-grant users the owner never
re-approved, and with encryption enabled it would produce a record whose ACL says "shared"
while its key wraps say otherwise: the ACL would let those users fetch it and the crypto
would refuse them.

This runs in the record stream, so it applies **whether or not encryption is enabled**. If
the users should still have access after the change, grant them again.

::: tip State the table on updates
When you update a record without a `table`, the SDK has to fetch the record to learn its
current access group, which costs one extra request. Passing
`table: { name, access_group }` avoids it.
:::

## Sharing a record

The record's owner can give other users decrypt access. This works through the normal
grant API, with the key wrapping handled for you:

```js
await skapi.grantPrivateRecordAccess({
    record_id: rec.record_id,
    user_id: 'the-other-users-id'
});
```

Behind that call the SDK fetches the other user's public key, wraps this record's data key
to it, and writes the result onto the record **before** granting access at the ACL level,
so a failure never leaves a grant that the recipient cannot use.

The grantee then reads the record normally, with their own session. **The owner does not
need to be online for that**: the wrapped key sits on the record permanently. The owner is
only needed at the moment of granting, because only someone who can already decrypt the
record can wrap its key for someone new.

Revoking removes the wrap **and rolls the data key**, re-encrypting the record so the
revoked user cannot read future versions:

```js
await skapi.removePrivateRecordAccess({
    record_id: rec.record_id,
    user_id: 'the-other-users-id'
});
```

Revocation is **forward-only**. It cannot un-read what they already read, and if they kept
a copy of the old ciphertext and their old wrap, that copy stays readable to them forever.

::: warning A group change clears grants
Moving a record into or out of `'private'` removes every grant on it. See
[Private grants are cleared at the boundary](#private-grants-are-cleared-at-the-boundary).
:::

### Rules for sharing

- Only the **owner** can share or revoke an encrypted record, because both mean writing to
  it. Delegated granting via `source.allow_granted_to_grant_others` does not work on
  encrypted records.
- The recipient must have logged in at least once with encryption enabled, so that they
  have a published key. Granting to a user with no key throws
  `ENCRYPTION_RECIPIENT_HAS_NO_KEY` and changes nothing.
- Each recipient adds roughly 230 bytes to the record, carried on every read and write of
  the envelope. On a large record the payload itself is stored separately and is **not**
  re-uploaded when you share it: see [Large payloads](#large-payloads).

### Key substitution: the residual risk in sharing

This is the one place where the guarantee rests on trust rather than on mathematics, so it
is worth understanding properly rather than being reassured about.

#### The attack

Alice wants to share a record with Bob. Her browser asks the backend for Bob's public key.
The backend returns a key **whose private half the provider holds**. Alice's SDK wraps the
record's data key to it, and the provider can now open that record.

It can be made invisible to both of them: having obtained the data key, the provider can
also wrap it for Bob's real key, so Bob reads the record normally and nothing looks wrong.

And because a record's data key is stable across updates, one successful substitution yields
that record's contents from then on, not only the version that existed at that moment, until
a revoke rolls the key.

#### What it does not reach

Three limits, and they are the reason this does not sink the design:

- **It is an active attack, not a passive one.** A provider who dumps the database, the
  bucket and every request log still gets nothing. This requires deliberately serving a
  forged key at the moment of a specific share. That is a different category of act: it lives
  in deploy history and source control, where it can be audited.
- **It cannot touch a user's own unshared records.** That path never asks the server for a
  key. The exposure is limited to records the user chose to share, and only to shares made
  after the attack begins.
- **It compromises no identity.** What the provider gets is one record's data key. Not the
  user's master key, not anyone's private key, not any other record.

#### Why no protocol fixes it

Every end-to-end system with a provider-hosted key directory has exactly this property:
Signal, WhatsApp, iMessage, Proton. It is a property of the trust topology, not a flaw in
this implementation.

A signature scheme is the tempting wrong answer. Bob signing his own public key with his own
identity key is self-referential, so a provider substituting both produces a signature that
verifies perfectly. Closing this needs a trust root the provider does not control.

#### The three mitigations, in increasing order of cost

**1. Fingerprint pinning.** The SDK refuses to accept a *changed* key silently. If a peer's
fingerprint differs from the one first seen, the grant throws
`ENCRYPTION_PEER_KEY_CHANGED`, because that is what a legitimate account reset looks like
and also what an attack looks like, and guessing between them is not the SDK's call:

```js
// after verifying the fingerprint with them out of band
await skapi.pinPeerKey({ user_id: 'their-id', fingerprint: 'the-verified-value' });
```

Pins are stored encrypted under the user's own master key, so the provider can destroy them
(which is loud: every peer becomes unseen again) but cannot edit them undetectably.

This is Signal's safety numbers. It means a provider cannot silently swap a key it has
already been observed serving.

**2. `trustPolicy: 'strict'`.** Requires a pin before *any* first share, so there is no
trust-on-first-use window at all. This genuinely closes the hole. The cost is that users
must verify a fingerprint before they can share with someone new, which is right for a
security-conscious tenant and too much friction for a consumer app.

**3. Key transparency (not implemented).** Publish every key the directory serves into an
append-only log with inclusion proofs, so a client can verify that the key it was handed is
the same one everyone else was handed, and that a peer's key history contains no unexplained
entries. This is what Apple's Contact Key Verification and WhatsApp's Key Transparency do.
It is the only mitigation that closes the hole without asking users to do anything, and it
is a substantial project: a verifiable log service, proof generation, and client-side
auditing.

#### What to tell a customer

Scope it honestly. An auditor will accept this:

> For your own private records, we cannot read them: the key never leaves your device. For
> records you share, we cannot read them by reading our database. The residual risk is that
> we serve you a forged public key at the moment you share, which you can detect by
> comparing fingerprints, and which strict mode prevents outright.

An auditor will not accept a flat "we cannot see your data" over a trust-on-first-use
directory, because verifying that claim is the first test they will run.

## Attached files

Files attached to a private record are encrypted too, under a key derived from that
record's data key. Anyone who can read the record can open its files, with no extra key
distribution, and a grantee gets both at once.

Nothing changes in how you upload:

```js
await skapi.postRecord(
    { title: 'contract' },
    { table: { name: 'notes', access_group: 'private' } },
    [{ name: 'doc', file: myFile }]
);
```

Reading requires `getFile()`, which decrypts:

```js
const rec = (await skapi.getRecords({ record_id })).list[0];
const f = rec.bin.doc[0];

f.encrypted;    // true
f.filename;     // 'contract.pdf'  (names are NOT encrypted)
f.size;         // the PLAINTEXT byte length
f.stored_size;  // the larger, real size on storage

const blob = await f.getFile('blob');   // decrypted
await f.getFile('download');            // decrypted, then saved
```

::: danger The url is ciphertext
`record.bin[].url` serves the encrypted bytes. These stop working for an encrypted file and
there is no SDK-side fix, because the url escapes into places the SDK cannot see:

- `<img src="${file.url}">`, `<video>`, `<audio>`, inline PDF viewers
- a plain `<a href="${file.url}">` download link
- `updateProfile({ picture: file.url })`
- any dashboard or tool that renders `file.url` directly

Anything that needs the bytes must call `getFile()`. Byte-range requests are also gone, so
video seeking and resumable downloads regress for encrypted files.
:::

Everything `getFile()` returns is decrypted, including `'download'`, `'text'` and
`'base64'`. `'endpoint'` returns the raw url, and is therefore ciphertext by definition.

Files on non-private records are untouched, uploaded and served exactly as before.

## Large payloads

Past roughly 256KB of ciphertext the SDK stores the payload in a file of its own and keeps
only the small part of the envelope in the database:

```js
data: {
    __skapi_enc__: 1,
    iv:     "…",
    k:      { "alice": {...}, "bob": {...} },   // who can decrypt
    ct_ref: "…/__skenc_ct__/payload.bin"        // where the ciphertext lives
}
```

You do not do anything to opt into this and nothing about reading or writing changes. It
matters for one reason: **sharing a large record no longer touches the payload.**

Before, `k` and the ciphertext were one attribute, so adding a single recipient meant reading
the whole record back and writing the whole thing out again to append about 230 bytes of key
wrap. On a 1.9MB record that is a 1.9MB download and a 1.9MB upload, and a transient storage
failure could block a sharing change that never needed the payload at all. Now
`grantPrivateRecordAccess` and `removePrivateRecordAccess` rewrite a few hundred bytes and
never open the file.

Reading the record still fetches the ciphertext, of course. That is the data.

Three details worth knowing:

- **It happens on update, not on create.** A newly created record has no id yet, so there is
  nowhere to put the file. A large create is handled by the server's own offload and splits
  on its first update.
- **The spilled file is not a user file.** It never appears in `record.bin`, exactly like the
  server's offloaded `data` file.
- **The previous file is retired on the next write**, so a record never accumulates stale
  ciphertext.

## Reading a record you cannot decrypt

Decryption never throws, and never fails a whole page. A record you cannot open comes back
with `data: null` and an `encrypted` field explaining why:

```js
const res = await skapi.getRecords({ table: { name: 'notes', access_group: 'private' } });

for (const rec of res.list) {
    if (rec.encrypted?.status === 'failed') {
        console.log(rec.encrypted.reason);
    }
}
```

| `reason` | Meaning |
| --- | --- |
| `NO_SESSION_KEY` | Encryption is locked. Call `unlockEncryption({ password })`. |
| `NOT_A_RECIPIENT` | This user has no key wrap on the record. |
| `BAD_KEY` | The wrap did not open. Usually a rolled or rotated key. |
| `BINDING_MISMATCH` | The envelope does not belong to this record. |
| `CORRUPT` | The payload failed its authentication tag. |
| `UNSUPPORTED_VERSION` | Written by a newer SDK than this one. |
| `ENCRYPTION_DISABLED` | The record is encrypted but this instance has the flag off. |
| `DATA_UNAVAILABLE` | The payload is offloaded to storage and could not be fetched, so whether it is encrypted is unknown. |

`NOT_A_RECIPIENT` and `NO_SESSION_KEY` are deliberately different answers.
`NO_SESSION_KEY` means *"you are on the list, unlock and retry"*. `NOT_A_RECIPIENT`
means *"you are not on the list"*, which no amount of unlocking will change. Membership is
checked first, because it is a lookup that needs no key.

### What the withheld value looks like

By default `data` is `null`, so an ordinary `if (record.data)` check keeps working as a
"do I have data" test.

If you would rather have something explicit, opt in:

```js
const skapi = new Skapi("<Project ID>", {
    encryption: { withheld: 'sentinel' }
});
```

`data` then becomes a frozen, self-describing placeholder carrying its own reason:

```js
{
    __skapi_no_access__: true,
    reason: 'NOT_A_RECIPIENT',
    recipients: ['1111-…', '2222-…']
}
```

```js
if (skapi.isWithheld(record.data)) {
    // show a lock icon rather than an empty record
}
```

::: warning The sentinel is truthy
Every JavaScript object is truthy, so under `'sentinel'` a check like
`if (record.data) render(record.data)` will pass and render the placeholder. That is the
whole cost of this option, and it is why `'null'` is the default. Switch only when you are
ready to replace those checks with `skapi.isWithheld()`.
:::

Writing the placeholder back is refused with `ENCRYPTION_CANNOT_REWRITE_WITHHELD`, so a
read-modify-write by a session that could not decrypt cannot overwrite the record with it.

## What the service owner sees

The backend lets a master account read and delete any record in its project, and that does
not change. What changes is that the payload is not readable:

```js
const res = await skapi.getRecords({ record_id });
res.list[0].data;       // null (or the sentinel)
res.list[0].encrypted;  // { status: 'failed', reason: 'NOT_A_RECIPIENT', recipients: [...] }
```

Nothing throws, and everything else on the record stays fully visible: `record_id`,
`user_id`, index name and value, tags, reference, timestamps, and the list of user_ids that
*can* decrypt it.

`deleteRecords` behaves the same way. The delete still happens, and the records it returns
come back with their data withheld rather than as raw ciphertext. The owner of a record
deleting their own gets it back decrypted, which is the point of a delete that returns what
it removed.

::: tip Support tooling
Any dashboard or support tool that reads customer record data needs to be identified before
you enable this. It will keep working at the ACL level and start receiving `data: null`.
:::

A record stored in plaintext has **no** `encrypted` field at all, which is how existing
records keep working unchanged after you enable the feature.

## Locking and unlocking

```js
skapi.getEncryptionStatus();
// { status: 'unlocked', user_id: '...', fingerprint: '...' }

await skapi.unlockEncryption({ password });        // for a session with no device entry
await skapi.lockEncryption();                      // drop keys from memory
await skapi.lockEncryption({ forgetDevice: true }); // and require the password next reload
```

`unlockEncryption` is rarely needed in a browser. You need it when:

- The session was restored from a token on a device that has never been unlocked.
- You are running in **Node**, which has no IndexedDB and is therefore always locked after
  a token restore.
- The user called `lockEncryption({ forgetDevice: true })`.

## Changing a password

`changePassword` re-wraps the master key for the new password before Cognito changes it, so
no record is touched and nothing is re-encrypted.

Encryption must be **unlocked** when you call it. If it is locked, the call is refused with
`ENCRYPTION_LOCKED`, because changing the login password while the keyring is still wrapped
under the old one would leave the user able to log in and never open their own data again:

```js
if (skapi.getEncryptionStatus().status !== 'unlocked') {
    await skapi.unlockEncryption({ password: currentPassword });
}
await skapi.changePassword({ current_password: currentPassword, new_password: next });
```

## The two hard trade-offs

### 1. A password reset destroys the data unless the user has their recovery code

Changing a password (with the old one in hand) is free, as above.

**Resetting** a forgotten password is different. `forgotPassword` / `resetPassword` prove
control of an email address, not knowledge of the old password, so there is nothing to
unwrap the master key with. The records stay encrypted and unreadable.

That is what the recovery code is for. See below.

This is not a gap, it is the guarantee. If an email code could recover the data, the
provider could recover it too, and the claim above would be false.

Warn the user **in your reset flow**, not afterwards.

### 2. Server-side reads stop working on encrypted records

The backend has no key and must not have one, so anything that reads the content is off for
those records:

- server-side search or filtering on `data`
- any support tool or dashboard that displays customer record data
- any future server-side processing of an attachment's bytes

The service owner and master account can still **fetch and delete** an encrypted record at
the ACL level. They receive it with `data` withheld, as described above.

This is not a gap to work around. A backend that could read these records is a backend that
could read them for anyone, and the guarantee at the top of this page would be false.

## Recovery codes

At enrollment the SDK mints a one-time recovery code and shows it to you **once**. It is the
only thing standing between a forgotten password and permanent data loss.

### Collecting it

```js
const user = await skapi.login({ email, password });

const recoveryCode = skapi.takeRecoveryCode();
if (recoveryCode) {
    // Show it. Make the user confirm they saved it before continuing.
    // This is the only time it will ever exist.
}
```

`takeRecoveryCode()` returns the code and forgets it. There is deliberately no way to fetch
it again, and no "resend my code" endpoint. If either existed, the SDK (and therefore the
service provider) would be holding the key.

The code looks like `GDQ9-0MZS-X7AV-6YG5-8Z76-4CJ1-PWG0`: 128 bits of entropy in Crockford
base32, so no `I`, `L`, `O` or `U` to misread, plus two check characters. Parsing is
forgiving about case, spaces, hyphens and the classic `O`/`0` and `I`/`1` confusions, and a
single-character typo is reported as a malformed code rather than a wrong one.

### Where it comes from, and why that matters

The code is generated **in the browser**, from `crypto.getRandomValues`. It is never
transmitted. What reaches the database is only the *wrap*: your master key sealed under a key
derived from the code, which is exactly as safe to store as the password wrap sitting beside
it and useless without the code.

::: danger Never let the code reach your server
Do not email it, do not SMS it, do not log it, do not offer to store it. Anything that puts
the code in your infrastructure hands you the master key and makes the security claim on this
page false. "The server generates it and immediately forgets" does not work either, because
nobody can verify that it forgot.
:::

Because the code is high entropy, it is derived with **HKDF, not PBKDF2**. PBKDF2's 600,000
iterations exist because human passwords are guessable; 128 random bits are not, so
stretching would only make recovery slow. A practical consequence: for a user who keeps their
code, the recovery path is **stronger** than their password.

### Using it after a forgotten password

The sequencing is not obvious and you have to get it right. `forgotPassword` and
`resetPassword` are unauthenticated: there is no session during a reset, so the keyring
cannot be touched then. Recovery happens on the **next login**:

```js
// 1. the normal reset flow, unchanged
await skapi.forgotPassword({ email });
await skapi.resetPassword({ email, code, new_password });

// 2. log in with the new password. Encryption will be LOCKED, because the
//    keyring is still wrapped under the password they forgot.
await skapi.login({ email, password: new_password });
skapi.getEncryptionStatus(); // { status: 'locked', reason: 'NO_SESSION_KEY' }

// 3. the recovery code repairs it
const res = await skapi.unlockWithRecoveryCode({
    code: whatTheUserTyped,
    password: new_password        // pass it, or the next login is locked again
});

res.status;        // 'unlocked'
res.repaired;      // true: the keyring now opens with the new password
res.recoveryCode;  // a REPLACEMENT code. Show it, the old one is dead.
```

Passing `password` is what makes this self-healing. Omit it and the current session unlocks,
but the keyring is still wrapped under the forgotten password and the next login is locked
all over again.

### Rotation

A used code has been in a clipboard and possibly a screenshot, so it is retired on use and a
replacement is returned. You can also rotate on demand:

```js
const { recoveryCode } = await skapi.regenerateRecoveryCode();
```

This requires an **unlocked** session, which is the whole access-control story: the only way
to mint a code is to already be able to decrypt. There is no path here that helps someone who
is locked out, and none that lets the provider mint one.

### Opting out

```js
encryption: { recovery: 'none' }
```

No code is issued and no recovery wrap is stored. A forgotten password then means the user's
encrypted records are permanently unreadable, with no way back. Choose this only if that is
genuinely what you want.

## Other limits worth knowing

- **OpenID accounts get no protection.** Their "password" is minted by the skapi backend,
  so a key derived from it gives no confidentiality against the provider. Those sessions
  stay locked, with reason `OPENID_UNSUPPORTED`.
- **Admin-created accounts** start on a provider-issued password. That password should be
  changed before the user stores anything sensitive.
- **Plain http does not work.** `crypto.subtle` requires a secure context, so a page served
  over http (other than localhost) cannot use this feature at all.
- **`__skapi_enc__` is a reserved key** in record data, alongside `__json__` and `__data__`.
- **Size.** Encryption inflates the payload by about 33%, so the practical ceiling for a
  single-recipient record is roughly 1.5MB rather than 2MB. Exceeding it throws
  `ENCRYPTED_DATA_TOO_LARGE`, which names the real limit.
- **Partial updates are gone.** `data` is one sealed blob, so changing one field means
  read, modify, write, and requires decrypt access. A metadata-only update
  (`postRecord(null, { record_id, ... })`) is still fine and leaves the payload alone.
- **Updating a shared record needs decrypt access.** The existing key wraps are read off the
  record and carried forward, so a session that cannot decrypt it is refused rather than
  allowed to write an update that would silently un-share it.
- **Logging out clears the device key.** The next session on that browser needs the password
  again.
- **Cross-project writes are refused.** The key is derived per project; use a separate
  Skapi instance for another service.
- **Upgrade every client first.** An older SDK reading an encrypted record sees the raw
  envelope. It loses nothing, but it cannot read it.

## Where the keys live

For the record, and so an auditor does not have to reverse-engineer it:

- A random **master key** per user, wrapped under `HKDF(PBKDF2(password))` bound to
  `(service, owner, user_id)`. Stored in a reserved `skapi__keyring` table in the user's own
  private partition, readable by nobody else.
- An **ECDH P-256 identity keypair** per user. The private half is encrypted under the
  master key; the public half is published in the same table's `authorized` partition, so
  other logged-in users can wrap keys to it. This directory is the one component a client has
  to *trust* rather than verify, which is why
  [key substitution](#key-substitution-the-residual-risk-in-sharing) is discussed at length
  above.
- A one-time **recovery code**, 128 bits from the browser's CSPRNG, wrapping the master key
  via HKDF. Never transmitted, and stored only as that wrap.
- The master key **sealed under itself** (`self` in the keyring), so a session holding only
  the non-extractable key handle can still recover the raw bytes when it needs to mint a new
  wrap. Opening it already requires holding the key, so it grants nothing.
- A **data key per record**, wrapped once for the owner (symmetric, under the master key)
  and once per grantee (ECDH-ES). All wraps live in the record's own envelope.
- In the browser, the master key is cached in **IndexedDB as a non-extractable
  `CryptoKey`**, so a page reload stays unlocked without a password. Non-extractable means
  injected script can *use* it but cannot read or exfiltrate it. That is a reduction in
  exposure, not immunity: an XSS on your origin can still decrypt anything the user can.

::: danger Self-host the SDK
If your application loads the skapi bundle from a CDN the provider controls, the provider
can ship a build that steals the master key, and the entire guarantee collapses. Pin an
exact version, self-host it, and use Subresource Integrity. No amount of client code can
enforce this for you; it is a requirement of the claim, not a suggestion.
:::
