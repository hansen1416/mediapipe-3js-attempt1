import * as CANNON from "cannon-es";
import * as THREE from "three";
import { GROUND_LEVEL, FLOOR_WIDTH, FLOOR_HEIGHT } from "./constants";
import CannonDebugger from "cannon-es-debugger";
import { Vector3 } from "three";

function isIndexed(mesh) {
	return mesh.geometry.index != null;
}

function getFaces(mesh) {
	const faces = [];
	const position = mesh.geometry.getAttribute("position");

	if (isIndexed(mesh)) {
		const index = mesh.geometry.getIndex();

		for (let i = 0; i < index.count; i += 3) {
			const face = [index.getX(i), index.getX(i + 1), index.getX(i + 2)];
			faces.push(face);
		}
	} else {
		for (let i = 0; i < position.count; i += 3) {
			const face = [i, i + 1, i + 2];
			faces.push(face);
		}
	}

	return faces;
}

function getVertices(mesh) {
	const position = mesh.geometry.getAttribute("position");
	const vertices = [];

	for (let i = 0; i < position.count / position.itemSize; i++) {
		const vertex = new CANNON.Vec3(
			position.getX(i),
			position.getY(i),
			position.getZ(i)
		);

		vertices.push(vertex);
	}

	return vertices;
}

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

		this.rigid = [];
		this.mesh = [];
		// @ts-ignore
		this.debuggerInstance = new CannonDebugger(this.scene, this.world);
	}

	daneelBody(mesh) {
		const meshes = {};

		mesh.traverse(function (node) {
			if (node.isMesh) {
				meshes[node.name] = node;
			}
		});

		console.log(meshes);

		const meshKey = "Wolf3D_Outfit_Top";

		const positions =
			meshes[meshKey].geometry.attributes.position.data.array;
		// const indices = meshes[meshKey].geometry.index.array;

		const indices =
			meshes[meshKey].geometry.attributes.skinIndex.data.array;

		const normals = meshes[meshKey].geometry.attributes.normal.data.array;

		const buffergeo = meshes[meshKey].geometry.clone();

		console.log(buffergeo);

		const meshtmp = new THREE.Mesh(
			buffergeo,
			new THREE.MeshBasicMaterial({ color: 0xff0000 })
		);

		const vertices = getVertices(meshtmp);
		const faces = getFaces(meshtmp);

		console.log(vertices, faces);

		const shape = new CANNON.ConvexPolyhedron({
			vertices: vertices,
			faces: faces,
		});

		const body = new CANNON.Body({
			mass: 10, // kg
			shape: shape,
		});

		this.world.addBody(body);

		this.rigid.push(body);

		this.mesh.push(meshes[meshKey]);

		// const vtmp = new THREE.Vector3();

		// meshes[meshKey].getWorldPosition(vtmp);

		// // meshtmp.position.set(vtmp.x, vtmp.y, vtmp.z);

		// this.scene.add(meshtmp);

		// const bbox = meshes[meshKey].geometry.boundingBox;
		// // console.log(meshes[meshKey].geometry.boundingBox);

		// const vtmp = new THREE.Vector3();

		// meshes[meshKey].getWorldPosition(vtmp);

		// console.log(meshes[meshKey], vtmp);

		// const meshtmp = new THREE.Mesh(
		// 	new THREE.BoxGeometry(
		// 		(bbox.max.x - bbox.min.x) / 2,
		// 		(bbox.max.y - bbox.min.y) / 2,
		// 		(bbox.max.z - bbox.min.z) / 2
		// 	),
		// 	new THREE.MeshBasicMaterial({ color: 0xff0000 })
		// );

		// meshtmp.position.set(vtmp.x, vtmp.y, vtmp.z);

		// this.scene.add(meshtmp);

		// const cannonPoints = [];

		// for (let i = 0; i < positions.length; i += 3) {
		// 	cannonPoints.push(
		// 		new CANNON.Vec3(
		// 			positions[i],
		// 			positions[i + 1],
		// 			positions[i + 2]
		// 		)
		// 	);
		// }

		// const cannonFaces = [];

		// for (let i = 0; i < indices.length; i += 3) {
		// 	cannonFaces.push([indices[i], indices[i + 1], indices[i + 2]]);
		// }

		// const cannonNormals = [];

		// for (let i = 0; i < normals.length; i += 3) {
		// 	cannonNormals.push(
		// 		new CANNON.Vec3(normals[i], normals[i + 1], normals[i + 2])
		// 	);
		// }

		//

		// const shape = new CANNON.ConvexPolyhedron({
		// 	vertices: cannonPoints,
		// 	faces: cannonFaces,
		// 	normals: cannonNormals,
		// });

		// const body = new CANNON.Body({
		// 	mass: 10, // kg
		// 	shape: shape,
		// });

		// this.world.addBody(body);

		// this.rigid.push(body);
		// this.mesh.push(meshes[meshKey]);
	}

	onFrameUpdate() {
		this.world.fixedStep();

		this.debuggerInstance.update();

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
	project(mesh, velocity, size = 0.1, dimping = 0.3) {
		const sphereBody = new CANNON.Body({
			mass: 5, // kg
			shape: new CANNON.Box(new CANNON.Vec3(size, size, size)),
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
