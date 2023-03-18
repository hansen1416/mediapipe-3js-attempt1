import * as THREE from "three";

import { BlazePoseKeypointsValues } from "./ropes";

function middlePosition(a, b) {
	return new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
}

function posVec(p) {
	return new THREE.Vector3(p.x, p.y, p.z);
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

function getLimbQuaternion(pose3D, joint_start, joint_end) {
	/**
	 * calculate quaternion for a limb,
	 * which start from `joint_start` end at `joint_end`
	 */
	const start_pos = pose3D[BlazePoseKeypointsValues[joint_start]];
	const end_pos = pose3D[BlazePoseKeypointsValues[joint_end]];

	const quaternion = new THREE.Quaternion();

	if (
		(start_pos.score && start_pos.score < 0.5) ||
		(end_pos.score && end_pos.score < 0.5)
	) {
		return quaternion;
	}

	quaternion.setFromUnitVectors(
		new THREE.Vector3(0, -1, 0).normalize(),
		new THREE.Vector3(
			end_pos.x - start_pos.x,
			end_pos.y - start_pos.y,
			end_pos.z - start_pos.z
		).normalize()
	);

	return quaternion;
}

function getQuaternions(pose3D) {
	// get position of joints

	const shoulder_pose_l = posVec(
		pose3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]]
	);
	const hip_pose_l = posVec(pose3D[BlazePoseKeypointsValues["LEFT_HIP"]]);
	const shoulder_pose_r = posVec(
		pose3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]]
	);
	const hip_pose_r = posVec(pose3D[BlazePoseKeypointsValues["RIGHT_HIP"]]);

	const result = {};

	const [abs_q, chest_q] = torsoRotation(
		shoulder_pose_l,
		shoulder_pose_r,
		hip_pose_l,
		hip_pose_r
	);

	result["abs"] = abs_q;
	result["chest"] = chest_q;

	result["head"] = new THREE.Quaternion();

	result["upperarm_l"] = getLimbQuaternion(
		pose3D,
		"LEFT_SHOULDER",
		"LEFT_ELBOW"
	);

	result["lowerarm_l"] = getLimbQuaternion(
		pose3D,
		"LEFT_ELBOW",
		"LEFT_WRIST"
	);

	result["hand_l"] = new THREE.Quaternion();

	result["upperarm_r"] = getLimbQuaternion(
		pose3D,
		"RIGHT_SHOULDER",
		"RIGHT_ELBOW"
	);

	result["lowerarm_r"] = getLimbQuaternion(
		pose3D,
		"RIGHT_ELBOW",
		"RIGHT_WRIST"
	);

	result["hand_r"] = new THREE.Quaternion();

	result["thigh_l"] = getLimbQuaternion(pose3D, "LEFT_HIP", "LEFT_KNEE");

	result["calf_l"] = getLimbQuaternion(pose3D, "LEFT_KNEE", "LEFT_ANKLE");

	result["foot_l"] = new THREE.Quaternion();

	result["thigh_r"] = getLimbQuaternion(pose3D, "RIGHT_HIP", "RIGHT_KNEE");

	result["calf_r"] = getLimbQuaternion(pose3D, "RIGHT_KNEE", "RIGHT_ANKLE");

	result["foot_r"] = new THREE.Quaternion();

	return result;
}

export default class Silhouette3D {
	/**
	 * limbs geometry combined 3d human figure
	 */

	limbs = [
		"abs",
		"chest",
		"head",
		"upperarm_l",
		"lowerarm_l",
		"hand_l",
		"upperarm_r",
		"lowerarm_r",
		"hand_r",
		"thigh_l",
		"calf_l",
		"foot_l",
		"thigh_r",
		"calf_r",
		"foot_r",
	];

