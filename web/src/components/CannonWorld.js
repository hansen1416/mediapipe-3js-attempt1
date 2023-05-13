import * as CANNON from "cannon-es";
import * as THREE from "three";

export default class CannonWorld {
	constructor(scene, ground_level) {
		this.scene = scene;

		this.world = new CANNON.World({
			gravity: new CANNON.Vec3(0, -98.2, 0), // m/s²
		});

		const groundBody = new CANNON.Body({ mass: 0 });
		groundBody.addShape(new CANNON.Plane());
		groundBody.quaternion.setFromAxisAngle(
			new CANNON.Vec3(1, 0, 0),
			-Math.PI / 2
		);

		groundBody.position.set(0, ground_level, 0);

		// Create a Three.js ground plane mesh
		const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
		const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x363795 });
		const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);

		groundMesh.position.set(0, ground_level, 0);
		groundMesh.rotation.set(-Math.PI / 2, 0, 0);
		groundMesh.receiveShadow = true;
		this.scene.add(groundMesh);

		this.world.addBody(groundBody);

		this.rigid = [];
		this.mesh = [];
	}

	onFrameUpdate() {
		this.world.fixedStep();

		for (let i in this.rigid) {
			this.mesh[i].position.copy(this.rigid[i].position);
			this.mesh[i].quaternion.copy(this.rigid[i].quaternion);
		}
	}

	addBall(radius = 10) {
		const sphereBody = new CANNON.Body({
			mass: 5, // kg
			shape: new CANNON.Sphere(radius),
		});
		sphereBody.position.set(0, 100, -1000); // m

		sphereBody.velocity.set(0, 0, 900);

		/**
		The value of linearDamping can be set to any non-negative number, 
		with higher values resulting in faster loss of velocity. 
		A value of 0 means there is no damping effect, 
		and the body will continue moving at a constant velocity forever.
		 */
		sphereBody.linearDamping = 0.4;

		this.world.addBody(sphereBody);

		const sphereMesh = new THREE.Mesh(
			new THREE.SphereGeometry(radius),
			new THREE.MeshNormalMaterial()
		);
		sphereMesh.castShadow = true;
		this.scene.add(sphereMesh);

		this.rigid.push(sphereBody);
		this.mesh.push(sphereMesh);

		return sphereBody;
	}
}
