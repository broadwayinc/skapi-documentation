# Full Example: RTC Video Chat

The RTC Video Chat page connects two browsers directly for video, audio, the screen and text with WebRTC, with Skapi doing the signaling over its realtime connection. It needs a logged-in user, and WebRTC works over HTTPS or on `localhost`. Open it in another browser or device with a second account and call each other.

<FullExampleDemo page="webrtc.html" label="Open the RTC Video Chat demo" />

You need your [project ID](/full-example/intro.md#have-your-project-id-ready) to open the demo.

![The RTC Video Chat page of the template: an explanation of the signaling, Video, Audio and Screen checkboxes, and the table of users online with a call button per user](/screenshots/template-webrtc.webp)

*`webrtc.html` before a call: what to call with, and the other users on the page, each with a call button.*

![The page during a call: tiles for your camera, your screen and the other user's camera, buttons to stop sharing, mute the microphone, turn the camera off and hang up, and the data channel message form](/screenshots/template-webrtc-call.webp)

*During a call with the screen shared. Each stream has its own tile; the buttons change what is sent without ending the call.*

## What it demonstrates

| Feature | How the page does it |
| --- | --- |
| Finding each other | Every visitor of the page joins the realtime group `RTCCall`; `getRealtimeUsers()` and the `USER_JOINED` and `USER_LEFT` notices keep a table of the other users online, with their connection IDs. |
| Calling | [connectRTC()](/realtime/webRTC.md) with the other user's connection ID and the chosen `media`: the camera, the microphone and the screen, from the checkboxes. `meta` names the kind of call. The call's `connection` promise resolves once the other side accepts. |
| Receiving a call | The callee gets an `rtc:incoming` realtime message. Its `meta` and `sources` fill the dialog ("Incoming screen share from ... They send their camera, microphone and screen"), and `connectRTC()` on the message accepts with the callee's own checkboxes, or `hangup()` rejects. An `rtc:closed` message closes the dialog when the caller cancels. |
| The streams | Every `track` event carries `source`. The other user's camera and microphone go to one tile, the screen to another, and `trackmute` hides the screen tile when they stop sharing. The local tiles come from `tracks('camera')` and `tracks('screen')`. |
| Screen sharing during the call | **Share screen** calls `share('screen', { contentHint: 'text' })`, **Stop sharing** calls `unshare('screen')`. The `unshare` event resets the page, also when the browser's own Stop sharing button ends the share. |
| Mute | **Mute microphone** and **Turn camera off** call `mute({ audio })` and `mute({ video })`. The tracks stay on the call and send silence or black frames. |
| Text over the data channel | Messages typed on the page are sent over the connection's default data channel, straight between the two browsers, and shown on both sides. |
| Hanging up | `hangup()` on either side ends the call; the `connectionstatechange` event returns both pages to the user list. |

## Download

The page is part of the full template: [skapi-templates.zip](https://cdn.broadwayinc.com/temp/v3/skapi-templates.zip). See [Full Examples](/full-example/intro.md) for how to run it.
