
# Indexing

When uploading records, you can set additional configurations in the `index` property.
Indexing allows you to categorize and search for records based on specific criteria.
The `index` object consists of the index's `name`, used for indexing, and its corresponding `value`, which is searchable.

## Configuring Indexing for Records

For example, let's consider a table of music albums. You can create an index for the `name` "year" and its corresponding `value` as the release year. This can be set when uploading/updating a record.

This enables searching for music albums by release year when quering records.

```js
let album = {
    title: "Stardust",
    artist: "DIA",
    tracks: 10
};

let config = {
    table: "Albums",
    index: {
        name: "year",
        value: 2017
    }
};

skapi.postRecord(album, config);
```


## Querying with Index

Once indexed record is uploaded, you can fetch records based on the "year" in the "Albums" table.

```js
skapi.getRecords({
    table: "Albums",
    index: {
        name: "year",
        value: 2017
    }
}).then(response => {
    console.log(response.list); // List of albums released on year 2017.
});
```


## Querying Index with Conditions

You can broaden your search by using the `condition` parameter within the `index` parameter.

```js
skapi.getRecords({
    table: "Albums",
    index: {
        name: "year",
        value: 2010,
        condition: '>' // Greater than given value
    }
}).then(response => {
    console.log(response.list); // List of albums released after the year 2010.
});
```

The index value can be of type `number`, `string`, or `boolean`.

When the index value type is `number` or `boolean`, conditions work as they do with numbers.

When the index value type is `string`, `>` and `<` will search for strings that are higher or lower in the lexicographical order, respectively.
`>=` (more than or equal to) acts as a 'starts with' operation when searching for string values.

The `condition` parameter takes the following string values:

- `>`: Greater than the given value.
- `>=`: Greater or equal to the given value. When the value is `string`, it works as 'starts with' condition.
- `=`: Equal to the given value. (default)
- `<`: Lesser than the given value.
- `<=`: Lesser or equal to the given value.


:::warning
When querying an index with conditions, it will only return records with the same value type.

ex) '2' and 2 are different values.
:::


## Query Index with Range

