import { useEffect, useRef } from "react";

import { BVHLoader } from "./BVHLoader";

export default function BVHPlayer(props) {
	const { scene, renderer, camera } = props;

	useEffect(() => {
		const loader = new BVHLoader();
		loader.load(
			process.env.PUBLIC_URL + "/models/out.bvh",
			function (result) {
				skeletonHelper = new THREE.SkeletonHelper(
					result.skeleton.bones[0]
				);
				skeletonHelper.skeleton = result.skeleton; // allow animation mixer to bind to THREE.SkeletonHelper directly

				// const boneContainer = new THREE.Group();
				// boneContainer.add(result.skeleton.bones[0]);

				// scene.add(skeletonHelper);
				// scene.add(boneContainer);

				// // play animation
				// mixer = new THREE.AnimationMixer(skeletonHelper);
				// mixer.clipAction(result.clip).setEffectiveWeight(1.0).play();
			}
		);
	}, []);
}
