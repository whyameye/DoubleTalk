async function startWebcam() {
    stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    player1Webcam.srcObject = stream;
    player1Webcam.muted = true;
    return stream;
}

function stopWebcam() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        player1Webcam.srcObject = null;
        console.log('Webcam stopped');
    }
}

function turnOnOffWebcam(turnOn) {
    if (turnOn) {
        //document.getElementById("player1Webcam").classList.remove('tv-static');
        startWebcam();
        enableElement(recordBtn1);
        switchElement.checked = true;
        status1.innerHTML = 'Webcam On';
    } else {
        stopWebcam();
        disableElement(recordBtn1);
        //document.getElementById("webcam1").classList.add('tv-static');
        switchElement.checked = false;
        status1.innerHTML = 'Webcam Off';
    }
}

// Initialize webcam on page load
startWebcam().catch((error) => {
    console.error('Error accessing webcam:', error);
});