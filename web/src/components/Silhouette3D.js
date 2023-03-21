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
		(left_shoulder2.score && left_shoulder2.score < 0.5) ||
		(right_shoulder2.score && right_shoulder2.score < 0.5) ||
		(left_hip2.score && left_hip2.score < 0.5) ||
		(right_hip2.score && right_hip2.score < 0.5)
	) {
		return [new THREE.Quaternion(), new THREE.Quaternion()];
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

	// origin basis of abs
	const xaxis2 = new THREE.Vector3(1, 0, 0);
	const yaxis2 = new THREE.Vector3(0, 1, 0);
	const zaxis2 = new THREE.Vector3(0, 0, 1);

	// new basis of abs from pose data
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

	// const qs = chest_q.clone().multiply(abs_q.clone().invert());

	return [abs_q, chest_q];
}


function getLimbQuaternion(pose3D, joint_start, joint_end, upVector) {
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
		upVector,
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

	const result = {};

	const [abs_q, chest_q] = torsoRotation(
		pose3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]],
		pose3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]],
		pose3D[BlazePoseKeypointsValues["LEFT_HIP"]],
		pose3D[BlazePoseKeypointsValues["RIGHT_HIP"]]
	);

	result["abs"] = abs_q;
	result["chest"] = chest_q;

	// result["head"] = new THREE.Quaternion();

	result["upperarm_l"] = getLimbQuaternion(
		pose3D,
		"LEFT_SHOULDER",
		"LEFT_ELBOW",
		new THREE.Vector3(1, 0, 0)
	);

	result["upperarm_r"] = getLimbQuaternion(
		pose3D,
		"RIGHT_SHOULDER",
		"RIGHT_ELBOW",
		new THREE.Vector3(-1, 0, 0)
	);

	result["lowerarm_l"] = getLimbQuaternion(
		pose3D,
		"LEFT_ELBOW",
		"LEFT_WRIST",
		new THREE.Vector3(1, 0, 0)
	);

	result["lowerarm_r"] = getLimbQuaternion(
		pose3D,
		"RIGHT_ELBOW",
		"RIGHT_WRIST",
		new THREE.Vector3(-1, 0, 0)
	);

	// result["hand_l"] = new THREE.Quaternion();

	// result["hand_r"] = new THREE.Quaternion();

	result["thigh_l"] = getLimbQuaternion(
		pose3D,
		"LEFT_HIP",
		"LEFT_KNEE",
		new THREE.Vector3(0, -1, 0)
	);

	result["thigh_r"] = getLimbQuaternion(
		pose3D,
		"RIGHT_HIP",
		"RIGHT_KNEE",
		new THREE.Vector3(0, -1, 0)
	);

	result["calf_l"] = getLimbQuaternion(
		pose3D,
		"LEFT_KNEE",
		"LEFT_ANKLE",
		new THREE.Vector3(0, -1, 0)
	);

	result["calf_r"] = getLimbQuaternion(
		pose3D,
		"RIGHT_KNEE",
		"RIGHT_ANKLE",
		new THREE.Vector3(0, -1, 0)
	);

	result["foot_l"] = new THREE.Quaternion();

	result["foot_r"] = new THREE.Quaternion();

	return result;
}

export default class Silhouette3D {
	/**
	 * limbs geometry combined 3d human figure
	 */

	static limbs = [
		"abs",
		"chest",
		"neck",
		"head",
		"shoulder_l",
		"shoulder_r",
		"upperarm_l",
		"upperarm_r",
		"elbow_l",
		"elbow_r",
		"lowerarm_l",
		"lowerarm_r",
		"wrist_l",
		"wrist_r",
		"hand_l",
		"hand_r",
		"hip_l",
		"hip_r",
		"thigh_l",
		"thigh_r",
		"knee_l",
		"knee_r",
		"calf_l",
		"calf_r",
		"ankle_l",
		"ankle_r",
		"foot_l",
		"foot_r",
	];

