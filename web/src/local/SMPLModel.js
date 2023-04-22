import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Button from "react-bootstrap/Button";
import { cloneDeep } from "lodash";

import { loadFBX, traverseModel } from "../components/ropes";

export default function SMPLModel() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);
	// an integer number, used for cancelAnimationFrame
	const animationPointer = useRef(0);
	const counter = useRef(0);

	const model = useRef(null);
	const figureParts = useRef({});

	const [rotations, setrotations] = useState([]);

	useEffect(() => {
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		// scene take entire screen
		creatMainScene(documentWidth, documentHeight);

		animate();

		Promise.all([
			// poseDetection.createDetector(
			// 	poseDetection.SupportedModels.BlazePose,
			// 	BlazePoseConfig
			// ),
			loadFBX(process.env.PUBLIC_URL + "/smpl.fbx"),
		]).then(([fbx]) => {
			// poseDetector.current = detector;

			// add 3d model to main scene
			model.current = fbx;
			model.current.position.set(0, 0, 0);

			// store all limbs to `model`
			traverseModel(model.current, figureParts.current);

			// console.log(Object.keys(figureParts.current));

			setrotations([
				["root", 0, 0, 0],
				["pelvis", 0, 0, 0],
				["spine1", 0, 0, 0],
				["spine2", 0, 0, 0],
				["spine3", 0, 0, 0],
				["right_collar", 0, 0, 0],
				["right_shoulder", 0, 0, 0],
				["right_elbow", 0, 0, 0],
				["right_wrist", 0, 0, 0],
				// ["right_ring1", 0, 0, 0],
				// ["right_ring2", 0, 0, 0],
				// ["right_ring3", 0, 0, 0],
				// ["right_pinky1", 0, 0, 0],
				// ["right_pinky2", 0, 0, 0],
				// ["right_pinky3", 0, 0, 0],
				// ["right_index1", 0, 0, 0],
				// ["right_index2", 0, 0, 0],
				// ["right_index3", 0, 0, 0],
				// ["right_middle1", 0, 0, 0],
				// ["right_middle2", 0, 0, 0],
				// ["right_middle3", 0, 0, 0],
				// ["right_thumb1", 0, 0, 0],
				// ["right_thumb2", 0, 0, 0],
				// ["right_thumb3", 0, 0, 0],
				["neck", 0, 0, 0],
				["head", 0, 0, 0],
				["jaw", 0, 0, 0],
				["right_eye_smplhf", 0, 0, 0],
				["left_eye_smplhf", 0, 0, 0],
				["left_collar", 0, 0, 0],
				["left_shoulder", 0, 0, 0],
				["left_elbow", 0, 0, 0],
				["left_wrist", 0, 0, 0],
				// ["left_pinky1", 0, 0, 0],
				// ["left_pinky2", 0, 0, 0],
				// ["left_pinky3", 0, 0, 0],
				// ["left_index1", 0, 0, 0],
				// ["left_index2", 0, 0, 0],
				// ["left_index3", 0, 0, 0],
				// ["left_ring1", 0, 0, 0],
				// ["left_ring2", 0, 0, 0],
				// ["left_ring3", 0, 0, 0],
				// ["left_thumb1", 0, 0, 0],
				// ["left_thumb2", 0, 0, 0],
				// ["left_thumb3", 0, 0, 0],
				// ["left_middle1", 0, 0, 0],
				// ["left_middle2", 0, 0, 0],
				// ["left_middle3", 0, 0, 0],
				["left_hip", 0, 0, 0],
				["left_knee", 0, 0, 0],
				["left_ankle", 0, 0, 0],
				["left_foot", 0, 0, 0],
				["right_hip", 0, 0, 0],
				["right_knee", 0, 0, 0],
				["right_ankle", 0, 0, 0],
				["right_foot", 0, 0, 0],
			]);

			scene.current.add(model.current);
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

		counter.current += 1;

		/** play animation in example sub scene */

		controls.current.update();
		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
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

		camera.current.position.set(0, 0, 300);

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

		renderer.current.setSize(viewWidth, viewHeight);
	}

	function onChangeRotation(idx, axis, v) {
		const tmp = cloneDeep(rotations);

		tmp[idx][axis] = v;

		setrotations(tmp);
	}

	return (
		<div>
			<canvas ref={canvasRef} />

			<div
				style={{
					position: "absolute",
					right: 0,
					bottom: 0,
				}}
			>
				{rotations.map((item, idx) => {
					return (
						<div key={idx}>
							<span>{item[0]}</span>
							<label>
								x:
								<input
									style={{
										width: 50,
										height: 20,
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
										height: 20,
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
										height: 20,
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