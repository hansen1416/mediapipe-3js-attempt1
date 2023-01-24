import { Vector2, Vector3 } from "three";
import {
	distanceBetweenPoints,
	BlazePoseKeypointsValues
} from "./ropes";
import * as THREE from "three";

export default class PoseSync {
    constructor(animation_data) {
        this.animation_data = animation_data
    }

    keypointsDistances(keypoints3D) {

		for (let v of keypoints3D) {
			v["x"] *= -1;
			v["y"] *= -1;
			v["z"] *= -1;
		}

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
			"lowerarm_l",
			"lowerarm_r",
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


    compare(pose3D, bones, poseGeometry, bonesGeometry) {
        const d1 = this.keypointsDistances(pose3D);

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

        for (const i in d2) {
            d2[i] /= unit2;
        }

		const d1v2 = []
		const d2v2 = []
		let x = 0

		for (let i in d1) {
			d1v2.push(new Vector2(x, d1[i] * 50))
			d2v2.push(new Vector2(x, d2[i] * 50))

			x += 10;
		}

		poseGeometry.setFromPoints(new THREE.SplineCurve(d1v2).getPoints(50));
		bonesGeometry.setFromPoints(new THREE.SplineCurve(d2v2).getPoints(50));

        let diff = 0;

        // console.log(d1, d2);

        for (let i in d1) {
            diff += Math.abs(d1[i] - d2[i]) ** 2;
        }

        return parseInt(100 * diff);
    }
}
