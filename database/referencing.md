# Referencing

Users can reference another record when uploading a new record.
When records are referenced, users can retrieve records based on the one being referenced.
This feature is useful for building a discussion board where users can post comments linked to the original post.

Referencing has several powerful features that allow you to build complex data structures.

The source of the reference record can also choose to have authority to remove the referenced records owned by other users, have access to private records, and set restrictions on referencing.

To reference a record, you'll need to specify the `record_id` of the record you want to reference in the `reference` parameter in the `config` object.

## Uploading a Record to be Referenced and Creating a Referencing Record

First lets upload a record to be referenced.

```js
let data = {
    post: "What do you think of this post?"
};

let config = {
    table: 'Posts'
};

let referenced_record_id;

skapi.postRecord(data, config).then(response => {
    // The original post has been uploaded. Now, users can upload another record that references it.
    let referenced_record_id = response.record_id;  // Record ID of the record to be referenced.
});
```

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
A user cannot reference a record with 'private' access. 
However, if the uploader has granted the user access to the record, the user will be able to reference it.
:::

:::danger
Users who have access to a private record will also have access to all other private records that is referenced.
To avoid unintended sharing of private records, do not permit users to upload a private record that references another private record.
:::

## Using reference parameter to fetch certain user's post

You can also query all the records posted by certain user giving a `user_id` as a value of `reference` parameter.

```js
skapi.getRecords({
    table: 'Comments',
    reference: 'user_id_whose_post_you_want'
}).then(response => {
    console.log(response.list);  // Array of records in 'Comments' table posted by a certain user
});
```

:::tip
You can easily build a discussion board similar to Reddit by chaining the references.
:::


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

## Reference settings

When uploading records, you can set restrictions on referencing from other records using additional parameters in `reference`.

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

## Creating a Poll with Restricted Referencing

Example below shows how you can build a poll where only 10 people are allowed to vote and each user can only vote once.

```js
let pollPost = skapi.postRecord({
    title: "Should we have a beer fridge in our office?",
    description: "Only 10 people are allowed to vote"
}, {
    table: 'PollBoard',
    reference: {
        allow_multiple_reference: false,
        reference_limit: 10
    }
})
```

Now people can vote by posting a record referencing the **pollPost**:

```js
// Now only 10 people can post references for this record
skapi.postRecord({
    comment: "Yes, we should!"
}, {
    table: 'VoteBoard',
    reference: { record_id: pollPost.record_id },
    index: {
        name: 'Vote.Beer',
        value: true
    }
});
```

Note that the "Vote.Beer" `index` uses a `value` of type `boolean` so you can later calculate the average vote value.

