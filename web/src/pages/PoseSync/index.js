import { useEffect, useRef, useState } from "react";
import './style.css'

import { box, startCamera } from "../../components/ropes";

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

	const sceneInfoList = useRef({});
	const [animationList, setanimationList] = useState([]);

	const renderer = useRef(null);

	function createScene(elem) {

		const scene = new THREE.Scene();
		
		const rect = elem.getBoundingClientRect();
		const {width, height} = rect;
 
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.set(0, 0, 240);
		// camera.lookAt(0, 0, 0);

		const controls = new OrbitControls(camera, elem);
		controls.noPan = true;

		scene.add(camera);

		{
			const color = 0xFFFFFF;
			const intensity = 1;
			const light = new THREE.DirectionalLight(color, intensity);
			light.position.set(-1, 2, 4);
			camera.add(light);
		}

		return {scene, camera, controls, elem};
	}

	function loadAnimationList() {
		return new Promise((resolve) => {
			resolve(['1', '2', '3', '4', '5', '6']);
		});
	}

	useEffect(() => {

		loadAnimationList().then((data) => {
			setanimationList(data)
		})

		
		
		
		// eslint-disable-next-line
	}, []);

	useEffect(() => {

		if (animationList && animationList.length) {
			// create main scene
			sceneInfoList.current['main'] = createScene(document.getElementById('main_scene'));

			document.querySelectorAll('[data-animation]').forEach((elem) => {
				sceneInfoList.current[elem.dataset['animation']] = createScene(elem);
			})
		}

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current, alpha: true
		});

		renderer.current.setSize(document.documentElement.clientWidth, document.documentElement.clientHeight);

		renderer.current.setScissorTest(false);
		renderer.current.clear(true, true);
		renderer.current.setScissorTest(true);

		animate();

		for ( let key in sceneInfoList.current) {

			const {scene} = sceneInfoList.current[key];

			const b = box(50);

			b.position.set(0,0,0);

			scene.add(b);
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



		for ( let key in sceneInfoList.current) {

			const {scene, camera, controls, elem} = sceneInfoList.current[key];

			// get the viewport relative position of this element
			const {left, right, top, bottom, width, height} = elem.getBoundingClientRect();

			if (bottom < 0 || top > document.documentElement.clientWidth || right < 0 || left > document.documentElement.clientHeight) {
				continue
			}

			// camera.aspect = width / height;
			// camera.updateProjectionMatrix();
			// // controls.handleResize();
			// controls.update()

			renderer.current.setScissor(left, top, width, height);
			renderer.current.setViewport(left, top, width, height);
			
			renderer.current.render(scene, camera);
		}
	}

	return (
		<div>
			<canvas
				ref={canvasRef}
			></canvas>
			<video
				ref={videoRef}
				autoPlay={true}
				width="640px"
				height="480px"
			></video>
			<div className="flex-container">
				<div id="main_scene"></div>
				<div className="sider">
					{
						animationList.map((name) => {
							return (<div key={name} data-animation={name} className="animation-scene"></div>)
						})
					}
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
