import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { cloneDeep } from "lodash";
import { Pose } from "@mediapipe/pose";
// import { createWorkerFactory } from "@shopify/react-web-worker";
import Button from "react-bootstrap/Button";
import "../styles/css/Game.css";

import { loadGLTF, traverseModel, invokeCamera } from "../components/ropes";
import PoseToRotation from "../components/PoseToRotation";

// const createWorker = createWorkerFactory(() => import("../pages/HandsWorker"));

export default function Game() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const animationPointer = useRef(0);

	const poseDetector = useRef(null);
	const poseDetectorAvailable = useRef(false);
	// apply pose to bones
	const poseToRotation = useRef(null);

	const videoRef = useRef(null);

	// NOTE: we must give a width/height ratio not close to 1, otherwise there will be wired behaviors
	const sceneWidth = document.documentElement.clientWidth;
	const sceneHeight = document.documentElement.clientHeight;

	const [subsceneWidth, setsubsceneWidth] = useState(334);
	const [subsceneHeight, setsubsceneHeight] = useState(250);
	const subsceneWidthRef = useRef(0);
	const subsceneHeightRef = useRef(0);
	// the width and height in the 3.js world

	const [loadingCamera, setloadingCamera] = useState(true);
	const [loadingModel, setloadingModel] = useState(true);
	const [loadingSilhouette, setloadingSilhouette] = useState(true);

	// controls
	const [runAnimation, setrunAnimation] = useState(true);
	const runAnimationRef = useRef(true);
	const [showVideo, setshowVideo] = useState(false);

	// player1 model
	const player1 = useRef({});
	// bones of player1 model
	const player1Bones = useRef({});
	// player2 model
	const player2 = useRef({});
	// bones of player2 model
	const player2Bones = useRef({});
	// monster model
	const monster = useRef({});
	// bones of monster model
	const monsterBones = useRef({});

	const groundLevel = -100;

	useEffect(() => {
		setsubsceneWidth(sceneWidth * 0.25);
		setsubsceneHeight((sceneHeight * 0.25 * 480) / 640);

		creatMainScene(sceneWidth, sceneHeight);

		if (false) {
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

				poseDetectorAvailable.current = true;
			});
		}

		Promise.all([
			loadGLTF(process.env.PUBLIC_URL + "/glb/daneel.glb"),
			loadGLTF(process.env.PUBLIC_URL + "/glb/dors.glb"),
			// loadGLTF(process.env.PUBLIC_URL + "/glb/monster.glb"),
		]).then(([daneel, dors]) => {
			// player1
			const scale = 100;

			player1.current = dors.scene.children[0];
			player1.current.scale.set(scale, scale, scale);
			player1.current.position.set(0, groundLevel, sceneWidth / 2);
			player1.current.rotation.set(0, -Math.PI, 0);

			traverseModel(player1.current, player1Bones.current);

			poseToRotation.current = new PoseToRotation(player1Bones.current);

			scene.current.add(player1.current);

			// player2
			player2.current = daneel.scene.children[0];
			player2.current.scale.set(scale, scale, scale);
			player2.current.position.set(0, -60, -sceneWidth / 2);
			player2.current.rotation.set(0, 0, 0);

			traverseModel(player2.current, player2Bones.current);

			scene.current.add(player2.current);

			// monster
			// monster.current = monster_glb.scene.children[0];
			// monster.current.scale.set(0.6, 0.6, 0.6);
			// monster.current.position.set(0, groundLevel, -sceneWidth / 2);

			// traverseModel(monster.current, monsterBones.current);

			// scene.current.add(monster.current);

			// all models ready
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

		camera.current = new THREE.OrthographicCamera(
			sceneWidth / -2, // left
			sceneWidth / 2, // right
			sceneHeight / 2, // top
			sceneHeight / -2, // bottom
			0.1, // near
			sceneWidth * 2 // far
		);

		camera.current.position.set(0, 200, sceneWidth);

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
			poseDetectorAvailable.current &&
			poseDetector.current
		) {
			poseDetectorAvailable.current = false;
			poseDetector.current.send({ image: videoRef.current });
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

		// multiply x,y by differnt factor
		for (let v of pose3D) {
			v["x"] *= width_ratio;
			v["y"] *= -height_ratio;
			v["z"] *= -width_ratio;
		}

		poseToRotation.current.applyPoseToBone(pose3D);

		// move the position of model
		// const pose2D = cloneDeep(result.poseLandmarks);

		// poseToRotation.current.applyPosition(
		// 	pose2D,
		// 	sceneWidth,
		// 	sceneHeight
		// );

		poseDetectorAvailable.current = true;
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
