const express = require("express");
const { join } = require("node:path");
const { Server } = require("socket.io");

const app = express();
const io = new Server({
	cors: {
		origin: "http://127.0.0.1:5500",
		methods: ["GET", "POST"],
	},
});

app.get("/", (req, res) => {
	res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
	console.log("connection");
	socket.on("location", (msg) => {
		const {line_number, direction} = JSON.parse(msg).bus;
		const channel = (direction + line_number).toLowerCase().replaceAll(" ", "_");
		io.emit(channel, msg);
	});
});

io.on("disconnection", (socket) => {
	console.log("disconnection");
});

io.listen(3000, () => {
	console.log("server running at http://localhost:3000");
});
