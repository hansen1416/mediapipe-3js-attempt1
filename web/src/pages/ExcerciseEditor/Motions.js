import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { cloneDeep } from "lodash";

import { loadFBX, loadObj, muscleGroupsColors } from "../../components/ropes";

export default function Motions({
	training,
	settraining,
	width,
	height,
	blockSize,
	blockN,
	setselectedExercise,
}) {
	const [animationList, setanimationList] = useState([]);

	const sceneInfoList = useRef({});

	const [animationData, setanimationData] = useState({});

	const container = useRef(null);
	const canvasRef = useRef(null);

	const renderer = useRef(null);

	const animationPointer = useRef(0);

	const [activated, setactivated] = useState("");

	const musclGroups = Object.keys(muscleGroupsColors);
	const [sceneBgColor, setsceneBgColor] = useState("");

	useEffect(() => {
		return () => {
			cancelAnimationFrame(animationPointer.current);
		};

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (
			width &&
			height &&
			blockSize &&
			blockN &&
			renderer.current === null
		) {
			renderer.current = new THREE.WebGLRenderer({
				canvas: canvasRef.current,
				alpha: true,
			});

			renderer.current.setSize(width, height);

			animate();

			loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx").then(
				(model) => {
					// create scene list
					document
						.querySelectorAll(".animation-scene")
						.forEach((elem) => {
							sceneInfoList.current[elem.dataset["animation"]] =
								createScene(elem);

							const mannequin = SkeletonUtils.clone(model);

							sceneInfoList.current[elem.dataset["animation"]][
								"mannequin"
							] = mannequin;

							const { scene } =
								sceneInfoList.current[
									elem.dataset["animation"]
								];

							scene.add(mannequin);
						});

					loadAnimationList(musclGroups[0]);
				}
			);
		}
		// eslint-disable-next-line
	}, [width, height, blockSize, blockN]);

	function loadAnimationList(muscle_group) {
		new Promise((resolve) => {
			let result;

			if (muscle_group === "chest") {
				result = [
					"basic-crunch",
					"bicycle-crunch",
					"curl-up",
					"punch-walk",
					"leg-pushes",
					"leg-scissors",
					"lying-leg-raises",
					"oblique-crunch-left",
					"oblique-crunch-right",
					"reverse-crunch",
					"side-crunch-left",
					"toe-crunch",
				];
			} else if (muscle_group === "back") {
				result = [
					"basic-crunch",
					"bicycle-crunch",
					"curl-up",
					"punch-walk",
					"leg-pushes",
					"leg-scissors",
					"lying-leg-raises",
					"oblique-crunch-left",
					"oblique-crunch-right",
					"reverse-crunch",
					"side-crunch-left",
					"toe-crunch",
				];
			} else if (muscle_group === "arms") {
				result = [
					"basic-crunch",
					"bicycle-crunch",
					"curl-up",
					"punch-walk",
					"leg-pushes",
					"leg-scissors",
					"lying-leg-raises",
					"oblique-crunch-left",
					"oblique-crunch-right",
					"reverse-crunch",
					"side-crunch-left",
					"toe-crunch",
					"reverse-crunch",
					"side-crunch-left",
					"toe-crunch",
				];
			} else if (muscle_group === "abdominals") {
				result = [
					"basic-crunch",
					"bicycle-crunch",
					"curl-up",
					"punch-walk",
					"leg-pushes",
					"leg-scissors",
					"lying-leg-raises",
					"oblique-crunch-left",
					"oblique-crunch-right",
					"reverse-crunch",
					"side-crunch-left",
					"toe-crunch",
					"curl-up",
					"punch-walk",
					"leg-pushes",
					"leg-scissors",
					"lying-leg-raises",
					"oblique-crunch-left",
					"oblique-crunch-right",
					"reverse-crunch",
				];
			} else if (muscle_group === "legs") {
				result = [
					"basic-crunch",
					"bicycle-crunch",
					"curl-up",
					"punch-walk",
					"leg-pushes",
					"leg-scissors",
					"lying-leg-raises",
					"oblique-crunch-left",
					"oblique-crunch-right",
					"reverse-crunch",
				];
			} else if (muscle_group === "shoulders") {
				result = [
					"basic-crunch",
					"bicycle-crunch",
					"curl-up",
					"punch-walk",
					"leg-pushes",
					"leg-scissors",
					"lying-leg-raises",
					"oblique-crunch-left",
					"oblique-crunch-right",
					"reverse-crunch",
					"side-crunch-left",
					"toe-crunch",
					"basic-crunch",
					"bicycle-crunch",
					"curl-up",
					"punch-walk",
					"leg-pushes",
					"leg-scissors",
				];
			}

			resolve(result);
		}).then((data) => {
			setanimationList(data);

			setsceneBgColor(muscleGroupsColors[muscle_group]);
		});
	}

	useEffect(() => {
		if (!animationList || !animationList.length) {
			return;
		}

		const tasks = [];

		for (let name of animationList) {
			tasks.push(
				loadObj(process.env.PUBLIC_URL + "/animjson/" + name + ".json")
			);
		}

		Promise.all(tasks).then((results) => {
			const tmp = {};

			for (const v of results) {
				tmp[v.name] = v;
			}

			setanimationData(tmp);

			for (let i in sceneInfoList.current) {
				const { mannequin, mixer } = sceneInfoList.current[i];

				i = Number(i);

				if (i < results.length) {
					mannequin.visible = true;
					mannequin.position.set(
						results[i].position.x,
						results[i].position.y,
						results[i].position.z
					);

					mannequin.rotation.set(
						results[i].rotation.x,
						results[i].rotation.y,
						results[i].rotation.z
					);

					const clip = THREE.AnimationClip.parse(results[i]);

					const action = mixer.clipAction(clip, mannequin);

					action.reset();

					// keep model at the position where it stops
					action.clampWhenFinished = true;

					action.enable = true;

					action.play();
				} else {
					mannequin.visible = false;
				}
			}
		});
		// eslint-disable-next-line
	}, [animationList]);

	function createScene(elem) {
		const scene = new THREE.Scene();
		// scene.background = new THREE.Color(0x022244);

		const { width, height } = elem.getBoundingClientRect();

		const camera = new THREE.PerspectiveCamera(
			75,
			width / height,
			0.1,
			1000
		);
		camera.position.set(0, 0, 230);

		const controls = new OrbitControls(camera, elem);

		scene.add(camera);

		{
			const color = 0xffffff;
			const intensity = 1;
			const light = new THREE.DirectionalLight(color, intensity);
			light.position.set(-1, 2, 4);
			camera.add(light);
		}

		const clock = new THREE.Clock();

		const mixer = new THREE.AnimationMixer();

		return { scene, camera, controls, elem, clock, mixer };
	}

	function animate() {
		renderer.current.setScissorTest(false);
		renderer.current.clear(true, true);
		renderer.current.setScissorTest(true);

		for (let key in sceneInfoList.current) {
			const { scene, camera, elem, clock, mixer } =
				sceneInfoList.current[key];

			const delta = clock.getDelta();

			mixer.update(delta);

			// get the viewport relative position of this element
			const { left, top, bottom, width, height } =
				elem.getBoundingClientRect();

			const containerRect = container.current.getBoundingClientRect();

			if (bottom < 0 || top > document.documentElement.clientHeight) {
				continue;
			}

			// camera.aspect = width / height;
			// camera.updateProjectionMatrix();
			// // controls.handleResize();
			// controls.update()

			// seems bottom is different in 30px, find out why

			renderer.current.setScissor(
				left - containerRect.left,
				container.current.clientHeight - bottom + 50,
				width,
				height
			);
			renderer.current.setViewport(
				left - containerRect.left,
				container.current.clientHeight - bottom + 50,
				width,
				height
			);

			renderer.current.render(scene, camera);
		}

		animationPointer.current = requestAnimationFrame(animate);
	}

	function addExerciseToTraining(animation_name) {
		if (!animationData || !animationData[animation_name]) {
			return;
		}

		const tmp = cloneDeep(training);

		if (
			tmp.length &&
			tmp[tmp.length - 1].animation.name === animation_name
		) {
			tmp[tmp.length - 1].round += 1;
		} else {
			tmp.push({
				round: 1,
				animation: animationData[animation_name],
			});

			setselectedExercise(tmp.length - 1);
		}

		settraining(tmp);
	}

	return (
		<div
			className="panel"
			style={{ width: width + "px", height: height + "px" }}
		>
			<div className="tabs">
				{musclGroups &&
					musclGroups.map((item) => {
						return (
							<div
								key={item}
								style={{
									backgroundColor: muscleGroupsColors[item],
								}}
								onClick={() => {
									// making request to get exercise json
									loadAnimationList(item);
								}}
							>
								{item}
							</div>
						);
					})}
			</div>
			<div
				className="motions"
				style={{
					zIndex: -2,
					position: "absolute",
					width: "100%",
					height: "100%",
				}}
			>
				{blockN &&
					Array(blockN)
						.fill(0)
						.map((_, i) => {
							return (
								<div
									key={i}
									className={[
										"block",
										(i + 1) % 4 === 0 ? "border" : "",
									].join(" ")}
									style={{
										width: blockSize,
										height: blockSize,
										backgroundColor: sceneBgColor,
										display:
											i < animationList.length
												? "inline-block"
												: "none",
									}}
								></div>
							);
						})}
			</div>
			<div ref={container} className="motions">
				<canvas
					ref={canvasRef}
					style={{ zIndex: -1, position: "absolute" }}
				/>
				{blockN &&
					Array(blockN)
						.fill(0)
						.map((_, i) => {
							return (
								<div
									key={i}
									data-animation={i}
									className={[
										"block",
										"animation-scene",
										animationList[i] &&
										activated === animationList[i]
											? "active"
											: "",
										(i + 1) % 4 === 0 ? "border" : "",
									].join(" ")}
									style={{
										width: blockSize,
										height: blockSize,
										// display:
										// 	animationList.length === 0 || i < animationList.length
										// 		? "inline-block"
										// 		: "none",
									}}
									onClick={() => {
										if (!animationList[i]) {
											return;
										}

										if (activated === animationList[i]) {
											addExerciseToTraining(
												animationList[i]
											);
										} else {
											setactivated(animationList[i]);
										}
									}}
								></div>
							);
						})}
			</div>
		</div>
	);
}
