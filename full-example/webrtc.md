# Full Example: RTC Video Chat

The RTC Video Chat page is a video call between two users, straight from one browser to the other, with the screen, a text chat and file transfer on the same connection. Skapi does the signaling over its realtime connection. It needs a logged-in user, and WebRTC works over HTTPS or on `localhost`. Open it in another browser or device with a second account and call each other.

<FullExampleDemo page="webrtc.html" label="Open the RTC Video Chat demo" />

You need your [project ID](/full-example/intro.md#have-your-project-id-ready) to open the demo.

![The RTC Video Chat page of the template: a short explanation and the table of users online with a call button per user](/screenshots/template-webrtc.webp)

*`webrtc.html` before a call: the other users on the page, each with a call button. The camera and the microphone are always on a call.*

![The page during a call with both users sharing their screens: four tiles in the order your camera, the other user's camera, your screen and theirs, the buttons, and the chat with its input above the newest message](/screenshots/template-webrtc-call.webp)

*During a call with both screens shared: each side's screen is its own track, so both can share at once. Every tile is 4:3 with the picture centered inside, and the chat keeps the newest message on top, right under the input.*

![The call in fullscreen on a wide screen: the chosen video fills the left, the other videos are thumbnails on the right above the call buttons and the chat](/screenshots/template-webrtc-fullscreen.webp)

*Fullscreen, after clicking a tile: the chosen video on the stage, the others as thumbnails, then the call buttons and the chat, with the input at the bottom. On a phone the layout changes to one video per user; Escape or the Back button leaves fullscreen.*


## What it demonstrates

| Feature | How the page does it |
| --- | --- |
| Finding each other | Every visitor of the page joins the realtime group `RTCCall`; `getRealtimeUsers()` and the `USER_JOINED` and `USER_LEFT` notices keep a table of the other users online, with their connection IDs. |
| Calling | [connectRTC()](/realtime/webRTC.md) with the other user's connection ID and `media: { audio: true, video: true }`. `meta` names the kind of call. The call's `connection` promise resolves once the other side accepts. |
| Receiving a call | The callee gets an `rtc:incoming` realtime message. Its `meta` and `sources` fill the dialog, `connectRTC()` on the message accepts, `hangup()` rejects. An `rtc:closed` message closes the dialog when the caller cancels. |
| The tiles | Four tiles in a fixed order: your camera, the other user's camera, your screen, theirs. Each shows when its track exists. Every `track` event carries `source`, which routes the other user's camera and screen to their tiles; `trackmute` hides the screen tile when they stop sharing. The tiles are 4:3 and the picture is centered inside, never stretched. |
| Screen sharing during the call | **Share screen** calls `share('screen', { contentHint: 'text' })`, **Stop sharing** calls `unshare('screen')`. The `unshare` event resets the page, also when the browser's own Stop sharing button ends the share. |
| Mute | **Mute microphone** and **Turn camera off** call `mute({ audio })` and `mute({ video })`. The tracks stay on the call and send silence or black frames. |
| Text chat | Messages go over the connection's default data channel and are shown with the sender's name (or email address; a guest signed in with `anonymousLogin()` shows as Guest), newest first, right under the input. |
| Files | **Send a file**, first in the row of call buttons, calls [sendFile()](/realtime/webRTC.md#sending-files); the other side gets `fileprogress` events and then a `file` event, shown in the chat as a progress bar that turns into a download link. The file goes straight between the two browsers. |
| Fullscreen | Clicking a tile puts the call section in fullscreen, with the browser's Fullscreen API where it is allowed and a full-window overlay elsewhere. On a wide screen the clicked video takes the stage and the others become thumbnails above the call buttons and the chat, which then has its input at the bottom. On a phone one video per user is shown, upright on top of each other and sideways side by side, with the buttons and a three line chat; a tap on a video switches it between that user's screen and camera, and a screen the other user starts sharing takes over their view on its own. A `pushState` entry lets the Back button leave fullscreen instead of the page. |
| Hanging up | `hangup()` on either side ends the call; the `connectionstatechange` event returns both pages to the user list. |

## Download

The page is part of the full template: [skapi-templates.zip](https://cdn.broadwayinc.com/temp/v8/skapi-templates.zip). See [Full Examples](/full-example/intro.md) for how to run it.
