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
	visibleJoints,
} from "../../components/ropes";

/**
 * BE SUCCESSFUL!!
 * @returns
 */
export default function DigitalTrainer() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);
	// an integer number, used for cancelAnimationFrame
	const animationPointer = useRef(0);
	const counter = useRef(0);

	const videoRef = useRef(null);

	const poseDetector = useRef(null);
	const mannequinModel = useRef(null);
	const figureParts = useRef({});
	const keypoints3D = useRef(null);

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

	// ========= diff curve logic
	// const [poseCurve, setposeCurve] = useState(null);
	// const poseCurveRef = useRef(null);
	// const [boneCurve, setboneCurve] = useState(null);
	// const boneCurveRef = useRef(null);
	// ========= diff curve logic

	// ========= captured pose logic
	const [capturedPose, setcapturedPose] = useState();
	// ========= captured pose logic

	const [startBtnShow, setstartBtnShow] = useState(false);
	const [stopBtnShow, setstopBtnShow] = useState(false);
	const inExercise = useRef(false);

	const [trainingList, settrainingList] = useState([]);
	const [selectedTrainingIndx, setselectedTrainingIndx] = useState(-1);

	// store the actual animation data, in a name=>value format
	const animationJSONs = useRef({});
	// the exercise queue, an array of names
	const exerciseQueue = useRef([]);
	// the index of the current exercise in the `exerciseQueue`
	const exerciseQueueIndx = useRef(0);
	// the current frame index of the current exercise(animation)
	const currentAnimationIndx = useRef(0);
	// the logest track of the current exercise(animation)
	const currentLongestTrack = useRef(0);

	useEffect(() => {
		Promise.all([
			poseDetection.createDetector(
				poseDetection.SupportedModels.BlazePose,
				BlazePoseConfig
			),
			loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
		]).then(([detector, model]) => {
			poseDetector.current = detector;
			mannequinModel.current = model;

			_scene(
				document.documentElement.clientWidth,
				document.documentElement.clientHeight
			);

			mannequinModel.current.position.set(0, -100, 0);

			traverseModel(mannequinModel.current, figureParts.current);

			scene.current.add(mannequinModel.current);

			// ========= diff curve logic
			// {
			// 	const geometry = new THREE.BufferGeometry().setFromPoints([
			// 		new THREE.Vector2(0, 0),
			// 		new THREE.Vector2(100, 0),
			// 	]);

			// 	poseCurveRef.current = new THREE.Line(
			// 		geometry.clone(),
			// 		new THREE.LineBasicMaterial({
			// 			color: 0xff0000,
			// 		})
			// 	);

			// 	boneCurveRef.current = new THREE.Line(
			// 		geometry.clone(),
			// 		new THREE.LineBasicMaterial({
			// 			color: 0x00ff00,
			// 		})
			// 	);

			// 	poseCurveRef.current.position.set(-100, -50, 0);
			// 	boneCurveRef.current.position.set(-100, -50, 0);

			// 	scene.current.add(poseCurveRef.current);
			// 	scene.current.add(boneCurveRef.current);

			// 	setposeCurve(poseCurveRef.current);
			// 	setboneCurve(boneCurveRef.current);
			// } // ========= diff curve logic

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
		if (inExercise.current) {
			watchAnimation();
		}

		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function watchAnimation() {
		counter.current += 1;

		if (
			!videoRef.current ||
			videoRef.current.readyState < 2 ||
			counter.current % 3 !== 0
		) {
			keypoints3D.current = null;
			return;
		}

		/**
		 * in this async function,
		 * 1. calculate `keypoints3D.current`
		 * 2. calculate different of distance among different joints
		 * 3. calculate different of vectors between limbs
		 * 4. draw pose on the sub-scene
		 */
		(async () => {
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
				poseCompareResult.current = poseSync.current.compareCurrentPose(
					keypoints3D.current,
					figureParts.current
				);

				setdiffScore(parseInt(poseSync.current.diffScore));

				// ========= diff curve logic
				// poseCurveRef.current.geometry.setFromPoints(
				// 	poseSync.current.poseSpline.getPoints(50)
				// );
				// boneCurveRef.current.geometry.setFromPoints(
				// 	poseSync.current.boneSpline.getPoints(50)
				// );
				// ========= diff curve logic
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

			// ========= captured pose logic
			if (keypoints3D.current) {
				// draw the pose as dots and lines on the sub scene
				const g = drawPoseKeypoints(keypoints3D.current);

				g.scale.set(8, 8, 8);

				setcapturedPose(g);
			}
			// ========= captured pose logic
		})();

		if (currentAnimationIndx.current < currentLongestTrack.current) {
			// the current animation is still in progess

			if (poseSync.current) {
				if (poseCompareResult.current) {
					if (poseCompareResult.current instanceof Number) {
						currentAnimationIndx.current =
							poseCompareResult.current;
					}

					applyTransfer(
						figureParts.current,
						poseSync.current.animation_data.tracks,
						currentAnimationIndx.current
					);

					currentAnimationIndx.current += 1;
				} else if (poseCompareResult.current === false) {
					// compare failed, stop animation
				}

				if (
					currentAnimationIndx.current >= currentLongestTrack.current
				) {
					currentAnimationIndx.current = 0;
				}
			}

			currentAnimationIndx.current += 1;
		} else {
			// the current animation finished

			if (exerciseQueueIndx.current < exerciseQueue.current.length - 1) {
				// there are more animation in the queue

				exerciseQueueIndx.current += 1;
				currentAnimationIndx.current = 0;

				const animation_data =
					animationJSONs.current[
						exerciseQueue.current[exerciseQueueIndx.current]
					];

				mannequinModel.current.position.set(animation_data.position.x, animation_data.position.y, animation_data.position.z);

				currentLongestTrack.current =
					calculateLongestTrackFromAnimation(animation_data.tracks);

				poseSync.current = new PoseSync(animation_data);
				poseSyncVector.current = new PoseSyncVector(animation_data);
			} else {
				// all animation played
				// todo all complete hook

				inExercise.current = false;

				exerciseQueueIndx.current = 0;
				currentAnimationIndx.current = 0;
				currentLongestTrack.current = 0;
			}
		}
	}

	/**
	 * get the number of longest track from the animation
	 * @param {Array} animation_tracks
	 * @returns
	 */
	function calculateLongestTrackFromAnimation(animation_tracks) {
		let longest = 0;

		for (const v of animation_tracks) {
			if (v.type === "quaternion" && v.quaternions.length > longest) {
				longest = v.quaternions.length;
			}
		}

		return longest;
	}

	useEffect(() => {
		/**
		 * when select one of the training
		 * load all of the animation jsons `animationJSONs`
		 * add then add all names to `exerciseQueue`
		 * in `animate`, we consume `exerciseQueue`
		 */
		if (selectedTrainingIndx >= 0 && trainingList[selectedTrainingIndx]) {
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

				exerciseQueueIndx.current = 0;
				currentAnimationIndx.current = 0;
				currentLongestTrack.current = 0;

				setstartBtnShow(true);
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

			{/* // ========= captured pose logic */}
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
			{/* // ========= captured pose logic */}
			{/* // ========= diff curve logic */}
			{/* <div
				style={{
					width: "500px",
					height: "400px",
					position: "absolute",
					bottom: 0,
					left: 0,
					border: "1px solid #fff",
				}}
			>
				<SubThreeJsScene
					width={500}
					height={400}
					objects={poseCurve}
					objects1={boneCurve}
					cameraZ={200}
				/>
			</div> */}
			{/* // ========= diff curve logic */}
			<div className="btn-box">
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
					{startBtnShow && (
						<button
							onClick={() => {
								if (videoRef.current) {
									startCamera(videoRef.current);

									inExercise.current = true;

									setstopBtnShow(true);
								}
							}}
						>
							Start
						</button>
					)}
					{stopBtnShow && (
						<button
							onClick={() => {
								if (videoRef.current) {
									videoRef.current.srcObject = null;

									inExercise.current = false;

									setstopBtnShow(false);
								}
							}}
						>
							Stop
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
