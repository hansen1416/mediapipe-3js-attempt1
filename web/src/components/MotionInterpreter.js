import { useEffect } from "react";
import { Quaternion, Vector3, Matrix4 } from "three";

import {
	sleep,
	loadFBX,
	loadObj,
	traverseModel,
	getUpVectors,
	middlePosition,
	posePointsToVector,
	applyTransfer,
} from "./ropes";

export default function MotionInterpreter(props) {
	const { scene, camera, renderer, controls } = props;

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
			loadFBX(process.env.PUBLIC_URL + "/anims/basic-crunch.fbx"),
			// loadObj(process.env.PUBLIC_URL + "/json/BicycleCrunch.json"),
			// loadObj(process.env.PUBLIC_URL + "/json/KettlebellSwing.json"),
			// loadObj(process.env.PUBLIC_URL + "/json/AirSquat.json"),
			// loadObj(process.env.PUBLIC_URL + "/json/Clapping.json"),
			// loadObj(process.env.PUBLIC_URL + "/json/JumpingJacks.json"),
			// loadObj(process.env.PUBLIC_URL + "/json/PunchWalk.json"),
		]).then((results) => {
			const [model] = results;

			model.position.set(0, 0, 0);

			scene.current.add(model);

			const parts = {};
			const upVectors = {};

			// read attributes from the model
			traverseModel(model, parts);
			getUpVectors(model, upVectors);

			(async () => {
				const animation = model.animations[0].toJSON();

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

					if (
						item["type"] === "quaternion" ||
						(item["type"] === "vector" &&
							item["name"] === "Hips.position")
					) {
						tracks[item["name"]] = item;
					}
				}

				// play the animation, observe the vectors of differnt parts
				for (let i = 0; i < longestTrack; i++) {
					applyTransfer(parts, tracks, i);

					const matrix = getBasisFromModel(parts);

					for (let name in parts) {
						if (
							tracks[name + ".quaternion"] === undefined &&
							tracks[name + ".quaternion"]["states"] === undefined
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
			})();
		});
	}

	function getBasisFromModel(modelParts) {
		const leftshoulder = new Vector3();
		const rightshoulder = new Vector3();

		const hips = new Vector3();

		// modelParts["mixamorigLeftShoulder"].getWorldPosition(leftshoulder);
		// modelParts["mixamorigRightShoulder"].getWorldPosition(rightshoulder);

		modelParts["LeftShoulder"].getWorldPosition(leftshoulder);
		modelParts["RightShoulder"].getWorldPosition(rightshoulder);

		modelParts["Hips"].getWorldPosition(hips);

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
			</div>
		</div>
	);
}
