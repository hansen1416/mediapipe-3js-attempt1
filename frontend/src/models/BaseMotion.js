import * as THREE from "three";
import { Euler } from "three";

export default class BaseMotion {

    q_init = {
		Hips: null,
		Spine: null,
		Spine1: null,
		Spine2: null,
		Neck: null,
		Head: null,
		LeftShoulder: null,
		LeftArm: null,
		LeftForeArm: null,
		LeftHand: null,
		LeftHandThumb1: null,
		LeftHandThumb2: null,
		LeftHandThumb3: null,
		LeftHandThumb4: null,
		LeftHandIndex1: null,
		LeftHandIndex2: null,
		LeftHandIndex3: null,
		LeftHandIndex4: null,
		LeftHandMiddle1: null,
		LeftHandMiddle2: null,
		LeftHandMiddle3: null,
		LeftHandMiddle4: null,
		LeftHandRing1: null,
		LeftHandRing2: null,
		LeftHandRing3: null,
		LeftHandRing4: null,
		LeftHandPinky1: null,
		LeftHandPinky2: null,
		LeftHandPinky3: null,
		LeftHandPinky4: null,
		RightShoulder: null,
		RightArm: null,
		RightForeArm: null,
		RightHand: null,
		RightHandThumb1: null,
		RightHandThumb2: null,
		RightHandThumb3: null,
		RightHandThumb4: null,
		RightHandIndex1: null,
		RightHandIndex2: null,
		RightHandIndex3: null,
		RightHandIndex4: null,
		RightHandMiddle1: null,
		RightHandMiddle2: null,
		RightHandMiddle3: null,
		RightHandMiddle4: null,
		RightHandRing1: null,
		RightHandRing2: null,
		RightHandRing3: null,
		RightHandRing4: null,
		RightHandPinky1: null,
		RightHandPinky2: null,
		RightHandPinky3: null,
		RightHandPinky4: null,
		LeftUpLeg: null,
		LeftLeg: null,
		LeftFoot: null,
		RightUpLeg: null,
		RightLeg: null,
		RightFoot: null,
	};
    
    constructor() {
    }

	spineFlatFaceUp() {
		let SE0 = new THREE.Matrix4().makeBasis(
			new THREE.Vector3(1, 0, 0),
			new THREE.Vector3(0, 1, 0),
			new THREE.Vector3(0, 0, 1)
		);

		let SE1 = new THREE.Matrix4().makeBasis(
			new THREE.Vector3(0, 0, 1),
			new THREE.Vector3(1, 0, 0),
			new THREE.Vector3(0, 1, 0)
		);

		this.q_init['Hips'] = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);
	}

	handsHoldHeadBack() {
		const q_lshoulder = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(Math.PI/6, 0, -Math.PI/3)
		);

		const q_larm = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(0, 0, Math.PI/10)
		);

		const q_lforearm = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(Math.PI/10, -Math.PI/10, Math.PI * 0.8)
		);

		const q_lhand = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(0,0,0)
		);

		const q_rshoulder = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(Math.PI/6, 0, Math.PI/3)
		);

		const q_rarm = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(0, 0, -Math.PI/10)
		);

		const q_rforearm = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(Math.PI/10, Math.PI/10, -Math.PI * 0.8)
		);

		const q_rhand = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(0,0,0)
		);

		this.q_init['LeftShoulder'] = q_lshoulder;
		this.q_init['LeftArm'] =q_larm;
		this.q_init['LeftForeArm']= q_lforearm;
		this.q_init['LeftHand'] =q_lhand;
		this.q_init['RightShoulder']= q_rshoulder;
		this.q_init['RightArm'] =q_rarm;
		this.q_init['RightForeArm']= q_rforearm;
		this.q_init['RightHand'] =q_rhand;
	}

	legsCurveHorizontal() {
		const q_lthigh = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(Math.PI - Math.PI / 4, Math.PI + 0.1, 0.12)
		);

		const q_lcrus = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(- Math.PI / 2, 0, 0)
		);

		const q_lfoot = new THREE.Quaternion().setFromEuler(
			new Euler(0.2536740961386427,0,0)
		);

		const q_rthigh = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(Math.PI - Math.PI / 4, Math.PI - 0.1, -0.12)
		);

		const q_rcrus = new THREE.Quaternion().setFromEuler(
			new THREE.Euler(- Math.PI / 2, 0, 0)
		);

		const q_rfoot = new THREE.Quaternion().setFromEuler(
			new Euler(0.2536740961386427,0,0)
		);

		this.q_init['LeftUpLeg']= q_lthigh;
		this.q_init['LeftLeg']= q_lcrus;
		this.q_init['LeftFoot']= q_lfoot;
		this.q_init['RightUpLeg']= q_rthigh;
		this.q_init['RightLeg']= q_rcrus;
		this.q_init['RightFoot']= q_rfoot;
	}
}