import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { cloneDeep } from "lodash";
// import * as poseDetection from "@tensorflow-models/pose-detection";
import {Pose} from "@mediapipe/pose";
// import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
// import "@tensorflow/tfjs-backend-webgl";
import RangeSlider from "react-range-slider-input";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import { createWorkerFactory, useWorker } from "@shopify/react-web-worker";
import "react-range-slider-input/dist/style.css";

import "../styles/css/DigitalTrainer.css";
// import SubThreeJsScene from "../components/SubThreeJsScene";
import Silhouette3D from "../components/Silhouette3D";
import Counter from "../components/Counter";
import PoseSync from "../components/PoseSync";

import {
	// BlazePoseConfig,
	loadJSON,
	startCamera,
	traverseModel,
	calculateLongestTrackFromAnimation,
	applyTransfer,
	radianGradientColor,
	loadGLTF,
	// loadFBX,
	jsonToBufferGeometry,
	roundToTwo,
} from "../components/ropes";

const createWorker = createWorkerFactory(() =>
	import("./DigitalTrainerWorker")
);

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
	// const keypoints2D = useRef(null);
	const keypoints3D = useRef(null);
	// compare by joints distances
	const poseSync = useRef(null);
	const [poseSyncThreshold, setposeSyncThreshold] = useState(80);
	const poseSyncThresholdRef = useRef(0);
	const [diffScore, setdiffScore] = useState(0);
	const poseCompareResult = useRef(null);
	// const poseSyncVector = useRef(null);
	// ======== for comparing end

	// ======== loading status
	const [loadingModel, setloadingModel] = useState(true);
	const [loadingCharacter, setloadingCharacter] = useState(true);
	const [loadingSilhouette, setloadingSilhouette] = useState(true);
	const [loadingTraining, setloadingTraining] = useState(true);
	// ======== loading status

	// ======== sub scene start
	// example exercise subscene
	const canvasRefEg = useRef(null);
	const sceneEg = useRef(null);
	const cameraEg = useRef(null);
	const rendererEg = useRef(null);
	const controlsEg = useRef(null);

	const mixer = useRef(null);
	const clock = new THREE.Clock();

	// pose capture sub scene
	const canvasRefSub = useRef(null);
	const sceneSub = useRef(null);
	const cameraSub = useRef(null);
	const rendererSub = useRef(null);
	const controlsSub = useRef(null);
	// subscen size
	const [subsceneWidth, setsubsceneWidth] = useState(0);
	const [subsceneHeight, setsubsceneHeight] = useState(0);
	const subsceneWidthRef = useRef(0);
	const subsceneHeightRef = useRef(0);

	// the width and height in the 3.js world
	const visibleWidthSub = useRef(0);
	const visibleHeightSub = useRef(0);

	// the pose retargetting model instance
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

	const worker = useWorker(createWorker);

	const workerAvailable = useRef(true);
	// record user's training result
	// details refer to `TrainingReport.js`
	const statistics = useRef({});

	const animationFps = 30;

	useEffect(() => {
		/**
		 * create main scene, pose scene, eg scene
		 * load pose detector, models, training list
		 */
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		setsubsceneWidth(documentWidth * 0.3);
		// remember not to use a squared video
		setsubsceneHeight((documentWidth * 0.3 * 480) / 640);

		subsceneWidthRef.current = documentWidth * 0.3;
		subsceneHeightRef.current = (documentWidth * 0.3 * 480) / 640;

		// scene take entire screen
		creatMainScene(documentWidth, documentHeight);
		// sub scene play captured pose
		createSubScene();
		// sub scene play example exercise
		createEgScene();

		animate();

		poseDetector.current = new Pose({
			locateFile: (file) => {
				return process.env.PUBLIC_URL + `/mediapipe/${file}`;
				// return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
			},
		});
		poseDetector.current.setOptions({
			modelComplexity: 2,
			smoothLandmarks: true,
			enableSegmentation: false,
			smoothSegmentation: false,
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5,
		});

		poseDetector.current.onResults(capturePoseCallback);

		poseDetector.current.initialize().then(() => {
			setloadingModel(false)
		});

		Promise.all([
			// poseDetection.createDetector(
			// 	poseDetection.SupportedModels.BlazePose,
			// 	BlazePoseConfig
			// ),
			loadGLTF(process.env.PUBLIC_URL + "/glb/dors-weighted.glb"),
			loadGLTF(process.env.PUBLIC_URL + "/glb/dors-weighted.glb"),
			// loadGLTF(process.env.PUBLIC_URL + "/glb/yundong.glb"),
			// loadGLTF(process.env.PUBLIC_URL + "/glb/girl.glb"),
		]).then(([glb, glbEg]) => {

			// add 3d model to main scene
			mannequinModel.current = glb.scene.children[0];
			mannequinModel.current.position.set(0, -1, 0);

			// store all limbs to `mannequinModel`
			traverseModel(mannequinModel.current, figureParts.current);

			// console.log(Object.keys(figureParts.current));

			scene.current.add(mannequinModel.current);

			// example exercise sub scene
			const modelEg = glbEg.scene.children[0];
			sceneEg.current.add(modelEg);

			modelEg.position.set(0, -1, 0);

			mixer.current = new THREE.AnimationMixer(modelEg);

			setloadingCharacter(false);
		});

		// add silhouette to subscene
		Promise.all(
			Silhouette3D.limbs.map((name) =>
				loadJSON(process.env.PUBLIC_URL + "/t/" + name + ".json")
			)
		).then((results) => {
			const geos = {};

			for (let data of results) {
				geos[data.name] = jsonToBufferGeometry(data);
			}

			silhouette.current = new Silhouette3D(geos);
			const body = silhouette.current.init();

			// getMeshSize(figure.current.foot_l.mesh, scene.current)

			sceneSub.current.add(body);

			setloadingSilhouette(false);
		});

		// we can load training list separately
		// todo, use API for this feature
		Promise.all([
			loadJSON(
				process.env.PUBLIC_URL +
					"/data/basic-training.json?r=" +
					process.env.RANDOM_STRING
			),
		]).then(([training1]) => {
			settrainingList([training1]);

			setloadingTraining(false);
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

		cameraEg.current.aspect = subsceneWidth / subsceneHeight;
		cameraEg.current.updateProjectionMatrix();
		rendererEg.current.setSize(subsceneWidth, subsceneHeight);
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

			// initialize statistics
			// clear the exercise array
			// initialize exercise progress in `initializeExercise`
			// update exercise progres in `applyAnimation`
			statistics.current = cloneDeep(trainingList[selectedTrainingIndx]);

			try {
				// todo, update rest time after each exercise
				resetTime.current = parseInt(
					// trainingList[selectedTrainingIndx].rest
					5
				);
			} catch (e) {
				console.error(e);
			}

			for (const e of trainingList[selectedTrainingIndx].exercises) {
				tasks.push(
					loadJSON(
						process.env.PUBLIC_URL +
							"/data/exercises/" +
							e.key +
							".json"
					)
				);

				tmp_queue.push(e);
			}

			exerciseQueue.current = tmp_queue;

			Promise.all(tasks).then((data) => {
				/**
				 * load exercise animation data
				 * save them to `animationJSONs`
				 * note: training.exercises[i].key must be equal to data[i].name
				 */

				for (const v of data) {
					animationJSONs.current[v.name] = v;
				}

				exerciseQueueIndx.current = 0;

				initializeExercise();

				if (videoRef.current) {
					startCamera(videoRef.current);

					inExercise.current = true;

					// count down loop hook. default 5 seconds

					getReadyCountDown.current = 300;

					setstartBtnShow(false);
					setstopBtnShow(true);
				}
			});
		}
		// eslint-disable-next-line
	}, [selectedTrainingIndx]);

	useEffect(() => {
		/**
		 * user tunning the threshold
		 * it affect how strict user should follow the animation
		 * pearson correlation * 100
		 * default 80,
		 */
		poseSyncThresholdRef.current = poseSyncThreshold;
	}, [poseSyncThreshold]);

	function creatMainScene(viewWidth, viewHeight) {
		/**
		 * main scene, which plays exercise animation
		 * @param {number} viewWidth
		 * @param {number} viewHeight
		 */
		scene.current = new THREE.Scene();
		// scene.current.background = new THREE.Color(0x022244);

		camera.current = new THREE.PerspectiveCamera(
			90,
			viewWidth / viewHeight,
			0.1,
			1000
		);

		camera.current.position.set(0, 0, 2);

		{
			// mimic the sun light
			const dlight = new THREE.PointLight(0xffffff, 0.4);
			dlight.position.set(0, 10, 10);
			scene.current.add(dlight);
			// env light
			scene.current.add(new THREE.AmbientLight(0xffffff, 0.6));
		}

		// drawScene();

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
			alpha: true,
			antialias: true,
		});

		renderer.current.toneMappingExposure = 0.5;

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		controls.current.enablePan = false;
		// controls.current.minPolarAngle = THREE.MathUtils.degToRad(60);
		// controls.current.maxPolarAngle = THREE.MathUtils.degToRad(90);
		controls.current.minDistance = 2;
		controls.current.maxDistance = 1000;
		controls.current.enableDamping = true;

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
		// sceneSub.current.background = new THREE.Color(0x22244);

		cameraSub.current = new THREE.PerspectiveCamera(90, 1, 0.1, 500);

		cameraSub.current.position.set(0, 30, 100);

		/**
		 * visible_height = 2 * tan(camera_fov / 2) * camera_z
		 * visible_width = visible_height * camera_aspect
		 */

		const vFOV = THREE.MathUtils.degToRad(cameraSub.current.fov); // convert vertical fov to radians

		visibleHeightSub.current =
			2 * Math.tan(vFOV / 2) * cameraSub.current.position.z; // visible height

		visibleWidthSub.current =
			visibleHeightSub.current * cameraSub.current.aspect; // visible width

		sceneSub.current.add(new THREE.AmbientLight(0xffffff, 1));

		rendererSub.current = new THREE.WebGLRenderer({
			canvas: canvasRefSub.current,
			alpha: true,
			antialias: true,
		});

		controlsSub.current = new OrbitControls(
			cameraSub.current,
			canvasRefSub.current
		);
	}

	function createEgScene() {
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

		sceneEg.current = new THREE.Scene();

		cameraEg.current = new THREE.PerspectiveCamera(90, 1, 0.1, 500);

		cameraEg.current.position.set(0, 0.3, 1.2);

		{
			// mimic the sun light
			const dlight = new THREE.PointLight(0xffffff, 0.2);
			dlight.position.set(0, 10, 10);
			sceneEg.current.add(dlight);
			// env light
			sceneEg.current.add(new THREE.AmbientLight(0xffffff, 0.8));
		}

		rendererEg.current = new THREE.WebGLRenderer({
			canvas: canvasRefEg.current,
			alpha: true,
			antialias: true,
		});

		controlsEg.current = new OrbitControls(
			cameraEg.current,
			canvasRefEg.current
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

			poseDetector.current.send({ image: videoRef.current });
		} else {
			keypoints3D.current = null;
		}

		if (inExercise.current) {
			counter.current += 1;

			doingTraining();
		}

		/** play animation in example sub scene */
		const delta = clock.getDelta();

		if (mixer.current) mixer.current.update(delta);

		controls.current.update();
		renderer.current.render(scene.current, camera.current);

		controlsSub.current.update();
		rendererSub.current.render(sceneSub.current, cameraSub.current);

		controlsEg.current.update();
		rendererEg.current.render(sceneEg.current, cameraEg.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function capturePoseCallback(result) {
		/**
		 * after get pose results
		 */
		if (
			!result ||
			!result.poseLandmarks ||
			!result.poseWorldLandmarks
		) {
			// keypoints2D.current = null;
			keypoints3D.current = null;
			return;
		}

		keypoints3D.current = cloneDeep(result.poseWorldLandmarks);

		const width_ratio = 30;
		const height_ratio = (width_ratio * 480) / 640;

		// multiply x,y by differnt factor
		for (let v of keypoints3D.current) {
			v["x"] *= -width_ratio;
			v["y"] *= -height_ratio;
			v["z"] *= -width_ratio;
		}

		comparePose();

		manipulateSilhouette();
	
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

			// `diffScore` is a pearson correlation
			// 1 means pose perfectly matched
			setdiffScore(roundToTwo(poseSync.current.diffScore));
		}
	}

	function manipulateSilhouette() {
		/**
		 * apply pose/color to silhouette
		 */
		if (!keypoints3D.current) {
			return;
		}

		// silhouette.current.applyPosition(
		// 	keypoints2D.current,
		// 	subsceneWidthRef.current,
		// 	subsceneHeightRef.current,
		// 	visibleWidthSub.current,
		// 	visibleHeightSub.current
		// );

		silhouette.current.applyPose(keypoints3D.current);

		// pass keypoints3d data to web worker,
		// so it can analysis the user's kinematics data
		// decide its amplitude, speed
		if (workerAvailable.current) {
			workerAvailable.current = false;

			worker
				.analyzePose(keypoints3D.current, currentAnimationIndx.current)
				.then((angleBetweenLimbs) => {
					const colors = {};

					for (let name in angleBetweenLimbs) {
						colors[name] = radianGradientColor(
							angleBetweenLimbs[name]
						);
					}

					// record the error rate for statistics
					statistics.current.exercises[
						exerciseQueueIndx.current
					].total_compared_frame += 1;

					for (let name in angleBetweenLimbs) {
						statistics.current.exercises[
							exerciseQueueIndx.current
						].error_angles[name] += angleBetweenLimbs[name];
					}

					// apply color to silhouette
					// passed key parts limbs to `applyColor`,
					// only change the color of the key parts
					silhouette.current.applyColor(
						colors,
						animationJSONs.current[
							exerciseQueue.current[exerciseQueueIndx.current].key
						].key_parts || [
							"LeftArm",
							"RightArm",
							"LeftForeArm",
							"RightForeArm",
						]
					);

					workerAvailable.current = true;
				});
		}
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
		if (counter.current % Math.round(60 / animationFps) === 0) {
			applyAnimation();
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
			exerciseQueue.current[exerciseQueueIndx.current].reps
		);

		const animation_data =
			animationJSONs.current[
				exerciseQueue.current[exerciseQueueIndx.current].key
			];

		// initialize statistics for exercise
		Object.assign(statistics.current.exercises[exerciseQueueIndx.current], {
			error_angles: {
				chest: 0,
				LeftArm: 0,
				LeftForeArm: 0,
				RightArm: 0,
				RightForeArm: 0,
				abdominal: 0,
				leftThigh: 0,
				leftCalf: 0,
				rightThigh: 0,
				rightCalf: 0,
			},
			unfollowed: 0,
			start_time: Date.now(),
			end_time: 0,
			total_compared_frame: 0,
		});

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

		mixer.current.stopAllAction();

		// prepare the example exercise action
		const action = mixer.current.clipAction(
			THREE.AnimationClip.parse(animation_data)
		);

		action.reset();
		action.setLoop(THREE.LoopRepeat);

		// keep model at the position where it stops
		action.clampWhenFinished = true;

		action.enable = true;

		action.play();
		// prepare the example exercise action

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

			if (poseCompareResult.current) {
				if (poseCompareResult.current instanceof Number) {
					currentAnimationIndx.current = poseCompareResult.current;
				}

				applyTransfer(
					figureParts.current,
					animationJSONs.current[
						exerciseQueue.current[exerciseQueueIndx.current].key
					].tracks,
					currentAnimationIndx.current
				);

				currentAnimationIndx.current += 1;
			} else if (poseCompareResult.current === false) {
				// compare failed, pause animation

				// accumulte unfolloed time by miliseconds
				statistics.current.exercises[
					exerciseQueueIndx.current
				].unfollowed += 1000 / animationFps;
			}
		} else {
			// the current animation finished

			statistics.current.exercises[exerciseQueueIndx.current].end_time =
				Date.now();

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
					// console.log(statistics.current);

					window.localStorage.setItem(
						"statistics",
						JSON.stringify(statistics.current)
					);
				}
			}
		}
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
			></video>

			<canvas ref={canvasRef} />

			<div className="info">
				{/* example exercise sub scene */}
				<div
					className="sub-scene"
					style={{
						width: subsceneWidth + "px",
						height: subsceneHeight + "px",
						marginLeft: (subsceneWidth * -1) / 6 + "px",
					}}
				>
					<canvas ref={canvasRefEg}></canvas>
				</div>

				{/* captured pose retargetting to a simple model */}
				<div
					className="sub-scene"
					style={{
						width: subsceneWidth + "px",
						height: subsceneHeight + "px",
						marginLeft: (subsceneWidth * -1) / 6 + "px",
					}}
				>
					<canvas ref={canvasRefSub}></canvas>
				</div>

				{/* on going exercise info */}
				<div className="exercise-info">
					{currentExerciseName && (
						<div>
							<span>{currentExerciseName}</span>
							{currentExerciseRemainRound && (
								<span style={{ marginLeft: "20px" }}>
									{currentExerciseRemainRound}
								</span>
							)}
						</div>
					)}
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
					<ul>
						{trainingList &&
							trainingList.map((item, i) => {
								return (
									<li
										className="clickable"
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
				<div style={{ marginBottom: "40px" }}>
					{startBtnShow && (
						<Button
							variant="primary"
							onClick={() => {
								// if (videoRef.current) {
								// startCamera(videoRef.current);

								inExercise.current = true;

								// // count down loop hook. default 5 seconds

								// getReadyCountDown.current = 300;

								setstartBtnShow(false);
								setstopBtnShow(true);
								// }
							}}
						>
							Continue
						</Button>
					)}
					{stopBtnShow && (
						<Button
							variant="secondary"
							onClick={() => {
								// if (videoRef.current) {
								// 	videoRef.current.srcObject = null;
								// }

								inExercise.current = false;

								setstartBtnShow(true);
								setstopBtnShow(false);
							}}
						>
							Pause
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
							defaultValue={[0, poseSyncThreshold]}
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

			{/* countdown, at the center of screen */}
			{counterNumber >= 0 && <Counter number={counterNumber} />}

			{/* when training finished, at the center of screen */}
			{showCompleted && (
				<div className="congratulations">
					Congratulations, check <a href="/training-report">result</a>
				</div>
			)}

			{(loadingModel || loadingCharacter || loadingSilhouette || loadingTraining) && (
				<div className="mask">
					{loadingModel && (
						<div>
							<span>Loading Model....</span>
						</div>
					)}
					{loadingCharacter && (
						<div>
							<span>Loading Character....</span>
						</div>
					)}
					{loadingSilhouette && (
						<div>
							<span>Loading Silhouette...</span>.
						</div>
					)}
					{loadingTraining && (
						<div>
							<span>Loading Training Data....</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
