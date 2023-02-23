import * as THREE from "three";

import {
	BlazePoseKeypointsValues,
	poseToVector,
	posePointsToVector,
	middlePosition,
} from "./ropes";

export default class PoseSyncVector {
	limbs = [
		"chest",
		"leftupperarm",
		"leftforearm",
		"rightupperarm",
		"rightforearm",
		"abdominal",
		"leftthigh",
		"leftcalf",
		"rightthigh",
		"rightcalf",
	];

	constructor(animation_data) {
		this.animationTracks = {};

		for (const v of animation_data.tracks) {
			this.animationTracks[v["name"]] = v;
		}
	}

	poseTorso(pose3D) {
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

		bones["upperarm_l"].getWorldPosition(leftshoulder);

		const rightshoulder = new THREE.Vector3();

		bones["upperarm_r"].getWorldPosition(rightshoulder);

		const pelvis = new THREE.Vector3();

		bones["pelvis"].getWorldPosition(pelvis);

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
			["upperarm_r", "upperarm_l"],
			["upperarm_r", "lowerarm_r"],
			["lowerarm_r", "hand_r"],
			["upperarm_l", "lowerarm_l"],
			["lowerarm_l", "hand_l"],
			["thigh_r", "thigh_l"],
			["thigh_r", "calf_r"],
			["calf_r", "foot_r"],
			["thigh_l", "calf_l"],
			["calf_l", "foot_l"],
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
