// Access the workerData by requiring it.
const { parentPort } = require("worker_threads");
// const nj = require("numjs");

const net = require("node:net");

const client = net.createConnection(
	{ port: 6379, host: "localhost" },
	() => {
		// 'connect' listener.
		console.log("connected to server!");
	}
);

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

client.on("data", (data) => {

	let arr = python_struct_bytes_to_arr(data)
	console.log(arr[0][0])

	cansend = true

});

// const toss_task = 5;

/**
 *
 * @param {Float32Array} binary_arr
 * @returns
 */
function process_msg(binary_arr) {
	binary_arr = Buffer.from(binary_arr, "utf8");

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

	console.log(arr[0]);

	client.write("get yoga123456:0\r\n", encoding='utf-8')

	// todo, compare different poses

	console.log("process finished at: ", Date.now());

	return true;
}

// Main thread will pass the data you need
// through this event listener.
parentPort.on("message", (msg) => {
	try {
		const result = process_msg(msg);

		// return the result to main thread.
		parentPort.postMessage("result message:" + result);
	} catch (e) {
		console.log("worker error", e);

		parentPort.postMessage("still inform main thread to free the worker");
	}
});
