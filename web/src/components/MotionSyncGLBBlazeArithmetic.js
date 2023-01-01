import { useEffect, useRef, useState } from "react";

import {
	loadGLTF,
	loadObj,
	traverseModel,
	applyTransfer,
	startCamera,
	drawPoseKeypoints,
	compareArms,
	distanceBetweenPoints,
	box,
	BlazePoseKeypointsValues,
	posePointsToVector,
	getBasisFromPose,
	poseToVector,
	removeObject3D,
} from "./ropes";

// import { Pose } from "kalidokit";

import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";
// import "@mediapipe/pose";

import SubThreeJsScene from "./SubThreeJsScene";
import { Group, Vector2, Vector3 } from "three";
import * as THREE from "three";

export default function MotionSyncGLBBlazeArithmetic(props) {
	const { scene, camera, renderer, controls } = props;

	const videoRef = useRef(null);

	const poseDetector = useRef(null);

	const figureParts = useRef({});

	const counter = useRef(-1);

	const animationTracks = useRef({});
	const animationIndx = useRef(0);

	const [motionRound, setmotionRound] = useState(0);
	const motionRoundRef = useRef(motionRound);

	const [capturedPose, setcapturedPose] = useState();

	const check = useRef(5);

	const animname = "PunchWalk";

	const poseCurve = useRef(null);

	const modelCurve = useRef(null);

	const [diffScore, setdiffScore] = useState(0);

	// const [leftWidth, setleftWidth] = useState(window.innerWidth - 500);
	// const [rightWidth, setrightWidth] = useState(500);
	// const [leftHeight, setleftHeight] = useState(window.innerHeight);
	// const [rightHeight, setrightHeight] = useState(window.innerHeight / 2);

	useEffect(() => {
		const detectorConfig = {
			// runtime: "mediapipe", // or 'tfjs'
			runtime: "tfjs",
			enableSmoothing: true,
			modelType: "full",
			detectorModelUrl:
				process.env.PUBLIC_URL +
				"/models/tfjs-model_blazepose_3d_detector_1/model.json",
			landmarkModelUrl:
				process.env.PUBLIC_URL +
				"/models/tfjs-model_blazepose_3d_landmark_full_2/model.json",
			// solutionPath: process.env.PUBLIC_URL + `/models/mediapipe/pose`,
		};

		Promise.all([
			poseDetection.createDetector(
				poseDetection.SupportedModels.BlazePose,
				detectorConfig
			),
			loadGLTF(process.env.PUBLIC_URL + "/glb/punch-walk.glb"),
			loadObj(process.env.PUBLIC_URL + "/json/PunchWalkTracks.json"),
		]).then(([detector, gltf, PunchWalk]) => {
			poseDetector.current = detector;

			const model = gltf.scene.children[0];

			model.position.set(0, -1, 0);
			camera.current.position.set(0, 0, 4);

			// console.log(model);

			scene.current.add(model);

			traverseModel(model, figureParts.current);

			// figureParts.current["LeftArm"].scale.set(1, 1.1, 1);

			// console.log(figureParts.current);

			animationTracks.current = {
				PunchWalk,
			};

			{
				const geometry = new THREE.BufferGeometry().setFromPoints([
					new Vector2(-2, 0),
					new Vector2(-3, 0),
				]);

				const material = new THREE.LineBasicMaterial({
					color: 0xff0000,
				});

				// Create the final object to add to the scene
				poseCurve.current = new THREE.Line(geometry, material);

				scene.current.add(poseCurve.current);
			}

			{
				const geometry = new THREE.BufferGeometry().setFromPoints([
					new Vector2(-2, 0),
					new Vector2(-3, 0),
				]);

				const material = new THREE.LineBasicMaterial({
					color: 0x00ff00,
				});

				// Create the final object to add to the scene
				modelCurve.current = new THREE.Line(geometry, material);

				scene.current.add(modelCurve.current);
			}
		});

		setTimeout(() => {
			animate();

			// if (camera.current && renderer.current) {
			// 	camera.current.aspect = leftWidth / leftHeight;
			// 	camera.current.updateProjectionMatrix();

			// 	renderer.current.setSize(leftWidth, leftHeight);
			// }
		}, 0);

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		motionRoundRef.current = motionRound;
	}, [motionRound]);

	function distancegraph(keypoints3D, geometry) {
		const upper = [
			"LEFT_SHOULDER",
			"RIGHT_SHOULDER",
			"LEFT_ELBOW",
			"RIGHT_ELBOW",
			"LEFT_WRIST",
			"RIGHT_WRIST",
			"LEFT_HIP",
			"RIGHT_HIP",
		];

		const lower = [
			"LEFT_HIP",
			"RIGHT_HIP",
			"LEFT_KNEE",
			"RIGHT_KNEE",
			"LEFT_ANKLE",
			"RIGHT_ANKLE",
		];

		const distances = [];
		let c = -40;

		for (let i = 0; i < upper.length - 1; i++) {
			for (let j = i + 1; j < upper.length; j++) {
				distances.push(
					new Vector2(
						c / 10,
						distanceBetweenPoints(
							keypoints3D[BlazePoseKeypointsValues[upper[i]]],
							keypoints3D[BlazePoseKeypointsValues[upper[j]]]
						)
					)
				);

				c++;
			}
		}

		// const unit = distances[0].y;

		// for (let d of distances) {
		// 	d.y /= unit;

		// 	// d.y *= 3;
		// }

		// Create a sine-like wave
		const curve = new THREE.SplineCurve(distances);

		const points = curve.getPoints(50);

		geometry.setFromPoints(points);

		return distances;
	}

	function modelDistanceCurve(parts, geometry) {
		const upper = [
			"LeftArm",
			"RightArm",
			"LeftForeArm",
			"RightForeArm",
			"LeftHand",
			"RightHand",
			"LeftUpLeg",
			"RightUpLeg",
		];

		const distances = [];
		let c = -40;

		for (let i = 0; i < upper.length - 1; i++) {
			for (let j = i + 1; j < upper.length; j++) {
				const v1 = new Vector3();
				const v2 = new Vector3();

				parts[upper[i]].getWorldPosition(v1);
				parts[upper[j]].getWorldPosition(v2);

				distances.push(
					new Vector2(c / 10, distanceBetweenPoints(v1, v2))
				);

				c++;
			}
		}

		// const unit = distances[0].y;

		// for (let d of distances) {
		// 	d.y /= unit;

		// 	// d.y *= 3;
		// }

		// Create a sine-like wave
		const curve = new THREE.SplineCurve(distances);

		const points = curve.getPoints(50);

		geometry.setFromPoints(points);

		return distances;
	}

	function animate() {
		requestAnimationFrame(animate);

		/**
		 * HTMLMediaElement.readyState, 2,3,4
		 */
		if (videoRef.current.readyState >= 2 && counter.current % 6 === 0) {
			(async () => {
				// const timestamp = performance.now();

				const poses = await poseDetector.current.estimatePoses(
					videoRef.current
					// { flipHorizontal: false }
					// timestamp
				);

				if (!poses || !poses[0] || !poses[0]["keypoints3D"]) {
					return;
				}

				const keypoints3D = poses[0]["keypoints3D"];

				for (let v of keypoints3D) {
					v["x"] *= -1;
					v["y"] *= -1;
					v["z"] *= -1;
				}

				// // transfer basis, so that the pose is always stabd up and face to camera
				// const basisMatrix = getBasisFromPose(keypoints3D);

				// for (let k of keypoints3D) {
				// 	const t = new Vector3(k.x, k.y, k.z);

				// 	t.applyMatrix4(basisMatrix);

				// 	k.x = t.x;
				// 	k.y = t.y;
				// 	k.z = t.z;
				// }

				// draw pose keypoints
				{
					const g = drawPoseKeypoints(keypoints3D);

					g.scale.set(8, 8, 8);

					setcapturedPose(g);
				}

				{
					if (poseCurve.current && figureParts.current) {
						const d1 = distancegraph(
							keypoints3D,
							poseCurve.current.geometry
						);

						const d2 = modelDistanceCurve(
							figureParts.current,
							modelCurve.current.geometry
						);

						// console.log(d1, d2);

						const ratio = d1[0].y / d2[0].y;

						for (const d of d2) {
							d.y *= ratio;
						}

						const unit1 = d1[0].y;

						for (const d of d1) {
							d.y /= unit1;
						}

						const unit2 = d2[0].y;

						for (const d of d2) {
							d.y /= unit2;
						}

						let diff = 0;

						// console.log(d1, d2);

						for (let i in d1) {
							diff += Math.abs(d1[i].y - d2[i].y) ** 2;
						}

						diff = parseInt(100 * diff);

						setdiffScore(diff);
					}
				}

				let fitted = false;

				for (let i in animationTracks.current[animname][
					"LeftArm.quaternion"
				]["states"]) {
					if (
						compareArms(
							keypoints3D,
							animationTracks.current[animname],
							i
						) >= 4
					) {
						fitted = true;
						break;
					}
				}

				if (fitted) {
					check.current = 0;
				} else {
					check.current += 1;
				}
			})();
		}

		if (videoRef.current.readyState >= 2 && counter.current % 2 === 0) {
			applyTransfer(
				figureParts.current,
				animationTracks.current[animname],
				animationIndx.current
			);

			animationIndx.current += 1;

			if (
				animationIndx.current >=
				animationTracks.current[animname]["LeftArm.quaternion"][
					"states"
				].length
			) {
				setmotionRound(motionRoundRef.current + 1);

				animationIndx.current = 0;
			}
		}

		counter.current += 1;

		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	return (
		<div>
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
			<video
				ref={videoRef}
				autoPlay={true}
				width="640px"
				height="480px"
			></video>
			<div className="btn-box">
				<div style={{ fontSize: 40 }}>{diffScore}</div>

				<div>{motionRound}</div>

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
