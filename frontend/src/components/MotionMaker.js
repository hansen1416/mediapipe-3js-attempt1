import { useEffect, useRef } from "react";
import { Object3D, Quaternion, Vector3 } from "three";

import { loadFBX, loadObj, traverseModel, modelInheritGraph, getUpVectors } from "./ropes";
// import { TraverseModelNoChild } from "./ropes";

import { poseArr } from "./BicycleCrunchPose";

export default function MotionMaker(props) {
	const { scene, camera, renderer, controls } = props;

	const figure = useRef(null);

	const bodyParts = useRef({});
	const bodyPartsGraph = useRef({});
	const bodyPartsUpVectors = useRef({});

	const BicycleCrunchTracks = useRef({});
	const BicycleCrunchIndex = useRef(0);


	useEffect(() => {
		const modelpath =
			// process.env.PUBLIC_URL + "/fbx/XBot.fbx";
			process.env.PUBLIC_URL + "/fbx/YBot.fbx";

		Promise.all([
			loadFBX(modelpath),
			loadObj(process.env.PUBLIC_URL + "/json/BicycleCrunch.json"),
		]).then(([model, jsonObj]) => {
			figure.current = model;

			figure.current.position.set(0, -100, 0);

			traverseModel(figure.current, bodyParts.current);
			getUpVectors(figure.current, bodyPartsUpVectors.current);
			modelInheritGraph(figure.current, bodyPartsGraph.current);

			// console.log(bodyPartsGraph.current)

			scene.current.add(figure.current);

			// calculate quaternions and vectors for animation tracks
			for (let item of jsonObj["tracks"]) {

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
			}

			for (let v of jsonObj["tracks"]) {
				const name = v['name'].split('.')[0];

				BicycleCrunchTracks.current[name] = v;
			}

			getAnimationState(BicycleCrunchTracks.current, bodyPartsGraph.current, bodyPartsUpVectors.current);

			console.log(BicycleCrunchTracks.current['mixamorigLeftArm']);

			animate();
		});
		// eslint-disable-next-line
	}, []);

	function animate() {
		requestAnimationFrame(animate);

		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	function playAnimation() {

		applyTransfer();

		BicycleCrunchIndex.current += 1;
	}

	function applyTransfer() {

		for (let item of Object.values(BicycleCrunchTracks.current)) {

			const item_name = item["name"].split(".")[0];

			// if (item_name === 'mixamorigLeftArm') {
			// 	continue;
			// }

			// console.log(item_name, bodyParts.current[item_name]);

			if (item["type"] === "vector") {

				if (BicycleCrunchIndex.current < item["vectors"].length) {

					bodyParts.current[item_name].position.set(
						item["vectors"][BicycleCrunchIndex.current].x,
						item["vectors"][BicycleCrunchIndex.current].y,
						item["vectors"][BicycleCrunchIndex.current].z
					);
				} else {
					bodyParts.current[item_name].position.set(
						item["vectors"][item["vectors"].length - 1].x,
						item["vectors"][item["vectors"].length - 1].y,
						item["vectors"][item["vectors"].length - 1].z
					);
				}

				// bodyPartsNoChild.current[item_name].position.set(
				// 	item["vectors"][BicycleCrunchIndex.current].x,
				// 	item["vectors"][BicycleCrunchIndex.current].y,
				// 	item["vectors"][BicycleCrunchIndex.current].z
				// );
			}

			if (item["type"] === "quaternion") {

				if (BicycleCrunchIndex.current < item["quaternions"].length) {

					bodyParts.current[item_name].setRotationFromQuaternion(
					// bodyParts.current[item_name].applyQuaternion(
						item["quaternions"][BicycleCrunchIndex.current]
					);
				} else {
					bodyParts.current[item_name].setRotationFromQuaternion(
						// bodyParts.current[item_name].applyQuaternion(
							item["quaternions"][item["quaternions"].length-1]
						);
				}

				if (item_name === 'mixamorigLeftArm' || item_name === 'mixamorigLeftForeArm') {
					
					const q = new Quaternion();

					bodyParts.current[item_name].getWorldQuaternion(q);

					const v = new Vector3(0,1,0);

					v.applyQuaternion(q);

					console.log(v);
				}
			}
		}
	}


	function getAnimationState(animationTracks, inheritGraph, upVectors) {
		for (let [name, tracks] of Object.entries(animationTracks)) {

			if (tracks['type'] !== 'quaternion') {
				continue;
			}

			const states = []

			for (let i in tracks['quaternions']) {

				const v = upVectors[name].clone();

				for (let p = inheritGraph[name].length-1; p >= 0; p--) {
					const parent_name = inheritGraph[name][p];

					v.applyQuaternion(animationTracks[parent_name]['quaternions'][i]);
				}

				v.applyQuaternion(tracks['quaternions'][i]);

				states.push(v);
			}

			// console.log(name, tracks);

			// console.log(states);

			tracks['states'] = states
		}
	}

	return (
		<div>
			<div className="btn-box">
				<button
					onClick={() => {
						playAnimation();
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
