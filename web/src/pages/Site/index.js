import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function Site() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const animationPointer = useRef(0);

	useEffect(() => {
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		mainScene(documentWidth, documentHeight);

		drawScene();

		animate();

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

		camera.current.position.set(0, 1, 20);

		{
			// const light = new THREE.PointLight(0xffffff, 1);
			// // light.position.set(10, 10, 10);
			// camera.current.add(light);

			// scene.current.add(camera.current);

			let light = new THREE.DirectionalLight(0xffffff, 0.5);
			light.position.set(3, 5, 8);
			scene.current.add(light, new THREE.AmbientLight(0xffffff, 0.5));
		}

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
			alpha: true,
			antialias: true,
		});

		renderer.current.setClearColor(0x000000, 0);

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		controls.current.enablePan = false;
		controls.current.minPolarAngle = THREE.MathUtils.degToRad(45);
		controls.current.maxPolarAngle = THREE.MathUtils.degToRad(85);
		controls.current.minDistance = 10;
		controls.current.maxDistance = 30;
		controls.current.enableDamping = true;

		renderer.current.setSize(viewWidth, viewHeight);
	}

	function animate() {
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

		const ground = new THREE.Mesh(
			new THREE.PlaneGeometry(1000, 1000).rotateX(-Math.PI * 0.5),

			new THREE.MeshPhongMaterial({
				color: new THREE.Color(0x3e9edf),
				transparent: true,
				opacity: 0.9,
			})
		);

		ground.position.set(0, 0, 0);

		scene.current.add(ground);
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
