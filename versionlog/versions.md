# Version History

## Current version: 1.1.6

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