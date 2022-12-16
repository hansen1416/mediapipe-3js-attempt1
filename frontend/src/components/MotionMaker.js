import { useEffect } from "react";
import { Quaternion, Vector3, Matrix4 } from "three";
import { POSE_LANDMARKS } from "@mediapipe/pose";

import { sleep, loadFBX, loadObj, traverseModel, modelInheritGraph, getUpVectors, middlePosition, posePointsToVector } from "./ropes";
import { poseArr } from "./BicycleCrunchPose";

export default function MotionMaker(props) {
	const { scene, camera, renderer, controls } = props;

	// const figure = useRef(null);

	// const bodyParts = useRef({});
	// const bodyPartsGraph = useRef({});
	// const bodyPartsUpVectors = useRef({});

	// const BicycleCrunchTracks = useRef({});
	// const BicycleCrunchIndex = useRef(0);


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

	// function playAnimation() {

	// 	applyTransfer(bodyParts.current, BicycleCrunchTracks.current, BicycleCrunchIndex.current);

	// 	BicycleCrunchIndex.current += 1;
	// }

	function applyTransfer(model, animation, indx) {

		for (let item of Object.values(animation)) {

			const item_name = item["name"].split(".")[0];

			if (item["type"] === "vector") {

				if (indx < item["vectors"].length) {

					model[item_name].position.set(
						item["vectors"][indx].x,
						item["vectors"][indx].y,
						item["vectors"][indx].z
					);
				} else {
					model[item_name].position.set(
						item["vectors"][item["vectors"].length - 1].x,
						item["vectors"][item["vectors"].length - 1].y,
						item["vectors"][item["vectors"].length - 1].z
					);
				}
			}

			if (item["type"] === "quaternion") {

				if (indx < item["quaternions"].length) {

					model[item_name].setRotationFromQuaternion(
					// bodyParts.current[item_name].applyQuaternion(
						item["quaternions"][indx]
					);
				} else {
					model[item_name].setRotationFromQuaternion(
						// bodyParts.current[item_name].applyQuaternion(
							item["quaternions"][item["quaternions"].length-1]
						);
				}
			}
		}
	}

	function interpretAnimation() {

		Promise.all([
			loadFBX(process.env.PUBLIC_URL + "/fbx/YBot.fbx"),
			loadObj(process.env.PUBLIC_URL + "/json/BicycleCrunch.json"),
			loadObj(process.env.PUBLIC_URL + "/json/KettlebellSwing.json"),
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

						tracks[item['name']] = item;
					}

					// play the animation, observe the vectors of differnt parts
					
					for (let i = 0; i < longestTrack; i++) {
						
						applyTransfer(parts, tracks, i);

						const matrix = getBasisFromModel(parts);

						for (let name in parts) {

							if (tracks[name + '.quaternion'] === undefined 
							&& tracks[name + '.quaternion']['states'] === undefined) {
								continue;
							}

							const q = new Quaternion();
							const v = upVectors[name].clone();

							parts[name].getWorldQuaternion(q);

							v.applyQuaternion(q);
							v.applyMatrix4(matrix);

							tracks[name + '.quaternion']['states'].push(v);
						}

						await sleep(30);

						// break;
					}

					// todo, use API to save this animation to json file
					console.log(tracks);
				}
			})();

			// for (let v of jsonObj["tracks"]) {
			// 	const name = v['name'].split('.')[0];

			// 	BicycleCrunchTracks.current[name] = v;
			// }

			// getAnimationState(BicycleCrunchTracks.current, bodyPartsGraph.current, bodyPartsUpVectors.current);

			// console.log(BicycleCrunchTracks.current['mixamorigLeftArm']);

			
		});
	}

	function getBasisFromModel(modelParts) {

		const leftshoulder = new Vector3();
		const rightshoulder = new Vector3();

		const lefthip = new Vector3();
		const righthip = new Vector3();

		modelParts['mixamorigLeftShoulder'].getWorldPosition(leftshoulder);
		modelParts['mixamorigRightShoulder'].getWorldPosition(rightshoulder);

		modelParts['mixamorigLeftUpLeg'].getWorldPosition(lefthip);
		modelParts['mixamorigRightUpLeg'].getWorldPosition(righthip);
		
		// console.log(leftshoulder, rightshoulder, lefthip, righthip);

		const a = middlePosition(leftshoulder, rightshoulder, false);
		const b = middlePosition(lefthip, righthip, false);

		// console.log('a,b', a, b);

		const y_basis = posePointsToVector(a, b, false).normalize();
		const x_basis = posePointsToVector(lefthip, b, false).normalize();
		const z_basis = new Vector3().crossVectors(x_basis, y_basis).normalize();

		return new Matrix4().makeBasis(x_basis, y_basis, z_basis).invert();

		// return new Quaternion().setFromRotationMatrix(matrix);
	}

	function syncAnimation(poseData) {

		for (let i in poseData) {
			for (let j in poseData[i]) {
				poseData[i][j][0] *= -1;
				poseData[i][j][1] *= -1;
				poseData[i][j][2] *= -1;
			}
		}

		const leftThighTrack = [];
		const rightThighTrack = [];

		for (let indx in poseData) {
			const data = poseData[indx];
		
			// apply this matrix to restore vector to original basis
			const matrix = getBasisFromPose(data);

			const leftThighOrientation = posePointsToVector(data[POSE_LANDMARKS['RIGHT_KNEE']], data[POSE_LANDMARKS['RIGHT_HIP']]);
			const rightThighOrientation = posePointsToVector(data[POSE_LANDMARKS['LEFT_KNEE']], data[POSE_LANDMARKS['LEFT_HIP']]);

			leftThighOrientation.applyMatrix4(matrix);
			rightThighOrientation.applyMatrix4(matrix);

			leftThighTrack.push(leftThighOrientation);
			rightThighTrack.push(rightThighOrientation);
		}

		console.log(leftThighTrack);
		console.log(rightThighTrack);
	}

	function getBasisFromPose(poseDataFrame) {
		const rightshoulder = new Vector3(...poseDataFrame[POSE_LANDMARKS['LEFT_SHOULDER']]).normalize();
		const leftshoulder = new Vector3(...poseDataFrame[POSE_LANDMARKS['RIGHT_SHOULDER']]).normalize();

		const righthip = new Vector3(...poseDataFrame[POSE_LANDMARKS['LEFT_HIP']]).normalize();
		const lefthip = new Vector3(...poseDataFrame[POSE_LANDMARKS['RIGHT_HIP']]).normalize();

		const a = middlePosition(leftshoulder, rightshoulder, false);
		const b = middlePosition(lefthip, righthip, false);

		const y_basis = posePointsToVector(a, b, false).normalize();
		const x_basis = posePointsToVector(lefthip, b, false).normalize();
		const z_basis = new Vector3().crossVectors(x_basis, y_basis).normalize();

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
					action1
				</button>
				<button onClick={() => {
					syncAnimation(poseArr);
				}}>action2</button>
				<button onClick={() => {}}>BicycleCrunch</button>
			</div>
		</div>
	);
}
