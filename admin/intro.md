# Admin Features

Skapi provides a set of methods to manage your service.

These methods are only available to users with the `admin` role.

First you should create an admin user from your Skapi service user page and use that account to access the admin methods.

Admins have high access group level (99) and can perform the following actions:

- Read database data of high access group.
- Remove other users' data.
- Invite users to the service.
- Create users in the service.
- Grant access level to users.
- Block, unblock users from the service.
- Delete other users from the service.

These methods can be useful when you are building a service that requires admin access to manage users and data.