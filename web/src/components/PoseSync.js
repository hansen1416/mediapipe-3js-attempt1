import { Vector2, Vector3 } from "three";
import {
	distanceBetweenPoints,
	BlazePoseKeypointsValues
} from "./ropes";
import * as THREE from "three";

export default class PoseSync {

	#scoreThreshold = 150;
	#bufferThreshold = 50;
	#bufferStep = 50;
	#animationIndx = 0;
	#longestTrack = 0;

	diffScore = 0;
	poseSpline = null;
	bnoneSpline = null;

    constructor(animation_data, ) {
        this.animation_data = animation_data;

		for (const v of animation_data.tracks) {
			if (v.type === "quaternion" && v.quaternions.length > this.#longestTrack) {
				this.#longestTrack = v.quaternions.length;
			}
		}
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


    animationFrame(pose3D, bones) {
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

		this.poseSpline = new THREE.SplineCurve(d1v2);
		this.boneSpline = new THREE.SplineCurve(d2v2);

		// poseGeometry.setFromPoints(.getPoints(50));
		// bonesGeometry.setFromPoints(new THREE.SplineCurve(d2v2).getPoints(50));

        let diff = 0;

        // console.log(d1, d2);

        for (let i in d1) {
            diff += Math.abs(d1[i] - d2[i]) ** 2;
        }

		this.diffScore = 100 * diff

        if (this.diffScore <= this.#scoreThreshold) {

			this.#bufferStep = 0;

		} else {

			this.#bufferStep += 1;
		}

		if (this.#bufferStep < this.#bufferThreshold) {

			const animationFrameData = {};

			for (let item of this.animation_data.tracks) {

				const item_name = item["name"].split(".")[0];
				
				if (item["type"] === "vector") {
					if (this.#animationIndx < item["vectors"].length) {
						animationFrameData[item_name] = item["vectors"][this.#animationIndx]
					} else {
						animationFrameData[item_name] = item["vectors"][item["vectors"].length - 1]
					}
				}
		
				if (item["type"] === "quaternion") {
					if (this.#animationIndx < item["quaternions"].length) {
						animationFrameData[item_name] = item["quaternions"][this.#animationIndx]
					} else {
						animationFrameData[item_name] = item["quaternions"][item["quaternions"].length - 1]
					}
				}
			}

			this.#animationIndx += 1;

			if (this.#animationIndx >= this.#longestTrack) {
				this.#animationIndx = 0;
			}

			return animationFrameData;
		}

		return null;
    }
}
