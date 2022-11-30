import { useEffect, useRef } from "react";
import * as THREE from "three";
import { POSE_LANDMARKS } from "@mediapipe/pose";

import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import {
	POSE_CONNECTIONS,
	FACEMESH_TESSELATION,
	HAND_CONNECTIONS,
} from "@mediapipe/holistic";
import {
	loadGLTF,
	posePointsToVector,
	getUserMedia,
} from "../components/ropes";

export default function HolisticCamera(props) {
	const { scene, renderer, camera } = props;

	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const webcamera = useRef(null);

	const eulerOrder = "XZY";

	const BodyParts = useRef({
		Hips: null,
		Spine: null,
		Spine1: null,
		Spine2: null,
		Neck: null,
		Head: null,
		LeftShoulder: null,
		LeftArm: null,
		LeftForeArm: null,
		LeftHand: null,
		RightShoulder: null,
		RightArm: null,
		RightForeArm: null,
		RightHand: null,
		LeftUpLeg: null,
		LeftLeg: null,
		LeftFoot: null,
		RightUpLeg: null,
		RightLeg: null,
		RightFoot: null,
	});

	useEffect(() => {
		loadGLTF(process.env.PUBLIC_URL + "/models/my.glb").then((gltf) => {
			const avatar = gltf.scene.children[0];

			travelModel(avatar);

			avatar.position.set(0, 0, 0);

			scene.current.add(avatar);

			makePose(poselm);

			renderer.current.render(scene.current, camera.current);
		});
		// eslint-disable-next-line
	}, []);

	/**
	 * save reference for different body parts
	 * @param {*} model
	 */
	function travelModel(model) {
		for (let name in BodyParts.current) {
			if (name === model.name) {
				BodyParts.current[name] = model;
			}
		}

		model.children.forEach((child) => {
			// console.log(child)
			travelModel(child);
		});
	}

	function startCamera() {
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

			const holistic = new Holistic({
				locateFile: (file) => {
					return (
						process.env.PUBLIC_URL + `/mediapipe/holistic/${file}`
					);
					// return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
				},
			});

			holistic.setOptions({
				// STATIC_IMAGE_MODE
				staticImageMode: false,
				// 0, 1 or 2. Landmark accuracy as well as inference latency generally go up with the model complexity. Default to 1.
				modelComplexity: 1,
				// If set to true, the solution filters pose landmarks across different input images to reduce jitter.
				smoothLandmarks: true,
				// If set to true, in addition to the pose, face and hand landmarks the solution also generates the segmentation mask.
				enableSegmentation: false,
				// If set to true, the solution filters segmentation masks across different input images to reduce jitter.
				// smoothSegmentation: true,
				// Whether to further refine the landmark coordinates around the eyes and lips, and output additional landmarks around the irises
				refineFaceLandmarks: true,
				// Minimum confidence value ([0.0, 1.0]) from the person-detection model for the detection to be considered successful.
				minDetectionConfidence: 0.5,
				// Minimum confidence value ([0.0, 1.0]) from the landmark-tracking model for the pose landmarks to be considered tracked successfully,
				// or otherwise person detection will be invoked automatically on the next input image.
				// Setting it to a higher value can increase robustness of the solution, at the expense of a higher latency.
				minTrackingConfidence: 0.5,
			});

			holistic.onResults(onHolisticResults);

			holistic.initialize().then(() => {
				console.info("Loaded holistic model");
			});

			webcamera.current = new Camera(videoRef.current, {
				onFrame: async () => {
					await holistic.send({ image: videoRef.current });
				},
				width: 640,
				height: 360,
			});

			webcamera.current.start();
		}
	}

	function onHolisticResults(results) {
		const poselm = results.poseLandmarks;
		const facelm = results.faceLandmarks;
		const lefthandlm = results.leftHandLandmarks;
		const righthandlm = results.rightHandLandmarks;

		/**
		 * todo save these data to file
		 * consider store in localstorage first
		 * then save it to .npy file in static storage, such as OSS, S3
		 *
		 * note that, these landmarks are relative to the image size
		 */
		// console.log(poselm, facelm, lefthandlm, righthandlm);
		// console.log(poselm);

		// moveSpine(results.poseLandmarks);

		// moveArmHand(results.poseLandmarks, "Left");
		// moveArmHand(results.poseLandmarks, "Right");

		renderer.current.render(scene.current, camera.current);

		const canvasCtx = canvasRef.current.getContext("2d");
		canvasCtx.save();
		canvasCtx.clearRect(
			0,
			0,
			canvasRef.current.width,
			canvasRef.current.height
		);

		canvasCtx.globalCompositeOperation = "source-over";
		drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
			color: "#00FF00",
			lineWidth: 4,
		});
		drawLandmarks(canvasCtx, results.poseLandmarks, {
			color: "#FF0000",
			lineWidth: 2,
		});
		drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
			color: "#C0C0C070",
			lineWidth: 1,
		});
		drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
			color: "#CC0000",
			lineWidth: 5,
		});
		drawLandmarks(canvasCtx, results.leftHandLandmarks, {
			color: "#00FF00",
			lineWidth: 2,
		});
		drawConnectors(
			canvasCtx,
			results.rightHandLandmarks,
			HAND_CONNECTIONS,
			{ color: "#00CC00", lineWidth: 5 }
		);
		drawLandmarks(canvasCtx, results.rightHandLandmarks, {
			color: "#FF0000",
			lineWidth: 2,
		});
		canvasCtx.restore();
	}

	function makePose(data) {
		console.log(data);

		moveArmHand(data, "Left");
		moveArmHand(data, "Right");
	}

	function moveSpine(data) {
		if (!data) {
			return;
		}

		const v01 = new THREE.Vector3(-1, 0, 0);
		const v02 = new THREE.Vector3(0.2, 1, 0).normalize();

		const cross01 = new THREE.Vector3().crossVectors(v01, v02).normalize();
		const cross02 = new THREE.Vector3()
			.crossVectors(cross01, v01)
			.normalize();

		const vt1 = posePointsToVector(
			data[POSE_LANDMARKS["LEFT_HIP"]],
			data[POSE_LANDMARKS["RIGHT_HIP"]]
		).normalize();
		const vt2 = posePointsToVector(
			data[POSE_LANDMARKS["RIGHT_SHOULDER"]],
			data[POSE_LANDMARKS["RIGHT_HIP"]]
		).normalize();

		const cross11 = new THREE.Vector3().crossVectors(vt1, vt2).normalize();
		const cross12 = new THREE.Vector3()
			.crossVectors(cross11, vt1)
			.normalize();

		const SE0 = new THREE.Matrix4().makeBasis(v01, cross01, cross02);
		const SE1 = new THREE.Matrix4().makeBasis(vt1, cross11, cross12);

		const q_local = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

		// const q_existing = BodyParts.current[bodypart_name].quaternion.clone();
		// // eliminate the existing rotation
		// q_local.multiply(q_existing.conjugate());

		// BodyParts.current[bodypart_name].applyQuaternion(q_local);

		const e_local = new THREE.Euler().setFromQuaternion(
			q_local,
			eulerOrder
		);

		BodyParts.current["Hips"].rotation.set(
			e_local.x,
			e_local.y,
			e_local.z,
			eulerOrder
		);
	}

	function moveArmHand(data, side = "Right") {
		if (!data) {
			return;
		}

		let data_side = "LEFT_";

		if (side === "Left") {
			data_side = "RIGHT_";
		}

		const v_arm_world = posePointsToVector(
			data[POSE_LANDMARKS[data_side + "ELBOW"]],
			data[POSE_LANDMARKS[data_side + "SHOULDER"]]
		).normalize();

		const q_shoulder_world = new THREE.Quaternion();

		BodyParts.current[side + "Shoulder"].getWorldQuaternion(
			q_shoulder_world
		);

		const v_arm_local = v_arm_world
			.clone()
			.applyQuaternion(q_shoulder_world.conjugate());

		const q_arm_local = new THREE.Quaternion().setFromUnitVectors(
			new THREE.Vector3(0, 1, 0),
			v_arm_local
		);

		// const q_existing = BodyParts.current[bodypart_name].quaternion.clone();
		// // eliminate the existing rotation
		// q_local.multiply(q_existing.conjugate());

		// BodyParts.current[bodypart_name].applyQuaternion(q_local);

		const e_arm_local = new THREE.Euler().setFromQuaternion(
			q_arm_local,
			eulerOrder
		);

		if (side === "Left") {
			// console.log(v_arm_local);
			e_arm_local.y = Math.PI;
		} else {
			// console.log(v_arm_local);
			e_arm_local.y = Math.PI;
		}

		BodyParts.current[side + "Arm"].rotation.set(
			e_arm_local.x,
			e_arm_local.y,
			e_arm_local.z,
			eulerOrder
		);

		// start forarm
		const v_forearm_world = posePointsToVector(
			data[POSE_LANDMARKS[data_side + "WRIST"]],
			data[POSE_LANDMARKS[data_side + "ELBOW"]]
		).normalize();

		const q_arm_world = new THREE.Quaternion();

		// Arm is the parent of ForeArm
		BodyParts.current[side + "Arm"].getWorldQuaternion(q_arm_world);

		const v_forearm_local = v_forearm_world
			.clone()
			.applyQuaternion(q_arm_world.conjugate());

		const q_forearm_local = new THREE.Quaternion().setFromUnitVectors(
			new THREE.Vector3(0, 1, 0),
			v_forearm_local
		);

		const e_forearm_local = new THREE.Euler().setFromQuaternion(
			q_forearm_local,
			eulerOrder
		);

		if (side === "Left") {
			// console.log(v_forearm_local);
			e_forearm_local.y = Math.PI;
		} else {
			// console.log(v_forearm_local);
			e_forearm_local.y = Math.PI;
		}

		BodyParts.current[side + "ForeArm"].rotation.set(
			e_forearm_local.x,
			e_forearm_local.y,
			e_forearm_local.z,
			eulerOrder
		);
	}

	function moveFingers(data, side = "Right") {}

	function stopCamera() {
		if (webcamera.current) {
			webcamera.current.stop();
		}
	}

	// function sendPesudoMsg() {
	// 	if (animationCounter.current % 1 === 0) {
	// 		ws.current.send(Date.now());
	// 	}

	// 	animationCounter.current += 1;

	// 	animationframe.current = requestAnimationFrame(sendPesudoMsg);
	// }

	// function stopPesudoMsg() {
	// 	cancelAnimationFrame(animationframe.current);
	// 	animationCounter.current = 0;
	// 	ws.current.send("stopped pesudo data");

	// 	// ws.current.close()
	// }

	return (
		<div
			style={{
				position: "absolute",
				bottom: 0,
				right: 0,
			}}
		>
			<div className="web-camera">
				<video
					ref={videoRef}
					autoPlay={true}
					style={{ display: "none" }}
				></video>
				<canvas ref={canvasRef} width="640px" height="360px"></canvas>
			</div>
			<div className="btn-box">
				<button onClick={startCamera}>Start camera</button>
				<button onClick={stopCamera}>Stop camera</button>
			</div>
		</div>
	);
}

