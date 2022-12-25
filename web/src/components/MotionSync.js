import { useEffect, useRef, useState } from "react";

import {
	loadFBX,
	loadObj,
	traverseModel,
	applyTransfer,
	startCamera,
	drawPoseKeypoints,
	compareArms,
	box,
	BlazePoseKeypointsValues,
	posePointsToVector,
	getBasisFromPose,
	poseToVector,
} from "./ropes";

// import { Pose } from "kalidokit";

import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";
// import "@mediapipe/pose";

import SubThreeJsScene from "./SubThreeJsScene";
import { Group, MathUtils, Vector3 } from "three";

export default function MotionSync(props) {
	const { scene, camera, renderer, controls } = props;

	const videoRef = useRef(null);

	const poseDetector = useRef(null);

	const figureParts = useRef({});

	const counter = useRef(-1);

	const animationTracks = useRef({});
	const animationIndx = useRef(0);

	const [motionRound, setmotionRound] = useState(0);
	const motionRoundRef = useRef(motionRound);

	const [capturedPose, setcapturedPose] = useState(null);

	const [motionTrack, setmotionTrack] = useState(null);
	const [poseTrack, setposeTrack] = useState(null);
	const poseTrackRef = useRef({});

	const animname = "Clapping";

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

				{
					const g = new Group();

					const parts = [
						["mixamorigLeftArm.quaternion", 0xff0000],
						["mixamorigLeftForeArm.quaternion", 0x00ff00],
						["mixamorigRightArm.quaternion", 0x0000ff],
						["mixamorigRightForeArm.quaternion", 0xffff00],
					];

					for (const p of parts) {
						for (const v of animationTracks.current[animname][p[0]][
							"states"
						]) {
							const d = box(0.04, p[1]);
							d.position.set(v.x, v.y, v.z);

							g.add(d);
						}
					}

					g.scale.set(3, 3, 3);

					setmotionTrack(g);
				}

				{
					const g = new Group();

					const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];

					for (let i in [0, 1, 2, 3]) {
						const d = box(0.1, colors[i]);
						g.add(d);
					}

					g.scale.set(3, 3, 3);

					poseTrackRef.current = g;

					setposeTrack(g);
				}
			}
		);

		setTimeout(() => {
			animate();
		}, 0);

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		motionRoundRef.current = motionRound;
	}, [motionRound]);

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

				// draw pose tracks
				{
					const left_shoulder = poseToVector(
						keypoints3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]]
					);
					const left_elbow = poseToVector(
						keypoints3D[BlazePoseKeypointsValues["LEFT_ELBOW"]]
					);
					const left_wrist = poseToVector(
						keypoints3D[BlazePoseKeypointsValues["LEFT_WRIST"]]
					);

					const right_shoulder = poseToVector(
						keypoints3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]]
					);
					const right_elbow = poseToVector(
						keypoints3D[BlazePoseKeypointsValues["RIGHT_ELBOW"]]
					);
					const right_wrist = poseToVector(
						keypoints3D[BlazePoseKeypointsValues["RIGHT_WRIST"]]
					);

					const basisMatrix = getBasisFromPose(keypoints3D);

					left_elbow.applyMatrix4(basisMatrix);
					left_shoulder.applyMatrix4(basisMatrix);
					left_wrist.applyMatrix4(basisMatrix);

					right_elbow.applyMatrix4(basisMatrix);
					right_shoulder.applyMatrix4(basisMatrix);
					right_wrist.applyMatrix4(basisMatrix);

					const leftArmOrientation = posePointsToVector(
						left_elbow,
						left_shoulder
					);
					const leftForeArmOrientation = posePointsToVector(
						left_wrist,
						left_elbow
					);

					const rightArmOrientation = posePointsToVector(
						right_elbow,
						right_shoulder
					);
					const rightForeArmOrientation = posePointsToVector(
						right_wrist,
						right_elbow
					);

					poseTrackRef.current.children[0].position.set(
						leftArmOrientation.x,
						leftArmOrientation.y,
						leftArmOrientation.z
					);

					poseTrackRef.current.children[1].position.set(
						leftForeArmOrientation.x,
						leftForeArmOrientation.y,
						leftForeArmOrientation.z
					);

					poseTrackRef.current.children[2].position.set(
						rightArmOrientation.x,
						rightArmOrientation.y,
						rightArmOrientation.z
					);

					poseTrackRef.current.children[3].position.set(
						rightForeArmOrientation.x,
						rightForeArmOrientation.y,
						rightForeArmOrientation.z
					);
				}

				if (
					compareArms(
						keypoints3D,
						animationTracks.current[animname],
						animationIndx.current
					) >= 3
				) {
					// if (compareWaving(data, jsonObj, animationIndx.current)) {
					applyTransfer(
						figureParts.current,
						animationTracks.current[animname],
						animationIndx.current
					);

					animationIndx.current += 1;
				}

				if (
					animationIndx.current >=
					animationTracks.current[animname][
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
			<div
				style={{
					width: "500px",
					height: "400px",
					position: "absolute",
					bottom: 0,
					right: 0,
					border: "1px solid #fff",
				}}
			>
				<SubThreeJsScene
					width={500}
					height={400}
					objects={motionTrack}
					objects1={poseTrack}
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