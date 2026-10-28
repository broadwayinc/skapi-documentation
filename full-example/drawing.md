# Full Example: Shared Drawing

The Shared Drawing page puts two users on one canvas. Every stroke travels over a WebRTC data channel, straight from one browser to the other, and is drawn on the other side as it happens. No video is involved: a stroke is a few numbers, so it costs almost no bandwidth and both sides draw at once. A text chat rides on the same connection. It needs a logged-in user. Open it in another browser or device with a second account and invite each other.

<FullExampleDemo page="drawing.html" label="Open the Shared Drawing demo" />

You need your [project ID](/full-example/intro.md#have-your-project-id-ready) to open the demo.

![The Shared Drawing page of the template: an explanation of the data channel and the table of users online with an invite button per user](/screenshots/template-drawing.webp)

*`drawing.html` before a session: the other users on the page, each with an invite button.*

![The page during a session: pen colors, Clear and Leave buttons, the canvas with strokes from both users, and the chat below it](/screenshots/template-drawing-board.webp)

*Drawing together. Each side draws locally and sends the segment; the other side draws the same segment. The chat under the board carries the text.*

## What it demonstrates

| Feature | How the page does it |
| --- | --- |
| Finding each other | Every visitor joins the realtime group `RTCDraw`; `getRealtimeUsers()` and the `USER_JOINED` and `USER_LEFT` notices keep the table of users online. |
| A connection without media | [connectRTC()](/realtime/webRTC.md#data-channels) with `channels: [{ protocol: 'drawing', ordered: true }, 'text-chat']` and no `media`: an ordered, reliable channel for the strokes, the `text-chat` preset for the chat, and nothing else. No permission prompt, no camera, no microphone. |
| Saying what the call is | `meta: { kind: 'drawing' }` travels with the invitation, and the callee's dialog says "wants to draw with you" rather than showing a video call. |
| Strokes over the channel | Pointer events draw on the local canvas and send each segment as JSON (`from`, `to`, `color`, `width`), with positions as fractions of the canvas size. The other side draws the same segment in the `message` event of the `drawing` channel, told apart from other channels by `label`. |
| Clear | A `clear` message empties both canvases. |
| Chat | Text goes over the `text-chat` channel and is shown with the sender's name, newest first under the input. |
| Leaving | `hangup()` on either side; the `connectionstatechange` event returns both pages to the user list and clears the board. |

## Download

The page is part of the full template: [skapi-templates.zip](https://cdn.broadwayinc.com/temp/v8/skapi-templates.zip). See [Full Examples](/full-example/intro.md) for how to run it.
