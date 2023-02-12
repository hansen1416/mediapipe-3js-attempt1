import { useEffect, useRef } from "react";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

// import * as Ammo from "../../components/ammo";

export default function CloudRove() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const animationPointer = useRef(0);

	useEffect(() => {
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		_scene(documentWidth, documentHeight);

		const physicsWorld = new CANNON.World({
			gravity: new CANNON.Vec3(0, -9.82, 0),
		});

		const groundBody = new CANNON.Body({
			type: CANNON.Body.STATIC,
			shape: new CANNON.Plane(),
		});

		groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
		physicsWorld.addBody(groundBody);

		const radius = 1;
		const sphereBody = new CANNON.Body({
			mass: 5,
			shape: new CANNON.Sphere(radius),
		});

		sphereBody.position.set(0, 7, 0);
		physicsWorld.addBody(sphereBody);

		const boxBody = new CANNON.Body({
			mass: 5,
			shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
		});

		boxBody.position.set(1, 10, 0);
		physicsWorld.addBody(boxBody);

		const geo = new THREE.SphereGeometry(radius);
		const mat = new THREE.MeshNormalMaterial();

		const sphereMesh = new THREE.Mesh(geo, mat);

		scene.current.add(sphereMesh);

		const geo1 = new THREE.BoxGeometry(2, 2, 2);
		const mat1 = new THREE.MeshNormalMaterial();

		const boxMesh = new THREE.Mesh(geo1, mat1);

		scene.current.add(boxMesh);

		const cannonDebugger = new CannonDebugger(scene.current, physicsWorld, {
			// color: 0xff0000
		});

		const animate = () => {
			physicsWorld.fixedStep();

			cannonDebugger.update();

			sphereMesh.position.copy(sphereBody.position);
			sphereMesh.quaternion.copy(sphereBody.quaternion);

			boxMesh.position.copy(boxBody.position);
			boxMesh.quaternion.copy(boxBody.quaternion);

			controls.current.update();

			renderer.current.render(scene.current, camera.current);

			animationPointer.current = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};
	}, []);

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

		camera.current.position.set(0, 0, 30);

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

	return (
		<div className="cloud-rove">
			<canvas ref={canvasRef} />
		</div>
	);
}
