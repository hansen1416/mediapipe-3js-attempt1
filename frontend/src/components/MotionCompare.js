import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Group, Vector3, Quaternion } from "three";
import { POSE_LANDMARKS } from "@mediapipe/pose";
import { loadObj, posePointsToVector } from "./ropes";

import { poseArr } from "./BicycleCrunchPose";

export default function MotionCompare(props) {
	const { scene, camera, renderer, controls } = props;

	const group = useRef(null);

	const q_anim_base = new Quaternion(
		0.8030151724815369,
		-0.08034972101449966,
		0.013864071108400822,
		0.5903544425964355
	);

	const q_pose_basis = new Quaternion(
		0.3675069799125073,
		-0.4527697552429361,
		-0.628234812694589,
		0.5150331917181983
	);

	useEffect(() => {
		// poseBasis();

		loadObj(process.env.PUBLIC_URL + "/json/BicycleCrunch.json").then(
			(jsonObj) => {
				for (let item of jsonObj["tracks"]) {
					// if (item['name'] === 'mixamorigHips.quaternion'){

					//     for (let i = 0; i < item['values'].length; i+=4) {
					//         const q = new THREE.Quaternion(item['values'][i], item['values'][i+1], item['values'][i+2], item['values'][i+3]);

					//         // const e = new THREE.Euler().setFromQuaternion(q)

					//         console.log(q);
					//     }
					// }

					if (item["name"] === "mixamorigLeftUpLeg.quaternion") {
						plotAnimation(item["values"], 0xff0000);
					}

					// if (item['name'] === 'mixamorigLeftLeg.quaternion') {
					//     plotAnimation(item['values'], 0xffa500);
					// }

					if (item["name"] === "mixamorigRightUpLeg.quaternion") {
						plotAnimation(item["values"], 0xffff00);
					}

					// if (item['name'] === 'mixamorigRightLeg.quaternion') {
					//     plotAnimation(item['values'], 0x008000);
					// }

					// --------

					// if (item['name'] === 'mixamorigLeftArm.quaternion') {
					//     plotAnimation(item['values'], 0x00ffff);
					// }

					// if (item['name'] === 'mixamorigLeftForeArm.quaternion') {
					//     plotAnimation(item['values'], 0x0000ff);
					// }

					// if (item['name'] === 'mixamorigRightArm.quaternion') {
					//     plotAnimation(item['values'], 0x800080);
					// }

					// if (item['name'] === 'mixamorigRightForeArm.quaternion') {
					//     plotAnimation(item['values'], 0xffffff);
					// }
				}
			}
		);

		// we need to wait for the contructor in `ThreeJsScene`
		// cause `useRef`
		setTimeout(() => {
			// from mediapipe coords system to threejs system
			// maybe also need to flip left/right
			for (let i in poseArr) {
				for (let j in poseArr[i]) {
					poseArr[i][j][0] *= -1;
					poseArr[i][j][1] *= -1;
					poseArr[i][j][2] *= -1;
				}
			}

			camera.current.position.set(0, 0, 10);

			group.current = new Group();

			const scale = 5;
			group.current.scale.set(scale, scale, scale);

			scene.current.add(group.current);

			plotPose();

			animate();
		}, 0);
	}, []);

	function animate() {
		requestAnimationFrame(animate);

		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	function dots(color = 0x33eeb0, size = 0.02) {
		return new THREE.Mesh(
			new THREE.BoxGeometry(size, size, size),
			new THREE.MeshBasicMaterial({ color: color })
		);
	}

	function plotAnimation(values, color) {
		for (let i = 0; i < values.length; i += 4) {
			const q = new THREE.Quaternion(
				values[i],
				values[i + 1],
				values[i + 2],
				values[i + 3]
			);

			q.multiply(q_anim_base);

			// note that we assume the up vetor is always (0,1,0)
			const v = new THREE.Vector3(0, 1, 0).applyQuaternion(q);

			// v.applyQuaternion(q_anim_base)

			// console.log(v);
			const d = dots(color);

			d.position.set(v.x, v.y, v.z);

			group.current.add(d);
		}
	}

	function poseBasis() {
		const data = poseArr[0];

		const v01 = new THREE.Vector3(-1, 0, 0);
		const v02 = new THREE.Vector3(0.2, 1, 0).normalize();

		const cross01 = new THREE.Vector3().crossVectors(v01, v02).normalize();
		const cross02 = new THREE.Vector3()
			.crossVectors(cross01, v01)
			.normalize();

		const vt1 = posePointsToVector(
			data[POSE_LANDMARKS["LEFT_HIP"]],
			data[POSE_LANDMARKS["RIGHT_HIP"]]
		).normalize();
		const vt2 = posePointsToVector(
			data[POSE_LANDMARKS["RIGHT_SHOULDER"]],
			data[POSE_LANDMARKS["RIGHT_HIP"]]
		).normalize();

		const cross11 = new THREE.Vector3().crossVectors(vt1, vt2).normalize();
		const cross12 = new THREE.Vector3()
			.crossVectors(cross11, vt1)
			.normalize();

		const SE0 = new THREE.Matrix4().makeBasis(v01, cross01, cross02);
		const SE1 = new THREE.Matrix4().makeBasis(vt1, cross11, cross12);

		const q_local = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

		console.log(q_local);
	}

	function plotPose() {
		const joints = [
			["LEFT_HIP", "LEFT_KNEE", 0xff0000],
			// ['LEFT_KNEE', 'LEFT_ANKLE', 0xffa500],
			["RIGHT_HIP", "RIGHT_KNEE", 0xffff00],
			// ['RIGHT_KNEE', 'RIGHT_ANKLE', 0x008000],
			// ['LEFT_SHOULDER', 'LEFT_ELBOW', 0x00ffff], ['LEFT_ELBOW', 'LEFT_WRIST', 0x0000ff],
			// ['RIGHT_SHOULDER', 'RIGHT_ELBOW', 0x800080], ['RIGHT_ELBOW', 'RIGHT_WRIST', 0xffffff]
		];

		// let counter = 0;

		for (let j of joints) {
			for (let landmark of poseArr) {
				const pos = posePointsToVector(
					landmark[POSE_LANDMARKS[j[1]]],
					landmark[POSE_LANDMARKS[j[0]]]
				);

				pos.applyQuaternion(q_pose_basis);

				const d = dots(j[2]);

				d.position.set(pos.x, pos.y, pos.z);

				group.current.add(d);

				// counter += 1;

				// if (counter > 50) {

				//     counter = 0;
				//     break;
				// }
			}
		}
	}

	return <div></div>;
}
