import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { cloneDeep } from "lodash";
import { Pose } from "@mediapipe/pose";
import Nebula, { SpriteRenderer } from "three-nebula";
// import { createWorkerFactory } from "@shopify/react-web-worker";
import Button from "react-bootstrap/Button";
import "../styles/css/Game.css";

import { loadGLTF, traverseModel, invokeCamera } from "../components/ropes";
import PoseToRotation from "../components/PoseToRotation";

// const createWorker = createWorkerFactory(() => import("../pages/HandsWorker"));

const proton_json = {
	preParticles: 500,
	integrationType: "EULER",
	emitters: [
		{
			id: "51ca9450-3d8b-11e9-a1e8-4785d9606b75",
			totalEmitTimes: null,
			life: null,
			cache: { totalEmitTimes: null, life: null },
			rate: {
				particlesMin: 1,
				particlesMax: 4,
				perSecondMin: 0.01,
				perSecondMax: 0.02,
			},
			position: { x: 0, y: 0, z: 0 },
			rotation: { x: 0, y: 0, z: 0 },
			initializers: [
				{
					id: "51ca9451-3d8b-11e9-a1e8-4785d9606b75",
					type: "Mass",
					properties: { min: 30, max: 10, isEnabled: true },
				},
				{
					id: "51ca9452-3d8b-11e9-a1e8-4785d9606b75",
					type: "Life",
					properties: { min: 2, max: 4, isEnabled: true },
				},
				{
					id: "51ca9453-3d8b-11e9-a1e8-4785d9606b75",
					type: "BodySprite",
					properties: {
						texture:
							"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJkSURBVHjaxJeJbusgEEW94S1L//83X18M2MSuLd2pbqc4wZGqRLrKBsyZhQHny7Jk73xVL8xpVhWrcmiB5lX+6GJ5YgQ2owbAm8oIwH1VgKZUmGcRqKGGPgtEQQAzGR8hQ59fAmhJHSAagigJ4E7GPWRXOYC6owAd1JM6wDQPADyMWUqZRMqmAojHp1Vn6EQQEgUNMJLnUjMyJsM49wygBkAPw9dVFwXRkncCIIW3GRgoTQUZn6HxCMAFEFd8TwEQ78X4rHbILoAUmeT+RFG4UhQ6MiIAE4W/UsYFjuVjAIa2nIY4q1R0GFtQWG3E84lqw2GO2QOoCKBVu0BAPgDSU0eUDjjQenNkV/AW/pWChhpMTelo1a64AOKM30vk18GzTHXCNtI/Knz3DFBgsUqBGIjTInXRY1yA9xkVoqW5tVq3pDR9A0hfF5BSARmVnh7RMDCaIdcNgbPBkgzn1Bu+SfIEFSpSBmkxyrMicb0fAEuCZrWnN89veA/4XcakrPcjBWzkTuLjlbfTQPOlBhz+HwkqqPXmPQDdrQItxE1moGof1S74j/8txk8EHhTQrAE8qlwfqS5yukm1x/rAJ9Jiaa6nyATqD78aUVBhFo8b1V4DdTXdCW+IxA1zB4JhiOhZMEWO1HqnvdoHZ4FAMIhV9REF8FiUm0jsYPEJx/Fm/N8OhH90HI9YRHesWbXXZwAShU8qThe7H8YAuJmw5yOd989uRINKRTJAhoF8jbqrHKfeCYdIISZfSq26bk/K+yO3YvfKrVgiwQBHnwt8ynPB25+M8hceTt/ybPhnryJ78+tLgAEAuCFyiQgQB30AAAAASUVORK5CYII=",
						isEnabled: true,
					},
				},
				{
					id: "51ca9454-3d8b-11e9-a1e8-4785d9606b75",
					type: "Radius",
					properties: { width: 24, height: 8, isEnabled: true },
				},
				// {
				// 	id: "51ca9455-3d8b-11e9-a1e8-4785d9606b75",
				// 	type: "Velocity",
				// 	properties: {
				// 		radius: 10,
				// 		x: 0,
				// 		y: 5,
				// 		z: 0,
				// 		theta: 900,
				// 		isEnabled: true,
				// 	},
				// },
			],
			behaviours: [
				{
					id: "51ca9456-3d8b-11e9-a1e8-4785d9606b75",
					type: "Alpha",
					properties: {
						alphaA: 1,
						alphaB: 0,
						life: null,
						easing: "easeLinear",
					},
				},
				{
					id: "51ca9457-3d8b-11e9-a1e8-4785d9606b75",
					type: "Color",
					properties: {
						colorA: "#002a4f",
						colorB: "#0029FF",
						life: null,
						easing: "easeOutCubic",
					},
				},
				{
					id: "51ca9458-3d8b-11e9-a1e8-4785d9606b75",
					type: "Scale",
					properties: {
						scaleA: 1,
						scaleB: 0.5,
						life: null,
						easing: "easeLinear",
					},
				},
				{
					id: "51ca9459-3d8b-11e9-a1e8-4785d9606b75",
					type: "Force",
					properties: {
						fx: 0,
						fy: 5,
						fz: 0,
						life: null,
						easing: "easeLinear",
					},
				},
				{
					id: "51ca945a-3d8b-11e9-a1e8-4785d9606b75",
					type: "Rotate",
					properties: {
						x: 1,
						y: 0,
						z: 0,
						life: null,
						easing: "easeLinear",
					},
				},
				{
					id: "51ca945b-3d8b-11e9-a1e8-4785d9606b75",
					type: "RandomDrift",
					properties: {
						driftX: 1,
						driftY: 23,
						driftZ: 4,
						delay: 1,
						life: null,
						easing: "easeLinear",
					},
				},
				{
					id: "51ca945c-3d8b-11e9-a1e8-4785d9606b75",
					type: "Spring",
					properties: {
						x: 1,
						y: 5,
						z: 0,
						spring: 0.01,
						friction: 1,
						life: null,
						easing: "easeLinear",
					},
				},
			],
			emitterBehaviours: [
				{
					id: "19ed8a38-399c-11e9-8047-93549ebdb1a0",
					type: "Rotate",
					properties: {
						x: 0,
						y: 100,
						z: 100,
						life: null,
						easing: "easeLinear",
					},
				},
			],
		},
	],
};

