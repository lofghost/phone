(function () {

    // console.log("initalized rtc file")

    Phone.rtcSwitch = function () {
        return
    }

    // navigator.getUserMedia({ audio: true }, function (stream) {
    //     var peer = new Peer({
    //         trickle: false,
    //         stream
    //     })

    //     peer.on('open', function (data) {
    //         Phone.rtcId = data

    //         console.log(`RTC id initialized: ${Phone.rtcId}`)
    //     })

    //     Phone.rtcSwitch = function (event, data) {
    //         // console.log(`data: ${JSON.stringify(data)}`)

    //         // switch (event) {
    //         //     case "CONNECT":
    //         //         // console.log(`connecting... with id: ${data["rtcId"] ? data["rtcId"] : "nothing sent"}`)

    //         //         var otherId = data["rtcId"]
    //         //         var call = peer.call(otherId, stream);
    //         //         call.on('stream', function (remoteStream) {
    //         //             // console.log(stream, 'My stream')
    //         //             // console.log(remoteStream, 'Recived stream')
    //         //             var element = document.getElementsByTagName('audio')[0]
    //         //             element.srcObject = remoteStream;
    //         //             element.onloadedmetadata = function (e) {
    //         //                 element.play();
    //         //             }
    //         //         });

    //         //         Phone.disconnect = function () {
    //         //             call.close()
    //         //         }
    //         //         break;
    //         //     case "TOGGLE_MICROPHONE":
    //         //         stream.getAudioTracks()[0].enabled = data["holding"]

    //         //         // console.log(`toggling to: ${data["holding"]}`)

    //         //         break;
    //         //     default:
    //         //         console.log(`event: ${event} not existing.`)
    //         //         break;
    //         // }
    //     }

    //     peer.on('call', function (call) {
    //         call.answer(stream); // Answer the call with an A/V stream.
    //         call.on('stream', function (remoteStream) {
    //             // console.log(stream, 'My stream')
    //             // console.log(remoteStream, 'Recived stream')
    //             var element = document.getElementsByTagName('audio')[0]
    //             element.srcObject = remoteStream;
    //             element.onloadedmetadata = function (e) {
    //                 element.play();
    //             }
    //         });

    //         // console.log("someone called you")

    //         Phone.disconnect = function () {
    //             call.close()
    //         }
    //     })
    // }, function (err) {
    //     console.log(err)
    // })
})();

















//  navigator.getUserMedia({ audio: true, video: false },
//         function (stream) {

//             var peer = new Peer()
//             peer.on('open', function (id) {
//                 document.getElementById('myId').value = id
//             });

//             document.getElementById('connect').addEventListener('click', function () {
//                 var conn = peer.connect(document.getElementById('enterId').value);
//                 var call = peer.call(document.getElementById('enterId').value);
//             })

//             peer.on('call', function (call) {
//                 Answer the call, providing our mediaStream
//                 call.answer(mediaStream);
//             });

//             peer.on('connection', function (conn) {
//                 console.log('test')
//             });

//         },
//         function (err) {
//             console.log("The following error occurred: " + err.name);
//         }
//     );

// var call = peer.call(otherId, stream);
// call.on('stream', function (remoteStream) {
//     console.log('Calling')
// });

/*

                var audioContext = new AudioContext();
                var audioStream = audioContext.createMediaStreamSource(remoteStream);
                audioStream.connect(audioContext.destination);


                 var audio = new Audio(stream)
                audio.play()
*/



