import { useEffect, useRef } from "react";
import { Quaternion, Vector3 } from "three";

import { loadFBX, loadObj } from "./ropes";

export default function MotionMaker(props) {
	const { scene, camera, renderer, controls } = props;

	const figure = useRef(null);

	const BicycleCrunchTracks = useRef(null);
	const BicycleCrunchIndex = useRef(-1);

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

			scene.current.add(figure.current);

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
			BicycleCrunchTracks.current = jsonObj["tracks"];

			animate();
		});
		// eslint-disable-next-line
	}, []);

	function animate() {
		requestAnimationFrame(animate);

		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		if (BicycleCrunchIndex.current >= 0) {
			BicycleCrunchIndex.current += 1;

			if (
				BicycleCrunchIndex.current >=
				BicycleCrunchTracks.current[0]["values"].length
			) {
				BicycleCrunchIndex.current = -1;
			}
		}

		renderer.current.render(scene.current, camera.current);
	}

	function playAnimation() {
		console.log(BicycleCrunchTracks.current, figure.current);

		BicycleCrunchIndex.current = 0;

		applyTransfer(figure.current);
	}

	function applyTransfer(model) {
		if (model && model.isBone) {
			for (let item of BicycleCrunchTracks.current) {
				const item_name = item["name"].split(".")[0];

				// console.log(model.name, item_name);

				if (model.name === item_name) {
					console.log(item_name);
					if (item["type"] === "vector") {
						model.position.set(
							item["vectors"][BicycleCrunchIndex.current].x,
							item["vectors"][BicycleCrunchIndex.current].y,
							item["vectors"][BicycleCrunchIndex.current].z
						);
					}

					if (item["type"] === "quaternion") {
						model.setRotationFromQuaternion(
							item["quaternions"][BicycleCrunchIndex.current]
						);
					}

					break;
				}
			}
		}
		// console.log(model, model.name, model.matrix);

		model.children.forEach((child) => {
			applyTransfer(child);
		});
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
