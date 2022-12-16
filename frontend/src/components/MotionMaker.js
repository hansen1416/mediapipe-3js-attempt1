import { useEffect } from "react";
import { Quaternion, Vector3, Matrix4 } from "three";

import { sleep, loadFBX, loadObj, traverseModel, modelInheritGraph, getUpVectors, middlePosition, posePointsToVector } from "./ropes";
// import { TraverseModelNoChild } from "./ropes";

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

					// todo, save this animation to json file
					// console.log(animation, tracks);

					break;
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


	// function getAnimationState(animationTracks, inheritGraph, upVectors) {
	// 	for (let [name, tracks] of Object.entries(animationTracks)) {

	// 		if (tracks['type'] !== 'quaternion') {
	// 			continue;
	// 		}

	// 		const states = []

	// 		for (let i in tracks['quaternions']) {

	// 			const v = upVectors[name].clone();

	// 			for (let p = inheritGraph[name].length-1; p >= 0; p--) {
	// 				const parent_name = inheritGraph[name][p];

	// 				v.applyQuaternion(animationTracks[parent_name]['quaternions'][i]);
	// 			}

	// 			v.applyQuaternion(tracks['quaternions'][i]);

	// 			states.push(v);
	// 		}

	// 		// console.log(name, tracks);

	// 		// console.log(states);

	// 		tracks['states'] = states
	// 	}
	// }

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
				<button onClick={() => {}}>action2</button>
				<button onClick={() => {}}>BicycleCrunch</button>
			</div>
		</div>
	);
}
