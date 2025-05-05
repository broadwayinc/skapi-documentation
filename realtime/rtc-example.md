# Skapi HTML Video Call Example

This is a HTML example for building basic video call application using Skapi's webrtc features.

Users must login to request or receive video calls.

This example features:

- List available receivers
- Requesting video call
- Receive incomming video call
- Hangup incomming, outgoing calls

All the main code is in **welcome.html**

## Recommeded VSCode Extention

For HTML projects we often tend to use element.innerHTML.

So we recommend installing innerHTML string highlighting extention like one below:

[es6-string-html](https://marketplace.visualstudio.com/items/?itemName=Tobermory.es6-string-html)


## Download

Download the full project [Here](https://github.com/broadwayinc/skapi-webrtc-html-template/archive/refs/heads/main.zip)

Or visit our [Github page](https://github.com/broadwayinc/skapi-webrtc-html-template)


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

The application will be hosted on port `3333`

:::danger HTTPS REQUIRED.
WebRTC only works on HTTPS environment.
You need to setup a HTTPS environment when developing a WebRTC feature for your web application.

You can host your application in skapi.com or host from your personal servers.
:::

## Important!

Replace the `SERVICE_ID` and `OWNER_ID` value to your own service in `service.js`

Currently the service is running on **Trial Mode**.

**All the user data will be deleted every 14 days.**

You can get your own service ID from [Skapi](https://www.skapi.com)