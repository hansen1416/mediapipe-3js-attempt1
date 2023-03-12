import * as THREE from "three";
import { Quaternion } from "three";
// import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

import {
	BlazePoseKeypointsValues,
	posePointsToVector,
	quaternionFromVectors,
} from "./ropes";
// import MeshLineMaterial from "./MeshLineMaterial";

function middlePosition(a, b) {
	return new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
}

export default class Silhouette3D {
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

		this.head_radius = 3 * this.unit;
		this.neck_radius = 1.6 * this.unit;
		this.neck_size = 2 * this.unit;

		this.shoulder_size = 10 * this.unit;
		this.chest_size = 7 * this.unit;
		this.abs_size = 5 * this.unit;
		this.waist_size = 8 * this.unit;

		this.deltoid_radius = 2 * this.unit;
		this.bigarm_size = 8 * this.unit;
		this.elbow_radius = 1.6 * this.unit;

		this.smallarm_size = 8 * this.unit;
		this.wrist_size = 1.2 * this.unit;

		this.thigh_radius = 2.8 * this.unit;
		this.thigh_size = 10 * this.unit;
		this.knee_radius = 2.0 * this.unit;

		this.calf_size = 10 * this.unit;
		this.ankle_radius = 1.6 * this.unit;

		// the initial vector of limbs
		this.init_vector = new THREE.Vector3(0, -1, 0);

		// todo remove this property when i'm sure
		// replace mesh by particles
		this.add_mesh = true;

		this.color = 0x44aa88;

