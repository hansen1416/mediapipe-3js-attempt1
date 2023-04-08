import * as THREE from "three";

import { BlazePoseKeypointsValues } from "./ropes";

function quaternionFromBasis(xaxis0, yaxis0, zaxis0, xaxis1, yaxis1, zaxis1) {
	/**
	 * transfer object from basis0 to basis1
	 */
	const m0 = new THREE.Matrix4().makeBasis(xaxis0, yaxis0, zaxis0);
	const m1 = new THREE.Matrix4().makeBasis(xaxis1, yaxis1, zaxis1);

	const m = m1.multiply(m0.invert());

	return new THREE.Quaternion().setFromRotationMatrix(m);
}

function torsoRotation(left_shoulder2, right_shoulder2, left_hip2, right_hip2) {
	/**
		Now you want matrix B that maps from 1st set of coords to 2nd set:
		A2 = B * A1
		This is now a very complex math problem that requires advanced skills to arrive at the solution:
		B = A2 * inverse of A1
	 */

	if (
		(left_shoulder2.visibility && left_shoulder2.visibility < 0.5) ||
		(right_shoulder2.visibility && right_shoulder2.visibility < 0.5) ||
		(left_hip2.visibility && left_hip2.visibility < 0.5) ||
		(right_hip2.visibility && right_hip2.visibility < 0.5)
	) {
		return [false, false];
	}

	const left_oblique = new THREE.Vector3(
		(left_shoulder2.x + left_hip2.x) / 2,
		(left_shoulder2.y + left_hip2.y) / 2,
		(left_shoulder2.z + left_hip2.z) / 2
	);
	const right_oblique = new THREE.Vector3(
		(right_shoulder2.x + right_hip2.x) / 2,
		(right_shoulder2.y + right_hip2.y) / 2,
		(right_shoulder2.z + right_hip2.z) / 2
	);
	const center = new THREE.Vector3(
		(left_oblique.x + right_oblique.x) / 2,
		(left_oblique.y + right_oblique.y) / 2,
		(left_oblique.z + right_oblique.z) / 2
	);

	// origin basis of chest
	const xaxis0 = new THREE.Vector3(1, 0, 0);
	const yaxis0 = new THREE.Vector3(0, -1, 0);
	const zaxis0 = new THREE.Vector3(0, 0, 1);

	// new basis of chest from pose data
	const xaxis1 = new THREE.Vector3(
		left_shoulder2.x - right_shoulder2.x,
		left_shoulder2.y - right_shoulder2.y,
		left_shoulder2.z - right_shoulder2.z
	).normalize();

	const y_tmp1 = new THREE.Vector3(
		left_shoulder2.x - center.x,
		left_shoulder2.y - center.y,
		left_shoulder2.z - center.z
	).normalize();

	const zaxis1 = new THREE.Vector3().crossVectors(xaxis1, y_tmp1).normalize();

	const yaxis1 = new THREE.Vector3().crossVectors(xaxis1, zaxis1).normalize();

	const chest_q = quaternionFromBasis(
		xaxis0,
		yaxis0,
		zaxis0,
		xaxis1,
		yaxis1,
		zaxis1
	);

	// origin basis of abdominal
	const xaxis2 = new THREE.Vector3(1, 0, 0);
	const yaxis2 = new THREE.Vector3(0, 1, 0);
	const zaxis2 = new THREE.Vector3(0, 0, 1);

	// new basis of abdominal from pose data
	const xaxis3 = new THREE.Vector3(
		left_hip2.x - right_hip2.x,
		left_hip2.y - right_hip2.y,
		left_hip2.z - right_hip2.z
	).normalize();

	const y_tmp3 = new THREE.Vector3(
		center.x - left_hip2.x,
		center.y - left_hip2.y,
		center.z - left_hip2.z
	).normalize();

	const zaxis3 = new THREE.Vector3().crossVectors(xaxis3, y_tmp3).normalize();

	const yaxis3 = new THREE.Vector3().crossVectors(zaxis3, xaxis3).normalize();

	// console.log(xaxis3, yaxis3, zaxis3);

	const abs_q = quaternionFromBasis(
		xaxis2,
		yaxis2,
		zaxis2,
		xaxis3,
		yaxis3,
		zaxis3
	);

	return [abs_q, chest_q];
}

