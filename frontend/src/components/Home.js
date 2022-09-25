import React from "react";
import "./Home.css";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

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

export default class Home extends React.Component {
	constructor(props) {
		super(props);

		// console.log(Camera);
		// console.log(Pose);

		this.videoRef = React.createRef();
		this.canvasRef = React.createRef();

		this.startCamera = this.startCamera.bind(this);
		this.stopCamera = this.stopCamera.bind(this);

		const ws = new WebSocket("ws://localhost:8080");

		ws.addEventListener("open", () => {
			console.log("We are connected");
			ws.send("How are you?");
		});

		ws.addEventListener("message", (event) => {
			console.log(event.data);
		});
	}

	componentDidMount() {
		// console.log(this);
	}

	startCamera() {
		if (this.videoRef && this.videoRef.current) {
			getUserMedia(
				{ video: true },
				(stream) => {
					// Yay, now our webcam input is treated as a normal video and
					// we can start having fun
					try {
						this.videoRef.current.srcObject = stream;
					} catch (error) {
						this.videoRef.current.src = URL.createObjectURL(stream);
					}
					// Let's start drawing the canvas!
				},
				(err) => {
					throw err;
				}
			);

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
			pose.onResults(this.onPoseResults);

			pose.initialize().then(() => {
				console.log("loaded pose model");
			});

			const ctx = this.canvasRef.current.getContext("2d");

			this.camera = new Camera(this.videoRef.current, {
				onFrame: async () => {
					this.onFrame(this.videoRef.current, ctx);

					await pose.send({ image: this.videoRef.current });

					// console.log(pose);
				},
				width: 640,
				height: 360,
			});

			this.camera.start();
		}
	}

	onFrame(video, ctx) {
		ctx.drawImage(video, 0, 0);
	}

	onPoseResults(results) {
		const wlm = results.poseWorldLandmarks;

		// console.log("result is", wlm);
	}

	stopCamera() {
		if (this.camera) {
			this.camera.stop();
		}
	}

	render() {
		return (
			<div>
				<video ref={this.videoRef} autoPlay={true}></video>
				<canvas
					ref={this.canvasRef}
					width="640px"
					height="360px"
				></canvas>
				<div>
					<button onClick={this.startCamera}>Start camera</button>
					<button onClick={this.stopCamera}>Stop camera</button>
				</div>
			</div>
		);
	}
}
