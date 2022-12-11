import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { loadFBX, loadObj, traverseModel } from "./ropes";
// import { dumpObject } from "./ropes";

export default function FBXPlayer(props) {
	const { scene, camera, renderer, controls } = props;

	const figure = useRef(null);

	const mixer = useRef(null);

	// const initMatrix = useRef({});

	const [animationJsons, setanimationJsons] = useState([]);

	const clock = new THREE.Clock();

	useEffect(() => {
		const modelpath =
			// process.env.PUBLIC_URL + "/models/fbx/StandingUp.fbx";
			process.env.PUBLIC_URL + "/models/fbx/JumpingJacks.fbx";

		const modelPromise = loadFBX(modelpath);

		const animations = [
			"BicycleCrunch",
			"Capoeira",
			"HipHopDancing",
			"JumpingJacks",
			"KettlebellSwing",
			"Situps",
			"SitupToIdle",
			"Snatch",
			"StandingUp",
		];
		const animationsPromises = [];

		for (let name of animations) {
			animationsPromises.push(
				loadObj(process.env.PUBLIC_URL + "/json/" + name + ".json")
			);
		}

		// first promise is loading the model figure,
		// thre reset of em is the animation json
		Promise.all([modelPromise].concat(animationsPromises)).then(
			(values) => {
				const [model] = values;

				// console.log(initMatrix.current);

				// traverseModel(model, initMatrix.current);

				// console.log(initMatrix);

				figure.current = model;

				figure.current.position.set(0, -150, 0);

				mixer.current = new THREE.AnimationMixer(figure.current);

				scene.current.add(figure.current);

				setanimationJsons(values.slice(1));

				animate();
			}
		);

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
		// restorePose(figure.current);

		mixer.current.stopAllAction();

		const action = mixer.current.clipAction(
			THREE.AnimationClip.parse(jsonObj)
		);

		action.reset();
		action.setLoop(THREE.LoopOnce);

		// action.halt(1);

		// will restore the origin position of model during `time`
		// action.fadeOut(4);

		// controls how long the animation plays
		// action.setDuration(1);

		// keep model at the position where it stops
		action.clampWhenFinished = true;

		action.enable = true;

		action.play();
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
