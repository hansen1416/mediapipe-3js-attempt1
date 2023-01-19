import { useEffect, useRef, useState } from "react";
import "./style.css";

import {
	// BlazePoseConfig,
	loadFBX,
	startCamera,
	traverseModel,
} from "../../components/ropes";

// import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Sider from "./Sider";

export default function PoseSync() {
	const mainSceneRef = useRef(null);
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const videoRef = useRef(null);

	const figureParts = useRef({});

	const [selectedExcercise, setselectedExcercise] = useState(null)
	const animationIndx = useRef(0);
	const longestTrack = useRef(0);
	
	
	// const poseDetector = useRef(null);



	useEffect(() => {
		const { width, height } = mainSceneRef.current.getBoundingClientRect();

		_scene(width, height);

		// Promise.all([
		// 	poseDetection.createDetector(
		// 		poseDetection.SupportedModels.BlazePose,
		// 		BlazePoseConfig
		// 	),
		// 	loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
		// ]).then(([detector, model]) => {
		// 	poseDetector.current = detector;
		Promise.all([
			loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
		]).then(([model]) => {
			// create main scene
			model.position.set(0, -100, 0);

			traverseModel(model, figureParts.current);

			console.log(figureParts)

			scene.current.add(model);

			animate();
		});

		return () => {
			controls.current.dispose();
			renderer.current.dispose();
		};
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (selectedExcercise && selectedExcercise.tracks) {
			for (let v of selectedExcercise.tracks) {
				if (v.values.length > longestTrack.current) {
					longestTrack.current = v.values.length
				}
			}
		}
	}, [selectedExcercise]);

	function _scene(viewWidth, viewHeight) {
		const backgroundColor = 0x22244;

		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(backgroundColor);

		camera.current = new THREE.PerspectiveCamera(
			75,
			viewWidth / viewHeight,
			0.1,
			1000
		);

		camera.current.position.set(0, 0, 300);

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

	function animate() {
		// if (videoRef.current.readyState >= 2 && counter.current % 6 === 0) {
		// 	(async () => {
		// 		// const timestamp = performance.now();

		// 		const poses = await poseDetector.current.estimatePoses(
		// 			videoRef.current
		// 			// { flipHorizontal: false }
		// 			// timestamp
		// 		);

		// 		console.log(poses);
		// 	})();
		// }

		if (selectedExcercise && selectedExcercise.tracks) {
			animationIndx.current += 1;

			if (animationIndx.current >= longestTrack.current) {
				animationIndx.current = 0;
			}
		}

		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		requestAnimationFrame(animate);
	}

	return (
		<div>
			<video
				ref={videoRef}
				autoPlay={true}
				width="640px"
				height="480px"
			></video>
			<div className="flex-container">
				<Sider
					selectedExcercise={selectedExcercise}
					setselectedExcercise={setselectedExcercise}
				/>
				<div id="main_scene" ref={mainSceneRef}>
					<canvas ref={canvasRef} />
				</div>
			</div>

			<div className="btn-box">
				<button
					onClick={() => {
						if (videoRef.current) {
							startCamera(videoRef.current);
						}
					}}
				>
					camera start
				</button>
				<button
					onClick={() => {
						if (videoRef.current) {
							videoRef.current.srcObject = null;
						}
					}}
				>
					camera stop
				</button>
			</div>
		</div>
	);
}