export default function Game() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const nebula = useRef(null);

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
	// // monster model
	// const monster = useRef({});
	// // bones of monster model
	// const monsterBones = useRef({});

	const groundLevel = -100;

	useEffect(() => {
		setsubsceneWidth(sceneWidth * 0.25);
		setsubsceneHeight((sceneHeight * 0.25 * 480) / 640);

		creatMainScene(sceneWidth, sceneHeight);

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
			player1.current.position.set(0, groundLevel, -sceneWidth / 2);

			traverseModel(player1.current, player1Bones.current);

			poseToRotation.current = new PoseToRotation(player1Bones.current);

			scene.current.add(player1.current);

			// player2
			player2.current = daneel.scene.children[0];
			player2.current.scale.set(scale, scale, scale);
			player2.current.position.set(0, -60, sceneWidth / 2);
			player2.current.rotation.set(0, -Math.PI, 0);

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
			Nebula.fromJSONAsync(proton_json, THREE).then((loaded) => {
				// const app = {scene: scene.current, camera : camera.current, renderer: renderer.current};
				const nebulaRenderer = new SpriteRenderer(scene.current, THREE);
				nebula.current = loaded.addRenderer(nebulaRenderer);

				animate();
			});
			// animate();
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

		camera.current.position.set(0, 200, -sceneWidth);

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
		nebula.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function onPoseCallback(result) {
		if (result && result.poseWorldLandmarks) {
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
			const pose2D = cloneDeep(result.poseLandmarks);

			const to_pos = poseToRotation.current.applyPosition(
				pose2D,
				sceneWidth * 0.6
			);

			if (to_pos) {
				player1.current.position.set(
					to_pos.x,
					groundLevel,
					-sceneWidth / 2
				);
			}

			// todo, store 4 arms vectors, and decide whether it's defence or attack.
			// attack include left/right arm attack
		}

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
