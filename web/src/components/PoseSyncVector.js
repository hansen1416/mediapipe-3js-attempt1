import * as THREE from "three";

import { BlazePoseKeypointsValues } from "./ropes";

const poseJoints = {
	LEFT_SHOULDER: "LEFT_SHOULDER",
	LEFT_ELBOW: "LEFT_ELBOW",
	LEFT_WRIST: "LEFT_WRIST",
	RIGHT_SHOULDER: "RIGHT_SHOULDER",
	RIGHT_ELBOW: "RIGHT_ELBOW",
	RIGHT_WRIST: "RIGHT_WRIST",
	LEFT_HIP: "LEFT_HIP",
	LEFT_KNEE: "LEFT_KNEE",
	LEFT_ANKLE: "LEFT_ANKLE",
	RIGHT_HIP: "RIGHT_HIP",
	RIGHT_KNEE: "RIGHT_KNEE",
	RIGHT_ANKLE: "RIGHT_ANKLE",
};

/**
 * pose node to model bone name mapping
 */
const bonesJoints = {
	LEFT_SHOULDER: "RightArm",
	LEFT_ELBOW: "RightForeArm",
	LEFT_WRIST: "RightHand",
	RIGHT_SHOULDER: "LeftArm",
	RIGHT_ELBOW: "LeftForeArm",
	RIGHT_WRIST: "LeftHand",
	LEFT_HIP: "RightUpLeg",
	LEFT_KNEE: "RightLeg",
	LEFT_ANKLE: "RightFoot",
	RIGHT_HIP: "LeftUpLeg",
	RIGHT_KNEE: "LeftLeg",
	RIGHT_ANKLE: "LeftFoot",
};

/**
 * calculate chest, abs basis matrix based on 4 joint positions
 * @param {obj} left_shoulder
 * @param {obj} right_shoulder
 * @param {obj} left_hip
 * @param {obj} right_hip
 * @returns
 */
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

	const chest_basis = new THREE.Matrix4().makeBasis(xaxis, yaxis, zaxis);

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

	const abs_basis = new THREE.Matrix4().makeBasis(xaxis3, yaxis3, zaxis3);

	return [chest_basis, abs_basis];
}

/**
 * conversion matrix convert vector from bone basis to pose basis
 * @param {obj} bones_pos
 * @param {obj} pose_pos
 * @returns
 */
function boneToPoseMatrix(bones_pos, pose_pos) {
	const [chest_m0, abs_m0] = basisFromTorso(
		bones_pos["LEFT_SHOULDER"],
		bones_pos["RIGHT_SHOULDER"],
		bones_pos["LEFT_HIP"],
		bones_pos["RIGHT_HIP"]
	);

	const [chest_m1, abs_m1] = basisFromTorso(
		pose_pos["LEFT_SHOULDER"],
		pose_pos["RIGHT_SHOULDER"],
		pose_pos["LEFT_HIP"],
		pose_pos["RIGHT_HIP"]
	);

	const chest_m = chest_m1.multiply(chest_m0.invert());
	const abs_m = abs_m1.multiply(abs_m0.invert());

	return [chest_m, abs_m];
}

/**
 * joint position to limb vector
 * @param {obj} start_joint
 * @param {obj} end_joint
 * @returns
 */
function limbVector(start_joint, end_joint) {
	return new THREE.Vector3(
		end_joint.x - start_joint.x,
		end_joint.y - start_joint.y,
		end_joint.z - start_joint.z
	);
}

/**
 * all limbs for comparison
 * @param {obj} pos
 * @returns
 */
function posToLimb(pos) {
	return {
		chest: limbVector(pos["RIGHT_SHOULDER"], pos["LEFT_SHOULDER"]),
		leftArm: limbVector(pos["LEFT_SHOULDER"], pos["LEFT_ELBOW"]),
		leftForeArm: limbVector(pos["LEFT_ELBOW"], pos["LEFT_WRIST"]),
		rightArm: limbVector(pos["RIGHT_SHOULDER"], pos["RIGHT_ELBOW"]),
		rightForeArm: limbVector(pos["RIGHT_ELBOW"], pos["RIGHT_WRIST"]),
		abdominal: limbVector(pos["RIGHT_HIP"], pos["LEFT_HIP"]),
		leftThigh: limbVector(pos["LEFT_HIP"], pos["LEFT_KNEE"]),
		leftCalf: limbVector(pos["LEFT_KNEE"], pos["LEFT_ANKLE"]),
		rightThigh: limbVector(pos["RIGHT_HIP"], pos["RIGHT_KNEE"]),
		rightCalf: limbVector(pos["RIGHT_KNEE"], pos["RIGHT_ANKLE"]),
	};
}

/**
 * get joint positions from pose 3d landmark
 * @param {obj} pose3D
 * @returns
 */
function poseJointPos(pose3D) {
	const pos = {};

	for (let name in poseJoints) {
		pos[name] = pose3D[BlazePoseKeypointsValues[poseJoints[name]]];
	}

	return pos;
}

/**
 * get bone position from model
 * @param {obj} bones
 * @returns
 */
function boneJointPos(bones) {
	const pos = {};

	for (let name in bonesJoints) {
		const v = new THREE.Vector3();

		if (
			bones[bonesJoints[name]] &&
			bones[bonesJoints[name]].getWorldPosition
		) {
			// when using model bones
			bones[bonesJoints[name]].getWorldPosition(v);
		} else {
			try {
				// when using animation states
				v.x = bones[bonesJoints[name]][0];
				v.y = bones[bonesJoints[name]][1];
				v.z = bones[bonesJoints[name]][2];
			} catch (e) {
				console.log(e, bones, name, bonesJoints);
			}
		}

		pos[name] = v;
	}

	return pos;
}

/**
 * compare bone and pose limbs
 * @param {obj} pose
 * @param {obj} bones
 * @returns
 */
export default function composeLimbVectors(pose, bones) {
	const pose_pos = poseJointPos(pose);
	const bone_pos = boneJointPos(bones);

	const pose_limb = posToLimb(pose_pos);
	const bone_limb = posToLimb(bone_pos);

	const [chest_matrix, abs_matrix] = boneToPoseMatrix(bone_pos, pose_pos);

	bone_limb.leftArm.applyMatrix4(chest_matrix);
	bone_limb.leftForeArm.applyMatrix4(chest_matrix);
	bone_limb.rightArm.applyMatrix4(chest_matrix);
	bone_limb.rightForeArm.applyMatrix4(chest_matrix);

	bone_limb.leftThigh.applyMatrix4(abs_matrix);
	bone_limb.leftCalf.applyMatrix4(abs_matrix);
	bone_limb.rightThigh.applyMatrix4(abs_matrix);
	bone_limb.rightCalf.applyMatrix4(abs_matrix);

	const res = {};

	for (let name in pose_limb) {
		res[name] = pose_limb[name].angleTo(bone_limb[name]);
	}

	return res;
}
