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

// const nj = require("numjs")

function python_struct_bytes_to_arr(data_buffer) {
	const arr = Array((data_buffer.length-8) / 4 / 4);

	let row = -1;
	let col = 0;

	// python struct are padding at the beginnning 4 bytes and endding 2 bytes
	for (let i = 6; i < data_buffer.length-2; i += 4) {
		if (col % 4 == 0) {
			row += 1;
			col = 0;

			arr[row] = [];
		}

		arr[row][col] = data_buffer.readFloatLE(i);

		col += 1;
	}

	return arr
}

const net = require("node:net");
const client = net.createConnection(
	{ port: 6379, host: "localhost" },
	() => {
		// 'connect' listener.
		console.log("connected to server!");
	}
);

let canstop = false
let cansend = true

// client.setNoDelay(true)

client.on("data", (data) => {

	// for (let j = 0; j < 10; j++) {

	// 	start_time = Date.now()

	// 	for (let i = 0; i < 10000; i++) {
	// 		// let arr = data.toString().split(',')

	// 		let arr = python_struct_bytes_to_arr(data)

	// 	}

	// 	console.log("time cost", Date.now() - start_time)

	// }

	console.log(data.length)
	
	let arr = python_struct_bytes_to_arr(data)
	console.log(arr[0][0])

	cansend = true

});

client.on("drain", () => {
	console.log("on drain");
});

client.on("error", (e) => {
	console.log("error from server", e);
});

client.on("end", () => {
	console.log("disconnected from server");
});

// client.end()

// client.write("get yoga123456:0\r\n", encoding='utf-8', () => {
// 	console.log(1)
// });

// client.end()

// setTimeout(() => {
// 	client.write("get yoga123456:0\r\n", encoding='utf-8', () => {
// 		console.log(2)
// 	});
// }, 10)

// const wobj = {
// 	receivedval: false,
// 	// get received() {
// 	// 	return this.receivedval
// 	// },
// 	set received(value) {
// 		this.receivedval = value

// 		if (value) {
// 			client.write("get yoga123456:0\r\n", encoding='utf-8', () => {
// 				console.log('callback on write')
// 			});

// 			this.received = false
// 		}

// 		// console.log("setting received", value)
// 	}
// }

// wobj.received = true



const intid = setInterval(() => {
	console.log('do something')

	if (cansend) {
		client.write("get yoga123456:0\r\n", encoding='utf-8')

		cansend = false
	}

	if (canstop) {
		
		clearInterval(intid)
		client.end()
	}
}, 1)

setTimeout(() => {
	canstop = true;
}, 30)








