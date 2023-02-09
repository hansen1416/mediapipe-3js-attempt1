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

	const [boxWidth, setboxWidth] = useState(0);
	const [boxHeight, setboxHeight] = useState(0);

	const [panelWidth, setpanelWidth] = useState(0);
	const [panelHeight, setpanelHeight] = useState(0);
	const [blockSize, setblockSize] = useState(0);
	const [blockN, setblockN] = useState(0);
	const [synthesizerHeight] = useState(120);

	const overallWidthMargin = 0.2 * document.documentElement.clientWidth;
	const overallHeightMargin = 0.1 * document.documentElement.clientHeight;
	const panelRatio = 0.46;

	useEffect(() => {
		setboxWidth(document.documentElement.clientWidth - overallWidthMargin);

		setboxHeight(
			document.documentElement.clientHeight - overallHeightMargin
		);

		return () => {
			cancelAnimationFrame(animationPointer.current);

			controls.current.dispose();
			renderer.current.dispose();
		};
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (boxWidth && boxHeight) {
			// calculate element sizes
			const margin = 10;
			const col = 4;
			let row = 10;
			const pWidth = boxWidth * panelRatio;
			let pHeight;

			let bSize = (pWidth - 10 * (col - 1)) / col;

			for (let i = 0; i < 10; i++) {
				if (
					bSize * i + (i - 1) * margin <=
						boxHeight - synthesizerHeight &&
					bSize * (i + 1) + i * margin >
						boxHeight - synthesizerHeight
				) {
					row = i;
					break;
				}
			}

			pHeight = bSize * row + (row - 1) * margin;

			setpanelWidth(pWidth);
			setpanelHeight(pHeight);
			setblockSize(bSize);
			setblockN(row * col);
		}

		// eslint-disable-next-line
	}, [boxWidth, boxHeight]);

	useEffect(() => {
		if ((panelWidth, panelHeight)) {
			_scene(panelWidth, panelHeight);

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

		// eslint-disable-next-line
	}, [panelWidth, panelHeight]);

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
		scene.current.background = new THREE.Color(0x0f2027);

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
					blockSize={blockSize}
					blockN={blockN}
					setselectedExercise={setselectedExercise}
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
				height={synthesizerHeight}
			/>
		</div>
	);
}
