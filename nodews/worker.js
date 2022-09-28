// Access the workerData by requiring it.
const { parentPort } = require("worker_threads");
const nj = require("numjs");

const toss_task = 5;

function process_msg(binary_arr) {
	// console.log(tasks);

	// const task = tasks.pop();

	// const task_time = task[0];
	// let binary_arr = task[1];

	console.log(binary_arr);

	for (let i = 0; i < 10000000; i++) {}

	return true;

	// this line might be unneccessary
	// binary_arr = Buffer.from(binary_arr, "utf8");

	// console.log(
	// 	Buffer.byteLength(binary_arr, encoding),
	// 	Buffer.isEncoding(encoding),
	// 	binary_arr.length
	// );

	// todo, check a task queue. find the latest job, abondon previous jobs

	if (processed_ts.ts - task_time > toss_task) {
		console.log("rejected");
	}

	const arr = [];

	for (let i = 0; i < binary_arr.length; i += 4) {
		arr.push(binary_arr.readFloatLE(i));
	}

	if (processed_ts.ts - task_time > toss_task) {
		console.log("rejected");

		console.log("after reject?");
	}

	const arrnj = nj.array(arr, (dtype = nj.float32));

	console.log(processed_ts.ts, task_time, toss_task);
	// todo, compare different poses

	console.log("process finished at: " + task_time);

	return true;
}

// Main thread will pass the data you need
// through this event listener.
parentPort.on("message", (msg) => {
	const result = process_msg(msg);

	// return the result to main thread.
	parentPort.postMessage("result message" + result);
});
