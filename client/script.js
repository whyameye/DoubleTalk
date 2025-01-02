const myURL = "http://localhost"
const PORT = 3000

const recordBtn1 = document.getElementById("recordBtn1");
const recordBtn2 = document.getElementById("recordBtn2");
const revBtn1 = document.getElementById("revBtn1");
const revBtn2 = document.getElementById("revBtn2");
const playBtn1 = document.getElementById("playBtn1");
const playBtn2 = document.getElementById("playBtn2");
const player1 = document.getElementById("player1");
const player2 = document.getElementById("player2");
const status1 = document.getElementById("status1");
const status2 = document.getElementById("status2");
const sendToPlayer2 = document.getElementById("sendToPlayer2");
const sendToPlayer1 = document.getElementById("sendToPlayer1");
const videoOn2 = document.getElementById("videoOn2");
const stopButton = document.getElementById('stop');
const messageArea = document.getElementById("messageArea");
const OKButton = document.getElementById("OKButton");
const info1 = document.getElementById("info1");
const OnButton = document.getElementById('webcamOn');
const OffButton = document.getElementById('webcamOff');

const webcam1 = document.getElementById('webcam1');
const recordedVideo = document.getElementById('recorded');
const uploadVideo = document.getElementById('uploadBtn');
const statusDiv = document.getElementById('status');

const switchElement = document.getElementById('videoOn1');

let mediaRecorder; // Handles recording
let recordedChunks = []; // Stores recorded data chunks
let recordedBlob;

const eventSource = new EventSource(myURL + ":" + PORT + '/events');
let stream;

eventSource.onopen = () => {
    console.log('Connection to SSE server opened');
};

eventSource.onmessage = (event) => {
    console.log("got message");
    statusDiv.innerHTML += `<p>${event.data}</p>`;
};

eventSource.onerror = (error) => {
    console.error('EventSource failed:', error);
    eventSource.close();
};

// Access the user's webcam
async function startWebcam() {
    stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    webcam1.srcObject = stream;
    webcam1.muted = true;
    return stream;
}

function stopWebcam() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        webcam1.srcObject = null;
        console.log('Webcam stopped');
    }
}

// Start recording
var recordingTimeout;

async function startRecording() {
    const stream = webcam1.srcObject || (await startWebcam());
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
    };

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

function playVideo() {
    stopWebcam();
    webcam1.src = URL.createObjectURL(recordedBlob);
    webcam1.play();
    console.log("playing video");
}

async function uploadRecording() {
    if (!recordedBlob) {
        alert('No recording available to upload!');
        return;
    }

    const formData = new FormData();
    formData.append('video', recordedBlob, `recorded-video-${Date.now()}.webm`);

    try {
        statusDiv.innerText = 'Uploading...';
        const response = await fetch(myURL + ":" + PORT + '/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            statusDiv.innerText = 'Upload successful!';
            console.log('Video uploaded successfully.');
        } else {
            statusDiv.innerText = 'Upload failed.';
            console.error('Failed to upload video.');
        }
    } catch (error) {
        statusDiv.innerText = 'Upload error.';
        console.error('Error uploading video:', error);
    }
}

// Stop recording
function stopRecording() {
    mediaRecorder.stop();
    enableElement(playBtn1);
    enableElement(revBtn1);
}

// Event Listener
//OnButton.addEventListener('click',startWebcam);
//OffButton.addEventListener('click',stopWebcam);
//startButton.addEventListener('click', startRecording);
//stopButton.addEventListener('click', stopRecording);
//uploadVideo.addEventListener('click', uploadRecording);

playBtn1.addEventListener('click', playVideo);
recordBtn1.addEventListener('mousedown', startRecording);
recordBtn1.addEventListener('mouseup', stopRecording);
switchElement.addEventListener('change', (event) => {
    if (event.target.checked) {
        document.getElementById("webcam1").classList.remove('tv-static');
        startWebcam();
        enableElement(recordBtn1);
        status1.innerHTML = 'Webcam On';
    } else {
        stopWebcam();
        disableElement(recordBtn1);
        //document.getElementById("webcam1").classList.add('tv-static');
        status1.innerHTML = 'Webcam Off';
    }
});

function disableElement(element) {
    console.log(element);
    element.classList.add('disableMe');
    element.removeAttribute("enabled", "");
    element.setAttribute("disabled", "");


}

function enableElement(element) {
    element.classList.remove('disableMe');
    element.removeAttribute("disabled", "");
    element.setAttribute("enabled", "");
}

function player1Start() {
    disableElement(revBtn1);
    disableElement(playBtn1);
    disableElement(player2);
    disableElement(revBtn2);
    disableElement(playBtn2);
    disableElement(recordBtn2);
    disableElement(sendToPlayer1);
    disableElement(sendToPlayer2);
    disableElement(videoOn2);
    disableElement(OKButton);
    messageArea.setAttribute("hidden", "");
    info1.innerHTML = "Hold <i class='bi bi-record-circle'></i> down to record (max 10 sec)";
    info2.innerHTML = "Play backward/forward, re-record and click OK when you are happy with your recording";
    status1.innerHTML = 'Webcam On';
    status2.innerHTML = '<i>disabled for Player 1</i>';
}

// Initialize webcam on page load
startWebcam().catch((error) => {
    console.error('Error accessing webcam:', error);
});

const u = new URLSearchParams(window.location.search)
if (u.get("id") == null) {
    console.log("no URL parameters");
    player1Start();
}