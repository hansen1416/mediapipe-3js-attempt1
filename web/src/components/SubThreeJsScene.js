import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function SubThreeJsScene({ width, height, objects }) {
	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	useEffect(() => {
		_scene();

		_light();

		animate();

		return () => {
			controls.current.dispose();
			renderer.current.dispose();
		};
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (objects) {
			objects.scale.set(10, 10, 10);

			scene.current.add(objects);
		}
	}, [objects]);

	function _scene() {
		const backgroundColor = 0x22244;

		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(backgroundColor);

		camera.current = new THREE.PerspectiveCamera(
			75,
			width / height,
			0.1,
			1000
		);

		camera.current.position.set(0, 0, 10);

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
		});

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		renderer.current.setSize(width, height);
	}

	function _light() {
		const color = 0xffffff;
		const amblight = new THREE.AmbientLight(color, 1);
		scene.current.add(amblight);

		const plight = new THREE.PointLight(color, 1);
		plight.position.set(5, 5, 2);
		scene.current.add(plight);
	}

	function animate() {
		requestAnimationFrame(animate);
		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	return (
		<div className="scene" ref={containerRef}>
			<canvas ref={canvasRef}></canvas>
		</div>
	);
}
