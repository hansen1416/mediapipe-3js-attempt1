function random_str() {
	return (
		Math.random().toString(36).slice(2) +
		Math.random().toString(36).slice(2)
	);
}

// Importing the required modules
const WebSocketServer = require("ws");
// require fs (filesystem) module
// const fs = require("fs");
const nj = require("numjs");

// const connections = {};
const encoding = "utf8";

function process_msg(binary_arr) {
	return new Promise((resolve, reject) => {
		// this line might be unneccessary
		binary_arr = Buffer.from(binary_arr, "utf8");

		// console.log(
		// 	Buffer.byteLength(binary_arr, encoding),
		// 	Buffer.isEncoding(encoding),
		// 	binary_arr.length
		// );

		// todo, check a task queue. find the latest job, abondon previous jobs

		const arr = [];

		for (let i = 0; i < binary_arr.length; i += 4) {
			arr.push(binary_arr.readFloatLE(i));
		}

		const arrnj = nj.array(arr, (dtype = nj.float32));

		// todo, compare different poses

		console.log(arrnj.get(1));
		resolve("message processed");
	});
}

function start_wss() {
	// Creating a new websocket server
	const wss = new WebSocketServer.Server({ port: 8080 });

	// Creating connection using websocket
	wss.on("connection", (ws) => {
		console.log("new client connected");

		// const random_hash = random_str();

		// connections[random_hash] = ws;

		// sending message
		ws.on("message", (data, isBinary) => {
			// console.log("got message");

			if (isBinary) {
				process_msg(data)
					.then((res) => {
						ws.send("message from server: " + res);
					})
					.catch((err) => {
						console.error(err);
					});
			} else {
				console.log("None binary message:", data.toString(encoding));
			}

			// console.log(arrnj, arrnj.get(-1), arrnj.get(-2), arrnj.get(-3));
			// console.log(Object.keys(data), Object.values(data));
			// console.log(Object.getOwnPropertyNames(data));
			// console.log(data.readFloatLE(), data.readFloatLE(1), data.readFloatLE(2), data.readFloatLE(3), data.readFloatLE(4), data.readFloatLE(8));
		});
		// handling what to do when clients disconnects from server
		ws.on("close", () => {
			console.log("the client has closed");

			// delete connections[random_hash];

			// console.log(connections);
		});
		// handling client connection error
		ws.onerror = function () {
			console.log("Some Error occurred");
		};
	});

	// wss.close()
	// console.log("The WebSocket server is running on port 8080");

	return wss;
}

start_wss();

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