function getLimbQuaternion(pose3D, joint_start, joint_end, upVector) {
	/**
	 * calculate quaternion for a limb,
	 * which start from `joint_start` end at `joint_end`
	 */
	const start_pos = pose3D[BlazePoseKeypointsValues[joint_start]];
	const end_pos = pose3D[BlazePoseKeypointsValues[joint_end]];

	if (
		(start_pos.visibility && start_pos.visibility < 0.5) ||
		(end_pos.visibility && end_pos.visibility < 0.5)
	) {
		return false;
	}

	return new THREE.Quaternion().setFromUnitVectors(
		upVector,
		new THREE.Vector3(
			end_pos.x - start_pos.x,
			end_pos.y - start_pos.y,
			end_pos.z - start_pos.z
		).normalize()
	);
}

function getQuaternions(pose3D) {
	/**
	 * get rotation of limbs
	 */

	const result = {};

	const [abs_q, chest_q] = torsoRotation(
		pose3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]],
		pose3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]],
		pose3D[BlazePoseKeypointsValues["RIGHT_HIP"]],
		pose3D[BlazePoseKeypointsValues["LEFT_HIP"]]
	);

	result["abdominal"] = abs_q;
	result["chest"] = chest_q;

	// result["head"] = new THREE.Quaternion();

	result["leftArm"] = getLimbQuaternion(
		pose3D,
		"RIGHT_SHOULDER",
		"RIGHT_ELBOW",
		new THREE.Vector3(1, 0, 0)
	);

	result["rightArm"] = getLimbQuaternion(
		pose3D,
		"LEFT_SHOULDER",
		"LEFT_ELBOW",
		new THREE.Vector3(-1, 0, 0)
	);

	result["leftForeArm"] = getLimbQuaternion(
		pose3D,
		"RIGHT_ELBOW",
		"RIGHT_WRIST",
		new THREE.Vector3(1, 0, 0)
	);

	result["rightForeArm"] = getLimbQuaternion(
		pose3D,
		"LEFT_ELBOW",
		"LEFT_WRIST",
		new THREE.Vector3(-1, 0, 0)
	);

	// result["leftHand"] = new THREE.Quaternion();

	// result["rightHand"] = new THREE.Quaternion();

	result["leftThigh"] = getLimbQuaternion(
		pose3D,
		"RIGHT_HIP",
		"RIGHT_KNEE",
		new THREE.Vector3(0, -1, 0)
	);

	result["rightThigh"] = getLimbQuaternion(
		pose3D,
		"LEFT_HIP",
		"LEFT_KNEE",
		new THREE.Vector3(0, -1, 0)
	);

	result["leftCalf"] = getLimbQuaternion(
		pose3D,
		"RIGHT_KNEE",
		"RIGHT_ANKLE",
		new THREE.Vector3(0, -1, 0)
	);

	result["rightCalf"] = getLimbQuaternion(
		pose3D,
		"LEFT_KNEE",
		"LEFT_ANKLE",
		new THREE.Vector3(0, -1, 0)
	);

	result["leftFoot"] = getLimbQuaternion(
		pose3D,
		"RIGHT_HEEL",
		"RIGHT_FOOT_INDEX",
		new THREE.Vector3(0, 0, 1)
	);

	result["rightFoot"] = getLimbQuaternion(
		pose3D,
		"LEFT_HEEL",
		"LEFT_FOOT_INDEX",
		new THREE.Vector3(0, 0, 1)
	);

	return result;
}

