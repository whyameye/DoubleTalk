require('dotenv').config();

const fs = require('fs');
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors'); // Import CORS
const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');

// Tell fluent-ffmpeg where it can find FFmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

// Configure storage for uploaded videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname); // Preserve file extension
    cb(null, `recorded-video-${timestamp}${ext}`);
  }
});

function reverseFile(filePath, sendUpdate) {
  sendUpdate('Starting reverse process');
  ffmpeg()
    .input(filePath)
    .outputOptions("-vf reverse -af areverse -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k")
    .saveToFile('reversed.webm')
    .on('progress', (progress) => {
      if (progress.percent) {
	console.log(`Processing: ${Math.floor(progress.percent)}% done`);
	sendUpdate(`Processing: ${Math.floor(progress.percent)}% done`);
      }
    })
    .on('end', () => {
      console.log('FFmpeg has finished.');
      sendUpdate('FFmpeg has finished.');
  })
  .on('error', (error) => {
    console.error(error);
    sendUpdate(error);
  });
}

// Simulated File Processing
function processFile(filePath, sendUpdate) {
  return new Promise((resolve) => {
    console.log(`Processing file: ${filePath}`);

    // Simulate processing steps
    setTimeout(() => {
      sendUpdate('Step 1: File validation completed.');
    }, 1000);

    setTimeout(() => {
      sendUpdate('Step 2: Transcoding video.');
    }, 2000);

    setTimeout(() => {
      sendUpdate('Step 3: Finalizing processing.');
    }, 3000);

    setTimeout(() => {
      console.log('File processed successfully');
      sendUpdate('Processing completed successfully.');
      resolve();
    }, 4000);
  });
}

const app = express();

// 🛡️ Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:8000', // Replace with your actual frontend domain
    methods: ['GET','POST'], // Allow only POST requests
  allowedHeaders: ['Content-Type']
}));

// SSE Endpoint
app.get('/events', (req, res) => {
  const sendUpdate = (message) => {
    console.log("sending update....");
    res.write(`data: ${message}\n\n`);
  };
  
  console.log("connected to events");
  app.locals.res = res;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // res.setHeader("Access-Control-Allow-Origin","*");
  sendUpdate("I'm here");
  setTimeout(() => {
    sendUpdate('Step 1: File validation completed.');
  }, 5000);
  
  
  req.on('close', () => {
    console.log('Client disconnected from SSE');
    res.end();
  });
});

// Initialize multer
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['video/webm', 'video/mp4'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .webm and .mp4 are allowed!'), false);
    }
  }
});

app.post('/upload', upload.single('video'), async (req, res) => {
  console.log('File uploaded:', req.file);
  res.status(200).send('Video uploaded successfully!');
  const sendUpdate = (message) => {
    console.log('SSE:', message);
    console.log('locals:', app.locals.res);
    app.locals.res.write(`data: ${message}\n\n`);
  };
  await processFile("testpath", sendUpdate);
});

if (process.env.use_https == "true") {
  const https = require('https');
  // Load SSL Certificates
  const privateKey = fs.readFileSync(process.env.privateKeyFile, 'utf8');
  const certificate = fs.readFileSync(process.env.fullchainFile, 'utf8');
  
  // HTTPS options
  const credentials = { key: privateKey, cert: certificate };
  const httpsServer = https.createServer(credentials, app);
  
  httpsServer.listen(3000, () => {
    console.log('Server running on https://localhost:3000');
  });
} else
{
  const http = require('http');
  const httpServer = http.createServer(app);
  httpServer.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
};
