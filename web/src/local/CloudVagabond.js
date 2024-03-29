import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import Button from "react-bootstrap/Button";
// import * as poseDetection from "@tensorflow-models/pose-detection";
import { cloneDeep } from "lodash";
import { Pose } from "@mediapipe/pose";
// import { Hands } from "@mediapipe/hands";
import { createWorkerFactory, useWorker } from "@shopify/react-web-worker";
import Button from "react-bootstrap/Button";
// import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
// import { Holistic } from "@mediapipe/holistic";

import "../styles/css/CloudVagabond.css";
// import SubThreeJsScene from "../components/SubThreeJsScene";
// import Silhouette3D from "../components/Silhouette3D";
// import T from "../components/T";
import {
	// BlazePoseKeypoints,
	// BlazePoseConfig,
	// drawPoseKeypointsMediaPipe,
	loadGLTF,
	// invokeCamera,
	traverseModel,
	// loadJSON,
	// loadFBX,
	invokeCamera,
	// getMeshSize,
	// jsonToBufferGeometry,
} from "../components/ropes";

import PoseToRotation from "../components/PoseToRotation";

const createWorker = createWorkerFactory(() => import("../pages/HandsWorker"));

export default function CloudVagabond() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const animationPointer = useRef(0);

	// 3d model
	const figure = useRef([]);
	// bones of 3d model
	const figureParts = useRef({});

	const poseDetector = useRef(null);

	// const handDetector = useRef(null);
	// apply pose to bones
	const poseToRotation = useRef(null);

	// const fbxmodel = useRef(null);

	// ========= captured pose logic
	// const [capturedPose, setcapturedPose] = useState();
	const counter = useRef(0);
	// ========= captured pose logic

	const videoRef = useRef(null);
	// const canvasVideoRef = useRef(null);
	// const canvasVideoRefCtx = useRef(null);

	// NOTE: we must give a width/height ratio not close to 1, otherwise there will be wired behaviors
	const [subsceneWidth, setsubsceneWidth] = useState(334);
	const [subsceneHeight, setsubsceneHeight] = useState(250);
	const subsceneWidthRef = useRef(0);
	const subsceneHeightRef = useRef(0);
	// the width and height in the 3.js world
	const visibleWidth = useRef(0);
	const visibleHeight = useRef(0);

	const [loadingCamera, setloadingCamera] = useState(true);
	const [loadingModel, setloadingModel] = useState(true);
	const [loadingSilhouette, setloadingSilhouette] = useState(true);

	// worker for hands detection
	// const worker = useWorker(createWorker);

	const [runAnimation, setrunAnimation] = useState(true);
	const runAnimationRef = useRef(true);
	const [showVideo, setshowVideo] = useState(false);

	useEffect(() => {
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		setsubsceneWidth(documentWidth * 0.25);
		setsubsceneHeight((documentWidth * 0.25 * 480) / 640);

		// subsceneWidthRef.current = documentWidth * 0.25;
		// subsceneHeightRef.current = (documentWidth * 0.25 * 480) / 640;

		creatMainScene(documentWidth, documentHeight);

		invokeCamera(videoRef.current, () => {
			setloadingCamera(false);
		});

		// canvasVideoRefCtx.current = canvasVideoRef.current.getContext("2d");

		// setloadingCamera(false);

		// // there was some issue if we do pose and hand async
		// FilesetResolver.forVisionTasks(
		// 	process.env.PUBLIC_URL + "/mediapipe/vision"
		// 	// "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
		// ).then((vision) => {
		// 	HandLandmarker.createFromOptions(vision, {
		// 		baseOptions: {
		// 			modelAssetPath:
		// 				process.env.PUBLIC_URL +
		// 				"/mediapipe/hand/hand_landmarker.task",
		// 			// `https://storage.googleapis.com/mediapipe-assets/hand_landmarker.task`,
		// 		},
		// 		numHands: 2,
		// 		runningMode: "IMAGE",
		// 	}).then((handLandmarker) => {
		// 		handDetector.current = handLandmarker;
		// 	});
		// });

		poseDetector.current = new Pose({
			locateFile: (file) => {
				return process.env.PUBLIC_URL + `/mediapipe/pose/${file}`;
				// return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
			},
		});
		poseDetector.current.setOptions({
			modelComplexity: 2,
			smoothLandmarks: true,
			enableSegmentation: false,
			smoothSegmentation: false,
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5,
		});

		poseDetector.current.onResults(onPoseCallback);

		poseDetector.current.initialize().then(() => {
			setloadingModel(false);
			animate();

			// worker.initModel().then((msg) => {
			// 	console.log(msg);
			// });
		});

		/*
		handDetector.current = new Hands({
			locateFile: (file) => {
				return process.env.PUBLIC_URL + `/mediapipe/hands/${file}`;
				// return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
			},
		});
		handDetector.current.setOptions({
			maxNumHands: 2,
			modelComplexity: 1,
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5,
			static_image_mode: false,
		});
		handDetector.current.onResults(onHandCallback);

		handDetector.current.initialize().then(() => {
			setloadingModel(false);
			animate();
		});
*/

		/*
		poseDetector.current = new Holistic({
			locateFile: (file) => {
				return process.env.PUBLIC_URL + `/mediapipe/holistic/${file}`;
				// return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
			},
		});
		poseDetector.current.setOptions({
			modelComplexity: 1,
			smoothLandmarks: true,
			enableSegmentation: false,
			smoothSegmentation: false,
			refineFaceLandmarks: false,
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5,
		});
		poseDetector.current.onResults(onPoseCallback);

		poseDetector.current.initialize().then(() => {
			setloadingModel(false);
			animate();
		});
*/
		Promise.all([loadGLTF(process.env.PUBLIC_URL + "/glb/dors.glb")]).then(
			([glb]) => {
				figure.current = glb.scene.children[0];
				figure.current.position.set(0, -1, 0);

				traverseModel(figure.current, figureParts.current);

				poseToRotation.current = new PoseToRotation(
					figureParts.current
				);

				// The X axis is red. The Y axis is green. The Z axis is blue.
				// const axesHelper = new THREE.AxesHelper(1.5);

				// figureParts.current.Hips.add(axesHelper);

				// const axesHelper1 = new THREE.AxesHelper(1.5);

				// figureParts.current.LeftShoulder.add(axesHelper1);

				scene.current.add(figure.current);

				setloadingSilhouette(false);
			}
		);

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		subsceneWidthRef.current = subsceneWidth;
	}, [subsceneWidth]);

	useEffect(() => {
		subsceneHeightRef.current = subsceneHeight;
	}, [subsceneHeight]);

	useEffect(() => {
		runAnimationRef.current = runAnimation;
	}, [runAnimation]);

	function creatMainScene(viewWidth, viewHeight) {
		scene.current = new THREE.Scene();

		camera.current = new THREE.PerspectiveCamera(
			90,
			viewWidth / viewHeight,
			0.1,
			1000
		);

		camera.current.position.set(0, 0, 2);

		/**
		 * visible_height = 2 * tan(camera_fov / 2) * camera_z
		 * visible_width = visible_height * camera_aspect
		 */

		const vFOV = THREE.MathUtils.degToRad(camera.current.fov); // convert vertical fov to radians

		visibleHeight.current =
			2 * Math.tan(vFOV / 2) * camera.current.position.z; // visible height

		visibleWidth.current = visibleHeight.current * camera.current.aspect; // visible width

		{
			// mimic the sun light
			const dlight = new THREE.PointLight(0xffffff, 0.4);
			dlight.position.set(0, 10, 10);
			scene.current.add(dlight);
			// env light
			scene.current.add(new THREE.AmbientLight(0xffffff, 0.6));
		}

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
			alpha: true,
			antialias: true,
		});

		renderer.current.toneMappingExposure = 0.5;

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		renderer.current.setSize(viewWidth, viewHeight);
	}

	function animate() {
		// ========= captured pose logic

		if (
			runAnimationRef.current &&
			videoRef.current &&
			videoRef.current.readyState >= 2 &&
			counter.current % 3 === 0 &&
			poseDetector.current
		) {
			poseDetector.current.send({ image: videoRef.current });
			/*
			createImageBitmap(
				videoRef.current,
				// 0,
				// 0,
				// subsceneWidthRef.current,
				// subsceneHeightRef.current,
				{
					// resizeWidth: 420,
					// resizeHeight: 315,
					// resizeQuality: "pixelated",
				}
			).then((bitmap) => {
				poseDetector.current.send({ image: bitmap });

				// handDetector.current.send({ image: bitmap });

				worker.plotHands(bitmap).then((msg) => {
					// console.log(msg);
				});
			});
*/
			/*
			canvasVideoRefCtx.current.drawImage(videoRef.current, 0, 0, 379, 284);

			// this method seems consume more memory than blob
			// need further investigation. probably because we can set quality in `toBlob`
			// const imagedata = canvasVideoRefCtx.current.getImageData(0, 0, 379, 284);

			canvasVideoRef.current.toBlob((blob) => {

				poseDetector.current.send({ image: blob });

				// blob.arrayBuffer().then((res) => {
				// 	// console.log(res)
				// 	poseDetector.current.send(res);

				// 	// poseDetector.current.send({ image: videoRef.current });
				// })
			}, 'image/jpeg', 1)
*/
			// handDetector.current.send({ image: videoRef.current });
			// if (handDetector.current) {
			// 	handDetector.current
			// 		.setOptions({ runningMode: "IMAGE" })
			// 		.then(() => {
			// 			const handlandmarks = handDetector.current.detect(
			// 				videoRef.current
			// 			);
			// 			console.log(handlandmarks);
			// 		});
			// }
		}

		counter.current += 1;

		if (counter.current > 10000) {
			counter.current = 0;
		}

		// ========= captured pose logic

		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function onPoseCallback(result) {
		if (!result || !result.poseWorldLandmarks) {
			return;
		}
		// console.log(result);
		const pose3D = cloneDeep(result.poseWorldLandmarks);
		// const pose3D = cloneDeep(result.poseLandmarks);

		const width_ratio = 30;
		const height_ratio = (width_ratio * 480) / 640;

		// const width_ratio = 1;
		// const height_ratio = 1;

		// multiply x,y by differnt factor
		for (let v of pose3D) {
			v["x"] *= width_ratio;
			v["y"] *= -height_ratio;
			v["z"] *= -width_ratio;
		}

		// const g = drawPoseKeypointsMediaPipe(pose3D);

		// g.scale.set(8, 8, 8);

		// setcapturedPose(g);

		poseToRotation.current.applyPoseToBone(pose3D);

		// move the position of model
		const pose2D = cloneDeep(result.poseLandmarks);

		poseToRotation.current.applyPosition(
			pose2D,
			visibleWidth.current,
			visibleHeight.current
		);
	}

	// function onHandCallback(result) {
	// 	console.log(result);
	// }

	return (
		<div className="cloud-vagabond">
			<video
				ref={videoRef}
				autoPlay={true}
				width={subsceneWidth + "px"}
				height={subsceneHeight + "px"}
				style={{
					display: showVideo ? "block" : "none",
					// position: "absolute",
					// bottom: 0,
					// right: 0,
				}}
			></video>
			{/* <canvas
				ref={canvasVideoRef}
				width={subsceneWidth + "px"}
				height={subsceneHeight + "px"}
				style={{
					display: "none",
					// position: "absolute",
					// top: 0,
					// right: 0,
				}}
			/> */}

			<canvas ref={canvasRef} />
			{/* // ========= captured pose logic */}
			{/* <div
				style={{
					width: subsceneWidth + "px",
					height: subsceneHeight + "px",
					position: "absolute",
					top: 0,
					left: 0,
				}}
			>
				<SubThreeJsScene
					width={subsceneWidth}
					height={subsceneHeight}
					objects={capturedPose}
					cameraZ={200}
				/>
			</div> */}
			<div className="btns">
				<Button
					variant="primary"
					onClick={() => {
						setshowVideo(!showVideo);
					}}
				>
					{showVideo ? "hide video" : "show video"}
				</Button>
				<Button
					variant="primary"
					onClick={() => {
						setrunAnimation(!runAnimation);
					}}
				>
					{runAnimation ? "pause animation" : "run animation"}
				</Button>
			</div>
			{(loadingCamera || loadingModel || loadingSilhouette) && (
				<div className="mask">
					{loadingCamera && (
						<div>
							<span>Preparing Camera....</span>
						</div>
					)}
					{loadingModel && (
						<div>
							<span>Preparing Model....</span>
						</div>
					)}
					{loadingSilhouette && (
						<div>
							<span>Preparing Silhouette...</span>.
						</div>
					)}
				</div>
			)}
		</div>
	);
}
