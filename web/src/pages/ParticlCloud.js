import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ObjectLoader } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

import { Figure } from "../components/figure";
import { tmppose } from "../components/mypose";

export default function ParticlCloud() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const animationPointer = useRef(0);

	const figure = useRef(null);

	useEffect(() => {
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		_scene(documentWidth, documentHeight);

		animate();

		console.log(ObjectLoader);

		figure.current = new Figure();

		figure.current.init();

		scene.current.add(figure.current.group);

		generateCloud();

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};
	}, []);

	function animate() {
		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function _scene(viewWidth, viewHeight) {
		const backgroundColor = 0x022244;

		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(backgroundColor);

		camera.current = new THREE.PerspectiveCamera(
			75,
			viewWidth / viewHeight,
			0.1,
			1000
		);

		camera.current.position.set(0, 0, 10);

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

	function generateCloud() {
		// console.log(figure.current.limbs.LEFT_FOREARM.children[0].geometry)

		const sampler = new MeshSurfaceSampler(
			figure.current.limbs.LEFT_FOREARM.children[0]
		).build();

		// console.log(sampler)

		const tempPosition = new THREE.Vector3();
		const vertices = [];

		for (let i = 0; i < 150; i++) {
			sampler.sample(tempPosition);
			vertices.push(tempPosition.x, tempPosition.y, tempPosition.z);
		}

		/* Create a geometry from the coordinates */
		const pointsGeometry = new THREE.BufferGeometry();
		pointsGeometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute(vertices, 3)
		);

		/* Create a material */
		const pointsMaterial = new THREE.PointsMaterial({
			color: 0x47b2f5,
			size: 0.03,
			// transparent: true,
			// opacity: 0.5,
		});
		/* Create a Points object */
		const points = new THREE.Points(pointsGeometry, pointsMaterial);

		figure.current.limbs.LEFT_FOREARM.add(points);
	}

	return (
		<div className="cloud-rove">
			<canvas ref={canvasRef} />
		</div>
	);
}