const poselm = [
	{
		x: 0.48748764395713806,
		y: 0.5189810991287231,
		z: -0.46602216362953186,
		visibility: 0.9998611807823181,
	},
	{
		x: 0.5007025003433228,
		y: 0.43768247961997986,
		z: -0.4119977355003357,
		visibility: 0.9996366500854492,
	},
	{
		x: 0.5178831219673157,
		y: 0.4318627715110779,
		z: -0.4119836390018463,
		visibility: 0.9996059536933899,
	},
	{
		x: 0.5370612740516663,
		y: 0.42692363262176514,
		z: -0.41166502237319946,
		visibility: 0.9996051788330078,
	},
	{
		x: 0.4614516794681549,
		y: 0.45404696464538574,
		z: -0.3758046329021454,
		visibility: 0.999697208404541,
	},
	{
		x: 0.4499537944793701,
		y: 0.45845505595207214,
		z: -0.37582090497016907,
		visibility: 0.9996630549430847,
	},
	{
		x: 0.44038429856300354,
		y: 0.4617271423339844,
		z: -0.376493901014328,
		visibility: 0.9997468590736389,
	},
	{
		x: 0.5692636370658875,
		y: 0.43466851115226746,
		z: -0.12892486155033112,
		visibility: 0.9996766448020935,
	},
	{
		x: 0.4380839467048645,
		y: 0.47097188234329224,
		z: 0.07029492408037186,
		visibility: 0.9997905492782593,
	},
	{
		x: 0.5320227742195129,
		y: 0.5867873430252075,
		z: -0.3624423146247864,
		visibility: 0.9991102814674377,
	},
	{
		x: 0.477703720331192,
		y: 0.5960112810134888,
		z: -0.30751264095306396,
		visibility: 0.9992990493774414,
	},
	{
		x: 0.7326981425285339,
		y: 0.6600627899169922,
		z: -0.18321461975574493,
		visibility: 0.9923861026763916,
	},
	{
		x: 0.3513681888580322,
		y: 0.8406913876533508,
		z: 0.2527749240398407,
		visibility: 0.9963597059249878,
	},
	{
		x: 0.7227632403373718,
		y: 0.46037259697914124,
		z: -0.7023729085922241,
		visibility: 0.9408493638038635,
	},
	{
		x: 0.05587930232286453,
		y: 0.9464779496192932,
		z: -0.1844911426305771,
		visibility: 0.9746144413948059,
	},
	{
		x: 0.3866499066352844,
		y: 0.10039088875055313,
		z: -0.8680938482284546,
		visibility: 0.9727710485458374,
	},
	{
		x: 0.08949768543243408,
		y: 0.4483303129673004,
		z: -0.7982174158096313,
		visibility: 0.9608984589576721,
	},
	{
		x: 0.302516371011734,
		y: 0.03998487442731857,
		z: -0.976551353931427,
		visibility: 0.9366200566291809,
	},
	{
		x: 0.0864519402384758,
		y: 0.27830225229263306,
		z: -0.9624414443969727,
		visibility: 0.9180031418800354,
	},
	{
		x: 0.28449130058288574,
		y: 0.0368240550160408,
		z: -0.8801546096801758,
		visibility: 0.9397563338279724,
	},
	{
		x: 0.12025107443332672,
		y: 0.22820428013801575,
		z: -0.8461493253707886,
		visibility: 0.9275113344192505,
	},
	{
		x: 0.303499698638916,
		y: 0.09375861287117004,
		z: -0.8503759503364563,
		visibility: 0.9384862780570984,
	},
	{
		x: 0.13599908351898193,
		y: 0.2839871644973755,
		z: -0.7902770638465881,
		visibility: 0.926669180393219,
	},
	{
		x: 0.680094838142395,
		y: 1.7452681064605713,
		z: -0.12694266438484192,
		visibility: 0.0118101192638278,
	},
	{
		x: 0.3874434232711792,
		y: 1.7509673833847046,
		z: 0.1309170424938202,
		visibility: 0.015266922302544117,
	},
	{
		x: 0.6674596667289734,
		y: 2.582738161087036,
		z: -0.060109883546829224,
		visibility: 0.005136352963745594,
	},
	{
		x: 0.4165054261684418,
		y: 2.5982561111450195,
		z: 0.24428002536296844,
		visibility: 0.0025064132642000914,
	},
	{
		x: 0.6860626935958862,
		y: 3.3319997787475586,
		z: 0.5175488591194153,
		visibility: 0.00018077624554280192,
	},
	{
		x: 0.43344396352767944,
		y: 3.3666605949401855,
		z: 0.48295122385025024,
		visibility: 0.000055940206948434934,
	},
	{
		x: 0.704645037651062,
		y: 3.4418535232543945,
		z: 0.548673689365387,
		visibility: 0.0001782920880941674,
	},
	{
		x: 0.43994036316871643,
		y: 3.4714555740356445,
		z: 0.5020714402198792,
		visibility: 0.00010388283408246934,
	},
	{
		x: 0.6229224801063538,
		y: 3.5713236331939697,
		z: -0.011443795636296272,
		visibility: 0.00029019737849012017,
	},
	{
		x: 0.45041751861572266,
		y: 3.6361453533172607,
		z: -0.12149615585803986,
		visibility: 0.00022989793797023594,
	},
];

