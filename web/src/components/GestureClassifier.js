// import * as THREE from "three";
import { distanceBetweenPoints } from "./ropes";

function keypointsDistances(
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

function modelBonesDistances(
	bones,
	compare_upper = true,
	compare_lower = false
) {
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

export function isDefence(bones) {
	const defence_standard_distances = [];

    const bones_distances = modelBonesDistances(bones)

    // get pearson correlation, value between -1,1
	return pearson_corr(defence_standard_distances, bones_distances) * 100;
}

export function isAttack() {
    const attack_standard_distances = [];

    const bones_distances = modelBonesDistances(bones)

    // get pearson correlation, value between -1,1
	return pearson_corr(attack_standard_distances, bones_distances) * 100;
}