In addition to conditions, you can also retrieve records based on a range of values in the index.
To do so, specify the `range` parameter in the `index` object within the [`getRecords()`](/api-reference/database/README.md#getrecords) method.

For example, consider the following scenario:

```js
skapi.getRecords({
    table: "Albums",
    index: {
        name: "year",
        value: 2015,
        range: 2020
    }
}).then(response => {
    console.log(response.list); // List of albums released from 2015 to 2020.
});
```

In the example above, the [`getRecords()`](/api-reference/database/README.md#getrecords) method will retrieve all records in the "Albums" table that have a "year" index value between 2015 and 2020 (inclusive).

:::warning
- When using the `range` parameter, the `value` and `range` parameter values should be same type of data.
- The `range` and `condition` parameter cannot be used simultaneously.
:::


## Query Index with Reserved Keywords

Skapi has reserved a few keywords to help with querying your records. 
The reserved keywords are:

- `$uploaded`: Fetches the timestamp(13 digits millisecond format) at which the record was created.
  
- `$updated`: Fetches the timestamp(13 digits millisecond format) at which the record was last updated.
  
- `$referenced_count`: Fetch by the number of records that are [referencing](/database/referencing.md) the record. This can be useful if you need a query like: 'Post that has the most comments'
  
- `$user_id`: Fetches list of record uploaded by given user ID.

With the exception of `$user_id`, all of these reserved keywords can be queried with `condition` and `range` just like any other index values. `$user_id` cannot be queried with condition or range.


## Querying Index with Reserved Keywords
For example, let's query records created after 2021:

```js
skapi.getRecords({
    table: "Albums",
    index: {
        name: '$uploaded',
        value: 1609459200000, // this timestamp is 2021 January 1,
        condition: '>'
    }
}).then(response => {
    console.log(response.list); // List of albums uploaded after 2021.
});
 
```

## Compound Index Names

When posting records, you can use compound index names to have more control over querying the records.
This makes it more flexible to search and retrieve records.

### Uploading a Record with a compound index name

In the example below, we are uploading a record with a compound index name:

```js
let album_data = {
    title: "Daepa calling",
    tracks: 5
};

skapi.postRecord(album_data, {
    table: 'Album',
    index: {
        name: 'Band.AsianSpiceHouse.year',
        value: 2023
    }
})
```

In this example, we have created a compound index name by joining the artist type, artist name, and "year" with a period.
The `value` of this index can only be searched when using the full index name (Band.AsianSpiceHouse.year).

### Querying child level compound index names

When compound index name is used, you can also query records by artist type(Band), artist name(AsianSpiceHouse), or release year(2023).

For example, you can query all albums performed by a **'Band'** using the following code:

```js
skapi.getRecords({
    table: 'Album',
    index: {
        name: 'Band.',
        value: '',
        condition: '>' // More than
    }
}).then(response=>{
    console.log(response.list); // All albums by "Band" type artists.
})
```

Notice `index.name` value includes a period at the end: **'Band.'**.

This allows you to query the child index name of the compound index name as a `string` value.
Since the `index.value` is an empty string and the condition is set to "more than",
this will retrieve all records where the index name begins with **'Band.'**.

The next example shows how you can query albums by artist name.

```js
skapi.getRecords({
    table: 'Album',
    index: {
        name: 'Band.',
        value: 'Asian',
        condition: '>=' // Starts with
    }
}).then(response=>{
    console.log(response.list); // All albums by "Band" with band name starting with 'Asian'
})
```

In this example, the `value` of the index is set to "Asian" and the `condition` is set to "more than or equal".
This allows you to query all artist names starting with "Asian" where the index `name` begins with "Band."


### Querying with full compound index name

Finally, you can query the band Asian Spice House albums by release year as follows:

```js
skapi.getRecords({
    table: 'Album',
    index: {
        name: 'Band.AsianSpiceHouse.year',
        value: 2010,
        condition: '>'
    }
}).then(response=>{
    console.log(response.list); // All albums by Asian Spice House released after 2010.
})
```

:::warning
When querying the child index names from the compound index, you need to specify the index respecting the hierarchy of the compound index name. 

From the example above, you cannot simply use **'Band.year'** as an index name to query by the year values.
You must provide the full **'Band.AsianSpiceHouse.year'** as an index name if you want to query the actual value of the index.
:::

## Fetching Index Information

### [`getIndexes(query, fetchOptions?): Promise<DatabaseResponse<Index>>`](/api-reference/database/README.md#getindex)

:::warning
User must be logged in to call this method
:::

Skapi tracks the index information in each table. You can fetch the index information using the [`getIndexes()`](/api-reference/database/README.md#getindex) method.

Index information is useful when you want to list all index names used in a table or find out the total number of the records indexed to that index name or average/total value of the index values.

The index information includes:

- `average_number`: The average of the number type values.
- `total_number`: The total sum of the number values.
- `number_count`: The total number of records with number as the index value.
- `average_bool`: The rate of true values for booleans.
- `total_bool`: The total number of true values for booleans.
- `bool_count`: The total number of records with boolean as the index value.
- `string_count`: The total number of records with string as the index value.
- `index_name`: The name of the index.


For example, let say we have a table called "VoteBoard" that lets user upload records with a compound index name such as "Vote.Beer".
The index value will be boolean.
```js
skapi.postRecord(null, {
    table: 'VoteBoard',
    index: {
        name: 'Vote.Beer',
        value: true // or false
    }
})
```

Then you can fetch information about the **"Vote.Beer"** index in the **"VoteBoard"** table to find out the rating of **"Vote.Beer"**.

```js
skapi.getIndexes({
    table: 'VoteBoard', // Table name is required
    index: 'Vote.Beer' // index name
}).then(response => {
    console.log(response.list[0]); // index information of "Vote.Beer"
});
```

### Querying index value

Suppose you want to list all the indexes in a table and order them in a specific order.
Maybe there is multiple indexes such as "Vote.Beer", "Vote.Wine", "Vote.Coffee" and so on.
And you may want to know the rating of each index and order them by the rating.
In that case, you can use the `order.by` parameter in the `query`.

Example below lists all indexes in the **"VoteBoard"** table ordered by `average_bool` from highest value:

```js
let config = {
    ascending: false
};

let query = {
    table: 'VoteBoard',
    index: 'Vote.',
    order: {
        by: 'average_bool'
    }
};

skapi.getIndexes(query, config).then(response => {
    console.log(response.list); // List of indexes ordered from high votes.
});
```

Note that in the `config` object, the `ascending` value is set to `false`.

So the list will be ordered in *descending* order from highest votes to lower votes.

:::warning
If the index name is a [compound index name](./#compound-index-names),
you can only order the values under the parent of the compound index name.
:::

For example, to list all indexes under "Vote." that has higher votes then 50% and order them by `average_bool`, you can do the following:

```js
let config = {
    ascending: false
};

let query = {
    table: 'VoteBoard',
    index: 'Vote.',
    order: {
        by: 'average_bool',
        value: 0.5,
        condition: '>'
    }
};

skapi.getIndexes(query, config).then(response => {
    console.log(response.list); // List of votes that rates higher then 50%, ordered from high votes.
});
```
