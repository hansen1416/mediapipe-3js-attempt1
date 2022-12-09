import { useEffect, useRef } from "react";
// import * as THREE from "three";
// import { POSE_LANDMARKS } from "@mediapipe/pose";

// import { loadGLTF, posePositionToVector } from "./ropes";
import { loadGLTF } from "./ropes";
import Figure from "../models/Figure";
import Abdomen1 from "../models/Abdomen1";

export default function MotionMaker(props) {
	const { scene, renderer, camera } = props;

	const figure = useRef(null);

	// const posedata = useRef([]);
	// const poseidx = useRef(0);
	// const animationFramePointer = useRef(0);
	// const animationStep = useRef(0);
	// const speed = useRef(3);

	useEffect(() => {
		loadGLTF(process.env.PUBLIC_URL + "/models/my.glb").then((gltf) => {
			const avatar = gltf.scene.children[0];

			// console.log(dumpObject(avatar));

			// travelModel(avatar);

			avatar.position.set(0, -1.5, 0);

			scene.current.add(avatar);

			figure.current = new Figure(avatar);

			const motion = new Abdomen1().initPose();

			figure.current.makePoseFromQuaternion(motion)

			renderer.current.render(scene.current, camera.current);

			// fetchPose("800-900");
		});
		// eslint-disable-next-line
	}, []);

	// function playPose() {
	// 	if (animationStep.current % speed.current === 0) {
	// 		// moveSpine(posedata.current[poseidx.current]);

	// 		// moveArmHand(posedata.current[poseidx.current], "Left");
	// 		// moveArmHand(posedata.current[poseidx.current], "Right");

	// 		// moveLegFoot(posedata.current[poseidx.current], "Left");
	// 		// moveLegFoot(posedata.current[poseidx.current], "Right");

	// 		figure.current.makePose(posedata.current[poseidx.current]);

	// 		renderer.current.render(scene.current, camera.current);

	// 		poseidx.current += 1;
	// 	}

	// 	animationStep.current += 1;

	// 	if (poseidx.current >= posedata.current.length) {
	// 		poseidx.current = 0;
	// 		animationStep.current = 0;

	// 		// animationFramePointer.current = requestAnimationFrame(playPose);
	// 		cancelAnimationFrame(animationFramePointer.current);
	// 	} else {
	// 		animationFramePointer.current = requestAnimationFrame(playPose);
	// 	}
	// }

	return (
		<div>
			<div className="btn-box">
				<button onClick={() => {}}>action1</button>
			</div>
		</div>
	);
}
