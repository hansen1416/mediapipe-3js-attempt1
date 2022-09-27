// Access the workerData by requiring it.
const { parentPort, workerData } = require("worker_threads");

function process_msg(arr) {
	console.log(arr);
	return 3123;
}

// Main thread will pass the data you need
// through this event listener.
parentPort.on("message", (param) => {
	const result = process_msg(param);

	// Access the workerData.
	console.log("workerData is", workerData);

	// return the result to main thread.
	parentPort.postMessage(result);
});
