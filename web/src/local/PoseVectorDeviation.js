import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { loadGLTF, traverseModel } from "../components/ropes";

export default function PoseVectorDeviation() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const model = useRef(null);
	const figureParts = useRef({});

	const animationPointer = useRef(0);
	const mixer = useRef(null);
	const clock = new THREE.Clock();

	useEffect(() => {
		// scene take entire screen
		creatMainScene(
			document.documentElement.clientWidth,
			document.documentElement.clientHeight
		);

		Promise.all([loadGLTF(process.env.PUBLIC_URL + "/glb/dors.glb")]).then(
			([glb]) => {
				// add 3d model to main scene
				model.current = glb.scene.children[0];
				model.current.position.set(0, -1, 0);

				// store all limbs to `model`
				traverseModel(model.current, figureParts.current);

				console.log(Object.keys(figureParts.current));

				scene.current.add(model.current);

				animate();

				mixer.current = new THREE.AnimationMixer(model.current);

				mixer.current.stopAllAction();

				// prepare the example exercise action
				const action = mixer.current.clipAction(glb.animations[0]);

				action.reset();
				action.setLoop(THREE.LoopRepeat);

				// keep model at the position where it stops
				action.clampWhenFinished = true;

				action.enable = true;

				action.play();
				// prepare the example exercise action
			}
		);

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};

		// eslint-disable-next-line
	}, []);

	function animate() {
		/**
		 */

		/** play animation in example sub scene */
		const delta = clock.getDelta();

		if (mixer.current) mixer.current.update(delta);

		controls.current.update();
		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function creatMainScene(viewWidth, viewHeight) {
		/**
		 * main scene, which plays exercise animation
		 * @param {number} viewWidth
		 * @param {number} viewHeight
		 */
		scene.current = new THREE.Scene();
		// scene.current.background = new THREE.Color(0x022244);

		camera.current = new THREE.PerspectiveCamera(
			90,
			viewWidth / viewHeight,
			0.1,
			1000
		);

		camera.current.position.set(0, 0, 2);

		{
			// mimic the sun light
			const dlight = new THREE.PointLight(0xffffff, 0.4);
			dlight.position.set(0, 10, 10);
			scene.current.add(dlight);
			// env light
			scene.current.add(new THREE.AmbientLight(0xffffff, 0.6));
		}

		// drawScene();

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
			alpha: true,
			antialias: true,
		});

		renderer.current.toneMappingExposure = 0.5;

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		controls.current.enablePan = false;
		// controls.current.minPolarAngle = THREE.MathUtils.degToRad(60);
		// controls.current.maxPolarAngle = THREE.MathUtils.degToRad(90);
		controls.current.minDistance = 2;
		controls.current.maxDistance = 1000;
		controls.current.enableDamping = true;

		renderer.current.setSize(viewWidth, viewHeight);
	}

	return (
		<div className="glb-model">
			<canvas ref={canvasRef} />
		</div>
	);
}
