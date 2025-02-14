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

<!-- Below are the video elements which it will display incoming / outgoing media streams -->
<video id="localVideo" autoplay muted></video>
<video id="remoteVideo" autoplay></video>

<!-- Dialog element opens when making/receiving a call -->
<dialog id="call_dialog"></dialog>

<script>
    skapi.connectRealtime(RealtimeCallback); // Connect to realtime
    skapi.joinRealtime({ group: 'RTCCall' }); // Join a realtime group

    let rtcConnection = null;
    let receiver = null;

    function RealtimeCallback(rt) {
        if(rt.type === 'notice') {
            if(rt.message.includes('has joined the message group')) {
                // When opponent joins a room, make a RTC call
                receiver = await skapi.connectRTC({cid: rt.sender_cid, media: { audio:true, video: true}}, RTCEvent);

                call_dialog.innerHTML = /*html*/`
                    <p>Outgoing call</p>
                    <button onclick="receiver.hangup(); call_dialog.close();">Reject</button>
                `;
                call_dialog.showModal(); // Display outgoing call dialog

                rtcConnection = await receiver.connection; // Save resolved RTC connection object
                document.getElementById('localVideo').srcObject = rtcConnection.media; // Show outgoing local media stream
            }
        }

        if (rt.type === 'rtc:incoming') {
            // incomming rtc call

            receiver = rt;

            call_dialog.innerHTML = /*html*/`
                <p>Incoming call</p>
                <button onclick='
                    receiver.connectRTC({ media: {audio: true, video: true} }, RTCEvent)
                        .then(rtc => {
                            rtcConnection = rtc; // Save resolved RTC connection object
                            document.getElementById("localVideo").srcObject = rtcConnection.media; // Show outgoing local media stream
                            call_dialog.close();
                        })
                '>Accept</button>
                <button onclick="receiver.hangup();call_dialog.close();">Reject</button>
            `;

            call_dialog.showModal(); // Display incoming call dialog
        }

        else if (rt.type === 'rtc:closed') {
            // rtc connection is closed
        }
    }

    function RTCEvent(e) {
        switch (e.type) {
            // RTC Events
            case 'track':
                // Incoming Media Stream...
                document.getElementById('remoteVideo').srcObject = e.streams[0];
                call_dialog.close();
                // {
                //     type: 'track',
                //     target: RTCPeerConnection,
                //     timeStamp: event.timeStamp,
                //     streams: event.streams,
                //     track: event.track,
                // }
                break;

            case 'connectionstatechange':
                // {
                //     type: 'connectionstatechange',
                //     target: RTCPeerConnection,
                //     timestamp: new Date().toISOString(),
                //     state: RTCPeerConnection.connectionState,
                //     iceState: RTCPeerConnection.iceConnectionState,
                //     signalingState: RTCPeerConnection.signalingState
                // }
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
                // {
                //     type: event.type,
                //     target: dataChannel,
                //     timeStamp: event.timeStamp,
                //     readyState: dataChannel.readyState,
                //     label: dataChannel.label,
                //     id: dataChannel.id
                // }
                break;
            case 'message':
                // `Data Channel:${e.target.label}:${e.type}`
                // {
                //     type: event.type,
                //     target: dataChannel,
                //     timeStamp: event.timeStamp,
                //     data: event.data,
                //     lastEventId: event.lastEventId,
                //     origin: event.origin,
                //     readyState: dataChannel.readyState,
                //     bufferedAmount: dataChannel.bufferedAmount
                // }
                break;
            case 'open':
                // {
                //     type: event.type,
                //     target: dataChannel,
                //     timeStamp: event.timeStamp,
                //     readyState: dataChannel.readyState,
                //     label: dataChannel.label,
                //     id: dataChannel.id,
                //     ordered: dataChannel.ordered,
                //     maxRetransmits: dataChannel.maxRetransmits,
                //     protocol: dataChannel.protocol
                // }
            case 'bufferedamountlow':
                // {
                //     target: dataChannel,
                //     bufferedAmount: dataChannel.bufferedAmount,
                //     bufferedAmountLowThreshold: dataChannel.bufferedAmountLowThreshold,
                //     type: event.type,
                //     timeStamp: event.timeStamp
                // }
            case 'error':
                // `Data Channel:${e.target.label}:${e.type}`
                // {
                //     type: event.type,
                //     target: dataChannel,
                //     timeStamp: event.timeStamp,
                //     error: event.error.message,
                //     errorCode: event.error.errorDetail,
                //     readyState: dataChannel.readyState,
                //     label: dataChannel.label
                // }
                break;
            
            // ICE Events
            case 'icecandidate':
                // {
                //     type: 'icecandidate',
                //     target: RTCPeerConnection,
                //     timestamp: new Date().toISOString(),
                //     candidate: event.candidate.candidate,
                //     sdpMid: event.candidate.sdpMid,
                //     sdpMLineIndex: event.candidate.sdpMLineIndex,
                //     usernameFragment: event.candidate.usernameFragment,
                //     protocol: event.candidate.protocol,
                //     gatheringState: RTCPeerConnection.iceGatheringState,
                //     connectionState: RTCPeerConnection.iceConnectionState
                // }
                
            case 'icecandidateend':
                // {
                //     type: 'icecandidateend',
                //     target: RTCPeerConnection,
                //     timestamp: new Date().toISOString()
                // }

            case 'icegatheringstatechange':
                // {
                //     type: 'icegatheringstatechange',
                //     target: RTCPeerConnection,
                //     timestamp: new Date().toISOString(),
                //     state: RTCPeerConnection.iceGatheringState,
                //     connectionState: RTCPeerConnection.iceConnectionState,
                //     signalingState: RTCPeerConnection.signalingState
                // }
            
            case 'negotiationneeded':
                // RTC negotiation needed. Sending offer..
                // {
                //     type: 'negotiationneeded',
                //     target: RTCPeerConnection,
                //     timestamp: new Date().toISOString(),
                //     signalingState: RTCPeerConnection.signalingState,
                //     connectionState: RTCPeerConnection.iceConnectionState,
                //     gatheringState: RTCPeerConnection.iceGatheringState
                // }
                
            case 'signalingstatechange':
                // {
                //     type: 'signalingstatechange',
                //     target: RTCPeerConnection,
                //     timestamp: new Date().toISOString(),
                //     state: RTCPeerConnection.signalingState,
                //     connectionState: RTCPeerConnection.iceConnectionState,
                //     gatheringState: RTCPeerConnection.iceGatheringState
                // }
        }
    }
</script>
```