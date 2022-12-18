import { useEffect, useRef, useState } from "react";
import { Vector3, Matrix4, MathUtils } from "three";
import {
	Pose,
	POSE_LANDMARKS,
	POSE_CONNECTIONS,
	POSE_LANDMARKS_LEFT,
	POSE_LANDMARKS_RIGHT,
	POSE_LANDMARKS_NEUTRAL,
} from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import {
	getUserMedia,
	middlePosition,
	posePointsToVector,
	loadFBX,
	loadObj,
	traverseModel,
	applyTransfer,
} from "./ropes";

export default function MotionSync(props) {
	const { scene, camera, renderer, controls } = props;

	const videoRef = useRef(null);
	const canvasRef = useRef(null);

	const mediaCamera = useRef(null);
	const [mediaCameraStatus, setmediaCameraStatus] = useState(false);

	const figureParts = useRef({});

	const [animationTracks, setanimationTracks] = useState({});

	const animationIndx = useRef(0);
	const threshold = MathUtils.degToRad(30);

	function animate() {
		requestAnimationFrame(animate);

		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	useEffect(() => {
		Promise.all([
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
				model,
				AirSquat,
				BicycleCrunch,
				Clapping,
				JumpingJacks,
				KettlebellSwing,
				Waving,
			]) => {
				model.position.set(0, -100, 0);

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

	// useEffect(() => {
	// 	console.log(animationTracks);
	// }, [animationTracks]);

	function startCamera() {
		setmediaCameraStatus(true);

		if (videoRef.current) {
			getUserMedia(
				{ video: true },
				(stream) => {
					// Yay, now our webcam input is treated as a normal video and
					// we can start having fun
					try {
						videoRef.current.srcObject = stream;

						// let stream_settings = stream
						// 	.getVideoTracks()[0]
						// 	.getSettings();

						// console.log(stream_settings);
					} catch (error) {
						videoRef.current.src = URL.createObjectURL(stream);
					}
					// Let's start drawing the canvas!
				},
				(err) => {
					throw err;
				}
			);

			const pose = new Pose({
				locateFile: (file) => {
					return process.env.PUBLIC_URL + `/mediapipe/${file}`;
					// return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
				},
			});
			pose.setOptions({
				modelComplexity: 2,
				smoothLandmarks: true,
				enableSegmentation: false,
				smoothSegmentation: false,
				minDetectionConfidence: 0.5,
				minTrackingConfidence: 0.5,
			});
			pose.onResults(onPoseResults);

			pose.initialize().then(() => {
				console.info("Loaded pose model");
			});

			// const ctx = canvasRef.current.getContext("2d");

			mediaCamera.current = new Camera(videoRef.current, {
				onFrame: async () => {
					await pose.send({ image: videoRef.current });
				},
				width: 640,
				height: 360,
			});

			mediaCamera.current.start();
		}
	}

	function onPoseResults(results) {
		draw(results);

		const jsonObj = animationTracks["Waving"];

		if (results.poseWorldLandmarks) {
			const data = results.poseWorldLandmarks;

			for (let i in data) {
				data[i].x *= -1;
				data[i].y *= -1;
				data[i].z *= -1;
			}

			const basisMatrix = getBasisFromPose(data);

			const leftArmOrientation = posePointsToVector(
				data[POSE_LANDMARKS["LEFT_ELBOW"]],
				data[POSE_LANDMARKS["LEFT_SHOULDER"]]
			);
			const leftForeArmOrientation = posePointsToVector(
				data[POSE_LANDMARKS["LEFT_WRIST"]],
				data[POSE_LANDMARKS["LEFT_ELBOW"]]
			);

			leftArmOrientation.applyMatrix4(basisMatrix);
			leftForeArmOrientation.applyMatrix4(basisMatrix);

			if (
				animationIndx.current >=
				jsonObj["mixamorigLeftArm.quaternion"]["states"].length
			) {
				stopCamera();

				alert("motion finished");

				return;
			}

			const rightArmStates =
				jsonObj["mixamorigRightArm.quaternion"]["states"][
					animationIndx.current
				];
			const rightForeArmStates =
				jsonObj["mixamorigRightForeArm.quaternion"]["states"][
					animationIndx.current
				];

			// console.log(rightArmStates, rightForeArmStates);

			const leftArmDeviation = leftArmOrientation.angleTo(
				new Vector3(
					rightArmStates.x,
					rightArmStates.y,
					rightArmStates.z
				)
			);
			const leftForeArmDeviation = leftForeArmOrientation.angleTo(
				new Vector3(
					rightForeArmStates.x,
					rightForeArmStates.y,
					rightForeArmStates.z
				)
			);

			if (
				leftArmDeviation < threshold &&
				leftForeArmDeviation < threshold
			) {
				// console.log(jsonObj);

				applyTransfer(
					figureParts.current,
					jsonObj,
					animationIndx.current
				);

				animationIndx.current += 1;

				console.log(animationIndx.current);
			}

			// console.log(leftArmDeviation, leftForeArmDeviation);
		}
	}

	function getBasisFromPose(poseDataFrame) {
		const rightshoulder = new Vector3(
			poseDataFrame[POSE_LANDMARKS["LEFT_SHOULDER"]].x,
			poseDataFrame[POSE_LANDMARKS["LEFT_SHOULDER"]].y,
			poseDataFrame[POSE_LANDMARKS["LEFT_SHOULDER"]].z
		).normalize();
		const leftshoulder = new Vector3(
			poseDataFrame[POSE_LANDMARKS["RIGHT_SHOULDER"]].x,
			poseDataFrame[POSE_LANDMARKS["RIGHT_SHOULDER"]].y,
			poseDataFrame[POSE_LANDMARKS["RIGHT_SHOULDER"]].z
		).normalize();

		const righthip = new Vector3(
			poseDataFrame[POSE_LANDMARKS["LEFT_HIP"]].x,
			poseDataFrame[POSE_LANDMARKS["LEFT_HIP"]].y,
			poseDataFrame[POSE_LANDMARKS["LEFT_HIP"]].z
		).normalize();
		const lefthip = new Vector3(
			poseDataFrame[POSE_LANDMARKS["RIGHT_HIP"]].x,
			poseDataFrame[POSE_LANDMARKS["RIGHT_HIP"]].y,
			poseDataFrame[POSE_LANDMARKS["RIGHT_HIP"]].x
		).normalize();

		const a = middlePosition(leftshoulder, rightshoulder, false);
		const b = middlePosition(lefthip, righthip, false);

		const y_basis = posePointsToVector(a, b);
		const x_basis = posePointsToVector(lefthip, b);
		const z_basis = new Vector3()
			.crossVectors(x_basis, y_basis)
			.normalize();

		// console.log("x_basis", x_basis, "y_basis", y_basis, "z_basis", z_basis);

		return new Matrix4().makeBasis(x_basis, y_basis, z_basis).invert();
	}

	function draw(results) {
		const canvasCtx = canvasRef.current.getContext("2d");
		// Draw the overlays.
		canvasCtx.save();
		canvasCtx.clearRect(
			0,
			0,
			canvasRef.current.width,
			canvasRef.current.height
		);

		if (results.poseLandmarks) {
			drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
				visibilityMin: 0.65,
				color: "white",
			});
			drawLandmarks(
				canvasCtx,
				Object.values(POSE_LANDMARKS_LEFT).map(
					(index) => results.poseLandmarks[index]
				),
				{
					visibilityMin: 0.65,
					color: "white",
					fillColor: "rgb(255,138,0)",
				}
			);
			drawLandmarks(
				canvasCtx,
				Object.values(POSE_LANDMARKS_RIGHT).map(
					(index) => results.poseLandmarks[index]
				),
				{
					visibilityMin: 0.65,
					color: "white",
					fillColor: "rgb(0,217,231)",
				}
			);
			drawLandmarks(
				canvasCtx,
				Object.values(POSE_LANDMARKS_NEUTRAL).map(
					(index) => results.poseLandmarks[index]
				),
				{ visibilityMin: 0.65, color: "white", fillColor: "white" }
			);
		}
		canvasCtx.restore();

		// if (results.poseWorldLandmarks) {
		// 	grid.updateLandmarks(results.poseWorldLandmarks, POSE_CONNECTIONS, [
		// 		{
		// 			list: Object.values(POSE_LANDMARKS_LEFT),
		// 			color: "LEFT",
		// 		},
		// 		{
		// 			list: Object.values(POSE_LANDMARKS_RIGHT),
		// 			color: "RIGHT",
		// 		},
		// 	]);
		// } else {
		// 	grid.updateLandmarks([]);
		// }
	}

	function stopCamera() {
		mediaCamera.current.stop();

		setmediaCameraStatus(false);
	}

	return (
		<div>
			<canvas
				ref={canvasRef}
				style={{ position: "absolute", left: 0, bottom: 0 }}
				width="640px"
				height="320px"
			></canvas>
			<div className="btn-box">
				<video ref={videoRef} autoPlay={true}></video>

				{mediaCameraStatus ? (
					<button onClick={stopCamera}>camera stop</button>
				) : (
					<button onClick={startCamera}>camera sync</button>
				)}
			</div>
		</div>
	);
}
