import * as THREE from "three";
import { POSE_LANDMARKS } from "@mediapipe/pose";
import { joints } from "../ropes";

export class MatchManFigure {
	constructor(scene, figure_position, figure_rotation) {
		this.basicMaterial = new THREE.MeshBasicMaterial({
			color: 0x33eeb0,
		});

		this.lineMaterial = new THREE.LineBasicMaterial({ color: 0x33eeb0 });

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
			["LEFT_SHOULDER", "RIGHT_SHOULDER"],
			["LEFT_SHOULDER", "LEFT_ELBOW"],
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

		this.draw_lines()
	}

	draw_lines() {
		for (let jc in this.joints_connect) {
			const points = [];

			points.push(this.joints[this.joints_connect[jc][0]].position);
			points.push(this.joints[this.joints_connect[jc][1]].position);

			// points.push(new THREE.Vector3(-10, 0, 0));
			// points.push(new THREE.Vector3(0, 10, 0));
			// points.push(new THREE.Vector3(10, 0, 0));

			// console.log(points);

			const geometry = new THREE.BufferGeometry().setFromPoints(points);

			geometry.setDrawRange( 0, 2 );

			const line = new THREE.Line(geometry, this.lineMaterial);

			// line.userData.from = this.joints_connect[jc][0]
			// line.userData.to = this.joints_connect[jc][1]

			this.lines.push(line);

			this.group.add(line);

			// this.scene.add(line);
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

		for (let i in this.lines) {
			
			this.lines[i].geometry.attributes.position.needsUpdate = true;

			console.log(this.lines[i]);
		}
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

		for (let i in this.lines) {
			
			this.lines[i].geometry.attributes.position.needsUpdate = true;

			console.log(this.lines[i]);
		}
	}
}
