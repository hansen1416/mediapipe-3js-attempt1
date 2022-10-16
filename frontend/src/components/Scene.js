import { useEffect, useRef } from "react";
import "./Home.css";

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export default function Scene() {
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);

	const animationframe = useRef(0);

	useEffect(() => {
		scene.current = new THREE.Scene();

		/**
		 * The first attribute is the field of view.
		 * FOV is the extent of the scene that is seen on the display at any given moment.
		 * The value is in degrees.
		 *
		 * The second one is the aspect ratio.
		 * You almost always want to use the width of the element divided by the height,
		 * or you'll get the same result as when you play old movies on a widescreen TV
		 * - the image looks squished.
		 *
		 * The next two attributes are the near and far clipping plane.
		 * What that means, is that objects further away from the camera
		 * than the value of far or closer than near won't be rendered.
		 * You don't have to worry about this now,
		 * but you may want to use other values in your apps to get better performance.
		 */
		camera.current = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);

		renderer.current = new THREE.WebGLRenderer();
		renderer.current.setSize(window.innerWidth / 2, window.innerHeight / 2);
		document.body.appendChild(renderer.current.domElement);

		const loader = new GLTFLoader();

		loader.load(
			process.env.PUBLIC_URL + `/models/Soldier.glb`,
			function (gltf) {
				scene.current.add(gltf.scene);

				console.log(gltf);
			},
			undefined,
			function (error) {
				console.error(error);
			}
		);

		// const geometry = new THREE.BoxGeometry(1, 1, 1);
		// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		// const cube = new THREE.Mesh(geometry, material);
		// scene.current.add(cube);

		// camera.current.position.z = 5;

		// function animate() {
		// 	animationframe.current = requestAnimationFrame(animate);

		// 	cube.rotation.x += 0.01;
		// 	cube.rotation.y += 0.01;

		// 	renderer.current.render(scene.current, camera.current);
		// }

		// animate();

		return () => {
			// cancelAnimationFrame(animationframe.current);
			// renderer.current.dispose();
			// document.body.removeChild(renderer.current.domElement);
		};
	}, []);

	return <div></div>;
}
