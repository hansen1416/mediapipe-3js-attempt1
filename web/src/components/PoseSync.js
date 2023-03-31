import { Vector2, Vector3 } from "three";
import {
	distanceBetweenPoints,
	BlazePoseKeypointsValues,
	isUpperBodyVisible,
	isLowerBodyVisible,
	pearson_corr,
	array_average,
} from "./ropes";
import * as THREE from "three";

export default class PoseSync {
	#bufferStepThreshold = 10;
	#bufferStep = 10;
	// #longestTrack = 0;

	diffScore = 0;
	poseSpline = null;
	bnoneSpline = null;

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
		spline=false
	) {
		const compare_upper = isUpperBodyVisible(pose3D);
		const compare_lower = isLowerBodyVisible(pose3D);

		if (!compare_upper && !compare_lower) {
			return false
		}

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

		/**
		 * because the bone structure are different
		 * simply scale them by shoulder distance will result in large error
		 * pearsn correlation is regardless of the scale
		 */
		this.diffScore = pearson_corr(d1, d2) * 100;

		// spline visual aid
		if (spline) {
			this.generateSpline(d1, d2)
		}
		
		/**
		 * when `diffScore` >= `scoreThreshold`, correlation is higher than threshold, current frame is a pass
		 * when current frame is failed, `#bufferStep` accumulate
		 * when `#bufferStep` exceeds `#bufferStepThreshold` stop animation
		 */
		if (this.diffScore >= scoreThreshold) {
			this.#bufferStep = 0;
		} else {
			this.#bufferStep += 1;
		}

		return this.#bufferStep < this.#bufferStepThreshold;
	}

	generateSpline(d1, d2) {
		const avg1 = array_average(d1);

		for (const i in d1) {
			d1[i] /= avg1;
		}

		const avg2 = array_average(d2);

		for (const i in d2) {
			d2[i] /= avg2;
		}

		const d1v2 = [];
		const d2v2 = [];
		let x = 0;

		for (let i in d1) {
			d1v2.push(new Vector2(x, d1[i]));
			d2v2.push(new Vector2(x, d2[i]));

			x += 0.1;
		}

		this.poseSpline = new THREE.SplineCurve(d1v2);
		this.boneSpline = new THREE.SplineCurve(d2v2);
	}
}