	pos = {
		abs: {
			x: 0,
			y: 73.06646537780762,
			z: 2.173459053039551,
		},
		chest: {
			x: 0,
			y: 96.37579345703125,
			z: 1.555971384048462,
		},
		neck: {
			x: -2.384185791015625e-7,
			y: 108.9151611328125,
			z: 1.2082147598266602,
		},
		head: {
			x: 0,
			y: 115.1942367553711,
			z: 2.442631244659424,
		},
		foot_l: {
			x: 6.038201689720154,
			y: 4.189789369702339,
			z: 5.3377227783203125,
		},
		foot_r: {
			x: -6.038201689720154,
			y: 4.189789369702339,
			z: 5.3377227783203125,
		},
		calf_l: {
			x: 6.078888535499573,
			y: 24.266510009765625,
			z: 1.186724066734314,
		},
		calf_r: {
			x: -6.078888535499573,
			y: 24.266510009765625,
			z: 1.186724066734314,
		},
		lowerarm_l: {
			x: 34.57040786743164,
			y: 98.3515853881836,
			z: -0.5303339958190918,
		},
		lowerarm_r: {
			x: -34.57040786743164,
			y: 98.3515853881836,
			z: -0.5303339958190918,
		},
		thigh_l: {
			x: 6.465143918991089,
			y: 52.77687644958496,
			z: 1.2393369674682617,
		},
		thigh_r: {
			x: -6.465143918991089,
			y: 52.77687644958496,
			z: 1.2393369674682617,
		},
		knee_l: {
			x: 5.950271725654602,
			y: 39.12459182739258,
			z: 1.4469028115272522,
		},
		knee_r: {
			x: -5.950271725654602,
			y: 39.12459182739258,
			z: 1.4469028115272522,
		},
		wrist_l: {
			x: 42.58299446105957,
			y: 97.59692001342773,
			z: 0.7862309217453003,
		},
		wrist_r: {
			x: -42.58299446105957,
			y: 97.59692001342773,
			z: 0.7862309217453003,
		},
		shoulder_l: {
			x: 10.224750518798828,
			y: 99.86847686767578,
			z: 1.8163499236106873,
		},
		shoulder_r: {
			x: -10.224750518798828,
			y: 99.86847686767578,
			z: 1.8163499236106873,
		},
		elbow_l: {
			x: 26.771096229553223,
			y: 98.29524612426758,
			z: -0.9946861267089844,
		},
		elbow_r: {
			x: -26.771096229553223,
			y: 98.29524612426758,
			z: -0.9946861267089844,
		},
		hand_l: {
			x: 49.42721748352051,
			y: 97.63338470458984,
			z: 3.562742054462433,
		},
		hand_r: {
			x: -49.42721748352051,
			y: 97.63338470458984,
			z: 3.562742054462433,
		},
		upperarm_l: {
			x: 18.69175386428833,
			y: 99.65556335449219,
			z: 0.5235534906387329,
		},
		upperarm_r: {
			x: -18.69175386428833,
			y: 99.65556335449219,
			z: 0.5235534906387329,
		},
		hip_l: {
			x: 5.822864592075348,
			y: 66.59577178955078,
			z: 1.9783098697662354,
		},
		hip_r: {
			x: -5.822864592075348,
			y: 66.59577178955078,
			z: 1.9783098697662354,
		},
		ankle_l: {
			x: 5.950271844863892,
			y: 8.869707345962524,
			z: -4.76837158203125e-7,
		},
		ankle_r: {
			x: -5.950271844863892,
			y: 8.869707345962524,
			z: -4.76837158203125e-7,
		},
	};

	size = {
		abs: {
			"x": 21.701854705810547,
			"y": 22.411624908447266,
			"z": 16.466567993164062
		},
		chest: {
			"x": 20.53396224975586,
			"y": 23.94965362548828,
			"z": 14.528369903564453
		},
		hand: {
			"x": 12.95370101928711,
			"y": 2.6799774169921875,
			"z": 10.326093673706055
		},
	}

