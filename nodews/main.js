// Importing the required modules
const WebSocketServer = require("ws");
// require fs (filesystem) module
// const fs = require("fs");
const nj = require('numjs');

function start_wss() {

	// Creating a new websocket server
	const wss = new WebSocketServer.Server({ port: 8080 });

	// Creating connection using websocket
	wss.on("connection", (ws) => {
		console.log("new client connected");
		// sending message
		ws.on("message", (data) => {
			console.log("got message");

			const encoding = 'utf8'

			// let b = Buffer.from(data, 'utf8')

			console.log(Buffer.byteLength(data, encoding), Buffer.isEncoding(encoding), data.length)

			const arr = []

			for (let i = 0; i < data.length; i += 4) {
				arr.push(data.readFloatLE(i))
			}

			const arrnj = nj.array(arr, dtype=nj.float32)

			console.log(arrnj, arrnj.get(-1), arrnj.get(-2), arrnj.get(-3))
			// console.log(Object.keys(data), Object.values(data));
			// console.log(Object.getOwnPropertyNames(data));
			// console.log(data.readFloatLE(), data.readFloatLE(1), data.readFloatLE(2), data.readFloatLE(3), data.readFloatLE(4), data.readFloatLE(8));

		});
		// handling what to do when clients disconnects from server
		ws.on("close", () => {
			console.log("the client has connected");
		});
		// handling client connection error
		ws.onerror = function () {
			console.log("Some Error occurred");
		};
	});

	// wss.close()
	console.log("The WebSocket server is running on port 8080");

	return wss
}

let wss = start_wss();

// // use fs.watch() method to look for changes
// fs.watchFile("./main.js", () => {
// 	// some good stuff here! 😃
// 	try {
// 		wss.close()

// 	} catch (e) {
// 		console.log("File watcher, wss not started")
// 	}

// 	wss = start_wss();
// });