	constructor() {
		this.unit = 1;

		this.head_radius = 3 * this.unit;

		this.chest_width = 10 * this.unit;
		this.chest_height = 7 * this.unit;
		this.chest_depth = 3 * this.unit;
		this.abs_height = 5 * this.unit;
		this.abs_width = 8 * this.unit;
		this.abs_depth = 2 * this.unit;

		this.deltoid_radius = 2 * this.unit;
		this.bigarm_size = 8 * this.unit;
		this.elbow_radius = 1.6 * this.unit;
		this.smallarm_size = 8 * this.unit;
		this.wrist_size = 1.2 * this.unit;

		this.hand_width = 2.2 * this.unit;
		this.hand_height = 3 * this.unit;
		this.hand_depth = 1 * this.unit;

		this.thigh_radius = 2.8 * this.unit;
		this.thigh_size = 10 * this.unit;
		this.knee_radius = 2.0 * this.unit;
		this.calf_size = 10 * this.unit;
		this.ankle_radius = 1.6 * this.unit;

		this.foot_width = 3.2 * this.unit;
		this.foot_height = 4 * this.unit;
		this.foot_depth = 1 * this.unit;

		// color of material
		this.color = 0x44aa88;
		// opacity of material, when pose score is lower/higher then 0.5
		this.invisible_opacity = 0.5;
		this.visible_opacity = 0.8;

		this.body = new THREE.Group();

		this.abs = {
			group: new THREE.Group(),
			mesh: this.getBoxMesh(
				this.abs_width,
				this.abs_height,
				this.abs_depth
			),
			position: () => {
				return new THREE.Vector3(0, 0, 0);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.chest = {
			group: new THREE.Group(),
			mesh: this.getBoxMesh(
				this.chest_width,
				this.chest_height,
				this.chest_depth
			),
			position: () => {
				const v = new THREE.Vector3(
					0,
					this.abs_height + (this.chest_height - this.abs_height) / 2,
					0
				);

				v.applyQuaternion(this.abs.group.quaternion);

				return v;
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.head = {
			group: new THREE.Group(),
			mesh: this.getBallMesh(this.head_radius),
			position: () => {
				const v0 = new THREE.Vector3(
					0,
					this.chest_height / 2 + this.head_radius,
					0
				);

				v0.applyQuaternion(this.chest.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.chest.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.upperarm_l = {
			group: new THREE.Group(),
			mesh: this.getCylinderMesh(
				this.deltoid_radius,
				this.elbow_radius,
				this.bigarm_size
			),
			position: () => {
				const v0 = new THREE.Vector3(
					this.chest_width / 2,
					this.chest_height / 2,
					0
				);

				v0.applyQuaternion(this.chest.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.chest.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, -this.chest_height / 2, 0),
		};
		this.lowerarm_l = {
			group: new THREE.Group(),
			mesh: this.getCylinderMesh(
				this.elbow_radius,
				this.wrist_size,
				this.smallarm_size
			),
			position: () => {
				const v0 = new THREE.Vector3(0, -this.bigarm_size, 0);

				v0.applyQuaternion(this.upperarm_l.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.upperarm_l.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, -this.smallarm_size / 2, 0),
		};
		this.hand_l = {
			group: new THREE.Group(),
			mesh: this.getBoxMesh(
				this.hand_width,
				this.hand_height,
				this.hand_depth
			),
			position: () => {
				const v0 = new THREE.Vector3(0, -this.smallarm_size, 0);

				v0.applyQuaternion(this.lowerarm_l.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.lowerarm_l.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, -this.hand_height / 2, 0),
		};
		this.upperarm_r = {
			group: new THREE.Group(),
			mesh: this.getCylinderMesh(
				this.deltoid_radius,
				this.elbow_radius,
				this.bigarm_size
			),
			position: () => {
				const v0 = new THREE.Vector3(
					-this.chest_width / 2,
					this.chest_height / 2,
					0
				);

				v0.applyQuaternion(this.chest.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.chest.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, -this.chest_height / 2, 0),
		};
		this.lowerarm_r = {
			group: new THREE.Group(),
			mesh: this.getCylinderMesh(
				this.elbow_radius,
				this.wrist_size,
				this.smallarm_size
			),
			position: () => {
				const v0 = new THREE.Vector3(0, -this.bigarm_size, 0);

				v0.applyQuaternion(this.upperarm_r.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.upperarm_r.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, -this.smallarm_size / 2, 0),
		};
		this.hand_r = {
			group: new THREE.Group(),
			mesh: this.getBoxMesh(
				this.hand_width,
				this.hand_height,
				this.hand_depth
			),
			position: () => {
				const v0 = new THREE.Vector3(0, -this.smallarm_size, 0);

				v0.applyQuaternion(this.lowerarm_r.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.lowerarm_r.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, -this.hand_height / 2, 0),
		};
		this.thigh_l = {
			group: new THREE.Group(),
			mesh: this.getCylinderMesh(
				this.thigh_radius,
				this.knee_radius,
				this.thigh_size
			),
			position: () => {
				const v0 = new THREE.Vector3(
					this.abs_width / 2,
					-this.abs_height / 2,
					0
				);

				v0.applyQuaternion(this.abs.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.abs.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, -this.thigh_size / 2, 0),
		};
		this.calf_l = {
			group: new THREE.Group(),
			mesh: this.getCylinderMesh(
				this.knee_radius,
				this.ankle_radius,
				this.calf_size
			),
			position: () => {
				const v0 = new THREE.Vector3(0, -this.thigh_size, 0);

				v0.applyQuaternion(this.thigh_l.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.thigh_l.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, -this.calf_size / 2, 0),
		};
		this.foot_l = {
			group: new THREE.Group(),
			mesh: this.getBoxMesh(
				this.foot_width,
				this.foot_height,
				this.foot_depth
			),
			position: () => {
				const v0 = new THREE.Vector3(0, -this.calf_size, 0);

				v0.applyQuaternion(this.calf_l.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.calf_l.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, -this.foot_height / 2, 0),
		};
		this.thigh_r = {
			group: new THREE.Group(),
			mesh: this.getCylinderMesh(
				this.thigh_radius,
				this.knee_radius,
				this.thigh_size
			),
			position: () => {
				const v0 = new THREE.Vector3(
					-this.abs_width / 2,
					-this.abs_height / 2,
					0
				);

				v0.applyQuaternion(this.abs.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.abs.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, -this.thigh_size / 2, 0),
		};
		this.calf_r = {
			group: new THREE.Group(),
			mesh: this.getCylinderMesh(
				this.knee_radius,
				this.ankle_radius,
				this.calf_size
			),
			position: () => {
				const v0 = new THREE.Vector3(0, -this.thigh_size, 0);

				v0.applyQuaternion(this.thigh_r.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.thigh_r.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, -this.calf_size / 2, 0),
		};
		this.foot_r = {
			group: new THREE.Group(),
			mesh: this.getBoxMesh(
				this.foot_width,
				this.foot_height,
				this.foot_depth
			),
			position: () => {
				const v0 = new THREE.Vector3(0, -this.calf_size, 0);

				v0.applyQuaternion(this.calf_r.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.calf_r.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, -this.foot_height / 2, 0),
		};
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

	getCylinderMesh(
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
			opacity: this.invisible_opacity,
		});

		return new THREE.Mesh(geometry, material);
	}

	init() {
		/**
		 * initialize body parts
		 */

		for (let name of this.limbs) {
			this[name].group.name = name;

			this.body.add(this[name].group);

			this[name].group.add(this[name].mesh);

			const pos = this[name].position();

			this[name].group.position.set(pos.x, pos.y, pos.z);

			this[name].mesh.position.set(
				this[name].mesh_position.x,
				this[name].mesh_position.y,
				this[name].mesh_position.z
			);
		}

		return this.body;
	}

	applyPose(pose3D) {
		/**
		 * apply pose to mesh, adjust it's position and scale
		 */
		if (!pose3D || !pose3D.length) {
			return;
		}

		const qs = getQuaternions(pose3D);

		for (let name of this.limbs) {
			if (!qs[name]) {
				continue;
			}

			const pos = this[name].position();

			this[name].group.position.set(pos.x, pos.y, pos.z);

			this[name].group.rotation.setFromQuaternion(qs[name]);
		}
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
}
