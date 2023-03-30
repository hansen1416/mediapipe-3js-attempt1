import * as THREE from "three";

import {
	BlazePoseKeypointsValues,
	poseToVector,
	posePointsToVector,
	middlePosition,
} from "./ropes";

function basisFromTorso(left_shoulder, right_shoulder, left_hip, right_hip) {
	const left_oblique = new THREE.Vector3(
		(left_shoulder.x + left_hip.x) / 2,
		(left_shoulder.y + left_hip.y) / 2,
		(left_shoulder.z + left_hip.z) / 2
	);
	const right_oblique = new THREE.Vector3(
		(right_shoulder.x + right_hip.x) / 2,
		(right_shoulder.y + right_hip.y) / 2,
		(right_shoulder.z + right_hip.z) / 2
	);
	const center = new THREE.Vector3(
		(left_oblique.x + right_oblique.x) / 2,
		(left_oblique.y + right_oblique.y) / 2,
		(left_oblique.z + right_oblique.z) / 2
	);

	// new basis of chest from pose data
	const xaxis = new THREE.Vector3(
		left_shoulder.x - right_shoulder.x,
		left_shoulder.y - right_shoulder.y,
		left_shoulder.z - right_shoulder.z
	).normalize();

	const y_tmp = new THREE.Vector3(
		left_shoulder.x - center.x,
		left_shoulder.y - center.y,
		left_shoulder.z - center.z
	).normalize();

	const zaxis = new THREE.Vector3().crossVectors(xaxis, y_tmp).normalize();

	const yaxis = new THREE.Vector3().crossVectors(xaxis, zaxis).normalize();

	const chest_basis= new THREE.Matrix4().makeBasis(xaxis, yaxis, zaxis);

	// new basis of abs from pose data
	const xaxis3 = new THREE.Vector3(
		left_hip.x - right_hip.x,
		left_hip.y - right_hip.y,
		left_hip.z - right_hip.z
	).normalize();

	const y_tmp3 = new THREE.Vector3(
		center.x - left_hip.x,
		center.y - left_hip.y,
		center.z - left_hip.z
	).normalize();

	const zaxis3 = new THREE.Vector3().crossVectors(xaxis3, y_tmp3).normalize();

	const yaxis3 = new THREE.Vector3().crossVectors(zaxis3, xaxis3).normalize();

	const abs_basis= new THREE.Matrix4().makeBasis(xaxis3, yaxis3, zaxis3);

	return [chest_basis, abs_basis]
}

function boneToPoseMatrix(bones, pose3D) {
	const leftshoulder = new THREE.Vector3();

	bones["LeftArm"].getWorldPosition(leftshoulder);

	const rightshoulder = new THREE.Vector3();

	bones["RightArm"].getWorldPosition(rightshoulder);

	const leftHip = new THREE.Vector3();

	bones["LeftUpLeg"].getWorldPosition(leftHip);

	const rightHip = new THREE.Vector3();

	bones["RightUpLeg"].getWorldPosition(rightHip);

	const [chest_m0, abs_m0] = basisFromTorso(leftshoulder,
		rightshoulder,
		leftHip,
		rightHip
	)

	const [chest_m1, abs_m1] = basisFromTorso(pose3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]],
	pose3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]],
	pose3D[BlazePoseKeypointsValues["LEFT_HIP"]],
	pose3D[BlazePoseKeypointsValues["RIGHT_HIP"]]
	)

	const chest_m = chest_m1.multiply(chest_m0.invert());
	const abs_m = abs_m1.multiply(abs_m0.invert());

	return [chest_m, abs_m]
}

export default class PoseSyncVector {

	// constructor(animation_data) {
	// 	this.animationTracks = {};

	// 	for (const v of animation_data.tracks) {
	// 		this.animationTracks[v["name"]] = v;
	// 	}
	// }

