import * as THREE from "three";
import { POSE_LANDMARKS } from "@mediapipe/pose";
import { posePointsToVector, quaternionFromVectors } from "../ropes";
import { BodyGeometry } from "./BodyGeometry";

export class CustomManFigure extends BodyGeometry {
	constructor(scene, figure_position, figure_rotation) {
		super();
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
		this.pose_position_scale = 4;
		// this.unit_size = 0.1;
		this.joints_size = 0.05;

		this.joints = {};

		this.joints_connect = [
			["LEFT_SHOULDER", "RIGHT_SHOULDER", 1.2381028532000913, ""],
			["LEFT_SHOULDER", "LEFT_ELBOW", 1.1247838311094145, "left_arm"],
			["LEFT_ELBOW", "LEFT_WRIST", 0.8123971126504467, ""],
			["RIGHT_SHOULDER", "RIGHT_ELBOW", 1.1247838311094145, ""],
			["RIGHT_ELBOW", "RIGHT_WRIST", 0.8123971126504467, ""],
			["LEFT_SHOULDER", "LEFT_HIP", 1.9537422593811369, ""],
			["RIGHT_SHOULDER", "RIGHT_HIP", 1.9537422593811369, ""],
			["LEFT_HIP", "LEFT_KNEE", 1.7646879068238623, ""],
			["LEFT_KNEE", "LEFT_ANKLE", 1.4876400546972346, ""],
			["RIGHT_HIP", "RIGHT_KNEE", 1.4388785699684465, ""],
			["RIGHT_KNEE", "RIGHT_ANKLE", 1.7573154865681548, ""],
		];

		this.parts = [];

		this.limb_rotation_vectors = {};

		for (let i in this.joints_connect) {
			this.limb_rotation_vectors[
				this.joints_connect[i][0] + this.joints_connect[i][1]
			] = new THREE.Vector3(0, 1, 0);
		}
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

		this.draw_figure();
	}

	draw_figure() {
		for (let jc in this.joints_connect) {
			const group = new THREE.Group();

			const points = [];

			points.push(new THREE.Vector3(0, 0, 0));
			points.push(new THREE.Vector3(0, this.joints_connect[jc][2], 0));

			if (typeof this[this.joints_connect[jc][3]] === "function") {
				// run limbs geometry functions
				const tissue = this[this.joints_connect[jc][3]](
					this.joints_connect[jc][2]
				);

				group.add(tissue);

				// tissue.position.y = -1 * this.joints_connect[jc][2];
			}

			this.group.add(group);

			group.userData.from = this.joints_connect[jc][0];
			group.userData.to = this.joints_connect[jc][1];

			group.position.set(
				this.joints[this.joints_connect[jc][0]].position
			);

			this.parts.push(group);
		}
	}

	left_arm(size) {
		const unit_size = 0.1;

		const group = new THREE.Group();

		group.add(this.bufferGeo(0xf1c27d, this.deltoid(unit_size)));
		group.add(this.bufferGeo(0xf1c27d, this.bicep(unit_size)));

		return group;
	}

	update_lines() {
		for (let i in this.parts) {
			this.parts[i].position.set(
				this.joints[this.parts[i].userData.from].position.x,
				this.joints[this.parts[i].userData.from].position.y,
				this.joints[this.parts[i].userData.from].position.z
			);

			this.parts[i].position.needsUpdate = true;

			const target_vector = posePointsToVector(
				this.joints[this.parts[i].userData.from].position,
				this.joints[this.parts[i].userData.to].position
			);

			const quaternion = quaternionFromVectors(
				this.limb_rotation_vectors[
					this.parts[i].userData.from + this.parts[i].userData.to
				],
				target_vector
			);

			this.parts[i].applyQuaternion(quaternion);

			this.limb_rotation_vectors[
				this.parts[i].userData.from + this.parts[i].userData.to
			] = target_vector;
		}
	}

	pose_array(landmark) {
		if (!landmark) {
			return;
		}

		for (let name in POSE_LANDMARKS) {
			if (landmark[POSE_LANDMARKS[name]]) {
				this.joints[name].position.set(
					landmark[POSE_LANDMARKS[name]][0] *
						-this.pose_position_scale,
					landmark[POSE_LANDMARKS[name]][1] *
						-this.pose_position_scale,
					landmark[POSE_LANDMARKS[name]][2] *
						-this.pose_position_scale
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
					landmark[POSE_LANDMARKS[name]]["x"] *
						-this.pose_position_scale,
					landmark[POSE_LANDMARKS[name]]["y"] *
						-this.pose_position_scale,
					landmark[POSE_LANDMARKS[name]]["z"] *
						-this.pose_position_scale
				);
			}
		}

		this.update_lines();
	}
}
