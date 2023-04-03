import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { clone } from "lodash";
import "../styles/css/MotionInterpreter.css";
import {
	applyTransfer,
	degreesToRadians,
	getUpVectors,
	loadGLTF,
	loadJSON,
	muscleGroupsColors,
	sleep,
	traverseModel,
} from "../components/ropes";

export default function MotionInterpreter() {
	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const animationPointer = useRef(0);

	const model = useRef(null);
	const [modelPosition, setmodelPosition] = useState({ x: 0, y: -1, z: 0 });
	const [modelRotation, setmodelRotation] = useState({ x: 0, y: 0, z: 0 });

	const allParts = [
		"abdominal",
		"chest",
		"leftArm",
		"leftForeArm",
		"rightArm",
		"rightForeArm",
		"leftThigh",
		"leftCalf",
		"rightThigh",
		"rightCalf",
	];
	const [keyParts, setkeyParts] = useState(clone(allParts));

	const allMuscleGroups = Object.keys(muscleGroupsColors);

	const [muscleGroups, setmuscleGroups] = useState([]);

	const animation_data = useRef(null);

	const [animationName, setanimationName] = useState("");
	const [animationKey, setanimationKey] = useState("");

	useEffect(() => {
		_scene(
			document.documentElement.clientWidth,
			document.documentElement.clientHeight
		);

		Promise.all([loadGLTF(process.env.PUBLIC_URL + "/glb/dors.glb")]).then(
			([glb]) => {
				model.current = glb.scene.children[0];
				model.current.position.set(
					modelPosition.x,
					modelPosition.y,
					modelPosition.z
				);

				// store all limbs to `mannequinModel`
				// traverseModel(model.current, figureParts.current);

				// console.log(Object.keys(figureParts.current));

				scene.current.add(model.current);

				animate();
			}
		);

		// interpretAnimation();

		return () => {
			cancelAnimationFrame(animationPointer.current);

			controls.current.dispose();
			renderer.current.dispose();
		};
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (model.current) {
			model.current.position.set(
				modelPosition.x,
				modelPosition.y,
				modelPosition.z
			);
		}
	}, [modelPosition]);

	useEffect(() => {
		if (model.current) {
			model.current.rotation.set(
				degreesToRadians(modelRotation.x),
				degreesToRadians(modelRotation.y),
				degreesToRadians(modelRotation.z)
			);
		}
	}, [modelRotation]);

	useEffect(() => {
		if (animation_data.current) {
			animation_data.current["display_name"] = animationName;
		}
	}, [animationName]);

	useEffect(() => {
		if (animation_data.current) {
			animation_data.current["name"] = animationKey;
		}
	}, [animationKey]);

	function _scene(viewWidth, viewHeight) {
		scene.current = new THREE.Scene();

		/**
		 * The first attribute is the field of view.
		 * FOV is the extent of the scene that is seen on the display at any given moment.
		 * The value is in degrees.
		 *
		 * The second one is the aspect ratio.
		 * You almost always want to use the width of the element divided by the height,
		 * or you'll get the same result as when you play old movies on a widescreen TV
		 * - the image looks squished.
		 *
		 * The next two attributes are the near and far clipping plane.
		 * What that means, is that objects further away from the camera
		 * than the value of far or closer than near won't be rendered.
		 * You don't have to worry about this now,
		 * but you may want to use other values in your apps to get better performance.
		 */
		camera.current = new THREE.PerspectiveCamera(
			75,
			viewWidth / viewHeight,
			0.1,
			1000
		);

		camera.current.position.set(0, 0, 2);

		{
			// mimic the sun light
			const dlight = new THREE.PointLight(0xffffff, 0.4);
			dlight.position.set(0, 10, 10);
			scene.current.add(dlight);
			// env light
			scene.current.add(new THREE.AmbientLight(0xffffff, 0.6));
		}

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
			alpha: true,
			antialias: true,
		});

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		renderer.current.setSize(viewWidth, viewHeight);
	}

	function animate() {
		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function interpretAnimation() {
		const parts = {};
		const upVectors = {};

		// read attributes from the model
		traverseModel(model.current, parts);
		// get initial vector from the model
		getUpVectors(model.current, upVectors);

		(async () => {
			let longestTrack = 0;
			let tracks = {};

			// calculate quaternions and vectors for animation tracks
			for (let item of animation_data.current["tracks"]) {
				if (item["type"] === "quaternion") {
					const quaternions = [];
					for (let i = 0; i < item["values"].length; i += 4) {
						const q = new THREE.Quaternion(
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
						const q = new THREE.Vector3(
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
						item["name"] === "root.position")
				) {
					tracks[item["name"]] = item;
				}
			}

			// get joints positions, for later analysis
			const joints_position = {};

			// play the animation, observe the vectors of differnt parts
			for (let i = 0; i < longestTrack; i++) {
				applyTransfer(parts, tracks, i);

				// const matrix = getBasisFromModel(parts);

				// torso_positions.push(getTorseBasis(parts));

				for (let name in parts) {
					if (
						tracks[name + ".quaternion"] === undefined &&
						tracks[name + ".quaternion"]["states"] === undefined
					) {
						continue;
					}

					// const q = new THREE.Quaternion();
					// const v = upVectors[name].clone();

					// parts[name].getWorldQuaternion(q);

					// v.applyQuaternion(q);
					// // v.applyMatrix4(matrix);

					// tracks[name + ".quaternion"]["states"].push(v);

					const v = new THREE.Vector3();

					parts[name].getWorldPosition(v);

					if (!joints_position[name]) {
						joints_position[name] = [];
					}

					joints_position[name].push([v.x, v.y, v.z]);
				}

				await sleep(16);

				// break;
			}

			animation_data.current["tracks"] = Object.values(tracks);

			animation_data.current["rotation"] = modelRotation;
			animation_data.current["position"] = modelPosition;
			animation_data.current["key_parts"] = keyParts;
			animation_data.current["muscle_groups"] = muscleGroups;
			animation_data.current["joints_position"] = joints_position;

			// todo, use API to save this animation to json file
			console.log(animation_data.current["name"], animation_data.current);
		})();
	}

	/***************** */
	// function getTorseBasis(bones) {
	// 	const leftshoulder = new THREE.Vector3();

	// 	bones["upperarm_l"].getWorldPosition(leftshoulder);

	// 	const rightshoulder = new THREE.Vector3();

	// 	bones["upperarm_r"].getWorldPosition(rightshoulder);

	// 	const pelvis = new THREE.Vector3();

	// 	bones["pelvis"].getWorldPosition(pelvis);

	// 	return [leftshoulder, rightshoulder, pelvis];
	// }
	/***************** */

	// function getBasisFromModel(bones) {
	// 	const leftshoulder = new THREE.Vector3();

	// 	bones["upperarm_l"].getWorldPosition(leftshoulder);

	// 	const rightshoulder = new THREE.Vector3();

	// 	bones["upperarm_r"].getWorldPosition(rightshoulder);

	// 	const pelvis = new THREE.Vector3();

	// 	bones["pelvis"].getWorldPosition(pelvis);

	// 	const x_basis = rightshoulder.sub(leftshoulder);
	// 	const y_tmp = pelvis.sub(leftshoulder);
	// 	const z_basis = new THREE.Vector3()
	// 		.crossVectors(x_basis, y_tmp)
	// 		.normalize();

	// 	const y_basis = new THREE.Vector3()
	// 		.crossVectors(x_basis, z_basis)
	// 		.normalize();

	// 	return new THREE.Matrix4()
	// 		.makeBasis(x_basis, y_basis, z_basis)
	// 		.invert();
	// }

	return (
		<div className="interpreter" ref={containerRef}>
			<canvas ref={canvasRef}></canvas>
			<div className="controls" style={{ color: "#fff" }}>
				<div className="block grenze">
					<label>
						file:
						<input
							type={"file"}
							onChange={(e) => {
								/**
								 * read the animation data
								 * add `states` for each body part
								 * `states` is the orientation of a body part at a time
								 */
								loadJSON(
									URL.createObjectURL(e.target.files[0])
								).then((data) => {
									animation_data.current = data;

									setanimationName(data.name);
									setanimationKey(data.name);

									interpretAnimation();
								});
							}}
						/>
					</label>
				</div>
				<div className="block grenze">
					<label>
						name:
						<input
							type={"text"}
							style={{
								width: 80,
								height: 20,
							}}
							value={animationName}
							onChange={(e) => {
								setanimationName(e.target.value);
							}}
						/>
					</label>
				</div>
				<div className="block grenze">
					<label>
						key:
						<input
							type={"text"}
							style={{
								width: 80,
								height: 20,
							}}
							value={animationKey}
							onChange={(e) => {
								setanimationKey(e.target.value);
							}}
						/>
					</label>
				</div>
				<div className="block grenze">
					<span>Position: </span>
					{["x", "y", "z"].map((axis) => {
						return (
							<label key={axis}>
								{axis}
								<input
									type={"text"}
									style={{
										width: 30,
										height: 20,
									}}
									value={modelPosition[axis]}
									onChange={(e) => {
										const tmp = clone(modelPosition);

										tmp[axis] = e.target.value;

										setmodelPosition(tmp);
									}}
								/>
							</label>
						);
					})}
				</div>
				<div className="block grenze">
					<span>Rotation: </span>
					{["x", "y", "z"].map((axis) => {
						return (
							<label key={axis}>
								{axis}
								<input
									type={"text"}
									style={{
										width: 30,
										height: 20,
									}}
									value={modelRotation[axis]}
									onChange={(e) => {
										const tmp = clone(modelRotation);

										tmp[axis] = e.target.value;

										setmodelRotation(tmp);
									}}
								/>
							</label>
						);
					})}
				</div>
				<div className="block grenze">
					<span>Key parts: </span>
					{allParts.map((item) => {
						return (
							<label key={item}>
								{item}
								<input
									type={"checkbox"}
									checked={keyParts.indexOf(item) !== -1}
									onChange={(e) => {
										let tmp = clone(keyParts);

										if (e.target.checked) {
											tmp.push(item);
										} else {
											tmp = tmp.filter((x) => x !== item);
										}

										setkeyParts(tmp);
									}}
								/>
							</label>
						);
					})}
				</div>
				<div className="block grenze">
					<span>Muscles: </span>
					{allMuscleGroups.map((item) => {
						return (
							<label key={item}>
								{item}:
								<input
									type={"text"}
									style={{
										width: 40,
										height: 20,
									}}
									checked={muscleGroups.indexOf(item) !== -1}
									onChange={(e) => {
										let tmp = clone(muscleGroups);

										if (e.target.checked) {
											tmp.push(item);
										} else {
											tmp = tmp.filter((x) => x !== item);
										}

										setmuscleGroups(tmp);
									}}
								/>
							</label>
						);
					})}
				</div>
				<div className="block">
					<button onClick={interpretAnimation}>
						Interpret Again
					</button>
				</div>
			</div>
		</div>
	);
}
