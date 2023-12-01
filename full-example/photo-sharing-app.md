# Full Example: Photo sharing application

These examples shows how you can use Skapi database to build photo sharing web page with just plain HTML and Javascript.

The user can upload a photo, comment, like the posts... etc.
User can also upload private photos using the database access group restrictions.

:::warning
Since these examples are extension of all the previous example: [Full Example: User Account Page](/user-account/full-example.md).

The files from the previous examples should all be present in the same directory.
:::

You can download the full project files via github: [https://github.com/broadwayinc/example-photoapp](https://github.com/broadwayinc/example-photoapp)

Also, checkout the hosted example: [https://photoshare.skapi.com](https://photoshare.skapi.com)

```
.
├─ bye.html
├─ change_password.html
├─ confirmation_required.html
├─ create_account.html
├─ forgot_password.html
├─ to_html.js
├─ index.html
├─ likes_comments.js
├─ login.html
├─ post.html
├─ user_account.html
└─ index.html
```

Below, are the modified/added files for this example:

- `index.html`: The main page where user can upload photos, search for other posts
- `to_html.js`: Script for converting record data to HTML elements
- `post.html`: Page displays the whole photo post. User can fetch more comments
- `likes_comments.js`: Script for handling user likes and comments
  
:::warning
Be sure to replace the 'service_id', 'owner_id' in `new Skapi()` on all example pages.
You can get your 'service_id' and 'owner_id' from your service dashboard.
:::

## index.html

This page is an extention of previous examples.

The `index.html` is the main page where user can:
- Upload a photo.
- View other user's post
- Search based on tags
- List by recent, likes, number of comments.


In this example we fetch only 8 posts per call. If the number of posts in the database is more than 8, 'Fetch More Photos' button will be displayed.

For comments, only 4 comments are fetched.
If the photo is clicked, `post.html` will open and user will be able to fetch more comments from that page.

To keep the `index.html` organized there is additional js scripts imported via script tag:
- `to_html.js`: Script for converting posted record data to HTML elements
- `likes_comments.js`: Script for handling user likes and comments


```html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<h1 id="welcome">Welcome #name</h1>
<p id="your_email">Your e-mail is: #email</p>

<a href='user_account.html'>User Account</a> |
<a href='change_password.html'>Change Password</a> |

<button id='verifyEmail' onclick='emailVerification()' hidden>Verify Your E-Mail</button>

<form style='display: inline-block;' onsubmit="skapi.logout(event)" action="login.html">
    <input type="submit" value="Logout">
</form>

<br><br>

<form onsubmit="postPhoto(event)">
    <fieldset>
        <legend>
            <h2>Upload Photo</h2>
        </legend>
        <input id='uploaderNameInput' name="uploaderName" hidden>
        <label><input type="file" name="photo" required></label><br><br>
        <label>
            Description:<br>
            <textarea rows=4 style="width:100%;box-sizing:border-box;resize:none;" name="description"></textarea>
        </label><br><br>
        <label>
            Tags:<br>
            <input id='tagsInput' pattern="[a-zA-Z0-9 ,]+" style="width:100%;box-sizing:border-box;"
                title="Only alphanumeric characters, spaces, and commas are allowed"
                placeholder="separate with a comma(,)">
        </label></label><br><br>
        <label><input id='privateCheckbox' type="checkbox"> Private</label><br><br>
        <input style='float: right;' type="submit">
    </fieldset>
</form><br>

<button onclick="
    listHeadH4.textContent = 'Latest';
    fetchQuery = {
        table: {
            name: 'photos',
            access_group: 'authorized'
        }
    };
    initialFetch();
"> Latest</button>

<button onclick="
    listHeadH4.textContent = 'Most Liked';
    fetchQuery = {
        table: {
            name: 'photos',
            access_group: 'authorized'
        },
        index: {
            name: '$referenced_count',
            value: 0,
            condition: '>'
        }
    };
    initialFetch();
">Show Most Liked</button>

<button onclick="
    listHeadH4.textContent = 'Most Commented';
    photoListDiv.innerHTML = '';
    showMorePhotoButton.setAttribute('hidden', '');

    // get comment indexes ordered by the number of number type values
    // index value was the timestamp of the comment uploaded time
    // We named the index 'comment.<record_id>' so that we can get the record_id from the index name

    skapi.getIndexes(
        {
            table: 'comments',
            index: 'comment.',
            order: {
                by: 'number_count',
                value: 0,
                condition: '>'
            }
        },
        {
            ascending: false
        }
    ).then(async data => {
        let promises = [];
        
        for(let i of data.list) {
            promises.push(skapi.getRecords({
                record_id: i.index.split('.')[1],
            }));
        }
        
        let posts = await Promise.all(promises);

        for(let post of posts) {
            photoListDiv.append(postToHtml(post.list[0]));
        }
    });
">Most Commented</button>

<button onclick="
    listHeadH4.textContent = 'My Likes';
    photoListDiv.innerHTML = '';
    showMorePhotoButton.setAttribute('hidden', '');

    // get liked posts
    // we can get liked record by getting the 'likes' table records by user_id
    // then we can fetch the liked posts by the reference.record_id

    skapi.getRecords(
        {
            table: 'likes',
            reference: user.user_id,
            // alternative way to get post by user_id
            // index: {
            //     name: '$user_id',
            //     value: user.user_id
            // }
        },
        {
            ascending: false
        }
    ).then(async data => {
        let promises = [];
        
        for(let i of data.list) {
            promises.push(skapi.getRecords({
                record_id: i.reference.record_id,
            }));
        }
        
        let posts = await Promise.all(promises);

        for(let post of posts) {
            photoListDiv.append(postToHtml(post.list[0]));
        }
    });
">My Likes</button>

<button onclick="
    listHeadH4.textContent = 'Private'
    fetchQuery = {
        table: {
            name: 'photos',
            access_group: 'private'
        },
        reference: user.user_id,
        // alternative way to get post by user_id
        // index: {
        //     name: '$user_id',
        //     value: user.user_id
        // }
    };
    initialFetch();
">Private</button>

<br><br>

<input id='tagsSearchInput' pattern="[a-zA-Z0-9 ,]+" placeholder='Tags, ...'><button onclick="searchTags()">Search Tags</button>

<h4 id="listHeadH4">Latest</h4>

<div id="photoListDiv">
    <!-- this is where we list the user's uploaded photos -->
</div>

<div style='text-align: center;'>
    <button id='showMorePhotoButton' hidden onclick="showMorePhoto()">Show More Photos</button>
</div>

<br><br><br><br>

<script src="likes_comments.js"></script>
<script src="to_html.js"></script>
<script>
    const skapi = new Skapi('service_id', 'owner_id', { autoLogin: true });
    let user = null;

    skapi.getProfile().then(u => {
        user = u;

        if (user === null) {
            // user is not logged in!
            // redirect to login page.
            return window.location.replace("login.html");
        }

        // welcome text
        welcome.textContent = welcome.textContent.replace('#name', user.name || '');

        // display user's email
        your_email.textContent = your_email.textContent.replace('#email', user.email);

        if (user?.email_verified) {
            // add verified badge
            your_email.textContent = your_email.textContent + ' [Verified]';
        }
        else {
            // show 'Verify Your E-Mail' button
            verifyEmail.removeAttribute('hidden');
        }

        // add uploader's name as a hidden input value to the post photo form
        uploaderNameInput.value = user.name;
    });

    async function emailVerification() {
        // Sends verification code to user's E-Mail
        try {
            await skapi.verifyEmail();
            let code = prompt('Enter the verification code sent to your e-mail');
            if (code !== null) {
                // Verify code
                await skapi.verifyEmail({ code });
                window.alert('Your E-Mail is verified!');
            }
        }
        catch (err) {
            window.alert(err.message);
            throw err;
        }
    }

    async function postPhoto(event) {
        let config = {
            table: {
                name: 'photos',
                access_group: privateCheckbox.checked ? 'private' : 'authorized'
            },
            reference: {
                allow_multiple_reference: false // restrict 1 'like' per user
            }
        };

        if (tagsInput.value) {
            // split tags by ','
            // 'tag1, tag2' results to: ['tag1', 'tag2', ...]
            config.tags = tagsInput.value.split(',').map(t => t.trim());
        }

        let post = await skapi.postRecord(event, config);

        if (
            !privateCheckbox.checked && listHeadH4.textContent === 'Latest' ||
            privateCheckbox.checked && listHeadH4.textContent === 'Private'
        ) {
            let postHtml = postToHtml(post); // converts record to html. refer: to_html.js
            photoListDiv.prepend(postHtml);
        }

        event.target.reset();
    }

    // get uploaded photos (initial fetch)

    let fetchQuery = {
        table: {
            name: 'photos',
            access_group: 'authorized'
        }
    };

    function initialFetch() {
        // make sure photoListDiv is empty
        photoListDiv.innerHTML = '';
        showMorePhotoButton.setAttribute('hidden', '');

        skapi.getRecords(
            fetchQuery,
            {
                ascending: false,
                fetchMore: false,
                limit: 4
            }
        ).then(data => {
            if (!data.endOfList) {
                // show 'Show More Photos' button
                showMorePhotoButton.removeAttribute('hidden');
            }
            for (let post of data.list) {
                photoListDiv.append(postToHtml(post));
            }
        });
    }

    initialFetch();

    function showMorePhoto() {
        // get more uploaded photos (paginated fetch)
        skapi.getRecords(
            fetchQuery,
            {
                ascending: false,
                fetchMore: true,
                limit: 4
            }
        ).then(data => {
            if (data.endOfList) {
                showMorePhotoButton.setAttribute('hidden', '');
            }
            for (let post of data.list) {
                photoListDiv.append(postToHtml(post));
            }
        });
    }

    async function searchTags() {
        // search multiple OR tags

        let promises = [];

        tagsSearchInput.value.split(',').forEach(tag => {
            promises.push(skapi.getRecords({
                table: {
                    name: 'photos',
                    access_group: 'authorized'
                },
                tag: tag.trim()
            }));
        });

        photoListDiv.innerHTML = '';
        showMorePhotoButton.setAttribute('hidden', '');
        let tagSearchResult = await Promise.all(promises);
        
        listHeadH4.textContent = 'Tags Search Result';

        let taggedRecordId = [];

        for (let tag of tagSearchResult) {
            for (let post of tag.list) {
                if (post.record_id in taggedRecordId) {
                    continue;
                }
                photoListDiv.append(postToHtml(post));
            }
        }
    }
</script>
```

## to_html.js

The function `postToHtml()` generates HTML elements for photo posts fetched from the database.

The script generates each image endpoints and attach the url to the img element. Additional database is called for comments, and likes.

The script will attach unique id to the HTML elements.
The id will contain the posts `record_id` string fetched from the database.
With those id, we can target the posts when modifing the contents via javascript.

```js
function postToHtml(p) {
    // generate photo html from fetched posted data, fetch additional comment, like data

    let html = `
        <div style='padding:.5rem'>
            <a href='post.html?rid=${p.record_id}'>    
                <img style='width: 100%;' id='${p.record_id}-Img'>
            </a>
            <br>
            <pre style='margin: 0;display: inline-block;vertical-align: middle;'>Liked: <span id='${p.record_id}-likeCount'>${p.reference.referenced_count}</span></pre>
            <button id='${p.record_id}-likeButton' style='float:right' onclick='like("${p.record_id}")'>...</button>
            <p style='font-weight:bold'>${p.data.uploaderName}</p>
            ${new Date(p.updated).toLocaleString()}
            <p>${p.data?.description || '&nbsp;'}</p>
            Tags: ${(p.tags || []).join(', ')}
        </div>
        <div style='padding:.5rem;margin-bottom: 1rem;'>
            <a href='post.html?rid=${p.record_id}'>Comments (<span id='${p.record_id}-commentCount'>0</span>)</a><br><br>
            <form style='display:flex;flex-wrap:wrap;' onsubmit='addComment(event, "${p.record_id}");'>
                <input name='name' hidden value='${user.name}'>
                <input style='flex-grow:1;' name='comment' placeholder='Write Comment'>
                <input type='submit'>
            </form>
            <div id='${p.record_id}-commentSection'></div>
        </div>`;
    
    // get the image endpoint, set the img src attribute.
    p.bin.photo[0].getFile('endpoint').then(url => {
        window[`${p.record_id}-Img`].src = url;
    });

    // get users like
    skapi.getRecords({
        table: 'likes',
        index: {
            name: '$user_id',
            value: user.user_id
        },
        reference: p.record_id
    }).then(l => {
        if (l.list.length) {
            myLikes[p.record_id] = l.list[0].record_id;
            window[`${p.record_id}-likeButton`].textContent = 'LIKED';
        }
        else {
            window[`${p.record_id}-likeButton`].textContent = 'LIKE';
        }
    });

    // get recent 4 comments.
    fetchComments(p.record_id); // refer: likes_comments.js

    // get comment count
    skapi.getIndexes({
        table: 'comments',
        index: 'comment.' + p.record_id
    }).then(commentInfo => {
        let count = 0;
        if (commentInfo.list.length) {
            count = commentInfo.list[0].number_of_records;
        }

        window[`${p.record_id}-commentCount`].innerHTML = count;
    });

    // create div and return
    let div = document.createElement('div');
    div.style.backgroundColor = 'ivory';
    div.innerHTML = html;

    return div;
}
```

## post.html

This page is displayed when user clicks the post photo.

4 comments are fetched per call. If there is more comments to fetch, 'Show More Comments' button will be displayed.

```html
<!DOCTYPE html>
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<br>
<a href="index.html">Go Back</a>
<br><br>
<div id="uploaded_photos">
    <!-- this is where we list the user's uploaded photos -->
</div>
<div style='text-align: center;'>
    <button id='showMoreCommentButton' hidden onclick="showMoreComment()">Show More Comments</button>
</div>

<br><br><br><br>

<script src="likes_comments.js"></script>
<script src="to_html.js"></script>

<script>
    const skapi = new Skapi('service_id', 'owner_id', { autoLogin: true });
    let params = new URLSearchParams(window.location.search);
    let record_id = params.get("rid");
    let user = null;

    skapi.getProfile().then(u => {
        user = u;
    });

    // get post
    skapi.getRecords({ record_id }).then(data => {
        uploaded_photos.append(postToHtml(data.list[0]));
    });

    function showMoreComment() {
        // get recent 4 comments (initial fetch)
        skapi.getRecords({
            table: {
                name: 'comments',
                access_group: "authorized"
            },
            index: {
                name: 'comment.' + record_id,
                value: 0,
                condition: '>'
            }
        }, {
            ascending: false,
            limit: 4,
            fetchMore: true
        }).then(c => {
            if (c.endOfList) {
                showMoreCommentButton.setAttribute('hidden', '');
            }
            for (let comment of c.list) {
                window[`${record_id}-commentSection`].append(commentPostToHtml(comment));
            }
        });
    }
</script>
```

## likes_comments.js

This script handles likes and comments.

The like records are referenced record. In which is capable of restricting individuals to single likes per post.
In order to toggle like/unliked status, the users liked post is tracked in the local variable.

The comments are using compound index names, so the database can track the number of comments on the post.


```js
async function fetchComments(record_id) {
    // get recent 4 comments (initial fetch)
    let c = await skapi.getRecords(
        {
            table: {
                name: 'comments',
                access_group: "authorized"
            },
            index: {
                name: 'comment.' + record_id,
                value: 0,
                condition: '>'
            }
        },
        {
            ascending: false,
            limit: 4
        }
    );

    if (!c.endOfList) {
        let showMoreButton = document.getElementById('showMoreCommentButton');
        if (showMoreButton) {
            showMoreButton.removeAttribute('hidden', '');
        }
    }

    for (let comment of c.list) {
        window[`${record_id}-commentSection`].append(commentPostToHtml(comment));
    }
}

async function addComment(event, record_id) {
    // post comment, append html in comment section
    let comment = await skapi.postRecord(event, {
        table: {
            name: "comments",
            access_group: "authorized"
        },
        index: {
            name: "comment." + record_id,
            value: Math.floor(Date.now() / 1000)
        }
    });

    event.target.reset();
    let commentBox = window[`${record_id}-commentSection`];
    commentBox.prepend(commentPostToHtml(comment));

    let currentCommentCount = parseInt(window[`${record_id}-commentCount`].innerHTML) || 0;
    window[`${record_id}-commentCount`].innerHTML = currentCommentCount + 1;

}

function commentPostToHtml(c) {
    // generate comment html from fetched comment data
    let comment = document.createElement('div');
    comment.innerHTML = `
            <pre style='white-space:pre-line;'>
                <span style='font-weight:bold'>${c.data.name}</span>
                ${c.data.comment}
                <span style='float:right;font-size: .8em'>${new Date(c.updated).toLocaleString()}</span>
            </pre>`;
    return comment;
}

// saves users 'like' status for each posts, so we can add/remove the like record.
let myLikes = {
    // ['liked record id']: 'like record id'
};

function like(record_id) {
    let likedButton = window[`${record_id}-likeButton`];
    let likeId = myLikes?.[record_id];
    if (likeId) {
        delete myLikes[record_id];
        skapi.deleteRecords({ record_id: likeId }).then(rec => {
            delete myLikes[record_id];
            let like_span = window[`${record_id}-likeCount`];
            let like_count = parseInt(like_span.textContent);
            like_span.innerHTML = (like_count - 1).toString();
            likedButton.textContent = 'LIKE';
        });
    }
    else {
        skapi.postRecord(null, {
            table: 'likes',
            reference: {
                record_id: record_id
            }
        }).then(rec => {
            let like_span = window[`${record_id}-likeCount`];
            let like_count = parseInt(like_span.textContent);
            like_span.innerHTML = (like_count + 1).toString();
            likedButton.textContent = 'LIKED';
            myLikes[record_id] = rec.record_id;
        });
    }
}
```