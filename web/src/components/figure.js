import * as THREE from "three";
import { quaternionFromVectors } from "./ropes";

const limbs_arr = [
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
export class Figure {
	constructor() {
		this.bodyMaterial = new THREE.MeshBasicMaterial({
			color: 0x44aa88,
			transparent: true,
			opacity: 0.5,
		});
		this.jointMaterial = new THREE.MeshBasicMaterial({
			// color: 0x33eeb0,
			color: 0x44aa88,
			transparent: true,
			opacity: 0.5,
		});

		this.group = new THREE.Group();

		// the following parameters define the size of different parts of a body
		this.unit = 1;

		this.head_radius = 4 * this.unit;
		this.eye_radius = 1 * this.unit;
		this.neck_radius = 1.6 * this.unit;
		this.neck_size = 2 * this.unit;

		this.shoulder_size = 6 * this.unit;
		this.spine_size = 12 * this.unit;
		this.waist_size = 5 * this.unit;

		this.shoulder_radius = 1.8 * this.unit;

		this.deltoid_radius = 1.8 * this.unit;
		this.bigarm_size = 8 * this.unit;
		this.elbow_radius = 1.6 * this.unit;

		this.smallarm_size = 8 * this.unit;
		this.wrist_size = 1.2 * this.unit;

		this.hip_radius = 2.8 * this.unit;

		this.thigh_radius = 2.8 * this.unit;
		this.thigh_size = 10 * this.unit;
		this.knee_radius = 2.4 * this.unit;

		this.calf_size = 10 * this.unit;
		this.ankle_radius = 1.8 * this.unit;

		this.limbs = {};
		this.limb_rotation_vectors = {};

		for (let l of limbs_arr) {
			this.limbs[l] = null;

			this.limb_rotation_vectors[l] = new THREE.Vector3(0, -1, 0);
		}
	}

	createBody() {
		const radiusTop = this.shoulder_size; // ui: radiusTop
		const height = this.spine_size; // ui: height
		const radiusBottom = this.waist_size; // ui: radiusBottom

		const radialSegments = 8; // ui: radialSegments, how smooth is the curve

		const geometry = new THREE.CylinderGeometry(
			radiusTop,
			radiusBottom,
			height,
			radialSegments
		);

		const body_group = new THREE.Group();

		const body = new THREE.Mesh(geometry, this.bodyMaterial);

		body_group.add(body);

		this.group.add(body_group);

		body_group.position.y = this.spine_size / 2;

		this.limbs["TORSO"] = { group: body_group, mesh: body };
	}

	createHead() {
		// Create a new group for the head
		const head_group = new THREE.Group();

		const neck_geo = new THREE.CylinderGeometry(
			this.neck_radius,
			this.neck_radius,
			this.neck_size
		);
		const neck_mesh = new THREE.Mesh(neck_geo, this.bodyMaterial);

		neck_mesh.position.y = this.spine_size + this.neck_size / 2;

		this.group.add(neck_mesh);

		const head_geo = new THREE.SphereGeometry(this.head_radius);

		// Create the main cube of the head and add to the group
		// const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
		const headMesh = new THREE.Mesh(head_geo, this.bodyMaterial);
		head_group.add(headMesh);

		// Position the head group
		head_group.position.y =
			this.spine_size + this.head_radius + this.neck_size;

		// Add the head group to the figure
		this.group.add(head_group);

		// Add the eyes by calling the function we already made
		const eyes = new THREE.Group();
		const eye_geo = new THREE.CircleGeometry(this.eye_radius, 8);

		// Define the eye material
		const material = new THREE.MeshLambertMaterial({ color: 0x44445c });

		for (let i = 0; i < 2; i++) {
			const eye = new THREE.Mesh(eye_geo, material);
			const sign = i % 2 === 0 ? -1 : 1;

			// Add the eye to the group
			eyes.add(eye);

			// Position the eye
			eye.position.x = (sign * this.head_radius) / 3;
		}

		// Move the eyes forwards by half of the head depth -
		// it might be a good idea to create a variable to do this!
		eyes.position.y = 0;
		eyes.position.z = this.head_radius;

		// in createEyes()
		head_group.add(eyes);

		this.limbs["HEAD"] = { group: head_group, mesh: headMesh };
	}

	_buildArm(sign) {
		const shoulder_geo = new THREE.SphereGeometry(this.shoulder_radius);

		const bigarm_geo = new THREE.CylinderGeometry(
			this.deltoid_radius,
			this.elbow_radius,
			this.bigarm_size
		);

		const elbow_geo = new THREE.SphereGeometry(this.elbow_radius);

		const smallarm_geo = new THREE.CylinderGeometry(
			this.elbow_radius,
			this.wrist_size,
			this.smallarm_size
		);

		const bigarm_group = new THREE.Group();
		const smallarm_group = new THREE.Group();

		const shoulder = new THREE.Mesh(shoulder_geo, this.jointMaterial);
		const bigarm = new THREE.Mesh(bigarm_geo, this.bodyMaterial);
		const elbow = new THREE.Mesh(elbow_geo, this.jointMaterial);
		const smallarm = new THREE.Mesh(smallarm_geo, this.bodyMaterial);

		bigarm_group.add(shoulder);

		bigarm_group.add(bigarm);

		smallarm_group.add(elbow);

		smallarm_group.add(smallarm);

		bigarm_group.add(smallarm_group);

		this.group.add(bigarm_group);

		// shoulder is at top of the bigarm_group
		shoulder.position.y = 0;
		// Translate the arm (not the group) downwards by half the height
		// so the group rotates at the shoulder
		bigarm.position.y = this.bigarm_size * -0.5;

		// bigarm at each side of the body
		bigarm_group.position.x =
			sign * (this.shoulder_size / 2 + this.deltoid_radius * 2);
		// bigarm a bit lower than spine
		bigarm_group.position.y = this.spine_size - this.shoulder_radius;

		// place elbow at top of smallarm
		elbow.position.y = 0;
		// Translate the arm (not the group) downwards by half the height
		smallarm.position.y = this.smallarm_size * -0.5;
		// place small arms under elbow
		smallarm_group.position.y = this.bigarm_size * -1;

		return [
			{ group: bigarm_group, mesh: [shoulder, bigarm] },
			{ group: smallarm_group, mesh: [elbow, smallarm] },
		];
	}

	createArms() {
		// Set the variable

		const left_arm = this._buildArm(-1);

		this.limbs["LEFT_UPPERARM"] = left_arm[0];
		this.limbs["LEFT_FOREARM"] = left_arm[1];

		const right_arm = this._buildArm(1);

		this.limbs["RIGHT_UPPERARM"] = right_arm[0];
		this.limbs["RIGHT_FOREARM"] = right_arm[1];
	}

	_buildLeg(sign) {
		const hip_geo = new THREE.SphereGeometry(this.hip_radius);

		const thigh_geo = new THREE.CylinderGeometry(
			this.thigh_radius,
			this.knee_radius,
			this.thigh_size
		);

		const knee_geo = new THREE.SphereGeometry(this.knee_radius);

		const calf_geo = new THREE.CylinderGeometry(
			this.knee_radius,
			this.ankle_radius,
			this.calf_size
		);

		const thigh_group = new THREE.Group();
		const calf_group = new THREE.Group();

		const hip = new THREE.Mesh(hip_geo, this.jointMaterial);
		const thigh = new THREE.Mesh(thigh_geo, this.bodyMaterial);
		const knee = new THREE.Mesh(knee_geo, this.jointMaterial);
		const calf = new THREE.Mesh(calf_geo, this.bodyMaterial);

		thigh_group.add(hip);

		thigh_group.add(thigh);

		calf_group.add(knee);

		calf_group.add(calf);

		thigh_group.add(calf_group);

		this.group.add(thigh_group);

		// place hip under body, the body's bottom is at 0
		hip.position.y = 0;

		// Translate the arm (not the group) downwards by half the height
		// so the group rotates at the shoulder
		thigh.position.y = this.thigh_size * -0.5;
		// place knee at top of calf thigh
		knee.position.y = 0;

		// Translate the arm (not the group) downwards by half the height
		calf.position.y = this.calf_size * -0.5;
		// place calf under knee
		calf_group.position.y = this.thigh_size * -1;

		// place thigh at hip
		thigh_group.position.x = sign * this.thigh_radius;
		thigh_group.position.y = (-1 / 3) * this.hip_radius;

		return [
			{ group: thigh_group, mesh: [hip, thigh] },
			{ group: calf_group, mesh: [knee, calf] },
		];
	}

	createLegs() {
		const left_leg = this._buildLeg(-1);

		this.limbs["LEFT_THIGH"] = left_leg[0];
		this.limbs["LEFT_CALF"] = left_leg[1];

		const right_leg = this._buildLeg(1);

		this.limbs["RIGHT_THIGH"] = right_leg[0];
		this.limbs["RIGHT_CALF"] = right_leg[1];
	}

	init() {
		this.createBody();
		this.createHead();
		this.createArms();
		this.createLegs();
	}

	setPosition(position) {
		this.group.position.set(...position);
	}

	setRotation(rotation) {
		this.group.rotation.set(...rotation);
	}

	limbRotate(limb_name, target_vector) {
		const quaternion = quaternionFromVectors(
			this.limb_rotation_vectors[limb_name],
			target_vector
		);

		this.limbs[limb_name].applyQuaternion(quaternion);

		this.limb_rotation_vectors[limb_name] = target_vector;
	}
}