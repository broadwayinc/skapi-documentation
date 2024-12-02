# Instaclone (Instagram Clone)

Skapi provides flexible database and scalable file storage for your web application.
This tutorial will show you how you can build Instagram like application using Skapi.

## Files to Read

```
.
├─ instaclone
│  └─ instaclone.html
```
::: warning
Note that this is the extension of the previous tutorials, so you still need the complete project folders and files.

See the tutorial [Introduction](/full-example/intro.html) for more information.
:::

## Instaclone

### instaclone/instaclone.html

```html
<!--
    This is a sample app that uses SKAPI to create a simple Instagram clone.
-->
<!DOCTYPE html>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script src="../service.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/modern-init-css@latest/init.css">
<link rel="stylesheet" href="../custom.css">

<!--
    Following <script> will check if the user is logged in.
    If the user is not logged in, it will redirect the user to ../index.html page.
-->
<script>
    let user = skapi.getProfile().then(u => {
        if (!u) {
            location.href = '../index.html';
        }
        return u;
    });
</script>

<main id="main_page">
    <div class="spaceBetween">
        <h2>Instaclone</h2>
        <a href="../index.html">Back</a>
    </div>

    <!--
        Following <section> will allow the user to upload a post.
        When the user clicks the "Update" button, we will call the skapi.postRecord() function.
        skapi.postRecord() function will upload the image and description, tags to the database.
        When successful, it will prepend the post to the top of the page.
        When unsuccessful, it will show an alert with the error message.
    -->
    <section id="uploadSection">
        <form onsubmit="
            disableForm(this, true);
            updateButton.value = '0%';

            let params = {
                table: {
                    name: 'posts',
                    access_group: input_private.checked ? 'private' : 'authorized' // Depending on the checkbox, we will set the access_group to private or authorized.
                },
                reference: {
                    prevent_multiple_referencing: true // We will allow only one reference per post. This will allow us to restrict users to like only once per post.
                },
                progress: p => {
                    if (p.status === 'upload' && p.currentFile) {
                        updateButton.value = `${Math.floor(p.progress)}%`;
                    }
                },
                tags: input_tags.value || null
            }

            skapi.postRecord(event, params).then(async r=>{
                /*
                    When the post is successful, we will prepend the post to the top of the page.
                    We will call createArticleContent() function that we will declare later.
                */
                section_posts.prepend(await createArticleContent(r));
                img_preview.src = '';
                this.reset();
            }).catch(err=>alert(err.message)).finally(()=>{
                updateButton.value = 'Update';
                disableForm(this, false);
            });
        ">
            <fieldset>
                <legend>Upload Post</legend>
                <br>
                <label for='input_fileInput' class="clickable">
                    <img id='img_preview' src="">
                    <style>
                        /*
                            Following <style> will style the image preview.
                            When the user clicks on the image preview, it will open the file input.
                            If the user does not select a file, it will show "Choose Image" text.
                        */
                        #img_preview {
                            width: 100%;
                            object-fit: cover;
                            vertical-align: middle;
                            position: relative;
                        }

                        #img_preview[src=""]::before {
                            content: 'Choose Image';
                            padding: 8px;
                            background-color: blue;
                            display: block;
                            color: white;
                            font-weight: bold;
                        }
                    </style>
                </label>

                <br><br>

                <small>Description</small><br>
                <input name="description" placeholder="Describe the picture (required)." required></input>

                <br><br>

                <small>Tags</small><br>
                <input id='input_tags' pattern="[a-zA-Z0-9 ,]+"
                    title="Only alphanumeric characters, spaces, and commas are allowed"
                    placeholder="separate with a comma. ex: tag1, tag2 (optional)"></input>

                <br><br>

                <label>
                    Make This Post Private: <input id="input_private" type="checkbox" name="private" value="private">
                </label>

                <br><br>

                <input id='input_fileInput' type="file" name="pic" accept="image/*" hidden required>
                <div class="alignRight">
                    <input id='updateButton' type="submit" value="Update">
                </div>
                <style>
                    /*
                        Following <style> will disable the submit button when the file input is empty.
                    */
                    #input_fileInput:invalid+div>input[type=submit] {
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
            </fieldset>
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
    <nav class="alignRight">
        <style>
            nav>a {
                margin: 4px 0;
                display: inline-block;
            }
        </style>
        <a href="instaclone.html">Most Recent</a>
        |
        <a href="#mostliked">Most Liked</a>
        |
        <a href="#mostcomment">Most Comment</a>
        |
        <a href="#myposts">My Posts</a>
        |
        <a href="#myprivate">My Private</a>
    </nav>
    <hr>

    <!--
        Following <section> will show the posts.
    -->
    <section id="section_posts"></section>
    <br>
    <div class="alignCenter">
        <!--
            Following <button> will allow the user to fetch more posts.
            When the user clicks the button, it will call the getPosts() function.
            We will declare the getPosts() function and onclick event later.
        -->
        <button id="fetchMore" disabled>Fetch More</button>
    </div>
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

        article>img {
            width: 100%;
        }

        article .like[data-like='Liked!'] {
            color: red;
        }

        article .like::before {
            content: attr(data-like);
        }

        .content {
            text-indent: 0.25em;
        }

        input:not([type=checkbox]):not([type=submit]) {
            width: 100%;
        }
    </style>
</main>
<script>
    /*
        Following variable fetchQuery will be used to fetch the posts.
    */
    let fetchQuery = {
        table: {
            name: 'posts',
            access_group: 'authorized'
        }
    };

    /*
        Following variable likeId will be used to store the users like record_id.
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
        Following function will fetch the user information of the post uploader.
    */
    async function getUserInfo(user_id) {
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
        document.getElementById('fetchMore').disabled = true;

        /*
            In skapi.getRecords() method, we are passing the fetchQuery variable that we have declared above.
            In the second argument we are setting the fetch option to fetch 4 posts per call.
            The ascending is set to false so that we can get the most recent posts, or the most liked posts, most commented posts... etc.
            When the ascending is set to false, Skapi database fetches the records in descending order.
        */
        let posts = await skapi.getRecords(fetchQuery, {ascending: false, limit: 4, fetchMore});

        /*
            When fetchMore is false, it means that the user is trying to fetch the posts for the first time. We will write a script for this later.
            When the user is trying to fetch post for the first time, we will clear the #section_posts.
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
            When there are more posts to fetch, we will enable the fetchMore button.
            We will also set the onclick event of the fetchMore button to call the getPosts() function.
            The reason we are setting the onclick event manually is
            because there is a case where the user may want to fetch post ordered by most commented,
            we have to call getMostCommentedPost() function instead. (we will write a script for this later)
        */
        document.getElementById('fetchMore').disabled = posts.endOfList;
        document.getElementById('fetchMore').onclick = () => getPosts();
    }

    /*
        Following function will create the html elements for the post.
    */
    async function createArticleContent(p) {
        if (!p) {
            return;
        }

        /*
            Following code will get the user id of the logged in user.
            The user variable is declared on the <script> tag above where we have checked if the user is logged in.
            The user variable is a promise that will resolve to the user information.
        */
        let logged_user_id = (await user).user_id;

        let record_id = p.record_id;
        let uploader = await getUserInfo(p.user_id); // get user information of the post uploader

        /*
            Following variable html will compose the html string for the post.
            Notice that we are using the record_id of the post as the part of the element ID in various places.
            Will use these element id to identify the element later.
        */
        let html = /*html*/`
            <div>
                <img class='profilePic' src='${uploader.picture || ""}'>
                <span class='user_name'>${uploader.name}</span>
            </div>
            
            <small class='spaceBetween'>
                Posted: ${new Date(p.updated).toLocaleString()}

                <!--
                    Following <ins> will allow the user to delete the post.
                    When the user clicks the <ins>, it will show a confirmation dialog.
                    If the user confirms, it will delete the post from the database.
                    If the user cancels, it will do nothing.
                    This will not show if the post is not uploaded by the logged in user.
                -->
                <ins
                    class='clickable like'
                    onclick='
                        let del = confirm("Would you like to remove this post?");
                        if(del) {
                        this.closest("article").remove();
                        skapi.deleteRecords({record_id: "${record_id}"});
                    }'
                    ${logged_user_id !== p.user_id ? "hidden" : ""}>Delete Post
                </ins>
            </small>

            <!--
                Following <img> will show the image of the post.
                All the files uploaded to the database are stored in the bin.
                The endpoint of the image is in bin.pic[0].url.
            -->
            <img src='${p.bin.pic[0].url}'>

            <div class='spaceBetween'>
                <small>Liked: <span id="span_likedCount-${p.record_id}">${p.reference.referenced_count}</span></small>
                
                <!--
                    Following <strong> tag will allow the user to like the post.
                    When the user clicks the <strong> element, it will call the like() function.
                    We will declare the like() function later.
                -->
                <strong
                    class='clickable like'
                    id='strong_like-${p.record_id}'
                    onclick='like("${p.record_id}")'
                    data-like=''>...</strong>
            </div>

            <!--
                Following <p> will show the description of the post.
            -->
            <p class='content'>
                ${p.data?.description}
            </p>

            <div class='spaceBetween'>
                <!--
                    Following <small> will show the tags of the post.
                    When the user clicks the tag, it will redirect the user to the instaclone.html page with the tag in the hash.
                -->
                <small>${p.tags ? 'Tags: ' + p.tags.map(t => `<a href='instaclone.html#tag=${t}'>${t}</a>`).join(', ') : ''}</small>

                <!--
                    Following <small> will show the comment count of the post.
                    We will later fetch the comment count and set the textContent of the <span> tag.
                -->
                <small>Comments (<span id='span_commentCount-${p.record_id}'>0</span>)</small>
            </div>

            <!--
                Following <form> will allow the user to add a comment to the post.
                When the user submits the form, it will call the addComment() function.
                We will declare the addComment() function later.
            -->
            <form class='spaceBetween' onsubmit='addComment(event, "${p.record_id}");'>
                <input name='comment' placeholder='Write Comment'>
                <input type='submit'>
            </form>
            
            <!--
                Following <div> will show the comments of the post.
                We will later fetch the comments and append the <div> to the <div> tag.
            -->
            <div id='div_commentSection-${p.record_id}' class='content'></div>

            <!--
                Following <small> will allow the user to fetch more comments.
                When the user clicks the <small> element, it will call the getComments() function.
                We will declare the getComments() function later.
            -->
            <small
                class='clickable alignRight'
                id='small_moreComments-${p.record_id}'
                onclick='getComments("${p.record_id}", true).then(c=>{
                    for (let div of c.commentDivs) {
                        document.getElementById("div_commentSection-" + "${record_id}").appendChild(div);
                    }
                    document.getElementById("small_moreComments-${record_id}").style.display = c.endOfList ? "none" : "block";})'
                >More Comments</small>
            <hr>`;

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
            table: 'likes',
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
            likeButton.setAttribute('data-like', myLike.list.length ? 'Liked!' : 'Like');
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
                    <span class='inlineBlock'>(${new Date(c.updated).toLocaleString()})</span>
                    <br>
                    <span class='inlineBlock'>${c.data.comment}</span>
                </small>`;
            div.innerHTML = commentHtml;
            commentDivs.push(div);
        }

        return {commentDivs, endOfList: comments.endOfList};
    }

    /*
        Following function addComment() will add a comment to the post.
        When the user submits the form, it will call the addComment() function.
        We are using the skapi.postRecord() method to upload the comment.
        The comments are uploaded using compond index names. (ex: comment.1234)
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

        event.target.reset();

        let div = document.createElement('div');
        let commentHtml = /*html*/ `
        <small>
            <strong>${userInfo.name}</strong>
            <span class='inlineBlock'>(${new Date(postComment.updated).toLocaleString()})</span>    
            <br>
            <span class='inlineBlock'>${postComment.data.comment}</span>
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
    */
    async function like(record_id) {
        let likeButton = document.getElementById(`strong_like-${record_id}`);
        let likedStatus = likeButton.getAttribute('data-like');
        let likedCount = Number(document.getElementById(`span_likedCount-${record_id}`).textContent);

        likeButton.textContent = '...';

        if (likedStatus === 'Like') {
            likeId[record_id] = (await skapi.postRecord(null, {
                table: 'likes',
                reference: {
                    record_id: record_id
                }
            })).record_id;
            likeButton.setAttribute('data-like', 'Liked!');
            likedCount++;
        }
        else {
            await skapi.deleteRecords({record_id: likeId[record_id]});
            likeButton.setAttribute('data-like', 'Like');
            likedCount--;
        }

        likeButton.textContent = '';
        document.getElementById(`span_likedCount-${record_id}`).textContent = likedCount.toString();
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
                    We will declare the getMostCommentedPost() function later.
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
            default:
                /*
                    For most recent posts, we can just fetch all the post under the table 'posts'.
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
        document.getElementById('fetchMore').disabled = true;

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
        document.getElementById('fetchMore').disabled = commentIndex.endOfList;
        document.getElementById('fetchMore').onclick = () => getMostCommentedPost();
    }
    
    /*
        We will call the initialFetch() function when the page loads, or when the url hash changes.
    */
    initialFetch();
    window.addEventListener('hashchange', initialFetch);
</script>
```