import { useEffect } from "react";
import { Quaternion, Vector3, Matrix4, MathUtils, Euler } from "three";
import { POSE_LANDMARKS } from "@mediapipe/pose";

import {
	sleep,
	loadFBX,
	loadObj,
	traverseModel,
	modelInheritGraph,
	getUpVectors,
	middlePosition,
	posePointsToVector,
	applyTransfer,
} from "./ropes";
import { poseArr } from "./BicycleCrunchPose";

export default function MotionInterpreter(props) {
	const { scene, camera, renderer, controls } = props;

	const threshold = MathUtils.degToRad(30);

	useEffect(() => {
		setTimeout(() => {
			animate();
		}, 0);

		// eslint-disable-next-line
	}, []);

	function animate() {
		requestAnimationFrame(animate);

		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	/**
	 * read the animation data
	 * add `states` for each body part
	 * `states` is the orientation of a body part at a time
	 */
	function interpretAnimation() {
		Promise.all([
			loadFBX(process.env.PUBLIC_URL + "/fbx/YBot.fbx"),
			// loadObj(process.env.PUBLIC_URL + "/json/BicycleCrunch.json"),
			// loadObj(process.env.PUBLIC_URL + "/json/KettlebellSwing.json"),
			// loadObj(process.env.PUBLIC_URL + "/json/AirSquat.json"),
			// loadObj(process.env.PUBLIC_URL + "/json/Clapping.json"),
			// loadObj(process.env.PUBLIC_URL + "/json/JumpingJacks.json"),
			loadObj(process.env.PUBLIC_URL + "/json/Waving.json"),
		]).then((results) => {
			const [model] = results;

			const animations = results.slice(1);

			model.position.set(0, -100, 0);

			const parts = {};
			const upVectors = {};
			const partsGraph = {};

			// read attributes from the model
			traverseModel(model, parts);
			getUpVectors(model, upVectors);
			modelInheritGraph(model, partsGraph);

			scene.current.add(model);

			console.log(model.animations[0]);

			(async () => {
				for (let animation of animations) {
					let longestTrack = 0;
					let tracks = {};

					// calculate quaternions and vectors for animation tracks
					for (let item of animation["tracks"]) {
						if (item["type"] === "quaternion") {
							const quaternions = [];
							for (let i = 0; i < item["values"].length; i += 4) {
								const q = new Quaternion(
									item["values"][i],
									item["values"][i + 1],
									item["values"][i + 2],
									item["values"][i + 3]
								);

								quaternions.push(q);
							}

							item["quaternions"] = quaternions;
							item["states"] = [];

							if (quaternions.length > longestTrack) {
								longestTrack = quaternions.length;
							}
						}

						if (item["type"] === "vector") {
							const vectors = [];
							for (let i = 0; i < item["values"].length; i += 3) {
								const q = new Vector3(
									item["values"][i],
									item["values"][i + 1],
									item["values"][i + 2]
								);

								vectors.push(q);
							}

							item["vectors"] = vectors;
						}

						tracks[item["name"]] = item;
					}

					// play the animation, observe the vectors of differnt parts

					for (let i = 0; i < longestTrack; i++) {
						applyTransfer(parts, tracks, i);

						const matrix = getBasisFromModel(parts);

						for (let name in parts) {
							if (
								tracks[name + ".quaternion"] === undefined &&
								tracks[name + ".quaternion"]["states"] ===
									undefined
							) {
								continue;
							}

							const q = new Quaternion();
							const v = upVectors[name].clone();

							parts[name].getWorldQuaternion(q);

							v.applyQuaternion(q);
							v.applyMatrix4(matrix);

							tracks[name + ".quaternion"]["states"].push(v);
						}

						await sleep(30);

						// break;
					}

					// todo, use API to save this animation to json file
					console.log(animation["name"], tracks);
				}
			})();
		});
	}

	function getBasisFromModel(modelParts) {
		const leftshoulder = new Vector3();
		const rightshoulder = new Vector3();

		const hips = new Vector3();

		modelParts["mixamorigLeftShoulder"].getWorldPosition(leftshoulder);
		modelParts["mixamorigRightShoulder"].getWorldPosition(rightshoulder);

		modelParts["mixamorigHips"].getWorldPosition(hips);

		// console.log(leftshoulder, rightshoulder, lefthip, righthip);

		const a = middlePosition(leftshoulder, rightshoulder, false);

		// console.log('a,b', a, b);

		const y_basis = posePointsToVector(hips, a, false).normalize();
		const x_basis = posePointsToVector(leftshoulder, a, false).normalize();
		const z_basis = new Vector3()
			.crossVectors(y_basis, x_basis)
			.normalize();

		const originBasis = new Matrix4().makeBasis(
			new Vector3(1, 0, 0),
			new Vector3(0, -1, 0),
			new Vector3(0, 0, 1)
		);

		return originBasis.multiply(
			new Matrix4().makeBasis(x_basis, y_basis, z_basis).invert()
		);
	}

	function syncAnimation(poseData) {
		for (let i in poseData) {
			for (let j in poseData[i]) {
				poseData[i][j][0] *= -1;
				poseData[i][j][1] *= -1;
				poseData[i][j][2] *= -1;
			}
		}

		// const leftThighTrack = [];
		// const rightThighTrack = [];

		Promise.all([
			loadFBX(process.env.PUBLIC_URL + "/fbx/YBot.fbx"),
			loadObj(process.env.PUBLIC_URL + "/json/BicycleCrunchTracks.json"),
		]).then(([model, jsonObj]) => {
			model.position.set(0, -100, 0);

			const parts = {};

			// read attributes from the model
			traverseModel(model, parts);

			scene.current.add(model);

			// return;

			let animationIndx = 0;

			(async () => {
				for (let indx in poseData) {
					const data = poseData[indx];

					// apply this matrix to restore vector to original basis
					const matrix = getBasisFromPose(data);

					const leftThighOrientation = posePointsToVector(
						data[POSE_LANDMARKS["RIGHT_KNEE"]],
						data[POSE_LANDMARKS["RIGHT_HIP"]]
					);
					const rightThighOrientation = posePointsToVector(
						data[POSE_LANDMARKS["LEFT_KNEE"]],
						data[POSE_LANDMARKS["LEFT_HIP"]]
					);

					leftThighOrientation.applyMatrix4(matrix);
					rightThighOrientation.applyMatrix4(matrix);

					// leftThighTrack.push(leftThighOrientation);
					// rightThighTrack.push(rightThighOrientation);

					if (
						animationIndx >=
						jsonObj["mixamorigLeftUpLeg.quaternion"]["states"]
							.length
					) {
						alert("motion finished");
						break;
					}

					const leftAnimStates =
						jsonObj["mixamorigLeftUpLeg.quaternion"]["states"][
							animationIndx
						];
					const rightAnimStates =
						jsonObj["mixamorigRightUpLeg.quaternion"]["states"][
							animationIndx
						];

					const leftDeviation = leftThighOrientation.angleTo(
						new Vector3(
							leftAnimStates.x,
							leftAnimStates.y,
							leftAnimStates.z
						)
					);
					const rightDeviation = rightThighOrientation.angleTo(
						new Vector3(
							rightAnimStates.x,
							rightAnimStates.y,
							rightAnimStates.z
						)
					);

					if (
						leftDeviation < threshold &&
						rightDeviation < threshold
					) {
						applyTransfer(parts, jsonObj, animationIndx);

						animationIndx += 1;
					}

					await sleep(30);
				}
			})();

			// console.log(leftThighTrack);
			// console.log(rightThighTrack);
		});
	}

	function getBasisFromPose(poseDataFrame) {
		const rightshoulder = new Vector3(
			...poseDataFrame[POSE_LANDMARKS["LEFT_SHOULDER"]]
		).normalize();
		const leftshoulder = new Vector3(
			...poseDataFrame[POSE_LANDMARKS["RIGHT_SHOULDER"]]
		).normalize();

		const righthip = new Vector3(
			...poseDataFrame[POSE_LANDMARKS["LEFT_HIP"]]
		).normalize();
		const lefthip = new Vector3(
			...poseDataFrame[POSE_LANDMARKS["RIGHT_HIP"]]
		).normalize();

		const a = middlePosition(leftshoulder, rightshoulder, false);
		const b = middlePosition(lefthip, righthip, false);

		const y_basis = posePointsToVector(a, b, false).normalize();
		const x_basis = posePointsToVector(lefthip, b, false).normalize();
		const z_basis = new Vector3()
			.crossVectors(x_basis, y_basis)
			.normalize();

		// console.log(x_basis, y_basis, z_basis);

		return new Matrix4().makeBasis(x_basis, y_basis, z_basis).invert();
	}

	return (
		<div>
			<div className="btn-box">
				<button
					onClick={() => {
						interpretAnimation();
					}}
				>
					Interpret Animation
				</button>
				<button
					onClick={() => {
						syncAnimation(poseArr);
					}}
				>
					Sync Animation
				</button>
			</div>
		</div>
	);
}
