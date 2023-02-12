import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";
import RangeSlider from "react-range-slider-input";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import "react-range-slider-input/dist/style.css";
import "../../styles/css/DigitalTrainer.css";

import SubThreeJsScene from "../../components/SubThreeJsScene";
import Silhouette from "./Silhouette";
import Counter from "../../components/Counter";
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
	BlazePoseKeypointsValues,
	radianGradientColor,
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
	const [poseSyncThreshold, setposeSyncThreshold] = useState(10);
	const poseSyncThresholdRef = useRef(0);
	const [diffScore, setdiffScore] = useState(0);
	const poseCompareResult = useRef(null);

	const poseSyncVector = useRef(null);
	const [vectorDistances, setvectorDistances] = useState([]);
	const [distanceNames] = useState([
		"chest",
		"leftupperarm",
		"leftforearm",
		"rightupperarm",
		"rightforearm",
		"abdominal",
		"leftthigh",
		"leftcalf",
		"rightthigh",
		"rightcalf",
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

	const [silhouetteSize, setsilhouetteSize] = useState(100);
	const [silhouetteColors, setsilhouetteColors] = useState({});

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
	// number of round of the current exercise(animation)
	const currentRound = useRef(0);

	const [currentExerciseName, setcurrentExerciseName] = useState("");
	const [currentExerciseRemainRound, setcurrentExerciseRemainRound] =
		useState(0);

	const [counterNumber, setcounterNumber] = useState(-1);

	// get ready count down
	const getReadyCountDown = useRef(0);

	// rest time in seconds, between exercises
	const resetTime = useRef(180);
	// count down during rest
	const restCountDown = useRef(0);

	const [showCompleted, setshowCompleted] = useState(false);

	useEffect(() => {
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		setsilhouetteSize(0.2 * documentHeight);

		Promise.all([
			poseDetection.createDetector(
				poseDetection.SupportedModels.BlazePose,
				BlazePoseConfig
			),
			loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
		]).then(([detector, model]) => {
			poseDetector.current = detector;
			mannequinModel.current = model;

			_scene(documentWidth, documentHeight);

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

	useEffect(() => {
		poseSyncThresholdRef.current = 100 + poseSyncThreshold * 10;
	}, [poseSyncThreshold]);

	function loadTrainingList() {
		new Promise((resolve) => {
			resolve([
				{
					name: "default training",
					rest: 180,
					exercise: [
						{ round: 2, key: "punch-walk" },
						{ round: 2, key: "basic-crunch" },
						{ round: 2, key: "curl-up" },
						{ round: 2, key: "leg-scissors" },
						{ round: 2, key: "toe-crunch" },
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
			counter.current += 1;

			doingTraining();
		}

		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function doingTraining() {
		if (getReadyCountDown.current > 0) {
			getReadyCountDown.current -= 1;

			setcounterNumber(parseInt(getReadyCountDown.current / 60));

			return;
		}

		if (restCountDown.current > 0) {
			restCountDown.current -= 1;

			setcounterNumber(parseInt(restCountDown.current / 60));

			return;
		}

		// hide counter
		setcounterNumber(-1);

		if (
			videoRef.current &&
			videoRef.current.readyState >= 2 &&
			counter.current % 3 === 0
		) {
			calculatePose();
		} else {
			keypoints3D.current = null;
		}

		if (counter.current % 2 === 0) {
			applyAnimation();
		}
	}

	function calculatePose() {
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
					figureParts.current,
					poseSyncThresholdRef.current
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

				// this is only for display, doesn't affect animtion
				// draw different colors on the silhouette
				const distances = poseSyncVector.current.compareCurrentPose(
					keypoints3D.current,
					figureParts.current
				);

				setvectorDistances(distances);

				// watch keypoints3d and vectorDistances,
				calculateSilhouetteColors(distances, keypoints3D.current);
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
	}

	function applyAnimation() {
		/**
		 * current animation not finished
		 *
		 * 		pose compared result is good
		 * 			apply animation
		 * 			continue increment frame index
		 * 		else
		 * 			continue
		 *
		 * else
		 * 		more round to do
		 * 			reset frame index
		 * 		else
		 * 			more exercise to do
		 * 				calculate longest track
		 * 				refill round
		 * 				reset frame index
		 * 			else
		 *				flag no longer in exercise
		 *				reset frame index
		 *				reset logest track
		 *				reset round
		 *
		 *
		 * `oseCompareResult.current` is the flag indicate whether animation should be going
		 * it's the diffscore calculated by `poseSync.current.compareCurrentPose`
		 *
		 */
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
					// compare failed, pause animation
				}
			}
		} else {
			// the current animation finished

			if (currentRound.current > 1) {
				// still more round to go
				currentRound.current -= 1;
				currentAnimationIndx.current = 0;

				setcurrentExerciseRemainRound(currentRound.current);
			} else {
				// all round done, switch to next exercise

				if (
					exerciseQueueIndx.current <
					exerciseQueue.current.length - 1
				) {
					// there are more animation in the queue

					exerciseQueueIndx.current += 1;

					initializeExercise();

					// rest hook
					restCountDown.current = resetTime.current;
				} else {
					// all animation played

					inExercise.current = false;

					exerciseQueueIndx.current = 0;
					currentAnimationIndx.current = 0;
					currentLongestTrack.current = 0;
					currentRound.current = 0;

					setstopBtnShow(false);

					// training complete hook
					setshowCompleted(true);
					setcurrentExerciseName("");
					setcurrentExerciseRemainRound(0);

					// todo make API call to save user data
				}
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

	function calculateSilhouetteColors(vectorDistances, keypoints3D) {
		const colors = {};

		const [
			chest,
			leftupperarm,
			leftforearm,
			rightupperarm,
			rightforearm,
			abdominal,
			leftthigh,
			leftcalf,
			rightthigh,
			rightcalf,
		] = vectorDistances;

		if (
			keypoints3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]].score >
				0.5 &&
			keypoints3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]].score > 0.5
		) {
			colors["chest"] = radianGradientColor(chest);
		}

		if (
			keypoints3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]].score >
				0.5 &&
			keypoints3D[BlazePoseKeypointsValues["LEFT_ELBOW"]].score > 0.5
		) {
			colors["leftupperarm"] = radianGradientColor(leftupperarm);
		}

		if (
			keypoints3D[BlazePoseKeypointsValues["LEFT_ELBOW"]].score > 0.5 &&
			keypoints3D[BlazePoseKeypointsValues["LEFT_WRIST"]].score > 0.5
		) {
			colors["leftforearm"] = radianGradientColor(leftforearm);
		}

		if (
			keypoints3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]].score >
				0.5 &&
			keypoints3D[BlazePoseKeypointsValues["RIGHT_ELBOW"]].score > 0.5
		) {
			colors["rightupperarm"] = radianGradientColor(rightupperarm);
		}

		if (
			keypoints3D[BlazePoseKeypointsValues["RIGHT_ELBOW"]].score > 0.5 &&
			keypoints3D[BlazePoseKeypointsValues["RIGHT_WRIST"]].score > 0.5
		) {
			colors["rightforearm"] = radianGradientColor(rightforearm);
		}

		if (
			keypoints3D[BlazePoseKeypointsValues["LEFT_HIP"]].score > 0.5 &&
			keypoints3D[BlazePoseKeypointsValues["RIGHT_HIP"]].score > 0.5
		) {
			colors["abdominal"] = radianGradientColor(abdominal);
		}

		if (
			keypoints3D[BlazePoseKeypointsValues["LEFT_HIP"]].score > 0.5 &&
			keypoints3D[BlazePoseKeypointsValues["LEFT_KNEE"]].score > 0.5
		) {
			colors["leftthigh"] = radianGradientColor(leftthigh);
		}

		if (
			keypoints3D[BlazePoseKeypointsValues["LEFT_KNEE"]].score > 0.5 &&
			keypoints3D[BlazePoseKeypointsValues["LEFT_ANKLE"]].score > 0.5
		) {
			colors["leftcalf"] = radianGradientColor(leftcalf);
		}

		if (
			keypoints3D[BlazePoseKeypointsValues["RIGHT_HIP"]].score > 0.5 &&
			keypoints3D[BlazePoseKeypointsValues["RIGHT_KNEE"]].score > 0.5
		) {
			colors["rightthigh"] = radianGradientColor(rightthigh);
		}

		if (
			keypoints3D[BlazePoseKeypointsValues["RIGHT_KNEE"]].score > 0.5 &&
			keypoints3D[BlazePoseKeypointsValues["RIGHT_ANKLE"]].score > 0.5
		) {
			colors["rightcalf"] = radianGradientColor(rightcalf);
		}

		setsilhouetteColors(colors);
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
			const tmp_queue = [];

			try {
				resetTime.current = parseInt(
					trainingList[selectedTrainingIndx].rest
				);
			} catch (e) {
				console.error(e);
			}

			for (const e of trainingList[selectedTrainingIndx].exercise) {
				tasks.push(
					loadObj(
						process.env.PUBLIC_URL + "/animjson/" + e.key + ".json"
					)
				);

				tmp_queue.push(e);
			}

			exerciseQueue.current = tmp_queue;

			Promise.all(tasks).then((data) => {
				for (const v of data) {
					animationJSONs.current[v.name] = v;
				}

				exerciseQueueIndx.current = 0;

				initializeExercise();

				setstartBtnShow(true);
			});
		}
		// eslint-disable-next-line
	}, [selectedTrainingIndx]);

	/**
	 * 1. read animation data, read round
	 * 2. read animation data, set mode position, rotation, calculate longest track
	 * 3. initialize `PoseSync`, `PoseSyncVector`, used to compare pose pose and animation
	 */
	function initializeExercise() {
		currentAnimationIndx.current = 0;
		currentRound.current = parseInt(
			exerciseQueue.current[exerciseQueueIndx.current].round
		);

		const animation_data =
			animationJSONs.current[
				exerciseQueue.current[exerciseQueueIndx.current].key
			];

		mannequinModel.current.position.set(
			animation_data.position.x,
			animation_data.position.y,
			animation_data.position.z
		);

		mannequinModel.current.rotation.set(
			animation_data.rotation.x,
			animation_data.rotation.y,
			animation_data.rotation.z
		);

		currentLongestTrack.current = calculateLongestTrackFromAnimation(
			animation_data.tracks
		);

		poseSync.current = new PoseSync(animation_data);
		poseSyncVector.current = new PoseSyncVector(animation_data);

		applyTransfer(figureParts.current, animation_data.tracks, 0);

		setcurrentExerciseName(
			animation_data.display_name
				? animation_data.display_name
				: animation_data.name
		);

		setcurrentExerciseRemainRound(currentRound.current);
	}

	return (
		<div className="digital-trainer">
			<video
				ref={videoRef}
				autoPlay={true}
				width="640px"
				height="480px"
				style={{ display: "none" }}
			></video>

			<canvas ref={canvasRef} />

			{/* // ========= captured pose logic */}
			{/* <div
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
			</div> */}
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
			<div
				style={{
					width: silhouetteSize + "px",
					height: silhouetteSize + "px",
					position: "absolute",
					bottom: 0.3 * silhouetteSize + "px",
					left: 0,
				}}
			>
				<Silhouette
					width={silhouetteSize}
					height={silhouetteSize}
					colors={silhouetteColors}
				/>
			</div>
			<div className="controls">
				<div>
					<span style={{ fontSize: "40px", color: "#fff" }}>
						{diffScore}
					</span>
				</div>
				{/* <div style={{ color: "#fff" }}>
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
				</div> */}
				<div style={{ marginBottom: "40px" }}>
					<ListGroup>
						{trainingList &&
							trainingList.map((item, i) => {
								return (
									<ListGroup.Item
										key={i}
										onClick={() => {
											setselectedTrainingIndx(i);
										}}
									>
										{item.name}
									</ListGroup.Item>
								);
							})}
					</ListGroup>
				</div>
				<div style={{ marginBottom: "40px" }}>
					{startBtnShow && (
						<Button
							variant="primary"
							onClick={() => {
								if (videoRef.current) {
									startCamera(videoRef.current);

									inExercise.current = true;

									// count down loop hook. default 5 seconds

									getReadyCountDown.current = 300;

									setstartBtnShow(false);
									setstopBtnShow(true);
								}
							}}
						>
							Start
						</Button>
					)}
					{stopBtnShow && (
						<Button
							variant="secondary"
							onClick={() => {
								if (videoRef.current) {
									videoRef.current.srcObject = null;

									inExercise.current = false;

									setstopBtnShow(false);
								}
							}}
						>
							Stop
						</Button>
					)}
				</div>
				<div
					style={{
						marginTop: "20px",
						display: "flex",
						flexDirection: "row",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<div
						style={{
							flexGrow: 1,
						}}
					>
						<RangeSlider
							className="single-thumb"
							defaultValue={[0, 10]}
							thumbsDisabled={[true, false]}
							rangeSlideDisabled={true}
							onInput={(values) => {
								setposeSyncThreshold(values[1]);
							}}
						/>
					</div>
					<div
						style={{
							marginLeft: "10px",
						}}
					>
						<Badge pill bg="primary">
							{poseSyncThreshold}
						</Badge>
					</div>
				</div>
			</div>

			{currentExerciseName && (
				<div className="exercise-info">
					<span>{currentExerciseName}</span>
					{currentExerciseRemainRound && (
						<span style={{ marginLeft: "20px" }}>
							{currentExerciseRemainRound}
						</span>
					)}
				</div>
			)}

			{counterNumber >= 0 && <Counter number={counterNumber} />}

			{showCompleted && (
				<div className="congratulations">Congratulations</div>
			)}
		</div>
	);
}
