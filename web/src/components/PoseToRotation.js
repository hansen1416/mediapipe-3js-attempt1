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

	poseTorsoMatrix(pose3D) {
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

		return new THREE.Matrix4().makeBasis(x_basis, y_basis, z_basis);
	}

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

		const leftThighOrientation = posePointsToVector(left_hip, left_knee);
		const leftCalfOrientation = posePointsToVector(left_knee, left_ankle);

		const rightThighOrientation = posePointsToVector(right_hip, right_knee);
		const rightCalfOrientation = posePointsToVector(
			right_knee,
			right_ankle
		);

		const torsoMatrix = this.poseTorsoMatrix(pose3D);

		const basisMatrix = torsoMatrix.invert();

		leftArmOrientation.applyMatrix4(basisMatrix);
		leftForeArmOrientation.applyMatrix4(basisMatrix);
		rightArmOrientation.applyMatrix4(basisMatrix);
		rightForeArmOrientation.applyMatrix4(basisMatrix);
		leftThighOrientation.applyMatrix4(basisMatrix);
		leftCalfOrientation.applyMatrix4(basisMatrix);
		rightThighOrientation.applyMatrix4(basisMatrix);
		rightCalfOrientation.applyMatrix4(basisMatrix);

		const leftArmQuaternion = quaternionFromVectors(
			new THREE.Vector3(0, -1, 0),
			leftArmOrientation
		);

		const leftForeArmQuaternion = quaternionFromVectors(
			leftArmOrientation,
			leftForeArmOrientation
		);

		const ightArmQuaternion = quaternionFromVectors(
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
			RIGHT_SHOULDER: ightArmQuaternion,
			RIGHT_ELBOW: rightForeArmQuaternion,
			LEFT_HIP: leftThighQuaternion,
			LEFT_KNEE: leftCalfQuaternion,
			RIGHT_HIP: rightThighQuaternion,
			RIGHT_KNEE: rightCalfQuaternion,
		};
	}
}
