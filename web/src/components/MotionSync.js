import { useEffect, useRef, useState } from "react";

import {
	loadFBX,
	loadObj,
	traverseModel,
	applyTransfer,
	startCamera,
	drawPoseKeypoints,
	compareWaving,
} from "./ropes";

// import { Pose } from "kalidokit";

import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";
// import "@mediapipe/pose";

import SubThreeJsScene from "./SubThreeJsScene";

export default function MotionSync(props) {
	const { scene, camera, renderer, controls } = props;

	const videoRef = useRef(null);

	const poseDetector = useRef(null);

	const figureParts = useRef({});

	const animationTracks = useRef({});

	const counter = useRef(-1);

	const animationIndx = useRef(0);

	const [motionRound, setmotionRound] = useState(0);
	const motionRoundRef = useRef(motionRound);

	const [capturedPose, setcapturedPose] = useState(null);

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

				model.position.set(-100, -100, 0);
				camera.current.position.set(0, 0, 240);

				scene.current.add(model);

				traverseModel(model, figureParts.current);

				// console.log(figureParts.current);

				animationTracks.current = {
					AirSquat,
					BicycleCrunch,
					Clapping,
					JumpingJacks,
					KettlebellSwing,
					Waving,
				};
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

				if (!poses || !poses[0] || !poses[0]["keypoints3D"]) {
					return;
				}

				// console.log(poses);

				const g = drawPoseKeypoints(poses[0]["keypoints3D"]);

				setcapturedPose(g);

				return;

				if (
					compareWaving(
						poses[0]["keypoints3D"],
						animationTracks.current["Waving"],
						animationIndx.current
					)
				) {
					// if (compareWaving(data, jsonObj, animationIndx.current)) {
					applyTransfer(
						figureParts.current,
						animationTracks.current["Waving"],
						animationIndx.current
					);

					animationIndx.current += 1;
				}

				if (
					animationIndx.current >=
					animationTracks.current["Waving"][
						"mixamorigLeftArm.quaternion"
					]["states"].length
				) {
					setmotionRound(motionRoundRef.current + 1);

					animationIndx.current = 0;
				}
			})();
		}

		counter.current += 1;

		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	useEffect(() => {
		motionRoundRef.current = motionRound;
	}, [motionRound]);

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
			<div className="btn-box">
				<video
					ref={videoRef}
					autoPlay={true}
					width="640px"
					height="320px"
				></video>

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
