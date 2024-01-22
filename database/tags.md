
# Tags

Tags are additional information that can be associated with a record. They provide additional search criteria to perform more detailed queries, either on their own or in combination with indexes. Unlike indexes, tags cannot be queried with conditional operators.

To add tags to a record, you can use the `config.tags` parameter in the [`postRecord()`](/api-reference/database/README.md#postrecord) method.
This parameter accepts a string or an array of strings or string with comma separated values, allowing you to add multiple tags to a single record.

## Adding Tags to a Record

Here's an example of how to add tags to a record:

```js
let record = {
    title: "Daepa calling",
    artist: "Asian Spice House",
    tracks: 5
};

let config = {
    table: "Albums",
    index: {
        name: "year",
        value: 2023
    },
    tags: ['Indie', 'Experimental']
}

skapi.postRecord(record, config);
```

## Querying Records by Tag

You can also utilize tags in your queries.

Example below lists albums released after 2020, that have the tag 'Experimental'.

```js
skapi.getRecords({
    table: "Albums",
    index: {
        name: "year",
        value: 2020,
        condition: '>'
    },
    tag: 'Experimental'
}).then(response=>{
    // List of albums released after 2020, that have the tag 'Experimental'.
    console.log(response.list);
});
```

:::tip
To query multiple tags simultaneously, you can make multiple API calls and await them all at once in Javascript Promise.all().
Then you may sort the data as you wish.

Following Example below shows fetching albums with the tag 'Experimental' OR 'Indie'
:::

```js
let experimental = skapi.getRecords({
    table: "Albums",
    tag: 'Experimental'
})

let indie = skapi.getRecords({
    table: "Albums",
    tag: 'Indie'
});

Promise.all([experimental, indie]).then(res=>{
    let experimental = res[0].list;
    let indie = res[1].list;

    let or_list = {};
    for(let r of experimental) or_list[r.record_id] = r;
    for(let r of indie) or_list[r.record_id] = r;

    // 'Experimental' OR 'Indie' in { [record_id]: record } format.
    console.log(or_list);
})
```

## Fetching Tag Information

### [`getTags(query, fetchOptions?): Promise<DatabaseResponse<Tag>>`](/api-reference/database/README.md#gettags)

:::warning
User must be logged in to call this method
:::

You can fetch all tags used in a table with [`getTags()`](/api-reference/database/README.md#gettags).

```js
skapi.getTags({
    table: 'MyTable'
}).then(response=>{
    console.log(response); // List of all tags in table named 'MyTable'
})
```

### Querying tags

You can also query tags that meets the `condition`.

```js
skapi.getTags({
    table: 'MyTable',
    tag: 'A',
    condition: '>'
}).then(response=>{
    console.log(response); // List of all tags starting from 'A' in table named 'MyTable'
})
```

In this example, the condition property is set to `>`, and `table` is set to `A`.  This query will return the table names that come after table 'A' in lexographic order, such as 'Ab', 'B', 'C', 'D' and so on.
