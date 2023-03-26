import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { loadFBX } from "../components/ropes";

export default function Site() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const animationPointer = useRef(0);

	const ground_level = -10;

	useEffect(() => {
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		mainScene(documentWidth, documentHeight);

		drawScene();

		animate();
		// process.env.PUBLIC_URL + "/fbx/YBot.fbx"
		// Promise.add()

		Promise.all([loadFBX(process.env.PUBLIC_URL + "/fbx/girl.fbx")]).then(
			([model]) => {
				model.position.set(0, 4, 0);
				model.rotation.set(0, Math.PI, 0);

				scene.current.add(model);
			}
		);

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};
	}, []);

	function mainScene(viewWidth, viewHeight) {
		scene.current = new THREE.Scene();
		// scene.current.background = new THREE.Color(0x022244);

		camera.current = new THREE.PerspectiveCamera(
			90,
			viewWidth / viewHeight,
			0.1,
			1000
		);

		camera.current.position.set(0, 0, 12);

		// camera.current.position.set(0, 44, 33);
		// camera.current.rotation.set(
		// 	-0.9366089265496195,
		// 	-0.041875841789770954,
		// 	-0.056853524782885745
		// );

		{
			// mimic the sun light
			const dlight = new THREE.PointLight(0xffffff, 0.5);
			dlight.position.set(0, 100, 100);
			scene.current.add(dlight);
			// env light
			scene.current.add(new THREE.AmbientLight(0xffffff, 0.5));
		}

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
			alpha: true,
			antialias: true,
		});

		renderer.current.setClearColor(0x000000, 0);

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		controls.current.enablePan = false;
		// controls.current.minPolarAngle = THREE.MathUtils.degToRad(60);
		// controls.current.maxPolarAngle = THREE.MathUtils.degToRad(90);
		controls.current.minDistance = 10;
		controls.current.maxDistance = 100;
		controls.current.enableDamping = true;

		renderer.current.setSize(viewWidth, viewHeight);
	}

	function animate() {
		// console.log(camera.current);

		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function drawScene() {
		// for (let i = 0; i < 100; i++) {
		// 	let box = new THREE.Mesh(
		// 		new THREE.BoxGeometry().translate(0, 0.51, 0),
		// 		new THREE.MeshLambertMaterial({ color: "pink" })
		// 	);
		// 	box.position.setFromCylindricalCoords(
		// 		Math.random() * 10,
		// 		Math.random() * Math.PI * 2,
		// 		0
		// 	);
		// 	let distRatio = 1 - Math.hypot(box.position.x, box.position.z) / 10;
		// 	box.scale.y = 1 + distRatio * distRatio * distRatio * 5;
		// 	scene.current.add(box);
		// }

		// das meer
		const ground = new THREE.Mesh(
			new THREE.CircleGeometry(1500, 64).rotateX(-Math.PI * 0.5),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(0x2c589d),
				transparent: true,
				opacity: 0.7,
			})
		);

		ground.position.set(0, ground_level, 0);

		scene.current.add(ground);

		// das strand
		const island = new THREE.Mesh(
			new THREE.CylinderGeometry(40, 40, 1, 64, 64),
			new THREE.MeshBasicMaterial({
				color: 0xf5ccb3,
			})
		);

		island.position.set(0, ground_level, 0);

		scene.current.add(island);

		const wave = new THREE.Mesh(
			new THREE.CircleGeometry(41, 64).rotateX(-Math.PI * 0.5),
			new THREE.MeshToonMaterial({
				color: 0xffffff,
				transparent: true,
				opacity: 0.4,
			})
		);

		wave.position.set(0, ground_level + 0.1, 0);

		scene.current.add(wave);
	}

	return (
		<div
			className="site"
			style={{
				overflow: "hidden",
				margin: 0,
				background:
					"linear-gradient(0deg, rgb(175,210,253) 50%, rgb(21,73,204) 100%)",
			}}
		>
			<canvas ref={canvasRef} />
		</div>
	);
}
