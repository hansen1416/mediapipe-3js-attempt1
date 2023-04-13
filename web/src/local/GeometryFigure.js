import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Button from "react-bootstrap/Button";
// import * as poseDetection from "@tensorflow-models/pose-detection";
import { Pose } from "@mediapipe/pose";
import { cloneDeep } from "lodash";

import SubThreeJsScene from "../components/SubThreeJsScene";
import Silhouette3D from "../components/Silhouette3D";
// import T from "../components/T";
import {
	BlazePoseKeypoints,
	// BlazePoseConfig,
	drawPoseKeypoints,
	loadJSON,
	// loadFBX,
	startCamera,
	// getMeshSize,
	jsonToBufferGeometry,
} from "../components/ropes";

export default function GeometryFigure() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const animationPointer = useRef(0);

	const figure = useRef([]);
	// const fbxmodel = useRef(null);

	// ========= captured pose logic
	const [capturedPose, setcapturedPose] = useState();
	const counter = useRef(0);
	// ========= captured pose logic

	// ========= pose json data
	const capturedPoseRef = useRef(0);
	const storedPose = useRef([]);
	const [playPose, setPlayPose] = useState(false);
	const playPoseRef = useRef(false);
	// ========= pose json data

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

	const [startBtnShow, setstartBtnShow] = useState(true);
	const [stopBtnShow, setstopBtnShow] = useState(false);

	// const meshes = useRef({});

	useEffect(() => {
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		setsubsceneWidth(documentWidth * 0.25);
		setsubsceneHeight((documentWidth * 0.25 * 480) / 640);

		subsceneWidthRef.current = documentWidth * 0.25;
		subsceneHeightRef.current = (documentWidth * 0.25 * 480) / 640;

		_scene(documentWidth, documentHeight);

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
			animate();
		});

		Promise.all([
			// poseDetection.createDetector(
			// 	poseDetection.SupportedModels.BlazePose,
			// 	BlazePoseConfig
			// ),
			import("./wlm1500-1600.npy"),
			// loadJSON(
			// 	process.env.PUBLIC_URL + "/posejson/wlm1500-1600.npy.json"
			// ),
			// loadFBX(process.env.PUBLIC_URL + "/fbx/T_0.fbx"),
		]).then(([pose3d]) => {
			// poseDetector.current = detector;

			storedPose.current = pose3d.default;

			// scene.current.add(model);

			// traverseModel(model, meshes.current);
		});

		Promise.all(
			Silhouette3D.limbs.map((name) =>
				loadJSON(process.env.PUBLIC_URL + "/t/" + name + ".json")
			)
		).then((results) => {
			const geos = {};

			for (let data of results) {
				geos[data.name] = jsonToBufferGeometry(data);
			}

			figure.current = new Silhouette3D(geos);
			const body = figure.current.init();

			// getMeshSize(figure.current.foot_l.mesh, scene.current)

			scene.current.add(body);
		});

		// animate();

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		playPoseRef.current = playPose;
	}, [playPose]);

	function animate() {
		// ========= captured pose logic
		if (
			videoRef.current &&
			videoRef.current.readyState >= 2 &&
			!playPoseRef.current &&
			counter.current % 6 === 0
		) {
			// (async () => {
			// 	const poses = await poseDetector.current.estimatePoses(
			// 		videoRef.current
			// 	);
			// })();

			poseDetector.current.send({ image: videoRef.current });
		}

		if (
			counter.current % 3 === 0 &&
			storedPose.current &&
			storedPose.current.length &&
			playPoseRef.current
		) {
			const drawdata = [];

			for (let i in storedPose.current[capturedPoseRef.current]) {
				drawdata[i] = Object.assign(
					{ name: BlazePoseKeypoints[i].toLowerCase() },
					storedPose.current[capturedPoseRef.current][i]
				);
			}

			const width_ratio = 30;
			const height_ratio = (width_ratio * 480) / 640;

			// multiply x,y by differnt factor
			for (let v of drawdata) {
				v["x"] *= width_ratio;
				v["y"] *= -height_ratio;
				v["z"] *= -width_ratio;
			}

			const g = drawPoseKeypoints(drawdata);

			g.scale.set(8, 8, 8);

			setcapturedPose(g);

			figure.current.applyPose(drawdata, true);

			capturedPoseRef.current += 1;

			if (capturedPoseRef.current >= storedPose.current.length) {
				capturedPoseRef.current = 0;
			}
		}

		counter.current += 1;
		// ========= captured pose logic

		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function onPoseCallback(result) {
		if (!result || !result.poseLandmarks || !result.poseWorldLandmarks) {
			return;
		}
		const pose3D = cloneDeep(result.poseWorldLandmarks);

		if (!pose3D) {
			return;
		}

		const width_ratio = 30;
		const height_ratio = (width_ratio * 480) / 640;

		// multiply x,y by differnt factor
		for (let v of pose3D) {
			v["x"] *= -width_ratio;
			v["y"] *= -height_ratio;
			v["z"] *= -width_ratio;
		}

		const g = drawPoseKeypoints(pose3D);

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

	function _scene(viewWidth, viewHeight) {
		const backgroundColor = 0x022244;

		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(backgroundColor);

		camera.current = new THREE.PerspectiveCamera(
			90,
			viewWidth / viewHeight,
			0.1,
			1000
		);

		camera.current.position.set(0, 0, 150);

		/**
		 * visible_height = 2 * tan(camera_fov / 2) * camera_z
		 * visible_width = visible_height * camera_aspect
		 */

		const vFOV = THREE.MathUtils.degToRad(camera.current.fov); // convert vertical fov to radians

		visibleHeight.current =
			2 * Math.tan(vFOV / 2) * camera.current.position.z; // visible height

		visibleWidth.current = visibleHeight.current * camera.current.aspect; // visible width

		{
			const light = new THREE.PointLight(0xffffff, 1);
			// light.position.set(10, 10, 10);
			camera.current.add(light);

			scene.current.add(camera.current);
		}

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
		});

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		renderer.current.setSize(viewWidth, viewHeight);
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
			{/* // ========= captured pose logic */}
			<div className="controls">
				<div style={{ marginBottom: "40px" }}>
					{startBtnShow && (
						<Button
							variant="primary"
							onClick={() => {
								if (videoRef.current) {
									startCamera(videoRef.current);

									// count down loop hook. default 5 seconds

									setstartBtnShow(false);
									setstopBtnShow(true);
								}
							}}
						>
							Start
						</Button>
					)}
					{stopBtnShow && (
						<Button
							variant="secondary"
							onClick={() => {
								if (videoRef.current) {
									videoRef.current.srcObject = null;

									setstopBtnShow(false);
								}
							}}
						>
							Stop
						</Button>
					)}

					<Button
						variant="primary"
						onClick={() => {
							setPlayPose(!playPose);
						}}
						style={{
							marginLeft: 20,
						}}
					>
						PlayPose
					</Button>
				</div>
			</div>
		</div>
	);
}
