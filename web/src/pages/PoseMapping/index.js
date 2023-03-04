import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Button from "react-bootstrap/Button";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { PoseSolver } from "../../kalido/PoseSolver";
import { cloneDeep } from "lodash";

import SubThreeJsScene from "../../components/SubThreeJsScene";
import {
	BlazePoseConfig,
	drawPoseKeypoints,
	traverseModel,
	startCamera,
	loadFBX,
	loadJSON,
	BlazePoseKeypoints,
} from "../../components/ropes";

/**
 * https://nimb.ws/YdEVQT
 * @returns
 */

export default function PoseMapping() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const animationPointer = useRef(0);

	const bones = useRef({});
	// const fbxmodel = useRef(null);

	// ========= captured pose logic
	const [capturedPose, setcapturedPose] = useState();
	const capturedPoseRef = useRef(0);
	const storedPose = useRef([]);
	const [playPose, setPlayPose] = useState(false);
	const playPoseRef = useRef(false);
	const counter = useRef(0);
	// ========= captured pose logic

	const poseDetector = useRef(null);

	const videoRef = useRef(null);
	// NOTE: we must give a width/height ratio not close to 1, otherwise there will be wired behaviors
	const [subsceneWidth, setsubsceneWidth] = useState(334);
	const [subsceneHeight, setsubsceneHeight] = useState(250);

	const [startBtnShow, setstartBtnShow] = useState(true);
	const [stopBtnShow, setstopBtnShow] = useState(false);

	useEffect(() => {
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		setsubsceneWidth(documentWidth * 0.25);
		setsubsceneHeight((documentWidth * 0.25 * 480) / 640);

		mainScene(documentWidth, documentHeight);

		Promise.all([
			poseDetection.createDetector(
				poseDetection.SupportedModels.BlazePose,
				BlazePoseConfig
			),
			loadFBX(process.env.PUBLIC_URL + "/fbx/XBot.fbx"),
			loadJSON(
				process.env.PUBLIC_URL + "/posejson/wlm1500-1600.npy.json"
			),
		]).then(([detector, model, pose3d]) => {
			poseDetector.current = detector;

			model.position.set(0, 0, 0);

			traverseModel(model, bones.current);

			scene.current.add(model);

			storedPose.current = pose3d;

			console.log(bones.current);
		});

		animate();

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};
	}, []);

	useEffect(() => {
		playPoseRef.current = playPose;
	}, [playPose]);

	function animate() {
		// ========= captured pose logic
		if (
			counter.current % 3 === 0 &&
			storedPose.current &&
			storedPose.current.length &&
			playPoseRef.current
		) {
			const limbsRotation = PoseSolver.solve(
				cloneDeep(storedPose.current[capturedPoseRef.current]),
				cloneDeep(storedPose.current[capturedPoseRef.current]),
				{ imageSize: { width: 640, height: 480 }, runtime: "tfjs" }
			);

			// console.log(limbsRotation);

			applyRotation("mixamorigLeftArm", limbsRotation["LeftUpperArm"]);
			applyRotation(
				"mixamorigLeftForeArm",
				limbsRotation["LeftLowerArm"]
			);

			applyRotation("mixamorigRightArm", limbsRotation["RightUpperArm"]);
			applyRotation(
				"mixamorigRightForeArm",
				limbsRotation["RightLowerArm"]
			);

			const drawdata = [];

			for (let i in storedPose.current[capturedPoseRef.current]) {
				drawdata[i] = Object.assign(
					{ name: BlazePoseKeypoints[i].toLowerCase() },
					storedPose.current[capturedPoseRef.current][i]
				);
			}

			// for (let i in BlazePoseKeypoints) {
			// 	console.log(i, BlazePoseKeypoints[i]);
			// }

			const width_ratio = 30;
			const height_ratio = (width_ratio * 480) / 640;

			// multiply x,y by differnt factor
			for (let v of drawdata) {
				v["x"] *= width_ratio;
				v["y"] *= -height_ratio;
				v["z"] *= -width_ratio;
			}

			const g = drawPoseKeypoints(drawdata);

			g.scale.set(8, 8, 8);

			setcapturedPose(g);

			capturedPoseRef.current += 1;

			if (capturedPoseRef.current >= storedPose.current.length) {
				capturedPoseRef.current = 0;
			}
		}

		counter.current += 1;
		// ========= captured pose logic

		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function mainScene(viewWidth, viewHeight) {
		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(0x022244);

		camera.current = new THREE.PerspectiveCamera(
			90,
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

	function applyRotation(bone_name, euler) {
		bones.current[bone_name].rotation.set(euler.x, euler.z, -euler.y);
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
			<div className="controls">
				<div style={{ marginBottom: "40px" }}>
					{startBtnShow && (
						<Button
							variant="primary"
							onClick={() => {
								if (videoRef.current) {
									startCamera(videoRef.current);

									// count down loop hook. default 5 seconds

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

									setstopBtnShow(false);
								}
							}}
						>
							Stop
						</Button>
					)}
					<Button
						variant="primary"
						onClick={() => {
							setPlayPose(!playPose);
						}}
					>
						PlayPose
					</Button>
				</div>
			</div>
		</div>
	);
}
