import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Button from "react-bootstrap/Button";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { cloneDeep } from "lodash";

import SubThreeJsScene from "../../components/SubThreeJsScene";
import Limbs from "../../components/Limbs";
import {
	BlazePoseConfig,
	drawPoseKeypoints,
	// loadJSON,
	startCamera,
} from "../../components/ropes";

/**
 * https://nimb.ws/YdEVQT
 * @returns
 */

export default function ParticleFigure() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const animationPointer = useRef(0);

	const figure = useRef(null);
	// const fbxmodel = useRef(null);

	// ========= captured pose logic
	const [capturedPose, setcapturedPose] = useState();
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

		_scene(documentWidth, documentHeight);

		Promise.all([
			poseDetection.createDetector(
				poseDetection.SupportedModels.BlazePose,
				BlazePoseConfig
			),
		]).then(([detector]) => {
			poseDetector.current = detector;
		});

		figure.current = new Limbs();

		const body = figure.current.init();

		scene.current.add(body);

		animate();

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};
	}, []);

	function animate() {
		// ========= captured pose logic
		if (
			videoRef.current &&
			videoRef.current.readyState >= 2 &&
			counter.current % 6 === 0
		) {
			(async () => {
				const poses = await poseDetector.current.estimatePoses(
					videoRef.current
				);

				if (
					!poses ||
					!poses[0] ||
					!poses[0]["keypoints"] ||
					!poses[0]["keypoints3D"]
				) {
					return;
				}

				{
					const drawdata = cloneDeep(poses[0]["keypoints3D"]);

					const width_ratio = 30;
					const height_ratio = (width_ratio * 480) / 640;

					// multiply x,y by differnt factor
					for (let v of drawdata) {
						v["x"] *= -width_ratio;
						v["y"] *= -height_ratio;
						v["z"] *= -width_ratio;
					}

					const g = drawPoseKeypoints(drawdata);

					g.scale.set(8, 8, 8);

					setcapturedPose(g);

					figure.current.applyPose(drawdata, true);
				}
			})();
		}

		counter.current += 1;
		// ========= captured pose logic

		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function _scene(viewWidth, viewHeight) {
		const backgroundColor = 0x022244;

		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(backgroundColor);

		camera.current = new THREE.PerspectiveCamera(
			90,
			viewWidth / viewHeight,
			0.1,
			1000
		);

		camera.current.position.set(0, 0, 100);

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
				</div>
			</div>
		</div>
	);
}
