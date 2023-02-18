import * as THREE from "three";

import {
	BlazePoseKeypointsValues,
	poseToVector,
	posePointsToVector,
	middlePosition,
} from "./ropes";

export default class PoseToRotation {
	constructor() {}

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
}
