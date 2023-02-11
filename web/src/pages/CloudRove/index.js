import { useEffect, useRef } from "react";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger"

// import * as Ammo from "../../components/ammo";

export default function CloudRove() {

	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const physicsWorld = useRef(null);
	const cannonDebugger = useRef(null);

	const animationPointer = useRef(0);


	useEffect(() => {

		
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		_scene(documentWidth, documentHeight);



		physicsWorld.current = new CANNON.World({
			gravity: new CANNON.Vec3(0, -9.82, 0)
		})

		const groundBody = new CANNON.Body({
			type: CANNON.Body.STATIC,
			shape: new CANNON.Plane()
		});

		groundBody.quaternion.setFromEuler(-Math.PI/2, 0,0);
		physicsWorld.current.addBody(groundBody);


		const radius = 1;
		const sphereBody = new CANNON.Body({mass: 5, shape: new CANNON.Sphere(radius)})

		sphereBody.position.set(0,7,0);
		physicsWorld.current.addBody(sphereBody);

		cannonDebugger.current = new CannonDebugger(scene.current, physicsWorld.current, {
			// color: 0xff0000
		})

		animate()

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

	function animate() {

		physicsWorld.current.fixedStep();

		cannonDebugger.current.update();

		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	return (
		<div className="cloud-rove">
			<canvas ref={canvasRef} />
		</div>
	);
}
