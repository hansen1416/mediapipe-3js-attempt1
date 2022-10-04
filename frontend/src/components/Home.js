import React, {useState} from "react";
import "./Home.css";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import  axios  from "axios"

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
		this.fileRef = React.createRef();

		this.animation_counter = 1;

		this.startCamera = this.startCamera.bind(this);
		this.stopCamera = this.stopCamera.bind(this);
		this.onPoseResults = this.onPoseResults.bind(this);

		this.sendPesudoMsg = this.sendPesudoMsg.bind(this);
		this.stopPesudoMsg = this.stopPesudoMsg.bind(this);

		this.selectVideo = this.selectVideo.bind(this);
		this.preprocessVideo = this.preprocessVideo.bind(this);
		this.uploadVideo = this.uploadVideo.bind(this);

		this.animationframe = 0
		this.animationcounter = 0

		this.state = {videoFileObj: null};

	}

	componentDidMount() {
		if (this.ws === undefined) {
			// todo, retry stratergy
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

					if (this.animation_counter % 10 === 0) {
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

		console.log(wlm)

		let data = wlm.map((x) => Object.values(x));

		// flatten the array
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

		if (this.animationcounter % 1 === 0) {
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

	selectVideo() {
		this.fileRef.current.click()
	}

	preprocessVideo(event) {
		this.setState({
			videoFileObj: event.target.files[0]
		});
	}

	uploadVideo() {

		let formData = new FormData();
		formData.append("file", this.state.videoFileObj);
		formData.append('fileName', this.state.videoFileObj.name);

		axios.post(process.env.REACT_APP_API_URL + '/upload/video', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				// 'Expect': '100-continue'
			}
		}).then(function (response) {
			console.log(response.data);
		}).catch(function (error) {
			if (error.response) { // get response with a status code not in range 2xx
			  console.log(error.response.data);
			  console.log(error.response.status);
			  console.log(error.response.headers);
			} else if (error.request) { // no response
			  console.log(error.request);
			  // instance of XMLHttpRequest in the browser
			  // instance ofhttp.ClientRequest in node.js
			} else { // Something wrong in setting up the request
			  console.log('Error', error.message);
			}
			console.log(error.config);
		  });
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
				<div>
					<input
						ref={this.fileRef} 
						type="file"
						accept=".mp4, wmv"
						onChange={this.preprocessVideo}
					/>
					<button onClick={this.selectVideo}>Select video</button>
					{this.state.videoFileObj && <div>
						<span>{this.state.videoFileObj.name}</span>
						<span>{this.state.videoFileObj.type}</span>
						<span>{(this.state.videoFileObj.size / 1024 / 1024).toFixed(2)}MB</span>
					</div>}
					<button onClick={this.uploadVideo}>Upload video</button>
				</div>
			</div>
		);
	}
}
