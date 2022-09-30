const { Worker } = require("worker_threads");
const WebSocketServer = require("ws");

// Creating a new websocket server
// const wss = new WebSocketServer.Server({ port: 8080 });

// // Creating connection using websocket
// wss.on("connection", (ws) => {
// 	console.log("new client connected");

// 	const workers_timestamp = {};
// 	const workers = {};

// 	let num_wokers = 0;

// 	function create_worker() {
// 		const w = new Worker(__dirname + "/worker.js");

// 		w.on("message", (msg) => {
// 			console.log(
// 				"message from worker, free worker. ",
// 				w.threadId,
// 				Date.now()
// 			);
// 			delete workers_timestamp[w.threadId];

// 			// todo, send message back to frontend
// 		});

// 		workers[w.threadId] = w;

// 		num_wokers += 1;

// 		return w.threadId;
// 	}

// 	// create one worker at the beginning
// 	create_worker();

// 	// sending message
// 	ws.on("message", (data, isBinary) => {
// 		if (isBinary) {
// 			// const ts = Date.now();

// 			let need_more_worker = true;

// 			for (let worker_tid in workers) {
// 				if (!(worker_tid in workers_timestamp)) {
// 					// worker of thread id is free

// 					workers_timestamp[worker_tid] = Date.now();

// 					console.log(
// 						"send message to worker ",
// 						worker_tid,
// 						Date.now()
// 					);

// 					workers[worker_tid].postMessage(data);

// 					need_more_worker = false;

// 					break;
// 				}
// 			}

// 			if (need_more_worker) {
// 				// maximum 4 workers
// 				if (num_wokers < 4) {
// 					const new_worker_tid = create_worker();

// 					workers_timestamp[new_worker_tid] = Date.now();

// 					console.log(
// 						"add new worker: ",
// 						new_worker_tid,
// 						"total: ",
// 						Object.keys(workers).length
// 					);

// 					workers[new_worker_tid].postMessage(data);
// 				} else {
// 					console.log("lost message due to no worker", data);
// 				}
// 			}
// 		} else {
// 			console.log("None binary message:", data.toString("utf8"));
// 		}
// 	});

// 	// handling what to do when clients disconnects from server
// 	ws.on("close", () => {
// 		for (let tid in workers) {
// 			workers[tid].terminate();
// 		}

// 		console.log("the client has closed, lost # data");
// 	});

// 	// handling client connection error
// 	ws.onerror = function () {
// 		console.log("Websocket Error occurred");
// 	};
// });

const net = require("node:net");
const client = net.createConnection(
	{ port: 6379, host: "localhost", keepAlive: true },
	() => {
		// 'connect' listener.
		console.log("connected to server!");
	}
);
client.on("data", (data) => {
	console.log(data.toString());
	client.end();
});
client.on("end", () => {
	console.log("disconnected from server");
});

client.write("setex mykey 10 somevalue\r\n");

client.write("get mykey\r\n");
