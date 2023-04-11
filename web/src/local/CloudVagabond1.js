import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Button from "react-bootstrap/Button";
// import * as poseDetection from "@tensorflow-models/pose-detection";
import { cloneDeep } from "lodash";
import { Pose } from "@mediapipe/pose";

import SubThreeJsScene from "../components/SubThreeJsScene";
// import Silhouette3D from "../components/Silhouette3D";
// import T from "../components/T";
import {
	// BlazePoseKeypoints,
	// BlazePoseConfig,
	drawPoseKeypoints1,
	drawPoseKeypointsMediaPipe,
	loadJSON,
	loadGLTF,
	// loadFBX,
	invokeCamera,
	traverseModel,
	jsonToBufferGeometry,
} from "../components/ropes";

import PoseToRotation from "../components/PoseToRotation";

export default function CloudVagabond1() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const animationPointer = useRef(0);

	const figure = useRef([]);
	const figureParts = useRef({});

	// ========= captured pose logic
	const [capturedPose, setcapturedPose] = useState();
	const counter = useRef(0);
	// ========= captured pose logic

	const poseDetector = useRef(null);

	const videoRef = useRef(null);
	// NOTE: we must give a width/height ratio not close to 1, otherwise there will be wired behaviors
	const [subsceneWidth, setsubsceneWidth] = useState(334);
	const [subsceneHeight, setsubsceneHeight] = useState(250);
	const subsceneWidthRef = useRef(0);
	const subsceneHeightRef = useRef(0);
	// the width and height in the 3.js world
	const visibleWidth = useRef(0);
	const visibleHeight = useRef(0);

	const [loadingCamera, setloadingCamera] = useState(false);
	const [loadingModel, setloadingModel] = useState(true);
	const [loadingSilhouette, setloadingSilhouette] = useState(true);

	const poseDataArr = useRef(null);
	const poseIndx = useRef(0);

	const poseToRotation = useRef(null);

	useEffect(() => {
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		setsubsceneWidth(documentWidth * 0.25);
		setsubsceneHeight((documentWidth * 0.25 * 480) / 640);

		subsceneWidthRef.current = documentWidth * 0.25;
		subsceneHeightRef.current = (documentWidth * 0.25 * 480) / 640;

		creatMainScene(documentWidth, documentHeight);

		// invokeCamera(videoRef.current, () => {
		// 	setloadingCamera(false);
		// });

		poseDetector.current = new Pose({
			locateFile: (file) => {
				return process.env.PUBLIC_URL + `/mediapipe/${file}`;
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

		// Promise.all([
		// 	poseDetection.createDetector(
		// 		poseDetection.SupportedModels.BlazePose,
		// 		BlazePoseConfig
		// 	),
		// ]).then(([detector]) => {
		// 	poseDetector.current = detector;
		// });

		// Promise.all(
		// 	Silhouette3D.limbs.map((name) =>
		// 		loadJSON(process.env.PUBLIC_URL + "/t/" + name + ".json")
		// 	)
		// ).then((results) => {
		// 	const geos = {};

		// 	for (let data of results) {
		// 		geos[data.name] = jsonToBufferGeometry(data);
		// 	}

		// 	figure.current = new Silhouette3D(geos);
		// 	const body = figure.current.init();

		// 	// getMeshSize(figure.current.foot_l.mesh, scene.current)

		// 	scene.current.add(body);

		// 	setloadingSilhouette(false);
		// });

		Promise.all([
			loadGLTF(process.env.PUBLIC_URL + "/glb/dors-weighted.glb"),
		]).then(([glb]) => {
			figure.current = glb.scene.children[0];
			figure.current.position.set(0, -1, 0);

			traverseModel(figure.current, figureParts.current);

			poseToRotation.current = new PoseToRotation(figureParts.current);

			// The X axis is red. The Y axis is green. The Z axis is blue.
			// const axesHelper = new THREE.AxesHelper(1.5);

			// figureParts.current.Hips.add(axesHelper);

			const axesHelper1 = new THREE.AxesHelper(1.5);

			figureParts.current.LeftShoulder.add(axesHelper1);

			scene.current.add(figure.current);

			setloadingSilhouette(false);
		});

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};

		// eslint-disable-next-line
	}, []);

	function animate() {
		// ========= captured pose logic
		if (
			videoRef.current &&
			videoRef.current.readyState >= 2 &&
			counter.current % 3 === 0 &&
			poseDetector.current
		) {
			poseDetector.current.send({ image: videoRef.current });
		}

		if (poseDataArr.current && counter.current % 3 === 0) {
			const pose3D = poseDataArr.current[poseIndx.current];

			const g = drawPoseKeypoints1(pose3D);

			g.scale.set(8, 8, 8);

			setcapturedPose(g);

			// figure.current.applyPose(pose3D);
			// applyPoseToBone(pose3D, figureParts.current);
			// testPoseToBone(figureParts.current, pose3D);
			poseToRotation.current.applyPoseToBone(pose3D)

			poseIndx.current += 1;

			if (poseIndx.current >= poseDataArr.current.length) {
				poseIndx.current = 0;
			}
		}

		counter.current += 1;
		// ========= captured pose logic

		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function creatMainScene(viewWidth, viewHeight) {
		/**
		 * main scene, which plays exercise animation
		 * @param {number} viewWidth
		 * @param {number} viewHeight
		 */
		scene.current = new THREE.Scene();
		// scene.current.background = new THREE.Color(0x022244);

		camera.current = new THREE.PerspectiveCamera(
			90,
			viewWidth / viewHeight,
			0.1,
			1000
		);

		camera.current.position.set(0, 0, 2);

		{
			// mimic the sun light
			const dlight = new THREE.PointLight(0xffffff, 0.4);
			dlight.position.set(0, 10, 10);
			scene.current.add(dlight);
			// env light
			scene.current.add(new THREE.AmbientLight(0xffffff, 0.6));
		}

		// drawScene();

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
			alpha: true,
			antialias: true,
		});

		renderer.current.toneMappingExposure = 0.5;

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		renderer.current.setSize(viewWidth, viewHeight);
	}

	function onPoseCallback(result) {
		if (!result || !result.poseLandmarks || !result.poseWorldLandmarks) {
			return;
		}

		{
			const pose3D = cloneDeep(result.poseWorldLandmarks);

			const width_ratio = 30;
			const height_ratio = (width_ratio * 480) / 640;

			// multiply x,y by differnt factor
			for (let v of pose3D) {
				v["x"] *= -width_ratio;
				v["y"] *= -height_ratio;
				v["z"] *= -width_ratio;
			}

			const g = drawPoseKeypointsMediaPipe(pose3D);

			g.scale.set(8, 8, 8);

			setcapturedPose(g);

			figure.current.applyPose(pose3D);

			// const pose2D = cloneDeep(poses[0]["keypoints"]);

			// figure.current.applyPosition(
			// 	pose2D,
			// 	subsceneWidthRef.current,
			// 	subsceneHeightRef.current,
			// 	visibleWidth.current,
			// 	visibleHeight.current
			// );
		}
	}

	function playpose() {
		loadJSON(
			// process.env.PUBLIC_URL + "/posejson/wlm1500-1600.npy.json"
			process.env.PUBLIC_URL + "/posejson/wlm2300-2400.npy.json"
		).then((data) => {
			const width_ratio = 30;
			const height_ratio = (width_ratio * 480) / 640;

			// multiply x,y by differnt factor
			for (const p of data) {
				for (const v of p) {
					v["x"] *= -width_ratio;
					v["y"] *= -height_ratio;
					v["z"] *= -width_ratio;
				}
			}

			poseDataArr.current = data;
		});
	}

	return (
		<div className="digital-trainer">
			<video
				ref={videoRef}
				autoPlay={true}
				width={subsceneWidth + "px"}
				height={subsceneHeight + "px"}
				style={{
					display: "none",
				}}
			></video>

			<canvas ref={canvasRef} />
			{/* // ========= captured pose logic */}
			<div
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
			</div>
			<div
				style={{
					position: "absolute",
					right: 20,
					bottom: 20,
				}}
			>
				<Button
					onClick={() => {
						playpose();
					}}
				>
					play pose
				</Button>
				<Button
					onClick={() => {
						poseDataArr.current = null;
					}}
				>
					stop play pose
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
