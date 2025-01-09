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

