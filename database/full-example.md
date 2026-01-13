# Skapi HTML Database Full Example

This is a HTML example for building photo uploading application using Skapi's database features.

This example demonstrates complex database examples such as:

-   Posting an image file and description
-   Post as a private data
-   Posting comments
-   Like button
-   List post in order of most liked, most recent, most commented
-   Seach post via hashtag
-   Fetching more data (Pagination)
-   Subscribing to users and fetching subscription feeds

...All in a single HTML file - **welcome.html**

Users must login to post and fetch uploaded photos.

## Recommended VSCode Extention

For HTML projects we often tend to use element.innerHTML.

So we recommend installing innerHTML string highlighting extention like one below:

[es6-string-html](https://marketplace.visualstudio.com/items/?itemName=Tobermory.es6-string-html)

## Download

Download the full project [Here](https://github.com/alsdk9879/skapi-database-html-template/archive/refs/heads/main.zip)

Or visit our [Github page](https://github.com/alsdk9879/skapi-database-html-template)

## How To Run

Download the project, unzip, and open the `index.html`.

### Remote Server

For hosting on remote server, install package:

```
npm i
```

Then run:

```
npm run dev
```

The application will be hosted on port `3300`

:::danger Important!

Replace the `SERVICE_ID` value to your own service in `service.js`

<!-- Currently the service is running on **Trial Mode**. -->

<!-- **All the user data will be deleted every 14 days.** -->

You can get your own service ID from [Skapi](https://www.skapi.com)

:::

## Example

Below is part of the repository code. You can see how it handles complex database examples.

Since this is a portion of the complete repository code and doesn't include supporting files like `service.js`, direct copy and paste will not work.

**welcome.html**

```html
<!DOCTYPE html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script src="service.js"></script>
<link rel="stylesheet" href="main.css" />

<main>
    <h1>Login Success</h1>
    <p id="WelcomeMessage"></p>
    <a href="logout.html">Logout</a>

    <script>
        /*
            Get user profile and display it on the page,
            Set user variable to use it later.
        */
        let user = skapi.getProfile().then(u => {
            if (u) {
                let welcomeMessage = document.getElementById("WelcomeMessage");
                if (welcomeMessage) {
                    welcomeMessage.innerHTML = `Welcome, ${u.name || u.email || u.user_id}!`;
                }
            }
            return u;
        });

        /*
            The following function disableForm() is for disabling the form while the user is submitting.
            It can be useful if you want to prevent the user from editing the form while it's uploading.
            You will see this function being used in the form submission thoughout the project.
        */
        function disableForm(form, disabled) {
            form.querySelectorAll('input').forEach(input => {
                input.disabled = disabled;
            });
            form.querySelectorAll('textarea').forEach(textarea => {
                textarea.disabled = disabled;
            });
            form.querySelectorAll('a').forEach(a => {
                return disabled ? a.setAttribute('disabled', '') : a.removeAttribute('disabled');
            });
        }
    </script>

    <br>
    <br>

    <!--
        Following <section> will allow the user to upload a post.
        When the user clicks the "Update" button, we will call the skapi.postRecord() function.
        skapi.postRecord() function will upload the image and description, tags to the database.
        When successful, it will prepend the post to the top of the page.
        When unsuccessful, it will show an alert with the error message.
    -->
    <section style="padding: 20px 0;">
        <script>
            function postPhoto(form, event) {
                disableForm(form, true);
                postButton.value = '0%';

                // Following params object will be passed to the skapi.postRecord() method.
                let params = {
                    table: {
                        name: 'posts',
                        access_group: input_private.checked ? 'private' : 'authorized', // Depending on the checkbox, we will set the access_group to private or authorized.
                        subscription: {
                            upload_to_feed: true // We will upload the post to the feed so subscribed users can also fetch all the posts from all the users they subscribed at once.
                        }
                    },
                    source: {
                        allow_multiple_reference: false // For each posts, we will allow posting only one reference per user. This will allow us to restrict users to like only once per post.
                    },
                    progress: p => {
                        // When the file is uploading, we will set the value of the postButton to the progress percentage.
                        // The p object will have the status of the upload, the current file, and the progress percentage.
                        if (p.status === 'upload' && p.currentFile) {
                            postButton.value = `${Math.floor(p.progress)}%`;
                        }
                    },
                    tags: input_tags.value || null
                }

                // Following code will upload the post to the database.
                skapi.postRecord(event, params).then(async r => {
                    // If the section_posts was initially empty, we will set it to empty string.
                    if (section_posts.innerHTML === 'No posts found.') {
                        section_posts.innerHTML = '';
                    }

                    /*
                        When the post is successful, we will prepend the post to the top of the page.
                        We will call createArticleContent() function that we will declare later.
                    */
                    section_posts.prepend(await createArticleContent(r));

                    // We will reset the form and set the image preview to empty.
                    img_preview.src = '';
                    form.reset();

                })
                    .catch(err => alert(err.message))
                    .finally(() => {
                        // Finally, we will set the value of the postButton to 'Update' and enable the form.
                        postButton.value = 'Post';
                        disableForm(form, false);
                    });
            }
        </script>
        <style>
            /*
                Following class will make the element clickable.
            */
            .clickable {
                cursor: pointer;
                color: blue;
            }

            .clickable:active {
                color: purple;
            }

            /*
                Following will style the image element.
                When the user clicks on the image preview, it will open the file input.
                If the user does not select a file, it will show "Choose Image" text.
            */
            img {
                width: 100%;
            }

            #img_preview[src=""]::before {
                content: '[Click to Select Photo]';
                font-weight: bold;
                color: #007bff;
                text-decoration: underline;
            }
        </style>
        <form onsubmit="postPhoto(this, event)">
            <h1>Post Photo</h1>
            <label for='input_fileInput' class="clickable">
                <img id='img_preview' src="">
            </label>

            <br><br>

            <small>Description (required)</small><br>
            <input name="description" placeholder="Describe the picture." required></input>

            <small>Tags (optional)</small><br>
            <input id='input_tags' pattern="[a-zA-Z0-9 ,]+"
                title="Only alphanumeric characters, spaces, and commas are allowed"
                placeholder="tag1, tag2, ..."></input>

            <br>

            <small>
                <label>
                    <input id="input_private" type="checkbox" name="private" value="private"> Make This Post Private
                </label>
            </small>

            <br><br>

            <input id='input_fileInput' type="file" name="pic" accept="image/*" hidden required>
            <input id='postButton' type="submit" value="Post">

            <style>
                /*
                        Following <style> will disable the submit button when the file input is empty.
                    */
                #input_fileInput:invalid+input[type=submit] {
                    pointer-events: none;
                    opacity: 0.5;
                }
            </style>

            <!--
                    Following <script> will preview the image file that the user will upload.
                    When the user selects a file, it will read the file and set the src attribute of the image tag to the data url(base64) of the file.
                -->
            <script>
                input_fileInput.onchange = function () {
                    let file = this.files[0];
                    if (!file) {
                        img_preview.src = '';
                        return;
                    }

                    let reader = new FileReader();
                    reader.onload = function () {
                        img_preview.src = reader.result;
                    };
                    reader.readAsDataURL(file);
                };
            </script>
        </form>
    </section>

    <!--
        Following <nav> will allow the user to filter the posts.
        When the user clicks the "Most Recent" link, it will show the most recent posts.
        When the user clicks the "Most Liked" link, it will show the most liked posts.
        When the user clicks the "Most Comment" link, it will show the most commented posts.
        When the user clicks the "My Posts" link, it will show the posts that the user has uploaded.
        When the user clicks the "My Private" link, it will show the posts that the user has uploaded and set to private.
        We will use the hash(#) in the url to identify how the posts should be fetched.
    -->
    <br><br>

    <nav style="text-align: center;">
        <a href="welcome.html">Most Recent</a>
        |
        <a href="#mostliked">Most Liked</a>
        |
        <a href="#mostcomment">Most Comment</a>
        |
        <a href="#myposts">My Posts</a>
        |
        <a href="#myprivate">My Private Posts</a>
        |
        <a href="#feed">Feed</a>

        <style>
            nav>a {
                display: inline-block;
            }
        </style>
    </nav>

    <br>

    <!--
        Following <section> will show the posts.
    -->
    <section id="section_posts" style="text-align: center;"></section>

    <br>

    <div style='text-align: center'>
        <!--
            Following <button> will allow the user to fetch more posts.
            If there are more posts to fetch, it will enable the button.
            When the user clicks the button, it will call the getPosts() function.
            We will declare the getPosts() function and onclick event later.
        -->
        <button id="fetchMoreButton" disabled>Fetch More Posts</button>
    </div>
    <br>
    <br>
    <br>
    <br>

    <style>
        /*
            #section_posts is the <section> tag that will show the posts.
            It will be empty when the page loads.
            Following css will allow us to show the loading message while the posts are being fetched.
        */
        #section_posts:empty::before {
            content: 'Fetching posts...';
            display: block;
        }

        article {
            text-align: left;
            border: solid;
            vertical-align: top;
            width: 100%;
            margin: 8px auto;
            padding: 8px;
            box-sizing: border-box;
        }

        /*
            Following css will style the LIKE button.
            data-like attribute will show the like status of the post.
            When the user clicks the LIKE button, it will change the data-like attribute to '❤️' or '🩶'.
        */
        article .like::before {
            content: attr(data-like);
        }


        /*
            Following css will style the Subscribe button.
            data-subscribe attribute will show the subscribtion status of the user.
            When the user clicks the Subscribe button, it will change the data-subscribe attribute value to 'Subscribe' or 'Subscribed'.
            The color and font-weight will change based on the value of the data-subscribe attribute.
        */
        article .subscribe::before {
            content: attr(data-subscribe);
        }

        article .subscribe[data-subscribe='Subscribe']::before {
            color: #007bff;
            font-weight: bold;
        }

        article .subscribe[data-subscribe='Subscribed']::before {
            color: #28a745;
            font-weight: bold;
        }
    </style>
</main>
<script>
    /*
        Following variable fetchQuery will be later set and used as a parameter for getRecords().
    */
    let fetchQuery = {
        // table: {
        //     name: 'posts',
        //     access_group: 'authorized' || 'private'
        // }
    };

    /*
        Following variable subscription_list will be used to store the subscription status of the user.
    */
    let subscription_list = {
        // user_id: subscription object // if the user is not subscribed value is false
    }

    /*
        Following variable likeId will be used to store the users likeed record_id.
        We will use this to save the users like status.
        This way we can show the user if they have liked the post or not, and also save unnecessary API calls.
    */
    let likeId = {};

    /*
        Following variable userInfo will be used to store the fetched user information of the post uploader.
        We will use this to save unnecessary API calls.
    */
    let userInfo = {};

    /*
        Following function will fetch the user information of the uploader.
    */
    async function getUserInfo(user_id) {
        // If the user information is not fetched, we will fetch the user information by the user_id.
        if (!userInfo[user_id]) {
            let user = await skapi.getUsers({
                searchFor: 'user_id',
                value: user_id
            });

            if (user.list.length === 0) {
                return {
                    email: 'User not found',
                    name: 'User not found',
                    picture: ''
                };
            }

            userInfo[user_id] = user.list[0];
        }

        return userInfo[user_id];
    }

    /*
        Following function will fetch posts from the database.
    */
    async function getPosts(fetchMore = true) {
        // While the user is trying to fetch posts, we will disable the fetchMore button.
        fetchMoreButton.disabled = true;

        /*
            In skapi.getRecords() method, we are passing the fetchQuery variable that we have declared above.
            In the second argument we are setting the fetch option to fetch 4 posts per call.
            The ascending is set to false so that we can get the most recent posts, or the most liked posts, most commented posts depending on the query.
            When the ascending is set to false, Skapi database fetches the records in descending order.
            The fetchMore option will allow us to fetch more posts when the user clicks the fetchMore button.
        */
        let posts = await skapi.getRecords(fetchQuery, { ascending: false, limit: 4, fetchMore });

        /*
            When fetchMore is false, it means the user will be fetching the posts from the start.
            When the user is trying to fetch post from the start, we should clear the #section_posts.
            If there are no posts, we will show "No posts found." message.
        */
        if (!fetchMore) {
            section_posts.innerHTML = '';
            if (posts.list.length === 0) {
                section_posts.innerHTML = 'No posts found.';
                return;
            }
        }

        /*
            When there is post, it will show the posts by creating the html elements and appending them to the #section_posts.
            The createArticleContent() function will create the html elements, and we will declare it later.
        */
        let articles = await Promise.all(posts.list.map(p => createArticleContent(p)))
        for (let articleEl of articles) {
            section_posts.appendChild(articleEl);
        }

        /*
            When there are no more posts to fetch, we will disable the fetchMore button.
            posts.endOfList will be true when there are no more posts to fetch.
            When there are more posts to fetch, it will enable the fetchMore button.
            We will also set the onclick event of the fetchMore button to call the getPosts() function.
            The reason we are setting the onclick event manually is
            because there is a case where the user may want to fetch post ordered by most commented,
            which we may have to call getMostCommentedPost() function instead. (we will write a script for this later)
        */
        fetchMoreButton.disabled = posts.endOfList;
        fetchMoreButton.onclick = () => getPosts();
    }

    async function getFeed(fetchMore = true) {
        // While the user is trying to fetch posts, we will disable the fetchMore button.
        fetchMoreButton.disabled = true;

        let posts = await skapi.getFeed({
            access_group: 'authorized',
        }, { ascending: false, limit: 4, fetchMore });

        if (!fetchMore) {
            section_posts.innerHTML = '';
            if (posts.list.length === 0) {
                section_posts.innerHTML = 'No posts found.';
                return;
            }
        }

        let articles = await Promise.all(posts.list.map(p => createArticleContent(p)))
        for (let articleEl of articles) {
            section_posts.appendChild(articleEl);
        }

        fetchMoreButton.disabled = posts.endOfList;
        fetchMoreButton.onclick = () => getFeed();
    }

    /*
        Following function will create the html elements for the post.
    */
    async function createArticleContent(p) {
        // p is the post object.

        /*
            Following code will get the user id of the logged in user.
            The user variable is declared on the <script> tag above where we check if the user is logged in.
            The user variable is a promise that will resolve to the user information.
        */
        let logged_user_id = (await user).user_id;

        let record_id = p.record_id;
        let uploader = await getUserInfo(p.user_id); // get user information of the post uploader

        /*
            Following variable html will compose the html string for the post.
            Notice that we are using the record_id of the post as the part of the element ID in various places.
            Will use these element id to identify the element later.

            If you are using VSCode, you can use the following extension to get syntax highlighting for html strings.
            https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html
        */
        let html = /*html*/`

            <span style='font-weight:bold'>${uploader.name}</span>

            <!--
                Following <strong> tag will allow the user to subscribe to the uploader.
                When the user clicks the <strong> element, it will call the subscribe() function.
                We will declare the subscribe() function later.
            -->
            <strong
                class='clickable subscribe strong_subs-${p.user_id}'
                onclick='subscribe(this, "${p.user_id}")'
                data-subscribe=''>
            </strong>

            <!--
                Following <button> will allow the user to delete the post.
                When the user clicks the <button>, it will show a confirmation dialog.
                If the user confirms, it will delete the post from the database.
                This will not show if the post is not uploaded by the uploader.
            -->
            <button
                style='float:right; width:auto; margin:0; margin-bottom:10px;'
                onclick='
                    let del = confirm("Would you like to remove this post?");
                    if(del) {
                    this.closest("article").remove();
                    if(!section_posts.innerHTML) {
                        section_posts.innerHTML = "No posts found.";
                    }
                    skapi.deleteRecords({record_id: "${record_id}"});
                }'
                ${logged_user_id !== p.user_id ? "hidden" : ""}>Delete Post
            </button>

            <br>

            <small>Posted: ${new Date(p.updated).toLocaleString()}</small>

            <br>

            <!--
                Following <img> will show the image of the post.
                All the files uploaded to the database are stored in the bin.
                The endpoint of the image is in bin.pic[0].url.
            -->
            <img src='${p.bin.pic[0].url}'>

            <br>

            <small>Liked: <span id="span_likedCount-${p.record_id}">${p.referenced_count}</span></small>

            <!--
                Following <strong> tag will allow the user to like the post.
                When the user clicks the <strong> element, it will call the like() function.
                We will declare the like() function later.
            -->
            <strong
                class='clickable like'
                style='float:right'
                id='strong_like-${p.record_id}'
                onclick='like("${p.record_id}")'
                data-like=''>
            </strong>

            <!--
                Following <p> will show the description of the post.
            -->
            <p>
                ${p.data?.description}
            </p>

            <!--
                Following <small> will show the tags of the post.
                When the user clicks the tag, it will redirect the user to the welcome.html page with the tag in the hash.
            -->
            <small>${p.tags ? 'Tags: ' + p.tags.map(t => `<a href='welcome.html#tag=${t}'>${t}</a>`).join(', ') : ''}</small>

            <!--
                Following <small> will show the comment count of the post.
                We will later fetch the comment count and set the textContent of the <span> tag.
            -->
            <small>Comments (<span id='span_commentCount-${p.record_id}'>0</span>)</small>

            <br><br>

            <!--
                Following <form> will allow the user to add a comment to the post.
                When the user submits the form, it will call the addComment() function.
                We will declare the addComment() function later.
            -->
            <form onsubmit='addComment(event, "${p.record_id}");' style='display:flex; flex-wrap:wrap; gap:8px; max-width:100%'>
                <input name='comment' placeholder='Write Comment' style="width: 0; flex-grow:9;">
                <input type='submit' style="width: unset; flex-grow:1;">
            </form>

            <!--
                Following <div> will show the comments of the post.
                We will later fetch the comments and append the <div> to the <div> tag.
            -->
            <div id='div_commentSection-${p.record_id}'></div>

            <!--
                Following <small> will allow the user to fetch more comments.
                When the user clicks the <small> element, it will call the getComments() function.
                We will declare the getComments() function later.
            -->
            <small
                style="text-align:right"
                class='clickable'
                id='small_moreComments-${p.record_id}'
                onclick='getComments("${p.record_id}", true).then(c=>{
                    for (let div of c.commentDivs) {
                        document.getElementById("div_commentSection-" + "${record_id}").appendChild(div);
                    }
                    document.getElementById("small_moreComments-${record_id}").style.display = c.endOfList ? "none" : "block";})'
                >Show More Comments</small>`;

        if (subscription_list.hasOwnProperty(p.user_id)) {
            let subbed = subscription_list[p.user_id];
            if (subbed) {
                html = html.replace("data-subscribe=''", 'data-subscribe="Subscribed"');
            } else {
                html = html.replace("data-subscribe=''", 'data-subscribe="Subscribe"');
            }
        }

        else if (p.user_id !== logged_user_id) {
            if(subscription_list[p.user_id]) {
                html = html.replace("data-subscribe=''", 'data-subscribe="Subscribed"');
            } else {
                if(subscription_list.hasOwnProperty(p.user_id)) {
                    html = html.replace("data-subscribe=''", 'data-subscribe="Subscribe"');
                }
                else {
                    skapi.getSubscriptions({
                        subscriber: logged_user_id,
                        subscription: p.user_id
                    }).then((response) => {
                        if (response.list.length) {
                            subscription_list[p.user_id] = response.list[0];
                            Array.from(document.querySelectorAll(`.strong_subs-${p.user_id}`)).forEach(el => { el.setAttribute('data-subscribe', 'Subscribed') });
                        } else {
                            subscription_list[p.user_id] = false;
                            Array.from(document.querySelectorAll(`.strong_subs-${p.user_id}`)).forEach(el => { el.setAttribute('data-subscribe', 'Subscribe') });
                        }
                    });
                }
            }
        }

        /*
            Following code will create the <article> tag and set the innerHTML to the html string we have composed above.
            We will also set the id of the <article> tag to the record_id of the post.
            We will use this id to identify the post.
        */
        let article = document.createElement('article');
        article.innerHTML = html;
        article.id = record_id;

        /*
            Following function getComments() will fetch the comments of the post and return the html elements.
            When resolved We will append the comments to the article element.
            We will declare the getComments() function later.
        */
        getComments(record_id).then(c => {
            for (let div of c.commentDivs) {
                article.querySelector(`#div_commentSection-${record_id}`).appendChild(div);
            }
            article.querySelector(`#small_moreComments-${record_id}`).style.display = c.endOfList ? 'none' : 'block';
        });

        /*
            Following code will fetch the comment count of the post and set the textContent of the <span> tag.
            Since indexed values and record counts are tracked, we are using skapi.getIndexes() method to get the comment count.
        */
        skapi.getIndexes({
            table: 'comments',
            index: 'comment.' + record_id
        }).then(commentInfo => {
            if (commentInfo.list.length) {
                let count = commentInfo.list[0].number_of_records;
                if (count) {
                    let commentCount = article.querySelector('#span_commentCount-' + record_id)
                    commentCount.innerHTML = count;
                }
            }
        });

        /*
            Following code will fetch the like status of the post and set the textContent of the <strong> tag.
            The likes will be stored in the reference of the post.
            We will use the skapi.getRecords() method to get the like status.
        */
        skapi.getRecords({
            table: { name: 'likes', access_group: 'public' },
            index: {
                name: '$user_id',
                value: logged_user_id
            },
            reference: record_id
        }).then(myLike => {
            if (myLike.list.length) {
                likeId[record_id] = myLike.list[0].record_id;
            }
            let likeButton = article.querySelector(`#strong_like-${record_id}`);
            likeButton.textContent = '';
            likeButton.setAttribute('data-like', myLike.list.length ? '❤️' : '🩶');
        });

        return article;
    }

    /*
        Following function getComments() will fetch the comments of the post and return the html elements.
        When resolved, we are appending the comments to the article element above.
        We are using the skapi.getRecords() method to get the comments.
        The comments are uploaded using compond index names. (ex: comment.1234)
    */
    async function getComments(record_id, fetchMore = false) {
        // get recent 4 comments (initial fetch)
        let comments = await skapi.getRecords(
            {
                table: {
                    name: 'comments',
                    access_group: "authorized"
                },
                index: {
                    name: 'comment.' + record_id,
                    value: true
                }
            },
            {
                ascending: false,
                limit: 4,
                fetchMore
            }
        );

        let commentDivs = [];
        for (let c of comments.list) {
            let div = document.createElement('div');
            let commenter = await getUserInfo(c.user_id);

            let commentHtml = /*html*/ `
                <small>
                    <strong>${commenter.name}</strong>
                    <span>(${new Date(c.updated).toLocaleString()})</span>
                    <br>
                    <span>${c.data.comment}</span>
                </small>`;
            div.innerHTML = commentHtml;
            commentDivs.push(div);
        }

        return { commentDivs, endOfList: comments.endOfList };
    }

    /*
        Following function addComment() will add a comment to the post.
        When the user submits the form, it will call the addComment() function.
        We are using the skapi.postRecord() method to upload the comment.
        The comments are uploaded using compond index names using the record ID. (ex: comment.record_id)
        This way we can get the comments of a post and also fetch the posts ordered by most commented.
    */
    async function addComment(event, record_id) {
        let userInfo = await user;

        disableForm(event.target, true);
        let postComment = await skapi.postRecord(event, {
            table: {
                name: "comments",
                access_group: "authorized"
            },
            index: {
                name: "comment." + record_id,
                value: true
            }
        }).finally(() => disableForm(event.target, false));

        // Following code will update the comment count of the post.
        let commentCounter = document.getElementById(`span_commentCount-${record_id}`);
        if (commentCounter) {
            commentCounter.textContent = Number(commentCounter.textContent) + 1;
        }

        event.target.reset();

        let div = document.createElement('div');
        let commentHtml = /*html*/ `
        <small>
            <strong>${userInfo.name}</strong>
            <span>(${new Date(postComment.updated).toLocaleString()})</span>
            <br>
            <span>${postComment.data.comment}</span>
        </small>`;

        div.innerHTML = commentHtml;
        document.getElementById(`div_commentSection-${record_id}`).prepend(div);
    }

    /*
        Following function like() will allow the user to like the post.
        When the user clicks the <strong> element, it will call the like() function.
        We are using the skapi.postRecord() method to upload the like.
        The likes will be stored in the reference of the post.
        This way we can get the like count of a post and fetch the posts ordered by most liked.
        Also, using the reference, we can restrict the user to like only once per post.
    */
    async function like(record_id) {
        let likeButton = document.getElementById(`strong_like-${record_id}`);
        let likedStatus = likeButton.getAttribute('data-like');
        let likedCount = Number(document.getElementById(`span_likedCount-${record_id}`).textContent);

        if (likedStatus === '🩶') {
            likeId[record_id] = (await skapi.postRecord(null, {
                table: { name: 'likes', access_group: 'public' },
                reference: record_id
            })).record_id;
            likeButton.setAttribute('data-like', '❤️');
            likedCount++;
        }
        else {
            await skapi.deleteRecords({ record_id: likeId[record_id] });
            likeButton.setAttribute('data-like', '🩶');
            likedCount--;
        }

        likeButton.textContent = '';
        document.getElementById(`span_likedCount-${record_id}`).textContent = likedCount.toString();
    }

    /*
        Following function subscribe() will allow the user to subscribe to the uploader.
        When the user clicks the <strong> element, it will call the subscribe() function.
        We are using the skapi.subscribe() method to subscribe the user.
        If the user is already subscribed, it will unsubscribe the user.
        The subscription status will be stored in the subscription_list variable that we have declared above.
    */
    async function subscribe(el, user_id) {
        let data_subscribe = el.getAttribute('data-subscribe');
        if (!data_subscribe) {
            return;
        }
        if (data_subscribe === 'Subscribe') {
            // If the user is not subscribed, we will subscribe the user.
            skapi.subscribe({
                user_id: user_id,
                get_feed: true // We will set get_feed to true so that the user can fetch the posts from the feed.
            }).then(sub => {
                subscription_list[user_id] = sub
            });

            let className = `strong_subs-${user_id}`;
            // If the user is not subscribed, we will set the data-subscribe attribute to 'Subscribed'.
            Array.from(document.querySelectorAll(`.${className}`)).forEach(el => {
                el.setAttribute('data-subscribe', 'Subscribed');
            });
        } else {
            // If the user is already subscribed, we will unsubscribe the user.
            skapi.unsubscribe({
                user_id: user_id,
            });

            subscription_list[user_id] = false;
            // If the user is already subscribed, we will set the data-subscribe attribute to 'Subscribe'.
            Array.from(document.querySelectorAll(`.strong_subs-${user_id}`)).forEach(el => {
                el.setAttribute('data-subscribe', 'Subscribe');
            });
        }
    }

    /*
        Following function initialFetch() will fetch the posts when the page loads, or when the url hash changes.
        We will use the location.hash to identify how the posts should be fetched.
    */
    async function initialFetch() {
        let hash = location.hash ? location.hash.slice(1) : '';

        switch (hash) {
            case 'mostliked':
                /*
                    For most liked posts, we will use the indexed values to get the most liked posts.
                    We can get posts ordered by referenced count by setting the reserved index name to '$referenced_count'.
                    Argument of getPosts() is set to false so that we can fetch the most liked posts from the start.
                */
                fetchQuery = {
                    table: {
                        name: 'posts',
                        access_group: 'authorized'
                    },
                    index: {
                        name: '$referenced_count',
                        value: 0,
                        condition: '>'
                    }
                };

                getPosts(false);
                break;

            case 'mostcomment':
                /*
                    For most commented posts, we will use getMostCommentedPost() function.
                    We will declare the getMostCommentedPost() function below.
                    Argument of getMostCommentedPost() is set to false so that we can fetch the most commented posts from the start.
                */
                getMostCommentedPost(false);
                break;
            case 'myposts':
                /*
                    For my posts, we will use the indexed values to get the posts uploaded by the logged in user.
                    We can get posts uploaded by the logged in user by setting the reserved index name to '$user_id'.
                */
                fetchQuery = {
                    table: {
                        name: 'posts',
                        access_group: 'authorized'
                    },
                    index: {
                        name: '$user_id',
                        value: (await user).user_id,
                    }
                };

                getPosts(false);
                break;
            case 'myprivate':
                /*
                    For my private posts, we can get posts uploaded by the logged in user by setting the reserved index name to '$user_id'.
                    And the table access_group is set to private.
                */
                fetchQuery = {
                    table: {
                        name: 'posts',
                        access_group: 'private'
                    },
                    index: {
                        name: '$user_id',
                        value: (await user).user_id,
                    }
                };

                getPosts(false);
                break;

            case 'feed':
                /*
                    For feed, we will use the getFeed() function.
                    We will declare the getFeed() function below.
                    Argument of getFeed() is set to false so that we can fetch the feed from the start.
                */
                getFeed(false);
                break;

            default:
                /*
                    By default, we will fetch all the post under the table 'posts'.
                    The posts is Skapi database are always ordered by the time it was uploaded.
                    Since we have set the fetch option ascending to false, we will get the most recent posts.
                */
                fetchQuery = {
                    table: {
                        name: 'posts',
                        access_group: 'authorized'
                    }
                };

                /*
                    If the hash starts with 'tag=', we will fetch the posts with the tag.
                    We will use the location.hash to identify how the posts should be fetched.
                    And we will set the fetchQuery.tag to the tag value.
                */
                if (hash.startsWith('tag=')) {
                    fetchQuery.tag = hash.slice(4);
                }

                getPosts(false);
                break;
        }
    }

    /*
        Following function getMostCommentedPost() will fetch the most commented posts.
    */
    async function getMostCommentedPost(fetchMore = true) {
        fetchMoreButton.disabled = true;

        /*
            We are using skapi.getIndexes() method to get all the index information of the comment.
            Since we are using the compond index names, we can get index information ordered by total index value under the compond index name 'comment.'.
            Ascending is set to false so that we can get the index information ordered by most commented posts.
        */
        let commentIndex = await skapi.getIndexes(
            {
                table: 'comments',
                index: 'comment.',
                order: {
                    by: 'total_bool'
                }
            },
            {
                ascending: false,
                limit: 4,
                fetchMore
            }
        );

        if (!fetchMore) {
            // clear the section_posts when fetching posts with fetchMore = false.
            section_posts.innerHTML = '';
            if (commentIndex.list.length === 0) {
                section_posts.innerHTML = 'No posts found.';
                return;
            }
        }

        /*
            Following code will get each comment post by the record_id.
            We know the record_id from the compond index name: (comment.record_id).
            Then we will call the createArticleContent() function that we have declared above to create the html elements.
            Lastly, we will append the html elements to the #section_posts.
        */
        let posts = await Promise.all(commentIndex.list.map(i => skapi.getRecords({
            record_id: i.index.split('.')[1],
        }).catch(err => null)));

        let articles = await Promise.all(posts.map(p => p ? createArticleContent(p.list[0]) : null));

        for (let articleEl of articles) {
            if (articleEl) {
                section_posts.appendChild(articleEl);
            }
        }

        /*
            When there are no more posts to fetch, we will disable the fetchMore button.
            When there are more posts to fetch, we will enable the fetchMore button.
            We will also set the onclick event of the fetchMore button to call the getMostCommentedPost() function.
        */
        fetchMoreButton.disabled = commentIndex.endOfList;
        fetchMoreButton.onclick = () => getMostCommentedPost();
    }

    /*
        We will call the initialFetch() function when the page loads, or when the url hash changes.
    */
    initialFetch();
    window.addEventListener('hashchange', initialFetch);
</script>
```
