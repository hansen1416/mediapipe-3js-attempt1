import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

import { loadFBX, loadObj } from "../../components/ropes";

export default function Sider({ selectedExcercise, setselectedExcercise }) {
	const [animationList, setanimationList] = useState([]);

	const sceneInfoList = useRef({});

	const [animationData, setanimationData] = useState({});

	const container = useRef(null);
	const canvasRef = useRef(null);

	const renderer = useRef(null);

	const animationPointer = useRef(0);

	function loadAnimationList() {
		return new Promise((resolve) => {
			resolve([
				"basic-crunch",
				"bicycle-crunch",
				"curl-up",
				"leg-pushes",
				"leg-scissors",
				"lying-leg-raises",
				"oblique-crunch-left",
				"oblique-crunch-right",
				"punch-walk",
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
		}

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

				const tmpmodel = SkeletonUtils.clone(model);
				// const tmpmodel = model.clone()

				scene.add(tmpmodel);

				const clip = THREE.AnimationClip.parse(animationJSONs[key]);

				const action = mixer.clipAction(clip, tmpmodel);
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
		scene.background = new THREE.Color(0x022244);

		const { width, height } = elem.getBoundingClientRect();

		const camera = new THREE.PerspectiveCamera(
			75,
			width / height,
			0.1,
			1000
		);
		camera.position.set(0, 0, 300);
		// camera.lookAt(0, 0, 0);

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

			if (bottom < 0 || top > document.documentElement.clientHeight) {
				continue;
			}

			// const boxheight = container.current.clientHeight;

			// camera.aspect = width / height;
			// camera.updateProjectionMatrix();
			// // controls.handleResize();
			// controls.update()

			// renderer.current.setScissor(left, boxheight-bottom, width, height);
			// renderer.current.setViewport(left, boxheight-bottom, width, height);

			renderer.current.setScissor(left, 0, width, height);
			renderer.current.setViewport(left, 0, width, height);

			renderer.current.render(scene, camera);
		}

		animationPointer.current = requestAnimationFrame(animate);
	}

	return (
		<div ref={container} className="sider">
			<canvas
				ref={canvasRef}
				style={{ zIndex: -1, position: "absolute" }}
			/>

			{animationList.map((name, i) => {
				return (
					<div
						key={i}
						data-animation={name}
						className={
							selectedExcercise === name
								? "animation-scene selected"
								: "animation-scene"
						}
						onClick={() => {
							if (
								animationData &&
								animationData[name] &&
								animationData[name].tracks
							) {
								const tracks = {};

								for (let i in animationData[name].tracks) {
									tracks[animationData[name].tracks[i].name] =
										animationData[name].tracks[i];
								}

								setselectedExcercise(tracks);
							}
						}}
					></div>
				);
			})}
		</div>
	);
}