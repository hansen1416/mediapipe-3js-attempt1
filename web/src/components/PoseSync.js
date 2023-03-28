import { Vector2, Vector3 } from "three";
import {
	distanceBetweenPoints,
	BlazePoseKeypointsValues,
	isLowerBodyVisible,
} from "./ropes";
import * as THREE from "three";

export default class PoseSync {
	#bufferStepThreshold = 10;
	#bufferStep = 10;
	#longestTrack = 0;

	diffScore = 0;
	poseSpline = null;
	bnoneSpline = null;

	constructor(animation_data) {
		// this.animation_data = animation_data;

		// for (const v of animation_data.tracks) {
		// 	if (
		// 		v.type === "quaternion" &&
		// 		v.quaternions.length > this.#longestTrack
		// 	) {
		// 		this.#longestTrack = v.quaternions.length;
		// 	}
		// }
	}

	keypointsDistances(
		keypoints3D,
		compare_upper = true,
		compare_lower = false
	) {
		const upper = [
			"LEFT_SHOULDER",
			"RIGHT_SHOULDER",
			"LEFT_ELBOW",
			"RIGHT_ELBOW",
			"LEFT_WRIST",
			"RIGHT_WRIST",
			"LEFT_HIP",
			"RIGHT_HIP",
		];

		const lower = [
			"LEFT_HIP",
			"RIGHT_HIP",
			"LEFT_KNEE",
			"RIGHT_KNEE",
			"LEFT_ANKLE",
			"RIGHT_ANKLE",
		];

		const distances = [];

		if (compare_upper) {
			for (let i = 0; i < upper.length - 1; i++) {
				for (let j = i + 1; j < upper.length; j++) {
					distances.push(
						distanceBetweenPoints(
							keypoints3D[BlazePoseKeypointsValues[upper[i]]],
							keypoints3D[BlazePoseKeypointsValues[upper[j]]]
						)
					);
				}
			}
		}

		if (compare_lower) {
			for (let i = 0; i < lower.length - 1; i++) {
				for (let j = i + 1; j < lower.length; j++) {
					distances.push(
						distanceBetweenPoints(
							keypoints3D[BlazePoseKeypointsValues[lower[i]]],
							keypoints3D[BlazePoseKeypointsValues[lower[j]]]
						)
					);
				}
			}
		}

		return distances;
	}

	modelBonesDistances(bones, compare_upper = true, compare_lower = false) {
		const upper = [
			"LeftArm",
			"RightArm",
			"LeftForeArm",
			"RightForeArm",
			"LeftHand",
			"RightHand",
			"LeftUpLeg",
			"RightUpLeg",
		];

		const lower = [
			"LeftUpLeg",
			"RightUpLeg",
			"LeftLeg",
			"RightLeg",
			"LeftFoot",
			"RightFoot",
		];

		const distances = [];

		if (compare_upper) {
			for (let i = 0; i < upper.length - 1; i++) {
				for (let j = i + 1; j < upper.length; j++) {
					const v1 = new Vector3();
					const v2 = new Vector3();

					bones[upper[i]].getWorldPosition(v1);
					bones[upper[j]].getWorldPosition(v2);

					distances.push(distanceBetweenPoints(v1, v2));
				}
			}
		}

		if (compare_lower) {
			for (let i = 0; i < lower.length - 1; i++) {
				for (let j = i + 1; j < lower.length; j++) {
					const v1 = new Vector3();
					const v2 = new Vector3();

					bones[lower[i]].getWorldPosition(v1);
					bones[lower[j]].getWorldPosition(v2);

					distances.push(distanceBetweenPoints(v1, v2));
				}
			}
		}

		return distances;
	}

	compareCurrentPose(
		pose3D,
		bones,
		scoreThreshold,
		compare_upper = true,
		compare_lower = false
	) {
		compare_lower = isLowerBodyVisible(pose3D);

		const d1 = this.keypointsDistances(
			pose3D,
			compare_upper,
			compare_lower
		);

		const d2 = this.modelBonesDistances(
			bones,
			compare_upper,
			compare_lower
		);

		const ratio = d1[0] / d2[0];

		for (const i in d2) {
			d2[i] *= ratio;
		}

		const unit1 = d1[0];

		for (const i in d1) {
			d1[i] /= unit1;
		}

		const unit2 = d2[0];

		for (const i in d2) {
			d2[i] /= unit2;
		}

		const d1v2 = [];
		const d2v2 = [];
		let x = 0;

		for (let i in d1) {
			// d1v2.push(new Vector2(x, d1[i] * 50));
			// d2v2.push(new Vector2(x, d2[i] * 50));

			d1v2.push(new Vector2(x, d1[i]));
			d2v2.push(new Vector2(x, d2[i]));

			x += 0.1;
		}

		this.poseSpline = new THREE.SplineCurve(d1v2);
		this.boneSpline = new THREE.SplineCurve(d2v2);

		let diff = 0;

		// console.log(d1, d2);

		for (let i in d1) {
			diff += Math.abs(d1[i] - d2[i]) ** 2;
		}

		this.diffScore = 100 * diff;

		if (this.diffScore <= scoreThreshold) {
			this.#bufferStep = 0;
		} else {
			this.#bufferStep += 1;
		}

		return this.#bufferStep < this.#bufferStepThreshold;
	}
}
