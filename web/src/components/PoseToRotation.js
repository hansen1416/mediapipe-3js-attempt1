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

	const abs_q_inv = quaternionFromBasis(
		xaxis3,
		yaxis3,
		zaxis3,
		xaxis2,
		yaxis2,
		zaxis2
	);

	return [abs_q, chest_q, abs_q_inv];
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
		new THREE.Vector3(0, 1, 0)
	);

	result["rightArm"] = getLimbQuaternion(
		pose3D,
		"LEFT_SHOULDER",
		"LEFT_ELBOW",
		new THREE.Vector3(0, 1, 0)
	);

	result["leftForeArm"] = getLimbQuaternion(
		pose3D,
		"RIGHT_ELBOW",
		"RIGHT_WRIST",
		new THREE.Vector3(0, 1, 0)
	);

	result["rightForeArm"] = getLimbQuaternion(
		pose3D,
		"LEFT_ELBOW",
		"LEFT_WRIST",
		new THREE.Vector3(0, 1, 0)
	);

	// result["leftHand"] = new THREE.Quaternion();

	// result["rightHand"] = new THREE.Quaternion();

	result["leftThigh"] = getLimbQuaternion(
		pose3D,
		"RIGHT_HIP",
		"RIGHT_KNEE",
		new THREE.Vector3(0, 1, 0)
	);

	result["rightThigh"] = getLimbQuaternion(
		pose3D,
		"LEFT_HIP",
		"LEFT_KNEE",
		new THREE.Vector3(0, 1, 0)
	);

	result["leftCalf"] = getLimbQuaternion(
		pose3D,
		"RIGHT_KNEE",
		"RIGHT_ANKLE",
		new THREE.Vector3(0, 1, 0)
	);

	result["rightCalf"] = getLimbQuaternion(
		pose3D,
		"LEFT_KNEE",
		"LEFT_ANKLE",
		new THREE.Vector3(0, 1, 0)
	);

	result["leftFoot"] = getLimbQuaternion(
		pose3D,
		"RIGHT_HEEL",
		"RIGHT_FOOT_INDEX",
		new THREE.Vector3(0, 1, 0)
	);

	result["rightFoot"] = getLimbQuaternion(
		pose3D,
		"LEFT_HEEL",
		"LEFT_FOOT_INDEX",
		new THREE.Vector3(0, 1, 0)
	);

	return result;
}

/**


local_quaternion = parent_local_quaternion.inverse() * child_world_quaternion


 */

/**
 * // Define the necessary inputs
var Q_abd = new THREE.Quaternion(); // abdominal quaternion
var L_hip = new THREE.Vector3(); // left hip position
var R_hip = new THREE.Vector3(); // right hip position
var L_knee = new THREE.Vector3(); // left knee position
var R_knee = new THREE.Vector3(); // right knee position
var L_ankle = new THREE.Vector3(); // left ankle position
var R_ankle = new THREE.Vector3(); // right ankle position

// Calculate the left leg vector
var L_leg = new THREE.Vector3().subVectors(L_ankle, L_hip);

// Calculate the right leg vector
var R_leg = new THREE.Vector3().subVectors(R_ankle, R_hip);

// Calculate the angle between the legs (in radians)
var cos_ang = L_leg.dot(R_leg) / (L_leg.length() * R_leg.length());
var ang = Math.acos(cos_ang);

// Calculate the thigh axis
var thigh_axis = new THREE.Vector3().crossVectors(L_leg, R_leg).normalize();

// Calculate the cosine of half the thigh angle
var cos_half_theta = Math.cos(ang / 2);

// Calculate the sine of half the thigh angle
var sin_half_theta = Math.sin(ang / 2);

// Combine the thigh axis, cosine, and sine into a quaternion
var Q_thigh = new THREE.Quaternion(sin_half_theta * thigh_axis.x, sin_half_theta * thigh_axis.y, sin_half_theta * thigh_axis.z, cos_half_theta);

// Apply the abdominal quaternion to the thigh quaternion
Q_thigh.multiply(Q_abd);

// Print the resulting thigh quaternion
console.log("Thigh Quaternion: (" + Q_thigh.x + ", " + Q_thigh.y + ", " + Q_thigh.z + ", " + Q_thigh.w + ")");
 */

/**
 * We are applying the abdominal quaternion to the thigh quaternion. The reason we need to do this is that the thigh quaternion represents the orientation of the thigh relative to the hip and knee joints, but does not take into account the orientation of the torso.

By applying the abdominal quaternion to the thigh quaternion, we can combine the orientation of the thigh with the orientation of the torso, resulting in a quaternion that represents the overall orientation of the thigh relative to the global coordinate system.

Quaternion multiplication is non-commutative, so the order in which we apply the quaternions matters. In this case, we want to apply the abdominal quaternion to the thigh quaternion, so we use the multiply() method on the thigh quaternion and pass in the abdominal quaternion as an argument.

The multiply() method applies the rotation represented by the passed-in quaternion to the current quaternion, effectively combining the two rotations. The result is a new quaternion that represents the combined orientation of the thigh and abdominal segments.

Overall, the line of code applies the abdominal quaternion to the thigh quaternion to combine the orientation of the thigh with the orientation of the torso, resulting in a quaternion that represents the overall orientation of the thigh relative to the global coordinate system.
 */

