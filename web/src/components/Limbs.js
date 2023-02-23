import * as THREE from "three";
// import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

import {
	BlazePoseKeypointsValues,
	posePointsToVector,
	quaternionFromVectors,
} from "./ropes";
// import MeshLineMaterial from "./MeshLineMaterial";

export default class Limbs {
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

		this.head_radius = 2 * this.unit;
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

		this.init_vector = new THREE.Vector3(0, -1, 0);
		// the pose position is between 0-1.
		// scale it up to make the limbs on proper position
		this.distance_ratio = 30;

		this.add_mesh = true;

		this.init_scale = new THREE.Vector3(0.3, 0.3, 0.3);
	}

	getMesh(
		radiusTop,
		radiusBottom,
		height,
		radialSegments = 8,
		heightSegments = 1
	) {
		const geometry = new THREE.CylinderGeometry(
			radiusTop,
			radiusBottom,
			height,
			radialSegments,
			heightSegments
		);

		const material = new THREE.MeshBasicMaterial({
			color: 0x44aa88,
			transparent: true,
			opacity: 0.5,
		});

		return new THREE.Mesh(geometry, material);
	}

	getTorsoMesh(points) {
		const geometry = new THREE.BufferGeometry().setFromPoints(points);

		const material = new THREE.MeshBasicMaterial({
			color: 0x44aa88,
			transparent: true,
			opacity: 0.5,
		});

		return new THREE.Mesh(geometry, material);
	}

	getHeadMesh(radius, widthSegments = 8, heightSegments = 8) {
		const geometry = new THREE.SphereGeometry(
			radius,
			widthSegments,
			heightSegments
		);

		const material = new THREE.MeshBasicMaterial({
			color: 0x44aa88,
			transparent: true,
			opacity: 0.5,
		});

		return new THREE.Mesh(geometry, material);
	}

	init() {
		// head
		this.head = new THREE.Group();

		this.head_sub = new THREE.Group();

		this.head_mesh = this.getHeadMesh(this.head_radius);

		if (this.add_mesh) {
			this.head_sub.add(this.head_mesh);
		}

		this.head_sub.position.x = 0; //this.head_radius;
		this.head_sub.position.y = this.head_radius;
		this.head_sub.position.z = -this.head_radius;

		this.head_mesh.scale.set(
			this.init_scale.x,
			this.init_scale.y,
			this.init_scale.z
		);

		this.head.add(this.head_sub);

		// torso
		this.torso = new THREE.Group();

		this.torso_sub = new THREE.Group();

		this.torso_mesh = this.getTorsoMesh([
			new THREE.Vector3(-10, 10, 0),
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 10, 0),
			new THREE.Vector3(-10, 10, 0),
			new THREE.Vector3(-10, 0, 0),
			new THREE.Vector3(0, 0, 0),
		]);

		if (this.add_mesh) {
			this.torso_sub.add(this.torso_mesh);
		}

		this.torso.add(this.torso_sub);

		// left upperarm
		this.upperarm_l = new THREE.Group();

		this.upperarm_l_sub = new THREE.Group();

		this.upperarm_l_mesh = this.getMesh(
			this.deltoid_radius,
			this.elbow_radius,
			this.bigarm_size
		);

		if (this.add_mesh) {
			this.upperarm_l_sub.add(this.upperarm_l_mesh);
		}

		this.upperarm_l_mesh.scale.set(
			this.init_scale.x,
			this.init_scale.y,
			this.init_scale.z
		);

		this.upperarm_l.add(this.upperarm_l_sub);

		this.upperarm_l_sub.position.x = this.deltoid_radius / 2;
		this.upperarm_l_sub.position.y = this.bigarm_size / -2;

		// left forearm
		this.forearm_l = new THREE.Group();

		this.forearm_l_sub = new THREE.Group();

		this.forearm_l_mesh = this.getMesh(
			this.elbow_radius,
			this.wrist_size,
			this.smallarm_size
		);

		if (this.add_mesh) {
			this.forearm_l_sub.add(this.forearm_l_mesh);
		}

		this.forearm_l_mesh.scale.set(
			this.init_scale.x,
			this.init_scale.y,
			this.init_scale.z
		);

		this.forearm_l.add(this.forearm_l_sub);

		this.forearm_l_sub.position.x = this.elbow_radius / 2;
		this.forearm_l_sub.position.y = this.smallarm_size / -2;

		// right upperarm
		this.upperarm_r = new THREE.Group();

		this.upperarm_r_sub = new THREE.Group();

		this.upperarm_r_mesh = this.getMesh(
			this.deltoid_radius,
			this.elbow_radius,
			this.bigarm_size
		);

		if (this.add_mesh) {
			this.upperarm_r_sub.add(this.upperarm_r_mesh);
		}

		this.upperarm_r_mesh.scale.set(
			this.init_scale.x,
			this.init_scale.y,
			this.init_scale.z
		);

		this.upperarm_r.add(this.upperarm_r_sub);

		this.upperarm_r_sub.position.x = -this.deltoid_radius / 2;
		this.upperarm_r_sub.position.y = this.bigarm_size / -2;

		// right forearm
		this.forearm_r = new THREE.Group();

		this.forearm_r_sub = new THREE.Group();

		this.forearm_r_mesh = this.getMesh(
			this.elbow_radius,
			this.wrist_size,
			this.smallarm_size
		);

		if (this.add_mesh) {
			this.forearm_r_sub.add(this.forearm_r_mesh);
		}

		this.forearm_r_mesh.scale.set(
			this.init_scale.x,
			this.init_scale.y,
			this.init_scale.z
		);

		this.forearm_r.add(this.forearm_r_sub);

		this.forearm_r_sub.position.x = -this.elbow_radius / 2;
		this.forearm_r_sub.position.y = this.smallarm_size / -2;

		return [
			this.head,
			this.torso,
			this.upperarm_l,
			this.forearm_l,
			this.upperarm_r,
			this.forearm_r,
		];
	}

	jointsDistance(a, b) {
		return Math.sqrt(
			(a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2
		);
	}

	scaleLimb(mesh, joint1, joint2, initial_size) {
		if (joint1.score > 0.1 && joint2.score > 0.1) {
			mesh.scale.set(
				1,
				this.jointsDistance(joint1, joint2) / initial_size,
				1
			);
		} else {
			mesh.scale.set(
				this.init_scale.x,
				this.init_scale.y,
				this.init_scale.z
			);
		}
	}

	getPosePosition(joint_position) {
		return {
			x: joint_position.x * this.distance_ratio,
			y: joint_position.y * this.distance_ratio,
			z: joint_position.z * this.distance_ratio,
			score: joint_position.score,
		};
	}

	applyPose(pose3D, resize = false) {
		if (!pose3D || !pose3D.length) {
			return;
		}

		const nose = this.getPosePosition(
			pose3D[BlazePoseKeypointsValues["NOSE"]]
		);

		const shoulder_pose_l = this.getPosePosition(
			pose3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]]
		);
		const elbow_pose_l = this.getPosePosition(
			pose3D[BlazePoseKeypointsValues["LEFT_ELBOW"]]
		);
		const wrist_pose_l = this.getPosePosition(
			pose3D[BlazePoseKeypointsValues["LEFT_WRIST"]]
		);
		const hip_pose_l = this.getPosePosition(
			pose3D[BlazePoseKeypointsValues["LEFT_HIP"]]
		);

		const shoulder_pose_r = this.getPosePosition(
			pose3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]]
		);
		const elbow_pose_r = this.getPosePosition(
			pose3D[BlazePoseKeypointsValues["RIGHT_ELBOW"]]
		);
		const wrist_pose_r = this.getPosePosition(
			pose3D[BlazePoseKeypointsValues["RIGHT_WRIST"]]
		);
		const hip_pose_r = this.getPosePosition(
			pose3D[BlazePoseKeypointsValues["RIGHT_HIP"]]
		);

		this.head.position.set(nose.x, nose.y, nose.z);

		this.upperarm_l.position.set(
			shoulder_pose_l.x,
			shoulder_pose_l.y,
			shoulder_pose_l.z
		);
		this.forearm_l.position.set(
			elbow_pose_l.x,
			elbow_pose_l.y,
			elbow_pose_l.z
		);

		this.upperarm_r.position.set(
			shoulder_pose_r.x,
			shoulder_pose_r.y,
			shoulder_pose_r.z
		);
		this.forearm_r.position.set(
			elbow_pose_r.x,
			elbow_pose_r.y,
			elbow_pose_r.z
		);

		const upperarm_l_target = posePointsToVector(
			elbow_pose_l,
			shoulder_pose_l
		);
		const forearm_l_target = posePointsToVector(wrist_pose_l, elbow_pose_l);

		const upperarm_r_target = posePointsToVector(
			elbow_pose_r,
			shoulder_pose_r
		);
		const forearm_r_target = posePointsToVector(wrist_pose_r, elbow_pose_r);

		const upperarm_l_q = quaternionFromVectors(
			this.init_vector,
			upperarm_l_target
		);
		const forearm_l_q = quaternionFromVectors(
			this.init_vector,
			forearm_l_target
		);

		const upperarm_r_q = quaternionFromVectors(
			this.init_vector,
			upperarm_r_target
		);
		const forearm_r_q = quaternionFromVectors(
			this.init_vector,
			forearm_r_target
		);

		this.upperarm_l.setRotationFromQuaternion(upperarm_l_q);
		this.forearm_l.setRotationFromQuaternion(forearm_l_q);

		this.upperarm_r.setRotationFromQuaternion(upperarm_r_q);
		this.forearm_r.setRotationFromQuaternion(forearm_r_q);

		// update torso geometry
		// it's a plane, defined by 4 points. left/right shoulder, left/right hip
		{
			const torso_geo =
				this.torso_mesh.geometry.attributes.position.array;

			let i = 0;

			for (const l of [
				shoulder_pose_l,
				hip_pose_r,
				shoulder_pose_r,
				shoulder_pose_l,
				hip_pose_l,
				hip_pose_r,
			]) {
				torso_geo[i++] = l.x;
				torso_geo[i++] = l.y;
				torso_geo[i++] = l.z;
			}

			this.torso_mesh.geometry.attributes.position.needsUpdate = true;
		}

		if (resize) {
			this.scaleLimb(
				this.upperarm_l_mesh,
				shoulder_pose_l,
				elbow_pose_l,
				this.bigarm_size
			);

			this.scaleLimb(
				this.forearm_l_mesh,
				wrist_pose_l,
				elbow_pose_l,
				this.smallarm_size
			);

			this.scaleLimb(
				this.upperarm_r_mesh,
				shoulder_pose_r,
				elbow_pose_r,
				this.bigarm_size
			);

			this.scaleLimb(
				this.forearm_r_mesh,
				wrist_pose_r,
				elbow_pose_r,
				this.smallarm_size
			);

			this.head_mesh.scale.set(1, 1, 1);
		}
	}

	// meshToLine(mesh) {
	// 	const sampler = new MeshSurfaceSampler(mesh).build();

	// 	const tempPosition = new THREE.Vector3();

	// 	const points = []

	// 	for (let i = 0; i < 500; i++) {
	// 		sampler.sample(tempPosition);
	// 		points.push(tempPosition.clone())
	// 	}

	// 	// const curve = new THREE.CatmullRomCurve3(points).getPoints(100);

	// 	const geometry = new THREE.BufferGeometry().setFromPoints( points );

	// 	// const material = new MeshLineMaterial( {
	// 	// 	transparent: true,
	// 	// 	depthTest:false,
	// 	// 	lineWidth:0.5,
	// 	// 	color: 0xffcc12,
	// 	// 	dashArray:4,
	// 	// 	dashRatio:0.95,
	// 	// } );

	// 	const material = new THREE.PointsMaterial({
	// 		color: 0x47b2f5,
	// 		size: 0.1,
	// 		// transparent: true,
	// 		// opacity: 0.5,
	// 	});

	// 	return new THREE.Points( geometry, material );
	// }
}