		// opacity of material, when pose score is lower/higher then 0.5
		this.invisible_opacity = 0.3;
		this.visible_opacity = 0.5;
	}

	getBoxMesh(width, height, depth) {
		/**
		 *
		 */
		return new THREE.Mesh(
			new THREE.BoxGeometry(width, height, depth),
			new THREE.MeshBasicMaterial({
				color: this.color,
				transparent: true,
				opacity: this.invisible_opacity,
			})
		);
	}

	getBallMesh(radius, widthSegments = 8, heightSegments = 8) {
		/**
		 * a ball
		 */
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, widthSegments, heightSegments),
			new THREE.MeshBasicMaterial({
				color: this.color,
				transparent: true,
				opacity: this.invisible_opacity,
			})
		);
	}

	getLimbMesh(
		radiusTop,
		radiusBottom,
		height,
		radialSegments = 8,
		heightSegments = 1
	) {
		/**
		 * the cylinder for limbs
		 * @param {number} radiusTop
		 * @param {number} radiusBottom
		 * @param {number} height
		 * @param {number} radialSegments
		 * @param {number} heightSegments
		 * @returns
		 */
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

	init() {
		/**
		 * initialize body parts
		 */

		// the overall group, contains everything
		this.body = new THREE.Group();

		// abdominal
		this.abs_mesh = this.getBoxMesh(
			this.waist_size,
			this.abs_size,
			this.deltoid_radius
		);

		this.abs_mesh.position.set(0, 0, 0);

		this.body.add(this.abs_mesh);

		// todo separate torso to two parts, chest and abdominal
		this.chest_mesh = this.getBoxMesh(
			this.shoulder_size,
			this.chest_size,
			this.deltoid_radius
		);

		this.chest_mesh.add(new THREE.AxesHelper(30));

		this.chest_mesh.position.set(
			0,
			this.abs_size + (this.chest_size - this.abs_size) / 2,
			0
		);

		this.abs_mesh.add(this.chest_mesh);

		// head
		this.head_mesh = this.getBallMesh(this.head_radius);

		this.head_mesh.position.set(0, this.chest_size, 0);

		this.chest_mesh.add(this.head_mesh);

		// left shoulder
		this.shoulder_l_mesh = this.getBallMesh((this.deltoid_radius * 3) / 2);

		this.shoulder_l_mesh.position.set(
			this.shoulder_size / 2 - this.deltoid_radius / 2,
			this.chest_size / 2 - this.deltoid_radius,
			0
		);

		this.chest_mesh.add(this.shoulder_l_mesh);

		// right shoulder
		this.shoulder_r_mesh = this.getBallMesh(this.deltoid_radius);

		this.shoulder_r_mesh.position.set(
			this.shoulder_size / -2 + this.deltoid_radius / 2,
			this.chest_size / 2 - this.deltoid_radius,
			0
		);

		this.chest_mesh.add(this.shoulder_r_mesh);

		return this.body;

		// left upperarm
		this.upperarm_l = new THREE.Group();

		this.upperarm_l_mesh = this.getLimbMesh(
			this.deltoid_radius,
			this.elbow_radius,
			this.bigarm_size
		);

		if (this.add_mesh) {
			this.upperarm_l.add(this.upperarm_l_mesh);
		}
		this.body.add(this.upperarm_l);

		// left lowerarm
		this.lowerarm_l = new THREE.Group();

		this.lowerarm_l_mesh = this.getLimbMesh(
			this.elbow_radius,
			this.wrist_size,
			this.smallarm_size
		);

		if (this.add_mesh) {
			this.lowerarm_l.add(this.lowerarm_l_mesh);
		}
		this.body.add(this.lowerarm_l);

		// right upperarm
		this.upperarm_r = new THREE.Group();

		this.upperarm_r_mesh = this.getLimbMesh(
			this.deltoid_radius,
			this.elbow_radius,
			this.bigarm_size
		);

		if (this.add_mesh) {
			this.upperarm_r.add(this.upperarm_r_mesh);
		}
		this.body.add(this.upperarm_r);
		// right lowerarm
		this.lowerarm_r = new THREE.Group();

		this.lowerarm_r_mesh = this.getLimbMesh(
			this.elbow_radius,
			this.wrist_size,
			this.smallarm_size
		);

		if (this.add_mesh) {
			this.lowerarm_r.add(this.lowerarm_r_mesh);
		}
		this.body.add(this.lowerarm_r);

		// left thigh
		this.thigh_l = new THREE.Group();

		this.thigh_l_mesh = this.getLimbMesh(
			this.thigh_radius,
			this.knee_radius,
			this.thigh_size
		);

		if (this.add_mesh) {
			this.thigh_l.add(this.thigh_l_mesh);
		}
		this.body.add(this.thigh_l);
		// right thigh
		this.thigh_r = new THREE.Group();

		this.thigh_r_mesh = this.getLimbMesh(
			this.thigh_radius,
			this.knee_radius,
			this.thigh_size
		);

		if (this.add_mesh) {
			this.thigh_r.add(this.thigh_r_mesh);
		}
		this.body.add(this.thigh_r);
		// left calf
		this.calf_l = new THREE.Group();

		this.calf_l_mesh = this.getLimbMesh(
			this.knee_radius,
			this.ankle_radius,
			this.calf_size
		);

		if (this.add_mesh) {
			this.calf_l.add(this.calf_l_mesh);
		}
		this.body.add(this.calf_l);
		// right calf
		this.calf_r = new THREE.Group();

		this.calf_r_mesh = this.getLimbMesh(
			this.knee_radius,
			this.ankle_radius,
			this.calf_size
		);

		if (this.add_mesh) {
			this.calf_r.add(this.calf_r_mesh);
		}
		this.body.add(this.calf_r);

		return this.body;
	}

	quaternionFromBasis(xaxis0, yaxis0, zaxis0, xaxis1, yaxis1, zaxis1) {
		/**
		 * transfer object from basis0 to basis1
		 */
		const m0 = new THREE.Matrix4().makeBasis(xaxis0, yaxis0, zaxis0);
		const m1 = new THREE.Matrix4().makeBasis(xaxis1, yaxis1, zaxis1);

		const m = m1.multiply(m0.invert());

		return new THREE.Quaternion().setFromRotationMatrix(m);
	}

	torsoRotation(left_shoulder2, right_shoulder2, left_hip2, right_hip2) {
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

		const zaxis1 = new THREE.Vector3()
			.crossVectors(xaxis1, y_tmp1)
			.normalize();

		const yaxis1 = new THREE.Vector3()
			.crossVectors(xaxis1, zaxis1)
			.normalize();

		const chest_q = this.quaternionFromBasis(
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

		const zaxis3 = new THREE.Vector3()
			.crossVectors(xaxis3, y_tmp3)
			.normalize();

		const yaxis3 = new THREE.Vector3()
			.crossVectors(zaxis3, xaxis3)
			.normalize();

		// console.log(xaxis3, yaxis3, zaxis3);

		const abs_q = this.quaternionFromBasis(
			xaxis2,
			yaxis2,
			zaxis2,
			xaxis3,
			yaxis3,
			zaxis3
		);

		const qs = chest_q.clone().multiply(abs_q.clone().invert());

		return [qs, abs_q];
	}

	applyPose(pose3D, resize = false) {
		/**
		 * apply pose to mesh, adjust it's position and scale
		 */
		if (!pose3D || !pose3D.length) {
			return;
		}

		// get position of joints
		const nose = pose3D[BlazePoseKeypointsValues["NOSE"]];

		const shoulder_pose_l =
			pose3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]];
		const elbow_pose_l = pose3D[BlazePoseKeypointsValues["LEFT_ELBOW"]];
		const wrist_pose_l = pose3D[BlazePoseKeypointsValues["LEFT_WRIST"]];
		const hip_pose_l = pose3D[BlazePoseKeypointsValues["LEFT_HIP"]];
		const knee_pose_l = pose3D[BlazePoseKeypointsValues["LEFT_KNEE"]];
		const ankle_pose_l = pose3D[BlazePoseKeypointsValues["LEFT_ANKLE"]];

		const shoulder_pose_r =
			pose3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]];
		const elbow_pose_r = pose3D[BlazePoseKeypointsValues["RIGHT_ELBOW"]];
		const wrist_pose_r = pose3D[BlazePoseKeypointsValues["RIGHT_WRIST"]];
		const hip_pose_r = pose3D[BlazePoseKeypointsValues["RIGHT_HIP"]];
		const knee_pose_r = pose3D[BlazePoseKeypointsValues["RIGHT_KNEE"]];
		const ankle_pose_r = pose3D[BlazePoseKeypointsValues["RIGHT_ANKLE"]];

		const [chest_q, abs_q] = this.torsoRotation(
			new THREE.Vector3(
				shoulder_pose_l.x,
				shoulder_pose_l.y,
				shoulder_pose_l.z
			),
			new THREE.Vector3(
				shoulder_pose_r.x,
				shoulder_pose_r.y,
				shoulder_pose_r.z
			),
			new THREE.Vector3(hip_pose_l.x, hip_pose_l.y, hip_pose_l.z),
			new THREE.Vector3(hip_pose_r.x, hip_pose_r.y, hip_pose_r.z)
		);

		this.chest_mesh.rotation.setFromQuaternion(chest_q);

		this.abs_mesh.rotation.setFromQuaternion(abs_q);

		return;

		// set limbs positions
		// this.head.position.set(nose.x, nose.y, nose.z);

		this.upperarm_l.position.set(
			shoulder_pose_l.x,
			shoulder_pose_l.y,
			shoulder_pose_l.z
		);
		this.lowerarm_l.position.set(
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
		this.lowerarm_r.position.set(
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
		const lowerarm_l_target = posePointsToVector(
			wrist_pose_l,
			elbow_pose_l
		);
		const thigh_l_target = posePointsToVector(knee_pose_l, hip_pose_l);
		const calf_l_target = posePointsToVector(ankle_pose_l, knee_pose_l);

		const upperarm_r_target = posePointsToVector(
			elbow_pose_r,
			shoulder_pose_r
		);
		const lowerarm_r_target = posePointsToVector(
			wrist_pose_r,
			elbow_pose_r
		);
		const thigh_r_target = posePointsToVector(knee_pose_r, hip_pose_r);
		const calf_r_target = posePointsToVector(ankle_pose_r, knee_pose_r);

		// calculate quaternions for limbs
		const upperarm_l_q = quaternionFromVectors(
			this.init_vector,
			upperarm_l_target
		);
		const lowerarm_l_q = quaternionFromVectors(
			this.init_vector,
			lowerarm_l_target
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
		const lowerarm_r_q = quaternionFromVectors(
			this.init_vector,
			lowerarm_r_target
		);
		const thigh_r_q = quaternionFromVectors(
			this.init_vector,
			thigh_r_target
		);
		const calf_r_q = quaternionFromVectors(this.init_vector, calf_r_target);

		this.upperarm_l.setRotationFromQuaternion(upperarm_l_q);
		this.lowerarm_l.setRotationFromQuaternion(lowerarm_l_q);
		this.thigh_l.setRotationFromQuaternion(thigh_l_q);
		this.calf_l.setRotationFromQuaternion(calf_l_q);

		this.upperarm_r.setRotationFromQuaternion(upperarm_r_q);
		this.lowerarm_r.setRotationFromQuaternion(lowerarm_r_q);
		this.thigh_r.setRotationFromQuaternion(thigh_r_q);
		this.calf_r.setRotationFromQuaternion(calf_r_q);
	}

	applyColor(colors) {
		/**
		 * apply color to mesh
		 */

		for (let name in colors) {
			// if (name === "lowerarm_r") {
			// 	console.log(colors[name], this[name + "_mesh"]);
			// }

			this[name + "_mesh"].material.color.setRGB(
				Number(colors[name][0]) / 255,
				Number(colors[name][1]) / 255,
				Number(colors[name][2]) / 255
			);
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
