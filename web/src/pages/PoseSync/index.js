import { useEffect, useRef, useState } from "react";
import style from './style.css'

import { BlazePoseConfig, traverseModel, loadFBX, startCamera } from "./ropes";

import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function PoseSync() {

	const canvasRef = useRef(null);

	const videoRef = useRef(null);

	const counter = useRef(0);

	const poseDetector = useRef(null);

	const figureParts = useRef({});

	const sceneInfoList = useRef([]);
	const [animationList, setanimationList] = useState([])

	function createScene(elem) {

		const scene = new THREE.Scene();
		
		const rect = elem.getBoundingClientRect();
		const {width, height} = rect;
 
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 200);
		camera.position.set(0, 0, 240);
		camera.lookAt(0, 0, 0);

		scene.add(camera);

		const controls = new OrbitControls(camera, elem);
		// controls.noZoom = true;
		// controls.noPan = true;

		{
			const color = 0xFFFFFF;
			const intensity = 1;
			const light = new THREE.DirectionalLight(color, intensity);
			light.position.set(-1, 2, 4);
			camera.add(light);
		}

		return {scene, camera, controls};
	}

	function loadAnimationList() {
		return new Promise((resolve) => {
			resolve(['1', '2', '3']);
		});
	}

	useEffect(() => {

		loadAnimationList().then((data) => {
			setanimationList(data)
		})

		
		
		animate();
		// eslint-disable-next-line
	}, []);

	useEffect(() => {

		if (animationList && animationList.length) {
			// create
			sceneInfoList.current.push(createScene());

			sceneInfoList.current.push(createScene());

			document.querySelectorAll('.animation-scene').forEach((elem) => {

			})

		}

		// eslint-disable-next-line
	}, [animationList]);


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
			<canvas 
				ref={canvasRef}
				width="100vw"
				heigh="100vh"
			></canvas>
			<video
				ref={videoRef}
				autoPlay={true}
				width="640px"
				height="480px"
			></video>

			<div className={style["flex-container"]}>
				<div id="main_scene"></div>
				{
					animationList.map(() => {
						return (<div class="animation-scene"></div>)
					})
				}
			</div>

			<div id="pose_scene"></div>

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
