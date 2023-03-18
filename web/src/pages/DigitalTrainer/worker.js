import * as THREE from "three";

export const BlazePoseKeypointsValues = {
	NOSE: 0,
	LEFT_EYE_INNER: 1,
	LEFT_EYE: 2,
	LEFT_EYE_OUTER: 3,
	RIGHT_EYE_INNER: 4,
	RIGHT_EYE: 5,
	RIGHT_EYE_OUTER: 6,
	LEFT_EAR: 7,
	RIGHT_EAR: 8,
	LEFT_RIGHT: 9,
	RIGHT_LEFT: 10,
	LEFT_SHOULDER: 11,
	RIGHT_SHOULDER: 12,
	LEFT_ELBOW: 13,
	RIGHT_ELBOW: 14,
	LEFT_WRIST: 15,
	RIGHT_WRIST: 16,
	LEFT_PINKY: 17,
	RIGHT_PINKY: 18,
	LEFT_INDEX: 19,
	RIGHT_INDEX: 20,
	LEFT_THUMB: 21,
	RIGHT_THUMB: 22,
	LEFT_HIP: 23,
	RIGHT_HIP: 24,
	LEFT_KNEE: 25,
	RIGHT_KNEE: 26,
	LEFT_ANKLE: 27,
	RIGHT_ANKLE: 28,
	LEFT_HEEL: 29,
	RIGHT_HEEL: 30,
	LEFT_FOOT_INDEX: 31,
	RIGHT_FOOT_INDEX: 32,
};

function middlePosition(a, b) {
	return new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
}

function quaternionFromBasis(xaxis0, yaxis0, zaxis0, xaxis1, yaxis1, zaxis1) {
	/**
	 * transfer object from basis0 to basis1
	 */
	const m0 = new THREE.Matrix4().makeBasis(xaxis0, yaxis0, zaxis0);
	const m1 = new THREE.Matrix4().makeBasis(xaxis1, yaxis1, zaxis1);

	const m = m1.multiply(m0.invert());

	return new THREE.Quaternion().setFromRotationMatrix(m);
}

function poseToVector(p, z) {
	if (z) {
		return new THREE.Vector3(p.x, p.y, z);
	} else {
		return new THREE.Vector3(p.x, p.y, p.z);
	}
}

