import { useEffect, useRef, useState } from "react";
import "../../styles/css/ExerciseEditor.css";
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

	const [boxWidth, setBoxWidth] = useState(0);
	const [boxHeight, setBoxHeight] = useState(0);

	const [panelWidth, setPanelWidth] = useState(0);
	const [panelHeight, setPanelHeight] = useState(0);

	useEffect(() => {
		setBoxWidth(document.documentElement.clientWidth * 0.8);

		setBoxHeight(document.documentElement.clientHeight - 120);

		return () => {
			cancelAnimationFrame(animationPointer.current);

			controls.current.dispose();
			renderer.current.dispose();
		};
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (boxWidth && boxHeight) {
			setPanelWidth(boxWidth * 0.46);
			setPanelHeight(boxHeight * 0.7);

			_scene(boxWidth * 0.42, boxHeight * 0.7);

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
		}
	}, [boxWidth, boxHeight]);

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
		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(0x2e6bc4);

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
		<div
			className="box"
			style={{ width: boxWidth + "px", height: boxHeight + "px" }}
		>
			<div className="container">
				<Motions
					training={training}
					settraining={settraining}
					width={panelWidth}
					height={panelHeight}
				/>
				<div
					className="panel main"
					ref={mainSceneRef}
					style={{
						width: panelWidth + "px",
						height: panelHeight + "px",
					}}
				>
					<canvas ref={canvasRef} />
				</div>
			</div>

			<Synthesizer
				training={training}
				settraining={settraining}
				selectedExercise={selectedExercise}
				setselectedExercise={setselectedExercise}
			/>

			<div className="actions">
				<button
					onClick={() => {
						if (training && training.length) {
							const data = [];

							for (let v of training) {
								data.push({
									round: v.round,
									name: v.animation.name,
								});
							}

							sessionStorage.setItem("my-training", data);
						}
					}}
				>
					Save
				</button>
			</div>
		</div>
	);
}
