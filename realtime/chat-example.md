# Skapi HTML Chat Full Example

This is a HTML example for building basic chat application using Skapi's realtime features.

Users must login to post and fetch realtime messages.

This example features:

- Creating, joining, and leaving chat rooms
- Sending and receiving websocket messages
- Fetching messengers info
- Sending private messeges to user

All the main code is in **welcome.html**

## Recommended VSCode Extention

For HTML projects we often tend to use element.innerHTML.

So we recommend installing innerHTML string highlighting extention like one below:

[es6-string-html](https://marketplace.visualstudio.com/items/?itemName=Tobermory.es6-string-html)


## Download

Download the full project [Here](https://github.com/broadwayinc/skapi-chat-html-template/archive/refs/heads/main.zip)

Or visit our [Github page](https://github.com/broadwayinc/skapi-chat-html-template)


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

The application will be hosted on port `3300`

## Important!

Replace the `SERVICE_ID` and `OWNER_ID` value to your own service in `service.js`

Currently the service is running on **Trial Mode**.

**All the user data will be deleted every 14 days.**

You can get your own service ID from [Skapi](https://www.skapi.com)