import { useEffect, useRef } from "react";
import * as THREE from "three";

import { loadFBX } from "./ropes";
// import { dumpObject } from "./ropes";

export default function FBXPlayer(props) {
	const { scene, camera, renderer, controls } = props;

	const figure = useRef(null);
	const mixer = useRef(null);

	const clock = new THREE.Clock();

	useEffect(() => {
		// const modelpath =
		// 	process.env.PUBLIC_URL + "/models/fbx/KettlebellSwing.fbx";
		const modelpath =
			process.env.PUBLIC_URL + "/models/fbx/BicycleCrunch.fbx";

		loadFBX(modelpath).then((model) => {
			model.position.set(0, -150, 0);
			model.rotation.set(0, -1.2, 0);

			mixer.current = new THREE.AnimationMixer(model);

			const clipAction = mixer.current.clipAction(model.animations[1]);
			clipAction.setLoop(THREE.LoopOnce);
			clipAction.clampWhenFinished = true;
			clipAction.enable = true;

			console.log(model.animations[1]);

			clipAction.play();

			scene.current.add(model);

			animate();
		});

		// const fbxLoader = new FBXLoader();
		// fbxLoader.load(
		// 	process.env.PUBLIC_URL + "/models/KettlebellSwing.fbx",
		// 	(object) => {
		// 		// object.traverse(function (child) {
		// 		//     if ((child as THREE.Mesh).isMesh) {
		// 		//         // (child as THREE.Mesh).material = material
		// 		//         if ((child as THREE.Mesh).material) {
		// 		//             ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).transparent = false
		// 		//         }
		// 		//     }
		// 		// })
		// 		// object.scale.set(.01, .01, .01)
		// 		scene.current.add(object);
		// 	},
		// 	(xhr) => {
		// 		console.log((xhr.loaded / xhr.total) * 100 + "% loaded");

		// 		// animate();
		// 	},
		// 	(error) => {
		// 		console.log(error);
		// 	}
		// );
	}, []);

	function animate() {
		requestAnimationFrame(animate);

		const delta = clock.getDelta();

		if (mixer.current) mixer.current.update(delta);

		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	return <div></div>;
}
