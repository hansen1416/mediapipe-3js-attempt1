import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";

import SubThreeJsScene from "../../components/SubThreeJsScene";
import PoseSync from "../../components/PoseSync";
import PoseSyncVector from "../../components/PoseSyncVector";
import {
	BlazePoseConfig,
	loadFBX,
	loadObj,
	startCamera,
	traverseModel,
	applyTransfer,
	drawPoseKeypoints,
	srotIndex,
} from "../../components/ropes";

export default function DigitalTrainer() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const videoRef = useRef(null);

	const poseDetector = useRef(null);

	const figureParts = useRef({});

	const keypoints3D = useRef(null);

	const counter = useRef(0);
	const animationIndx = useRef(0);
	const longestTrack = useRef(0);

	const poseSync = useRef(null);
	const [diffScore, setdiffScore] = useState(0);
	const poseCompareResult = useRef(null);

	const poseSyncVector = useRef(null);
	const [vectorDistances, setvectorDistances] = useState([]);
	const [distanceNames] = useState([
		"left arm",
		"left forearm",
		"right arm",
		"right forearm",
	]);
	const [distacneSortIndex, setdistacneSortIndex] = useState([]);

	const poseCurve = useRef(null);
	const boneCurve = useRef(null);
	const [capturedPose, setcapturedPose] = useState();

	const animationPointer = useRef(0);

	const [trainingList, settrainingList] = useState([]);
	const [selectedTrainingIndx, setselectedTrainingIndx] = useState(-1);
	const selectedTrainingIndxRef = useRef(-1);
	const animationJSONs = useRef({});
	const exerciseQueue = useRef([]);

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

				poseCurve.current = new THREE.Line(
					geometry.clone(),
					new THREE.LineBasicMaterial({
						color: 0xff0000,
					})
				);

				boneCurve.current = new THREE.Line(
					geometry.clone(),
					new THREE.LineBasicMaterial({
						color: 0x00ff00,
					})
				);

				poseCurve.current.position.set(-460, -200, 0);
				boneCurve.current.position.set(-460, -200, 0);

				scene.current.add(poseCurve.current);
				scene.current.add(boneCurve.current);
			}

			animate();
		});

		// we can load training list separately
		loadTrainingList();

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (vectorDistances && vectorDistances.length) {
			setdistacneSortIndex(srotIndex(vectorDistances));
		}
		// eslint-disable-next-line
	}, [vectorDistances]);

	function loadTrainingList() {
		new Promise((resolve) => {
			resolve([
				{
					name: "default training",
					exercise: [
						{ round: 10, name: "basic-crunch" },
						{ round: 4, name: "curl-up" },
						{ round: 6, name: "leg-scissors" },
						{ round: 8, name: "leg-scissors" },
						{ round: 8, name: "toe-crunch" },
					],
				},
			]);
		}).then((data) => {
			settrainingList(data);
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
		if (
			videoRef.current &&
			videoRef.current.readyState >= 2 &&
			counter.current % 6 === 0
		) {
			(async () => {
				// const timestamp = performance.now();

				const poses = await poseDetector.current.estimatePoses(
					videoRef.current
					// { flipHorizontal: false }
					// timestamp
				);

				if (
					!poses ||
					!poses[0] ||
					!poses[0]["keypoints3D"] ||
					!poseSync.current
				) {
					return;
				}

				keypoints3D.current = poses[0]["keypoints3D"];

				for (let v of keypoints3D.current) {
					v["x"] *= -1;
					v["y"] *= -1;
					v["z"] *= -1;
				}

				if (poseSync.current) {
					// compare the distance curve between animation and pose
					poseCompareResult.current =
						poseSync.current.compareCurrentPose(
							keypoints3D.current,
							figureParts.current
						);

					setdiffScore(parseInt(poseSync.current.diffScore));

					poseCurve.current.geometry.setFromPoints(
						poseSync.current.poseSpline.getPoints(50)
					);
					boneCurve.current.geometry.setFromPoints(
						poseSync.current.boneSpline.getPoints(50)
					);
					// compare the distance curve between animation and pose
				}

				if (poseSyncVector.current) {
					// compare the limbs vectors between pose and animation
					setvectorDistances(
						poseSyncVector.current.compareCurrentPose(
							keypoints3D.current,
							figureParts.current
						)
					);
				}

				// draw the pose as dots and lines on the sub scene
				const g = drawPoseKeypoints(poses[0]["keypoints3D"]);

				g.scale.set(8, 8, 8);

				setcapturedPose(g);
			})();
		} else {
			keypoints3D.current = null;
		}

		if (poseSync.current) {
			if (poseCompareResult.current) {
				if (poseCompareResult.current instanceof Number) {
					animationIndx.current = poseCompareResult.current;
				}

				applyTransfer(
					figureParts.current,
					poseSync.current.animation_data.tracks,
					animationIndx.current
				);

				animationIndx.current += 1;
			} else if (poseCompareResult.current === false) {
				// compare failed, stop animation
			}

			if (animationIndx.current >= longestTrack.current) {
				animationIndx.current = 0;
			}
		}

		counter.current += 1;

		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	useEffect(() => {
		if (selectedTrainingIndx >= 0 && trainingList[selectedTrainingIndx]) {
			selectedTrainingIndxRef.current = selectedTrainingIndx;

			const tasks = [];

			for (let t of trainingList) {
				for (const e of t.exercise) {
					tasks.push(
						loadObj(
							process.env.PUBLIC_URL +
								"/animjson/" +
								e.name +
								".json"
						)
					);
				}
			}

			exerciseQueue.current = [];

			Promise.all(tasks).then((data) => {
				const q = [];

				for (const v of data) {
					animationJSONs.current[v.name] = v;

					q.push(v.name);
				}

				exerciseQueue.current = q.reverse();

				// for (const v of Object.values(data.tracks)) {
				// 	if (
				// 		v.type === "quaternion" &&
				// 		v.quaternions.length > longestTrack.current
				// 	) {
				// 		longestTrack.current = v.quaternions.length;
				// 	}
				// }

				// // reset the animation
				// animationIndx.current = 0;
				// poseSync.current = new PoseSync(data);
				// poseSyncVector.current = new PoseSyncVector(data);
			});
		}
		// eslint-disable-next-line
	}, [selectedTrainingIndx]);

	return (
		<div>
			<video
				ref={videoRef}
				autoPlay={true}
				width="640px"
				height="480px"
				style={{ display: "none" }}
			></video>

			<canvas ref={canvasRef} />

			<div
				style={{
					width: "500px",
					height: "400px",
					position: "absolute",
					top: 0,
					left: 0,
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
				<div>
					<ul>
						{trainingList &&
							trainingList.map((item, i) => {
								return (
									<li
										key={i}
										onClick={() => {
											setselectedTrainingIndx(i);
										}}
									>
										{item.name}
									</li>
								);
							})}
					</ul>
				</div>
				<div>
					<span style={{ fontSize: "40px", margin: "0 20px 0 0" }}>
						{diffScore}
					</span>
				</div>
				<div>
					{distacneSortIndex &&
						distacneSortIndex.map((indx, i) => {
							return (
								<div key={i}>
									<span>{distanceNames[indx]}</span>
									<span>
										{vectorDistances[indx].toFixed(3)}
									</span>
								</div>
							);
						})}
				</div>
				<div>
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
		</div>
	);
}
