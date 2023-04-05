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
		(left_shoulder2.visibility && left_shoulder2.visibility < 0.5) ||
		(right_shoulder2.visibility && right_shoulder2.visibility < 0.5) ||
		(left_hip2.visibility && left_hip2.visibility < 0.5) ||
		(right_hip2.visibility && right_hip2.visibility < 0.5)
	) {
		return [false, false];
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

	// origin basis of abdominal
	const xaxis2 = new THREE.Vector3(1, 0, 0);
	const yaxis2 = new THREE.Vector3(0, 1, 0);
	const zaxis2 = new THREE.Vector3(0, 0, 1);

	// new basis of abdominal from pose data
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

	return [abs_q, chest_q];
}

function getLimbQuaternion(pose3D, joint_start, joint_end, upVector) {
	/**
	 * calculate quaternion for a limb,
	 * which start from `joint_start` end at `joint_end`
	 */
	const start_pos = pose3D[BlazePoseKeypointsValues[joint_start]];
	const end_pos = pose3D[BlazePoseKeypointsValues[joint_end]];

	if (
		(start_pos.visibility && start_pos.visibility < 0.5) ||
		(end_pos.visibility && end_pos.visibility < 0.5)
	) {
		return false;
	}

	return new THREE.Quaternion().setFromUnitVectors(
		upVector,
		new THREE.Vector3(
			end_pos.x - start_pos.x,
			end_pos.y - start_pos.y,
			end_pos.z - start_pos.z
		).normalize()
	);
}

function getQuaternions(pose3D) {
	/**
	 * get rotation of limbs
	 */

	const result = {};

	const [abs_q, chest_q] = torsoRotation(
		pose3D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]],
		pose3D[BlazePoseKeypointsValues["LEFT_SHOULDER"]],
		pose3D[BlazePoseKeypointsValues["RIGHT_HIP"]],
		pose3D[BlazePoseKeypointsValues["LEFT_HIP"]]
	);

	result["abdominal"] = abs_q;
	result["chest"] = chest_q;

	// result["head"] = new THREE.Quaternion();

	result["leftArm"] = getLimbQuaternion(
		pose3D,
		"RIGHT_SHOULDER",
		"RIGHT_ELBOW",
		new THREE.Vector3(1, 0, 0)
	);

	result["rightArm"] = getLimbQuaternion(
		pose3D,
		"LEFT_SHOULDER",
		"LEFT_ELBOW",
		new THREE.Vector3(-1, 0, 0)
	);

	result["leftForeArm"] = getLimbQuaternion(
		pose3D,
		"RIGHT_ELBOW",
		"RIGHT_WRIST",
		new THREE.Vector3(1, 0, 0)
	);

	result["rightForeArm"] = getLimbQuaternion(
		pose3D,
		"LEFT_ELBOW",
		"LEFT_WRIST",
		new THREE.Vector3(-1, 0, 0)
	);

	// result["leftHand"] = new THREE.Quaternion();

	// result["rightHand"] = new THREE.Quaternion();

	result["leftThigh"] = getLimbQuaternion(
		pose3D,
		"RIGHT_HIP",
		"RIGHT_KNEE",
		new THREE.Vector3(0, -1, 0)
	);

	result["rightThigh"] = getLimbQuaternion(
		pose3D,
		"LEFT_HIP",
		"LEFT_KNEE",
		new THREE.Vector3(0, -1, 0)
	);

	result["leftCalf"] = getLimbQuaternion(
		pose3D,
		"RIGHT_KNEE",
		"RIGHT_ANKLE",
		new THREE.Vector3(0, -1, 0)
	);

	result["rightCalf"] = getLimbQuaternion(
		pose3D,
		"LEFT_KNEE",
		"LEFT_ANKLE",
		new THREE.Vector3(0, -1, 0)
	);

	result["leftFoot"] = getLimbQuaternion(
		pose3D,
		"RIGHT_HEEL",
		"RIGHT_FOOT_INDEX",
		new THREE.Vector3(0, 0, 1)
	);

	result["rightFoot"] = getLimbQuaternion(
		pose3D,
		"LEFT_HEEL",
		"LEFT_FOOT_INDEX",
		new THREE.Vector3(0, 0, 1)
	);

	return result;
}

export default class Silhouette3D {
	/**
	 * limbs geometry combined 3d human figure
	 */

