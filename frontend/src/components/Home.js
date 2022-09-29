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

		this.animation_counter = 1;

		this.startCamera = this.startCamera.bind(this);
		this.stopCamera = this.stopCamera.bind(this);
		this.onPoseResults = this.onPoseResults.bind(this);

		this.sendPesudoMsg = this.sendPesudoMsg.bind(this);
		this.stopPesudoMsg = this.stopPesudoMsg.bind(this);

		this.animationframe = 0
		this.animationcounter = 0

	}

	componentDidMount() {
		if (this.ws === undefined) {
			this.ws = new WebSocket(process.env.REACT_APP_WS_ENDPOINT);

			// Change binary type from "blob" to "arraybuffer"
			// this.ws.binaryType = "arraybuffer";

			this.ws.addEventListener("open", () => {
				this.ws.send("How are you?");
			});

			this.ws.addEventListener("message", (event) => {
				console.log(event.data);
			});
		}
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
				enableSegmentation: false,
				smoothSegmentation: false,
				minDetectionConfidence: 0.5,
				minTrackingConfidence: 0.5,
			});
			pose.onResults(this.onPoseResults);

			pose.initialize().then(() => {
				console.info("Loaded pose model");
			});

			const ctx = this.canvasRef.current.getContext("2d");

			this.camera = new Camera(this.videoRef.current, {
				onFrame: async () => {
					this.onFrame(this.videoRef.current, ctx);

					if (this.animation_counter % 100 == 0) {
						await pose.send({ image: this.videoRef.current });

						this.animation_counter = 0;
					}

					this.animation_counter += 1;
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

		if (!wlm) {
			return
		}

		let data = wlm.map((x) => Object.values(x));

		data = data.reduce((prev, next) => {
			return prev.concat(next);
		});

		data = new Float32Array(data);

		// console.log(data);

		this.ws.send(data);
	}

	stopCamera() {
		if (this.camera) {
			this.camera.stop();

			console.info("Camera stopped");
		}
	}

	sendPesudoMsg() {

		if (this.animationcounter % 1 == 0) {
			this.ws.send(Date.now());
		}

		this.animationcounter += 1

		this.animationframe = requestAnimationFrame(this.sendPesudoMsg)
	}

	stopPesudoMsg() {
		cancelAnimationFrame(this.animationframe)
		this.animationcounter = 0
		this.ws.send('stopped pesudo data');

		// this.ws.close()
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
				<div>
					<button onClick={this.sendPesudoMsg}>Start mass messages</button>
					<button onClick={this.stopPesudoMsg}>Stop mass messages</button>
				</div>
			</div>
		);
	}
}
