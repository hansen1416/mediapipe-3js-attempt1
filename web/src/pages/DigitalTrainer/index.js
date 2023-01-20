import { useEffect, useRef, useState } from "react";
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";

import PoseSync from "../../components/PoseSync";
import {
	BlazePoseConfig,
	loadFBX,
	loadObj,
	startCamera,
	traverseModel,
	// applyTransfer,
} from "../../components/ropes";

export default function DigitalTrainer() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const videoRef = useRef(null);

	const [animationList, setanimationList] = useState([])

	const poseDetector = useRef(null);

	const figureParts = useRef({});

	const counter = useRef(0);

	const poseSync = useRef(null);

	useEffect(() => {
		Promise.all([
			poseDetection.createDetector(
				poseDetection.SupportedModels.BlazePose,
				BlazePoseConfig
			),
			loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
		]).then(([detector, model]) => {
			poseDetector.current = detector;

			_scene(
				document.documentElement.clientWidth,
				document.documentElement.clientHeight
			);

			model.position.set(0, -100, 0);

			traverseModel(model, figureParts.current);

			scene.current.add(model);

			animate();

			loadAnimationList().then((data) => {
				setanimationList(data)
			})
		});

		// eslint-disable-next-line
	}, []);

	function loadAnimationList() {
		return new Promise((resolve) => {
			resolve([
				"basic-crunch",
				"bicycle-crunch",
				"curl-up",
				"leg-pushes",
				"leg-scissors",
				"lying-leg-raises",
				"oblique-crunch-left",
				"oblique-crunch-right",
				"punch-walk",
				"reverse-crunch",
				"side-crunch-left",
				"toe-crunch",
			]);
		});
	}

	function _scene(viewWidth, viewHeight) {
		const backgroundColor = 0x022244;

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

		if (counter.current % 6000000 === 0) {
			console.log(poseSync.current)
		}

		counter.current += 1;

		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		requestAnimationFrame(animate);
	}

	function loadAnimation(animation_name) {
		loadObj(process.env.PUBLIC_URL + "/animjson/" + animation_name + ".json")
		.then((data) => {
			poseSync.current = new PoseSync(data)
		})
	}

	return (
		<div>
			<video
				ref={videoRef}
				autoPlay={true}
				width="640px"
				height="480px"
			></video>

			<canvas ref={canvasRef} />

			<div className="btn-box">
				<ul>
					{animationList.map((name) => {
						return (<li
							key={name}
							onClick={() => {
								loadAnimation(name)
							}}
						>{name}</li>)
					})}
				</ul>
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