function posePointsToVector(a, b, norm = true) {
	let v;

	if (a[0]) {
		v = new THREE.Vector3(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
	} else {
		v = new THREE.Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
	}

	return norm ? v.normalize() : v;
}

function pointsSub(a, b) {
	/**
	 * joint position minus operation
	 */
	return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function torsoBasisFromJointsPosition(joints_position, idx) {
	/**
	 * get basis coords system from animation `joints_position` at given frame `idx`
	 */
	const leftshoulder = joints_position["upperarm_l"][idx];
	const rightshoulder = joints_position["upperarm_r"][idx];
	const pelvis = joints_position["pelvis"][idx];

	if (!rightshoulder || !leftshoulder || !pelvis) {
		return new THREE.Matrix4();
	}

	const x_basis = new THREE.Vector3(
		rightshoulder[0] - leftshoulder[0],
		rightshoulder[1] - leftshoulder[1],
		rightshoulder[2] - leftshoulder[2]
	);
	const y_tmp = new THREE.Vector3(
		pelvis[0] - leftshoulder[0],
		pelvis[1] - leftshoulder[1],
		pelvis[2] - leftshoulder[2]
	);

	const z_basis = new THREE.Vector3()
		.crossVectors(x_basis, y_tmp)
		.normalize();

	const y_basis = new THREE.Vector3()
		.crossVectors(x_basis, z_basis)
		.normalize();

	// console.log("x_basis", x_basis, "y_basis", y_basis, "z_basis", z_basis);

	return new THREE.Matrix4().makeBasis(x_basis, y_basis, z_basis);
}

function torsoBasisFromPose(pose3D) {
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

	const righthip = poseToVector(pose3D[BlazePoseKeypointsValues["LEFT_HIP"]]);
	const lefthip = poseToVector(pose3D[BlazePoseKeypointsValues["RIGHT_HIP"]]);

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

function getLimbsVectorAtIdx(joints_position, idx) {
	/**
	 * get the limbs orientation vector from animation joints positions
	 */
	const limbs = {
		// shoulder
		chest: ["upperarm_r", "upperarm_l"],
		// arms
		upperarm_l: ["upperarm_l", "lowerarm_l"],
		lowerarm_l: ["lowerarm_l", "hand_l"],
		upperarm_r: ["upperarm_r", "lowerarm_r"],
		lowerarm_r: ["lowerarm_r", "hand_r"],
		// abs
		abs: ["thigh_r", "thigh_l"],
		// legs
		thigh_l: ["thigh_l", "calf_l"],
		calf_l: ["calf_l", "foot_l"],
		thigh_r: ["thigh_r", "calf_r"],
		calf_r: ["calf_r", "foot_r"],
	};

	const limb_vector = {};

	for (let l in limbs) {
		const end = joints_position[limbs[l][1]][idx];
		const start = joints_position[limbs[l][0]][idx];

		if (end && end.length && start && start.length) {
			limb_vector[l] = new THREE.Vector3(
				end[0] - start[0],
				end[1] - start[1],
				end[2] - start[2]
			).normalize();
		} else {
			limb_vector[l] = new THREE.Vector3(0, 0, 0).normalize();
		}
	}

	return limb_vector;
}

function getLimbVector(pose3D, joint_start, joint_end) {
	const start_pos = pose3D[BlazePoseKeypointsValues[joint_start]];
	const end_pos = pose3D[BlazePoseKeypointsValues[joint_end]];

	return new THREE.Vector3(
		end_pos.x - start_pos.x,
		end_pos.y - start_pos.y,
		end_pos.z - start_pos.z
	).normalize();
}

function pose3dlimbs(pose3D) {
	/**
	 * transfer joints positions to limbs vectors
	 */
	return {
		chest: getLimbVector(pose3D, "RIGHT_SHOULDER", "LEFT_SHOULDER"),
		upperarm_l: getLimbVector(pose3D, "LEFT_SHOULDER", "LEFT_ELBOW"),
		lowerarm_l: getLimbVector(pose3D, "LEFT_ELBOW", "LEFT_WRIST"),
		upperarm_r: getLimbVector(pose3D, "RIGHT_SHOULDER", "RIGHT_ELBOW"),
		lowerarm_r: getLimbVector(pose3D, "RIGHT_ELBOW", "RIGHT_WRIST"),
		abs: getLimbVector(pose3D, "RIGHT_HIP", "LEFT_HIP"),
		thigh_l: getLimbVector(pose3D, "LEFT_HIP", "LEFT_KNEE"),
		calf_l: getLimbVector(pose3D, "LEFT_KNEE", "LEFT_ANKLE"),
		thigh_r: getLimbVector(pose3D, "RIGHT_HIP", "RIGHT_KNEE"),
		calf_r: getLimbVector(pose3D, "RIGHT_KNEE", "RIGHT_ANKLE"),
	};
}

function poseToJointsBasis(pose3D, joints_position, idx) {
	/**
	 * the matrix that convert vectors from pose torso system to anim torso system
	 */
	const jointsBasis = torsoBasisFromJointsPosition(joints_position, idx);
	const poseBasis = torsoBasisFromPose(pose3D);

	return jointsBasis.multiply(poseBasis.invert());
}

function torsoRotation(left_shoulder2, right_shoulder2, left_hip2, right_hip2) {
	/**
		Now you want matrix B that maps from 1st set of coords to 2nd set:
		A2 = B * A1
		This is now a very complex math problem that requires advanced skills to arrive at the solution:
		B = A2 * inverse of A1
	 */

	const left_oblique = middlePosition(left_shoulder2, left_hip2);
	const right_oblique = middlePosition(right_shoulder2, right_hip2);

	const center = middlePosition(left_oblique, right_oblique);

	// origin basis of chest
	const xaxis0 = new THREE.Vector3(1, 0, 0);
	const yaxis0 = new THREE.Vector3(0, -1, 0);
	const zaxis0 = new THREE.Vector3(0, 0, 1);

	// new basis of chest from pose data
	const xaxis1 = new THREE.Vector3()
		.subVectors(left_shoulder2, right_shoulder2)
		.normalize();

	const y_tmp1 = new THREE.Vector3()
		.subVectors(left_shoulder2, center)
		.normalize();

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

	// origin basis of abs
	const xaxis2 = new THREE.Vector3(1, 0, 0);
	const yaxis2 = new THREE.Vector3(0, 1, 0);
	const zaxis2 = new THREE.Vector3(0, 0, 1);

	// new basis of abs from pose data
	const xaxis3 = new THREE.Vector3()
		.subVectors(left_hip2, right_hip2)
		.normalize();

	const y_tmp3 = new THREE.Vector3()
		.subVectors(center, left_hip2)
		.normalize();

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

	// const qs = chest_q.clone().multiply(abs_q.clone().invert());

	return [abs_q, chest_q];
}

function calculateLimbsDistance(pose3D, joints_position, idx) {
	/**
	 * calculate angle between pose limbs vectors and anim limbs vectors
	 */
	// const basisMatrix = poseToJointsBasis(pose3D, joints_position, idx);

	const poseLimbsArray = pose3dlimbs(pose3D);
	const poseLimbsVectors = {};

	for (let name in poseLimbsArray) {
		const vec = new THREE.Vector3(
			poseLimbsArray[name].x,
			poseLimbsArray[name].y,
			poseLimbsArray[name].z
		).normalize();

		// vec.applyMatrix4(basisMatrix).normalize();
		poseLimbsVectors[name] = vec;
	}

	const animVectos = getLimbsVectorAtIdx(joints_position, idx);

	const result = {};

	for (let name in poseLimbsVectors) {
		result[name] = poseLimbsVectors[name].angleTo(animVectos[name]);
	}

	return result;
}

let animation_states = null;

export function fetchAnimationData(animation_data) {
	// loadJSON(
	// 	process.env.PUBLIC_URL + "/animjson/" + animation_filename + ".json"
	// ).then((data) => {
	// 	animationData = data;
	// });

	// use a variable store animation data
	animation_states = animation_data;

	// console.log(animation_states);

	return "Animation data received";
}

export function analyzePose(pose3D, idx) {
	if (!animation_states || !pose3D || !pose3D.length) {
		return "";
	}

	// compare current pose with all frames from the animation
	const result = calculateLimbsDistance(pose3D, animation_states, idx);

	// console.log("analyzePose", result);

	return result;
}