	static limbs = [
		"abdominal",
		"chest",
		"neck",
		"head",
		"leftShoulder",
		"rightShoulder",
		"leftArm",
		"rightArm",
		"leftElbow",
		"rightElbow",
		"leftForeArm",
		"rightForeArm",
		"leftWrist",
		"rightWrist",
		"leftHand",
		"rightHand",
		"leftHip",
		"rightHip",
		"leftThigh",
		"rightThigh",
		"leftKnee",
		"rightKnee",
		"leftCalf",
		"rightCalf",
		"leftAnkle",
		"rightAnkle",
		"leftFoot",
		"rightFoot",
	];

	pos = {
		abdominal: {
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
		leftFoot: {
			x: 6.038201689720154,
			y: 4.189789369702339,
			z: 5.3377227783203125,
		},
		rightFoot: {
			x: -6.038201689720154,
			y: 4.189789369702339,
			z: 5.3377227783203125,
		},
		leftCalf: {
			x: 6.078888535499573,
			y: 24.266510009765625,
			z: 1.186724066734314,
		},
		rightCalf: {
			x: -6.078888535499573,
			y: 24.266510009765625,
			z: 1.186724066734314,
		},
		leftForeArm: {
			x: 34.57040786743164,
			y: 98.3515853881836,
			z: -0.5303339958190918,
		},
		rightForeArm: {
			x: -34.57040786743164,
			y: 98.3515853881836,
			z: -0.5303339958190918,
		},
		leftThigh: {
			x: 6.465143918991089,
			y: 52.77687644958496,
			z: 1.2393369674682617,
		},
		rightThigh: {
			x: -6.465143918991089,
			y: 52.77687644958496,
			z: 1.2393369674682617,
		},
		leftKnee: {
			x: 5.950271725654602,
			y: 39.12459182739258,
			z: 1.4469028115272522,
		},
		rightKnee: {
			x: -5.950271725654602,
			y: 39.12459182739258,
			z: 1.4469028115272522,
		},
		leftWrist: {
			x: 42.58299446105957,
			y: 97.59692001342773,
			z: 0.7862309217453003,
		},
		rightWrist: {
			x: -42.58299446105957,
			y: 97.59692001342773,
			z: 0.7862309217453003,
		},
		leftShoulder: {
			x: 10.224750518798828,
			y: 99.86847686767578,
			z: 1.8163499236106873,
		},
		rightShoulder: {
			x: -10.224750518798828,
			y: 99.86847686767578,
			z: 1.8163499236106873,
		},
		leftElbow: {
			x: 26.771096229553223,
			y: 98.29524612426758,
			z: -0.9946861267089844,
		},
		rightElbow: {
			x: -26.771096229553223,
			y: 98.29524612426758,
			z: -0.9946861267089844,
		},
		leftHand: {
			x: 49.42721748352051,
			y: 97.63338470458984,
			z: 3.562742054462433,
		},
		rightHand: {
			x: -49.42721748352051,
			y: 97.63338470458984,
			z: 3.562742054462433,
		},
		leftArm: {
			x: 18.69175386428833,
			y: 99.65556335449219,
			z: 0.5235534906387329,
		},
		rightArm: {
			x: -18.69175386428833,
			y: 99.65556335449219,
			z: 0.5235534906387329,
		},
		leftHip: {
			x: 5.822864592075348,
			y: 66.59577178955078,
			z: 1.9783098697662354,
		},
		rightHip: {
			x: -5.822864592075348,
			y: 66.59577178955078,
			z: 1.9783098697662354,
		},
		leftAnkle: {
			x: 5.950271844863892,
			y: 8.869707345962524,
			z: -4.76837158203125e-7,
		},
		rightAnkle: {
			x: -5.950271844863892,
			y: 8.869707345962524,
			z: -4.76837158203125e-7,
		},
	};

	size = {
		abdominal: {
			x: 21.701854705810547,
			y: 22.411624908447266,
			z: 16.466567993164062,
		},
		chest: {
			x: 20.53396224975586,
			y: 23.94965362548828,
			z: 14.528369903564453,
		},
		hand: {
			x: 12.95370101928711,
			y: 2.6799774169921875,
			z: 10.326093673706055,
		},
		foot: {
			x: 7.3205976486206055,
			y: 7.993029594421387,
			z: 18.409534454345703,
		},
	};

	constructor(geometry) {
		// color of material
		this.color = 0x44aa88;
		// opacity of material, when pose.visibility is lower/higher then 0.5
		this.invisible_opacity = 0.2;
		this.visible_opacity = 0.6;

		this.body = new THREE.Group();

		const meshes = {};

		for (let name in geometry) {
			meshes[name] = new THREE.Mesh(
				geometry[name],
				new THREE.MeshLambertMaterial({
					color: 0x12c2e9,
					transparent: true,
					opacity: this.invisible_opacity,
				})
			);
		}

		this.abdominal = {
			group: new THREE.Group(),
			mesh: meshes.abdominal,
			position: () => {
				return new THREE.Vector3(0, 0, 0);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.chest = {
			group: new THREE.Group(),
			mesh: meshes.chest,
			position: () => {
				const v = new THREE.Vector3(
					this.pos.chest.x - this.pos.abdominal.x,
					this.pos.chest.y -
						this.pos.abdominal.y -
						this.size.chest.y / 2,
					this.pos.chest.z - this.pos.abdominal.z
				);
				// adjust the chest position lower in y, make the rotation center to be at the bottom of the chest mesh
				v.applyQuaternion(this.abdominal.group.quaternion);

				return v;
			},
			//since the group position moved toward negative y, move mesh to positive y, so the mesh is above `abdominal` mesh
			mesh_position: new THREE.Vector3(0, this.size.chest.y / 2, 0),
		};
		this.neck = {
			group: new THREE.Group(),
			mesh: meshes.neck,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.neck.x - this.pos.chest.x,
					this.pos.neck.y - this.pos.chest.y + this.size.chest.y / 2,
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
		this.leftShoulder = {
			group: new THREE.Group(),
			mesh: meshes.leftShoulder,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.leftShoulder.x - this.pos.chest.x,
					this.pos.leftShoulder.y -
						this.pos.chest.y +
						this.size.chest.y / 2,
					this.pos.leftShoulder.z - this.pos.chest.z
				);

				v0.applyQuaternion(this.chest.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.chest.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.rightShoulder = {
			group: new THREE.Group(),
			mesh: meshes.rightShoulder,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.rightShoulder.x - this.pos.chest.x,
					this.pos.rightShoulder.y -
						this.pos.chest.y +
						this.size.chest.y / 2,
					this.pos.rightShoulder.z - this.pos.chest.z
				);

				v0.applyQuaternion(this.chest.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.chest.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.leftArm = {
			group: new THREE.Group(),
			mesh: meshes.leftArm,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.leftArm.x -
						this.pos.chest.x -
						(this.pos.leftElbow.x - this.pos.leftShoulder.x) / 2,
					this.pos.leftArm.y -
						this.pos.chest.y +
						this.size.chest.y / 2,
					this.pos.leftArm.z - this.pos.chest.z
				);

				v0.applyQuaternion(this.chest.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.chest.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				(this.pos.leftElbow.x - this.pos.leftShoulder.x) / 2,
				0,
				0
			),
		};
		this.rightArm = {
			group: new THREE.Group(),
			mesh: meshes.rightArm,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.rightArm.x -
						this.pos.chest.x -
						(this.pos.rightElbow.x - this.pos.rightShoulder.x) / 2,
					this.pos.rightArm.y -
						this.pos.chest.y +
						this.size.chest.y / 2,
					this.pos.rightArm.z - this.pos.chest.z
				);

				v0.applyQuaternion(this.chest.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.chest.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				-(this.pos.leftElbow.x - this.pos.leftShoulder.x) / 2,
				0,
				0
			),
		};
		this.leftElbow = {
			group: new THREE.Group(),
			mesh: meshes.leftElbow,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.leftElbow.x -
						this.pos.leftArm.x +
						(this.pos.leftElbow.x - this.pos.leftShoulder.x) / 2,
					this.pos.leftElbow.y - this.pos.leftArm.y,
					this.pos.leftElbow.z - this.pos.leftArm.z
				);

				v0.applyQuaternion(this.leftArm.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.leftArm.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.rightElbow = {
			group: new THREE.Group(),
			mesh: meshes.rightElbow,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.rightElbow.x -
						this.pos.rightArm.x +
						(this.pos.rightElbow.x - this.pos.rightShoulder.x) / 2,
					this.pos.rightElbow.y - this.pos.rightArm.y,
					this.pos.rightElbow.z - this.pos.rightArm.z
				);

				v0.applyQuaternion(this.rightArm.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.rightArm.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.leftForeArm = {
			group: new THREE.Group(),
			mesh: meshes.leftForeArm,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.leftForeArm.x - this.pos.leftArm.x,
					this.pos.leftForeArm.y - this.pos.leftArm.y,
					this.pos.leftForeArm.z - this.pos.leftArm.z
				);

				v0.applyQuaternion(this.leftArm.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.leftArm.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				(this.pos.leftWrist.x - this.pos.leftElbow.x) / 2,
				0,
				0
			),
		};
		this.rightForeArm = {
			group: new THREE.Group(),
			mesh: meshes.rightForeArm,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.rightForeArm.x - this.pos.rightArm.x,
					this.pos.rightForeArm.y - this.pos.rightArm.y,
					this.pos.rightForeArm.z - this.pos.rightArm.z
				);

				v0.applyQuaternion(this.rightArm.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.rightArm.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				(this.pos.rightWrist.x - this.pos.rightElbow.x) / 2,
				0,
				0
			),
		};
		this.leftWrist = {
			group: new THREE.Group(),
			mesh: meshes.leftWrist,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.leftWrist.x - this.pos.leftForeArm.x,
					this.pos.leftWrist.y - this.pos.leftForeArm.y,
					this.pos.leftWrist.z - this.pos.leftForeArm.z
				);

				v0.applyQuaternion(this.leftForeArm.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.leftForeArm.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				(this.pos.leftWrist.x - this.pos.leftElbow.x) / 2,
				0,
				0
			),
		};
		this.rightWrist = {
			group: new THREE.Group(),
			mesh: meshes.rightWrist,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.rightWrist.x - this.pos.rightForeArm.x,
					this.pos.rightWrist.y - this.pos.rightForeArm.y,
					this.pos.rightWrist.z - this.pos.rightForeArm.z
				);

				v0.applyQuaternion(this.rightForeArm.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.rightForeArm.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				(this.pos.rightWrist.x - this.pos.rightElbow.x) / 2,
				0,
				0
			),
		};
		this.leftHand = {
			group: new THREE.Group(),
			mesh: meshes.leftHand,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.leftHand.x -
						this.pos.leftForeArm.x +
						(this.pos.leftWrist.x - this.pos.leftElbow.x) / 2,
					this.pos.leftHand.y - this.pos.leftForeArm.y,
					this.pos.leftHand.z - this.pos.leftForeArm.z
				);

				v0.applyQuaternion(this.leftForeArm.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.leftForeArm.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.rightHand = {
			group: new THREE.Group(),
			mesh: meshes.rightHand,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.rightHand.x -
						this.pos.rightForeArm.x +
						(this.pos.rightWrist.x - this.pos.rightElbow.x) / 2,
					this.pos.rightHand.y - this.pos.rightForeArm.y,
					this.pos.rightHand.z - this.pos.rightForeArm.z
				);

				v0.applyQuaternion(this.rightForeArm.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.rightForeArm.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.leftHip = {
			group: new THREE.Group(),
			mesh: meshes.leftHip,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.leftHip.x - this.pos.abdominal.x,
					this.pos.leftHip.y - this.pos.abdominal.y,
					this.pos.leftHip.z - this.pos.abdominal.z
				);

				v0.applyQuaternion(this.abdominal.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.abdominal.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.rightHip = {
			group: new THREE.Group(),
			mesh: meshes.rightHip,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.rightHip.x - this.pos.abdominal.x,
					this.pos.rightHip.y - this.pos.abdominal.y,
					this.pos.rightHip.z - this.pos.abdominal.z
				);

				v0.applyQuaternion(this.abdominal.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.abdominal.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.leftThigh = {
			group: new THREE.Group(),
			mesh: meshes.leftThigh,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.leftThigh.x - this.pos.abdominal.x,
					this.pos.leftThigh.y -
						this.pos.abdominal.y -
						(this.pos.leftKnee.y - this.pos.leftHip.y) / 2,
					this.pos.leftThigh.z - this.pos.abdominal.z
				);

				v0.applyQuaternion(this.abdominal.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.abdominal.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				0,
				(this.pos.leftKnee.y - this.pos.leftHip.y) / 2,
				0
			),
		};
		this.rightThigh = {
			group: new THREE.Group(),
			mesh: meshes.rightThigh,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.rightThigh.x - this.pos.abdominal.x,
					this.pos.rightThigh.y -
						this.pos.abdominal.y -
						(this.pos.rightKnee.y - this.pos.rightHip.y) / 2,
					this.pos.rightThigh.z - this.pos.abdominal.z
				);

				v0.applyQuaternion(this.abdominal.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.abdominal.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				0,
				(this.pos.rightKnee.y - this.pos.rightHip.y) / 2,
				0
			),
		};
		this.leftKnee = {
			group: new THREE.Group(),
			mesh: meshes.leftKnee,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.leftKnee.x - this.pos.leftThigh.x,
					this.pos.leftKnee.y -
						this.pos.leftThigh.y +
						(this.pos.leftKnee.y - this.pos.leftHip.y) / 2,
					this.pos.leftKnee.z - this.pos.leftThigh.z
				);

				v0.applyQuaternion(this.leftThigh.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.leftThigh.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.rightKnee = {
			group: new THREE.Group(),
			mesh: meshes.rightKnee,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.rightKnee.x - this.pos.rightThigh.x,
					this.pos.rightKnee.y -
						this.pos.rightThigh.y +
						(this.pos.rightKnee.y - this.pos.rightHip.y) / 2,
					this.pos.rightKnee.z - this.pos.rightThigh.z
				);

				v0.applyQuaternion(this.rightThigh.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.rightThigh.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, 0),
		};
		this.leftCalf = {
			group: new THREE.Group(),
			mesh: meshes.leftCalf,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.leftCalf.x - this.pos.leftThigh.x,
					this.pos.leftCalf.y - this.pos.leftThigh.y,
					this.pos.leftCalf.z - this.pos.leftThigh.z
				);

				v0.applyQuaternion(this.leftThigh.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.leftThigh.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				0,
				(this.pos.leftAnkle.y - this.pos.leftKnee.y) / 2,
				0
			),
		};
		this.rightCalf = {
			group: new THREE.Group(),
			mesh: meshes.rightCalf,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.rightCalf.x - this.pos.rightThigh.x,
					this.pos.rightCalf.y - this.pos.rightThigh.y,
					this.pos.rightCalf.z - this.pos.rightThigh.z
				);

				v0.applyQuaternion(this.rightThigh.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.rightThigh.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				0,
				(this.pos.rightAnkle.y - this.pos.rightKnee.y) / 2,
				0
			),
		};
		this.leftAnkle = {
			group: new THREE.Group(),
			mesh: meshes.leftAnkle,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.leftAnkle.x - this.pos.leftCalf.x,
					this.pos.leftAnkle.y - this.pos.leftCalf.y,
					this.pos.leftAnkle.z - this.pos.leftCalf.z
				);

				v0.applyQuaternion(this.leftCalf.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.leftCalf.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				0,
				(this.pos.leftAnkle.y - this.pos.leftKnee.y) / 2,
				0
			),
		};
		this.rightAnkle = {
			group: new THREE.Group(),
			mesh: meshes.rightAnkle,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.rightAnkle.x - this.pos.rightCalf.x,
					this.pos.rightAnkle.y - this.pos.rightCalf.y,
					this.pos.rightAnkle.z - this.pos.rightCalf.z
				);

				v0.applyQuaternion(this.rightCalf.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.rightCalf.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(
				0,
				(this.pos.rightAnkle.y - this.pos.rightKnee.y) / 2,
				0
			),
		};
		this.leftFoot = {
			group: new THREE.Group(),
			mesh: meshes.leftFoot,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.leftFoot.x - this.pos.leftCalf.x,
					this.pos.leftFoot.y -
						this.pos.leftCalf.y +
						(this.pos.leftAnkle.y - this.pos.leftKnee.y) / 2,
					this.pos.leftFoot.z -
						this.pos.leftCalf.z -
						this.size.foot.z / 2
				);

				v0.applyQuaternion(this.leftCalf.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.leftCalf.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, this.size.foot.z / 2),
		};
		this.rightFoot = {
			group: new THREE.Group(),
			mesh: meshes.rightFoot,
			position: () => {
				const v0 = new THREE.Vector3(
					this.pos.rightFoot.x - this.pos.rightCalf.x,
					this.pos.rightFoot.y -
						this.pos.rightCalf.y +
						(this.pos.rightAnkle.y - this.pos.rightKnee.y) / 2,
					this.pos.rightFoot.z -
						this.pos.rightCalf.z -
						this.size.foot.z / 2
				);

				v0.applyQuaternion(this.rightCalf.group.quaternion);

				return new THREE.Vector3().addVectors(
					this.rightCalf.group.position,
					v0
				);
			},
			mesh_position: new THREE.Vector3(0, 0, this.size.foot.z / 2),
		};
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

		const rotations = getQuaternions(pose3D);

		rotations.neck =
			pose3D[BlazePoseKeypointsValues["NOSE"]].visibility > 0.5
				? new THREE.Quaternion()
				: false;
		rotations.head =
			pose3D[BlazePoseKeypointsValues["NOSE"]].visibility > 0.5
				? new THREE.Quaternion()
				: false;

		rotations.leftShoulder = rotations.leftArm
			? rotations.leftArm.clone()
			: false;
		rotations.rightShoulder = rotations.rightArm
			? rotations.rightArm.clone()
			: false;
		rotations.leftElbow = rotations.leftForeArm
			? rotations.leftForeArm.clone()
			: false;
		rotations.rightElbow = rotations.rightForeArm
			? rotations.rightForeArm.clone()
			: false;
		rotations.leftWrist = rotations.leftForeArm
			? rotations.leftForeArm.clone()
			: false;
		rotations.rightWrist = rotations.rightForeArm
			? rotations.rightForeArm.clone()
			: false;
		rotations.leftHand = rotations.leftForeArm
			? rotations.leftForeArm.clone()
			: false;
		rotations.rightHand = rotations.rightForeArm
			? rotations.rightForeArm.clone()
			: false;
		// todo, make thigh, calf follow abdominal if there is no pose data
		rotations.leftHip = rotations.abdominal
			? rotations.abdominal.clone()
			: false;
		rotations.rightHip = rotations.abdominal
			? rotations.abdominal.clone()
			: false;
		rotations.leftKnee = rotations.leftThigh
			? rotations.leftThigh.clone()
			: false;
		rotations.rightKnee = rotations.rightThigh
			? rotations.rightThigh.clone()
			: false;
		rotations.leftAnkle = rotations.leftCalf
			? rotations.leftCalf.clone()
			: false;
		rotations.rightAnkle = rotations.rightCalf
			? rotations.rightCalf.clone()
			: false;

		for (let name of Silhouette3D.limbs) {
			const pos = this[name].position();

			this[name].group.position.set(pos.x, pos.y, pos.z);

			if (rotations[name]) {
				// a quaternion calculated, it means the limb is visible
				// increase opacity
				this[name].group.rotation.setFromQuaternion(rotations[name]);
				this[name].mesh.material.opacity = this.visible_opacity;
			} else {
				// when rotation is false, the limb in invisible
				// decrease opacity
				this[name].mesh.material.opacity = this.invisible_opacity;
			}
		}
	}

