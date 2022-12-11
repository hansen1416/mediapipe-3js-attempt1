import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { loadFBX, loadObj } from "./ropes";
// import { dumpObject } from "./ropes";

export default function FBXPlayer(props) {
	const { scene, camera, renderer, controls } = props;

	const figure = useRef(null);
	const mixer = useRef(null);

	const [animationJsons, setanimationJsons] = useState([]);

	const clock = new THREE.Clock();

	useEffect(() => {
		const modelpath =
			// process.env.PUBLIC_URL + "/models/fbx/KettlebellSwing.fbx";
			// process.env.PUBLIC_URL + "/models/fbx/BicycleCrunch.fbx";
			process.env.PUBLIC_URL + "/models/fbx/JumpingJacks.fbx";

		const modelPromise = loadFBX(modelpath);

		const aminationPath =
			process.env.PUBLIC_URL + "/json/JumpingJacks.json";

		const promiseJumpingJacks = loadObj(aminationPath);

		Promise.all([modelPromise, promiseJumpingJacks]).then((values) => {
			const [model, jsonJumpingJacks] = values;

			figure.current = model;

			figure.current.position.set(0, -150, 0);

			mixer.current = new THREE.AnimationMixer(figure.current);

			scene.current.add(figure.current);

			setanimationJsons([jsonJumpingJacks]);

			animate();
		});

		// .then((jsonObj) => {

		// });

		// .then((model) => {

		// });

		// eslint-disable-next-line
	}, []);

	function animate() {
		requestAnimationFrame(animate);

		const delta = clock.getDelta();

		if (mixer.current) mixer.current.update(delta);

		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	function playAnimation(jsonObj) {
		const actionJumpingJacks = mixer.current.clipAction(
			THREE.AnimationClip.parse(jsonObj)
		);
		actionJumpingJacks.setLoop(THREE.LoopOnce);
		actionJumpingJacks.clampWhenFinished = true;
		actionJumpingJacks.enable = true;

		actionJumpingJacks.play();
	}

	return (
		<div>
			<div className="btn-box">
				{animationJsons.map((jsonObj) => {
					return (
						<button
							key={jsonObj.name}
							onClick={() => {
								playAnimation(jsonObj);
							}}
						>
							{jsonObj.name}
						</button>
					);
				})}
			</div>
		</div>
	);
}
