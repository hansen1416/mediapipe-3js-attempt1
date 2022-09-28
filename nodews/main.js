const { Worker } = require("worker_threads");

class Queue {
	constructor() {
		this.stack1 = [];
		this.stack2 = [];
	}

	add(item) {
		this.stack1.push(item);
	}

	pop() {
		if (!this.stack1.length && !this.stack2.length) {
			return;
		}
		// check stack2 first
		if (this.stack2.length) {
			return this.stack2.pop();
		}

		while (this.stack1.length) {
			this.stack2.push(this.stack1.pop());
		}

		return this.stack2.pop();
	}

	peek() {
		if (!this.stack1.length && !this.stack2.length) {
			return;
		}

		if (this.stack2.length) {
			return this.stack2[this.stack2.length - 1];
		}

		return this.stack1[0];
	}

	get length() {
		return this.stack1.length + this.stack2.length;
	}
}

// Importing the required modules
const WebSocketServer = require("ws");

// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 8080 });

// Creating connection using websocket
wss.on("connection", (ws) => {
	console.log("new client connected");

	// const random_hash = random_str();

	// connections[random_hash] = ws;

	const task_queue = new Queue();
	const current_task_timestamp = {};

	const workers = [
		new Worker(__dirname + "/worker.js"),
		new Worker(__dirname + "/worker.js"),
	];

	workers[1].on("message", (res) => {
		console.log("onmsg", res);
	});

	console.log(workers[1].threadId);

	workers[1].postMessage(["dasdasd"]);

	// sending message
	ws.on("message", (data, isBinary) => {
		// console.log("got message");

		if (isBinary) {
			const ts = Date.now();

			task_queue.add([ts, data]);
			current_task_timestamp.ts = ts;

			// This will choose one idle worker in the pool
			// to execute your heavy task without blocking
			// the main thread!
			// pool.createExecutor()
			// 	.setTimeout(1000)
			// 	.exec(data)
			// 	.then((res) => {
			// 		console.log("worker done: ", res, Date.now());
			// 	})
			// 	.catch((err) => {
			// 		console.log("worker error: ", err);
			// 	});

			// console.log("after process_msg");
		} else {
			console.log("None binary message:", data.toString("utf8"));
		}

		// workers[0].getHeapSnapshot().then((ss) => {
		// 	console.log("sss", ss);
		// });
	});
	// handling what to do when clients disconnects from server
	ws.on("close", () => {
		console.log("the client has closed");

		// delete connections[random_hash];

		// console.log(connections);

		// pool.destroy();
	});
	// handling client connection error
	ws.onerror = function () {
		console.log("Some Error occurred");
	};
});

// const { StaticPool } = require("node-worker-threads-pool");

// let pool = new StaticPool({
// 	size: 4,
// 	task: __dirname + "/worker.js",
// });

// for (let i = 0; i < 30; i++) {
// 	let tot = i % 5 ? 1000 : 1;

// 	pool.createExecutor()
// 		.setTimeout(tot)
// 		.exec([])
// 		.then((res) => {
// 			console.log("worker message: ", res, Date.now());
// 		})
// 		.catch((err) => {
// 			console.log("worker error: ", err);
// 		});
// }
