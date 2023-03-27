import { useEffect, useRef, useState } from "react";

import {
	loadGLTF,
	loadJSON,
	traverseModel,
	applyTransfer,
	startCamera,
	drawPoseKeypoints,
	compareArms,
	box,
	MoveNetKeypoints,
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

import perspectiveTransform from "perspective-transform";

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

	// const [capturedPose, setcapturedPose] = useState();

	const [motionTrack, setmotionTrack] = useState(null);
	const motionTrackRef = useRef({});

	const [poseTrack, setposeTrack] = useState(null);
	const poseTrackRef = useRef({});

	const check = useRef(5);

	const animname = "PunchWalk";

	const [leftWidth, setleftWidth] = useState(window.innerWidth - 500);
	const [rightWidth, setrightWidth] = useState(500);
	const [leftHeight, setleftHeight] = useState(window.innerHeight);
	const [rightHeight, setrightHeight] = useState(window.innerHeight / 2);

	const modelPlane = useRef(new Group());

	useEffect(() => {
		const detectorConfig = {
			modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
			minPoseScore: 0.5,
			modelUrl:
				process.env.PUBLIC_URL +
				"/models/tfjs-model_movenet_singlepose_thunder_4/model.json",
			trackerType: poseDetection.TrackerType.Keypoint,
		};

		Promise.all([
			poseDetection.createDetector(
				poseDetection.SupportedModels.MoveNet,
				detectorConfig
			),
			loadGLTF(process.env.PUBLIC_URL + "/glb/punch-walk.glb"),
			loadJSON(process.env.PUBLIC_URL + "/json/PunchWalkTracks.json"),
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

			{
				for (let _ in [0, 1, 2, 3]) {
					const d1 = box(0.02);

					modelPlane.current.add(d1);
				}

				scene.current.add(modelPlane.current);
			}

			animationTracks.current = {
				PunchWalk,
			};

			{
				const g = new Group();

				const colors = [0xff0000, 0x00ff00, 0x00ffff, 0xffff00];

				for (let i in [0, 1, 2, 3]) {
					const d = box(0.1, colors[i]);
					g.add(d);
				}

				motionTrackRef.current = g;
				// scale, so we see the point diff more clear
				g.scale.set(8, 8, 8);

				setmotionTrack(g);
			}

			{
				const g = new Group();

				const colors = [0xff0000, 0x00ff00, 0x00ffff, 0xffff00];

				for (let i in [0, 1, 2, 3]) {
					const d = box(0.1, colors[i]);
					g.add(d);
				}

				poseTrackRef.current = g;
				// scale, so we see the point diff more clear
				g.scale.set(8, 8, 8);
				setposeTrack(g);
			}
		});

		setTimeout(() => {
			animate();

			if (camera.current && renderer.current) {
				camera.current.aspect = leftWidth / leftHeight;
				camera.current.updateProjectionMatrix();

				renderer.current.setSize(leftWidth, leftHeight);
			}
		}, 0);

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		motionRoundRef.current = motionRound;
	}, [motionRound]);

	function animate() {
		requestAnimationFrame(animate);

		if (
			modelPlane.current &&
			modelPlane.current.children.length &&
			figureParts.current
		) {
			// find left/right shoulder, left/right hips position of model
			// use these as source points for perspective transformation
			const forward = 0.14;

			const leftshoulder = new Vector3();

			figureParts.current["LeftArm"].getWorldPosition(leftshoulder);

			modelPlane.current.children[0].position.set(
				leftshoulder.x,
				leftshoulder.y,
				leftshoulder.z + forward
			);

			const rightshoulder = new Vector3();

			figureParts.current["RightArm"].getWorldPosition(rightshoulder);

			modelPlane.current.children[1].position.set(
				rightshoulder.x,
				rightshoulder.y,
				rightshoulder.z + forward
			);

			const lefthip = new Vector3();

			figureParts.current["LeftUpLeg"].getWorldPosition(lefthip);

			modelPlane.current.children[2].position.set(
				lefthip.x,
				lefthip.y,
				lefthip.z + forward
			);

			const righthip = new Vector3();

			figureParts.current["RightUpLeg"].getWorldPosition(righthip);

			modelPlane.current.children[3].position.set(
				righthip.x,
				righthip.y,
				righthip.z + forward
			);
		}

		/**
		 * HTMLMediaElement.readyState, 2,3,4
		 */
		if (videoRef.current.readyState >= 2 && counter.current % 2 === 0) {
			(async () => {
				// const timestamp = performance.now();

				const poses = await poseDetector.current.estimatePoses(
					videoRef.current
					// { flipHorizontal: false }
					// timestamp
				);

				if (!poses || !poses[0] || !poses[0]["keypoints"]) {
					return;
				}

				const keypoints2D = poses[0]["keypoints"];

				// console.log(poses);

				// for (let v of keypoints2D) {
				// 	v["x"] *= -1;
				// 	v["y"] *= -1;
				// }
				// // transfer basis, so that the pose is always stabd up and face to camera
				// const basisMatrix = getBasisFromPose(keypoints3D);

				// for (let k of keypoints3D) {
				// 	const t = new Vector3(k.x, k.y, k.z);

				// 	t.applyMatrix4(basisMatrix);

				// 	k.x = t.x;
				// 	k.y = t.y;
				// 	k.z = t.z;
				// }

				{
					const srcPts = [
						modelPlane.current.children[0].position.x,
						modelPlane.current.children[0].position.y,
						modelPlane.current.children[1].position.x,
						modelPlane.current.children[1].position.y,
						modelPlane.current.children[2].position.x,
						modelPlane.current.children[2].position.y,
						modelPlane.current.children[3].position.x,
						modelPlane.current.children[3].position.y,
					];
					const destPts = [
						keypoints2D[MoveNetKeypoints["left_shoulder"]].x,
						keypoints2D[MoveNetKeypoints["left_shoulder"]].y,
						keypoints2D[MoveNetKeypoints["right_shoulder"]].x,
						keypoints2D[MoveNetKeypoints["right_shoulder"]].y,
						keypoints2D[MoveNetKeypoints["left_hip"]].x,
						keypoints2D[MoveNetKeypoints["left_hip"]].y,
						keypoints2D[MoveNetKeypoints["right_hip"]].x,
						keypoints2D[MoveNetKeypoints["right_hip"]].y,
					];

					const persT = perspectiveTransform(destPts, srcPts);

					for (let v of keypoints2D) {
						const dp = persT.transform(v["x"], v["y"]);

						console.log(v["x"], dp[0]);
						console.log(v["y"], dp[1]);

						v["x"] = dp[0];
						v["y"] = dp[1];
						v["z"] = 0.14;
					}
				}

				// draw pose keypoints
				{
					const g = drawPoseKeypoints(keypoints2D, 0.15);

					// g.scale.set(2, 2, 2);
					g.name = "capturedpose";

					for (let child of scene.current.children) {
						if (child.name === "capturedpose") {
							removeObject3D(child);
						}
					}

					scene.current.add(g);
				}

				// draw model tracks
				{
					const left_forearm = new Vector3();

					figureParts.current["LeftForeArm"].getWorldPosition(
						left_forearm
					);

					const left_hand = new Vector3();

					figureParts.current["LeftHand"].getWorldPosition(left_hand);

					const right_forearm = new Vector3();

					figureParts.current["RightForeArm"].getWorldPosition(
						right_forearm
					);

					const right_hand = new Vector3();

					figureParts.current["RightHand"].getWorldPosition(
						right_hand
					);

					motionTrackRef.current.children[0].position.set(
						left_forearm.x,
						left_forearm.y,
						left_forearm.z
					);

					motionTrackRef.current.children[1].position.set(
						left_hand.x,
						left_hand.y,
						left_hand.z
					);

					motionTrackRef.current.children[2].position.set(
						right_forearm.x,
						right_forearm.y,
						right_forearm.z
					);

					motionTrackRef.current.children[3].position.set(
						right_hand.x,
						right_hand.y,
						right_hand.z
					);
				}

				// draw pose tracks
				{
					const z = 0.15;

					const left_elbow = poseToVector(
						keypoints2D[MoveNetKeypoints["left_elbow"]],
						z
					);
					const left_wrist = poseToVector(
						keypoints2D[MoveNetKeypoints["left_wrist"]],
						z
					);

					const right_elbow = poseToVector(
						keypoints2D[MoveNetKeypoints["right_elbow"]],
						z
					);
					const right_wrist = poseToVector(
						keypoints2D[MoveNetKeypoints["right_wrist"]],
						z
					);

					poseTrackRef.current.children[0].position.set(
						left_elbow.x,
						left_elbow.y,
						left_elbow.z
					);

					poseTrackRef.current.children[1].position.set(
						left_wrist.x,
						left_wrist.y,
						left_wrist.z
					);

					poseTrackRef.current.children[2].position.set(
						right_elbow.x,
						right_elbow.y,
						right_elbow.z
					);

					poseTrackRef.current.children[3].position.set(
						right_wrist.x,
						right_wrist.y,
						right_wrist.z
					);
				}

				let fitted = false;

				// for (let i in animationTracks.current[animname][
				// 	"LeftArm.quaternion"
				// ]["states"]) {
				// 	if (
				// 		compareArms(
				// 			keypoints3D,
				// 			animationTracks.current[animname],
				// 			i
				// 		) >= 4
				// 	) {
				// 		fitted = true;
				// 		break;
				// 	}
				// }

				// if (fitted) {
				// 	check.current = 0;
				// } else {
				// 	check.current += 1;
				// }
			})();

			if (check.current < 6) {
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
		}

		counter.current += 1;

		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	return (
		<div>
			{/* <div
				style={{
					width: rightWidth + "px",
					height: rightHeight + "px",
					position: "absolute",
					top: 0,
					right: 0,
					border: "1px solid #fff",
				}}
			>
				<SubThreeJsScene
					width={rightWidth}
					height={rightHeight}
					objects={capturedPose}
				/>
			</div> */}
			<div
				style={{
					width: rightWidth + "px",
					height: rightHeight + "px",
					position: "absolute",
					bottom: 0,
					right: 0,
					border: "1px solid #fff",
				}}
			>
				<SubThreeJsScene
					width={rightWidth}
					height={rightHeight}
					objects={motionTrack}
					objects1={poseTrack}
				/>
			</div>
			<video
				ref={videoRef}
				autoPlay={true}
				width="320px"
				height="240px"
			></video>
			<div className="btn-box">
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
