import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { loadFBX, loadObj } from "../../components/ropes";

export default function Sider() {
	const [animationList, setanimationList] = useState([]);

	const sceneInfoList = useRef({});

	const container = useRef(null);
	const canvasRef = useRef(null);

	const renderer = useRef(null);

	const mixers = useRef({});

	const clock = new THREE.Clock();

	function loadAnimationList() {
		return new Promise((resolve) => {
			resolve(
				Array(16)
					.fill(1)
					.map((x, i) => x + i)
			);
		});
	}

	useEffect(() => {
		loadAnimationList().then((data) => {
			setanimationList(data);
		});

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

		Promise.all([
			loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
			loadObj(process.env.PUBLIC_URL + "/json/PunchWalk.json"),
		]).then(([model, animationJSON]) => {

			const animation = THREE.AnimationClip.parse(animationJSON)

			for (let key in sceneInfoList.current) {
				const { scene } = sceneInfoList.current[key];

				// const m = model.clone();

				scene.add(model);

				mixers.current[key] = new THREE.AnimationMixer(model);

				const action = mixers.current[key].clipAction(animation);

				action.reset();

				// keep model at the position where it stops
				action.clampWhenFinished = true;

				action.enable = true;

				action.play();

				break
			}

			animate();
		});

		// eslint-disable-next-line
	}, [animationList]);

	function createScene(elem) {
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x22244);

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

		return { scene, camera, controls, elem };
	}

	function animate() {
		renderer.current.setScissorTest(false);
		renderer.current.clear(true, true);
		renderer.current.setScissorTest(true);

		for (let key in sceneInfoList.current) {

			const delta = clock.getDelta();

			if (mixers.current[key]) mixers.current[key].update(delta);

			const { scene, camera, elem } = sceneInfoList.current[key];

			// get the viewport relative position of this element
			const { left, top, bottom, width, height } =
				elem.getBoundingClientRect();

			if (bottom < 0 || top > document.documentElement.clientHeight) {
				continue;
			}

			// camera.aspect = width / height;
			// camera.updateProjectionMatrix();
			// // controls.handleResize();
			// controls.update()

			renderer.current.setScissor(left-558, top, width, height);
			renderer.current.setViewport(left-558, top, width, height);

			renderer.current.render(scene, camera);
		}

		requestAnimationFrame(animate);
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
						className="animation-scene"
					></div>
				);
			})}
		</div>
	);
}
