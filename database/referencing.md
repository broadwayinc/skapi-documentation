# Referencing

Users can reference another record when uploading a new record.
When records are referenced, users can retrieve records based on the one being referenced.
This feature is useful for building a discussion board where users can post comments linked to the original post.

Referencing has several powerful features that allow you to build complex data structures.

The source of the reference record can also choose to have authority to remove the referenced records owned by other users, give access to private records, and set restrictions on referencing.

To reference a record, you'll need to specify the `record_id` or `unique_id` of the record you want to reference in the `reference` parameter in the `config` object.

:::tip
You can easily build a discussion board similar to Reddit by chaining the references.
:::

## Uploading a Record to be Referenced

First lets upload a record to be referenced.

```js
let data = {
    post: "What do you think of this post?"
};

let config = {
    unique_id: 'unique id of the post',
    table: 'Posts'
};

let referenced_record_id;

skapi.postRecord(data, config).then(response => {
    // The original post has been uploaded. Now, users can upload another record that references it.
    referenced_record_id = response.record_id;  // Record ID of the record to be referenced.
});
```

## Creating a Referencing Record

Note that we have uploaded a record to be referenced,
we can use the record's `record_id` in `reference.record_id` when uploading a comment record.

```js
let commentRecord = {
    comment: "I like it!"
};

let commentConfig = {
    table: 'Comments',
    reference: { record_id: referenced_record_id }
};

skapi.postRecord(commentRecord, commentConfig);
```

## Fetching References

Now you can query all the records that references the original record by passing the record ID in the `reference` parameter in [`getRecords()`](/api-reference/database/README.md#getrecords) method.:

```js
skapi.getRecords({
    table: 'Comments',
    reference: referenced_record_id,
}).then(response => {
    console.log(response.list);  // Array of comments of the reference record.
});
```

:::tip
A user cannot reference a record with a higher access group or 'private' access.
However, if the uploader has granted the user access to the record, the user will be able to reference it.
:::

:::danger
Users who have access granted to a record will also have access to all other private/higher access group records that is referenced.
To avoid unintended sharing of private records, do not permit users to upload a private record that references another record.
:::

## Creating a Referencing Record with Unique ID

When uploading a record, you can also reference the record using the unique ID.

```js
skapi.postRecord({
    comment: "I like it!"
}, {
    table: 'Comments',
    reference: { unique_id: 'unique id of the post' }
});
```


## Fetching References with Unique ID

If the reference record has a unique ID setup, you can also fetch records based on the unique ID of the record being referenced.

```js
skapi.getRecords({
    table: 'Comments',
    reference: 'unique id of the post'
}).then(response => {
    console.log(response.list);  // Array of records in 'Comments' table referencing the record with the unique ID.
});
```

More on unique ID can be found [here](/database/unique-id.md).


## Using reference to fetch certain user's post

You can also query all the records posted by certain user giving a `user_id` as a value of `reference` parameter.

```js
skapi.getRecords({
    table: 'Comments',
    reference: 'user-id-whose-post-you-want'
}).then(response => {
    console.log(response.list);  // Array of records in 'Comments' table posted by a certain user
});
```


## Removing a reference

To remove a reference, set the the `reference.record_id` parameter to `null` when updating the record.

```js
skapi.postRecord(undefined, {
    record_id: 'record_id_of_the_comment_to_remove',
    reference: { record_id: null }
}).then(record => {
    console.log(record);  // The reference has been removed.
});
```

## Reference settings in [`postRecord()`](/api-reference/database/README.md#postrecord)

When uploading record via [`postRecord()`](/api-reference/database/README.md#postrecord), you can set restrictions on referencing from other records using additional parameters in `reference`.

- `reference.reference_limit`: Allowed maximum number of times that other records can reference the uploading record.
  If this parameter is set to `null`, the number of references is unlimited. The default value is `null`.
  Set `reference_limit` to `0` to prevent others to reference the uploading record.

- `reference.allow_multiple_reference`: If set to `false`, others will be allowed to reference this record only once.
  This is useful for building a voting system where users are allowed to vote only once.
  If set to `true`, a user will be able to post a record referencing this record multiple times.
  The default value is `true`.

- `reference.can_remove_reference`: If set to `true`, the owner of the record can remove the referenced records.
  When the owner removes the record, all the referenced records will be removed as well.
  The default value is `false`.

- `reference.index_restrictions`: You can set list of restrictions on the index values of the referencing record.
  This is useful when you want to restrict the referencing record to have certain index names and values.


## Index Restrictions

You can set restrictions on the index values of the referencing record.
This is useful when you want to restrict the referencing record to have certain index values.
For example, you can set the index value range so the total rating value does not exceed a certain value.

Example below shows how you can build a review board where only 10 people are allowed to rate 1 to 5 and each user can only rate once.

```js
let pollPost = skapi.postRecord({
    title: `How would you rate DIA's album "Stardust"?`,
    description: "Only 10 people are allowed to vote"
}, {
    unique_id: 'review board for DIA album Stardust',
    table: 'ReviewBoard',
    reference: {
        allow_multiple_reference: false,
        reference_limit: 10,
        index_restrictions: [
            {
                name: 'Review.Album.Stardust',
                value: 1,
                range: 5
            }
        ]
    }
})
```

As shown in the example above, the `index_restrictions` parameter is an array of objects that contains the following properties:

- `name`: The name of the index value. (required)
- `value`: The value of the index. (optional)
- `range`: The range of the index value. (optional)
- `condition`: The condition of the index value. (optional)

You can set many index restrictions by adding more objects to the array.

When the index restriction is set, the referencing record must have the same index name with same typed value and within the specified range.

If all optional parameters not set, the referencing record must have the same index name.

If `value` is set, the referencing record must have the same index name with the same value.

If `range` is set, the referencing record must have the same index name with the value within the specified range.

If `condition` is set, the referencing record must have the same index name with the index value that satisfies the condition to the `value`. `condition` can be one of the following: `=`, `!=`, `>`, `<`, `>=`, `<=`. `condition` cannot be used with `range`.

## Creating a Poll with Restricted Referencing

Now people can post a review by referencing the **pollPost**:

```js
// Now only 10 people can post references for this record
skapi.postRecord({
    comment: "This rocks! I'd give 4.5 out of 5!"
}, {
    table: 'ReviewBoard',
    reference: { unique_id: 'review board for DIA album Stardust' },
    index: {
        name: 'Review.Album.Stardust',
        value: 4.5
    }
});
```

Note that the "Review.Album.Stardust" `index` uses a `value` of type `number` so you can later retrieve the average rating and total sum of the values.

