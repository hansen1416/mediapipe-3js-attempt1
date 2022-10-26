import * as THREE from "three";
import { POSE_LANDMARKS } from "@mediapipe/pose";
import { joints } from "../ropes";

export class MatchManFigure {
	constructor(scene, figure_position, figure_rotation) {
		this.basicMaterial = new THREE.MeshBasicMaterial({
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
		this.unit = 4;

		this.joints_size = 0.05;

		this.joints = {};
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
	}
}
