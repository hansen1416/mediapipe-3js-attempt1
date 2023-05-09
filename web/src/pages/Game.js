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

import "../styles/css/Game.css";
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

export default function Game() {
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

		if (true) {
			setloadingCamera(false);
			setloadingModel(false);
		} else {
			invokeCamera(videoRef.current, () => {
				setloadingCamera(false);
			});

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

				// worker.initModel().then((msg) => {
				// 	console.log(msg);
				// });
			});
		}

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
		Promise.all([
			loadGLTF(process.env.PUBLIC_URL + "/glb/dors.glb"),
			loadGLTF(process.env.PUBLIC_URL + "/glb/low_poly_monster.glb"),
		]).then(([dors, monster_glb]) => {
			figure.current = dors.scene.children[0];
			figure.current.scale.set(30, 30, 30);
			figure.current.position.set(100, -30, 0);
			figure.current.rotation.set(0, -Math.PI/2, 0);

			traverseModel(figure.current, figureParts.current);

			poseToRotation.current = new PoseToRotation(figureParts.current);

			scene.current.add(figure.current);

			const monster = monster_glb.scene.children[0];
			monster.scale.set(0.15, 0.15, 0.15);
			monster.position.set(0, -30, 0);
			// monster.rotation.set(0, 0, 0);

			scene.current.add(monster);

			const monsterbones = {}

			traverseModel(monster, monsterbones);

			console.log(monsterbones);

			monsterbones.hips_02.rotation.set(0, 1.2, 0);

			monsterbones.hips_02.add(new THREE.AxesHelper(5))

			setloadingSilhouette(false);
		});

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (loadingCamera && loadingModel && loadingSilhouette) {
			animate();
		}
	}, [loadingCamera, loadingModel, loadingSilhouette]);

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

		// camera.current = new THREE.PerspectiveCamera(
		// 	90,
		// 	viewWidth / viewHeight,
		// 	0.1,
		// 	1000
		// );

		const width = window.innerWidth/3;
		const height = window.innerHeight/3;

		camera.current = new THREE.OrthographicCamera(
			width / -2, // left
			width / 2, // right
			height / 2, // top
			height / -2, // bottom
			0.1, // near
			1000 // far
		  );

		camera.current.position.set(0, 0, 100);

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
		<div className="game">
			<video
				ref={videoRef}
				autoPlay={true}
				width={subsceneWidth + "px"}
				height={subsceneHeight + "px"}
				style={{
					display: showVideo ? "block" : "none",
				}}
			></video>

			<canvas ref={canvasRef} />
			{/* // ========= captured pose logic */}
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
