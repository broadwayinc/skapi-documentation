# Skapi HTML Chat Full Example

This is a HTML example for building basic chat application using Skapi's realtime features.

Users must login to post and fetch realtime messages.

This example features:

-   Creating, joining, and leaving chat rooms
-   Sending and receiving websocket messages
-   Fetching messengers info
-   Sending private messeges to user

All the main code is in **welcome.html**

## Recommended VSCode Extention

For HTML projects we often tend to use element.innerHTML.

So we recommend installing innerHTML string highlighting extention like one below:

[es6-string-html](https://marketplace.visualstudio.com/items/?itemName=Tobermory.es6-string-html)

## Download

Download the full project [Here](https://github.com/kkb75281/skapi-chat-html-template/archive/refs/heads/main.zip)

Or visit our [Github page](https://github.com/kkb75281/skapi-chat-html-template)

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

The application will be hosted on port `3000`

:::danger Important!

Replace the `SERVICE_ID` value to your own service in `service.js`

<!-- Currently the service is running on **Trial Mode**. -->

<!-- **All the user data will be deleted every 14 days.** -->

You can get your own service ID from [Skapi](https://www.skapi.com)

:::


## Example

Below is part of the repository code, showing how it handles more advanced chat app scenarios.

Because this is only a portion of the full repository and does not include supporting files such as `service.js` and `main.css`, you cannot copy and paste it directly.


**welcome.html**

```html
<!DOCTYPE html>
<meta charset="utf-8" />

<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="main.css" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<script src="service.js"></script>

<main>
    <div class="flex-wrap">
        <h1 id="WelcomeMessage"></h1>
        <a href="logout.html">Logout</a>
    </div>

    <script>
        /*
            Get user profile and display it on the page.
        */
        skapi.getProfile().then((u) => {
            if (u) {
                let welcomeMessage = document.getElementById("WelcomeMessage");
                if (welcomeMessage) {
                    welcomeMessage.innerHTML = `Welcome, ${
                        u.name || u.email || u.user_id
                    }!`;
                }

                let userInfo = document.getElementById("UserInfo");
                if (userInfo) {
                    userInfo.innerHTML = JSON.stringify(u, null, 2);
                }
            }
            return u;
        });

        let participants = {};
        let sendTo = null;

        let getUserInfo = async (user_id) => {
            if (!participants[user_id]) {
                // get user info from skapi if not already fetched
                // This is to avoid fetching the same user info multiple times.

                if (user_id === skapi.user.user_id) {
                    // If the user is the current user, return the current user info.
                    participants[user_id] = skapi.user;
                    return skapi.user;
                }

                let user = (
                    await skapi.getUsers({
                        searchFor: "user_id",
                        value: user_id,
                    })
                ).list?.[0];
                if (user) {
                    participants[user_id] = user;

                    // Append the user to the participants list
                    let strongTag = document.createElement("strong");
                    strongTag.id = user.user_id;
                    strongTag.innerText =
                        user.name || user.email || user.user_id;

                    let participantsList =
                        document.getElementById("participants");
                    participantsList.appendChild(strongTag);
                    participantsList.appendChild(document.createElement("br"));

                    // Add event listener to the user name to open the private message dialog.
                    // This is to avoid adding the event listener to the current user.
                    strongTag.classList.add("clickable");
                    strongTag.onclick = (e) => {
                        console.log({ e });
                        sendTo = user;
                        document.getElementById("privateMsgTo").innerText =
                            sendTo.name || sendTo.email || sendTo.user_id;
                        document.getElementById("privateMsgSender").showModal();
                    };
                }
            }

            return participants[user_id];
        };

        let RealtimeCallback = async (rt) => {
            // Callback executed when there is data transfer between the users.
            /**
            rt = {
                type: 'message' | 'private' | 'error' | 'success' | 'close' | 'notice',
                message: '...',
                ...
            }
            */
            console.log(rt);
            if (rt.type === "private") {
                // Private message

                if (rt.sender === skapi.user.user_id) {
                    // If the sender is the current user, do nothing.
                    return;
                }

                let msgSender = await getUserInfo(rt.sender);
                let username =
                    msgSender.name || msgSender.email || msgSender.user_id;

                let privateMsgFrom = document.getElementById("privateMsgFrom");
                privateMsgFrom.innerHTML = username;

                let privateMsg = document.getElementById("privateMsg");
                privateMsg.innerHTML = rt.message.msg;

                document.getElementById("privateMsgDialog").showModal();
            }
            if (rt.type === "message") {
                // Append the message to the chatbox
                let chatbox = document.getElementById("chatMessages");
                if (chatbox) {
                    let user_id = rt.sender;
                    let user = await getUserInfo(user_id);
                    let username = user.name || user.email || user.user_id;

                    let textAlign =
                        user_id === skapi.user.user_id ? "right" : "left";

                    let userClass =
                        user_id === skapi.user.user_id ? "user" : "";

                    chatbox.innerHTML += /*html*/ `<div style='word-wrap:break-word; margin-top: 12px; text-align: ${textAlign}'><strong>${username}</strong><br><p class="msg ${userClass}">${rt.message.chatmsg}</p></div>`;

                    chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom
                }
            } else if (rt.type === "error") {
                // alert(rt.message);
                console.error(rt.message);
            } else if (rt.type === "notice") {
                if (rt.message.includes("message group")) {
                    // User joined the group
                    let user_id = rt.sender;
                    let message = rt.message;

                    if (["USER_LEFT", "USER_DISCONNECTED"].includes(rt.code)) {
                        // remove the user from the participants list
                        let participantsList =
                            document.getElementById("participants");
                        let participant = document.getElementById(user_id);
                        let participantBr = participant.nextSibling;
                        participantsList.removeChild(participantBr);
                        participantsList.removeChild(participant);

                        let user = await getUserInfo(user_id);
                        let chatbox = document.getElementById("chatMessages");
                        message = message.replace(
                            /"([^"]+)"/,
                            `"${user.name || user.email || user.user_id}"`
                        );
                        chatbox.innerHTML += `<p>${message}</p>`;
                        chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom

                        delete participants[user_id];
                    } else if ("USER_JOINED" === rt.code) {
                        // Add the user to the participants list
                        let user = await getUserInfo(user_id);
                        let chatbox = document.getElementById("chatMessages");
                        message = message.replace(
                            /"([^"]+)"/,
                            `"${user.name || user.email || user.user_id}"`
                        );
                        chatbox.innerHTML += `<p>${message}</p>`;
                        chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom
                    }
                }
            }
        };

        // Connect to the realtime websocket
        skapi.connectRealtime(RealtimeCallback);
    </script>

    <section id="groupList" hidden>
        <br /><br />
        <script>
            async function checkIfGroupExists(event) {
                let group = (await skapi.getRealtimeGroups(event)).list;
                if (group.length) {
                    alert("Group already exists.");
                }
            }
        </script>
        <form action="#{value}" onsubmit="checkIfGroupExists(event)">
            <input name="searchFor" value="group" hidden />
            <input name="condition" value="=" hidden />
            <label
                >Create New Chat Group:
                <input
                    type="text"
                    id="el_inp_group"
                    name="value"
                    placeholder="Enter group name"
                    required
                />
            </label>
            <button type="submit">Create</button>
        </form>

        <br />

        <table>
            <thead>
                <tr>
                    <th>Chat Group</th>
                    <th>Users</th>
                </tr>
            </thead>
            <style>
                table {
                    border-collapse: collapse;
                    width: 100%;
                }

                th,
                td {
                    padding: 8px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }

                tr:hover {
                    background-color: #f5f5f5;
                }
                th {
                    background-color: #4caf50;
                    color: white;
                }
                th:first-child {
                    width: 70%;
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
                tr:nth-child(odd) {
                    background-color: #ffffff;
                }
            </style>
            <tbody id="RealtimeGroups">
                <tr>
                    <td>Loading...</td>
                    <td>...</td>
                </tr>
                <!-- Realtime groups will be displayed here -->
            </tbody>
            <script>
                skapi
                    .getRealtimeGroups({
                        searchFor: "groups",
                        condition: ">",
                        value: " ",
                    })
                    .then((res) => {
                        console.log("Realtime groups:", res); // [{ group: 'HelloWorld', number_of_users: 1 }, ...]
                        if (res.list.length) {
                            let RealtimeGroups =
                                document.getElementById("RealtimeGroups");
                            if (RealtimeGroups) {
                                RealtimeGroups.innerHTML = res.list
                                    .map(
                                        (group) =>
                                            /*html*/ `<tr><td><a href="#${group.group}">${group.group}</a></td><td>${group.number_of_users}</td></tr>`
                                    )
                                    .join("");
                            }
                        } else {
                            let RealtimeGroups =
                                document.getElementById("RealtimeGroups");
                            if (RealtimeGroups) {
                                RealtimeGroups.innerHTML = `<tr><td colspan="2">No groups found.</td></tr>`;
                            }
                        }
                    });
            </script>
        </table>
    </section>

    <section id="chatbox" hidden>
        <h2>Chat Group <span id="el_groupname"></span></h2>

        <div style="display: flex">
            <div id="chatMessages"></div>
            <div id="participants"></div>
        </div>

        <style>
            #chatMessages {
                height: 300px;
                overflow-y: auto;
                padding: 12px 16px;
                flex-grow: 1;
                border: 1px solid #ccc;
                border-radius: 8px;
                border-top-right-radius: 0;
                border-bottom-right-radius: 0;
            }
            #participants {
                width: 33%;
                overflow-x: auto;
                height: 300px;
                overflow-y: auto;
                padding: 12px 16px;
                border: 1px solid #ccc;
                border-radius: 8px;
                border-top-left-radius: 0;
                border-bottom-left-radius: 0;
                border-left: none;
                flex-shrink: 0;
            }
            .clickable {
                cursor: pointer;
                color: blue;
                text-decoration: underline;
            }

            .msg {
                margin: 4px 0 0;
                background-color: #eee;
                padding: 8px 12px;
                border-radius: 8px;
                width: fit-content;
                position: relative;
                word-break: break-all;
            }

            .msg:before {
                border-top: 0 solid #eee;
                border-left: 0 solid transparent;
                border-right: 10px solid #eee;
                border-bottom: 10px solid transparent;
                content: "";
                position: absolute;
                top: 8px;
                left: -8px;
            }

            .msg.user {
                margin-left: auto;
            }

            .msg.user:before {
                content: none;
            }

            .msg.user:after {
                border-top: 10px solid #eee;
                border-left: 0 solid transparent;
                border-right: 10px solid transparent;
                border-bottom: 0px solid transparent;
                content: "";
                position: absolute;
                top: 8px;
                right: -8px;
            }
        </style>
        <br />
        <form
            onsubmit="skapi.postRealtime(event, currentGroup).then(()=>this.reset())"
        >
            <input
                type="text"
                name="chatmsg"
                placeholder="Type your message..."
                required
            />
            <button type="submit">Send</button>
        </form>
        <br />

        <a href="welcome.html">Back to group list</a>
    </section>
</main>

<dialog id="privateMsgDialog">
    <strong>Private Message From: <span id="privateMsgFrom"></span></strong>
    <p id="privateMsg"></p>
    <button
        id="closeDialog"
        onclick="document.getElementById('privateMsgDialog').close()"
    >
        Close
    </button>
</dialog>

<dialog id="privateMsgSender">
    <div class="flex-wrap">
        <strong>Private Message To: <span id="privateMsgTo"></span></strong>
        <sup
            id="closeDialog"
            onclick="document.getElementById('privateMsgSender').close()"
            style="cursor: pointer; font-size: 22px"
            >&times;</sup
        >
    </div>

    <form
        onsubmit="skapi.postRealtime(event, sendTo.user_id).then(()=>{ this.reset(); document.getElementById('privateMsgSender').close(); });"
    >
        <input name="msg" placeholder="Write Message..." required />
        <input type="submit" value="Send" style="margin: 4px 0" />
    </form>
</dialog>

<script>
    let currentGroup = null;
    function joinGroup() {
        document.getElementById("participants").innerHTML = ""; // Clear participants
        document.getElementById("chatMessages").innerHTML = ""; // Clear chat messages

        // Clear participants except the current user
        for (let user_id in participants) {
            if (user_id !== skapi.user.user_id) {
                delete participants[user_id];
            }
        }

        console.log("Initial hash:", location.hash);
        if (location.hash) {
            document.getElementById("chatbox").hidden = false; // Show chatbox
            document.getElementById("groupList").hidden = true; // Hide group list

            // Get the new hash value
            currentGroup = location.hash.replace("#", "");
            document.getElementById(
                "el_groupname"
            ).innerText = `"${currentGroup}"`;

            skapi
                .getRealtimeUsers({
                    group: currentGroup,
                })
                .then((u) =>
                    Promise.all(
                        u.list.map((user) => getUserInfo(user.user_id))
                    ).then((res) => console.log(participants))
                );

            return skapi.joinRealtime({ group: currentGroup });
        } else {
            document.getElementById("chatbox").hidden = true; // Hide chatbox
            document.getElementById("groupList").hidden = false; // Show group list
            document.getElementById("el_groupname").innerText = "";
            return skapi.joinRealtime({ group: null }); // leave group
        }
    }
    // Add an event listener for the hashchange event
    window.addEventListener("hashchange", joinGroup);

    // Optionally, handle the initial hash when the page loads
    document.addEventListener("DOMContentLoaded", joinGroup);
</script>
```