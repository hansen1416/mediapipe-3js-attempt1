import * as THREE from "three";
import { POSE_LANDMARKS } from "@mediapipe/pose";
import { distanceBetweenPoints } from "../ropes";

export class CustomManFigure {
	constructor(scene, figure_position, figure_rotation) {
		this.basicMaterial = new THREE.MeshBasicMaterial({
			color: 0x33eeb0,
		});

		this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

		this.group = new THREE.Group();

		scene.add(this.group);

		// this.scene = scene;

		if (figure_position) {
			this.group.position.set(...figure_position);
		}

		if (figure_rotation) {
			this.group.rotation.set(...figure_rotation);
		}

		// this.group.updateMatrix();

		// the following parameters define the size of different parts of a body
		this.unit = 4;

		this.joints_size = 0.05;

		this.joints = {};

		this.joints_connect = [
			["LEFT_SHOULDER", "RIGHT_SHOULDER", 1.2381028532000913],
			["LEFT_SHOULDER", "LEFT_ELBOW", 0.7939997349833849],
			["LEFT_ELBOW", "LEFT_WRIST", 0.7294965908810502],
			["RIGHT_SHOULDER", "RIGHT_ELBOW", 1.1247838311094145],
			["RIGHT_ELBOW", "RIGHT_WRIST", 0.8123971126504467],
			["LEFT_SHOULDER", "LEFT_HIP", 1.7374364470364458],
			["RIGHT_SHOULDER", "RIGHT_HIP", 1.9537422593811369],
			["LEFT_HIP", "LEFT_KNEE", 1.7646879068238623],
			["LEFT_KNEE", "LEFT_ANKLE", 1.4876400546972346],
			["RIGHT_HIP", "RIGHT_KNEE", 1.4388785699684465],
			["RIGHT_KNEE", "RIGHT_ANKLE", 1.7573154865681548],
		];

		this.lines = [];
	}

	init() {
		const joints_geo = new THREE.BoxGeometry(
			this.joints_size,
			this.joints_size,
			this.joints_size
		);

		for (let j in POSE_LANDMARKS) {
			this.joints[j] = new THREE.Mesh(joints_geo, this.basicMaterial);

			this.group.add(this.joints[j]);

			// this.joints[j].position.set(0,0,0)
		}

		this.draw_lines();
	}

	draw_lines() {
		for (let jc in this.joints_connect) {
			const group = new THREE.Group();

			const points = [];

			points.push(new THREE.Vector3(0, 0, 0));
			points.push(new THREE.Vector3(0, this.joints_connect[jc][2], 0));

			const geometry = new THREE.BufferGeometry().setFromPoints(points);

			geometry.setDrawRange(0, 2);

			const line = new THREE.Line(geometry, this.lineMaterial);

			group.add(line);

			this.lines.push(group);

			this.group.add(group);

			line.position.y = -1 * this.joints_connect[jc][2];

			group.userData.from = this.joints_connect[jc][0];
			group.userData.to = this.joints_connect[jc][1];

			group.position.set(
				this.joints[this.joints_connect[jc][0]].position
			);

			// line.add(this.arm_geo());
		}
	}

	arm_geo() {
		const vertices = [
			// front
			{ pos: [0, 0, 0], norm: [0, 0, 0], uv: [0, 0] },
			{ pos: [1, 0, 0], norm: [0, 0, 0], uv: [0, 0] },
			{ pos: [0, 1, 0], norm: [0, 0, 0], uv: [0, 0] },
		];

		const positions = [];
		const normals = [];
		const uvs = [];
		for (const vertex of vertices) {
			positions.push(...vertex.pos);
			normals.push(...vertex.norm);
			uvs.push(...vertex.uv);
		}

		const geometry = new THREE.BufferGeometry();
		const positionNumComponents = 3;
		const normalNumComponents = 3;
		const uvNumComponents = 2;
		geometry.setAttribute(
			"position",
			new THREE.BufferAttribute(
				new Float32Array(positions),
				positionNumComponents
			)
		);
		geometry.setAttribute(
			"normal",
			new THREE.BufferAttribute(
				new Float32Array(normals),
				normalNumComponents
			)
		);
		geometry.setAttribute(
			"uv",
			new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents)
		);

		return new THREE.Mesh(geometry, this.basicMaterial);
	}

	update_lines() {
		for (let i in this.lines) {
			this.lines[i].position.set(
				this.joints[this.lines[i].userData.from].position.x,
				this.joints[this.lines[i].userData.from].position.y,
				this.joints[this.lines[i].userData.from].position.z
			);

			this.lines[i].position.needsUpdate = true;
			// this.lines[i].geometry.attributes.position.array[0] =
			// 	this.joints[this.lines[i].userData.from].position.x;
			// this.lines[i].geometry.attributes.position.array[1] =
			// 	this.joints[this.lines[i].userData.from].position.y;
			// this.lines[i].geometry.attributes.position.array[2] =
			// 	this.joints[this.lines[i].userData.from].position.z;
			// this.lines[i].geometry.attributes.position.array[3] =
			// 	this.joints[this.lines[i].userData.to].position.x;
			// this.lines[i].geometry.attributes.position.array[4] =
			// 	this.joints[this.lines[i].userData.to].position.y;
			// this.lines[i].geometry.attributes.position.array[5] =
			// 	this.joints[this.lines[i].userData.to].position.z;
			// this.lines[i].geometry.attributes.position.needsUpdate = true;
		}
	}

	pose_array(landmark) {
		if (!landmark) {
			return;
		}

		for (let name in POSE_LANDMARKS) {
			if (landmark[POSE_LANDMARKS[name]]) {
				this.joints[name].position.set(
					landmark[POSE_LANDMARKS[name]][0] * -this.unit,
					landmark[POSE_LANDMARKS[name]][1] * -this.unit,
					landmark[POSE_LANDMARKS[name]][2] * -this.unit
				);
			}
		}

		this.update_lines();
	}

	pose_dict(landmark) {
		if (!landmark) {
			return;
		}

		for (let name in POSE_LANDMARKS) {
			if (
				landmark[POSE_LANDMARKS[name]] &&
				landmark[POSE_LANDMARKS[name]]["visibility"] > 0.5
			) {
				this.joints[name].position.set(
					landmark[POSE_LANDMARKS[name]]["x"] * -this.unit,
					landmark[POSE_LANDMARKS[name]]["y"] * -this.unit,
					landmark[POSE_LANDMARKS[name]]["z"] * -this.unit
				);
			}
		}

		this.update_lines();
	}
}
