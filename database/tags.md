
# Tags

Tags are additional metadata that can be associated with a record. They provide extra search criteria for more detailed queries, either on their own or in combination with indexes. Unlike indexes, tags cannot be queried with conditional operators.
The number of records is also tracked for each tag name.

To add tags to a record, you can use the `config.tags` parameter in the [`postRecord()`](/api-reference/database/README.md#postrecord) method.
This parameter accepts a string or an array of strings or string with comma separated values, allowing you to add multiple tags to a single record.

## Adding Tags to a Record

Here's an example of how to add tags to a record:

```js
let record = {
    title: "Dukkha",
    artist: "Asian Spice House",
    tracks: 7
};

let config = {
    table: {name: 'Albums', access_group: 'public'},
    index: {
        name: "year",
        value: 2023
    },
    tags: ['Indie', 'Experimental']
}

skapi.postRecord(record, config);
```

:::danger
Tag validation rules:

- Maximum length: 64 characters per tag
- Must not be empty
- Must not include control characters or sentinel `􏿿`
:::

## Querying Records by Tag

You can also utilize tags in your queries.

Example below lists albums released after 2020, that have the tag 'Experimental'.

```js
skapi.getRecords({
    table: {name: 'Albums', access_group: 'public'},
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
    table: {name: 'Albums', access_group: 'public'},
    tag: 'Experimental'
})

let indie = skapi.getRecords({
    table: {name: 'Albums', access_group: 'public'},
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

You can fetch all tags used in a table with [`getTags()`](/api-reference/database/README.md#gettags).

```js
skapi.getTags({
    table: 'MyTable'
}).then(response=>{
    console.log(response); // List of all tags in table named 'MyTable'
})
```

This call gives no `condition`, and that is what makes it a listing.
When only `table` is given, the omitted `condition` defaults to `>=`, a prefix search on the tag name, and with no `tag` to prefix it matches every tag in that table.

When **both** `table` and `tag` are given and `condition` is omitted, the default is an **exact** match on the tag instead.

Calling `getTags()` with no argument at all, or with an empty query object, returns every tag in the project, ordered by record count, descending.
That is the widest listing there is:

```js
skapi.getTags().then(response=>{
    console.log(response); // Every tag in the project, most used tag first
})
```

Given only a `tag` and no `table`, the same `>=` default runs across the whole project, so the call finds that tag in every table that uses it:

```js
skapi.getTags({
    tag: 'Experimental'
}).then(response=>{
    console.log(response); // The tag 'Experimental', in every table it appears in
})
```

So the combinations are:

- neither `table` nor `tag`: every tag in the project, ordered by record count, descending.
- `table` alone: every tag in that table.
- `tag` alone: that tag across all tables.
- `table` and `tag`: an exact match on that tag in that table.
- `table`, `tag` and `condition: '>='`: every tag in that table whose name starts with the value.
- `condition` with neither `table` nor `tag`: rejected with `"table" or "tag" is required for condition.`

```js
skapi.getTags({ condition: '>=' }); // Error: "table" or "tag" is required for condition.
```

For more detailed information on all the parameters and options available with the [`getTags()`](/api-reference/database/README.md#gettags) method, 
please refer to the API Reference below:

### [`getTags(query, fetchOptions?): Promise<DatabaseResponse<Tag>>`](/api-reference/database/README.md#gettags)

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

In this example, the condition property is set to `>`, and `tag` is set to `A`.  This query will return the tag names that come after tag 'A' in lexicographic order, such as 'Ab', 'B', 'C', 'D' and so on.

To list only the tags whose name **starts with** 'A', set `condition` to `>=`, which is a prefix search.

While you are exploring and do not know the exact spelling, pass `>=`.
Because it is a prefix search it surfaces related entries: in real data a tag very often carries a leading name shared with the rest of its data set, a series name for example, or an entity recorded once plainly and once with a parenthesised alias, such as a tag `Asian Spice House` and a tag `Asian Spice House (alias)`.
An exact match finds one spelling and silently misses its siblings, while the prefix finds the whole family.
When you already know the exact name, give both `table` and `tag` and omit `condition`: that is the exact match you want.
