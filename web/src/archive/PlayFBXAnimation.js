import { useEffect, useRef } from "react";

import { loadFBX } from "./ropes";

import * as THREE from "three";

export default function PlayFBXAnimation(props) {
	const { scene, camera, renderer, controls } = props;

	const counter = useRef(-1);

	const mixer = useRef(null);

	const clock = new THREE.Clock();

	useEffect(() => {
		Promise.all([
			loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
			loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
		]).then(([model, mini_model]) => {
			const animations = model.animations;

			model.position.set(0, -100, 0);
			camera.current.position.set(0, 0, 900);

			scene.current.add(model);

			// const mini_model = model.clone(true);
			mini_model.position.set(800, 300, 0);

			scene.current.add(mini_model);

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
