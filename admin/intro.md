# Admin Features

Skapi provides a set of methods for managing your service.

These methods are available only to users with the `admin` role.

Service owners can grant the `admin` role to other users.

:::danger NOTE
Before using admin methods, create an admin user from your Skapi service Users page. Then use that account to access admin methods, or grant admin access to other users.
:::

## What Admins Can Do

Admins use high access groups (`90` ~ `99`) and can perform the following actions:

- Read database data in any access group.
- Delete user accounts.
- Update user account profiles.
- Invite users to the service.
- Create users in the service.
- Assign higher access groups to users.
- Remove private record access from users.
- Block or unblock users.
- Delete any record, including private and read-only records.
- Send newsletters to newsletter subscribers.
- Send notifications to users.

## What Admins Cannot Do

Admins cannot perform the following actions:

- View private data of other users.
- Edit database records uploaded by other users.
- Change service settings.

These actions are available only to the service owner through the Skapi service pages.

Admin methods are useful when building services that require admin access to manage users and data.

:::danger
Admin methods are powerful and should be used with caution.
Admins can delete user accounts and data, which can cause irreversible damage to your application.
:::

## What Both Admins and Service Owners Cannot Do

- Change or view user account passwords.
- View private database data of other users.
- Upload private records to the database.
- Upload subscription records to the database.

## What Service Owners Cannot Do

- Upload read-only records to the database.

::: tip
Service owners can do everything that admins can do.
:::