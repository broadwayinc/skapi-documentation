# Admin Features

Skapi provides a set of methods for managing your project.

These methods are available only to users with the `admin` role.

Project owners can grant the `admin` role to other users.

:::danger NOTE
Before using admin methods, create an admin user from your Skapi project Users page. Then use that account to access admin methods, or grant admin access to other users.
:::

The lists below are the summary. [Admin Permissions](/admin/permissions.md) is the full policy: the access group rules that apply to every action on another account, the record, file, newsletter and notification rights in detail, and the exact message every refusal returns.

## What Admins Can Do

Admins use high access groups (`90` ~ `99`) and can perform the following actions:

- Read database data in any access group. Fetching a single record by its `record_id` is the exception: for admins in access groups `90` ~ `98`, a record in a **higher** access group than their own is still refused with `No access to the record.`
- Read subscription records and their files without subscribing.
- Upload records to any access group.
- Upload, update and delete records while the database is frozen.
- View the record counts of every access group, private and admin totals included, in table information.
- Delete user accounts in a lower access group than their own.
- Update the profiles of user accounts in a lower access group than their own. Admins in access group `99` can update every account but their own. See [Editing a user's profile](/admin/permissions.md#editing-a-user-s-profile).
- View the e-mail address and `misc` of every user, and search users by e-mail.
- Invite users to the project.
- View, resend and cancel pending invitations.
- Create users in the project.
- Assign access groups to users, up to their own access group, on accounts in a lower access group than their own.
- Remove private record access from users, on any record.
- Block or unblock users in a lower access group than their own.
- Delete any record, including private and read-only records.
- Attach files to records of other users, and delete their files with [`deleteFiles()`](/api-reference/database/README.md#deletefiles). Files on a private record are locked to its user. See [Files on Records of Other Users](/database/handling-files.md#files-on-records-of-other-users).
- Upload private, subscription and read-only records, like every user of the project.
- Fetch the list of newsletter subscribers. Admins in access groups `90` ~ `98` read those addresses **masked**, as `j**@**.com`, with an opaque `subscriber_token` beside each one to tell two rows apart, and the list pages as usual on a sealed cursor they hand back unchanged. Searching the list by e-mail address is not theirs: it belongs to the project owner, Skapi staff and access group `99`. See [Managing Newsletter Subscribers](/admin/newsletters.md) and [Newsletters, subscribers and notifications](/admin/permissions.md#newsletters-subscribers-and-notifications).
- Send notifications to users.
- Change the [subscription settings](/database/subscription.md#who-can-change-subscription-settings) of records uploaded by other users. Private records are excluded, and so are read-only records for admins below access group `99`. On records posted by anonymous users, settings can only be kept or turned off.

Admins in access group `99` can also:

- Read the subscriber list with the addresses **in full**, and search it by e-mail address.
- View the delivery statistics of sent newsletters: reads, bounces and complaints.
- Register, list and delete named newsletter groups.
- Subscribe or unsubscribe any e-mail address to a newsletter group.
- Update records uploaded by other users, including read-only records. Private records stay off limits.

## What Admins Cannot Do

Admins cannot perform the following actions:

- Read the data of other users' private records they have no access to.
- Change the data or settings of records uploaded by other users, apart from their subscription settings. Admins in access group `99` can, except private records.
- Attach files to, or delete files from, private records of other users.
- Give a user an access group higher than their own, when granting access, creating an account or sending an invitation.
- Change the access group of an admin in access group `99`, unless they are in access group `99` themselves.
- Act on an account whose access group is the same as their own or higher, unless they are in access group `99`: changing its access group, updating its profile, blocking or unblocking it, and deleting it are all refused with `No access to modify admin.` A [disabled](/user-account/disable-recover-account.md) account counts with the access group it had before it was disabled. See [The rank rule](/admin/permissions.md#the-rank-rule).
- Update their own account with [`updateUserAttributes()`](/api-reference/admin/README.md#updateuserattributes), admins in access group `99` and the project owner included. Every account updates its own profile with [`updateProfile()`](/api-reference/user/README.md#updateprofile) and no `user_id`, like any user.
- Mark a user's e-mail address verified. An address an admin sets is written unverified and the account loses its e-mail login until the user verifies the new address themselves. See [Login IDs](/admin/permissions.md#login-ids).
- Change a login `username`. It is permanent.
- In access groups `90` ~ `98`, read subscriber addresses in full. The subscriber list comes back masked, as `j**@**.com`, and a masked address cannot be mailed and is not unique, so rows are told apart by their `subscriber_token` instead.
- In access groups `90` ~ `98`, search the subscriber list by e-mail address. The search matches the stored address, so it would give the mask back one letter at a time, and it is refused with `No access.`
- Send newsletters or set e-mail templates, in **any** access group, `99` included. Only the project owner does, from the project's email address. See [Sending Newsletters](/email/newsletters.md).
- Change project settings, in **any** access group, `99` included.

Project settings are available only to the project owner's Skapi account, through the Skapi project pages, and to Skapi staff when you ask Skapi for help.
That covers the project name and CORS, Allow Signup, Allow Inquiries, Allow Anonymous Posts, Require Login, Freeze Database, the API key and the Secret Keys, the subdomain and the 404 page, the OpenID loggers, the sender e-mail address and the automated e-mail templates, and creating, disabling, enabling or deleting the project.
An admin request for any of them is refused with `INVALID_REQUEST` and `Only the project owner can change project settings.` Admins still upload and delete the files of a hosted site, and still manage users, records, invitations, newsletters and notifications. See [Project settings belong to the project owner](/admin/permissions.md#project-settings-belong-to-the-project-owner).

Admin methods are useful when building projects that require admin access to manage users and data.

:::danger
Admin methods are powerful and should be used with caution.
Admins can delete user accounts and data, which can cause irreversible damage to your application.
:::

## What Both Admins and Project Owners Cannot Do

- Change or view user account passwords. No method resets another account's password, for any role.
- Read private database data of other users without access to it. See [Private records](/admin/permissions.md#private-records).
- Read encrypted record data of other users without being given access.
- Change a login `username`, or mark another account's e-mail address verified.

:::info Encrypted records
[Encryption](/database/encryption.md) only ever covers the data of a private record, and the project owner and admins receive that data only where they have access to it. See [Private records](/admin/permissions.md#private-records).
An admin the record's uploader gives access to with [`grantPrivateRecordAccess()`](/api-reference/database/README.md#grantprivateaccess) receives the data and can decrypt it, because the grant wraps the record's key for them. A record reached through a reference arrives sealed, and opens only for the users its key was shared with.
Private access cannot be granted to the project owner at all: `Private access cannot be granted to service owners.`
:::

## What Project Owners Cannot Do

The project owner's Skapi account is not a user of the project, so it cannot:

- Upload records to the private access group.
- Give its own records subscription settings.
- Upload read-only records, or make an existing record read-only.

A record that already is private or read-only can still be updated under the usual rules.

The project owner can change the subscription settings of an existing record that belongs to a user of the project, unless the record is private. The record stays that user's.

The project owner's own records can never have subscription settings, whoever sends the request, admins included. A request that adds or turns one on is refused with `Records of the project owner cannot have subscription settings.` Settings that an older record of the project owner already has can be kept as they are or turned off.

Records posted by anonymous (signed-out) users do not belong to a user of the project either, so neither the project owner nor admins can give them subscription settings. A request that adds or turns one on is refused with `Anonymous records cannot have subscription settings.` Settings that such a record already has can be kept as they are or turned off.

::: tip
Apart from these, project owners can do everything that admins can do.
:::