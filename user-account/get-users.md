# Search Users

:::warning
User must be logged in to call this method
:::


Users can search, retrieve information of other users in your service using the [`getUsers()`](/api-reference/user/README.md#getusers) method. By default, [`getUsers()`](/api-reference/user/README.md#getusers) will return all users chronologically from the most recent sign-up.

User information retrieved from the database is returned as a list of [UserPublic](/api-reference/data-types/README.md#userpublic) objects.

:::info
Any attribute that is not set to public will not be retrieved.
:::


```js
skapi.getUsers().then(u=>{
  console.log(u.list); // List of all users in your service, sorted by most recent sign-up date.
});
```

In the example above, the [`getUsers()`](/api-reference/user/README.md#getusers) method is called without any parameters.
This retrieves a list of all user profiles in your service.

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

The `searchFor` parameter specifies the attribute to search for, and the value parameter specifies the search value.

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


#### The `condition` parameter allows you to set the search condition.

- `>`: Greater than the given value.
- `>=`: Greater or equal to the given value. When the value is `string`, it works as 'starts with' condition.
- `=`: Equal to the given value. (default)
- `<`: Lesser than the given value.
- `<=`: Lesser or equal to the given value.

When searching for a `string` attribute, `>` and `<` will search for strings that are higher or lower in the lexicographical order, respectively. And `>=` operator works as 'start with' condition.

:::info
- Conditional query does not work on `user_id`, `email`, `phone_number`. It must be searched with the '=' condition.
- Users cannot search for attributes that are not set to public.
:::


The `range` parameter enables searching for users based on a specific attribute value within a given range. For example, if searching by `timestamp` with a range of 1651748526 to 1651143726, only users created between the two timestamps will be returned. 

:::warning
The `range` parameter cannot be used with the `condition` parameter.
:::