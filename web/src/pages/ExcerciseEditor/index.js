import { useEffect, useRef, useState } from "react";
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { loadFBX, traverseModel, applyTransfer } from "../../components/ropes";
import Synthesizer from "./Synthesizer";
import Motions from "./Motions";

export default function ExcerciseEditor() {
	const mainSceneRef = useRef(null);
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const mannequin = useRef(null);

	const figureParts = useRef({});

	const animationIndx = useRef(0);
	const longestTrack = useRef(0);

	const animationPointer = useRef(0);

	const [training, settraining] = useState([]);
	const [selectedExercise, setselectedExercise] = useState(-1);
	const selectedExerciseRef = useRef(null);

	useEffect(() => {
		const { width, height } = mainSceneRef.current.getBoundingClientRect();

		_scene(width, height);

		Promise.all([
			loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
		]).then(([model]) => {
			mannequin.current = model;
			// create main scene
			mannequin.current.position.set(0, -100, 0);

			traverseModel(mannequin.current, figureParts.current);

			scene.current.add(mannequin.current);

			animate();
		});

		return () => {
			cancelAnimationFrame(animationPointer.current);

			controls.current.dispose();
			renderer.current.dispose();
		};
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (training && training.length) {
			selectedExerciseRef.current = training[selectedExercise].animation;

			mannequin.current.position.set(
				selectedExerciseRef.current.position.x,
				selectedExerciseRef.current.position.y,
				selectedExerciseRef.current.position.z
			);

			mannequin.current.rotation.set(
				selectedExerciseRef.current.rotation.x,
				selectedExerciseRef.current.rotation.y,
				selectedExerciseRef.current.rotation.z
			);

			longestTrack.current = 0;
			animationIndx.current = 0;

			for (const v of selectedExerciseRef.current.tracks) {
				if (
					v.type === "quaternion" &&
					v.quaternions.length > longestTrack.current
				) {
					longestTrack.current = v.quaternions.length;
				}
			}
		}

		// eslint-disable-next-line
	}, [selectedExercise]);

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
		if (selectedExerciseRef.current) {
			applyTransfer(
				figureParts.current,
				selectedExerciseRef.current.tracks,
				animationIndx.current
			);

			animationIndx.current += 1;

			if (animationIndx.current >= longestTrack.current) {
				animationIndx.current = 0;
			}
		}

		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	return (
		<div>
			<div className="container">
				<Motions training={training} settraining={settraining} />
				<div className="middle"></div>
				<div className="panel" ref={mainSceneRef}>
					<canvas ref={canvasRef} />
				</div>
			</div>

			<Synthesizer
				training={training}
				settraining={settraining}
				selectedExercise={selectedExercise}
				setselectedExercise={setselectedExercise}
			/>
		</div>
	);
}
