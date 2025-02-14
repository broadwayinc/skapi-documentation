# WebRTC

Skapi provides easy integration of WebRTC, allowing developers to quickly set up real-time communication features in their applications.

WebRTC (Web Real-Time Communication) is a technology that enables peer-to-peer media and data streaming between two parties.
This can be used for video calls, voice calls, and data exchange, making it a versatile tool for various real-time communication needs.

## Creating RTC Connection

To create RTC connection, both party needs to be online and need to utilize realtime connection.

1. Both party should create realtime connection by using [`connectRealtime()`](/api-reference/realtime/README.md#connectrealtime) method.

2. Once both parties are connected to realtime, both parties should join same realtime group by using [`joinRealtime()`](/api-reference/realtime/README.md#joinrealtime)

3. Now both parties can see each other's `cid` either by calling [`getRealtimeGroups()`](/api-reference/realtime/README.md#getrealtimegroups) method or from the [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback).
   
   One of the party can request RTC connection by using the opponent's `cid` with [`connectRTC()`](/api-reference/realtime/README.md#connectRTC) method.

4. If media streaming is used, user should allow their device to be used from the webpage.

Below is an example code of the process:

```html

<video id="localVideo" autoplay muted></video>
<video id="remoteVideo" autoplay></video>

<script>
skapi.connectRealtime(RealtimeCallback);
skapi.joinRealtime({ group: 'RTCCall' });

let receivedRtcObj = null;
function RealtimeCallback(rt) {
    console.log(rt);
    let cid_to_call;

    if(rt.type === 'notice') {
        if(rt.message.includes('has joined the message group')) {
            cid_to_call = rt.sender_cid;
        }
    }

    if (rt.type === 'rtc:incoming') {
        // incomming rtc call

        rt.connectRTC({audio: true, video: true}, RTCCallback)
            .then(rtc => {
                receivedRtcObj = rtc; // Save received rtc call object
                document.getElementById("localVideo").srcObject = rtc.media; // start showing local video
            })
    }

    else if (rt.type === 'rtc:closed') {
        // rtc connection is closed
    }
}

function RTCCallback(e) {
    let rtcLog = document.getElementById('el_pre_rtcLog'); // RTC Log

    switch (e.type) {
        // RTC Events
        case 'negotiationneeded':
            rtcLog.innerText = `RTC negotiation needed. Sending offer..\n` + rtcLog.innerText;
            break;
            
        case 'track':
            rtcLog.innerText = `Incoming Media Stream...\n` + rtcLog.innerText;
            document.getElementById('remote').srcObject = e.streams[0];
            break;

        case 'connectionstatechange':
            let state = e.state;
            rtcLog.innerText = `RTC Connection:${e.type}:${state}\n` + JSON.stringify(e, null, 2) + '\n-\n' + rtcLog.innerText;
            if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                isConnected(false);
            }
            else if (state === 'connecting') {
                isConnected(true);
            }
            break;

        // Data Channel Events
        case 'close':
            rtcLog.innerText = `Data Channel:${e.target.label}:${e.type}\n` + JSON.stringify(e, null, 2) + '\n-\n' + rtcLog.innerText;
            break;
        case 'message':
            rtcLog.innerText = `Data Channel:${e.target.label}:${e.type}\n` + JSON.stringify(e.data, null, 2) + '\n-\n' + rtcLog.innerText;
            break;
        case 'open':
        case 'bufferedamountlow':
        case 'error':
            rtcLog.innerText = `Data Channel:${e.target.label}:${e.type}\n` + JSON.stringify(e, null, 2) + '\n-\n' + rtcLog.innerText;
            break;
    }
}
</script>
```