	applyPosition(
		pose2D,
		videoWidth,
		videoHeight,
		visibleWidth,
		visibleHeight
	) {
		if (!pose2D || !pose2D.length) {
			return;
		}

		const left_shoulder =
			pose2D[BlazePoseKeypointsValues["RIGHT_SHOULDER"]];
		const right_shoulder =
			pose2D[BlazePoseKeypointsValues["LEFT_SHOULDER"]];
		const left_hip = pose2D[BlazePoseKeypointsValues["RIGHT_HIP"]];
		const right_hip = pose2D[BlazePoseKeypointsValues["LEFT_HIP"]];

		if (
			left_shoulder.visibility < 0.5 ||
			right_shoulder.visibility < 0.5 ||
			left_hip.visibility < 0.5 ||
			right_hip.visibility < 0.5
		) {
			return;
		}

		// use middle point of hips as model position
		// because we placed abdominal at (0,0,0)
		const pixel_pos = {
			x: (left_hip.x + right_hip.x) / 2,
			y: (left_hip.y + right_hip.y) / 2,
		};

		// 1 - x because left/right are swaped
		let object_x =
			(1 - pixel_pos.x / videoWidth) * visibleWidth - visibleWidth / 2;
		// 1 - y because in threejs y axis is twowards top
		let object_y =
			(1 - pixel_pos.y / videoHeight) * visibleHeight - visibleHeight / 2;

		if (object_x < -videoWidth / 2) {
			object_x = -videoWidth / 2;
		}

		if (object_x > videoWidth / 2) {
			object_x = videoWidth / 2;
		}

		if (object_y < -visibleHeight / 2) {
			object_y = -visibleHeight / 2;
		}

		if (object_y > visibleHeight / 2) {
			object_y = visibleHeight / 2;
		}

		this.body.position.set(object_x, object_y, 0);
	}

	applyColor(colors, muscles = []) {
		/**
		 * apply color to mesh
		 */

		for (let name in colors) {
			if (muscles.indexOf(name) === -1) {
				continue;
			}

			this[name].mesh.material.color.setRGB(
				Number(colors[name][0]) / 255,
				Number(colors[name][1]) / 255,
				Number(colors[name][2]) / 255
			);
		}
	}
}
