import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { loadFBX, traverseModel } from "./ropes";

export default function FBXTunning(props) {
	const { scene, camera, renderer, controls } = props;

	const figure = useRef(null);

	const bodyParts = useRef({});

	useEffect(() => {
		const modelpath =
			// process.env.PUBLIC_URL + "/fbx/XBot.fbx";
			process.env.PUBLIC_URL + "/fbx/YBot.fbx";

		loadFBX(modelpath).then((model) => {
			figure.current = model;

			figure.current.position.set(0, -100, 0);

			traverseModel(figure.current, bodyParts.current);

			console.log(bodyParts.current);

			scene.current.add(figure.current);

			animate();
		});
	}, []);

	function animate() {
		requestAnimationFrame(animate);

		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	return <div></div>;
}
