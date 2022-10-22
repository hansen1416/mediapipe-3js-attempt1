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

		// this.headMaterial = this.bodyMaterial;

		this.group = new THREE.Group();

		this.group.position.x = this.params.x;
		this.group.position.y = this.params.y;
		this.group.position.z = this.params.z;
		this.group.position.ry = this.params.ry;

		this.group.rotation.x = 0;
		this.group.rotation.y = 0;

		scene.add(this.group);
	}

	createBody() {
		const geometry = new THREE.BoxGeometry(1, 1, 1);
		this.body = new THREE.Mesh(geometry, this.bodyMaterial);
		this.group.add(this.body);
	}

	createHead() {
		// Create a new group for the head
		this.head = new THREE.Group();

		// Create the main cube of the head and add to the group
		const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
		const headMain = new THREE.Mesh(geometry, this.headMaterial);
		this.head.add(headMain);

		// Add the head group to the figure
		this.group.add(this.head);

		// Position the head group
		this.head.position.y = 1.65;

		// Add the eyes by calling the function we already made
		this.createEyes();
	}

	createArms() {
		// Set the variable
		const height = 1;
		const geometry = new THREE.BoxGeometry(0.25, height, 0.25);

		for (let i = 0; i < 2; i++) {
			const armGroup = new THREE.Group();
			const arm = new THREE.Mesh(geometry, this.headMaterial);

			const m = i % 2 === 0 ? 1 : -1;

			armGroup.add(arm);
			this.group.add(armGroup);

			// Translate the arm (not the group) downwards by half the height
			arm.position.y = height * -0.5;

			armGroup.position.x = m * 0.8;
			armGroup.position.y = 0.6;

			armGroup.rotation.z = degreesToRadians(40 * m);

			// Helper
			const box = new THREE.BoxHelper(armGroup, 0xffff00);
			this.group.add(box);
		}

		const height2 = 0.6;
		const geometry2 = new THREE.BoxGeometry(0.25, height2, 0.25);

		for (let i = 0; i < 2; i++) {
			const armGroup = new THREE.Group();
			const arm = new THREE.Mesh(geometry2, this.headMaterial);

			const m = i % 2 === 0 ? 1 : -1;

			armGroup.add(arm);
			this.group.add(armGroup);

			// Translate the arm (not the group) downwards by half the height
			arm.position.y = height2 * -0.5;

			armGroup.position.x = m * 1.5;
			armGroup.position.y = -0.2;

			armGroup.rotation.z = degreesToRadians(40 * m);

			armGroup.rotation.y = degreesToRadians(40 * m);

			// Helper
			const box = new THREE.BoxHelper(armGroup, 0xffff00);
			this.group.add(box);
		}
	}

	createEyes() {
		const eyes = new THREE.Group();
		const geometry = new THREE.SphereGeometry(0.15, 12, 8);

		// Define the eye material
		const material = new THREE.MeshLambertMaterial({ color: 0x44445c });

		for (let i = 0; i < 2; i++) {
			const eye = new THREE.Mesh(geometry, material);
			const m = i % 2 === 0 ? 1 : -1;

			// Add the eye to the group
			eyes.add(eye);

			// Position the eye
			eye.position.x = 0.36 * m;
		}

		// in createEyes()
		this.head.add(eyes);

		// Move the eyes forwards by half of the head depth - it might be a good idea to create a variable to do this!
		eyes.position.z = 0.7;
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