	constructor(geometry) {

		this.pos_adjusted = {
			abs: {
				x: 0, y: 0, z: 0
			},
			chest: {
				x: this.pos.chest.x - this.pos.abs.x,
				y: this.pos.chest.y - this.pos.abs.y - this.size.chest.y/2,
				z: this.pos.chest.z - this.pos.abs.z
			}
		}

		// color of material
		this.color = 0x44aa88;
		// opacity of material, when pose score is lower/higher then 0.5
		this.invisible_opacity = 0.5;
		this.visible_opacity = 0.8;

		this.body = new THREE.Group();

		const meshes = {};

		for (let name in geometry) {
			meshes[name] = new THREE.Mesh(
				geometry[name],
				new THREE.MeshLambertMaterial({
					color: 0x12c2e9,
					transparent: true,
					opacity: 0.6,
				})
			);
		}

		this.abs = {
			group: new THREE.Group(),
			mesh: meshes.abs,
			position: () => {
				return new THREE.Vector3(
					0,
					0,
					0,
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.chest = {
			group: new THREE.Group(),
			mesh: meshes.chest,
			position: () => {
				const v = new THREE.Vector3(
					this.pos.chest.x - this.pos.abs.x,
					this.pos.chest.y - this.pos.abs.y - this.size.chest.y/2,
					this.pos.chest.z - this.pos.abs.z
				);
				// adjust the chest position lower in y, make the rotation center to be at the bottom of the chest mesh
				v.applyQuaternion(this.abs.group.quaternion);

				return v;
			},
			//since the group position moved toward negative y, move mesh to positive y, so the mesh is above `abs` mesh
			mesh_position: new THREE.Vector3(0, this.size.chest.y / 2, 0),
		};
		this.neck = {
			group: new THREE.Group(),
			mesh: meshes.neck,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.neck.x - this.pos.chest.x,
					this.pos.neck.y - this.pos.chest.y + this.size.chest.y/2,
					this.pos.neck.z - this.pos.chest.z
				);

				v0.applyQuaternion(this.chest.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.chest.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.head = {
			group: new THREE.Group(),
			mesh: meshes.head,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.head.x - this.pos.neck.x,
					this.pos.head.y - this.pos.neck.y,
					this.pos.head.z - this.pos.neck.z
				);

				v0.applyQuaternion(this.neck.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.neck.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.shoulder_l = {
			group: new THREE.Group(),
			mesh: meshes.shoulder_l,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.shoulder_l.x - this.pos.chest.x,
					this.pos.shoulder_l.y - this.pos.chest.y + this.size.chest.y/2,
					this.pos.shoulder_l.z - this.pos.chest.z
				);

				v0.applyQuaternion(this.chest.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.chest.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.shoulder_r = {
			group: new THREE.Group(),
			mesh: meshes.shoulder_r,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.shoulder_r.x - this.pos.chest.x,
					this.pos.shoulder_r.y - this.pos.chest.y + this.size.chest.y/2,
					this.pos.shoulder_r.z - this.pos.chest.z
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
			mesh: meshes.upperarm_l,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.upperarm_l.x - this.pos.chest.x - (this.pos.elbow_l.x - this.pos.shoulder_l.x) / 2,
					this.pos.upperarm_l.y - this.pos.chest.y + this.size.chest.y/2,
					this.pos.upperarm_l.z - this.pos.chest.z
				);

				v0.applyQuaternion(this.chest.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.chest.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				(this.pos.elbow_l.x - this.pos.shoulder_l.x) / 2,
				0,
				0
			),
		};
		this.upperarm_r = {
			group: new THREE.Group(),
			mesh: meshes.upperarm_r,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.upperarm_r.x - this.pos.chest.x - (this.pos.elbow_r.x - this.pos.shoulder_r.x) / 2,
					this.pos.upperarm_r.y - this.pos.chest.y + this.size.chest.y/2,
					this.pos.upperarm_r.z - this.pos.chest.z
				);

				v0.applyQuaternion(this.chest.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.chest.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				-(this.pos.elbow_l.x - this.pos.shoulder_l.x) / 2,
				0,
				0
			),
		};
		this.elbow_l = {
			group: new THREE.Group(),
			mesh: meshes.elbow_l,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.elbow_l.x - this.pos.upperarm_l.x + (this.pos.elbow_l.x - this.pos.shoulder_l.x) / 2,
					this.pos.elbow_l.y - this.pos.upperarm_l.y,
					this.pos.elbow_l.z - this.pos.upperarm_l.z
				);

				v0.applyQuaternion(this.upperarm_l.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.upperarm_l.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				0,
				0,
				0
			),
		};
		this.elbow_r = {
			group: new THREE.Group(),
			mesh: meshes.elbow_r,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.elbow_r.x - this.pos.upperarm_r.x + (this.pos.elbow_r.x - this.pos.shoulder_r.x) / 2,
					this.pos.elbow_r.y - this.pos.upperarm_r.y,
					this.pos.elbow_r.z - this.pos.upperarm_r.z
				);

				v0.applyQuaternion(this.upperarm_r.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.upperarm_r.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				0,
				0,
				0
			),
		};
		this.lowerarm_l = {
			group: new THREE.Group(),
			mesh: meshes.lowerarm_l,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.lowerarm_l.x - this.pos.upperarm_l.x,
					this.pos.lowerarm_l.y - this.pos.upperarm_l.y,
					this.pos.lowerarm_l.z - this.pos.upperarm_l.z
				);

				v0.applyQuaternion(this.upperarm_l.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.upperarm_l.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3((this.pos.wrist_l.x - this.pos.elbow_l.x) / 2, 0, 0),
		};
		this.lowerarm_r = {
			group: new THREE.Group(),
			mesh: meshes.lowerarm_r,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.lowerarm_r.x - this.pos.upperarm_r.x,
					this.pos.lowerarm_r.y - this.pos.upperarm_r.y,
					this.pos.lowerarm_r.z - this.pos.upperarm_r.z
				);

				v0.applyQuaternion(this.upperarm_r.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.upperarm_r.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3((this.pos.wrist_r.x - this.pos.elbow_r.x) / 2, 0, 0),
		};
		this.wrist_l = {
			group: new THREE.Group(),
			mesh: meshes.wrist_l,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.wrist_l.x - this.pos.lowerarm_l.x,
					this.pos.wrist_l.y - this.pos.lowerarm_l.y,
					this.pos.wrist_l.z - this.pos.lowerarm_l.z
				);

				v0.applyQuaternion(this.lowerarm_l.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.lowerarm_l.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				(this.pos.wrist_l.x - this.pos.elbow_l.x) / 2,
				0,
				0
			),
		};
		this.wrist_r = {
			group: new THREE.Group(),
			mesh: meshes.wrist_r,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.wrist_r.x - this.pos.lowerarm_r.x,
					this.pos.wrist_r.y - this.pos.lowerarm_r.y,
					this.pos.wrist_r.z - this.pos.lowerarm_r.z
				);

				v0.applyQuaternion(this.lowerarm_r.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.lowerarm_r.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				(this.pos.wrist_r.x - this.pos.elbow_r.x) / 2,
				0,
				0
			),
		};
		this.hand_l = {
			group: new THREE.Group(),
			mesh: meshes.hand_l,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.hand_l.x - this.pos.lowerarm_l.x + (this.pos.wrist_l.x - this.pos.elbow_l.x) / 2,
					this.pos.hand_l.y - this.pos.lowerarm_l.y,
					this.pos.hand_l.z - this.pos.lowerarm_l.z
				);

				v0.applyQuaternion(this.lowerarm_l.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.lowerarm_l.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.hand_r = {
			group: new THREE.Group(),
			mesh: meshes.hand_r,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.hand_r.x - this.pos.lowerarm_r.x + (this.pos.wrist_r.x - this.pos.elbow_r.x) / 2,
					this.pos.hand_r.y - this.pos.lowerarm_r.y,
					this.pos.hand_r.z - this.pos.lowerarm_r.z
				);

				v0.applyQuaternion(this.lowerarm_r.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.lowerarm_r.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.hip_l = {
			group: new THREE.Group(),
			mesh: meshes.hip_l,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.hip_l.x - this.pos.abs.x,
					this.pos.hip_l.y - this.pos.abs.y,
					this.pos.hip_l.z - this.pos.abs.z,
				);

				v0.applyQuaternion(this.abs.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.abs.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.hip_r = {
			group: new THREE.Group(),
			mesh: meshes.hip_r,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.hip_r.x - this.pos.abs.x,
					this.pos.hip_r.y - this.pos.abs.y,
					this.pos.hip_r.z - this.pos.abs.z,
				);

				v0.applyQuaternion(this.abs.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.abs.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.thigh_l = {
			group: new THREE.Group(),
			mesh: meshes.thigh_l,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.thigh_l.x - this.pos.abs.x,
					this.pos.thigh_l.y - this.pos.abs.y - (this.pos.knee_l.y - this.pos.hip_l.y) / 2,
					this.pos.thigh_l.z - this.pos.abs.z
				);

				v0.applyQuaternion(this.abs.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.abs.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, (this.pos.knee_l.y - this.pos.hip_l.y) / 2, 0),
		};
		this.thigh_r = {
			group: new THREE.Group(),
			mesh: meshes.thigh_r,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.thigh_r.x - this.pos.abs.x,
					this.pos.thigh_r.y - this.pos.abs.y - (this.pos.knee_r.y - this.pos.hip_r.y) / 2,
					this.pos.thigh_r.z - this.pos.abs.z
				);

				v0.applyQuaternion(this.abs.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.abs.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, (this.pos.knee_r.y - this.pos.hip_r.y) / 2, 0),
		};
		this.knee_l = {
			group: new THREE.Group(),
			mesh: meshes.knee_l,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.knee_l.x - this.pos.thigh_l.x,
					this.pos.knee_l.y - this.pos.thigh_l.y + (this.pos.knee_l.y - this.pos.hip_l.y) / 2,
					this.pos.knee_l.z - this.pos.thigh_l.z
				);

				v0.applyQuaternion(this.thigh_l.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.thigh_l.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				0,
				0,
				0
			),
		};
		this.knee_r = {
			group: new THREE.Group(),
			mesh: meshes.knee_r,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.knee_r.x - this.pos.thigh_r.x,
					this.pos.knee_r.y - this.pos.thigh_r.y + (this.pos.knee_r.y - this.pos.hip_r.y) / 2,
					this.pos.knee_r.z - this.pos.thigh_r.z
				);

				v0.applyQuaternion(this.thigh_r.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.thigh_r.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				0,
				0,
				0
			),
		};
		this.calf_l = {
			group: new THREE.Group(),
			mesh: meshes.calf_l,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.calf_l.x - this.pos.thigh_l.x,
					this.pos.calf_l.y - this.pos.thigh_l.y,
					this.pos.calf_l.z - this.pos.thigh_l.z
				);

				v0.applyQuaternion(this.thigh_l.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.thigh_l.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, (this.pos.ankle_l.y - this.pos.knee_l.y) / 2, 0),
		};
		this.calf_r = {
			group: new THREE.Group(),
			mesh: meshes.calf_r,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.calf_r.x - this.pos.thigh_r.x,
					this.pos.calf_r.y - this.pos.thigh_r.y,
					this.pos.calf_r.z - this.pos.thigh_r.z
				);

