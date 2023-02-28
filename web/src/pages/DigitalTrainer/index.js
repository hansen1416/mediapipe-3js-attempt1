import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { Sky } from "three/examples/jsm/objects/Sky";
import * as poseDetection from "@tensorflow-models/pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";
import RangeSlider from "react-range-slider-input";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import { createWorkerFactory, useWorker } from "@shopify/react-web-worker";
import "react-range-slider-input/dist/style.css";

// import { SUB_SCENE_FOV, SUB_SCENE_CAMERA_Z, SUB_SCENE_SIZE } from "./config";
import "../../styles/css/DigitalTrainer.css";
import SubThreeJsScene from "../../components/SubThreeJsScene";
import Silhouette3D from "../../components/Silhouette3D";
import Counter from "../../components/Counter";
import PoseSync from "../../components/PoseSync";
// import PoseSyncVector from "../../components/PoseSyncVector";
import {
	BlazePoseConfig,
	loadFBX,
	loadJSON,
	startCamera,
	traverseModel,
	drawPoseKeypoints,
	calculateLongestTrackFromAnimation,
	applyTransfer,
} from "../../components/ropes";
// import { cloneDeep } from "lodash";

const createWorker = createWorkerFactory(() => import("./worker"));

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

	// ======== main scene 3d model start
	const mannequinModel = useRef(null);
	const figureParts = useRef({});
	// ======== main scene 3d model end

	// ======== for comparing start
	// blazepose pose model
	const poseDetector = useRef(null);
	// landmarks of human joints
	const keypoints3D = useRef(null);
	// compare by joints distances
	const poseSync = useRef(null);
	const [poseSyncThreshold, setposeSyncThreshold] = useState(10);
	const poseSyncThresholdRef = useRef(0);
	const [diffScore, setdiffScore] = useState(0);
	const poseCompareResult = useRef(null);
	// const poseSyncVector = useRef(null);
	// ======== for comparing end

	// ======== sub scene start
	const canvasRefSub = useRef(null);
	const sceneSub = useRef(null);
	const cameraSub = useRef(null);
	const rendererSub = useRef(null);
	const controlsSub = useRef(null);
	// subscen size
	const [subsceneWidth, setsubsceneWidth] = useState(0);
	const [subsceneHeight, setsubsceneHeight] = useState(0);

	const silhouette = useRef(null);
	// ======== sub scene end

	// ======== training process related start
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
	// when training finished
	const [showCompleted, setshowCompleted] = useState(false);
	// ======== training process related end

	// ========= captured pose logic
	const [capturedPose, setcapturedPose] = useState();
	// ========= captured pose logic

	const worker = useWorker(createWorker);

	const workerAvailable = useRef(true);

	useEffect(() => {
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		creatMainScene(documentWidth, documentHeight);

		setsubsceneWidth(documentWidth * 0.25);
		setsubsceneHeight((documentWidth * 0.25 * 480) / 640);

		createSubScene();

		// setsilhouetteSize(0.2 * documentHeight);

		Promise.all([
			poseDetection.createDetector(
				poseDetection.SupportedModels.BlazePose,
				BlazePoseConfig
			),
			loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
		]).then(([detector, model]) => {
			poseDetector.current = detector;

			// add 3d model to main scene
			mannequinModel.current = model;
			mannequinModel.current.position.set(0, -100, 0);
			// store all limbs to `mannequinModel`
			traverseModel(mannequinModel.current, figureParts.current);

			scene.current.add(mannequinModel.current);

			// add silhouette to subscene
			silhouette.current = new Silhouette3D();

			const body = silhouette.current.init();

			sceneSub.current.add(body);

			animate();
		});

		// we can load training list separately
		// todo, use API for this feature
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

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		/**
		 * update subscene size
		 */
		if (!subsceneWidth || !subsceneHeight) {
			return;
		}

		cameraSub.current.aspect = subsceneWidth / subsceneHeight;
		cameraSub.current.updateProjectionMatrix();
		rendererSub.current.setSize(subsceneWidth, subsceneHeight);
	}, [subsceneWidth, subsceneHeight]);

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
					loadJSON(
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

	useEffect(() => {
		/**
		 * user tunning the threshold
		 * it affect how strict user should follow the animation
		 */
		poseSyncThresholdRef.current = 100 + poseSyncThreshold * 10;
	}, [poseSyncThreshold]);

	function creatMainScene(viewWidth, viewHeight) {
		/**
		 * main scene, which plays exercise animation
		 * @param {number} viewWidth
		 * @param {number} viewHeight
		 */
		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(0x022244);

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

		renderer.current.toneMappingExposure = 0.5;

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		renderer.current.setSize(viewWidth, viewHeight);
	}

	function createSubScene() {
		/**
		 * subscene, play the silhouette
		 * an mapping from pose3d data
		 *
		 * assume sqaure canvas, aspect = 1
		 * visible_x / (tan(fov/2)) = object_z + camera_z
		 * visible_x = (object_z + camera_z) * tan(fov/2)
		 *
		 * so for pose,
		 * assume x=0.6, the actual x position of pos should be 0.6*visible_x, same for y, since we're using square canvas
		 * can we apply this to z as well?
		 */

		sceneSub.current = new THREE.Scene();
		sceneSub.current.background = new THREE.Color(0x22244);

		cameraSub.current = new THREE.PerspectiveCamera(90, 1, 0.1, 1000);

		cameraSub.current.position.set(0, 0, 30);

		sceneSub.current.add(new THREE.AmbientLight(0xffffff, 1));

		rendererSub.current = new THREE.WebGLRenderer({
			canvas: canvasRefSub.current,
		});

		controlsSub.current = new OrbitControls(
			cameraSub.current,
			canvasRefSub.current
		);
	}

	function animate() {
		/**
		 * animation loop, both main scene and sub scene updated
		 * 1.predict 3d pose
		 * 2.compare pose with animation
		 * 3.update 3d silhouette
		 * 4.play training sequence
		 */
		if (
			videoRef.current &&
			videoRef.current.readyState >= 2 &&
			counter.current % 3 === 0
		) {
			capturePose();

			comparePose();

			// draw 3d silhouette
			if (keypoints3D.current) {
				silhouette.current.applyPose(keypoints3D.current, true);

				// todo, pass keypoints3d data to web worker,
				// so it can analysis the user's kinematics data
				// decide its amplitude, speed

				if (workerAvailable.current) {
					workerAvailable.current = false;

					worker.analyzePose(keypoints3D.current).then((msg) => {
						console.log(msg);

						workerAvailable.current = true;
					});
				}
			}
		} else {
			keypoints3D.current = null;
		}

		// ========= captured pose logic
		if (keypoints3D.current) {
			// draw the pose as dots and lines on the sub scene
			const g = drawPoseKeypoints(keypoints3D.current);

			g.scale.set(8, 8, 8);

			setcapturedPose(g);
		}
		// ========= captured pose logic

		if (inExercise.current) {
			counter.current += 1;

			doingTraining();
		}

		controls.current.update();
		renderer.current.render(scene.current, camera.current);

		controlsSub.current.update();
		rendererSub.current.render(sceneSub.current, cameraSub.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function capturePose() {
		/**
		 * when video is ready, we can capture the pose
		 *
		 * calculate `keypoints3D.current`
		 *
		 * maybe we can do calculation in async then, since the other place will check `keypoints3D.current`
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
				keypoints3D.current = null;
				return;
			}

			keypoints3D.current = poses[0]["keypoints3D"];

			const width_ratio = 30;
			const height_ratio = (width_ratio * 480) / 640;

			// multiply x,y by differnt factor
			for (let v of keypoints3D.current) {
				v["x"] *= -width_ratio;
				v["y"] *= -height_ratio;
				v["z"] *= -width_ratio;
			}

			// console.log(keypoints3D.current);
		})();
	}

	function comparePose() {
		/**
		 * in this async function,
		 * 1. calculate different of distance among different joints
		 * 2. calculate different of vectors between limbs
		 * 3. draw pose on the sub-scene
		 */
		if (!keypoints3D.current) {
			return;
		}

		if (poseSync.current) {
			// compare the distance curve between animation and pose
			poseCompareResult.current = poseSync.current.compareCurrentPose(
				keypoints3D.current,
				figureParts.current,
				poseSyncThresholdRef.current
			);

			setdiffScore(parseInt(poseSync.current.diffScore));

			// compare the distance curve between animation and pose
		}

		// if (poseSyncVector.current) {
		// 	// compare the limbs vectors between pose and animation

		// 	// this is only for display, doesn't affect animtion
		// 	// draw different colors on the silhouette
		// 	const distances = poseSyncVector.current.compareCurrentPose(
		// 		keypoints3D.current,
		// 		figureParts.current
		// 	);

		// 	// watch keypoints3d and vectorDistances,
		// 	const colors = calculateSilhouetteColors(
		// 		distances,
		// 		keypoints3D.current
		// 	);

		// 	// silhouette.current.applyColor(colors);
		// }
	}

	function doingTraining() {
		/**
		 * in the training process
		 * 1. do count down
		 * 2. apply animation
		 */
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

		// play animation at 30fps
		if (counter.current % 2 === 0) {
			applyAnimation();
		}
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

	function initializeExercise() {
		/**
		 * 1. read animation data, read round
		 * 2. read animation data, set mode position, rotation, calculate longest track
		 * 3. initialize `PoseSync`, `PoseSyncVector`, used to compare pose pose and animation
		 */
		currentAnimationIndx.current = 0;
		currentRound.current = parseInt(
			exerciseQueue.current[exerciseQueueIndx.current].round
		);

		const animation_data =
			animationJSONs.current[
				exerciseQueue.current[exerciseQueueIndx.current].key
			];

		// send animation data to worker, reserved for future analysis
		// maybe do this sync
		worker
			.fetchAnimationData(animation_data.joints_position)
			.then((msg) => {
				console.info(msg);
			});

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
		// poseSyncVector.current = new PoseSyncVector(animation_data);

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
				width={subsceneWidth + "px"}
				height={subsceneHeight + "px"}
				style={{
					display: "none",
				}}
				// style={{
				// 	display: "block",
				// 	position: "absolute",
				// 	top: 0,
				// 	left: subsceneWidth + "px",
				// }}
			></video>

			<canvas ref={canvasRef} />

			{/* // ========= captured pose logic */}
			<div
				style={{
					width: subsceneWidth + "px",
					height: subsceneHeight + "px",
					position: "absolute",
					top: 0,
					left: 0,
				}}
			>
				<SubThreeJsScene
					width={subsceneWidth}
					height={subsceneHeight}
					objects={capturedPose}
					cameraZ={200}
				/>
			</div>
			{/* // ========= captured pose logic */}

			<div
				style={{
					width: subsceneWidth + "px",
					height: subsceneHeight + "px",
					position: "absolute",
					bottom: 0,
					left: 0,
					// border: "1px solid #fff",
				}}
			>
				<div className="sub-scene">
					<canvas ref={canvasRefSub}></canvas>
				</div>
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
