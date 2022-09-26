// Importing the required modules
const WebSocketServer = require("ws");

// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 8080 });


// Creating connection using websocket
wss.on("connection", (ws) => {
	console.log("new client connected");
	// sending message
	ws.on("message", (data) => {
		console.log("got message");

		let d = new Float32Array(data)

		// console.log(Object.keys(data), Object.values(data));
		// console.log(Object.getOwnPropertyNames(data));
		console.log(data);
		console.log(d);
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
console.log("The WebSocket server is running on port 8080");
