import { useEffect, useRef } from "react";

import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import { getUserMedia } from "../components/ropes";

export default function HolisticCamera() {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	// const animationCounter = useRef(1);
	// const animationframe = useRef(0);

	const camera = useRef(null);

	// const tmpcounter = useRef(0);

	useEffect(() => {
		//

		console.log(Holistic);

		return () => {};
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

			const holistic = new Holistic({locateFile: (file) => {
				return process.env.PUBLIC_URL + `/mediapipe/holistic/${file}`;
				// return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
			}});
			
			holistic.setOptions({
				// STATIC_IMAGE_MODE
				staticImageMode: false,
				// 0, 1 or 2. Landmark accuracy as well as inference latency generally go up with the model complexity. Default to 1.
				modelComplexity: 1,
				// If set to true, the solution filters pose landmarks across different input images to reduce jitter.
				smoothLandmarks: true,
				// If set to true, in addition to the pose, face and hand landmarks the solution also generates the segmentation mask.
				enableSegmentation: false,
				// If set to true, the solution filters segmentation masks across different input images to reduce jitter.
				// smoothSegmentation: true,
				// Whether to further refine the landmark coordinates around the eyes and lips, and output additional landmarks around the irises
				refineFaceLandmarks: true,
				// Minimum confidence value ([0.0, 1.0]) from the person-detection model for the detection to be considered successful.
				minDetectionConfidence: 0.5,
				// Minimum confidence value ([0.0, 1.0]) from the landmark-tracking model for the pose landmarks to be considered tracked successfully, 
				// or otherwise person detection will be invoked automatically on the next input image. 
				// Setting it to a higher value can increase robustness of the solution, at the expense of a higher latency.
				minTrackingConfidence: 0.5
			});
			
			holistic.onHolisticResults(onHolisticResults);

			holistic.initialize().then(() => {
				console.info("Loaded holistic model");
			});

			const ctx = canvasRef.current.getContext("2d");

			const camera = new Camera(videoRef.current, {
				onFrame: async () => {

					onFrame(videoRef.current, ctx);

				  	await holistic.send({image: videoRef.current});
				},
				width: 1280,
				height: 720
			  });
			
			camera.start();
		}
	}

	function onFrame(video, ctx) {
		ctx.drawImage(video, 0, 0);
	}

	function onHolisticResults(results) {

		const poselm =  results.poseLandmarks;
		const facelm = results.faceLandmarks;
		const lefthandlm = results.leftHandLandmarks;
		const righthandlm = results.rightHandLandmarks;

		// const wlm = results.poseWorldLandmarks;

		// if (!wlm) {
		// 	return;
		// }

		// tmpcounter.current += 1;

		// if (tmpcounter.current === 50) {
		// 	console.log(wlm);
		// }

		// let data = wlm.map((x) => Object.values(x));

		// // flatten the array
		// data = data.reduce((prev, next) => {
		// 	return prev.concat(next);
		// });

		// data = new Float32Array(data);

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
		<div>
			<div className="web-camera">
				<video ref={videoRef} autoPlay={true}></video>
				<canvas ref={canvasRef} width="640px" height="360px"></canvas>
			</div>
			<div className="btn-box">
				<button onClick={startCamera}>Start camera</button>
				<button onClick={stopCamera}>Stop camera</button>
			</div>
		</div>
	);
}
