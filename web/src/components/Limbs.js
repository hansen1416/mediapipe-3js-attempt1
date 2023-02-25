import * as THREE from "three";
// import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

import {
	BlazePoseKeypointsValues,
	posePointsToVector,
	quaternionFromVectors,
	distanceBetweenPoints,
} from "./ropes";
// import MeshLineMaterial from "./MeshLineMaterial";

export default class Limbs {
	/**
	 * todo, work out the math for a proper position of landmark
	 * it should be in good proportion and can change as camera distance change
	 *
	 * use particle for limbs
	 *
	 *
	 */

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

		// the initial vector of limbs
		this.init_vector = new THREE.Vector3(0, -1, 0);

		// todo remove this property when i'm sure
		// replace mesh by particles
		this.add_mesh = true;

		this.color = 0x44aa88;

		this.invisible_opacity = 0.1;
		this.visible_opacity = 0.5;
	}

	/**
	 * the cylinder for limbs
	 * @param {number} radiusTop
	 * @param {number} radiusBottom
	 * @param {number} height
	 * @param {number} radialSegments
	 * @param {number} heightSegments
	 * @returns
	 */
	getLimbMesh(
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
			color: this.color,
			transparent: true,
			opacity: 0,
		});

		return new THREE.Mesh(geometry, material);
	}

	getTorsoMesh(points) {
		const geometry = new THREE.BufferGeometry().setFromPoints(points);

		const material = new THREE.MeshBasicMaterial({
			color: this.color,
			transparent: true,
			opacity: 0,
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
			color: this.color,
			transparent: true,
			opacity: 0,
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
		this.head_sub.position.z = this.head_radius * -2;

		this.head.add(this.head_sub);

		// torso
		this.torso = new THREE.Group();

		this.torso_sub = new THREE.Group();

		this.torso_mesh = this.getTorsoMesh([
			new THREE.Vector3(-1, 1, 0),
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 1, 0),
			new THREE.Vector3(-1, 1, 0),
			new THREE.Vector3(-1, 0, 0),
			new THREE.Vector3(0, 0, 0),
		]);

		if (this.add_mesh) {
			this.torso_sub.add(this.torso_mesh);
		}

		this.torso.add(this.torso_sub);

		// left upperarm
		this.upperarm_l = new THREE.Group();

		this.upperarm_l_sub = new THREE.Group();

		this.upperarm_l_mesh = this.getLimbMesh(
			this.deltoid_radius,
			this.elbow_radius,
			this.bigarm_size
		);

		if (this.add_mesh) {
			this.upperarm_l_sub.add(this.upperarm_l_mesh);
		}

		this.upperarm_l.add(this.upperarm_l_sub);

		this.upperarm_l_sub.position.x = this.deltoid_radius / 2;
		this.upperarm_l_sub.position.y = this.bigarm_size / -2;

		// left forearm
		this.forearm_l = new THREE.Group();

		this.forearm_l_sub = new THREE.Group();

		this.forearm_l_mesh = this.getLimbMesh(
			this.elbow_radius,
			this.wrist_size,
			this.smallarm_size
		);

		if (this.add_mesh) {
			this.forearm_l_sub.add(this.forearm_l_mesh);
		}

		this.forearm_l.add(this.forearm_l_sub);

		this.forearm_l_sub.position.x = this.elbow_radius / 2;
		this.forearm_l_sub.position.y = this.smallarm_size / -2;

		// right upperarm
		this.upperarm_r = new THREE.Group();

		this.upperarm_r_sub = new THREE.Group();

		this.upperarm_r_mesh = this.getLimbMesh(
			this.deltoid_radius,
			this.elbow_radius,
			this.bigarm_size
		);

		if (this.add_mesh) {
			this.upperarm_r_sub.add(this.upperarm_r_mesh);
		}

		this.upperarm_r.add(this.upperarm_r_sub);

		this.upperarm_r_sub.position.x = this.deltoid_radius / -2;
		this.upperarm_r_sub.position.y = this.bigarm_size / -2;

		// right forearm
		this.forearm_r = new THREE.Group();

		this.forearm_r_sub = new THREE.Group();

		this.forearm_r_mesh = this.getLimbMesh(
			this.elbow_radius,
			this.wrist_size,
			this.smallarm_size
		);

		if (this.add_mesh) {
			this.forearm_r_sub.add(this.forearm_r_mesh);
		}

		this.forearm_r.add(this.forearm_r_sub);

		this.forearm_r_sub.position.x = this.elbow_radius / -2;
		this.forearm_r_sub.position.y = this.smallarm_size / -2;

		// left thigh
		this.thigh_l = new THREE.Group();

		this.thigh_l_sub = new THREE.Group();

		this.thigh_l_mesh = this.getLimbMesh(
			this.thigh_radius,
			this.knee_radius,
			this.thigh_size
		);

		if (this.add_mesh) {
			this.thigh_l_sub.add(this.thigh_l_mesh);
		}

		this.thigh_l.add(this.thigh_l_sub);

		this.thigh_l_sub.position.x = this.thigh_radius / 2;
		this.thigh_l_sub.position.y = this.thigh_size / -2;

		// right thigh
		this.thigh_r = new THREE.Group();

		this.thigh_r_sub = new THREE.Group();

		this.thigh_r_mesh = this.getLimbMesh(
			this.thigh_radius,
			this.knee_radius,
			this.thigh_size
		);

		if (this.add_mesh) {
			this.thigh_r_sub.add(this.thigh_r_mesh);
		}

		this.thigh_r.add(this.thigh_r_sub);

		this.thigh_r_sub.position.x = this.thigh_radius / -2;
		this.thigh_r_sub.position.y = this.thigh_size / -2;

		// left calf
		this.calf_l = new THREE.Group();

		this.calf_l_sub = new THREE.Group();

		this.calf_l_mesh = this.getLimbMesh(
			this.knee_radius,
			this.ankle_radius,
			this.calf_size
		);

		if (this.add_mesh) {
			this.calf_l_sub.add(this.calf_l_mesh);
		}

		this.calf_l.add(this.calf_l_sub);

		this.calf_l_sub.position.x = this.knee_radius / 2;
		this.calf_l_sub.position.y = this.calf_size / -2;

		// right calf
		this.calf_r = new THREE.Group();

		this.calf_r_sub = new THREE.Group();

		this.calf_r_mesh = this.getLimbMesh(
			this.knee_radius,
			this.ankle_radius,
			this.calf_size
		);

		if (this.add_mesh) {
			this.calf_r_sub.add(this.calf_r_mesh);
		}

		this.calf_r.add(this.calf_r_sub);

		this.calf_r_sub.position.x = this.knee_radius / -2;
		this.calf_r_sub.position.y = this.calf_size / -2;

		return [
			this.head,
			this.torso,
			this.upperarm_l,
			this.forearm_l,
			this.upperarm_r,
			this.forearm_r,
			this.thigh_l,
			this.thigh_r,
			this.calf_l,
			this.calf_r,
		];
	}

	scaleLimb(mesh, joint1, joint2) {
		if (joint1.score < 0.5 || joint2.score < 0.5) {
			mesh.material.opacity = this.invisible_opacity;

			return;
		}

		/**
		 * cylinder geometry parameters
		 * 
		height
		heightSegments
		openEnded
		radialSegments
		radiusBottom
		radiusTop
		thetaLength
		thetaStart
		 */
		const size = distanceBetweenPoints(joint1, joint2);
		const width_scale =
			size /
			3 /
			(mesh.geometry.parameters.radiusTop +
				mesh.geometry.parameters.radiusBottom);

		mesh.scale.set(
			width_scale,
			size / mesh.geometry.parameters.height,
			width_scale
		);

		mesh.material.opacity = this.visible_opacity;
	}

	/**
	 * todo, remove this function when i'm absolutely sure
	 * @param {object} joint_position
	 * @returns
	 */
	getPosePosition(joint_position) {
		return joint_position;

		// return {
		// 	x: joint_position.x * this.distance_ratio,
		// 	y: joint_position.y * this.distance_ratio,
		// 	z: joint_position.z * this.distance_ratio,
		// 	score: joint_position.score,
		// };
	}

	applyPose(pose3D, resize = false) {
		if (!pose3D || !pose3D.length) {
			return;
		}

		// get position of joints
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
		const knee_pose_l = this.getPosePosition(
			pose3D[BlazePoseKeypointsValues["LEFT_KNEE"]]
		);
		const ankle_pose_l = this.getPosePosition(
			pose3D[BlazePoseKeypointsValues["LEFT_ANKLE"]]
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
		const knee_pose_r = this.getPosePosition(
			pose3D[BlazePoseKeypointsValues["RIGHT_KNEE"]]
		);
		const ankle_pose_r = this.getPosePosition(
			pose3D[BlazePoseKeypointsValues["RIGHT_ANKLE"]]
		);

		// set limbs positions
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
		this.thigh_l.position.set(hip_pose_l.x, hip_pose_l.y, hip_pose_l.z);
		this.calf_l.position.set(knee_pose_l.x, knee_pose_l.y, knee_pose_l.z);

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
		this.thigh_r.position.set(hip_pose_r.x, hip_pose_r.y, hip_pose_r.z);
		this.calf_r.position.set(knee_pose_r.x, knee_pose_r.y, knee_pose_r.z);

		// calculate the target vectors for limbs
		const upperarm_l_target = posePointsToVector(
			elbow_pose_l,
			shoulder_pose_l
		);
		const forearm_l_target = posePointsToVector(wrist_pose_l, elbow_pose_l);
		const thigh_l_target = posePointsToVector(knee_pose_l, hip_pose_l);
		const calf_l_target = posePointsToVector(ankle_pose_l, knee_pose_l);

		const upperarm_r_target = posePointsToVector(
			elbow_pose_r,
			shoulder_pose_r
		);
		const forearm_r_target = posePointsToVector(wrist_pose_r, elbow_pose_r);
		const thigh_r_target = posePointsToVector(knee_pose_r, hip_pose_r);
		const calf_r_target = posePointsToVector(ankle_pose_r, knee_pose_r);

		// calculate quaternions for limbs
		const upperarm_l_q = quaternionFromVectors(
			this.init_vector,
			upperarm_l_target
		);
		const forearm_l_q = quaternionFromVectors(
			this.init_vector,
			forearm_l_target
		);
		const thigh_l_q = quaternionFromVectors(
			this.init_vector,
			thigh_l_target
		);
		const calf_l_q = quaternionFromVectors(this.init_vector, calf_l_target);

		const upperarm_r_q = quaternionFromVectors(
			this.init_vector,
			upperarm_r_target
		);
		const forearm_r_q = quaternionFromVectors(
			this.init_vector,
			forearm_r_target
		);
		const thigh_r_q = quaternionFromVectors(
			this.init_vector,
			thigh_r_target
		);
		const calf_r_q = quaternionFromVectors(this.init_vector, calf_r_target);

		this.upperarm_l.setRotationFromQuaternion(upperarm_l_q);
		this.forearm_l.setRotationFromQuaternion(forearm_l_q);
		this.thigh_l.setRotationFromQuaternion(thigh_l_q);
		this.calf_l.setRotationFromQuaternion(calf_l_q);

		this.upperarm_r.setRotationFromQuaternion(upperarm_r_q);
		this.forearm_r.setRotationFromQuaternion(forearm_r_q);
		this.thigh_r.setRotationFromQuaternion(thigh_r_q);
		this.calf_r.setRotationFromQuaternion(calf_r_q);

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

			const valid_score = [
				shoulder_pose_l.score,
				shoulder_pose_r.score,
				hip_pose_l.score,
				hip_pose_r.score,
			].filter((s) => s > 0.5);

			if (valid_score.length > 2) {
				this.torso_mesh.material.opacity = this.visible_opacity;
			} else {
				this.torso_mesh.material.opacity = this.invisible_opacity;
			}
		}

		if (resize) {
			// todo also adjust the radius of cylinder here
			this.scaleLimb(this.upperarm_l_mesh, shoulder_pose_l, elbow_pose_l);
			this.scaleLimb(this.forearm_l_mesh, wrist_pose_l, elbow_pose_l);
			this.scaleLimb(this.thigh_l_mesh, knee_pose_l, hip_pose_l);
			this.scaleLimb(this.calf_l_mesh, ankle_pose_l, knee_pose_l);

			this.scaleLimb(this.upperarm_r_mesh, shoulder_pose_r, elbow_pose_r);
			this.scaleLimb(this.forearm_r_mesh, wrist_pose_r, elbow_pose_r);
			this.scaleLimb(this.thigh_r_mesh, knee_pose_r, hip_pose_r);
			this.scaleLimb(this.calf_r_mesh, ankle_pose_r, knee_pose_r);

			if (nose.score > 0.5) {
				this.head_mesh.material.opacity = this.visible_opacity;

				if (
					shoulder_pose_l.score > 0.5 &&
					shoulder_pose_r.score > 0.5
				) {
					const head_scale =
						distanceBetweenPoints(
							shoulder_pose_l,
							shoulder_pose_r
						) /
						4 /
						this.head_mesh.geometry.parameters.radius;

					this.head_mesh.scale.set(
						head_scale,
						head_scale,
						head_scale
					);
				}
			} else {
				this.head_mesh.material.opacity = this.invisible_opacity;
			}
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
