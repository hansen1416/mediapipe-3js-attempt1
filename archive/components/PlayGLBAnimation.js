import { useEffect, useRef } from "react";

import { loadGLTF } from "./ropes";

import * as THREE from "three";

export default function PlayGLBAnimation(props) {
	const { scene, camera, renderer, controls } = props;

	const counter = useRef(-1);

	const mixer = useRef(null);

	const clock = new THREE.Clock();

	useEffect(() => {
		Promise.all([
			loadGLTF(process.env.PUBLIC_URL + "/glb/punch-walk.glb"),
		]).then(([gltf]) => {
			const model = gltf.scene.children[0];

			const animations = gltf.animations;

			// console.log(animations);

			// model.position.set(-100, -100, 0);
			model.position.set(0, 0, 0);
			camera.current.position.set(0, 0, 4);

			// console.log(model);

			scene.current.add(model);

			mixer.current = new THREE.AnimationMixer(model);

			mixer.current.stopAllAction();

			const action = mixer.current.clipAction(animations[0]);

			action.reset();
			// action.setLoop(THREE.LoopOnce);

			// action.halt(1);

			// will restore the origin position of model during `time`
			// action.fadeOut(4);

			// controls how long the animation plays
			// action.setDuration(1);

			// keep model at the position where it stops
			action.clampWhenFinished = true;

			action.enable = true;

			action.play();
		});

		setTimeout(() => {
			animate();
		}, 0);

		// eslint-disable-next-line
	}, []);

	function animate() {
		requestAnimationFrame(animate);

		const delta = clock.getDelta();

		if (mixer.current) mixer.current.update(delta);

		counter.current += 1;

		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	return (
		<div>
			<div className="btn-box"></div>
		</div>
	);
}
