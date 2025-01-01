const myURL="http://localhost"
const PORT=3000

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const OnButton = document.getElementById('webcamOn');
const OffButton = document.getElementById('webcamOff');

const webcamVideo = document.getElementById('webcam');
const recordedVideo = document.getElementById('recorded');
const uploadVideo = document.getElementById('uploadBtn');
const statusDiv = document.getElementById('status');

const switchElement = document.getElementById('videoOn');

let mediaRecorder; // Handles recording
let recordedChunks = []; // Stores recorded data chunks
let recordedBlob;

const eventSource = new EventSource(myURL+":"+PORT+'/events');
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
  stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  webcamVideo.srcObject = stream;
  webcamVideo.muted = true;
  return stream;
}

function stopWebcam() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    webcamVideo.srcObject = null;
    console.log('Webcam stopped');
  }
}

// Start recording
async function startRecording() {
  const stream = webcamVideo.srcObject || (await startWebcam());
  recordedChunks = [];

  // Set up MediaRecorder
  mediaRecorder = new MediaRecorder(stream);

  // Collect data chunks when available
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  // When recording stops, create a blob and set it as the source for the recorded video
  mediaRecorder.onstop = () => {
    recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
    recordedVideo.src = URL.createObjectURL(recordedBlob);
    // new
    const url = URL.createObjectURL(recordedBlob);

    // Create a temporary download link
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `recorded-video-${Date.now()}.webm`;
    
    // Trigger automatic download
    document.body.appendChild(a);
    a.click();

    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  mediaRecorder.start();
  startButton.disabled = true;
  stopButton.disabled = false;
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
    const response = await fetch(myURL+":"+PORT+'/upload', {
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
  startButton.disabled = false;
  stopButton.disabled = true;
}

// Event Listener
//OnButton.addEventListener('click',startWebcam);
//OffButton.addEventListener('click',stopWebcam);
//startButton.addEventListener('click', startRecording);
//stopButton.addEventListener('click', stopRecording);
//uploadVideo.addEventListener('click', uploadRecording);

switchElement.addEventListener('change', (event) => {
  if (event.target.checked) {
    document.getElementById("webcam").classList.remove('tv-static');
    startWebcam();
  } else {
    stopWebcam();
    document.getElementById("webcam").classList.add('tv-static');
  }
});
var myWidth = document.getElementById('webcam').offsetWidth;
var myHeight = document.getElementById('webcam').offsetHeight;
console.log(myWidth);
console.log(myHeight);


// Initialize webcam on page load
startWebcam().catch((error) => {
  console.error('Error accessing webcam:', error);
});
