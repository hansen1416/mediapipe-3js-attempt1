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
		return [new THREE.Quaternion(), new THREE.Quaternion()];
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

// 	/**
//      *
//      * bones keys
//      [
//         "Hips",
//         "Spine",
//         "Spine1",
//         "Spine2",
//         "Neck",
//         "Head",
//         "LeftShoulder",
//         "LeftArm",
//         "LeftForeArm",
//         "LeftHand",
//         "LeftHandThumb1",
//         "LeftHandThumb2",
//         "LeftHandThumb3",
//         "LeftHandIndex1",
//         "LeftHandIndex2",
//         "LeftHandIndex3",
//         "LeftHandMiddle1",
//         "LeftHandMiddle2",
//         "LeftHandMiddle3",
//         "LeftHandRing1",
//         "LeftHandRing2",
//         "LeftHandRing3",
//         "LeftHandPinky1",
//         "LeftHandPinky2",
//         "LeftHandPinky3",
//         "RightShoulder",
//         "RightArm",
//         "RightForeArm",
//         "RightHand",
//         "RightHandThumb1",
//         "RightHandThumb2",
//         "RightHandThumb3",
//         "RightHandIndex1",
//         "RightHandIndex2",
//         "RightHandIndex3",
//         "RightHandMiddle1",
//         "RightHandMiddle2",
//         "RightHandMiddle3",
//         "RightHandRing1",
//         "RightHandRing2",
//         "RightHandRing3",
//         "RightHandPinky1",
//         "RightHandPinky2",
//         "RightHandPinky3",
//         "LeftUpLeg",
//         "LeftLeg",
//         "LeftFoot",
//         "LeftToeBase",
//         "RightUpLeg",
//         "RightLeg",
//         "RightFoot",
//         "RightToeBase"
//     ]
//      */

// 	/**
//      * `getQuaternions` return keys
//      *  [
//         "abdominal",
//         "chest",
//         "leftArm",
//         "rightArm",
//         "leftForeArm",
//         "rightForeArm",
//         "leftThigh",
//         "rightThigh",
//         "leftCalf",
//         "rightCalf",
//         "leftFoot",
//         "rightFoot"
//     ]
//     */

export default class PoseToRotation {
	constructor(bones) {
		this.bones = bones;
	}

	// updatePose(pose3D) {
	// 	this.pose3D = pose3D
	// }

	applyPoseToBone(pose3D) {
		this.pose3D = pose3D;

		const [abs_q, chest_q] = torsoRotation(
			this.pose3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]],
			this.pose3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]],
			this.pose3D[BlazePoseKeypointsValues["RIGHT_HIP"]],
			this.pose3D[BlazePoseKeypointsValues["LEFT_HIP"]]
		);

		this.bones.Hips.rotation.setFromQuaternion(abs_q);

		const chest_local = new THREE.Quaternion().multiplyQuaternions(
			abs_q.conjugate(),
			chest_q
		);

		this.bones.Spine2.rotation.setFromQuaternion(chest_local);

		this.rotateLimb(
			"LeftArm",
			"LeftShoulder",
			"RIGHT_SHOULDER",
			"RIGHT_ELBOW",
			new THREE.Euler(0, 0, 0),
			new THREE.Vector3(0, 1, 0)
		);

		this.rotateLimb(
			"LeftForeArm",
			"LeftArm",
			"RIGHT_ELBOW",
			"RIGHT_WRIST",
			new THREE.Euler(0, 0, 0),
			new THREE.Vector3(0, 1, 0)
		);

		this.rotateLimb(
			"RightArm",
			"RightShoulder",
			"LEFT_SHOULDER",
			"LEFT_ELBOW",
			new THREE.Euler(0, 0, 0),
			new THREE.Vector3(0, 1, 0)
		);

		this.rotateLimb(
			"RightForeArm",
			"RightArm",
			"LEFT_ELBOW",
			"LEFT_WRIST",
			new THREE.Euler(0, 0, 0),
			new THREE.Vector3(0, 1, 0)
		);

		this.rotateLimb(
			"LeftUpLeg",
			"Hips",
			"RIGHT_HIP",
			"RIGHT_KNEE",
			new THREE.Euler(0, 0, -3.14),
			new THREE.Vector3(0, -1, 0)
		);

		this.rotateLimb(
			"LeftLeg",
			"LeftUpLeg",
			"RIGHT_KNEE",
			"RIGHT_ANKLE",
			new THREE.Euler(0, 0, 0),
			new THREE.Vector3(0, 1, 0)
		);

		this.rotateLimb(
			"LeftFoot",
			"LeftLeg",
			"RIGHT_ANKLE",
			"RIGHT_FOOT_INDEX",
			new THREE.Euler(1.035, 0, 0),
			new THREE.Vector3(0, 0, 1)
		);

		this.rotateLimb(
			"RightUpLeg",
			"Hips",
			"LEFT_HIP",
			"LEFT_KNEE",
			new THREE.Euler(0, 0, 3.14),
			new THREE.Vector3(0, -1, 0)
		);

		this.rotateLimb(
			"RightLeg",
			"RightUpLeg",
			"LEFT_KNEE",
			"LEFT_ANKLE",
			new THREE.Euler(0, 0, 0),
			new THREE.Vector3(0, 1, 0)
		);

		this.rotateLimb(
			"RightFoot",
			"RightLeg",
			"LEFT_ANKLE",
			"LEFT_FOOT_INDEX",
			new THREE.Euler(1.035, 0, 0),
			new THREE.Vector3(0, 0, 1)
		);
	}

	rotateLimb(
		bone_name,
		parent_bone_name,
		start_joint_name,
		end_joint_name,
		init_euler,
		up_vector
	) {
		if (
			(this.pose3D[BlazePoseKeypointsValues[start_joint_name]] &&
				this.pose3D[BlazePoseKeypointsValues[start_joint_name]]
					.visibility < 0.5) ||
			(this.pose3D[BlazePoseKeypointsValues[end_joint_name]] &&
				this.pose3D[BlazePoseKeypointsValues[end_joint_name]]
					.visibility < 0.5)
		) {
			return;
		}

		const start_joint =
			this.pose3D[BlazePoseKeypointsValues[start_joint_name]];
		const end_joint = this.pose3D[BlazePoseKeypointsValues[end_joint_name]];

		const world_target_vector = new THREE.Vector3(
			end_joint.x - start_joint.x,
			end_joint.y - start_joint.y,
			end_joint.z - start_joint.z
		).normalize();

		const world_quaternion = new THREE.Quaternion();

		this.bones[parent_bone_name].getWorldQuaternion(world_quaternion);

		world_target_vector.applyQuaternion(world_quaternion.conjugate());

		// all the bones rest pose in the model is (0,1,0)
		// first place the limb to the human body nature position
		const init_quaternion = new THREE.Quaternion().setFromEuler(init_euler);

		// this is the real human body rotation,
		// todo, limit this rotation by human body restrain
		// todo, use matrix basis rotations to adjust the orientations
		const local_quaternion_bio = new THREE.Quaternion().setFromUnitVectors(
			up_vector,
			world_target_vector.normalize()
		);

		/*
		Notice that rotating by `a` and then by `b` is equivalent to 
		performing a single rotation by the quaternion product `ba`. 
		This is a key observation.
		*/
		const local_quaternion_bone =
			new THREE.Quaternion().multiplyQuaternions(
				local_quaternion_bio,
				init_quaternion
			);

		this.bones[bone_name].rotation.setFromQuaternion(
			local_quaternion_bone.normalize()
		);
	}
}
