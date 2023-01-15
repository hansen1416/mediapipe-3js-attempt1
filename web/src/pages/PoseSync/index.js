import { useEffect, useRef, useState } from "react";
import "./style.css";

import { box, loadFBX, loadObj, startCamera } from "../../components/ropes";

import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// import Sider from "./Sider";

export default function PoseSync() {
	const canvasRef = useRef(null);

	const videoRef = useRef(null);

	const counter = useRef(0);

	const poseDetector = useRef(null);

	const figureParts = useRef({});

	const renderer = useRef(null);

	useEffect(() => {
		Promise.all([
			loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
		]).then(([model]) => {
			// create main scene
		});

		// eslint-disable-next-line
	}, []);

	// useEffect(() => {
	// 	Promise.all([
	// 		poseDetection.createDetector(
	// 			poseDetection.SupportedModels.BlazePose,
	// 			BlazePoseConfig
	// 		),
	// 		loadFBX(process.env.PUBLIC_URL + "/fbx/crunch.fbx"),
	// 	]).then(([detector, model]) => {
	// 		poseDetector.current = detector;

	// 		// console.log(model);

	// 		model.position.set(0, -100, 0);
	// 		camera.current.position.set(0, 0, 240);

	// 		traverseModel(model, figureParts.current);

	// 		scene.current.add(model);
	// 	});

	// 	setTimeout(() => {
	// 		animate();
	// 	}, 0);

	// 	// eslint-disable-next-line
	// }, []);

	function animate() {
		requestAnimationFrame(animate);

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
	}

	return (
		<div>
			<canvas ref={canvasRef}></canvas>
			<video
				ref={videoRef}
				autoPlay={true}
				width="640px"
				height="480px"
			></video>
			<div className="flex-container">
				<div id="main_scene"></div>
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
