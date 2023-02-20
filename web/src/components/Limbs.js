import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

import { BlazePoseKeypointsValues, posePointsToVector, quaternionFromVectors } from "./ropes";

export class Limbs {
    limbs_arr = [
		"TORSO",
		"HEAD",
		"LEFT_UPPERARM",
		"LEFT_FOREARM",
		"LEFT_HAND",
		"RIGHT_UPPERARM",
		"RIGHT_FOREARM",
		"RIGHT_HAND",
		"LEFT_THIGH",
		"LEFT_CALF",
		"LEFT_FOOT",
		"RIGHT_THIGH",
		"RIGHT_CALF",
		"RIGHT_FOOT",
	];

    constructor() {

        this.unit = 1;

		this.head_radius = 4 * this.unit;
		this.neck_radius = 1.6 * this.unit;
		this.neck_size = 2 * this.unit;

		this.shoulder_size = 6 * this.unit;
		this.spine_size = 12 * this.unit;
		this.waist_size = 5 * this.unit;

		this.deltoid_radius = 1.8 * this.unit;
		this.bigarm_size = 8 * this.unit;
		this.elbow_radius = 1.6 * this.unit;

		this.smallarm_size = 8 * this.unit;
		this.wrist_size = 1.2 * this.unit;

		this.thigh_radius = 2.8 * this.unit;
		this.thigh_size = 10 * this.unit;
		this.knee_radius = 2.4 * this.unit;

		this.calf_size = 10 * this.unit;
		this.ankle_radius = 1.8 * this.unit;

		this.init_vector = new THREE.Vector3(0, 1, 0);
    }

    init() {
        this.upperarm_l = new THREE.Group();
        this.upperarm_l.add(this.getMesh(this.deltoid_radius, this.elbow_radius, this.bigarm_size));

		this.forearm_l = new THREE.Group();
        this.forearm_l.add(this.getMesh(this.elbow_radius, this.wrist_size, this.smallarm_size));

        this.upperarm_r = new THREE.Group();
        this.upperarm_r.add(this.getMesh(this.deltoid_radius, this.elbow_radius, this.bigarm_size));

        this.forearm_r = new THREE.Group();
        this.forearm_r.add(this.getMesh(this.elbow_radius, this.wrist_size, this.smallarm_size));

		return [this.upperarm_l, this.forearm_l, this.upperarm_r, this.forearm_r]
    }

    getMesh(radiusTop, radiusBottom, height, radialSegments=8) {

        const geometry = new THREE.CylinderGeometry(
			radiusTop,
			radiusBottom,
			height,
			radialSegments
		);

        const material = new THREE.MeshBasicMaterial({
			color: 0x44aa88,
			transparent: true,
			opacity: 0.5,
		})

		return new THREE.Mesh(geometry, material);
    }

    applyPose(pose3D) {

        const shoulder_pose_l = pose3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]]
		const elbow_pose_l = pose3D[BlazePoseKeypointsValues["LEFT_ELBOW"]]
		const wrist_pose_l = pose3D[BlazePoseKeypointsValues["LEFT_WRIST"]]

		const shoulder_pose_r = pose3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]]
		const elbow_pose_r = pose3D[BlazePoseKeypointsValues["RIGHT_ELBOW"]]
		const wrist_pose_r = pose3D[BlazePoseKeypointsValues["RIGHT_WRIST"]]

        this.upperarm_l.position.set(shoulder_pose_l.x, shoulder_pose_l.y, shoulder_pose_l.z);
		this.forearm_l.position.set(elbow_pose_l.x, elbow_pose_l.y, elbow_pose_l.z);
		
		this.upperarm_r.position.set(shoulder_pose_r.x, shoulder_pose_r.y, shoulder_pose_r.z);
		this.forearm_r.position.set(elbow_pose_r.x, elbow_pose_r.y, elbow_pose_r.z);

		const upperarm_l_target = posePointsToVector(
			elbow_pose_l,
			shoulder_pose_l
		);
		const forearm_l_target = posePointsToVector(
			wrist_pose_l,
			elbow_pose_l
		);

		const upperarm_r_target = posePointsToVector(
			elbow_pose_r,
			shoulder_pose_r
		);
		const forearm_r_target = posePointsToVector(
			wrist_pose_r,
			elbow_pose_r
		);

		const upperarm_l_q = quaternionFromVectors(this.init_vector, upperarm_l_target);
		const forearm_l_q = quaternionFromVectors(this.init_vector, forearm_l_target);

		const upperarm_r_q = quaternionFromVectors(this.init_vector, upperarm_r_target);
		const forearm_r_q = quaternionFromVectors(this.init_vector, forearm_r_target);

		this.upperarm_l.setRotationFromQuaternion(upperarm_l_q);
		this.forearm_l.setRotationFromQuaternion(forearm_l_q);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      

		this.upperarm_r.setRotationFromQuaternion(upperarm_r_q);
		this.forearm_r.setRotationFromQuaternion(forearm_r_q);

		console.log(this.upperarm_l, this.upperarm_r)
    }



}