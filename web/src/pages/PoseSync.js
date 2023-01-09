import { useEffect, useRef } from "react";

import { BlazePoseConfig, traverseModel, loadFBX, startCamera } from "./ropes";

import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";

import * as THREE from "three";

export default function PoseSync(props) {
	const { scene, camera, renderer, controls } = props;

	const videoRef = useRef(null);

	const counter = useRef(0);

	const poseDetector = useRef(null);

	const figureParts = useRef({});

	useEffect(() => {
		Promise.all([
			poseDetection.createDetector(
				poseDetection.SupportedModels.BlazePose,
				BlazePoseConfig
			),
			loadFBX(process.env.PUBLIC_URL + "/fbx/crunch.fbx"),
		]).then(([detector, model]) => {
			poseDetector.current = detector;

			// console.log(model);

			model.position.set(0, -100, 0);
			camera.current.position.set(0, 0, 240);

			traverseModel(model, figureParts.current);

			console.log(figureParts.current);

			scene.current.add(model);
		});

		setTimeout(() => {
			animate();
		}, 0);

		// eslint-disable-next-line
	}, []);

	function animate() {
		requestAnimationFrame(animate);

		if (videoRef.current.readyState >= 2 && counter.current % 6 === 0) {
			(async () => {
				// const timestamp = performance.now();

				const poses = await poseDetector.current.estimatePoses(
					videoRef.current
					// { flipHorizontal: false }
					// timestamp
				);

				console.log(poses);
			})();
		}

		counter.current += 1;
		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	return (
		<div>
			<video
				ref={videoRef}
				autoPlay={true}
				width="640px"
				height="480px"
			></video>

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
