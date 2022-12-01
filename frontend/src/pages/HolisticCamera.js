import { useEffect, useRef } from "react";
// import * as THREE from "three";

import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import {
	POSE_CONNECTIONS,
	FACEMESH_TESSELATION,
	HAND_CONNECTIONS,
} from "@mediapipe/holistic";

import { loadGLTF, getUserMedia } from "../components/ropes";
import Figure from "../models/Figure";
// import { tmppose, tmppose1 } from "../components/mypose";

export default function HolisticCamera(props) {
	const { scene, renderer, camera } = props;

	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const webcamera = useRef(null);

	const figure = useRef(null);

	useEffect(() => {
		loadGLTF(process.env.PUBLIC_URL + "/models/my.glb").then((gltf) => {
			const avatar = gltf.scene.children[0];

			// travelModel(avatar);

			avatar.position.set(0, 0, 0);

			scene.current.add(avatar);

			// makePose(poselm);
			figure.current = new Figure(avatar);

			// figure.current.makePose(tmppose1);
			// figure.current.makePose(tmppose);

			renderer.current.render(scene.current, camera.current);
		});

		return () => {
			scene.current.clear();
		};
		// eslint-disable-next-line
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
						// let stream_settings = stream
						// 	.getVideoTracks()[0]
						// 	.getSettings();
						// console.log(stream_settings);
					} catch (error) {
						videoRef.current.src = URL.createObjectURL(stream);
					}
					// Let's start drawing the canvas!
				},
				(err) => {
					throw err;
				}
			);

			const holistic = new Holistic({
				locateFile: (file) => {
					return (
						process.env.PUBLIC_URL + `/mediapipe/holistic/${file}`
					);
					// return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
				},
			});

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
				minTrackingConfidence: 0.5,
			});

			holistic.onResults(onHolisticResults);

			holistic.initialize().then(() => {
				console.info("Loaded holistic model");
			});

			webcamera.current = new Camera(videoRef.current, {
				onFrame: async () => {
					await holistic.send({ image: videoRef.current });
				},
				width: 640,
				height: 360,
			});

			webcamera.current.start();
		}
	}

	function onHolisticResults(results) {
		const poselm = results.poseLandmarks;
		// const facelm = results.faceLandmarks;
		// const lefthandlm = results.leftHandLandmarks;
		// const righthandlm = results.rightHandLandmarks;

		/**
		 * todo save these data to file
		 * consider store in localstorage first
		 * then save it to .npy file in static storage, such as OSS, S3
		 *
		 * note that, these landmarks are relative to the image size
		 */
		// console.log(poselm, facelm, lefthandlm, righthandlm);
		figure.current.makePose(poselm);

		renderer.current.render(scene.current, camera.current);

		const canvasCtx = canvasRef.current.getContext("2d");
		canvasCtx.save();
		canvasCtx.clearRect(
			0,
			0,
			canvasRef.current.width,
			canvasRef.current.height
		);

		canvasCtx.globalCompositeOperation = "source-over";
		drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
			color: "#00FF00",
			lineWidth: 4,
		});
		drawLandmarks(canvasCtx, results.poseLandmarks, {
			color: "#FF0000",
			lineWidth: 2,
		});
		drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
			color: "#C0C0C070",
			lineWidth: 1,
		});
		drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
			color: "#CC0000",
			lineWidth: 5,
		});
		drawLandmarks(canvasCtx, results.leftHandLandmarks, {
			color: "#00FF00",
			lineWidth: 2,
		});
		drawConnectors(
			canvasCtx,
			results.rightHandLandmarks,
			HAND_CONNECTIONS,
			{ color: "#00CC00", lineWidth: 5 }
		);
		drawLandmarks(canvasCtx, results.rightHandLandmarks, {
			color: "#FF0000",
			lineWidth: 2,
		});
		canvasCtx.restore();
	}

	function stopCamera() {
		if (webcamera.current) {
			webcamera.current.stop();
		}
	}

	return (
		<div
			style={{
				position: "absolute",
				bottom: 0,
				right: 0,
			}}
		>
			<div className="web-camera">
				<video
					ref={videoRef}
					autoPlay={true}
					style={{ display: "none" }}
				></video>
				<canvas ref={canvasRef} width="640px" height="360px"></canvas>
			</div>
			<div className="btn-box">
				<button onClick={startCamera}>Start camera</button>
				<button onClick={stopCamera}>Stop camera</button>
			</div>
		</div>
	);
}