	poseTorso(pose3D) {
		/**
		 * matrix that transfer the torso plane to original basis
		 * so that torso is plane formed by x,y axis and facing +z axis
		 */
		const rightshoulder = poseToVector(
			pose3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]]
		);
		const leftshoulder = poseToVector(
			pose3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]]
		);

		const righthip = poseToVector(
			pose3D[BlazePoseKeypointsValues["LEFT_HIP"]]
		);
		const lefthip = poseToVector(
			pose3D[BlazePoseKeypointsValues["RIGHT_HIP"]]
		);

		const pelvis = middlePosition(lefthip, righthip, false);

		const x_basis = posePointsToVector(leftshoulder, rightshoulder);
		const y_tmp = posePointsToVector(leftshoulder, pelvis);
		const z_basis = new THREE.Vector3()
			.crossVectors(x_basis, y_tmp)
			.normalize();

		const y_basis = new THREE.Vector3()
			.crossVectors(x_basis, z_basis)
			.normalize();

		// console.log("x_basis", x_basis, "y_basis", y_basis, "z_basis", z_basis);

		return new THREE.Matrix4()
			.makeBasis(x_basis, y_basis, z_basis)
			.invert();
	}

	pose3dlimbs(pose3D) {
		/**
		 * transfer joints positions to limbs vectors
		 */
		const left_shoulder = poseToVector(
			pose3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]]
		);
		const left_elbow = poseToVector(
			pose3D[BlazePoseKeypointsValues["LEFT_ELBOW"]]
		);
		const left_wrist = poseToVector(
			pose3D[BlazePoseKeypointsValues["LEFT_WRIST"]]
		);

		const right_shoulder = poseToVector(
			pose3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]]
		);
		const right_elbow = poseToVector(
			pose3D[BlazePoseKeypointsValues["RIGHT_ELBOW"]]
		);
		const right_wrist = poseToVector(
			pose3D[BlazePoseKeypointsValues["RIGHT_WRIST"]]
		);

		const left_hip = poseToVector(
			pose3D[BlazePoseKeypointsValues["LEFT_HIP"]]
		);
		const left_knee = poseToVector(
			pose3D[BlazePoseKeypointsValues["LEFT_KNEE"]]
		);
		const left_ankle = poseToVector(
			pose3D[BlazePoseKeypointsValues["LEFT_ANKLE"]]
		);

		const right_hip = poseToVector(
			pose3D[BlazePoseKeypointsValues["RIGHT_HIP"]]
		);
		const right_knee = poseToVector(
			pose3D[BlazePoseKeypointsValues["RIGHT_KNEE"]]
		);
		const right_ankle = poseToVector(
			pose3D[BlazePoseKeypointsValues["RIGHT_ANKLE"]]
		);

		const chestOrientation = posePointsToVector(
			left_shoulder,
			right_shoulder
		);

		const leftArmOrientation = posePointsToVector(
			left_elbow,
			left_shoulder
		);
		const leftForeArmOrientation = posePointsToVector(
			left_wrist,
			left_elbow
		);

		const rightArmOrientation = posePointsToVector(
			right_elbow,
			right_shoulder
		);
		const rightForeArmOrientation = posePointsToVector(
			right_wrist,
			right_elbow
		);

		const abdominalOrientation = posePointsToVector(left_hip, right_hip);

		const leftThighOrientation = posePointsToVector(left_hip, left_knee);
		const leftCalfOrientation = posePointsToVector(left_knee, left_ankle);

		const rightThighOrientation = posePointsToVector(right_hip, right_knee);
		const rightCalfOrientation = posePointsToVector(
			right_knee,
			right_ankle
		);

		const basisMatrix = this.poseTorso(pose3D);

		// todo, test the math here
		chestOrientation.applyMatrix4(basisMatrix);
		leftArmOrientation.applyMatrix4(basisMatrix);
		leftForeArmOrientation.applyMatrix4(basisMatrix);
		rightArmOrientation.applyMatrix4(basisMatrix);
		rightForeArmOrientation.applyMatrix4(basisMatrix);
		abdominalOrientation.applyMatrix4(basisMatrix);
		leftThighOrientation.applyMatrix4(basisMatrix);
		leftCalfOrientation.applyMatrix4(basisMatrix);
		rightThighOrientation.applyMatrix4(basisMatrix);
		rightCalfOrientation.applyMatrix4(basisMatrix);

		return [
			chestOrientation,
			leftArmOrientation,
			leftForeArmOrientation,
			rightArmOrientation,
			rightForeArmOrientation,
			abdominalOrientation,
			leftThighOrientation,
			leftCalfOrientation,
			rightThighOrientation,
			rightCalfOrientation,
		];
	}

	boneTorso(bones) {
		const leftshoulder = new THREE.Vector3();

		bones["LeftArm"].getWorldPosition(leftshoulder);

		const rightshoulder = new THREE.Vector3();

		bones["RightArm"].getWorldPosition(rightshoulder);

		const pelvis = new THREE.Vector3();

		bones["Hips"].getWorldPosition(pelvis);

		const x_basis = rightshoulder.sub(leftshoulder);
		const y_tmp = pelvis.sub(leftshoulder);
		const z_basis = new THREE.Vector3()
			.crossVectors(x_basis, y_tmp)
			.normalize();

		const y_basis = new THREE.Vector3()
			.crossVectors(x_basis, z_basis)
			.normalize();

		// console.log("x_basis", x_basis, "y_basis", y_basis, "z_basis", z_basis);

		return new THREE.Matrix4()
			.makeBasis(x_basis, y_basis, z_basis)
			.invert();
	}

	boneLimbs(bones) {
		// left and right reversed
		// compatible with blazepose
		const upper = [
			["RightArm", "LeftArm"],
			["RightArm", "RightForeArm"],
			["RightForeArm", "RightHand"],
			["LeftArm", "LeftForeArm"],
			["LeftForeArm", "LeftHand"],
			["RightUpLeg", "LeftUpLeg"],
			["RightUpLeg", "RightLeg"],
			["RightLeg", "RightFoot"],
			["LeftUpLeg", "LeftLeg"],
			["LeftLeg", "LeftFoot"],
		];

		const basisMatrix = this.boneTorso(bones);

		const res = [];

		for (let limb of upper) {
			const v_start = new THREE.Vector3();
			const v_end = new THREE.Vector3();

			bones[limb[0]].getWorldPosition(v_start);
			bones[limb[1]].getWorldPosition(v_end);

			const v = v_end.sub(v_start).normalize();

			v.applyMatrix4(basisMatrix);

			res.push(v);
		}

		// console.log(res)

		return res;
	}

	compareCurrentPose(pose3D, bones) {
		const l1 = this.boneLimbs(bones);
		// const l2 = this.animationLimbs(frameIndx);
		const l2 = this.pose3dlimbs(pose3D);

		const res = [];

		for (let i in l1) {
			res.push(l1[i].angleTo(l2[i]));
		}

		return res;
	}
}
