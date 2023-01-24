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
	applyTransfer,
	drawPoseKeypoints,
} from "../../components/ropes";
import SubThreeJsScene from "../../components/SubThreeJsScene";

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

	const animationIndx = useRef(0);
	const longestTrack = useRef(0);

	const poseSync = useRef(null);

	const [diffScore, setdiffScore] = useState(0);

	const poseCurve = useRef(null);
	const boneCurve = useRef(null);
	const [capturedPose, setcapturedPose] = useState();

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

			{
				const geometry = new THREE.BufferGeometry().setFromPoints([
					new THREE.Vector2(0, 0),
					new THREE.Vector2(100, 0),
				]);

				poseCurve.current = new THREE.Line(geometry, new THREE.LineBasicMaterial({
					color: 0xff0000,
				}));

				boneCurve.current = new THREE.Line(geometry, new THREE.LineBasicMaterial({
					color: 0x00ff00,
				}));

				poseCurve.current.position.set(-400, 0, 0);
				boneCurve.current.position.set(-400, 0, 0);

				scene.current.add(poseCurve.current);
				scene.current.add(boneCurve.current);
			}

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

				if (!poses || !poses[0] || !poses[0]["keypoints3D"] || !poseSync.current) {
					return;
				}
				// console.log(figureParts.current)
				const score = poseSync.current.compare(poses[0]["keypoints3D"], figureParts.current, poseCurve.current.geometry, boneCurve.current.geometry)

				setdiffScore(score);

				// console.log(poseSync.current.animation_data)

				applyTransfer(figureParts.current, poseSync.current.animation_data.tracks, animationIndx.current);

				animationIndx.current += 1;

				if (animationIndx.current >= longestTrack.current) {
					animationIndx.current = 0;
				}

				{
					const g = drawPoseKeypoints(poses[0]["keypoints3D"]);

					g.scale.set(8, 8, 8);

					setcapturedPose(g);

					console.log(g)
				}
				
			})();
		}

		counter.current += 1;

		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		requestAnimationFrame(animate);
	}

	function loadAnimation(animation_name) {
		loadObj(process.env.PUBLIC_URL + "/animjson/" + animation_name + ".json")
		.then((data) => {

			for (const v of Object.values(data.tracks)) {

				if (v.values.length > longestTrack.current) {
					longestTrack.current = v.values.length;
				}
			}

			// reset the animation
			animationIndx.current = 0;
			poseSync.current = new PoseSync(data);
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

			<div
				style={{
					width: "500px",
					height: "400px",
					position: "absolute",
					top: 0,
					right: 0,
					border: "1px solid #fff",
				}}
			>
				<SubThreeJsScene
					width={500}
					height={400}
					objects={capturedPose}
				/>
			</div>

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
				<div
					style={{fontSize: '40px'}}
				>{diffScore}</div>
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
