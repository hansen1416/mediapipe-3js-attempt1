import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Limbs from "../../components/Limbs";

export default function Silhouette3D({
	width,
	height,
	blazePose3D,
	vectorDistances,
}) {
	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const animationPointer = useRef(0);

	const figure = useRef(null);

	useEffect(() => {
		_scene();

		figure.current = new Limbs();

		const limbs = figure.current.init();

		for (const l of limbs) {
			scene.current.add(l);
		}

		animate();

		return () => {
			cancelAnimationFrame(animationPointer.current);

			controls.current.dispose();
			renderer.current.dispose();
		};
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (!width || !height) {
			return;
		}

		camera.current.aspect = width / height;
		camera.current.updateProjectionMatrix();
		renderer.current.setSize(width, height);
	}, [width, height]);

	useEffect(() => {
		figure.current.applyPose(blazePose3D);

		// figure.current.resize(blazePose3D);
	}, [blazePose3D]);

	useEffect(() => {}, [vectorDistances]);

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

		camera.current.position.set(0, 0, 30);

		{
			const color = 0xffffff;
			const amblight = new THREE.AmbientLight(color, 1);
			scene.current.add(amblight);
		}

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
		});

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		// renderer.current.setSize(width, height);
	}

	function animate() {
		animationPointer.current = requestAnimationFrame(animate);
		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	return (
		<div className="sub-scene" ref={containerRef}>
			<canvas ref={canvasRef}></canvas>
		</div>
	);
}
