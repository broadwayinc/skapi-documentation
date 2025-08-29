# Version History

**Current version: 1.0.262**

- Corrected the casing of the resolved string returned by [`resendSignupConfirmation()`](/api-reference/authentication/README.md#resendsignupconfirmation) to: `"SUCCESS: Signup confirmation e-mail has been sent."`

- During class initialization, if the constructor arguments are set to `"service_id"` and `"owner_id"`, a browser alert displays: `Replace "service_id" and "owner_id" with your actual Service ID and Owner ID.`

**1.0.260:**

- Service admin user invitations are now supported. [Learn more](https://docs.skapi.com/admin/invite.html)
- Custom unique ID features have been added to the database. [Learn more](https://docs.skapi.com/database/unique-id.html)
- Database referencing now offers index restriction controls, enabling fine-grained data ownership management. [Learn more](https://docs.skapi.com/database/referencing.html#referencing-index-restrictions)
- The database subscription feature is now available. [Learn more](https://docs.skapi.com/database/subscription.html)
- [WebRTC](https://docs.skapi.com/realtime/webRTC.html) and [Web notification](https://docs.skapi.com/notification/send-notifications.html) are now available, making it easy to build video chat and notification features for your application.
- Fixed various minor bugs.