# Skapi HTML Video Call Example

This is a HTML example for building basic video call application using Skapi's webrtc features.

Users must login to request or receive video calls.

This example features:

-   List available receivers
-   Requesting video call
-   Receive incomming video call
-   Hangup incomming, outgoing calls

All the main code is in **welcome.html**

## Recommended VSCode Extention

For HTML projects we often tend to use element.innerHTML.

So we recommend installing innerHTML string highlighting extention like one below:

[es6-string-html](https://marketplace.visualstudio.com/items/?itemName=Tobermory.es6-string-html)

## Download

Download the full project [Here](https://github.com/kkb75281/skapi-webrtc-html-template/archive/refs/heads/main.zip)

Or visit our [Github page](https://github.com/kkb75281/skapi-webrtc-html-template)

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

:::danger HTTPS REQUIRED.
WebRTC only works on HTTPS environment.
You need to setup a HTTPS environment when developing a WebRTC feature for your web application.

You can host your application in skapi.com or host from your personal servers.
:::

:::danger Important!

Replace the `SERVICE_ID` value to your own service in `service.js`

<!-- Currently the service is running on **Trial Mode**. -->

<!-- **All the user data will be deleted every 14 days.** -->

You can get your own service ID from [Skapi](https://www.skapi.com)

:::


## Example

Below is part of the repository code, showing how it handles more advanced video chat app scenarios.

Because this is only a portion of the full repository and does not include supporting files such as `service.js` and `main.css`, you cannot copy and paste it directly.


**welcome.html**

```html
<!DOCTYPE html>
<meta charset="utf-8" />

<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="main.css" />
<script src="https://cdn.jsdelivr.net/npm/skapi-js@latest/dist/skapi.js"></script>

<script src="service.js"></script>

<dialog id="el_dl_calling"></dialog>
<dialog id="el_dl_incoming"></dialog>

<script>
    let call = null; // Calling object. This is assigned when the user is calling someone.
    let receiver = null; // Receiver object. This is assigned when the user is receiving a call.
    let rtcConnection = null; // Resolved RTC connection. This is assigned when the user is connected with a user via RTC.
    let participants = {}; // Participants object. This is used to cache user information of the available participants in the list.
    let cidList = {}; // Connection ID list. This is used to cache the connection ID of the participants in the list.
</script>

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
    </script>

    <section id="el_dl_calllist">
        <h1>Connect WebRTC</h1>
        <label>
            <input type="checkbox" id="allow_video" checked /> Allow Video
        </label>
        <label>
            <input type="checkbox" id="allow_audio" checked /> Allow Audio
        </label>

        <br /><br />

        <table>
            <thead>
                <tr>
                    <th>Username</th>
                    <th style="text-align: right">Connection ID</th>
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

                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }

                tr:nth-child(odd) {
                    background-color: #ffffff;
                }
            </style>
            <tbody id="RealtimeParticipants">
                <!-- Available realtime participants will be displayed here -->
            </tbody>
        </table>
    </section>

    <br />

    <section style="text-align: center" id="el_video_call" hidden>
        <video id="local" autoplay muted></video>
        <video id="remote" autoplay muted></video>

        <style>
            video {
                max-width: 100%;
                width: 320px;
                height: 240px;
                border: solid 1px;
            }
        </style>

        <br /><br />

        <form
            onsubmit="event.preventDefault(); rtcConnection.channels.default.send(document.getElementById('el_input_rtcMessage').value); this.reset();"
        >
            <input
                type="text"
                id="el_input_rtcMessage"
                placeholder="Send RTC Message"
                name="message"
            />
            <input type="submit" value="Send" />
        </form>

        <br />

        <button type="button" onclick="rtcConnection.hangup()">
            Disconnect
        </button>
    </section>

    <section>
        <h1>Websocket Log</h1>
        <button
            type="button"
            onclick="document.getElementById('el_pre_rtcLog').innerText = ''"
        >
            Clear
        </button>
        <pre id="el_pre_rtcLog"></pre>
    </section>

    <style>
        pre {
            overflow-x: auto;
        }

        #el_pre_rtcLog {
            height: 320px;
            border: solid 1px #ccc;
            border-radius: 8px;
            padding: 16px;
        }
    </style>
</main>
<script>
    function RTCCallback(e) {
        let rtcLog = document.getElementById("el_pre_rtcLog"); // RTC Log
        console.log("RTC Callback:", e);

        switch (e.type) {
            // RTC Events
            case "negotiationneeded":
                rtcLog.innerText += `RTC negotiation needed. Sending offer..\n`;
                break;

            case "track":
                rtcLog.innerText += `Incoming Media Stream...\n`;
                document.getElementById("remote").srcObject = e.streams[0];
                document.getElementById("remote").play();
                break;

            case "connectionstatechange":
                let state = e.state;
                rtcLog.innerText +=
                    `RTC Connection:${e.type}:${state}\n` +
                    JSON.stringify(e, null, 2) +
                    "\n-\n";
                document.getElementById("el_dl_calling").close();
                document.getElementById("el_dl_incoming").close();

                let videoCallSection = document.getElementById("el_video_call");
                let callList = document.getElementById("el_dl_calllist");
                if (
                    state === "disconnected" ||
                    state === "failed" ||
                    state === "closed"
                ) {
                    videoCallSection.hidden = true;
                    callList.hidden = false;
                } else if (state === "connecting") {
                    // Callback executed when the user is connected to the server.
                    el_pre_rtcLog.innerText += "Connected\n";
                    videoCallSection.hidden = false;
                    callList.hidden = true;
                }
                break;

            // Data Channel Events
            case "close":
                rtcLog.innerText +=
                    `Data Channel:${e.target.label}:${e.type}\n` +
                    JSON.stringify(e, null, 2) +
                    "\n-\n";
                break;
            case "message":
                // Data Channel message received from remote peer
                rtcLog.innerText +=
                    `Data Channel:${e.target.label}:${e.type}\n` +
                    JSON.stringify(e.data, null, 2) +
                    "\n-\n";
                break;
            case "open":
            // Data Channel opened
            case "bufferedamountlow":
            case "error":
                rtcLog.innerText +=
                    `Data Channel:${e.target.label}:${e.type}\n` +
                    JSON.stringify(e, null, 2) +
                    "\n-\n";
                break;
        }
        // scroll to bottom
        rtcLog.scrollTop = el_pre_rtcLog.scrollHeight;
    }

    async function callRTC(cid) {
        event.preventDefault();

        let params = {
            media: {
                audio: document.getElementById("allow_audio").checked,
                video: document.getElementById("allow_video").checked,
            },
            cid,
        };

        call = await skapi.connectRTC(params, RTCCallback);

        document.getElementById("el_dl_calling").innerHTML = /*html*/ `
                <p>Calling</p>
                <button onclick="call.hangup()">Hangup</button>
            `;

        document.getElementById("el_dl_calling").showModal();
        rtcConnection = await call.connection;

        if (!rtcConnection) {
            alert("Call rejected.");
        }
        if (rtcConnection.media) {
            document.getElementById("local").srcObject = rtcConnection.media;
            document.getElementById("local").play();
        }
    }

    async function addCallList(user_id, cid) {
        if (user_id === skapi.user.user_id) {
            // If the user is the current user, return the current user info, and do not add to the list.
            participants[user_id] = skapi.user;
            return skapi.user;
        }

        let user = participants[user_id];
        if (!user) {
            user = (
                await skapi.getUsers({ searchFor: "user_id", value: user_id })
            ).list?.[0];
            participants[user_id] = user;
        }

        let RealtimeParticipants = document.getElementById(
            "RealtimeParticipants"
        );
        let username = `${user.name || user.email || user.user_id}`;

        // add the user to the list with the connection id and the call button
        RealtimeParticipants.innerHTML += /*html*/ `
            <tr id="el_tr_participant-${cid}">
                <td>
                    <strong>${username}</strong>
                </td>
                <td id="el_call-button-${cid}" style="text-align: right;">
                    ${cid}
                    <button type="button" onclick="callRTC('${cid}').catch(err=>alert(err.message))" style="width: fit-content">Call</button>
                </td>
            </tr>
        `;
        cidList[cid] = user_id;

        return participants[user_id];
    }

    function realtimeCallback(rt) {
        let log = rt;
        try {
            log = JSON.stringify(log, null, 2);
        } catch (err) {}

        el_pre_rtcLog.innerText += rt.type + ":\n" + log + "\n-\n";
        // scroll to bottom
        el_pre_rtcLog.scrollTop = el_pre_rtcLog.scrollHeight;
        if (rt.type === "notice") {
            // User joined the group
            let user_id = rt.sender;

            if (["USER_LEFT", "USER_DISCONNECTED"].includes(rt.code)) {
                // remove the user from the call list
                document
                    .getElementById(`el_tr_participant-${rt.sender_cid}`)
                    ?.remove();
                delete participants[rt.sender];
                delete cidList[rt.sender_cid];
            } else if (rt.code === "USER_JOINED") {
                // Add the user to the participants list
                addCallList(user_id, rt.sender_cid);
            }
        }

        if (rt.type === "rtc:incoming") {
            receiver = rt;
            let dl_incoming = document.getElementById("el_dl_incoming");
            // Show incoming call dialog
            dl_incoming.innerHTML = /*html*/ `
                <p>Incoming call</p>
                <button onclick='
                    receiver.connectRTC({
                        media: {
                            audio: document.getElementById("allow_audio").checked,
                            video: document.getElementById("allow_video").checked
                        }
                    }, RTCCallback)
                        .then(rtc => {
                            rtcConnection = rtc;
                            if(rtc.media) {
                                document.getElementById("local").srcObject = rtc.media;
                                document.getElementById("local").play();
                            }
                        })
                '>Accept</button>

                <button onclick="receiver.hangup();">Reject</button>
            `;

            dl_incoming.showModal();
        }
    }

    skapi.connectRealtime(realtimeCallback);

    function getRealtimeUsers(refresh) {
        skapi.getRealtimeUsers({ group: "RTCCall" }).then((res) => {
            res.list = res.list.filter((p) => p.user_id !== skapi.user.user_id); // remove current user from the list
            if (res.list.length) {
                res.list.map((p) => addCallList(p.user_id, p.cid));
            }
        });
    }

    skapi.joinRealtime({ group: "RTCCall" }).then((r) => {
        getRealtimeUsers();
    }); // Join a realtime group
</script>
```