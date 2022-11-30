import { useEffect, useRef } from "react";

import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import {
	POSE_CONNECTIONS,
	FACEMESH_TESSELATION,
	HAND_CONNECTIONS,
} from "@mediapipe/holistic";
import { getUserMedia } from "../components/ropes";

export default function HolisticCamera() {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	// const animationCounter = useRef(1);
	// const animationframe = useRef(0);

	const camera = useRef(null);

	// const tmpcounter = useRef(0);

	useEffect(() => {
		//

		// console.log(Holistic);

		return () => {};
	}, []);

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

			const camera = new Camera(videoRef.current, {
				onFrame: async () => {
					await holistic.send({ image: videoRef.current });
				},
				width: 640,
				height: 360,
			});

			camera.start();
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
		console.log(poselm, facelm, lefthandlm, righthandlm);

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

	function stopCamera() {
		if (camera.current) {
			camera.current.stop();

			console.info("Camera stopped");
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
		<div>
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


const lefthandlm = [
    {
        "x": 0.5723863840103149,
        "y": 0.9665037989616394,
        "z": 6.636845739649289e-8
    },
    {
        "x": 0.5408681631088257,
        "y": 0.9392315745353699,
        "z": -0.005091790575534105
    },
    {
        "x": 0.517747700214386,
        "y": 0.8851165771484375,
        "z": -0.007296680938452482
    },
    {
        "x": 0.5044344663619995,
        "y": 0.8445139527320862,
        "z": -0.010430090129375458
    },
    {
        "x": 0.4916757047176361,
        "y": 0.8109755516052246,
        "z": -0.013278643600642681
    },
    {
        "x": 0.537100076675415,
        "y": 0.8100472092628479,
        "z": 0.002851292956620455
    },
    {
        "x": 0.5288308262825012,
        "y": 0.7589393258094788,
        "z": -0.005642327945679426
    },
    {
        "x": 0.5170879364013672,
        "y": 0.7354740500450134,
        "z": -0.014637185260653496
    },
    {
        "x": 0.5036167502403259,
        "y": 0.7170008420944214,
        "z": -0.021210772916674614
    },
    {
        "x": 0.5512286424636841,
        "y": 0.805803120136261,
        "z": -0.0018707329872995615
    },
    {
        "x": 0.5462956428527832,
        "y": 0.7432255148887634,
        "z": -0.007806133478879929
    },
    {
        "x": 0.5384362936019897,
        "y": 0.7064039707183838,
        "z": -0.015206896699965
    },
    {
        "x": 0.5291951894760132,
        "y": 0.6755837798118591,
        "z": -0.021166948601603508
    },
    {
        "x": 0.5650790333747864,
        "y": 0.8149756193161011,
        "z": -0.00873191375285387
    },
    {
        "x": 0.5624263882637024,
        "y": 0.7538955807685852,
        "z": -0.015360279940068722
    },
    {
        "x": 0.5543982982635498,
        "y": 0.7185500264167786,
        "z": -0.02170379087328911
    },
    {
        "x": 0.5442924499511719,
        "y": 0.6882754564285278,
        "z": -0.026732584461569786
    },
    {
        "x": 0.5784788131713867,
        "y": 0.834565281867981,
        "z": -0.01648874580860138
    },
    {
        "x": 0.5787487030029297,
        "y": 0.7866159677505493,
        "z": -0.022941814735531807
    },
    {
        "x": 0.5738409757614136,
        "y": 0.7553663849830627,
        "z": -0.026951704174280167
    },
    {
        "x": 0.5671033263206482,
        "y": 0.7266560792922974,
        "z": -0.030216585844755173
    }
];

const righthandlm = [
    {
        "x": 0.404172420501709,
        "y": 0.9877687692642212,
        "z": 2.061942012687723e-7
    },
    {
        "x": 0.4384447932243347,
        "y": 0.9618823528289795,
        "z": -0.008087246678769588
    },
    {
        "x": 0.4620797038078308,
        "y": 0.9149706363677979,
        "z": -0.009450509212911129
    },
    {
        "x": 0.47587406635284424,
        "y": 0.8777261972427368,
        "z": -0.011470964178442955
    },
    {
        "x": 0.48419785499572754,
        "y": 0.847322940826416,
        "z": -0.013154675252735615
    },
    {
        "x": 0.44107767939567566,
        "y": 0.8341644406318665,
        "z": 0.003321256721392274
    },
    {
        "x": 0.45253631472587585,
        "y": 0.7820676565170288,
        "z": -0.003402726724743843
    },
    {
        "x": 0.4616239666938782,
        "y": 0.7542760372161865,
        "z": -0.011003869585692883
    },
    {
        "x": 0.4712510406970978,
        "y": 0.7316635847091675,
        "z": -0.016467783600091934
    },
    {
        "x": 0.4231228232383728,
        "y": 0.8280132412910461,
        "z": 0.0012811144115403295
    },
    {
        "x": 0.4279685616493225,
        "y": 0.7704838514328003,
        "z": -0.0037068810779601336
    },
    {
        "x": 0.43512675166130066,
        "y": 0.7372598052024841,
        "z": -0.010292365215718746
    },
    {
        "x": 0.4438149929046631,
        "y": 0.7110890746116638,
        "z": -0.015392382629215717
    },
    {
        "x": 0.40598049759864807,
        "y": 0.835151195526123,
        "z": -0.0030849941540509462
    },
    {
        "x": 0.40886804461479187,
        "y": 0.781072735786438,
        "z": -0.009097473695874214
    },
    {
        "x": 0.41606876254081726,
        "y": 0.7499457001686096,
        "z": -0.014001961797475815
    },
    {
        "x": 0.4252933859825134,
        "y": 0.7246637940406799,
        "z": -0.017434561625123024
    },
    {
        "x": 0.38838762044906616,
        "y": 0.8536052107810974,
        "z": -0.00877702608704567
    },
    {
        "x": 0.38905370235443115,
        "y": 0.8101987242698669,
        "z": -0.015153404325246811
    },
    {
        "x": 0.39250752329826355,
        "y": 0.7807997465133667,
        "z": -0.018032006919384003
    },
    {
        "x": 0.39816951751708984,
        "y": 0.754411518573761,
        "z": -0.019726581871509552
    }
]


/**
 * LeftHandThumb1 [Bone]"
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
