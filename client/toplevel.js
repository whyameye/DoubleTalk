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

const player1Webcam = document.getElementById('webcam1');
const recordedVideo = document.getElementById('recorded');
const uploadVideo = document.getElementById('uploadBtn');
const statusDiv = document.getElementById('status');

const switchElement = document.getElementById('videoOn1');
const eventSource = new EventSource(myURL + ":" + PORT + '/events');
let stream;
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
    turnOnOffWebcam(event.target.checked);
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

const u = new URLSearchParams(window.location.search)
if (u.get("id") == null) {
    console.log("no URL parameters");
    player1Start();
}