const lefthandlm = [
	{
		x: 0.5723863840103149,
		y: 0.9665037989616394,
		z: 6.636845739649289e-8,
	},
	{
		x: 0.5408681631088257,
		y: 0.9392315745353699,
		z: -0.005091790575534105,
	},
	{
		x: 0.517747700214386,
		y: 0.8851165771484375,
		z: -0.007296680938452482,
	},
	{
		x: 0.5044344663619995,
		y: 0.8445139527320862,
		z: -0.010430090129375458,
	},
	{
		x: 0.4916757047176361,
		y: 0.8109755516052246,
		z: -0.013278643600642681,
	},
	{
		x: 0.537100076675415,
		y: 0.8100472092628479,
		z: 0.002851292956620455,
	},
	{
		x: 0.5288308262825012,
		y: 0.7589393258094788,
		z: -0.005642327945679426,
	},
	{
		x: 0.5170879364013672,
		y: 0.7354740500450134,
		z: -0.014637185260653496,
	},
	{
		x: 0.5036167502403259,
		y: 0.7170008420944214,
		z: -0.021210772916674614,
	},
	{
		x: 0.5512286424636841,
		y: 0.805803120136261,
		z: -0.0018707329872995615,
	},
	{
		x: 0.5462956428527832,
		y: 0.7432255148887634,
		z: -0.007806133478879929,
	},
	{
		x: 0.5384362936019897,
		y: 0.7064039707183838,
		z: -0.015206896699965,
	},
	{
		x: 0.5291951894760132,
		y: 0.6755837798118591,
		z: -0.021166948601603508,
	},
	{
		x: 0.5650790333747864,
		y: 0.8149756193161011,
		z: -0.00873191375285387,
	},
	{
		x: 0.5624263882637024,
		y: 0.7538955807685852,
		z: -0.015360279940068722,
	},
	{
		x: 0.5543982982635498,
		y: 0.7185500264167786,
		z: -0.02170379087328911,
	},
	{
		x: 0.5442924499511719,
		y: 0.6882754564285278,
		z: -0.026732584461569786,
	},
	{
		x: 0.5784788131713867,
		y: 0.834565281867981,
		z: -0.01648874580860138,
	},
	{
		x: 0.5787487030029297,
		y: 0.7866159677505493,
		z: -0.022941814735531807,
	},
	{
		x: 0.5738409757614136,
		y: 0.7553663849830627,
		z: -0.026951704174280167,
	},
	{
		x: 0.5671033263206482,
		y: 0.7266560792922974,
		z: -0.030216585844755173,
	},
];

