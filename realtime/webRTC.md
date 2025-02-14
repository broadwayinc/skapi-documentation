# WebRTC

Skapi provides easy integration of WebRTC, allowing developers to quickly set up real-time communication features in their applications.

WebRTC (Web Real-Time Communication) is a technology that enables peer-to-peer media and data streaming between two parties.
This can be used for video calls, voice calls, and data exchange, making it a versatile tool for various real-time communication needs.

## Creating RTC Connection

To create RTC connection, both party needs to be online and need to utilize realtime connection.

1. Both party should create realtime connection by using [`connectRealtime()`](/api-reference/realtime/README.md#connectrealtime) method.

2. Once both parties are connected to realtime, both parties should join same realtime group by using [`joinRealtime()`](/api-reference/realtime/README.md#joinrealtime)

3. Now both parties can see each other's `cid` either by calling [`getRealtimeUsers()`](/api-reference/realtime/README.md#getrealtimeusers) method or from the [RealtimeCallback](/api-reference/data-types/README.md#realtimecallback).
   
   One of the party can request RTC connection by using the opponent's `cid` with [`connectRTC()`](/api-reference/realtime/README.md#connectrtc) method.

4. If media streaming is used, user should allow their device to be used from the webpage.

Below is an example code of the process:

```html
<!-- skapi should be previously initialized... -->

<style>
    video {
        width: 320px;
        height: 240px;
        border: 1px solid black;
    }
</style>

<video id="localVideo" autoplay muted></video>
<video id="remoteVideo" autoplay></video>

<dialog id="call_dialog"></dialog>

<script>

    skapi.connectRealtime(RealtimeCallback);
    skapi.joinRealtime({ group: 'RTCCall' });

    let rtcConnection = null;
    let receiver = null;

    function RealtimeCallback(rt) {
        console.log(rt);

        if(rt.type === 'notice') {
            if(rt.message.includes('has joined the message group')) {
                receiver = await skapi.connectRTC({cid: rt.sender_cid}, RTCEvent);

                call_dialog.innerHTML = /*html*/`
                    <p>Outgoing call</p>
                    <button onclick="receiver.hangup();call_dialog.close();">Reject</button>
                `;
                call_dialog.showModal()

                rtcConnection = await receiver.connection;
            }
        }

        if (rt.type === 'rtc:incoming') {
            // incomming rtc call

            receiver = rt;

            call_dialog.innerHTML = /*html*/`
                <p>Incoming call</p>
                <button onclick='
                    receiver.connectRTC({audio: true, video: true}, RTCEvent)
                        .then(rtc => {
                            rtcConnection = rtc;
                            document.getElementById("localVideo").srcObject = rtc.media;
                            call_dialog.close();
                        })
                '>Accept</button>
                <button onclick="receiver.hangup();call_dialog.close();">Reject</button>
            `;

            call_dialog.showModal()
        }

        else if (rt.type === 'rtc:closed') {
            // rtc connection is closed
        }
    }

    function RTCEvent(e) {
        switch (e.type) {
            // RTC Events
            case 'negotiationneeded':
                // RTC negotiation needed. Sending offer..
                break;
                
            case 'track':
                // Incoming Media Stream...
                document.getElementById('remoteVideo').srcObject = e.streams[0];
                call_dialog.close();
                break;

            case 'connectionstatechange':
                if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                    // is disconnected
                }
                else if (state === 'connecting') {
                    // is connecting
                }
                break;

            // Data Channel Events

            case 'close':
                // `Data Channel:${e.target.label}:${e.type}`
                break;
            case 'message':
                // `Data Channel:${e.target.label}:${e.type}`
                break;
            case 'open':
            case 'bufferedamountlow':
            case 'error':
                // `Data Channel:${e.target.label}:${e.type}`
                break;
        }
    }
</script>
```