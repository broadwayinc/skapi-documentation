# Table Information

Skapi tracks all tables in your database.
Use [`getTables()`](/api-reference/database/README.md#gettables) to retrieve table names, record counts, and table sizes.

You can fetch the full table list like this:

```js
skapi.getTables().then(response => {
    console.log(response); // List of all tables in the database
});
```

Called with no argument, or with an empty query object, [`getTables()`](/api-reference/database/README.md#gettables) returns **every** table in the project.
That is how you list everything: give no `table`, and give no `condition`.

### Who can read table information

When the project's [Require Login](/service-settings/service-settings.md#require-login) setting is on, [`getTables()`](/api-reference/database/README.md#gettables) is refused to a visitor who is not signed in.
The SDK throws `REQUIRE_LOGIN` before the request leaves the browser, and the backend refuses the same call with `INVALID_REQUEST`, so a direct API call or an older SDK with no gate is refused as well.
A project that has never set that option counts as **on**.

:::warning
Table metadata used to be served to anyone who knew the project ID.
An integration that lists tables without a signed in user now gets an error where it used to get a list. If a signed out page genuinely needs the listing, turn Require Login off in the project settings.
:::

Table **names** are never filtered: the response carries every table in the project, whatever access group the records inside it live in.
The per access group record counters are filtered to the caller:

| Counter | Who receives it |
| --- | --- |
| `number_of_records_in_access_group_public` | Everyone, signed in or not. |
| `number_of_records_in_access_group_authorized`, and every numbered group up to the caller's own | A signed in user, up to and including their own access group. |
| `number_of_records_in_access_group_private`, `number_of_records_in_access_group_admin` | Admins and the project owner. |

`number_of_records` and `size` are **not** filtered.
Both are totals over every access group in the table, so `number_of_records` is normally larger than the counters you can see add up to.

### Querying tables

To retrieve information for a specific table, pass an existing table name:

```js
skapi.getTables({
    table: 'my_collection',
}).then(response => {
    console.log(response.list);
    // [{
    //     table: 'my_collection';
    //     number_of_records: string;
    //     size: number;
    //     number_of_records_in_access_group_public?: number;
    //     number_of_records_in_access_group_private?: number;
    //     number_of_records_in_access_group_authorized?: number;
    //     number_of_records_in_access_group_admin?: number;
    //     number_of_records_in_access_group_xx?: number; // for other access groups
    // }]
})
```

No `condition` is given here, and an omitted `condition` is an **exact** match on the table name.
This returns the table named `my_collection` and nothing else.

You can also query table names using `condition`.

```js
skapi.getTables({
    table: 'C',
    condition: '>'
}).then(response => {
    console.log(response); // Table names starting from 'C'
})
```

In this example, `condition` is set to `>` and `table` is set to `C`.
This returns table names that come after `C` in lexicographic order, such as `Cc`, `D`, `E`, and `F`.

To fetch table names that start with a prefix, set `condition` to `>=`:

```js
skapi.getTables({
    table: 'my_',
    condition: '>='
}).then(response => {
    console.log(response); // Table names starting from 'my_' (for example, 'my_collection')
})
```

While you are exploring and do not know the exact spelling, pass `>=` rather than omitting `condition`.
It is a prefix search, so it also surfaces related entries: in real data a table name very often carries a leading name shared with the rest of its data set, such as a source or dataset prefix, so `my_collection` and `my_collection_archive` are only found together by the prefix.
An exact match finds one spelling and silently misses its siblings.
When you already know the exact name, omitting `condition` is the exact match you want.

So there are five ways the call can land:

- no argument, or an empty query object: every table in the project.
- `table` alone: an exact match on that name.
- `table` with `condition: '>='`: every table name starting with that value.
- `table` as an empty string: rejected with `"table" should not be empty.`
- `condition` with no `table`: rejected with `"table" is required for condition.`

```js
skapi.getTables({ table: '' });            // Error: "table" should not be empty.
skapi.getTables({ condition: '>=' });      // Error: "table" is required for condition.
```

Condition-based table search is useful when you need to check whether a table already exists before uploading data.

For more detailed information on all the parameters and options available with the [`getTables()`](/api-reference/database/README.md#gettables) method, 
please refer to the API Reference below:

### [`getTables(query, fetchOptions?): Promise<DatabaseResponse<Table>>`](/api-reference/database/README.md#gettables)
