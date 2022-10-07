// Access the workerData by requiring it.
const { parentPort } = require("worker_threads");
// const nj = require("numjs");

const net = require("node:net");

const redis_client = net.createConnection(
	{ port: 6379, host: "localhost" },
	() => {
		// 'connect' listener.
		console.log("connected to server!");
	}
);

/**
 * process message received from websocket
 * @param {Float32Array} binary_arr
 * @returns
 */
function browser_buffer_to_arr(binary_arr) {

	binary_arr = Buffer.from(binary_arr, "utf8");
	// float takes 4 bytes, and each row has 4 items (x,y,z,visibility)
	const arr = Array(binary_arr.length / 4 / 4);

	let row = -1;
	let col = 0;

	for (let i = 0; i < binary_arr.length; i += 4) {
		if (col % 4 == 0) {
			row += 1;
			col = 0;

			arr[row] = [];
		}

		arr[row][col] = binary_arr.readFloatLE(i);

		col += 1;
	}

	return arr
}

/**
 * read bytes from redis, and transfer it to array
 * @param {Buffer} data_buffer 
 * @returns 
 */
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

const arrHolder = {

	camera_arr: [],
	// video_arr: [],

	set video_arr(value) {
		// todo compare camera pose and video pose

		console.log(this.camera_arr, value)

		// return the result to main thread.
		// main thread will mark this worker as available
		parentPort.postMessage("result message:" + result);
	}
}

// Main thread will pass the data you need
// through this event listener.
parentPort.on("message", (msg) => {
	try {
		// browser buffer to array
		arrHolder.camera_arr = browser_buffer_to_arr(msg);
		// read bytes from redis
		redis_client.write("get yoga123456:0\r\n", encoding='utf-8')

	} catch (e) {
		console.log("worker error", e);

		parentPort.postMessage("still inform main thread to free the worker1");
	}
});

// read output data from redis redis_client socket
redis_client.on("data", (data) => {
	try {

		arrHolder.video_arr = python_struct_bytes_to_arr(data);
		
	} catch (e) {
		console.log("worker error", e);

		parentPort.postMessage("still inform main thread to free the worker2");
	}
});