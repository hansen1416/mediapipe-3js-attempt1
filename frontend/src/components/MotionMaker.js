import { useEffect, useRef } from "react";
import * as THREE from "three";
// import { POSE_LANDMARKS } from "@mediapipe/pose";

// import { loadGLTF, posePositionToVector } from "./ropes";
import { loadGLTF } from "./ropes";
import Figure from "../models/Figure";
import Abdomen1 from "../models/Abdomen1";

export default function MotionMaker(props) {
	const { scene } = props;

	const figure = useRef(null);

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
		});
		// eslint-disable-next-line
	}, []);

	function playAction() {

		const motion = new Abdomen1();

		figure.current.makePoseFromQuaternion(motion.initPose());

		motion.spineSlerp()
	}

	return (
		<div>
			<div className="btn-box">
				<button onClick={() => {playAction()}}>action1</button>
			</div>
		</div>
	);
}
