# Referencing

Users can reference another record when uploading a new record.

When records are referenced, users can retrieve records based on the one being referenced.

This feature is useful for building a discussion board similar to Reddit, comment section, rating board, tracking purchased items, like buttons etc.

To reference a record, you'll need to specify the `record_id` or `unique_id` of the record you want to reference in the `reference` parameter in the `config` object.

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
we can use the uploaded record's ID in `reference` when uploading a comment record.

```js
let commentRecord = {
    comment: "I like it!"
};

let commentConfig = {
    table: 'Comments',
    reference: referenced_record_id
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
However, if the uploader has granted the private access of the record to the user, the user will be able to reference it.
:::

:::danger
Users who have private access granted to a record will also have access to all other private/higher access group records that is referenced.
To avoid unintended sharing of private records, do not permit users to upload a private record that references another record.
:::

## Creating a Referencing Record with Unique ID

When uploading a record, you can also reference the record using the unique ID.

```js
skapi.postRecord({
    comment: "I like it!"
}, {
    table: 'Comments',
    reference: 'unique id of the post'
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

To remove a reference, set the the `reference` parameter to `null` when updating the record.

```js
skapi.postRecord(undefined, {
    record_id: 'record_id_of_the_comment_to_remove',
    reference: null
}).then(record => {
    console.log(record);  // The reference has been removed.
});
```

## Reference source settings in [`postRecord()`](/api-reference/database/README.md#postrecord)

When uploading record via [`postRecord()`](/api-reference/database/README.md#postrecord), you can set restrictions on referencing from other records using additional parameters in `source`.

- `source.referencing_limit`: Allowed maximum number of times that other records can reference the uploading record.
  This is useful if you are building ticketing system where only a certain number of people purchase a ticket.
  If this parameter is set to `null`, the number of references is unlimited. The default value is `null`.
  Set `referencing_limit` to `0` to prevent others to reference the uploading record.

- `source.prevent_multiple_referencing`: If set to `true`, single user will be allowed to reference this record only once.
  This is useful for building a voting system where each users are allowed to vote only once.

- `source.can_remove_referencing_records`: If set to `true`, the owner of the record has an authority to remove the referencing records.
  When the owner removes the record, all the referenceing records will be removed.
  This can be useful when you want to build a discussion board where the owner can remove the comments.
  The default value is `false`.

- `source.only_granted_can_reference`: When set to `true`, only the user who has granted private access to the record can reference this record.

- `source.referencing_index_restrictions`: You can set list of restrictions on the index values of the referencing record.
  This is useful when you want to restrict the referencing record to have certain index names and values.
  This only affects referencing records that has an index.


## Referencing Index Restrictions

You can set restrictions on the index values of the referencing record.
This is useful when you want to restrict the referencing record to have certain index values.
This only affects referencing records that has an index.

For example, you can set the index value range so the total rating value does not exceed a certain value.

Example below shows how you can build a review board where only **10** people are allowed to rate **1** to **5** and each user can only rate once.

It is important to set restrictions on index values for cases like rating systems where you want to prevent users from posting malicious data to mess up your index informations.

```js
let pollPost = skapi.postRecord({
    title: `How would you rate Stan Getz, João Gilberto's album "Getz/Gilberto"?`,
    description: "Only 10 people are allowed to vote"
}, {
    unique_id: 'Review board of GetzGilberto',
    table: 'ReviewBoard',
    source: {
        prevent_multiple_referencing: true,
        referencing_limit: 10,
        referencing_index_restrictions: [
            {
                name: 'Review.Album.GetzGilberto',
                value: 1,
                range: 5
            }
        ]
    }
})
```

As shown in the example above, the `referencing_index_restrictions` parameter is an array of objects that contains the following properties:

- `name`: The name of the index value. (required)
- `value`: The value of the index. (optional)
- `range`: The range of the index value. (optional)
- `condition`: The condition of the index value. (optional)

You can set many index restrictions by adding more objects to the array.

When the index restriction is set, the referencing record must have the same index name with same typed value and within the specified range.

If all optional parameters not set, the referencing record must have the same index name.

If `value` is set, the referencing record must have the same index name with the same value.

If `range` is set, the referencing record must have the same index name with the value within the specified range.

If `condition` is set, the referencing record must have the same index name with the index value that satisfies the condition to the `value`.
For example, if you want your referencing record's index value to be less than **5**, you can set the parameter as shown below:

```js
let pollPost = skapi.postRecord({
    title: `How would you rate Stan Getz, João Gilberto's album "Getz/Gilberto"?`,
    description: "Only 10 people are allowed to vote"
}, {
    unique_id: 'Review board of GetzGilberto',
    table: 'ReviewBoard',
    source: {
        prevent_multiple_referencing: true,
        referencing_limit: 10,
        referencing_index_restrictions: [
            {
                name: 'Review.Album.GetzGilberto',
                value: 5,
                condition: '<'
            }
        ]
    }
})
```

`condition` can be one of the following: `=`, `!=`, `>`, `<`, `>=`, `<=`.

`condition` cannot be used with `range`.


## Creating a Poll with Restricted Referencing

Now people can post a review by referencing the **pollPost**:

```js
// Now only 10 people can post references for this record
skapi.postRecord({
    comment: "This rocks! I'd give 4.5 out of 5!"
}, {
    table: 'ReviewBoard',
    reference: 'Review board of GetzGilberto',
    index: {
        name: 'Review.Album.GetzGilberto',
        value: 4.5
    }
});
```

Note that the "Review.Album.GetzGilberto" `index` uses a `value` of type `number` so you can later retrieve the average rating and total sum of the values.


## Powerful Ways to Use Reference Records

1. Discussion board
   
   The owner of the reference record has all access to the referencing records.
   
   Meaning, the user who uploaded the source of the reference record can have authority to delete the referencing records owned by other users, have access to all access levels referencing records including private records.

   This is useful when you want to build a discussion board where the owner can remove the comments, let users post private comments to reference owner.
   
2. Rating/voting system
   
   You can set restrictions on the number of times a record can be referenced, prevent multiple referencing for each users, and restrict the index values of the referencing record.

   While Skapi database works as schema-less in nature, you can use this characteristic to have more control over how your users can post data to your service.

3. Sharing private data between limited users
   
   If the reference record has a private access group, only the users who have access to the reference record can access the referencing records.
