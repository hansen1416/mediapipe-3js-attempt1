import { useEffect, useRef, useState } from "react";
import { Vector3, Matrix4, MathUtils } from "three";

import {
	getUserMedia,
	middlePosition,
	posePointsToVector,
	loadFBX,
	loadObj,
	traverseModel,
	applyTransfer,
	startCamera,
	drawPoseKeypoints,
} from "./ropes";

import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";
// import "@mediapipe/pose";

export default function MotionSync(props) {
	const { scene, camera, renderer, controls } = props;

	const videoRef = useRef(null);
	const canvasRef = useRef(null);

	const poseDetector = useRef(null);

	const figureParts = useRef({});

	const [animationTracks, setanimationTracks] = useState({});

	const counter = useRef(-1);

	// const animationIndx = useRef(0);
	// const threshold = MathUtils.degToRad(40);

	useEffect(() => {
		// const detectorConfig = {
		// 	modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
		// 	minPoseScore: 0.5,
		// 	modelUrl:
		// 		process.env.PUBLIC_URL +
		// 		"/models/tfjs-model_movenet_singlepose_thunder_4/model.json",
		// 	trackerType: poseDetection.TrackerType.Keypoint,
		// };

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
				// poseDetection.SupportedModels.MoveNet,
				poseDetection.SupportedModels.BlazePose,
				detectorConfig
			),
			loadFBX(process.env.PUBLIC_URL + "/fbx/YBot.fbx"),
			loadObj(process.env.PUBLIC_URL + "/json/AirSquatTracks.json"),
			loadObj(process.env.PUBLIC_URL + "/json/BicycleCrunchTracks.json"),
			loadObj(process.env.PUBLIC_URL + "/json/ClappingTracks.json"),
			loadObj(process.env.PUBLIC_URL + "/json/JumpingJacksTracks.json"),
			loadObj(
				process.env.PUBLIC_URL + "/json/KettlebellSwingTracks.json"
			),
			loadObj(process.env.PUBLIC_URL + "/json/WavingTracks.json"),
		]).then(
			([
				detector,
				model,
				AirSquat,
				BicycleCrunch,
				Clapping,
				JumpingJacks,
				KettlebellSwing,
				Waving,
			]) => {
				poseDetector.current = detector;

				model.position.set(0, -150, 0);

				scene.current.add(model);

				traverseModel(model, figureParts.current);

				setanimationTracks({
					AirSquat,
					BicycleCrunch,
					Clapping,
					JumpingJacks,
					KettlebellSwing,
					Waving,
				});
			}
		);

		setTimeout(() => {
			animate();
		}, 0);

		// eslint-disable-next-line
	}, []);

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
				// console.log(poses);
				drawPoseKeypoints(poses, canvasRef.current);
			})();
		}

		counter.current += 1;

		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	// function onPoseResults(results) {
	// 	draw(results);

	// 	// const jsonObj = animationTracks["Waving"];
	// 	const jsonObj = animationTracks["KettlebellSwing"];

	// 	const data = results.poseWorldLandmarks;
	// 	// const data = results.poseLandmarks;

	// 	if (data) {
	// 		for (let i in data) {
	// 			data[i].x *= -1;
	// 			data[i].y *= -1;
	// 			data[i].z *= -1;
	// 		}

	// 		if (compareJumpJacks(data, jsonObj, animationIndx.current)) {
	// 			// if (compareWaving(data, jsonObj, animationIndx.current)) {
	// 			applyTransfer(
	// 				figureParts.current,
	// 				jsonObj,
	// 				animationIndx.current
	// 			);

	// 			animationIndx.current += 1;
	// 		}

	// 		if (
	// 			animationIndx.current >=
	// 			jsonObj["mixamorigLeftArm.quaternion"]["states"].length
	// 		) {
	// 			stopCamera();

	// 			alert("motion finished");

	// 			return;
	// 		}

	// 		// console.log(leftArmDeviation, leftForeArmDeviation);
	// 	}
	// }

	// function compareJumpJacks(poseData, animationObj, animationIndex) {
	// 	const basisMatrix = getBasisFromPose(poseData);

	// 	const leftArmOrientation = posePointsToVector(
	// 		poseData[POSE_LANDMARKS["LEFT_ELBOW"]],
	// 		poseData[POSE_LANDMARKS["LEFT_SHOULDER"]]
	// 	);
	// 	// const leftForeArmOrientation = posePointsToVector(
	// 	// 	poseData[POSE_LANDMARKS["LEFT_WRIST"]],
	// 	// 	poseData[POSE_LANDMARKS["LEFT_ELBOW"]]
	// 	// );

	// 	leftArmOrientation.applyMatrix4(basisMatrix);
	// 	// leftForeArmOrientation.applyMatrix4(basisMatrix);

	// 	const rightArmStates =
	// 		animationObj["mixamorigRightArm.quaternion"]["states"][
	// 			animationIndex
	// 		];
	// 	// const rightForeArmStates =
	// 	// 	animationObj["mixamorigRightForeArm.quaternion"]["states"][
	// 	// 		animationIndex
	// 	// 	];

	// 	// console.log(rightArmStates, rightForeArmStates);

	// 	const leftArmDeviation = leftArmOrientation.angleTo(
	// 		new Vector3(rightArmStates.x, rightArmStates.y, rightArmStates.z)
	// 	);
	// 	// const leftForeArmDeviation = leftForeArmOrientation.angleTo(
	// 	// 	new Vector3(
	// 	// 		rightForeArmStates.x,
	// 	// 		rightForeArmStates.y,
	// 	// 		rightForeArmStates.z
	// 	// 	)
	// 	// );

	// 	console.log(leftArmDeviation);

	// 	// return leftArmDeviation < threshold && leftForeArmDeviation < threshold;
	// 	return leftArmDeviation < threshold;
	// }

	// function compareWaving(poseData, animationObj, animationIndex) {
	// 	const basisMatrix = getBasisFromPose(poseData);

	// 	const leftArmOrientation = posePointsToVector(
	// 		poseData[POSE_LANDMARKS["LEFT_ELBOW"]],
	// 		poseData[POSE_LANDMARKS["LEFT_SHOULDER"]]
	// 	);
	// 	const leftForeArmOrientation = posePointsToVector(
	// 		poseData[POSE_LANDMARKS["LEFT_WRIST"]],
	// 		poseData[POSE_LANDMARKS["LEFT_ELBOW"]]
	// 	);

	// 	leftArmOrientation.applyMatrix4(basisMatrix);
	// 	leftForeArmOrientation.applyMatrix4(basisMatrix);

	// 	const rightArmStates =
	// 		animationObj["mixamorigRightArm.quaternion"]["states"][
	// 			animationIndex
	// 		];
	// 	const rightForeArmStates =
	// 		animationObj["mixamorigRightForeArm.quaternion"]["states"][
	// 			animationIndex
	// 		];

	// 	// console.log(rightArmStates, rightForeArmStates);

	// 	const leftArmDeviation = leftArmOrientation.angleTo(
	// 		new Vector3(rightArmStates.x, rightArmStates.y, rightArmStates.z)
	// 	);
	// 	const leftForeArmDeviation = leftForeArmOrientation.angleTo(
	// 		new Vector3(
	// 			rightForeArmStates.x,
	// 			rightForeArmStates.y,
	// 			rightForeArmStates.z
	// 		)
	// 	);

	// 	return leftArmDeviation < threshold && leftForeArmDeviation < threshold;
	// }

	// function getBasisFromPose(poseDataFrame) {
	// 	const rightshoulder = new Vector3(
	// 		poseDataFrame[POSE_LANDMARKS["LEFT_SHOULDER"]].x,
	// 		poseDataFrame[POSE_LANDMARKS["LEFT_SHOULDER"]].y,
	// 		poseDataFrame[POSE_LANDMARKS["LEFT_SHOULDER"]].z
	// 	).normalize();
	// 	const leftshoulder = new Vector3(
	// 		poseDataFrame[POSE_LANDMARKS["RIGHT_SHOULDER"]].x,
	// 		poseDataFrame[POSE_LANDMARKS["RIGHT_SHOULDER"]].y,
	// 		poseDataFrame[POSE_LANDMARKS["RIGHT_SHOULDER"]].z
	// 	).normalize();

	// 	const righthip = new Vector3(
	// 		poseDataFrame[POSE_LANDMARKS["LEFT_HIP"]].x,
	// 		poseDataFrame[POSE_LANDMARKS["LEFT_HIP"]].y,
	// 		poseDataFrame[POSE_LANDMARKS["LEFT_HIP"]].z
	// 	).normalize();
	// 	const lefthip = new Vector3(
	// 		poseDataFrame[POSE_LANDMARKS["RIGHT_HIP"]].x,
	// 		poseDataFrame[POSE_LANDMARKS["RIGHT_HIP"]].y,
	// 		poseDataFrame[POSE_LANDMARKS["RIGHT_HIP"]].x
	// 	).normalize();

	// 	const a = middlePosition(leftshoulder, rightshoulder, false);
	// 	const b = middlePosition(lefthip, righthip, false);

	// 	const y_basis = posePointsToVector(a, b);
	// 	const x_basis = posePointsToVector(lefthip, b);
	// 	const z_basis = new Vector3()
	// 		.crossVectors(x_basis, y_basis)
	// 		.normalize();

	// 	// console.log("x_basis", x_basis, "y_basis", y_basis, "z_basis", z_basis);

	// 	return new Matrix4().makeBasis(x_basis, y_basis, z_basis).invert();
	// }

	return (
		<div>
			<canvas
				ref={canvasRef}
				style={{
					position: "absolute",
					left: "50%",
					top: 0,
					marginLeft: "-320px",
					border: "1px solid #fff",
				}}
				width="640px"
				height="320px"
			></canvas>
			<div className="btn-box">
				<video
					ref={videoRef}
					autoPlay={true}
					width="640px"
					height="320px"
				></video>

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
