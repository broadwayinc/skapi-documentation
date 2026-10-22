# Full Example: Database

A photo sharing application is the database example on purpose: it is the best way to show what the Skapi database can do, because one real-world app exercises the whole capability at once. Posts are records with a photo file attached, a private post lives in its own access group, a like is a reference from one record to another, a comment hangs on a compound index, tags and reserved indexes drive every view, and subscriptions feed one user's posts to another. Everything on the page is a few lines of `skapi-js` and nothing else. It needs a logged-in user.

<FullExampleDemo page="database.html" label="Open the Database demo" />

You need your [project ID](/full-example/intro.md#have-your-project-id-ready) to open the demo.

![The Database page of the template: an explanation of the gallery, the Post a photo form with a file input, a description, tags and a Private post checkbox, and the Posts section below](/screenshots/template-database.webp)

*`database.html`. The form uploads a post with its photo; the Posts section lists them four at a time.*

![The Post a photo form with a photo chosen and previewed, a description, tags and the Private post checkbox](/screenshots/template-database-post.webp)

*Posting. The chosen photo is previewed before the upload; `postRecord()` takes the form as it is, file included, and shows the upload progress on the button.*

![The Most recent view: its heading, the filter links, then the newest post with its photo, uploader, time, description, tags, like count and comments](/screenshots/template-database-posts.webp)

*The posts, newest first. The heading names the view that is showing, and the links beside it switch between the views. Each post is one record: the photo from its file, the description and tags from its data, the uploader looked up once with `getUsers()`.*

![One post in detail: an Unsubscribe button beside the uploader, one like with the Unlike button, and two comments under the comment form](/screenshots/template-database-detail.webp)

*A post after a like and two comments. The like is a record referencing the post, the comments are records on the index `comment.<record_id>`, and their counts come from the reference count and the index.*

![The Most liked view: only the post that has a like](/screenshots/template-database-mostliked.webp)

*Most liked: the posts ordered by the reserved index `$referenced_count`, the number of records referencing them.*

![The My private posts view: the uploader's private post, which no other user can read](/screenshots/template-database-private.webp)

*My private posts: the same query in the access group `private`. Nobody else can fetch these records.*

![The Feed view: the posts of the uploader the user subscribed to](/screenshots/template-database-feed.webp)

*The feed after subscribing to an uploader: their posts, fetched with `getFeed()`.*

![The posts with the tag bread, reached from a tag link](/screenshots/template-database-tag.webp)

*A tag view: clicking a tag under a post fetches every post carrying it.*

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

The view is chosen with the URL hash (`#mostliked`, `#mostcomment`, `#myposts`, `#myprivate`, `#feed`, `#tag=<tag>`), so each way of querying is a few lines in one function, and the section heading names the view that is showing.

## Download

The page is part of the full template: [skapi-templates.zip](https://cdn.broadwayinc.com/temp/v3/skapi-templates.zip). See [Full Examples](/full-example/intro.md) for how to run it.
