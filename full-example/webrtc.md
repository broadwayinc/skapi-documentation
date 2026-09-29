# Full Example: RTC Video Chat

The RTC Video Chat page connects two browsers directly for video, audio and text with WebRTC, with Skapi doing the signaling over its realtime connection. It needs a logged-in user, and WebRTC works over HTTPS or on `localhost`. Open it in another browser or device with a second account and call each other.

<FullExampleDemo page="webrtc.html" label="Open the RTC Video Chat demo" />

You need your [project ID](/full-example/intro.md#have-your-project-id-ready) to open the demo.

![The RTC Video Chat page of the template: an explanation of the signaling, Video and Audio checkboxes, and the table of users online with a call button per user](/screenshots/template-webrtc.webp)

*`webrtc.html` before a call: the other users on the page, each with a call button.*

## What it demonstrates

| Feature | How the page does it |
| --- | --- |
| Finding each other | Every visitor of the page joins the realtime group `RTCCall`; `getRealtimeUsers()` and the `USER_JOINED` and `USER_LEFT` notices keep a table of the other users online, with their connection IDs. |
| Calling | [connectRTC()](/realtime/webRTC.md) with the other user's connection ID and the chosen media (video, audio). The call's `connection` promise resolves once the other side accepts. |
| Receiving a call | The callee gets an `rtc:incoming` realtime message and answers it with `connectRTC()` on that message to accept, or `hangup()` to reject. |
| The streams | The `track` event carries the other user's media stream into a video element; the caller's own stream is shown muted. |
| Text over the data channel | Messages typed on the page are sent over the connection's default data channel, straight between the two browsers, and shown on both sides. |
| Hanging up | `hangup()` on either side ends the call; the `connectionstatechange` event returns both pages to the user list. |

## Download

The page is part of the full template: [skapi-templates.zip](https://cdn.broadwayinc.com/temp/v2/skapi-templates.zip). See [Full Examples](/full-example/intro.md) for how to run it.
