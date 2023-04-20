import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { cloneDeep } from "lodash";
import { Pose } from "@mediapipe/pose";
// import { createWorkerFactory, useWorker } from "@shopify/react-web-worker";
import Button from "react-bootstrap/Button";

import "../styles/css/Dodgeverse.css";

import { loadGLTF, traverseModel, invokeCamera } from "../components/ropes";

import PoseToRotation from "../components/PoseToRotation";

// const createWorker = createWorkerFactory(() => import("../pages/HandsWorker"));

export default function Dodgeverse() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const animationPointer = useRef(0);
	// count frames
	const counter = useRef(0);

	const videoRef = useRef(null);

	// 3d model
	const figure = useRef([]);
	// bones of 3d model
	const figureParts = useRef({});

	const poseDetector = useRef(null);
	// apply pose to bones
	const poseToRotation = useRef(null);

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
	const [loadingCharacter, setloadingCharacter] = useState(true);

	// worker for game scene generation
	// const worker = useWorker(createWorker);

	const [capturePose, setcapturePose] = useState(false);
	const capturePoseRef = useRef(false);
	const [showVideo, setshowVideo] = useState(false);

	// waepons
	const lefthandWeapon = useRef(null);

	const target1 = useRef(null);

	useEffect(() => {
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		setsubsceneWidth(documentWidth * 0.25);
		setsubsceneHeight((documentWidth * 0.25 * 480) / 640);

		creatMainScene(documentWidth, documentHeight);

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
			animate();
		});

		Promise.all([loadGLTF(process.env.PUBLIC_URL + "/glb/dors.glb")]).then(
			([glb]) => {
				figure.current = glb.scene.children[0];
				figure.current.position.set(0, -1, 0);

				traverseModel(figure.current, figureParts.current);

				addHandWeapon();

				addTarget();

				poseToRotation.current = new PoseToRotation(
					figureParts.current
				);

				// The X axis is red. The Y axis is green. The Z axis is blue.
				// const axesHelper = new THREE.AxesHelper(1.5);

				// figureParts.current.Hips.add(axesHelper);

				// const axesHelper1 = new THREE.AxesHelper(1.5);

				// figureParts.current.RightArm.add(axesHelper1);

				scene.current.add(figure.current);

				setloadingCharacter(false);
			}
		);

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};

		// eslint-disable-next-line
	}, []);

	function addHandWeapon() {
		lefthandWeapon.current = new THREE.Box3().setFromObject(
			figureParts.current.LeftHand
		);

		// boundingSphere.scale.set(sphere.radius, sphere.radius, sphere.radius);

		// lefthandWeapon.current = new THREE.Sphere(
		// 	new THREE.Vector3(0, 0, 0),
		// 	0.3
		// );
	}

	function addTarget() {
		const sphereGeometry = new THREE.SphereGeometry(0.1, 6, 6);
		const sphereMaterial = new THREE.MeshBasicMaterial({
			color: 0xff0000,
			wireframe: true,
		});
		const boundingSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
		boundingSphere.position.set(0.4, 0.8, 0);
		scene.current.add(boundingSphere);

		target1.current = new THREE.Box3().setFromObject(boundingSphere);
	}

	useEffect(() => {
		subsceneWidthRef.current = subsceneWidth;
	}, [subsceneWidth]);

	useEffect(() => {
		subsceneHeightRef.current = subsceneHeight;
	}, [subsceneHeight]);

	useEffect(() => {
		capturePoseRef.current = capturePose;
	}, [capturePose]);

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
			capturePoseRef.current &&
			videoRef.current &&
			videoRef.current.readyState >= 2 &&
			counter.current % 3 === 0 &&
			poseDetector.current
		) {
			// todo check if previous calculation is finished
			poseDetector.current.send({ image: videoRef.current });
		}

		// console.log(lefthandWeapon.current.intersectsBox(target1.current));

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

		// multiply x,y by differnt factor
		for (let v of pose3D) {
			v["x"] *= width_ratio;
			v["y"] *= -height_ratio;
			v["z"] *= -width_ratio;
		}

		poseToRotation.current.applyPoseToBone(pose3D);

		// move the position of model
		const pose2D = cloneDeep(result.poseLandmarks);

		poseToRotation.current.applyPosition(
			pose2D,
			visibleWidth.current,
			visibleHeight.current
		);
	}

	return (
		<div className="dodgeverse">
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
						setcapturePose(!capturePose);
					}}
				>
					{capturePose ? "stop capture pose" : "capture pose"}
				</Button>
			</div>
			{(loadingCamera || loadingModel || loadingCharacter) && (
				<div className="mask">
					{loadingCamera && (
						<div>
							<span>Preparing Camera....</span>
						</div>
					)}
					{loadingModel && (
						<div>
							<span>Preparing Deep learning Model....</span>
						</div>
					)}
					{loadingCharacter && (
						<div>
							<span>Preparing Character...</span>.
						</div>
					)}
				</div>
			)}
		</div>
	);
}
