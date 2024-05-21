# Realtime Bus Locator API

This is the API for the Realtime Bus Locator project. It allows you to create a server that provides real-time bus location data.

## Getting Started

To get started, follow the steps below:

1. Navigate to the project directory: `cd realtime-bus-locator/api`.
2. Install the required dependencies by running the following command:

```bash
npm install socket.io http express cors
```

3. Paste this script in a file and run it using node:

```bash
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
});

let latestLocation = null;

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('geolocation', (data) => {
    console.log(data);
    latestLocation = data;
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.get('/latestLocation', (req, res) => {
    res.json(latestLocation);
  });

server.listen(8080, () => {
  console.log('listening on *:8080');
});
```
