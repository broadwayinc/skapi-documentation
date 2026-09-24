# Searching Users

:::warning
User must be logged in to call this method
:::


Users can search, retrieve information of other users in your project using the [`getUsers()`](/api-reference/user/README.md#getusers) method. By default, [`getUsers()`](/api-reference/user/README.md#getusers) will return all users chronologically from the most recent sign-up.

User information retrieved from the database is returned as a list of [UserPublic](/api-reference/data-types/README.md#userpublic) objects.

:::info
Any attribute that is not set to public will not be retrieved.
:::


```js
skapi.getUsers().then(u=>{
  console.log(u.list); // List of all users in your project, sorted by most recent sign-up date.
});
```

In the example above, the [`getUsers()`](/api-reference/user/README.md#getusers) method is called without any parameters.
This retrieves a list of all user profiles in your project.

For more detailed information on all the parameters and options available with the [`getUsers()`](/api-reference/user/README.md#getusers) method, 
please refer to the API Reference below:

### [`getUsers(params?, fetchOptions?): Promise<DatabaseResponse<UserPublic>>`](/api-reference/user/README.md#getusers)

## Searching users with conditions

Following examples shows how you can search users based on attributes such as name, timestamp (account created timestamp), birthdate... etc

#### Search for users whose name starts with 'Baksa'

```js
let params = {
  searchFor: 'name',
  condition: '>=', // >= means greater or equal to given value. But on string value, it works as 'starts with' condition.
  value: 'Baksa'
}

skapi.getUsers(params).then(u=>{
  console.log(u.list); // List of users whose name starts with 'Baksa'
});
```

#### Search for users who joined before 2023 Jan 1

```js
let timestampParams = {
  searchFor: 'timestamp',
  condition: '<', // Less than given value
  value: 1672498800000 //2023 Jan 1
}

skapi.getUsers(timestampParams).then(u=>{
  console.log(u.list); // List of users who joined before 2023 jan 1
});
```

#### Search for users whose birthday is between 1985 ~ 1990

```js
let birthdateParams = {
  searchFor: 'birthdate',
  value: '1985-01-01',
  range: '1990-12-31' // Queries range of value from given value to given range value.
}

skapi.getUsers(birthdateParams).then(u=>{
  console.log(u.list); // List of users whose birthday is between 1985 ~ 1990
});
```

#### Search for a single user whose `user_id` falls in a range

```js
let userIdParams = {
  searchFor: 'user_id',
  value: '00000000-0000-0000-0000-000000000000',
  range: 'ffffffff-ffff-ffff-ffff-ffffffffffff'
}

skapi.getUsers(userIdParams).then(u=>{
  console.log(u.list); // List of users whose user_id falls between the value and range
});
```

#### Fetch multiple users by their `user_id`

```js
let multipleIdParams = {
  searchFor: 'user_id',
  value: [
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111'
  ]
  // condition defaults to '=', and each id is looked up directly. This is not a range search.
}

skapi.getUsers(multipleIdParams).then(u=>{
  console.log(u.list); // The users matching either id, if they exist
});
```

#### Fetch multiple users by a list of e-mails

```js
let multipleEmailParams = {
  searchFor: 'email',
  value: ['alice@example.com', 'bob@example.com']
  // condition defaults to '=', and each e-mail is looked up directly. This is not a range search.
}

skapi.getUsers(multipleEmailParams).then(u=>{
  console.log(u.list); // The users matching either e-mail, if they exist and are public
});
```

The `searchFor` parameter specifies the attribute to search for, and the value parameter specifies the search value.

:::info
- Passing a `value` array (fetching several known values at once, e.g. several `user_id`s or `email`s) only works with the default `=` condition and does not accept `range`, whichever attribute you search for. It looks up each value directly instead of running a range query.
- Users cannot search for attributes that are not set to public.
:::

#### The following attributes can be used in `searchFor` to search for users:

- `user_id`: unique user identifier, string
- `email`: user's email address, string
- `phone_number`: user's phone number, string
- `name`: user's profile name, string
- `address`: user's physical address, string
- `gender`: user's gender, string
- `birthdate`: user's birthdate in "YYYY-MM-DD" format, string
- `locale`: the user's locale, a string representing the country code (e.g "US" for United States).
- `subscribers`: number of subscribers the user has, number
- `timestamp`: timestamp of user's sign-up, number(13 digit unix time)
- `approved`: search by account approval status


#### The `condition` parameter allows you to set the search condition.

- `>`: Greater than the given value.
- `>=`: Greater or equal to the given value. When the value is `string`, it works as 'starts with' condition.
- `=`: Equal to the given value. (default)
- `<`: Lesser than the given value.
- `<=`: Lesser or equal to the given value. On `email`, `phone_number`, `name`, `address`, `gender` and `locale`, it works as 'ends with' instead.

When searching for a `string` attribute, `>` and `<` will search for strings that are higher or lower in the lexicographical order, respectively. And `>=` operator works as 'start with' condition.

#### Search for users whose e-mail ends with '@company.com'

```js
let endsWithParams = {
  searchFor: 'email',
  condition: '<=',
  value: '@company.com'
}

skapi.getUsers(endsWithParams).then(u=>{
  console.log(u.list); // List of users whose e-mail ends with '@company.com'
});
```

:::info
`email`, `phone_number`, `name`, `address`, `gender` and `locale` are the only attributes that support the 'ends with' (`<=`) condition. It is served from a separate reverse-index that skapi keeps in sync with your user data, so it is as fast as any other condition search.
:::


:::tip What an admin sees
Admins (access groups `90` ~ `99`) and the project owner get more from the same call: the `email` of every account, whether or not the user made it public, its `email_verified` state, and the `misc` field, which is otherwise visible only to the account itself. `searchFor: 'email'` searches those addresses too, so an admin can find an account by an address that is not public. Everything else follows the rules above. See [What an admin can see about a user](/admin/permissions.md#what-an-admin-can-see-about-a-user).
:::


The `range` parameter enables searching for users based on a specific attribute value within a given range. For example, if searching by `timestamp` with a range of 1651748526 to 1651143726, only users created between the two timestamps will be returned. 

:::warning
The `range` parameter cannot be used with the `condition` parameter.
:::