				v0.applyQuaternion(this.thigh_r.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.thigh_r.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, (this.pos.ankle_r.y - this.pos.knee_r.y) / 2, 0),
		};
		this.ankle_l = {
			group: new THREE.Group(),
			mesh: meshes.ankle_l,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.ankle_l.x - this.pos.calf_l.x,
					this.pos.ankle_l.y - this.pos.calf_l.y,
					this.pos.ankle_l.z - this.pos.calf_l.z
				);

				v0.applyQuaternion(this.calf_l.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.calf_l.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				0,
				(this.pos.ankle_l.y - this.pos.knee_l.y) / 2,
				0
			),
		};
		this.ankle_r = {
			group: new THREE.Group(),
			mesh: meshes.ankle_r,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.ankle_r.x - this.pos.calf_r.x,
					this.pos.ankle_r.y - this.pos.calf_r.y,
					this.pos.ankle_r.z - this.pos.calf_r.z
				);

				v0.applyQuaternion(this.calf_r.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.calf_r.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				0,
				(this.pos.ankle_r.y - this.pos.knee_r.y) / 2,
				0
			),
		};
		this.foot_l = {
			group: new THREE.Group(),
			mesh: meshes.foot_l,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.foot_l.x - this.pos.calf_l.x,
					this.pos.foot_l.y - this.pos.calf_l.y + (this.pos.ankle_l.y - this.pos.knee_l.y) / 2,
					this.pos.foot_l.z - this.pos.calf_l.z
				);

				v0.applyQuaternion(this.calf_l.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.calf_l.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.foot_r = {
			group: new THREE.Group(),
			// mesh: foot_r_mesh,
			mesh: meshes.foot_r,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.foot_r.x - this.pos.calf_r.x,
					this.pos.foot_r.y - this.pos.calf_r.y + (this.pos.ankle_r.y - this.pos.knee_r.y) / 2,
					this.pos.foot_r.z - this.pos.calf_r.z
				);

				v0.applyQuaternion(this.calf_r.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.calf_r.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
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

		for (let name of Silhouette3D.limbs) {
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

		qs.neck = qs.chest.clone();
		qs.head = qs.chest.clone();
		qs.shoulder_l = qs.upperarm_l.clone();
		qs.shoulder_r = qs.upperarm_r.clone();
		qs.elbow_l = qs.lowerarm_l.clone();
		qs.elbow_r = qs.lowerarm_r.clone();
		qs.wrist_l = qs.lowerarm_l.clone();
		qs.wrist_r = qs.lowerarm_r.clone();
		qs.hand_l = qs.lowerarm_l.clone();
		qs.hand_r = qs.lowerarm_r.clone();

		qs.hip_l = qs.abs.clone();
		qs.hip_r = qs.abs.clone();
		qs.knee_l = qs.thigh_l.clone();
		qs.knee_r = qs.thigh_r.clone();
		qs.ankle_l = qs.calf_l.clone();
		qs.ankle_r = qs.calf_r.clone();
		qs.foot_l = new THREE.Quaternion();
		qs.foot_r = new THREE.Quaternion();

		for (let name of Silhouette3D.limbs) {
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

			this[name].mesh.material.color.setRGB(
				Number(colors[name][0]) / 255,
				Number(colors[name][1]) / 255,
				Number(colors[name][2]) / 255
			);
		}
	}
}
