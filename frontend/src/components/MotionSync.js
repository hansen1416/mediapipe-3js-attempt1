import { useEffect, useRef } from "react";
// import { Quaternion, Vector3, Matrix4, MathUtils } from "three";
// import { POSE_LANDMARKS } from "@mediapipe/pose";

import { loadFBX } from "./ropes";

export default function MotionSync(props) {
	const { scene, camera, renderer, controls } = props;

	const figure = useRef(null);

	function animate() {
		requestAnimationFrame(animate);

		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	useEffect(() => {
		loadFBX(process.env.PUBLIC_URL + "/fbx/YBot.fbx").then((model) => {
			figure.current = model;

			figure.current.position.set(0, -100, 0);

			scene.current.add(figure.current);
		});

		setTimeout(() => {
			animate();
		}, 0);

		// eslint-disable-next-line
	}, []);
}
