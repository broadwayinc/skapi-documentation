# Chat Room

Skapi provides realtime messaging features via web socket.
It can be used to build chat applications, games or any other realtime applications.
This tutorial will show you how you can build simple chat room application using Skapi.

## Files to Read

```
.
├─ chatroom
│  └─ chatroom.html
```
::: warning
Note that this is the extension of the previous tutorials, so you still need the complete project folders and files.

See the tutorial [Introduction](/full-example/intro.html) for more information.
:::

## Chat Room

### chatroom/chatroom.html

```html
<!--
    This page shows how you can use Skapi to create a chat room.
    When the user joins the chat room, it will show a list of other users who have joined the chat room.
    If there is no other users in the chat room the list will not show.
    User can click on other users in the list to send private message to them.
-->
<!DOCTYPE html>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>
<script src="../service.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/modern-init-css@latest/init.css">
<link rel="stylesheet" href="../custom.css">

<!--
    Following code will check if the user is logged in.
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

<!--
    Following <dialog> element is for sending private message.
    When user clicks on a user in the list, it will show the <dialog> element.
    The <dialog> element will show the name of the user that you are communicating with.
    When user submits the form, it will send/reply the private message to the other user.
-->
<dialog id="privateMsg">
    <small>Private Message: <span id="msgTo"></span></small>
    <p id="privateMsgBox"></p>

    <!--
        Following <form> will send/reply the private message to the other user.
        When user submits, we will use the skapi.postRealtime() method to send/reply the private message.
        On the second argument of skapi.postRealtime(), we are giving privateChat variable which is set it to the user_id of the other user.
        We will declare privateChat variable later on the script tag below.
        When the private message is sent, it will close the <dialog> element.
    -->
    <form onsubmit="skapi.postRealtime(event, privateChat).then(()=>{this.reset(); privateMsg.close();})">
        <input type="text" name='msg' placeholder="Say something">
        <input type="submit" value="Send">
    </form>

    <br>

    <small style='float: right;' class='clickable' onclick="privateMsg.close()">Close</small>
</dialog>

<main>
    <div class="spaceBetween">
        <h2>Chat Room</h2>
        <a href="../index.html">Back</a>
    </div>
    <div id="chatBox">
        <!--
            Following <div> element will show the messages in the chat room.
            We will write a javascript code to append the messages to this <div> element later.
        -->
        <div id="chat">
            <div class="alignCenter">-- Welcome to the chat room --</div>
        </div>
        <!--
            Following <section> element will show the list of users who have joined the chat room.
            We will write a javascript code to append the users to this <section> element later.
        -->
        <div id="joinedUsers"></div>
    </div>
    <!--
        Following <form> will send the message to the chat room.
        When user submits, we will use the skapi.postRealtime() method to send the message to the chat room.
        On the second argument of skapi.postRealtime(), we are giving 'chat' which is the name of the chat room.
        We will let the user to join the chat room named 'chat' later on the script tag below.
        When the message is sent, it will reset the form.
    -->
    <form onsubmit="skapi.postRealtime(event, 'chat').then(()=>this.reset())">
        <input id='inputMsg' type="text" name='msg' placeholder="Say something" disabled>
        <input id='sendMsg' type="submit" value="Send" disabled>
    </form>
</main>
<script>
    /*
        Following function getUserInfo() will be used to get the user's information.
        It is called when the user joins the chat room, receives a message.
        To save the API calls, we will save the user's information in the userInfo object,
        and return the user's information from the object if it is already saved.
    */
    let userInfo = {};
    function getUserInfo(user_id) {
        if (!userInfo[user_id]) {
            userInfo[user_id] = skapi.getUsers({
                searchFor: 'user_id',
                value: user_id
            }).then(user => {
                if (user.list.length === 0) {
                    return {
                        email: 'User not found',
                        name: 'User not found',
                        picture: ''
                    };
                }
                else {
                    return user.list[0];
                }
            });
        }

        return userInfo[user_id];
    }

    /*
        Following function listUser() will be used to create the <div> element that contains a user's profile image and name.
        We will use this <div> element to append to the list of joined users in the chat room.
    */
    let privateChat = '';
    let listUser = async (u) => {
        if (document.getElementById(u.user_id)) {
            return;
        }

        let me = await user; // the user varaible is declared on the top of the script tag. If the promise is resolved, it will contain the user's profile.

        /*
            Following code will create the html content with the user's information.
        */
        let joinedHtml = /*html*/ `
                        <img src="${u.picture || ''}" class="chatPic">
                        <small>${u.name}</small>
                    `;
        let joinedDiv = document.createElement('div');
        joinedDiv.id = u.user_id;
        joinedDiv.innerHTML = joinedHtml;
        joinedUsers.prepend(joinedDiv);

        if (u.user_id === me.user_id) {
            return;
        }

        /*
            When the other user is clicked, it will show the <dialog> element to send private message to that user.
            When clicked, it sets the privateChat variable to the user's id so it can be used to send private message to that user.
        */
        joinedDiv.classList.add('clickable');
        joinedDiv.onclick = () => {
            privateMsg.showModal();
            msgTo.textContent = u.name;
            privateChat = u.user_id;
            privateMsgBox.innerHTML = '';
        }
    }

    /*
        Following function rtCallback will be used as a callback function of realtime connection.
        Anytime user receives a realtime message, this callback is triggered.
    */
    let rtCallback = async (rt) => {
        let me = await user; // the user varaible is declared on the top of the script tag. If the promise is resolved, it will contain the user's profile.
        console.log(rt);
        /*
            Following code will check if the realtime message is a notice.
            If the realtime message is a notice, it will check if the notice is about a user joining or leaving the chat room.
            If the notice is about a user joining or leaving the chat room, it will show the notice in the chat room.
        */
        if (rt.type === 'notice') {
            if (rt.message.includes('joined the message group.')) {
                /*
                    Everytime a user message is received, we will get the user's profile information and append the user's name to the chat room.
                */
                return getUserInfo(rt.sender).then(async u => {
                    // If the user is not the current user, show the notice in the chat room.
                    if (rt.sender !== (await user).user_id) {
                        let html = /*html*/ `<div class='alignCenter'>-- ${u.name} has joined the chat --</div>`;
                        let div = document.createElement('div');
                        div.innerHTML = html;
                        chat.append(div);
                        chat.scrollTop = chat.scrollHeight;
                    }

                    listUser(u);
                });
            }
            else if (rt.message.includes('left the message group.')) {
                return getUserInfo(rt.sender).then(async u => {
                    // If the user is not the current user, show the notice in the chat room.
                    if (rt.sender !== (await user).user_id) {
                        let html = /*html*/ `<div class='alignCenter'>-- ${u.name} has left the chat --</div>`;
                        let div = document.createElement('div');
                        div.innerHTML = html;
                        chat.append(div);
                        chat.scrollTop = chat.scrollHeight;
                    }

                    let joinedDiv = document.getElementById(rt.sender);
                    if (joinedDiv) {
                        joinedDiv.remove();
                    }
                });
            }

            chat.scrollTop = chat.scrollHeight;
        }

        /*
            Following code will check if the realtime message is a message.
            If the realtime message is a message, it will show the message in the chat room.
        */
        if (rt.type === 'message') {
            let sender = await getUserInfo(rt.sender);
            let html = /*html*/ `
                <span class='inlineBlock'>
                    <img src="${sender.picture || ''}" class="chatPic">
                    <small>${sender.name}</small>
                </span>
                <br>
                <span class='inlineBlock'>${rt.message.msg}</span>
            `;
            let div = document.createElement('div');
            div.innerHTML = html;
            div.classList.add('msg');

            if (rt.sender === me.user_id) {
                div.classList.add('alignRight');
            }
            chat.append(div);
            chat.scrollTop = chat.scrollHeight;
        }

        /*
            Following code will check if the realtime message is a private message.
            If the realtime message is a private message, it will show the private message in the <dialog> element.
        */
        if (rt.type === 'private') {
            if (me.user_id === rt.sender) {
                return;
            }

            let u = await getUserInfo(rt.sender);
            privateMsg.showModal();
            msgTo.textContent = u.name;
            privateChat = u.user_id;
            privateMsgBox.innerHTML = rt.message.msg;
        }
    }

    /*
        Following code will connect to the realtime server when the page loads.
    */
    skapi.connectRealtime(rtCallback);

    /*
        Following code will join the chat room named 'chat'.
        We are using skapi.joinRealtime() method to let the user join to the chat room named 'chat'.
        When successful, it will call skapi.getRealtimeUsers() method to get the list of users who have joined the chat room.
        Then it will call getUserInfo() function to get each user's information.
        Then it will call listUser() function to append the user's information to the list of joined users in the chat room.
    */
    skapi.joinRealtime({ group: 'chat' }).then(() => {
        inputMsg.disabled = false;
        sendMsg.disabled = false;
        skapi.getRealtimeUsers({ group: 'chat' }).then(u => {
            u.list.forEach(user => getUserInfo(user.user_id).then(listUser));
        });
    });

</script>
<style>
    #chatBox {
        height: calc(100vh - 200px);
        text-align: center;
    }

    #chatBox>div {
        background-color: white;
        padding: 8px;
        box-sizing: border-box;
        height: 100%;
        overflow-x: hidden;
        overflow-y: scroll;
        vertical-align: top;
        display: inline-block;
        text-align: left;
    }

    #chat {
        width: 500px;
        max-width: calc(100vw - 140px);
    }

    #joinedUsers {
        width: 120px;
    }

    #joinedUsers>div {
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-bottom: 1rem;
        overflow: hidden;
    }

    form {
        display: flex;
    }

    input[type="text"] {
        width: 100%;
    }

    .msg {
        margin-bottom: 1rem;
    }

    .msg>* {
        text-align: left;
    }

    .chatPic {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        object-fit: cover;
        vertical-align: middle;
        position: relative;
    }
</style>
```