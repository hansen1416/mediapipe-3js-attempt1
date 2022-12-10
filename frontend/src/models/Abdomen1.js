import * as THREE from "three";
import {
	AnimationClip,
	AnimationMixer,
	QuaternionKeyframeTrack,
	Quaternion,
} from "three";

import BaseMotion from "./BaseMotion";

export default class Abdomen1 extends BaseMotion {
	constructor() {
		super();
	}

	initPose() {
		this.spineFlatFaceUp();
		this.handsHoldHeadBack();
		this.legsCurveHorizontal();

		return this.q_init;
	}

	spineSlerp() {
		let q_hips_init = this.q_init["Hips"];

		const q_hips_target = new Quaternion()
			.setFromEuler(new THREE.Euler(0, 0, 0.5))
			.multiply(q_hips_init);

		console.log("q_hips_init", q_hips_init);
		console.log("q_hips_target", q_hips_target);

		const times = [0, 1, 2];
		const values = [];

		for (let i = 10; i > 0; i--) {
			const q = new Quaternion().slerpQuaternions(
				q_hips_init,
				q_hips_target,
				i
			);

			q_hips_init = q;

			values.push(q);
		}

		console.log(values);

		const spine_anim_q = new QuaternionKeyframeTrack(
			".quaternion",
			times,
			values
		);

		const tracks = [spine_anim_q];

		const spine_anim = new AnimationClip("spine", -1, tracks);

		return q_hips_target;
	}
}
