import * as THREE from "three";

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

	spineSlerp(){

		const q = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(0,0,0)
		);

		

		const qq = this.q_init['Hips'].slerp(q, 10)

		console.log(qq, this.q_init['Hips']);
	}
}
