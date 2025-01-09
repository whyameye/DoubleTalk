let mediaRecorder; // Handles recording
let recordedChunks = []; // Stores recorded data chunks
let recordedBlob;

// Start recording
var recordingTimeout;

async function startRecording() {
    const stream = player1Webcam.srcObject || (await startWebcam());
    recordedChunks = [];

    // Set up MediaRecorder
    mediaRecorder = new MediaRecorder(stream);
    status1.innerHTML = "Recording"

    // Collect data chunks when available
    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            console.log("chunk");
            recordedChunks.push(event.data);
        }
    }

    // When recording stops, create a blob and set it as the source for the recorded video
    mediaRecorder.onstop = () => {
        recordedBlob = new Blob(recordedChunks, {type: 'video/webm'});
        status1.innerHTML = "Stopped"
        clearTimeout(recordingTimeout);
    };


    mediaRecorder.start();
    recordingTimeout= setTimeout(stopRecording, 10000);
    disableElement(playBtn1);
    disableElement(revBtn1);
}

// Stop recording
function stopRecording() {
    mediaRecorder.stop();
    enableElement(playBtn1);
    enableElement(revBtn1);
}

function playVideo() {
    turnOnOffWebcam();
    player1Webcam.src = URL.createObjectURL(recordedBlob);
    player1Webcam.muted = false;
    player1Webcam.play();
    console.log("playing video");
}