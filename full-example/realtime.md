# Full Example: Realtime Chat

The Realtime Chat page is a group chat with private messages, built on Skapi's realtime connection. It needs a logged-in user. Open it in another browser or device with a second account and join the same group to chat.

<FullExampleDemo page="realtime.html" label="Open the Realtime Chat demo" />

You need your [project ID](/full-example/intro.md#have-your-project-id-ready) to open the demo.

![The Realtime Chat page of the template: an explanation of the realtime API, a form to create a group and the table of chat groups](/screenshots/template-realtime.webp)

*`realtime.html` before a group is joined: create a group, or pick one from the table.*

## What it demonstrates

| Feature | How the page does it |
| --- | --- |
| Connecting | [connectRealtime()](/realtime/connecting.md) opens the WebSocket connection once the user is known, with one callback that receives every message. |
| Listing and creating groups | [getRealtimeGroups()](/realtime/group.md) lists the groups that have someone in them. Creating a group is joining a name nobody has joined yet. |
| Joining a group | [joinRealtime()](/realtime/group.md) with the group name from the URL hash; `getRealtimeUsers()` lists who is already there, and their profiles come from [getUsers()](/user-account/get-users.md). |
| Group messages | [postRealtime()](/realtime/post.md) with the form and the group name. Everyone in the group, including the sender, receives it as a `message`. |
| Private messages | Clicking a name in the participant list opens a dialog; `postRealtime()` with a user ID instead of a group name delivers the message to that user only, as a `private` message. |
| Joining and leaving | The `notice` messages with the codes `USER_JOINED`, `USER_LEFT` and `USER_DISCONNECTED` keep the participant list current. |

## Download

The page is part of the full template: [skapi-templates.zip](https://cdn.broadwayinc.com/temp/v2/skapi-templates.zip). See [Full Examples](/full-example/intro.md) for how to run it.