/**
 * To calculate the child's local quaternion, you can use the following steps:

First, compute the inverse of the parent's quaternion. This is necessary because quaternions don't commute, so we need to invert the parent's rotation to move from the world coordinate system to the parent's coordinate system.

Multiply the child's world quaternion by the inverse of the parent's quaternion. This will give you the child's quaternion relative to the parent's coordinate system.

Normalize the resulting quaternion to ensure that it represents a valid rotation.

The math equation for this operation is:

local_quaternion = parent_quaternion.inverse() * child_world_quaternion

Here, parent_quaternion.inverse() refers to the inverse of the parent's quaternion and child_world_quaternion refers to the child's quaternion in world coordinates.

It's important to note that quaternions represent rotations in 3D space, so this calculation assumes that both the child and parent are rotating objects. If one or both of them are static, then their quaternions would be identity quaternions (i.e., [1, 0, 0, 0]), and the local quaternion would be equal to the child's world quaternion.

 */
export function applyPoseToBone(pose3D, bones) {
	/**
     * 
     * bones keys
     [
        "Hips",
        "Spine",
        "Spine1",
        "Spine2",
        "Neck",
        "Head",
        "LeftShoulder",
        "LeftArm",
        "LeftForeArm",
        "LeftHand",
        "LeftHandThumb1",
        "LeftHandThumb2",
        "LeftHandThumb3",
        "LeftHandIndex1",
        "LeftHandIndex2",
        "LeftHandIndex3",
        "LeftHandMiddle1",
        "LeftHandMiddle2",
        "LeftHandMiddle3",
        "LeftHandRing1",
        "LeftHandRing2",
        "LeftHandRing3",
        "LeftHandPinky1",
        "LeftHandPinky2",
        "LeftHandPinky3",
        "RightShoulder",
        "RightArm",
        "RightForeArm",
        "RightHand",
        "RightHandThumb1",
        "RightHandThumb2",
        "RightHandThumb3",
        "RightHandIndex1",
        "RightHandIndex2",
        "RightHandIndex3",
        "RightHandMiddle1",
        "RightHandMiddle2",
        "RightHandMiddle3",
        "RightHandRing1",
        "RightHandRing2",
        "RightHandRing3",
        "RightHandPinky1",
        "RightHandPinky2",
        "RightHandPinky3",
        "LeftUpLeg",
        "LeftLeg",
        "LeftFoot",
        "LeftToeBase",
        "RightUpLeg",
        "RightLeg",
        "RightFoot",
        "RightToeBase"
    ]
     */

	/**
     * `getQuaternions` return keys
     *  [
        "abdominal",
        "chest",
        "leftArm",
        "rightArm",
        "leftForeArm",
        "rightForeArm",
        "leftThigh",
        "rightThigh",
        "leftCalf",
        "rightCalf",
        "leftFoot",
        "rightFoot"
    ]
    */

	const quas = getQuaternions(pose3D);

	// new THREE.Object3D().rotation.setFromQuaternion;

	// bones.Hips.rotation.setFromQuaternion(quas.abdominal);

	const chest_local = new THREE.Quaternion().multiplyQuaternions(
		quas.abdominal.conjugate(),
		quas.chest
	);

	// console.log(chest_local, chest_local.normalize());

	// bones.Spine2.rotation.setFromQuaternion(chest_local);

	// bones.LeftShoulder.rotation.setFromQuaternion(new THREE.Quaternion());
	// bones.RightShoulder.rotation.set(0, 0, 0);

	// const leftArm_local = new THREE.Quaternion().multiplyQuaternions(
	// 	chest_local.conjugate(),
	// 	quas.rightArm
	// );

	const leftArm_local = new THREE.Quaternion().setFromUnitVectors(
		new THREE.Vector3(1, 0, 0),
		new THREE.Vector3(0.5, 0.5, 0).normalize()
	);

	bones.LeftArm.rotation.setFromQuaternion(leftArm_local);
}
