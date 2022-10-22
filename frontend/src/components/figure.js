import * as THREE from "three";

export const degreesToRadians = (degrees) => {
	return degrees * (Math.PI / 180);
};

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
		this.bodyMaterial = new THREE.MeshBasicMaterial({
			color: 0x44aa88,
		});

		this.unit = 0.1;

		this.group = new THREE.Group();

		this.group.position.x = this.params.x;
		this.group.position.y = this.params.y;
		this.group.position.z = this.params.z;
		this.group.position.ry = this.params.ry;

		this.group.rotation.x = 0;
		this.group.rotation.y = 0;

		scene.add(this.group);

		this.head_radius = 4 * this.unit;
		this.neck_radius = 1.6 * this.unit;
		this.neck_size = 2 * this.unit;

		this.shoulder_size = 6 * this.unit;
		this.spine_size = 12 * this.unit;
		this.waist_size = 5 * this.unit;

		this.deltoid_size = 2 * this.unit;
		this.bigarm_size = 10 * this.unit;
		this.elbow_size = 1.6 * this.unit;
		this.smallarm_size = 1 * this.unit;
		this.wrist_size = 0.8 * this.unit;
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

		this.body.position.x = 0;
		this.body.position.y = 0;

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
		const neck_mesh = new THREE.Mesh(neck_geo, this.headMaterial);

		neck_mesh.position.y = this.spine_size / 2 + this.neck_size / 2;

		this.group.add(neck_mesh);

		const radius = this.head_radius; // ui: radius
		const widthSegments = 12; // ui: widthSegments
		const heightSegments = 8; // ui: heightSegments
		const geometry = new THREE.SphereGeometry(
			radius,
			widthSegments,
			heightSegments
		);

		// Create the main cube of the head and add to the group
		// const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
		const headMesh = new THREE.Mesh(geometry, this.headMaterial);
		this.head.add(headMesh);

		// Add the head group to the figure
		this.group.add(this.head);

		// Position the head group
		this.head.position.y =
			this.spine_size / 2 + this.head_radius + this.neck_size;

		// Add the eyes by calling the function we already made
		const eyes = new THREE.Group();
		const eyeRadius = 0.1;
		const eyeGeometry = new THREE.CircleGeometry(eyeRadius, 8);

		// Define the eye material
		const material = new THREE.MeshLambertMaterial({ color: 0x44445c });

		for (let i = 0; i < 2; i++) {
			const eye = new THREE.Mesh(eyeGeometry, material);
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
		const radialSegments = 8;

		const bigarm_geometry = new THREE.CylinderGeometry(
			this.deltoid_size,
			this.elbow_size,
			this.bigarm_size,
			radialSegments
		);

		for (let i = 0; i < 2; i++) {
			const armGroup = new THREE.Group();
			const arm = new THREE.Mesh(bigarm_geometry, this.headMaterial);

			const sign = i % 2 === 0 ? 1 : -1;

			armGroup.add(arm);
			this.group.add(armGroup);

			// Translate the arm (not the group) downwards by half the height
			arm.position.y = this.bigarm_size * -0.5;

			armGroup.position.x =
				sign * (this.shoulder_size / 2 + this.deltoid_size * 2);
			armGroup.position.y = 0.6;

			// armGroup.rotation.z = degreesToRadians(40 * m);

			// Helper
			const box = new THREE.BoxHelper(armGroup, 0xffff00);
			this.group.add(box);
		}

		const geometry2 = new THREE.BoxGeometry(0.25, this.smallarm_size, 0.25);

		for (let i = 0; i < 2; i++) {
			const armGroup = new THREE.Group();
			const arm = new THREE.Mesh(geometry2, this.headMaterial);

			const m = i % 2 === 0 ? 1 : -1;

			armGroup.add(arm);
			this.group.add(armGroup);

			// Translate the arm (not the group) downwards by half the height
			arm.position.y = this.smallarm_size * -0.5;

			armGroup.position.x = m * 1.5;
			armGroup.position.y = -0.2;

			armGroup.rotation.z = degreesToRadians(40 * m);

			armGroup.rotation.y = degreesToRadians(40 * m);

			// Helper
			const box = new THREE.BoxHelper(armGroup, 0xffff00);
			this.group.add(box);
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
