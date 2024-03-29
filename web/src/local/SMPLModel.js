import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import Button from "react-bootstrap/Button";
import { cloneDeep } from "lodash";

import {
	loadJSON,
	loadFBX,
	traverseModel,
	applyTransfer,
	sleep,
} from "../components/ropes";

export default function SMPLModel() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const fileInput = useRef(null);

	// an integer number, used for cancelAnimationFrame
	const animationPointer = useRef(0);
	// const counter = useRef(0);
	const clearAnimation = useRef(false);

	const model = useRef(null);
	const figureParts = useRef({});

	const [rotations, setrotations] = useState([]);

	// const mixer = useRef(null);
	// const clock = new THREE.Clock();

	useEffect(() => {
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		// scene take entire screen
		creatMainScene(documentWidth, documentHeight);

		Promise.all([loadFBX(process.env.PUBLIC_URL + "/smpl.fbx")]).then(
			([fbx]) => {
				// poseDetector.current = detector;

				// add 3d model to main scene
				model.current = fbx;
				model.current.position.set(0, 0, 0);
				model.current.rotation.set(3.14, 0, 0);

				// store all limbs to `model`
				traverseModel(model.current, figureParts.current);

				console.log(figureParts.current);

				setrotations([
					["root", 1.57, 0, 0],
					["pelvis", 0, 0, 0],
					["spine1", 0, 0, 0],
					["spine2", 0, 0, 0],
					["spine3", 0, 0, 0],
					["right_collar", 0, 0, 0],
					["right_shoulder", 0, 0, 0],
					["right_elbow", 0, 0, 0],
					["right_wrist", 0, 0, 0],
					// ["right_ring1", 0, 0, 0],
					// ["right_ring2", 0, 0, 0],
					// ["right_ring3", 0, 0, 0],
					// ["right_pinky1", 0, 0, 0],
					// ["right_pinky2", 0, 0, 0],
					// ["right_pinky3", 0, 0, 0],
					// ["right_index1", 0, 0, 0],
					// ["right_index2", 0, 0, 0],
					// ["right_index3", 0, 0, 0],
					// ["right_middle1", 0, 0, 0],
					// ["right_middle2", 0, 0, 0],
					// ["right_middle3", 0, 0, 0],
					// ["right_thumb1", 0, 0, 0],
					// ["right_thumb2", 0, 0, 0],
					// ["right_thumb3", 0, 0, 0],
					["neck", 0, 0, 0],
					["head", 0, 0, 0],
					["jaw", 0, 0, 0],
					["right_eye_smplhf", 0, 0, 0],
					["left_eye_smplhf", 0, 0, 0],
					["left_collar", 0, 0, 0],
					["left_shoulder", 0, 0, 0],
					["left_elbow", 0, 0, 0],
					["left_wrist", 0, 0, 0],
					// ["left_pinky1", 0, 0, 0],
					// ["left_pinky2", 0, 0, 0],
					// ["left_pinky3", 0, 0, 0],
					// ["left_index1", 0, 0, 0],
					// ["left_index2", 0, 0, 0],
					// ["left_index3", 0, 0, 0],
					// ["left_ring1", 0, 0, 0],
					// ["left_ring2", 0, 0, 0],
					// ["left_ring3", 0, 0, 0],
					// ["left_thumb1", 0, 0, 0],
					// ["left_thumb2", 0, 0, 0],
					// ["left_thumb3", 0, 0, 0],
					// ["left_middle1", 0, 0, 0],
					// ["left_middle2", 0, 0, 0],
					// ["left_middle3", 0, 0, 0],
					["left_hip", 0, 0, 0],
					["left_knee", 0, 0, 0],
					["left_ankle", 0, 0, 0],
					["left_foot", 0, 0, 0],
					["right_hip", 0, 0, 0],
					["right_knee", 0, 0, 0],
					["right_ankle", 0, 0, 0],
					["right_foot", 0, 0, 0],
				]);

				scene.current.add(model.current);

				// mixer.current = new THREE.AnimationMixer(model.current);

				animate();

				// understand SMPL rotations
				Promise.all([
					// loadJSON(process.env.PUBLIC_URL + "/animations/2_28-37_28-42_smpl.json"),
					loadJSON(
						process.env.PUBLIC_URL +
							"/animations/2_29-40_29-44_smpl.json"
					),
					// loadJSON(process.env.PUBLIC_URL + "/animations/2_30-50_30-54_smpl.json"),
				]).then(([animation_smpl]) => {
					// figureParts.current.left_shoulder.add(new THREE.AxesHelper(5));
					scene.current.add(new THREE.AxesHelper(50));

					let longestTrack = 0;
					let tracks = {};

					// calculate quaternions and vectors for animation tracks
					for (let item of animation_smpl["tracks"]) {
						if (item["type"] === "quaternion") {
							if (item.quaternions.length > longestTrack) {
								longestTrack = item.quaternions.length;
							}
						}

						if (item["type"] === "quaternion") {
							tracks[item["name"].replace(".quaternion", "")] =
								item;
						}
					}
					// console.log(tracks);
					// play the animation, observe the vectors of differnt parts
					(async () => {
						let i = 0;

						const movie_bones = [
							"pelvis",
							"spine1",
							"spine2",
							"spine3",
							"left_hip",
							"right_hip",
							"left_collar",
							"right_collar",
							"left_shoulder",
							"right_shoulder",
							"left_elbow",
							"right_elbow",
							"left_hip",
							"right_hip",
							"left_knee",
							"right_knee",
						];

						while (i < longestTrack) {
							for (let name in tracks) {
								const q = tracks[name].quaternions[i];

								if (
									movie_bones.indexOf(name) === -1 ||
									!figureParts.current[name]
								) {
									continue;
								}

								figureParts.current[
									name
								].setRotationFromQuaternion(
									new THREE.Quaternion(q[0], q[1], q[2], q[3])
								);
							}

							// 30fps
							await sleep(33.333);

							i++;

							// play indefinitely
							if (i >= longestTrack) {
								i = 0;
							}
						}
					})();
				});
			}
		);

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		for (let v of rotations) {
			figureParts.current[v[0]].rotation.set(v[1], v[2], v[3]);
		}
	}, [rotations]);

	function animate() {
		/**
		 */
		/** play animation in example sub scene */
		// const delta = clock.getDelta();

		// if (mixer.current) mixer.current.update(delta);

		// counter.current += 1;

		/** play animation in example sub scene */

		controls.current.update();
		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function creatMainScene(viewWidth, viewHeight) {
		/**
		 * main scene, which plays exercise animation
		 * @param {number} viewWidth
		 * @param {number} viewHeight
		 */
		scene.current = new THREE.Scene();
		// scene.current.background = new THREE.Color(0x022244);

		camera.current = new THREE.PerspectiveCamera(
			90,
			viewWidth / viewHeight,
			0.1,
			1000
		);

		camera.current.position.set(0, 0, 300);

		{
			// mimic the sun light
			const dlight = new THREE.PointLight(0xffffff, 0.4);
			dlight.position.set(0, 10, 10);
			scene.current.add(dlight);
			// env light
			scene.current.add(new THREE.AmbientLight(0xffffff, 0.6));
		}

		// drawScene();

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
			alpha: true,
			antialias: true,
		});

		renderer.current.toneMappingExposure = 0.5;

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		renderer.current.setSize(viewWidth, viewHeight);
	}

	function onChangeRotation(idx, axis, v) {
		const tmp = cloneDeep(rotations);

		tmp[idx][axis] = v;

		setrotations(tmp);
	}

	function interpretAnimation(animation_json) {
		(async () => {
			let longestTrack = 0;
			let tracks = {};

			// calculate quaternions and vectors for animation tracks
			for (let item of animation_json["tracks"]) {
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

					if (quaternions.length > longestTrack) {
						longestTrack = quaternions.length;
					}
				}

				if (item["type"] === "quaternion") {
					tracks[item["name"]] = item;
				}
			}

			// play the animation, observe the vectors of differnt parts

			let i = 0;

			while (i < longestTrack) {
				applyTransfer(figureParts.current, tracks, i);

				// 30fps
				await sleep(33.333);

				i++;

				// play indefinitely
				if (i >= longestTrack) {
					i = 0;
				}

				if (clearAnimation.current) {
					break;
				}

				// break;
			}
		})();
	}

	return (
		<div>
			<canvas ref={canvasRef} />

			<div
				style={{
					position: "absolute",
					left: 0,
					bottom: 0,
					width: "100vw",
					display: "flex",
					flexWrap: "wrap",
				}}
			>
				<div>
					<label>
						file:
						<input
							type={"file"}
							ref={fileInput}
							onChange={(e) => {
								clearAnimation.current = false;
								/**
								 * read the animation data
								 * add `states` for each body part
								 * `states` is the orientation of a body part at a time
								 */
								loadJSON(
									URL.createObjectURL(e.target.files[0])
								).then((data) => {
									interpretAnimation(data);

									// mixer.current.stopAllAction();

									// const action = mixer.current.clipAction(
									// 	THREE.AnimationClip.parse(data)
									// );

									// action.reset();
									// action.setLoop(THREE.LoopRepeat);

									// // keep model at the position where it stops
									// action.clampWhenFinished = true;

									// action.enable = true;

									// action.play();
								});
							}}
						/>
					</label>

					<button
						onClick={() => {
							fileInput.current.value = "";

							try {
								fileInput.current.type = "text"; // Change the input type to text
								fileInput.current.type = "file"; // Change the input type back to file
							} catch (e) {
								// Do nothing if changing the input type throws an error
							}

							clearAnimation.current = true;
						}}
					>
						refresh
					</button>
				</div>

				{rotations.map((item, idx) => {
					return (
						<div key={idx}>
							<span>{item[0]}</span>
							<input
								style={{
									width: 40,
									height: 20,
								}}
								value={item[1]}
								onChange={(e) => {
									onChangeRotation(idx, 1, e.target.value);
								}}
							/>
							<input
								style={{
									width: 40,
									height: 20,
								}}
								value={item[2]}
								onChange={(e) => {
									onChangeRotation(idx, 2, e.target.value);
								}}
							/>
							<input
								style={{
									width: 40,
									height: 20,
								}}
								value={item[3]}
								onChange={(e) => {
									onChangeRotation(idx, 3, e.target.value);
								}}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
