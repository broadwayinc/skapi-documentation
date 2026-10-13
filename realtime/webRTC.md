# WebRTC

Skapi makes WebRTC integration easy, allowing developers to quickly add real-time communication features to their applications.

WebRTC (Web Real-Time Communication) is a technology that enables peer-to-peer media and data streaming between two parties.
This can be used for video calls, voice calls, and data exchange, making it a versatile tool for various real-time communication needs.

:::danger HTTPS REQUIRED.
WebRTC only works in an HTTPS environment.
You need to set up an HTTPS environment when developing WebRTC features for your web application.

You can host your application on skapi.com or on your own servers.
:::

## Creating RTC Connection

To create an RTC connection, both parties must be online and connected to Realtime.

One user initiates the call with the other user's `cid` via [`connectRTC()`](/api-reference/realtime/README.md#connectrtc), and the other user receives an `rtc:incoming` event.

If media streaming is enabled, users must grant camera/microphone permission.

## Overall Flow

Before reading the full code, here is the call flow in plain language:

1. **Both users connect to Realtime**  
    Each browser starts a Realtime connection with [`connectRealtime()`](/api-reference/realtime/README.md#connectrealtime) and joins the same room with [`joinRealtime()`](/api-reference/realtime/README.md#joinrealtime).

2. **Users discover each other in the room**  
    When someone joins, Realtime sends a `USER_JOINED` notice via [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback), which includes the user's connection info (`cid`).
    Both parties can also see each other's `connection ID (cid)` by calling [`getRealtimeUsers()`](/api-reference/realtime/README.md#getrealtimeusers).

3. **One user starts a call**  
    The caller uses the other user's `cid` with `connectRTC(...)` to begin WebRTC negotiation.

4. **The other user receives an incoming call**  
    The receiver gets an `rtc:incoming` event and can accept or reject.
    - If accepted, `connectRTC(...)` completes on the receiver side.
    - Both browsers request camera/microphone access if media is enabled.

5. **Media streams and connection events are handled**  
    - Local stream is shown in the local video element.
    - Remote stream arrives in the `track` event and is shown in the remote video element.
    - Connection lifecycle events (`connecting`, `connected`, `disconnected`, `failed`, `closed`) update UI and cleanup state.
    - Optional RTC data channel events (`open`, `message`, `close`, etc.) are handled in the same callback.

In short: **Realtime is used for signaling (who is online, incoming call events), and WebRTC is used for the actual peer-to-peer media/data connection.**


### 1. Basic UI Interface

Here we add video elements to display local and remote streams, and a simple dialog for incoming/outgoing calls.
The `call_dialog` &lt;dialog&gt; content is generated dynamically when an RTC call event occurs.

```html
<!-- skapi should be previously initialized... -->

<style>
    video {
        width: 320px;
        height: 240px;
        border: 1px solid black;
    }
</style>

<!-- Video elements for displaying local and remote media streams -->
<video id="localVideo" autoplay muted></video>
<video id="remoteVideo" autoplay hidden></video>

<!-- Dialog used for outgoing and incoming calls -->
<dialog id="call_dialog"></dialog>
```

### 2. Setting Up Realtime and RTC

Below is a simple example of setting up an RTC video call.

```js
let call = null; // This will later be set to the resolved RTC connection object.

// This RTCCallback is used in connectRTC() on both the calling and receiving sides.

function RTCCallback(e) {
    console.log("RTC Callback:", e);

    switch (e.type) {
        // RTC Events
        case "negotiationneeded":
            // RTC negotiation is needed. Send an offer.
            break;

        case "track":
            // Attach the incoming media stream to the remote video element.
            document.getElementById('remoteVideo').srcObject = e.streams[0];
            document.getElementById("remoteVideo").play();
            break;

        case "connectionstatechange":
            // RTC connection state

            if (
                e.state === "disconnected" ||
                e.state === "failed" ||
                e.state === "closed"
            ) {
                // RTC has disconnected. Hide the opponent video element.
                document.getElementById('remoteVideo').hidden = true;
                
            } else if (e.state === "connecting") {
                // Callback executed when the user is connected to RTC.
                // Show the opponent video element.
                document.getElementById('remoteVideo').hidden = false;
            }
            break;

        // Data Channel Events
        case "close":
            // Data channel is closed
            break;
        case "message":
            // Data channel message received from remote peer.
            console.log(`Message received from RTC data channel:`, e.data);
            break;
        case "open":
            // Data channel opened
            break;
        case "bufferedamountlow":
            // Data channel low buffer
            break;
        case "error":
            // Data channel error
            break;
    }
}

// Realtime event listener
// This callback listens for users joining the room.
async function RealtimeCallback(rt) {
    if(rt.type === 'notice') {
        if(rt.code === 'USER_JOINED') {
            if(call) return;

            // When another user joins the room, start an RTC call.
            if(skapi.user.user_id !== rt.sender) {
                call = await skapi.connectRTC({cid: rt.sender_cid, media: { audio: true, video: true}}, RTCCallback);

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
        // incoming RTC call
        call = rt;

        call_dialog.innerHTML = /*html*/`
            <p>Incoming call</p>
            <button onclick='
                call.connectRTC({ media: {audio: true, video: true} }, RTCCallback)
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
        // RTC connection is completely closed
        call = null;
    }
}

skapi.connectRealtime(RealtimeCallback); // Connect to Realtime
skapi.joinRealtime({ group: 'RTCCall' }); // Join a Realtime group
```

## Adding a TURN relay

By default the connection is set up with Skapi's STUN server, `stun:stun.skapi.com:3468`. It tells each browser its public address, and the two browsers then connect directly. That works on most networks.

Some networks, such as strict company firewalls and some mobile carriers, block direct connections between two outside parties. A call from such a network never connects. The way through is a **TURN server**: a relay both browsers connect to, which passes the media between them. Skapi does not provide one; use your own (for example coturn) or a hosted TURN service.

Give it to the SDK with `ice` as a list. Each entry is `{ urls, username, credential }`, the browser's own `RTCIceServer` format, and a TURN entry needs its login. Keep the STUN entry in the list: the browser still connects directly whenever it can and uses the relay only when it must, which keeps relay traffic, and its cost, down.

```js
const ice = [
    { urls: 'stun:stun.skapi.com:3468' },
    { urls: ['turn:turn.example.com:3478', 'turns:turn.example.com:5349'], username: 'user-1760000000', credential: 'short-lived-password' }
];

// the caller
skapi.connectRTC({ cid, ice, media: { audio: true, video: true } }, RTCCallback);

// the one answering: the same option, so both ends can reach the relay
call.connectRTC({ ice, media: { audio: true, video: true } }, RTCCallback);
```

:::warning
Do not write a fixed TURN password into your page; anyone could copy it and relay their own traffic on your bill. Most TURN services issue short-lived credentials per user. Fetch them when a call starts, for example from your own endpoint or a [ticket](/tickets/introduction.md), and pass them in `ice`.
:::

`ice` still takes a single url as before. A list that is empty, a url that does not start with `stun:`, `stuns:`, `turn:` or `turns:`, or a TURN entry without `username` and `credential` is refused with `INVALID_PARAMETER`.
