import { useEffect, useRef } from "react";

import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { getUserMedia } from "./ropes";

export default function WebCamera() {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const animationCounter = useRef(1);
	// const animationframe = useRef(0);

	const ws = useRef(null);
	const camera = useRef(null);

	const tmpcounter = useRef(0);

	useEffect(() => {
		// todo, retry stratergy
		ws.current = new WebSocket(process.env.REACT_APP_WS_ENDPOINT);

		ws.current.addEventListener("error", (e) => {
			console.info("websocket server not available", e);
		});

		// Change binary type from "blob" to "arraybuffer"
		// ws.current.binaryType = "arraybuffer";

		ws.current.addEventListener("open", () => {
			ws.current.send("How are you?");
		});

		ws.current.addEventListener("message", (event) => {
			console.log(event.data);
		});
	}, []);

	function startCamera() {
		if (videoRef.current) {
			getUserMedia(
				{ video: true },
				(stream) => {
					// Yay, now our webcam input is treated as a normal video and
					// we can start having fun
					try {
						videoRef.current.srcObject = stream;

						let stream_settings = stream
							.getVideoTracks()[0]
							.getSettings();

						console.log(stream_settings);
					} catch (error) {
						videoRef.current.src = URL.createObjectURL(stream);
					}
					// Let's start drawing the canvas!
				},
				(err) => {
					throw err;
				}
			);

			const pose = new Pose({
				locateFile: (file) => {
					return process.env.PUBLIC_URL + `/mediapipe/${file}`;
					// return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
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
			pose.onResults(onPoseResults);

			pose.initialize().then(() => {
				console.info("Loaded pose model");
			});

			const ctx = canvasRef.current.getContext("2d");

			camera.current = new Camera(videoRef.current, {
				onFrame: async () => {
					onFrame(videoRef.current, ctx);

					if (animationCounter.current % 10 === 0) {
						await pose.send({ image: videoRef.current });

						animationCounter.current = 0;
					}

					animationCounter.current += 1;
				},
				width: 640,
				height: 360,
			});

			camera.current.start();
		}
	}

	function onFrame(video, ctx) {
		ctx.drawImage(video, 0, 0);
	}

	function onPoseResults(results) {
		const wlm = results.poseWorldLandmarks;

		if (!wlm) {
			return;
		}

		tmpcounter.current += 1;

		if (tmpcounter.current == 50) {
			console.log(wlm);
		}

		let data = wlm.map((x) => Object.values(x));

		// flatten the array
		data = data.reduce((prev, next) => {
			return prev.concat(next);
		});

		data = new Float32Array(data);

		// console.log(data);

		// ws.current.send(data);
	}

	function stopCamera() {
		if (camera.current) {
			camera.current.stop();

			console.info("Camera stopped");
		}
	}

	// function sendPesudoMsg() {
	// 	if (animationCounter.current % 1 === 0) {
	// 		ws.current.send(Date.now());
	// 	}

	// 	animationCounter.current += 1;

	// 	animationframe.current = requestAnimationFrame(sendPesudoMsg);
	// }

	// function stopPesudoMsg() {
	// 	cancelAnimationFrame(animationframe.current);
	// 	animationCounter.current = 0;
	// 	ws.current.send("stopped pesudo data");

	// 	// ws.current.close()
	// }

	return (
		<div className="web-camera">
			<video ref={videoRef} autoPlay={true}></video>
			<canvas ref={canvasRef} width="640px" height="360px"></canvas>
			<div>
				<button onClick={startCamera}>Start camera</button>
				<button onClick={stopCamera}>Stop camera</button>
			</div>
			{/* <div>
				<button onClick={sendPesudoMsg}>Start mass messages</button>
				<button onClick={stopPesudoMsg}>Stop mass messages</button>
			</div> */}
		</div>
	);
}
