import * as THREE from "three";
import { degreesToRadians, originToEnd } from "./ropes";

export class Figure {
	constructor(scene, params) {
		this.params = {
			x: 0,
			y: 0,
			z: 0,
			ry: 0,
			...params,
		};

		this.headHue = 279;
		this.bodyHue = 132;

		this.headMaterial = new THREE.MeshBasicMaterial({
			color: 0x44aa88,
		});
		this.purpleMaterial = new THREE.MeshBasicMaterial({
			color: 0xff21b0,
		});

		this.group = new THREE.Group();

		this.group.position.x = this.params.x;
		this.group.position.y = this.params.y;
		this.group.position.z = this.params.z;
		this.group.position.ry = this.params.ry;

		this.group.rotation.x = 0;
		this.group.rotation.y = 0;

		scene.add(this.group);

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
		this.bigarm_size = 10 * this.unit;
		this.elbow_radius = 1.6 * this.unit;
		this.smallarm_size = 8 * this.unit;
		this.wrist_size = 0.8 * this.unit;

		this.left_shoulder_pos = new THREE.Vector3();
		this.right_shoulder_pos = new THREE.Vector3();
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

		this.body = new THREE.Mesh(geometry, this.headMaterial);

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
		const headMesh = new THREE.Mesh(head_geo, this.headMaterial);
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

	createArms() {
		// Set the variable

		const should_geo = new THREE.SphereGeometry(this.shoulder_radius);

		const bigarm_geo = new THREE.CylinderGeometry(
			this.deltoid_radius,
			this.elbow_radius,
			this.bigarm_size
		);

		const elbow_geo = new THREE.SphereGeometry(this.elbow_radius);

		const left_elbow_pos = new THREE.Vector3();
		const right_elbow_pos = new THREE.Vector3();

		for (let i = 0; i < 2; i++) {
			const sign = i % 2 === 0 ? -1 : 1;

			const bigarm_group = new THREE.Group();

			const shoulder = new THREE.Mesh(should_geo, this.purpleMaterial);
			const arm = new THREE.Mesh(bigarm_geo, this.headMaterial);
			const elbow = new THREE.Mesh(elbow_geo, this.purpleMaterial);

			shoulder.position.y = 0;

			// Translate the arm (not the group) downwards by half the height
			// so the group rotates at the shoulder
			arm.position.y = this.bigarm_size * -0.5;

			elbow.position.y = this.bigarm_size * -1;

			bigarm_group.add(shoulder);

			bigarm_group.add(arm);

			bigarm_group.add(elbow);

			this.group.add(bigarm_group);

			bigarm_group.position.x =
				sign * (this.shoulder_size / 2 + this.deltoid_radius * 2);

			bigarm_group.position.y = this.spine_size - this.shoulder_radius;

			if (i % 2 === 0) {
				bigarm_group.rotation.z = degreesToRadians(-40);

				// bigarm_group.updateMatrixWorld(true);

				elbow.getWorldPosition(left_elbow_pos);
			} else {
				bigarm_group.rotation.z = degreesToRadians(30);

				// bigarm_group.updateMatrixWorld(true);

				elbow.getWorldPosition(right_elbow_pos);
			}

			// // Helper
			// const box = new THREE.BoxHelper(bigarm_group, 0xffff00);
			// this.group.add(box);
		}

		const smallarm_geo = new THREE.CylinderGeometry(
			this.deltoid_radius,
			this.elbow_radius,
			this.smallarm_size
		);

		for (let i = 0; i < 2; i++) {
			const smallarm_group = new THREE.Group();
			const arm = new THREE.Mesh(smallarm_geo, this.headMaterial);

			const sign = i % 2 === 0 ? 1 : -1;

			smallarm_group.add(arm);

			this.group.add(smallarm_group);

			// Translate the arm (not the group) downwards by half the height
			arm.position.y = this.smallarm_size * -0.5;

			if (i % 2 === 0) {
				smallarm_group.position.x = left_elbow_pos.x;
				smallarm_group.position.y = left_elbow_pos.y;
				smallarm_group.position.z = left_elbow_pos.z;

				smallarm_group.rotation.x = degreesToRadians(-20);
				smallarm_group.rotation.y = degreesToRadians(20);
				smallarm_group.rotation.z = degreesToRadians(10);
			} else {
				smallarm_group.position.x = right_elbow_pos.x;
				smallarm_group.position.y = right_elbow_pos.y;
				smallarm_group.position.z = right_elbow_pos.z;

				smallarm_group.rotation.x = degreesToRadians(-30);
				smallarm_group.rotation.y = degreesToRadians(-30);
				smallarm_group.rotation.z = degreesToRadians(-30);
			}

			// armGroup.rotation.z = degreesToRadians(40 * sign);

			// armGroup.rotation.y = degreesToRadians(40 * sign);

			// // Helper
			// const box = new THREE.BoxHelper(smallarm_group, 0xffff00);
			// this.group.add(box);
		}
	}

	createLegs() {
		const legs = new THREE.Group();
		const geometry = new THREE.BoxGeometry(0.25, 0.4, 0.25);

		for (let i = 0; i < 2; i++) {
			const leg = new THREE.Mesh(geometry, this.headMaterial);
			const m = i % 2 === 0 ? 1 : -1;

			legs.add(leg);
			leg.position.x = m * 0.22;
		}

		this.group.add(legs);
		legs.position.y = -1.15;

		this.body.add(legs);
	}

	init() {
		this.createBody();
		this.createHead();
		this.createArms();
		this.createLegs();

		// console.log("draw");
	}
}
