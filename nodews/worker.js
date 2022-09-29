// Access the workerData by requiring it.
const { parentPort } = require("worker_threads");
const nj = require("numjs");

const toss_task = 5;

/**
 * 
 * @param {Float32Array} binary_arr 
 * @returns 
 */
function process_msg(binary_arr) {

	binary_arr = Buffer.from(binary_arr, 'utf8')

	const arr = [];

	for (let i = 0; i < binary_arr.length; i += 4) {
		arr.push(binary_arr.readFloatLE(i));
	}

	const arrnj = nj.array(arr, dtype = nj.float32).reshape(-1, 4);

	console.log(arrnj.get(0, 0));

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
