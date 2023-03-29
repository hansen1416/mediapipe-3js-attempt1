import { cloneDeep } from "lodash";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Button from "react-bootstrap/Button";
import PoseSync from "../components/PoseSync";
import {
	drawPoseKeypoints,
	loadGLTF,
	traverseModel,
	startCamera,
	BlazePoseConfig,
	roundToTwo,
} from "../components/ropes";
import SubThreeJsScene from "../components/SubThreeJsScene";

export default function PoseDiffScore() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);
	// an integer number, used for cancelAnimationFrame
	const animationPointer = useRef(0);
	const counter = useRef(0);

	const videoRef = useRef(null);

	// blazepose pose model
	const poseDetector = useRef(null);

	const model = useRef(null);
	const figureParts = useRef({});

	const mixer = useRef(null);
	const clock = new THREE.Clock();

	const [rotations, setrotations] = useState([]);

	// subscen size
	const [subsceneWidth, setsubsceneWidth] = useState(0);
	const [subsceneHeight, setsubsceneHeight] = useState(0);

	// compare by joints distances
	const poseSync = useRef(null);
	const [diffScore, setdiffScore] = useState(0);
	const poseCurveRef = useRef(null);
	const boneCurveRef = useRef(null);

	const [capturedPose, setcapturedPose] = useState();

	const pause = useRef(false);

	useEffect(() => {
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		setsubsceneWidth(documentWidth * 0.2);
		// remember not to use a squared video
		setsubsceneHeight((documentWidth * 0.2 * 480) / 640);
		// scene take entire screen
		creatMainScene(documentWidth, documentHeight);

		poseSync.current = new PoseSync();

		const geometry = new THREE.BufferGeometry().setFromPoints([
			new THREE.Vector2(0, 0),
			new THREE.Vector2(4, 0),
		]);

		poseCurveRef.current = new THREE.Line(
			geometry.clone(),
			new THREE.LineBasicMaterial({
				color: 0xff0000,
			})
		);

		boneCurveRef.current = new THREE.Line(
			geometry.clone(),
			new THREE.LineBasicMaterial({
				color: 0x00ff00,
			})
		);

		poseCurveRef.current.position.set(-2, 0.5, 0);
		boneCurveRef.current.position.set(-2, 0.5, 0);

		scene.current.add(poseCurveRef.current);
		scene.current.add(boneCurveRef.current);

		Promise.all([
			poseDetection.createDetector(
				poseDetection.SupportedModels.BlazePose,
				BlazePoseConfig
			),
			loadGLTF(process.env.PUBLIC_URL + "/glb/dors.glb"),
		]).then(([detector, glb]) => {
			poseDetector.current = detector;

			// add 3d model to main scene
			model.current = glb.scene.children[0];
			model.current.position.set(0, -1.5, 0);

			// store all limbs to `model`
			traverseModel(model.current, figureParts.current);

			setrotations([
				["Hips", 0, 0, 0],
				["Spine", 0, 0, 0],
				["LeftArm", 0, 0, 0],
				["LeftForeArm", 0, 0, 0],
				["RightArm", 0, 0, 0],
				["RightForeArm", 0, 0, 0],
				["LeftUpLeg", 0.11, 0, -3.07],
				["LeftLeg", 0, 0, 0],
				["RightUpLeg", 0.11, 0, 3.07],
				["RightLeg", 0, 0, 0],
			]);

			// console.log(Object.keys(figureParts.current));

			scene.current.add(model.current);

			animate();

			mixer.current = new THREE.AnimationMixer(model.current);

			mixer.current.stopAllAction();

			if (glb.animations & glb.animations[0]) {
				// prepare the example exercise action
				const action = mixer.current.clipAction(glb.animations[0]);

				action.reset();
				action.setLoop(THREE.LoopRepeat);

				// keep model at the position where it stops
				action.clampWhenFinished = true;

				action.enable = true;

				action.play();
				// prepare the example exercise action
			}
		});

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		for (let v of rotations) {
			figureParts.current[v[0]].rotation.set(v[1], v[2], v[3]);
		}
	}, [rotations]);

	function animate() {
		/**
		 */

		if (
			videoRef.current &&
			videoRef.current.readyState >= 2 &&
			counter.current % 3 === 0 &&
			!pause.current
		) {
			capturePose();
		}

		counter.current += 1;

		/** play animation in example sub scene */
		const delta = clock.getDelta();

		if (mixer.current) mixer.current.update(delta);

		controls.current.update();
		renderer.current.render(scene.current, camera.current);

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
				return;
			}

			const keypoints3D = cloneDeep(poses[0]["keypoints3D"]);

			const width_ratio = 30;
			const height_ratio = (width_ratio * 480) / 640;

			// multiply x,y by differnt factor
			for (let v of keypoints3D) {
				v["x"] *= width_ratio;
				v["y"] *= -height_ratio;
				v["z"] *= -width_ratio;
			}

			const g = drawPoseKeypoints(keypoints3D);

			g.scale.set(8, 8, 8);

			setcapturedPose(g);

			poseSync.current.compareCurrentPose(
				keypoints3D,
				figureParts.current,
				1000
			);

			setdiffScore(roundToTwo(poseSync.current.diffScore * 100));

			poseCurveRef.current.geometry.setFromPoints(
				poseSync.current.poseSpline.getPoints(50)
			);
			boneCurveRef.current.geometry.setFromPoints(
				poseSync.current.boneSpline.getPoints(50)
			);
		})();
	}

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

		camera.current.position.set(0, 0, 4);

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

	function onChangeRotation(idx, axis, v) {
		const tmp = cloneDeep(rotations);

		tmp[idx][axis] = v;

		setrotations(tmp);
	}

	return (
		<div className="glb-model">
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

			<div
				style={{
					width: subsceneWidth + "px",
					height: subsceneHeight + "px",
					position: "absolute",
					bottom: 0,
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

			<div
				style={{
					position: "absolute",
					right: 0,
					bottom: 0,
				}}
			>
				<div>
					<span style={{ fontSize: "30px", color: "#fff" }}>
						{diffScore}
					</span>
				</div>
				<div>
					<Button
						onClick={() => {
							startCamera(videoRef.current);
						}}
					>
						Start camera
					</Button>
					<Button
						onClick={() => {
							pause.current = !pause.current;
						}}
					>
						Pause
					</Button>
				</div>
				{rotations.map((item, idx) => {
					return (
						<div key={idx}>
							<span>{item[0]}</span>
							<label>
								x:
								<input
									style={{
										width: 50,
									}}
									value={item[1]}
									onChange={(e) => {
										onChangeRotation(
											idx,
											1,
											e.target.value
										);
									}}
								/>
							</label>
							<label>
								y:
								<input
									style={{
										width: 50,
									}}
									value={item[2]}
									onChange={(e) => {
										onChangeRotation(
											idx,
											2,
											e.target.value
										);
									}}
								/>
							</label>
							<label>
								z:
								<input
									style={{
										width: 50,
									}}
									value={item[3]}
									onChange={(e) => {
										onChangeRotation(
											idx,
											3,
											e.target.value
										);
									}}
								/>
							</label>
						</div>
					);
				})}
			</div>
		</div>
	);
}
