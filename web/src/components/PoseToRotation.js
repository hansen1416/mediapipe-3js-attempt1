import * as THREE from "three";

import {
	BlazePoseKeypointsValues,
	poseToVector,
	posePointsToVector,
	middlePosition,
	quaternionFromVectors,
} from "./ropes";

export default class PoseToRotation {
	constructor() {}

	matrixBasisFromPoints(a, b, c) {
		const x_basis = posePointsToVector(a, b);

		const y_tmp = posePointsToVector(c, a);
		const z_basis = new THREE.Vector3()
			.crossVectors(y_tmp, x_basis)
			.normalize();

		const y_basis = new THREE.Vector3()
			.crossVectors(z_basis, x_basis)
			.normalize();

		// console.log("x_basis", x_basis, "y_basis", y_basis, "z_basis", z_basis);

		return new THREE.Matrix4().makeBasis(x_basis, y_basis, z_basis);
	}

	poseTorsoMatrix(pose3D) {
		// use left/shoulder and pelvis to define a plane
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
		// the torso basis, so all the limbs are position relative to the torso
		const torsoBasis = this.matrixBasisFromPoints(
			leftshoulder,
			rightshoulder,
			pelvis
		);
		// the original basis, same as man stand up straight
		const originalBaiss = this.matrixBasisFromPoints(
			new THREE.Vector3(1, 0, 0),
			new THREE.Vector3(-1, 0, 0),
			new THREE.Vector3(0, -1, 0)
		);

		// transfor limbs vector from original basis to the torso basis
		return torsoBasis.invert().multiply(originalBaiss);
	}

	/**
	 * pose to rotation of limbs
	 *
	 * 1. get position of joints
	 * 2. calculate vector of limbs by minus joints position
	 * 3. calcualte quaternion from (0,-1,0) or parent limb
	 *
	 * @param {object} pose3D
	 * @returns
	 */
	getRotations(pose3D) {
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

		const leftThighOrientation = posePointsToVector(left_knee, left_hip);
		const leftCalfOrientation = posePointsToVector(left_ankle, left_knee);

		const rightThighOrientation = posePointsToVector(right_knee, right_hip);
		const rightCalfOrientation = posePointsToVector(
			right_ankle,
			right_knee
		);

		const torsoMatrix = this.poseTorsoMatrix(pose3D);

		// console.log(torsoMatrix);

		leftArmOrientation.applyMatrix4(torsoMatrix);
		leftForeArmOrientation.applyMatrix4(torsoMatrix);
		rightArmOrientation.applyMatrix4(torsoMatrix);
		rightForeArmOrientation.applyMatrix4(torsoMatrix);
		leftThighOrientation.applyMatrix4(torsoMatrix);
		leftCalfOrientation.applyMatrix4(torsoMatrix);
		rightThighOrientation.applyMatrix4(torsoMatrix);
		rightCalfOrientation.applyMatrix4(torsoMatrix);

		const leftArmQuaternion = quaternionFromVectors(
			new THREE.Vector3(0, -1, 0),
			leftArmOrientation
		);

		const leftForeArmQuaternion = quaternionFromVectors(
			leftArmOrientation,
			leftForeArmOrientation
		);

		const rightArmQuaternion = quaternionFromVectors(
			new THREE.Vector3(0, -1, 0),
			rightArmOrientation
		);

		const rightForeArmQuaternion = quaternionFromVectors(
			rightArmOrientation,
			rightForeArmOrientation
		);

		const leftThighQuaternion = quaternionFromVectors(
			new THREE.Vector3(0, -1, 0),
			leftThighOrientation
		);

		const leftCalfQuaternion = quaternionFromVectors(
			leftThighOrientation,
			leftCalfOrientation
		);

		const rightThighQuaternion = quaternionFromVectors(
			new THREE.Vector3(0, -1, 0),
			rightThighOrientation
		);

		const rightCalfQuaternion = quaternionFromVectors(
			rightThighOrientation,
			rightCalfOrientation
		);

		return {
			TORSO: torsoMatrix,
			LEFT_SHOULDER: leftArmQuaternion,
			LEFT_ELBOW: leftForeArmQuaternion,
			RIGHT_SHOULDER: rightArmQuaternion,
			RIGHT_ELBOW: rightForeArmQuaternion,
			LEFT_HIP: leftThighQuaternion,
			LEFT_KNEE: leftCalfQuaternion,
			RIGHT_HIP: rightThighQuaternion,
			RIGHT_KNEE: rightCalfQuaternion,
		};
	}
}