const righthandlm = [
	{
		x: 0.404172420501709,
		y: 0.9877687692642212,
		z: 2.061942012687723e-7,
	},
	{
		x: 0.4384447932243347,
		y: 0.9618823528289795,
		z: -0.008087246678769588,
	},
	{
		x: 0.4620797038078308,
		y: 0.9149706363677979,
		z: -0.009450509212911129,
	},
	{
		x: 0.47587406635284424,
		y: 0.8777261972427368,
		z: -0.011470964178442955,
	},
	{
		x: 0.48419785499572754,
		y: 0.847322940826416,
		z: -0.013154675252735615,
	},
	{
		x: 0.44107767939567566,
		y: 0.8341644406318665,
		z: 0.003321256721392274,
	},
	{
		x: 0.45253631472587585,
		y: 0.7820676565170288,
		z: -0.003402726724743843,
	},
	{
		x: 0.4616239666938782,
		y: 0.7542760372161865,
		z: -0.011003869585692883,
	},
	{
		x: 0.4712510406970978,
		y: 0.7316635847091675,
		z: -0.016467783600091934,
	},
	{
		x: 0.4231228232383728,
		y: 0.8280132412910461,
		z: 0.0012811144115403295,
	},
	{
		x: 0.4279685616493225,
		y: 0.7704838514328003,
		z: -0.0037068810779601336,
	},
	{
		x: 0.43512675166130066,
		y: 0.7372598052024841,
		z: -0.010292365215718746,
	},
	{
		x: 0.4438149929046631,
		y: 0.7110890746116638,
		z: -0.015392382629215717,
	},
	{
		x: 0.40598049759864807,
		y: 0.835151195526123,
		z: -0.0030849941540509462,
	},
	{
		x: 0.40886804461479187,
		y: 0.781072735786438,
		z: -0.009097473695874214,
	},
	{
		x: 0.41606876254081726,
		y: 0.7499457001686096,
		z: -0.014001961797475815,
	},
	{
		x: 0.4252933859825134,
		y: 0.7246637940406799,
		z: -0.017434561625123024,
	},
	{
		x: 0.38838762044906616,
		y: 0.8536052107810974,
		z: -0.00877702608704567,
	},
	{
		x: 0.38905370235443115,
		y: 0.8101987242698669,
		z: -0.015153404325246811,
	},
	{
		x: 0.39250752329826355,
		y: 0.7807997465133667,
		z: -0.018032006919384003,
	},
	{
		x: 0.39816951751708984,
		y: 0.754411518573761,
		z: -0.019726581871509552,
	},
];

