import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { cloneDeep } from "lodash";

import { loadFBX, loadObj, muscleGroupsColors } from "../../components/ropes";

export default function Motions({ training, settraining }) {
	const [animationList, setanimationList] = useState([]);

	const sceneInfoList = useRef({});

	const [animationData, setanimationData] = useState({});

	const container = useRef(null);
	const canvasRef = useRef(null);

	const renderer = useRef(null);

	const animationPointer = useRef(0);

	const [activated, setactivated] = useState("");

	const musclGroups = Object.keys(muscleGroupsColors);
	const [sceneBgColor, setsceneBgColor] =  useState("");

	function loadAnimationList() {
		return new Promise((resolve) => {
			resolve([
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
			]);
		});
	}

	useEffect(() => {

		loadAnimationList().then((data) => {
			setanimationList(data);
		});

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (!animationList || !animationList.length) {
			return;
		}

		// create main scene
		document.querySelectorAll(".animation-scene").forEach((elem) => {
			sceneInfoList.current[elem.dataset["animation"]] =
				createScene(elem);
		});

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
			alpha: true,
		});

		const { width, height } = container.current.getBoundingClientRect();

		renderer.current.setSize(width, height);

		const tasks = [loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx")];

		for (let name of animationList) {
			tasks.push(
				loadObj(process.env.PUBLIC_URL + "/animjson/" + name + ".json")
			);
		}

		Promise.all(tasks).then((results) => {
			const [model] = results;

			const animationJSONs = {};

			for (let v of results.slice(1)) {
				animationJSONs[v.name] = v;
			}

			setanimationData(animationJSONs);

			for (let key in sceneInfoList.current) {
				const { scene, mixer } = sceneInfoList.current[key];

				const mannequin = SkeletonUtils.clone(model);
				// const tmpmodel = model.clone()

				scene.add(mannequin);

				mannequin.position.set(
					// animationJSONs[key].position.x,
					// animationJSONs[key].position.y,
					// animationJSONs[key].position.z
					0,0,0
				);

				mannequin.rotation.set(
					animationJSONs[key].rotation.x,
					animationJSONs[key].rotation.y,
					animationJSONs[key].rotation.z
				);

				const clip = THREE.AnimationClip.parse(animationJSONs[key]);

				const action = mixer.clipAction(clip, mannequin);
				// const action = mixer.clipAction(animationJSONs[key], tmpmodel);

				action.reset();

				// keep model at the position where it stops
				action.clampWhenFinished = true;

				action.enable = true;

				action.play();

				// break
			}

			animate();
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
		camera.position.set(0, 0, 300);

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

			renderer.current.setScissor(left - containerRect.left, containerRect.height - bottom, width, height);
			renderer.current.setViewport(left - containerRect.left, containerRect.height - bottom, width, height);

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
		}

		settraining(tmp);
	}

	return (
		<div ref={container} className="panel">
			<div className="tabs">
				{
					musclGroups && musclGroups.map((item) => {
						return (<div>{item}</div>)
					}) 
				}
			</div>
			<div className="motions" style={{ zIndex: -2, position: "absolute", width: '100%', height: '100%' }}>
				{animationList.map((name, i) => {
					return (
						<div
							key={i}
							data-animation={name}
							className={["animation-scene", (i + 1) % 4 === 0 ? "border" : "" ].join(' ')}
							style={{backgroundColor: '#ffff00'}}
						></div>
					);
				})}
			</div>
			<canvas
				ref={canvasRef}
				style={{ zIndex: -1, position: "absolute" }}
			/>
			<div className="motions">
				{animationList.map((name, i) => {
					return (
						<div
							key={i}
							data-animation={name}
							className={["animation-scene", activated ? "active" : "", (i + 1) % 4 === 0 ? "border" : "" ].join(' ')}
							onClick={() => {
								if (activated === name) {
									addExerciseToTraining(name);
								} else {
									setactivated(name);
								}
							}}
						></div>
					);
				})}
			</div>
		</div>
	);
}
