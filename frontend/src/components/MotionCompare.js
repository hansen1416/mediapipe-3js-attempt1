import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Group } from "three";
import { loadObj } from "./ropes";

import { poseArr, leftThighTrack, rightThighTrack } from "./BicycleCrunchPose";

export default function MotionCompare(props) {
	const { scene, camera, renderer, controls } = props;

	const group = useRef(null);

	useEffect(() => {
		// poseBasis();

		loadObj(process.env.PUBLIC_URL + "/json/BicycleCrunchTracks.json").then(
			(jsonObj) => {
				for (let name in jsonObj) {
					if (name === "mixamorigLeftUpLeg.quaternion") {
						plotAnimation(jsonObj[name]["states"], 0xff0000);
					}

					if (name === "mixamorigRightUpLeg.quaternion") {
						plotAnimation(jsonObj[name]["states"], 0x00ff00);
					}
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
		for (let v of values) {
			// console.log(v);
			const d = dots(color);

			d.position.set(v.x, v.y, v.z);

			group.current.add(d);
		}
	}

	function plotPose() {
		for (let i in leftThighTrack) {
			const leftpos = leftThighTrack[i];
			const rightpos = rightThighTrack[i];

			console.log(leftpos);

			const dl = dots(0xff0000);

			dl.position.set(leftpos.x, leftpos.y, leftpos.z);

			const dr = dots(0x00ff00);

			dr.position.set(rightpos.x, rightpos.y, rightpos.z);

			group.current.add(dl);
			group.current.add(dr);
		}
	}

	return <div></div>;
}
