# WebRTC

Skapi provides easy integration of WebRTC, allowing developers to quickly set up real-time communication features in their applications.

WebRTC (Web Real-Time Communication) is a technology that enables peer-to-peer media and data streaming between two parties.
This can be used for video calls, voice calls, and data exchange, making it a versatile tool for various real-time communication needs.

:::danger HTTPS REQUIRED.
WebRTC only works on HTTPS environment.
You need to setup a HTTPS environment when developing a WebRTC feature for your web application.

You can host your application in skapi.com or host from your personal servers.
:::

## Creating RTC Connection

To create RTC connection, both party needs to be online and need to utilize realtime connection.

1. Both party should create realtime connection by using [`connectRealtime()`](/api-reference/realtime/README.md#connectrealtime) method.

2. Once both parties are connected to realtime, both parties should join same realtime group by using [`joinRealtime()`](/api-reference/realtime/README.md#joinrealtime)

3. Now both parties can see each other's `connection ID(cid)` either by calling [`getRealtimeUsers()`](/api-reference/realtime/README.md#getrealtimeusers) method or from the [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback).
   
   One of the party can request RTC connection by using the opponent's `cid` with [`connectRTC()`](/api-reference/realtime/README.md#connectrtc) method.

4. If media streaming is used, users should give permission to allow their device to be used.


Below is an example code of the process:


### 1. Basic UI Interface

Here we will add video element to display users and simple dialog to display incomming calls.

```html
<!-- skapi should be previously initialized... -->

<style>
    video {
        width: 320px;
        height: 240px;
        border: 1px solid black;
    }
</style>

<!-- Below are the video elements which it will display incoming / outgoing media streams -->
<video id="localVideo" autoplay muted></video>
<video id="remoteVideo" autoplay></video>

<!-- This will be a dialog for outgoing, incomming calls -->
<dialog id="call_dialog"></dialog>
```

### 2. Setting Up Realtime and RTC

Below is an simple example of setting up RTC video call.

```js
let call = null; // This will later be defined to resolved RTC connection object.

// RTC event listener
// This callback is used on connectRTC() on both calling and receiving side.
function RTCEvent(e) {
    if (e.type === 'track') {
        // Incoming Media Stream...
        document.getElementById('remoteVideo').srcObject = e.streams[0];
        call_dialog.close();
    }
}
// Realtime event listener
// This callback will listen to user joining the room.
function RealtimeCallback(rt) {
    if(rt.type === 'notice') {
        if(rt.code === 'USER_JOINED') {
            if(call) return;

            // When opponent joins a room, and it's not the user itself, user can make a RTC call
            if(skapi.user.user_id !== rt.sender) {
                call = await skapi.connectRTC({cid: rt.sender_cid, media: { audio: true, video: true}}, RTCEvent);

                call_dialog.innerHTML = /*html*/`
                    <p>Outgoing call</p>
                    <button onclick="call.hangup(); call_dialog.close();">Reject</button>
                `;

                call_dialog.showModal(); // Display outgoing call dialog

                rtcConnection = await call.connection; // Save resolved RTC connection object
                document.getElementById('localVideo').srcObject = rtcConnection.media; // Show outgoing local media stream
            }
        }
    }

    if (rt.type === 'rtc:incoming') {
        // incomming rtc call
        call = rt;

        call_dialog.innerHTML = /*html*/`
            <p>Incoming call</p>
            <button onclick='
                call.connectRTC({ media: {audio: true, video: true} }, RTCEvent)
                    .then(rtc => {
                        rtcConnection = rtc; // Save resolved RTC connection object
                        document.getElementById("localVideo").srcObject = rtcConnection.media; // Show outgoing local media stream
                        call_dialog.close();
                    })
            '>Accept</button>
            <button onclick="call.hangup(); call_dialog.close();">Reject</button>
        `;

        call_dialog.showModal(); // Display incoming call dialog
    }

    else if (rt.type === 'rtc:closed') {
        // rtc connection is closed
        call = null;
    }
}

skapi.connectRealtime(RealtimeCallback); // Connect to realtime
skapi.joinRealtime({ group: 'RTCCall' }); // Join a realtime group
```