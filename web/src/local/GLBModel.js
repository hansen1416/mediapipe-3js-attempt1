import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
	sleep,
	loadJSON,
	loadGLTF,
	traverseModel,
	applyTransfer,
} from "../components/ropes";

export default function GLBModel() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const model = useRef(null);
	const figureParts = useRef({});

	const fileInput = useRef(null);

	// an integer number, used for cancelAnimationFrame
	const animationPointer = useRef(0);
	// const counter = useRef(0);
	const clearAnimation = useRef(false);

	const mixer = useRef(null);
	const clock = new THREE.Clock();

	useEffect(() => {
		// scene take entire screen
		creatMainScene(
			document.documentElement.clientWidth,
			document.documentElement.clientHeight
		);

		Promise.all([loadGLTF(process.env.PUBLIC_URL + "/glb/dors.glb")]).then(
			([glb]) => {
				// add 3d model to main scene
				model.current = glb.scene.children[0];
				// apply the rotation of SMPL `root`
				model.current.position.set(0, 1, 0);
				model.current.rotation.set(3.14, 0, 0);

				// store all limbs to `model`
				traverseModel(model.current, figureParts.current);

				scene.current.add(model.current);

				animate();

				mixer.current = new THREE.AnimationMixer(model.current);

				mixer.current.stopAllAction();

				if (glb.animations && glb.animations[0]) {
					// prepare the example exercise action
					const action = mixer.current.clipAction(glb.animations[0]);

					action.reset();
					action.setLoop(THREE.LoopRepeat);

					// keep model at the position where it stops
					action.clampWhenFinished = true;

					action.enable = true;

					action.play();
					// prepare the example exercise action
				}
			}
		);

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};

		// eslint-disable-next-line
	}, []);

	function animate() {
		/**
		 */

		/** play animation in example sub scene */
		const delta = clock.getDelta();

		if (mixer.current) mixer.current.update(delta);

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

		camera.current.position.set(0, 0, 2);

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

		controls.current.enablePan = false;
		// controls.current.minPolarAngle = THREE.MathUtils.degToRad(60);
		// controls.current.maxPolarAngle = THREE.MathUtils.degToRad(90);
		controls.current.minDistance = 2;
		controls.current.maxDistance = 1000;
		controls.current.enableDamping = true;

		renderer.current.setSize(viewWidth, viewHeight);
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
					console.log(item);

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

			{/* <video
				src={process.env.PUBLIC_URL + "/video/dancing.mp4"}
				autoPlay={true}
				controls={true}
				width={"640px"}
				height={"360px"}
				style={{
					display: "block",
					position: "absolute",
					left: 0,
					top: 0,
				}}
			></video> */}

			<div
				style={{
					position: "absolute",
					right: 0,
					bottom: 0,
				}}
			>
				{/* <div>
					<label>
						file:
						<input
							type={"file"}
							ref={fileInput}
							onChange={(e) => {
								clearAnimation.current = false;

								//   read the animation data
								//   add `states` for each body part
								//   `states` is the orientation of a body part at a time

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
				</div> */}
				{/* <div>
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
				</div> */}
				<div>
					<button
						onClick={() => {
							// "2_12-09_12-15",
							// "2_13-12_13-16",
							// "2_14-18_14-22",
							// "2_15-29_15-34",
							// "2_18-18_18-25",
							// "2_19-24_19-30",
							// "2_20-46_20-50",
							// "2_22-30_22-34",
							// "2_23-47_23-51",
							// "2_24-34_24-39",
							// "2_26-34_26-40",
							// "2_28-00_28-04",
							// "2_30-50_30-54",
							// "2_8-00_8-04",
							// "2_9-25_9-35",

							const video_list = [
								"2_1-07_1-10",
								"2_1-46_1-50",
								"2_10-19_10-31",
								"2_11-05_11-09",
								"2_16-26_16-34",
								"2_17-28_17-36",
								"2_2-50_2-54",
								"2_21-24_21-28",
								"2_25-41_25-48",
								"2_28-37_28-42",
								"2_29-40_29-44",
								"2_4-04_4-08",
								"2_5-00_5-04",
								"2_6-15_6-19",
								"2_7-02_7-12",
							];

							const tasks = [];

							for (let vn of video_list) {
								tasks.push(
									loadJSON(
										process.env.PUBLIC_URL +
											"/animations/" +
											vn +
											"_rpm.json"
									)
								);
							}

							// understand SMPL rotations
							Promise.all(tasks).then((results) => {
								(async () => {
									for (const animation_rpm of results) {
										const tracks = {};

										for (let tk of animation_rpm.tracks) {
											tracks[
												tk.name.replace(
													".quaternion",
													""
												)
											] = tk;
										}

										// console.log(figureParts.current, tracks);

										const longest_track =
											tracks.Hips.quaternions.length;

										const bones2rotate = [
											"Hips",
											"Spine",
											"Spine1",
											"Spine2",
											"LeftUpLeg",
											"RightUpLeg",
											"LeftLeg",
											"RightLeg",
											"LeftShoulder",
											"RightShoulder",
											"RightArm",
											"LeftArm",
											"LeftForeArm",
											"RightForeArm",
										];

										let i = 0;

										while (i < longest_track) {
											for (let name of bones2rotate) {
												if (
													!tracks[name].quaternions ||
													tracks[name].quaternions
														.length === 0
												) {
													continue;
												}

												const q =
													tracks[name].quaternions[i];

												figureParts.current[
													name
												].setRotationFromQuaternion(
													new THREE.Quaternion(
														q[0],
														q[1],
														q[2],
														q[3]
													)
												);
											}

											i++;

											await sleep(33.33);

											// if (i >= longest_track) {
											// 	i = 0;
											// }
										}

										// console.log(figureParts.current.Spine.rotation);

										// interpretAnimation(animation_rpm);
									}
								})();
							});
						}}
					>
						Go
					</button>
				</div>
			</div>
		</div>
	);
}
