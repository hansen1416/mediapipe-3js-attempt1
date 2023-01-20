import { Vector2, Vector3 } from "three";
import {
	distanceBetweenPoints,
	BlazePoseKeypointsValues
} from "./ropes";

export default class PoseSync {
    constructor(animation_data) {
        this.animation_data = animation_data
    }

    keypointsDistances(keypoints3D) {
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

		return distances;
	}


    modelBonesDistances(bones) {
		const upper = [
			"upperarm_l",
			"upperarm_r",
			"lowarm_l",
			"lowarm_r",
			"hand_l",
			"hand_r",
			"thigh_l",
			"thigh_r",
		];

		const distances = [];

		for (let i = 0; i < upper.length - 1; i++) {
			for (let j = i + 1; j < upper.length; j++) {
				const v1 = new Vector3();
				const v2 = new Vector3();

				bones[upper[i]].getWorldPosition(v1);
				bones[upper[j]].getWorldPosition(v2);

				distances.push(distanceBetweenPoints(v1, v2));
			}
		}

		return distances;
	}


    compare(keypoints3D, bones) {
        const d1 = this.keypointsDistances(keypoints3D);

        const d2 = this.modelBonesDistances(bones);

        const ratio = d1[0] / d2[0];

        for (const i in d2) {
            d2[i] *= ratio;
        }

        const unit1 = d1[0];

        for (const i in d1) {
            d1[i] /= unit1;
        }

        const unit2 = d2[0];

        for (const i of d2) {
            d2[i] /= unit2;
        }

        let diff = 0;

        // console.log(d1, d2);

        for (let i in d1) {
            diff += Math.abs(d1[i] - d2[i]) ** 2;
        }

        return parseInt(100 * diff);
    }
}
