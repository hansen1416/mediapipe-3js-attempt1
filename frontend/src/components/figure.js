import * as THREE from "three";
import { degreesToRadians } from "./ropes";

export class Figure {
	constructor(scene, figure_position, figure_rotation) {
		this.bodyMaterial = new THREE.MeshBasicMaterial({
			color: 0x44aa88,
		});
		this.purpleMaterial = new THREE.MeshBasicMaterial({
			color: 0x33eeb0,
		});

		this.group = new THREE.Group();

		scene.add(this.group);

		if (figure_position) {
			this.group.position.set(...figure_position);
		}

		if (figure_rotation) {
			this.group.rotation.set(...figure_rotation);
		}

		// this.group.updateMatrix();

		// the following parameters define the size of different parts of a body
		this.unit = 0.1;

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

		this.crus_size = 10 * this.unit;
		this.ankle_radius = 1.8 * this.unit;
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

		this.body = new THREE.Mesh(geometry, this.bodyMaterial);

		this.body.position.y = this.spine_size / 2;

		this.group.add(this.body);
	}

	createHead() {
		// Create a new group for the head
		this.head = new THREE.Group();

		const neck_geo = new THREE.CylinderGeometry(
			this.neck_radius,
			this.neck_radius,
			this.neck_size
		);
		const neck_mesh = new THREE.Mesh(neck_geo, this.purpleMaterial);

		neck_mesh.position.y = this.spine_size + this.neck_size / 2;

		this.group.add(neck_mesh);

		const head_geo = new THREE.SphereGeometry(this.head_radius);

		// Create the main cube of the head and add to the group
		// const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
		const headMesh = new THREE.Mesh(head_geo, this.bodyMaterial);
		this.head.add(headMesh);

		// Position the head group
		this.head.position.y =
			this.spine_size + this.head_radius + this.neck_size;

		// Add the head group to the figure
		this.group.add(this.head);

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
		this.head.add(eyes);
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

		const shoulder = new THREE.Mesh(shoulder_geo, this.purpleMaterial);
		const bigarm = new THREE.Mesh(bigarm_geo, this.bodyMaterial);
		const elbow = new THREE.Mesh(elbow_geo, this.purpleMaterial);
		const smallarm = new THREE.Mesh(smallarm_geo, this.bodyMaterial);

		bigarm_group.add(shoulder);

		bigarm_group.add(bigarm);

		bigarm_group.add(elbow);

		smallarm_group.add(smallarm);

		bigarm_group.add(smallarm_group);

		this.group.add(bigarm_group);

		// shoulder is at top of the bigarm_group
		shoulder.position.y = 0;
		// Translate the arm (not the group) downwards by half the height
		// so the group rotates at the shoulder
		bigarm.position.y = this.bigarm_size * -0.5;
		// place elbow under bigarm
		elbow.position.y = this.bigarm_size * -1;
		// bigarm at each side of the body
		bigarm_group.position.x =
			sign * (this.shoulder_size / 2 + this.deltoid_radius * 2);
		// bigarm a bit lower than spine
		bigarm_group.position.y = this.spine_size - this.shoulder_radius;
		// Translate the arm (not the group) downwards by half the height
		smallarm.position.y = this.smallarm_size * -0.5;
		// place small arms under elbow
		smallarm_group.position.y = this.bigarm_size * -1;

		return [shoulder, bigarm_group, elbow, smallarm_group];
	}

	createArms() {
		// Set the variable

		const left_arm = this._buildArm(-1);

		this.left_shoulder = left_arm[0];
		this.left_bigarm = left_arm[1];
		this.left_elbow = left_arm[2];
		this.left_smallarm = left_arm[3];

		const right_arm = this._buildArm(1);

		this.right_shoulder = right_arm[0];
		this.right_bigarm = right_arm[1];
		this.right_elbow = right_arm[2];
		this.right_smallarm = right_arm[3];
	}

	_buildLeg(sign) {
		const hip_geo = new THREE.SphereGeometry(this.hip_radius);

		const thigh_geo = new THREE.CylinderGeometry(
			this.thigh_radius,
			this.knee_radius,
			this.thigh_size
		);

		const knee_geo = new THREE.SphereGeometry(this.knee_radius);

		const crus_geo = new THREE.CylinderGeometry(
			this.knee_radius,
			this.ankle_radius,
			this.crus_size
		);

		const thigh_group = new THREE.Group();
		const crus_group = new THREE.Group();

		const hip = new THREE.Mesh(hip_geo, this.purpleMaterial);
		const thigh = new THREE.Mesh(thigh_geo, this.bodyMaterial);
		const knee = new THREE.Mesh(knee_geo, this.purpleMaterial);
		const crus = new THREE.Mesh(crus_geo, this.bodyMaterial);

		thigh_group.add(hip);

		thigh_group.add(thigh);

		thigh_group.add(knee);

		crus_group.add(crus);

		thigh_group.add(crus_group);

		this.group.add(thigh_group);

		// place hip under body, the body's bottom is at 0
		hip.position.y = 0;

		// Translate the arm (not the group) downwards by half the height
		// so the group rotates at the shoulder
		thigh.position.y = this.thigh_size * -0.5;
		// place knee under thigh
		knee.position.y = this.thigh_size * -1;

		// Translate the arm (not the group) downwards by half the height
		crus.position.y = this.crus_size * -0.5;
		// place crus under knee
		crus_group.position.y = this.thigh_size * -1;

		// place thigh at hip
		thigh_group.position.x = sign * this.thigh_radius;
		thigh_group.position.y = (-1 / 3) * this.hip_radius;

		return [hip, thigh_group, knee, crus_group];
	}

	createLegs() {
		const left_leg = this._buildLeg(-1);

		this.left_hip = left_leg[0];
		this.left_thigh = left_leg[1];
		this.left_knee = left_leg[2];
		this.left_crus = left_leg[3];

		const right_leg = this._buildLeg(1);

		this.right_hip = right_leg[0];
		this.right_thigh = right_leg[1];
		this.right_knee = right_leg[2];
		this.right_crus = right_leg[3];
	}

	init() {
		this.createBody();
		this.createHead();
		this.createArms();
		this.createLegs();
	}

	bigArmRotate(rotation, sign) {
		if (sign < 0) {
			this.left_bigarm.rotation.set(...rotation);
		} else {
			this.right_bigarm.rotation.set(...rotation);
		}
	}

	smallArmRotate(rotation, sign) {
		if (sign < 0) {
			this.left_smallarm.rotation.set(...rotation);
		} else {
			this.right_smallarm.rotation.set(...rotation);
		}
	}

	thighRotate(rotation, sign) {
		if (sign < 0) {
			this.left_thigh.rotation.set(...rotation);
		} else {
			this.right_thigh.rotation.set(...rotation);
		}
	}

	crusRotate(rotation, sign) {
		if (sign < 0) {
			this.left_crus.rotation.set(...rotation);
		} else {
			this.right_crus.rotation.set(...rotation);
		}
	}
}
