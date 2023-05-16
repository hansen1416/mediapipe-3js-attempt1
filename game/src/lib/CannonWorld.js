import * as CANNON from "cannon-es";
import * as THREE from "three";

export default class CannonWorld {
	constructor(scene, ground_level) {
		this.scene = scene;

		this.world = new CANNON.World({
			gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
		});

		const groundBody = new CANNON.Body({ mass: 0 });
		groundBody.addShape(new CANNON.Plane());
		groundBody.quaternion.setFromAxisAngle(
			new CANNON.Vec3(1, 0, 0),
			-Math.PI / 2
		);

		groundBody.position.set(0, ground_level, 0);

		// Create a Three.js ground plane mesh
		const groundGeometry = new THREE.PlaneGeometry(24, 24);
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

	addBall(mesh, velocity) {
		const sphereBody = new CANNON.Body({
			mass: 5, // kg
			shape: new CANNON.Sphere(mesh.geometry.parameters.radius),
		});
		sphereBody.position.set(
			mesh.position.x,
			mesh.position.y,
			mesh.position.z
		); // m

		const speedScale = 11;

		sphereBody.velocity.set(
			velocity.x * speedScale,
			velocity.y * speedScale,
			velocity.z * speedScale
		);

		/**
		The value of linearDamping can be set to any non-negative number, 
		with higher values resulting in faster loss of velocity. 
		A value of 0 means there is no damping effect, 
		and the body will continue moving at a constant velocity forever.
		 */
		sphereBody.linearDamping = 0.4;

		this.world.addBody(sphereBody);

		this.rigid.push(sphereBody);
		this.mesh.push(mesh);

		return sphereBody;
	}
}
