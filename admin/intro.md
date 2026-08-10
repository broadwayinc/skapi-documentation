# Admin Features

Skapi provides a set of methods for managing your project.

These methods are available only to users with the `admin` role.

Project owners can grant the `admin` role to other users.

:::danger NOTE
Before using admin methods, create an admin user from your Skapi project Users page. Then use that account to access admin methods, or grant admin access to other users.
:::

## What Admins Can Do

Admins use high access groups (`90` ~ `99`) and can perform the following actions:

- Read database data in any access group.
- Delete user accounts.
- Update user account profiles.
- Invite users to the project.
- Create users in the project.
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
- Change project settings.

These actions are available only to the project owner through the Skapi project pages.

Admin methods are useful when building projects that require admin access to manage users and data.

:::danger
Admin methods are powerful and should be used with caution.
Admins can delete user accounts and data, which can cause irreversible damage to your application.
:::

## What Both Admins and Project Owners Cannot Do

- Change or view user account passwords.
- View private database data of other users.
- Upload private records to the database.
- Upload subscription records to the database.

## What Project Owners Cannot Do

- Upload read-only records to the database.

::: tip
Project owners can do everything that admins can do.
:::