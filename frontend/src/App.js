import "./App.css";

import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";

// Integrate navigator.getUserMedia & navigator.mediaDevices.getUserMedia
function getUserMedia(constraints, successCallback, errorCallback) {
	if (!constraints || !successCallback || !errorCallback) {
		return;
	}

	if (navigator.mediaDevices) {
		navigator.mediaDevices
			.getUserMedia(constraints)
			.then(successCallback, errorCallback);
	} else {
		navigator.getUserMedia(constraints, successCallback, errorCallback);
	}
}

function App() {
	useEffect(() => {
		let camera_button = document.querySelector("#start-camera");
		let video = document.querySelector("#video");
		// let start_button = document.querySelector("#start-record");
		// let stop_button = document.querySelector("#stop-record");
		// let download_link = document.querySelector("#download-video");

		let camera_stream = null;
		let media_recorder = null;
		let blobs_recorded = [];

		const canvas = document.querySelector("#output_canvas");
		const ctx = canvas.getContext("2d");

		function onResults(results) {
			console.log(results);
		}

		const pose = new Pose({
			locateFile: (file) => {
				return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
			},
		});

		pose.setOptions({
			modelComplexity: 1,
			smoothLandmarks: true,
			enableSegmentation: true,
			smoothSegmentation: true,
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5,
		});
		pose.onResults(onResults);

		camera_button.addEventListener("click", () => {
			getUserMedia(
				{ video: true },
				function (stream) {
					// Yay, now our webcam input is treated as a normal video and
					// we can start having fun
					try {
						video.srcObject = stream;
					} catch (error) {
						video.src = URL.createObjectURL(stream);
					}
					// Let's start drawing the canvas!
					draw_loop();
				},
				function (err) {
					throw err;
				}
			);
		});

		function draw_loop() {
			ctx.drawImage(video, 0, 0);

			// console.log(canvas.toDataURL());

			// pose.send({ image: canvas.toDataURL() }).then((r) => {
			// 	console.log(1111, r);
			// });

			requestAnimationFrame(draw_loop);
		}
	}, []);

	return (
		<div className="App">
			<header className="App-header">
				<div>
					<div>home</div>

					<button id="start-camera">Start Camera</button>
					<video id="video" autoplay="true"></video>
					<canvas
						id="output_canvas"
						width="640px"
						height="360px"
					></canvas>
				</div>
			</header>
		</div>
	);
}

export default App;