/**
 *
 * @param {*} pose3D
 * @param {*} bones
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

	bones.Hips.rotation.setFromQuaternion(quas.abdominal);

	const chest_local = new THREE.Quaternion().multiplyQuaternions(
		quas.abdominal.conjugate(),
		quas.chest
	);

	bones.Spine2.rotation.setFromQuaternion(chest_local);

	const a = pose3D[BlazePoseKeypointsValues["RIGHT_HIP"]];
	const b = pose3D[BlazePoseKeypointsValues["RIGHT_KNEE"]];

	const LeftUpLeg_vector = new THREE.Vector3(
		b.x - a.x,
		b.y - a.y,
		b.z - a.z
	).normalize();

	console.log(LeftUpLeg_vector);

	const LeftUpLeg_world = new THREE.Quaternion().setFromUnitVectors(
		new THREE.Vector3(0, 1, 0),
		LeftUpLeg_vector.normalize()
	);

	const LeftUpLeg_local = new THREE.Quaternion().multiplyQuaternions(
		quas.abdominal.conjugate(),
		LeftUpLeg_world.normalize()
	);

	bones.LeftUpLeg.rotation.setFromQuaternion(LeftUpLeg_local.normalize());

	const leftShoulder_local = new THREE.Quaternion(
		0.4816877883688483,
		0.49276938581965446,
		-0.5889065916037074,
		0.4223082207356995
	);

	const rightShoulder_local = new THREE.Quaternion(
		0.4816877883688483,
		-0.49276938581965446,
		0.5889065916037074,
		0.4223082207356995
	);

	bones.LeftShoulder.rotation.setFromQuaternion(leftShoulder_local);
	bones.RightShoulder.rotation.setFromQuaternion(rightShoulder_local);

	// bones.LeftShoulder.rotation.setFromQuaternion(new THREE.Quaternion());
	// bones.RightShoulder.rotation.setFromQuaternion(new THREE.Quaternion());

	// const a = pose3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]];
	// const b = pose3D[BlazePoseKeypointsValues["RIGHT_ELBOW"]];

	// const vec = new THREE.Vector3(b.x - a.x, b.y - a.y, b.z - a.z).normalize();

	// // console.log(vec);

	// const leftArm_world = new THREE.Quaternion().setFromUnitVectors(
	// 	new THREE.Vector3(0, 1, 0),
	// 	new THREE.Vector3(0, 0, 1).normalize()
	// 	// vec
	// );

	// const leftArm_local = new THREE.Quaternion().multiplyQuaternions(
	// 	chest_local.conjugate(),
	// 	leftArm_world
	// );

	// bones.LeftArm.rotation.setFromQuaternion(leftArm_local.normalize());
}

export function testPoseToBone(bones, pose3D) {
	const [abs_q, chest_q, abs_q_inv] = torsoRotation(
		pose3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]],
		pose3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]],
		pose3D[BlazePoseKeypointsValues["RIGHT_HIP"]],
		pose3D[BlazePoseKeypointsValues["LEFT_HIP"]]
	);

	bones.Hips.rotation.setFromQuaternion(abs_q);

	const world_upvector_leftleg = new THREE.Vector3(0, 1, 0);

	world_upvector_leftleg.applyQuaternion(abs_q);

	const a = pose3D[BlazePoseKeypointsValues["LEFT_HIP"]];
	const b = pose3D[BlazePoseKeypointsValues["LEFT_KNEE"]];

	const world_targetvector_leftleg = new THREE.Vector3(
		b.x - a.x,
		b.y - a.y,
		b.z - a.z
	).normalize();

	world_targetvector_leftleg.applyQuaternion(abs_q_inv);

	// console.log(world_targetvector_leftleg);

	const local_quaternion_leftleg1 = new THREE.Quaternion().setFromEuler(
		new THREE.Euler(0, 0, -3.14)
	);

	const local_quaternion_leftleg2 = new THREE.Quaternion().setFromUnitVectors(
		new THREE.Vector3(0, -1, 0),
		world_targetvector_leftleg.normalize()
	);

	// const local_quaternion_leftleg2 = new THREE.Quaternion();

	const local_quaternion_leftleg = new THREE.Quaternion().multiplyQuaternions(
		local_quaternion_leftleg2,
		local_quaternion_leftleg1
	);

	// bones.LeftUpLeg.rotation.setFromQuaternion(new THREE.Quaternion());

	// const qq = new THREE.Quaternion().set

	// bones.LeftUpLeg.rotation.setFromQuaternion();

	bones.LeftUpLeg.rotation.setFromQuaternion(
		local_quaternion_leftleg.normalize()
	);

	// bones.RightUpLeg.rotation.setFromQuaternion(
	// 	new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 3.14))
	// );
}
