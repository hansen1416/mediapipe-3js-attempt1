import * as CANNON from "cannon-es";
import * as THREE from "three";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";
import { GROUND_LEVEL, FLOOR_WIDTH, FLOOR_HEIGHT } from "./constants";
import CannonDebugger from "cannon-es-debugger";
import ThreeScene from "./ThreeScene";

export default class CannonWorld {
	constructor(scene) {
		this.scene = scene;

		this.world = new CANNON.World({
			gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
		});

		// add floor Material
		// const planeMaterial = new CANNON.Material();

		// planeMaterial.friction = 1;

		// const planeContactMaterial = new CANNON.ContactMaterial(
		// 	planeMaterial,
		// 	new CANNON.Material(),
		// 	{
		// 		friction: 1,
		// 		restitution: 1,
		// 		contactEquationStiffness: 1e6,
		// 	}
		// );

		// this.world.addContactMaterial(planeContactMaterial);

		this.rigid = [];
		this.mesh = [];
		// @ts-ignore
		// this.debuggerInstance = new CannonDebugger(this.scene, this.world);
	}

	addGround() {
		// add floor
		const groundBody = new CANNON.Body({ mass: 0 });
		// @ts-ignore
		// groundBody.material = planeContactMaterial;
		groundBody.position.set(0, GROUND_LEVEL, 0);
		groundBody.quaternion.setFromAxisAngle(
			new CANNON.Vec3(1, 0, 0),
			-Math.PI / 2
		);

		groundBody.addShape(new CANNON.Plane());

		this.world.addBody(groundBody);

		const flootDepth = 0.2;
		// Create a Three.js ground plane mesh
		const groundMesh = new THREE.Mesh(
			new THREE.BoxGeometry(FLOOR_WIDTH, FLOOR_HEIGHT, flootDepth),
			new THREE.MeshStandardMaterial({ color: 0x363795 })
		);

		groundMesh.position.set(0, GROUND_LEVEL - flootDepth / 2, 0);
		groundMesh.rotation.set(-Math.PI / 2, 0, 0);
		groundMesh.receiveShadow = true;

		this.scene.add(groundMesh);
	}

	daneelBody(glb) {
		// const meshes = {};

		// mesh.traverse(function (node) {
		// 	if (node.isMesh) {
		// 		meshes[node.name] = node;
		// 	}
		// });

		// const meshKey = "Wolf3D_Body";

		const w = 0.6,
			h = 0.9,
			d = 0.2;

		const shape = new CANNON.Box(new CANNON.Vec3(w, h, d));

		// if you have another dynamic body with a non-zero mass and it collides with the static body,
		// it may still pass through due to numerical errors in the physics simulation.

		// // Set up contact material for collisions
		// var groundMaterial = new CANNON.Material();
		// var contactMaterial = new CANNON.ContactMaterial(groundMaterial, groundMaterial, {
		//     friction: 0.3,
		//     restitution: 0.5,
		//     contactEquationStiffness: 1e9, // Increase stiffness to reduce penetration
		//     contactEquationRelaxation: 4 // Increase relaxation for better stability
		// });
		// world.addContactMaterial(contactMaterial);
		const body = new CANNON.Body({
			mass: 0, // kg
			shape: shape,
		});

		const world_pos = new THREE.Vector3();

		glb.getWorldPosition(world_pos);

		body.position.set(world_pos.x, world_pos.y + 0.9, world_pos.z);

		this.world.addBody(body);

		const mesh = new THREE.Mesh(
			new THREE.BoxGeometry(w * 2, h * 2, d * 2),
			new THREE.MeshBasicMaterial({ color: 0xff0000 })
		);

		mesh.position.set(world_pos.x, world_pos.y + 0.9, world_pos.z);

		this.scene.add(mesh);

		this.rigid.push(body);
		this.mesh.push(mesh);
	}

	onFrameUpdate() {
		this.world.fixedStep();

		// this.debuggerInstance.update();

		for (let i in this.rigid) {
			this.mesh[i].position.copy(this.rigid[i].position);
			this.mesh[i].quaternion.copy(this.rigid[i].quaternion);
		}
	}

	/**
	 * 	The value of linearDamping can be set to any non-negative number, 
		with higher values resulting in faster loss of velocity. 
		A value of 0 means there is no damping effect, 
		and the body will continue moving at a constant velocity forever.

	 * @param {object} mesh 
	 * @param {CANNON.Vec3} velocity control both direction and speed,
	 * @param {number} dimping control how quickly the object loose its speed
	 * @returns 
	 */
	project(mesh, velocity, dimping = 0.3) {
		const sphereBody = new CANNON.Body({
			mass: 5, // kg
			shape: new CANNON.Sphere(mesh.geometry.parameters.radius),
		});
		sphereBody.position.set(
			mesh.position.x,
			mesh.position.y,
			mesh.position.z
		); // m

		sphereBody.velocity.set(velocity.x, velocity.y, velocity.z);

		sphereBody.linearDamping = dimping;

		this.world.addBody(sphereBody);

		this.rigid.push(sphereBody);
		this.mesh.push(mesh);

		return sphereBody;
	}
}
