import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
	AnimationClip,
	AnimationMixer,
	QuaternionKeyframeTrack,
	Quaternion,
} from "three";

// import { loadGLTF, posePositionToVector } from "./ropes";
import { loadGLTF } from "./ropes";
import Figure from "../models/Figure";
import Abdomen1 from "../models/Abdomen1";

export default function MotionMaker(props) {
	const { scene, camera, renderer, controls } = props;

	const figure = useRef(null);
	const mixer = useRef(null);

	const clock = new THREE.Clock();

	useEffect(() => {
		loadGLTF(process.env.PUBLIC_URL + "/models/my.glb").then((gltf) => {
			const avatar = gltf.scene.children[0];

			// console.log(dumpObject(avatar));

			avatar.position.set(0, -1.5, 0);

			scene.current.add(avatar);

			figure.current = new Figure(avatar);

			// x-axis: red, y-axis: green, z-axis:blue
			const axesHelper = new THREE.AxesHelper(1);
			figure.current.parts["Hips"].add(axesHelper);

			const axesHelper1 = new THREE.AxesHelper(1);
			// figure.current.parts["LeftUpLeg"].add(axesHelper1);
			// scene.current.add(axesHelper)

			animate();
		});
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

	function playAction() {
		const motion = new Abdomen1();

		figure.current.makePoseFromQuaternion(motion.initPose());

		// const q = motion.spineSlerp();

		// spine animation
		let q_hips_init = motion.q_init["Hips"];

		const q_hips_target = new Quaternion().setFromEuler(
			new THREE.Euler(-Math.PI / 4, -Math.PI / 2, 0, "YXZ")
		);

		// figure.current.parts["Hips"].setRotationFromQuaternion(q_hips_target);

		// console.log("q_hips_init", q_hips_init);
		// console.log("q_hips_target", q_hips_target);

		const times = [0, 1];
		const values = [
			q_hips_init.x,
			q_hips_init.y,
			q_hips_init.z,
			q_hips_init.w,

			q_hips_init.w,
			q_hips_init.x,
			q_hips_init.y,
			q_hips_init.z,
		];

		// for (let i = 10; i > 0; i--) {
		// 	const q = new Quaternion().slerpQuaternions(
		// 		q_hips_init,
		// 		q_hips_target,
		// 		i
		// 	);

		// 	// console.log(q);

		// 	q_hips_init = q;

		// 	values.push(q.w, q.x, q.y, q.z);
		// 	times.push(10 - i);
		// }

		// console.log(values);

		const spine_anim_q = new QuaternionKeyframeTrack(
			".quaternion",
			times,
			values
		);

		const tracks = [spine_anim_q];

		// console.log(tracks);

		const spine_anim_clip = new AnimationClip("spine", -1, tracks);

		mixer.current = new AnimationMixer(figure.current.parts["Hips"]);

		// create a ClipAction and set it to play
		const clipAction = mixer.current.clipAction(spine_anim_clip);
		clipAction.play();

		// figure.current.parts["Hips"].applyQuaternion(q);

		// console.log()
	}

	return (
		<div>
			<div className="btn-box">
				<button
					onClick={() => {
						playAction();
					}}
				>
					action1
				</button>
			</div>
		</div>
	);
}
