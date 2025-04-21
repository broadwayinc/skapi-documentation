# Admin Features

Skapi provides a set of methods to manage your service.

These methods are only available to users with the `admin` role.

First you should create an admin user from your Skapi service user page and use that account to access the admin methods or even grant admin access to other users.

## What Admins Can Do

Admins have high access group level (99) and can perform the following actions:

- Read database data of any access group.
- Delete user's account.
- Update user's account profile.
- Invite users to the service.
- Create users in the service.
- Assign higher access group to users.
- Remove private record access from users.
- Block, unblock users from the service.
- Delete any record, including private and read-only records.
- Send newsletters to newsletter subscribers.
- Send notification to users.

## What Admins Cannot Do

Admins cannot perform the following actions:

- View private data of other users.
- Edit database item uploaded by other users.
- Change service settings.

These above are only available to the service owner from the Skapi service pages.

Admin methods can be useful when you are building a service that requires admin access to manage users and data.

:::danger
Admin methods are powerful and should be used with caution.
Admins have the ability to delete user accounts and data which can cause irreversible damage to your application.
:::

## What Both Admins and Service Owners Cannot Do

- Change or view user account's password.
- View private database data of other users.