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
				model.current.position.set(0, 1, 0);
				// apply the rotation of SMPL `root`
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

				// understand SMPL rotations
				Promise.all([
					// loadJSON(process.env.PUBLIC_URL + "/2_28-37_28-42.json"),
					// loadJSON(process.env.PUBLIC_URL + "/2_28-37_28-42_smpl.json"),
					loadJSON(process.env.PUBLIC_URL + "/2_29-40_29-44.json"),
					loadJSON(
						process.env.PUBLIC_URL + "/2_29-40_29-44_smpl.json"
					),
					// loadJSON(process.env.PUBLIC_URL + "/2_30-50_30-54.json"),
					// loadJSON(process.env.PUBLIC_URL + "/2_30-50_30-54_smpl.json"),
				]).then(([animation_rpm, animation_smpl]) => {
					const axesHelper = new THREE.AxesHelper(5);
					figureParts.current.Hips.add(axesHelper);

					console.log(animation_rpm);
					console.log(figureParts.current);

					const longest_track =
						animation_rpm.tracks[1]["quaternions"].length;

					(async () => {
						let q0 = animation_rpm.tracks[0]["quaternions"][1];

						q0 = new THREE.Quaternion(q0[0], q0[1], q0[2], q0[3]);

						// const e0 = new THREE.Euler().setFromQuaternion(q0);

						// e0.x -= 1.57;

						// q0 = new THREE.Quaternion().setFromEuler(e0);

						// console.log(e0, q0);

						figureParts.current.Hips.setRotationFromQuaternion(q0);

						let i = 0;

						while (i < longest_track) {
							const q1 =
								animation_rpm.tracks[1]["quaternions"][i];
							const q2 =
								animation_rpm.tracks[2]["quaternions"][i];
							const q3 =
								animation_rpm.tracks[3]["quaternions"][i];

							// const v0 = new THREE.Vector3(0, 1, 0);

							figureParts.current.Spine.setRotationFromQuaternion(
								new THREE.Quaternion(q1[0], q1[1], q1[2], q1[3])
							);

							figureParts.current.Spine1.setRotationFromQuaternion(
								new THREE.Quaternion(q2[0], q2[1], q2[2], q2[3])
							);

							figureParts.current.Spine2.setRotationFromQuaternion(
								new THREE.Quaternion(q3[0], q3[1], q3[2], q3[3])
							);

							// v0.applyQuaternion(q);

							i++;

							await sleep(33.33);

							if (i >= longest_track) {
								i = 0;
							}
						}

						// console.log(figureParts.current.Spine.rotation);

						// interpretAnimation(animation_rpm);
					})();
				});
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
		<div className="glb-model">
			<canvas ref={canvasRef} />

			<div
				style={{
					position: "absolute",
					right: 0,
					bottom: 0,
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
				</div>
				<div>
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
			</div>
		</div>
	);
}
