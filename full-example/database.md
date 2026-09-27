# Full Example: Database

The Database page is a photo gallery built on the Skapi database. Every post is a record with an image file, a description and tags, and the page shows how records are uploaded with files, queried in different orders and connected to each other. It needs a logged-in user.

<FullExampleDemo page="database.html" label="Open the Database demo" />

You need your [project ID](/full-example/intro.md#have-your-project-id-ready) to open the demo.

## What it demonstrates

| Feature | How the page does it |
| --- | --- |
| Uploading a post with a file | [postRecord()](/database/create.md) with the form's file input, the description and the tags, in the table `posts`. The upload progress is shown on the button. See [Handling Files](/database/handling-files.md). |
| Private posts | A checked "Private" box uploads the post to the access group `private`, so only its uploader can read it. See [Access Restrictions](/database/access-restrictions.md). |
| Listing posts | [getRecords()](/database/fetch.md) four at a time, newest first, with the `fetchMore` option behind the "Fetch more posts" button. |
| Most liked | A like is a record in the table `likes` that references the post, and the post was uploaded with `prevent_multiple_referencing`, so each user can like it once. The reference count orders the "Most liked" view through the reserved index `$referenced_count`. See [Referencing](/database/referencing.md). |
| Comments and "Most commented" | A comment is a record in the table `comments` with the compound index name `comment.<record_id>`, and [getIndexes()](/database/indexing.md) lists those index names ordered by their totals. |
| My posts, tags | The reserved index `$user_id` fetches the user's own posts, and a `tag` in the query fetches the posts with that tag. See [Tags](/database/tags.md). |
| Subscriptions and the feed | Subscribing to an uploader with [subscribe()](/database/subscription.md) puts their posts in the user's feed, fetched with `getFeed()`. |
| Deleting a post | [deleteRecords()](/database/delete-records.md) on the user's own posts. |
| Who posted | [getUsers()](/user-account/get-users.md) fetches the uploader's and each commenter's profile, cached so every user is fetched once. |

The view is chosen with the URL hash (`#mostliked`, `#mostcomment`, `#myposts`, `#myprivate`, `#feed`, `#tag=<tag>`), so each way of querying is a few lines in one function.

## Download

The page is part of the full template: [skapi-templates.zip](https://cdn.broadwayinc.com/temp/v2/skapi-templates.zip). See [Full Examples](/full-example/intro.md) for how to run it.
