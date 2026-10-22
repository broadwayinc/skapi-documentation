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
    - Remote stream arrives in the `track` event and is shown in the remote video element. Each `track` event says what the track is (`source`: the camera, the microphone, the screen).
    - Connection lifecycle events (`connecting`, `connected`, `disconnected`, `failed`, `closed`) update UI and cleanup state.
    - Optional RTC data channel events (`open`, `message`, `close`, etc.) are handled in the same callback.

In short: **Realtime is used for signaling (who is online, incoming call events), and WebRTC is used for the actual peer-to-peer media/data connection.**

A call is not limited to the camera and the microphone: it can carry the screen, a stream of your own, data channels, or any mix, and either side can add and remove things while the call runs. The sections after the basic example go through that.


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
            // e.source says what arrived: 'camera', 'microphone', 'screen'... (see "Telling the tracks apart")
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

## What a call can carry

`connectRTC()` takes, besides `cid`, the options below. The answering side's `connectRTC()`, on its `rtc:incoming` message, takes the same options except `meta` and `ringTimeout`. Each side decides for itself what it sends; the two do not have to match. A voice call can be answered with the camera on, and a screen share can be watched without sending anything back.

| Option | What it does |
| --- | --- |
| `media` | What this side sends. An object `{ audio, video, screen }`: the microphone, the camera and the screen, each `true`, `false`, or the browser's own constraints (`video: { facingMode: 'environment' }`, `screen: { contentHint: 'text' }`). Or a `MediaStream` of your own, sent as it is: a canvas, a mixed or processed stream. Omitted, or everything false: no media at all. A data channel is enough for a connection. |
| `receive` | A kind you want to get without sending it: `{ video: true }` for a viewer with no camera. Without it a track the other side adds later still arrives, after a renegotiation. |
| `channels` | The data channels this side opens: preset names, or `RTCDataChannelInit` with `protocol` as the label. The caller opens `default` when the option is omitted; the answering side opens none. |
| `encoding` | The codec order and the limits of what this side sends: `maxBitrate`, `maxFramerate`, `scaleResolutionDownBy`. |
| `meta` | Caller only. A small JSON object the other side gets on its `rtc:incoming` message before it answers: what the call is about, in your own words. |
| `ringTimeout` | Caller only. Milliseconds to wait for an answer. Nothing by default. |
| `ice`, `icePolicy` | The servers the connection goes through. See [The relay](#the-relay). |

```js
// a screen share with voice; the other side learns what it is before answering
const call = await skapi.connectRTC({
    cid,
    media: { audio: true, video: false, screen: { contentHint: 'text' } },
    meta: { kind: 'screen', title: 'Design review' },
    ringTimeout: 30000
}, RTCCallback);

const rtc = await call.connection; // resolves once the other side answers
```

```js
// the answering side, on its rtc:incoming message
rt.meta;    // { kind: 'screen', title: 'Design review' }
rt.sources; // ['microphone', 'screen']: what the caller is sending

const rtc = await rt.connectRTC({ media: { audio: true, video: true } }, RTCCallback);
```

The types are [RTCConnectorParams](/api-reference/data-types/README.md#rtcconnectorparams) and [RTCReceiverParams](/api-reference/data-types/README.md#rtcreceiverparams). The camera, the microphone and the screen need HTTPS or `localhost`; a data channel on its own does not.

## Screen sharing

`media.screen` sends the screen from the start, and `share('screen')` adds it during a call. Both open the browser's own picker, where the user chooses a screen, a window or a tab. `contentHint: 'text'` keeps text on the shared screen sharp; `'motion'` favours smooth movement. `screen: { audio: true }` asks for the tab's or system's sound too, where the browser offers it.

```js
// at the start of the call
skapi.connectRTC({ cid, media: { audio: true, video: true, screen: { contentHint: 'text' } } }, RTCCallback);

// during the call: a toggle
if (rtc.tracks('screen').length) {
    rtc.unshare('screen');
}
else {
    await rtc.share('screen', { contentHint: 'text' });
}
```

The camera and the screen go out together. On the other side each arrives as its own `track` event, one with `source: 'camera'` and one with `source: 'screen'`, each in its own stream. Give the screen its own `<video>` element: a video element plays one video track, so a stream holding two shows only the first.

```js
case 'track':
    if (e.source === 'screen') {
        screenVideo.srcObject = e.streams[0];
    }
    else {
        cameraVideo.srcObject = e.streams[0]; // the camera and the microphone share one stream
    }
    break;

case 'trackmute':   // the other side stopped sharing (or the network stalled)
case 'trackended':
    if (e.source === 'screen') {
        screenVideo.hidden = true;
    }
    break;
```

When the user ends the share from the browser's own **Stop sharing** button, the track ends on its own. The SDK takes it off the call and raises an `unshare` event with `source: 'screen'` and `ended: true`, so the page can reset its button. The other side sees `trackmute`.

## During the call

The connection object (what `call.connection` resolves with on the caller's side, and what `rt.connectRTC()` resolves with on the answering side) carries the controls of a running call. Either side may use them: the connection renegotiates on its own, in both directions.

| | |
| --- | --- |
| `share(what, options)` | Adds to the call: `'screen'`, `'camera'`, `'microphone'`, or a `MediaStream` or `MediaStreamTrack` of your own. Resolves with the tracks added. `options`: the capture options (`{ contentHint: 'text' }` for the screen, `{ facingMode: 'environment' }` for the camera), or `{ source: 'whiteboard' }` to name a stream of your own on the other side. |
| `unshare(what)` | Takes the tracks of a source, or one track, off the call and stops them. |
| `replace(what, track)` | Swaps a track for another of the same kind without a new negotiation: a camera switch, another microphone. The old track is stopped. |
| `mute({ audio, video, screen })` | Pauses or resumes what is sent: `true` pauses, `false` resumes, omitted leaves it. `audio` is the microphone, `video` the camera (and other video), `screen` the screen. A paused track keeps its place on the call and sends silence or black frames; the other side gets no event for it, so tell it over a data channel when its page should show "muted". |
| `addChannel(name, init)` | Opens a data channel during the call. |
| `sendFile(file, options)` | Sends a file straight to the other browser. See [Sending files](#sending-files). |
| `tracks(source)` | The local tracks, all of them or those of one source. |
| `media`, `meta`, `cid`, `target`, `channels`, `hangup()` | Every local track as one stream, the caller's `meta`, the other side's connection id, the `RTCPeerConnection`, the data channels by label, and the end of the call. |

```js
// a camera switch on a phone: no renegotiation, the other side sees the new picture at once
const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
await rtc.replace('camera', stream.getVideoTracks()[0]);

// a canvas as a second video, named for the other side
const whiteboard = canvas.captureStream(15);
await rtc.share(whiteboard, { source: 'whiteboard' });

// microphone off, and on again
rtc.mute({ audio: true });
rtc.mute({ audio: false });
```

Hanging up stops every local track of the call, including a stream you passed in, and only that call's: two calls at once keep their tracks apart. The type is [RTCResolved](/api-reference/data-types/README.md#rtcresolved).

## Telling the tracks apart

Every `track` event carries `source`, what the other side says the track is: `camera`, `microphone`, `screen`, `custom` for a stream it passed without a name, or the name it gave `share()`. It is set when the other side runs skapi-js 2.2.13 or later; from an older version it is undefined.

Before the call is answered, the `rtc:incoming` message carries `sources`, the list of what the caller sends (`['camera', 'microphone']`, `['screen']`, `[]` for a data-only call), and `meta`, the caller's own description. That is enough to say "Incoming screen share from Alice" in the dialog.

What happens to a track later comes as events in the same callback:

| Event | When |
| --- | --- |
| `trackmute`, `trackunmute`, `trackended` | A track of the other side stopped arriving (paused, taken off the call, the network stalled), resumed, or is gone for good. Same fields as `track`. |
| `unshare` | A local track left the call: `unshare()` was called, or the track ended on its own (`ended: true`). |
| `ringtimeout` | Nobody answered within `ringTimeout`. The call closes right after, with a `connectionstatechange` of `closed`. |

Data channel events (`open`, `message`, `close`, `error`) carry `label`, the channel's name, so a page with several channels can tell them apart. The full list is [RTCEvent](/api-reference/data-types/README.md#rtcevent).

## Data channels

A data channel carries text or binary messages straight between the two browsers. `channels` opens them at the start, `addChannel()` later, and a connection may have as many as you like, each with its own reliability: a text chat wants every message, in order; a game wants the latest state and nothing stale.

```js
// the caller opens two channels: a reliable one for strokes, a lossy one for cursor positions
skapi.connectRTC({
    cid,
    channels: [{ protocol: 'drawing', ordered: true }, { protocol: 'cursor', ordered: false, maxPacketLifeTime: 100 }]
}, RTCCallback);

// either side, later
rtc.channels.drawing.send(JSON.stringify({ from, to, color }));
const extra = rtc.addChannel('files', { ordered: true });
```

The preset names `text-chat`, `file-transfer`, `video-chat`, `voice-chat` and `gaming` stand for ready-made options, listed under [RTCChannelOption](/api-reference/data-types/README.md#rtcchanneloption). A string that is not a preset opens a channel of that name with the default options. The caller opens `default` when `channels` is omitted; the answering side opens none, and gets the caller's.

The answering side may open channels of its own with `channels` too. Give the two sides different labels: a channel that arrives from the other side under a label this side already uses is kept as `label#id` in `channels`. A channel both sides should open themselves takes `negotiated: true` and the same `id` on both.

A channel's messages arrive as `message` events with `data` and `label`. When the last data channel of a connection closes, the connection closes with it.

## Sending files

`sendFile()` on the connection sends a file straight to the other browser: nothing is uploaded anywhere. The SDK opens a reliable, ordered data channel of its own the first time either side sends a file, cuts the file into 16 KB pieces, waits whenever the connection's buffer is full, and resolves once the other side has every byte. Files from one side go one after another, so two `sendFile()` calls in a row arrive in that order.

```js
// the sender, from a file input
const file = input.files[0];
const info = await rtc.sendFile(file, { onProgress: (sent, total) => bar.value = sent / total });
// info: { id, name, size, mime }

// the receiver, in the same callback as everything else
case 'fileprogress':
    bar.value = e.received / e.size; // e.id, e.name, e.size, e.mime
    break;
case 'file':
    const link = document.createElement('a');
    link.href = URL.createObjectURL(e.file); // e.file is a File with the sender's name and type
    link.download = e.name;
    break;
```

The receiving side gets a `fileprogress` event as the file starts, every 256 KB, and at the end, then a `file` event holding the whole file as a `File`. The file is kept in the receiving browser's memory until the page lets go of it, so this is the right tool for documents, pictures and the like, and a video of a few gigabytes is better served another way. `sendFile()` rejects when the call ends before the file is through. The types are [RTCSendFileOptions](/api-reference/data-types/README.md#rtcsendfileoptions) and [RTCFileInfo](/api-reference/data-types/README.md#rtcfileinfo).

## Viewers that send nothing

A side that only watches passes no `media` and asks for what it wants with `receive`. A track of a kind the other side never offered still arrives later, after a renegotiation, but `receive` has it in the first negotiation.

```js
// the presenter
skapi.connectRTC({ cid, media: { screen: true }, meta: { kind: 'screen' } }, RTCCallback);

// the viewer: no camera, no microphone, wants the video and whatever sound comes
rt.connectRTC({ receive: { video: true, audio: true } }, RTCCallback);
```

The viewer can still speak up later with `rtc.share('microphone')`.

## Codecs and bitrate

`encoding` shapes what this side sends: the codec order for the negotiation and the limits on each sender. It applies to the tracks on the call and to those `share()` adds later. Bitrates are in bits per second.

```js
skapi.connectRTC({
    cid,
    media: { screen: { contentHint: 'text' } },
    encoding: {
        video: { codecs: ['VP9', 'VP8'], maxBitrate: 1500000, maxFramerate: 15 },
        audio: { maxBitrate: 32000 }
    }
}, RTCCallback);
```

Codec names are matched against what the browser can decode (`'VP9'`, `'H264'`, `'AV1'`, or a mime type such as `'video/VP9'`); a name the browser does not have is skipped. The type is [RTCEncodingOption](/api-reference/data-types/README.md#rtcencodingoption).

## Ringing, rejecting and timing out

`call.hangup()` on the caller's side cancels the call while it rings, and hangs up once it is up. The other side then gets an `rtc:closed` message after its `rtc:incoming`; close the dialog on it.

```js
if (rt.type === 'rtc:closed' && receiver?.sender_cid === rt.sender_cid) {
    callDialog.close(); // the caller cancelled before this side answered
    receiver = null;
}
```

`rt.hangup()` on the answering side rejects. The caller sees a `connectionstatechange` event with `closed`; its `call.connection` never resolves. With `ringTimeout`, a call nobody answers raises `ringtimeout` and closes the same way.

## The relay

A call is set up with two kinds of server, and the SDK arranges both for you:

- **STUN** (`stun:stun.skapi.com:3468`) tells each browser its public address, so the two can connect directly. Most calls connect this way.
- **TURN** (`turn.skapi.com`) is a relay both browsers connect to, which passes the media between them. It carries the calls that cannot connect directly: when one of the two networks maps ports per destination (a common router setting, and most mobile carriers), or a firewall blocks direct traffic. Without a relay such a call sits on "connecting" and drops.

When `ice` is not given, `connectRTC()` on both ends asks the realtime server for the servers to use and gets Skapi's STUN server plus the relay with a credential made for the user, valid for 12 hours. Nothing is written into your page, and the browser still connects directly whenever it can, using the relay only when it must.

### Using your own servers

To use your own STUN or TURN servers instead, give `ice` a list. Each entry is `{ urls, username, credential }`, the browser's own `RTCIceServer` format; a TURN entry needs its login. Both ends have to pass the same option, since both need to reach the relay. `ice` also still takes a single STUN url, as before.

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

A list that is empty, a url that does not start with `stun:`, `stuns:`, `turn:` or `turns:`, or a TURN entry without `username` and `credential` is refused with `INVALID_PARAMETER`.

### Forcing the relay

`icePolicy: 'relay'` makes a side send everything through the relay, even where a direct path exists: for a test of the relay, or where a user's address must not be shown to the other side. It costs relay bandwidth on every such call. Each side sets it for itself; `'all'`, the default, lets the browser connect directly when it can.

```js
skapi.connectRTC({ cid, icePolicy: 'relay', media: { audio: true } }, RTCCallback);
```