/**
"  │ │     │       ├─LeftHandThumb1 [Bone]"
"  │ │     │       │ └─LeftHandThumb2 [Bone]"
"  │ │     │       │   └─LeftHandThumb3 [Bone]"
"  │ │     │       │     └─LeftHandThumb4 [Bone]"
"  │ │     │       ├─LeftHandIndex1 [Bone]"
"  │ │     │       │ └─LeftHandIndex2 [Bone]"
"  │ │     │       │   └─LeftHandIndex3 [Bone]"
"  │ │     │       │     └─LeftHandIndex4 [Bone]"
"  │ │     │       ├─LeftHandMiddle1 [Bone]"
"  │ │     │       │ └─LeftHandMiddle2 [Bone]"
"  │ │     │       │   └─LeftHandMiddle3 [Bone]"
"  │ │     │       │     └─LeftHandMiddle4 [Bone]"
"  │ │     │       ├─LeftHandRing1 [Bone]"
"  │ │     │       │ └─LeftHandRing2 [Bone]"
"  │ │     │       │   └─LeftHandRing3 [Bone]"
"  │ │     │       │     └─LeftHandRing4 [Bone]"
"  │ │     │       └─LeftHandPinky1 [Bone]"
"  │ │     │         └─LeftHandPinky2 [Bone]"
"  │ │     │           └─LeftHandPinky3 [Bone]"
"  │ │     │             └─LeftHandPinky4 [Bone]"
 */
