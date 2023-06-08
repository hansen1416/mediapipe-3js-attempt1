<script>
	import * as THREE from "three";
	import { onDestroy, onMount } from "svelte";
	import { GROUND_LEVEL } from "../lib/constants";
	import { cloneDeep } from "lodash";
	import {
		loadGLTF,
		sleep,
		createPoseLandmarker,
		invokeCamera,
		dtwMetric,
	} from "../lib/ropes";
	import ThreeScene from "../lib/ThreeScene";
	import CannonWorld from "../lib/CannonWorld";
	import PoseToRotation from "../lib/PoseToRotation";
	import { subsequenceDTW } from "subsequence-dtw";
	import Deque from "../lib/Deque";

	let threeScene, cannonWorld, video, canvas;
	let player1,
		player1Bones = {};

	let cameraReady = false,
		mannequinReady = false,
		modelReady = false;

	let poseDetector, poseDetectorAvailable;

	let runDetector = false,
		showVideo = false,
		animationPointer;

	let poseToRotationMP;
	let poseToRotationMDM;

	let motionData = {};

	const sceneWidth = document.documentElement.clientWidth;
	const sceneHeight = document.documentElement.clientHeight;

	const motion_data = [
		"1-0",
		"1-1",
		"1-2",
		"2-0",
		"2-1",
		"2-2",
		"3-0",
		"3-1",
		"3-2",
		"4-0",
		"4-1",
		"4-2",
	];

	const walking_cycle = [];

	const motion_slice = new Deque();

	function readBuffer(buffer) {
		const arr = new Float32Array(buffer);

		const shape_arr = [];

		for (let i = 0; i < arr.length; i += 66) {
			const tmp = [];

			for (let j = 0; j < 66; j += 1) {
				tmp.push(arr[i + j]);
			}

			const tmp2 = [];

			for (let j = 0; j < 66; j += 3) {
				tmp2.push({ x: tmp[j], y: tmp[j + 1], z: tmp[j + 2] });
			}

			// console.log(tmp);
			shape_arr.push(tmp2);

			// for (let j = 0; j < 66; j += 3) {
			// 	shape_arr.push({
			// 		x: tmp[i],
			// 		y: tmp[i + 1],
			// 		z: tmp[i + 2],
			// 	});
			// }
		}

		// console.log(shape_arr);
		return shape_arr;
	}

	onMount(() => {
		threeScene = new ThreeScene(canvas, sceneWidth, sceneHeight);

		cannonWorld = new CannonWorld(threeScene.scene);

		cannonWorld.addGround();

		const motion_tasks = [];

		for (let m of motion_data) {
			motion_tasks.push(fetch("/motion/motion" + m + ".bin"));
		}

		Promise.all(motion_tasks).then((results) => {
			for (let i in results) {
				results[i].arrayBuffer().then((buffer) => {
					motionData[motion_data[i]] = readBuffer(buffer);
				});
			}
		});

		fetch("/motion/walking_cycle.bin")
			.then((res) => {
				return res.arrayBuffer();
			})
			.then((buffer) => {
				const arr = new Float64Array(buffer);

				for (let i = 0; i < arr.length; i += 12) {
					const tmp1 = [];
					for (let j = 0; j < 12; j++) {
						tmp1.push(arr[i + j]);
					}

					const tmp2 = [];

					for (let m = 0; m < 4; m += 1) {
						tmp2.push([]);

						for (let n = 0; n < 3; n += 1) {
							tmp2[m].push(tmp1[m * 3 + n]);
						}
					}

					walking_cycle.push(tmp2);
				}
			});

		Promise.all([
			loadGLTF("/glb/dors.glb"),
			// loadGLTF(process.env.PUBLIC_URL + "/glb/monster.glb"),
		]).then(([dors]) => {
			// player1
			player1 = dors.scene.children[0];
			player1.position.set(0, GROUND_LEVEL, 0);

			player1.traverse(function (node) {
				if (node.isMesh) {
					node.castShadow = true;
				}

				if (node.isBone) {
					player1Bones[node.name] = node;
				}
			});

			poseToRotationMP = new PoseToRotation(player1Bones, "mediapipe");
			poseToRotationMDM = new PoseToRotation(player1Bones, "mdm");

			threeScene.scene.add(player1);

			player1Bones.LeftUpLeg.add(new THREE.AxesHelper(5));

			// all models ready
			cameraReady = true;
			mannequinReady = true;
			modelReady = true;
			// hand is ready for ball mesh
		});

		if (true) {
			invokeCamera(video, () => {
				cameraReady = true;
			});

			createPoseLandmarker().then((pose) => {
				poseDetector = pose;

				poseDetectorAvailable = true;
			});
		}
	});

	onDestroy(() => {
		cancelAnimationFrame(animationPointer);
	});

	// when mannequin, model and camera are erady, start animation loop
	$: if (mannequinReady) {
		animate();
	}

	function animate() {
		if (
			runDetector &&
			video &&
			video.readyState >= 2 &&
			poseDetectorAvailable &&
			poseDetector
		) {
			poseDetectorAvailable = false;
			poseDetector.detectForVideo(
				video,
				performance.now(),
				onPoseCallback
			);
		}

		threeScene.onFrameUpdate();

		cannonWorld.onFrameUpdate();

		animationPointer = requestAnimationFrame(animate);

		recordMotion();
	}

	function onPoseCallback(result) {
		if (result && result.worldLandmarks && result.worldLandmarks[0]) {
			const pose3D = cloneDeep(result.worldLandmarks[0]);

			// data_recorder.addBack({ data: pose3D, t: performance.now() });

			// if (data_recorder.size() > 30) {
			// 	data_recorder.removeFront();
			// }

			// if (data_recorder.size() === 30) {
			// 	big_obj.push(data_recorder.toArray());
			// }

			const width_ratio = 30;
			const height_ratio = (width_ratio * 480) / 640;

			// multiply x,y by differnt factor
			for (let v of pose3D) {
				v["x"] *= width_ratio;
				v["y"] *= -height_ratio;
				v["z"] *= -width_ratio;
			}

			// console.log(pose3D)
			poseToRotationMP.applyPoseToBone(pose3D);
		}

		poseDetectorAvailable = true;
	}

	function playMotion(data) {
		(async () => {
			for (let i = 0; i < data.length; i++) {
				poseToRotationMDM.applyPoseToBone(data[i], true);

				await sleep(30);
			}
		})();
	}

	function recordMotion() {
		const leftarm = new THREE.Vector3();
		const leftforearm = new THREE.Vector3();
		const lefthand = new THREE.Vector3();
		const rightarm = new THREE.Vector3();
		const rightforearm = new THREE.Vector3();
		const righthand = new THREE.Vector3();

		player1Bones.LeftArm.getWorldPosition(leftarm);
		player1Bones.LeftForeArm.getWorldPosition(leftforearm);
		player1Bones.LeftHand.getWorldPosition(lefthand);
		player1Bones.RightArm.getWorldPosition(rightarm);
		player1Bones.RightForeArm.getWorldPosition(rightforearm);
		player1Bones.RightHand.getWorldPosition(righthand);

		const stvck = [];

		stvck.push([
			leftforearm.x - leftarm.x,
			leftforearm.y - leftarm.y,
			leftforearm.z - leftarm.z,
		]);

		stvck.push([
			lefthand.x - leftforearm.x,
			lefthand.y - leftforearm.y,
			lefthand.z - leftforearm.z,
		]);

		stvck.push([
			rightforearm.x - rightarm.x,
			rightforearm.y - rightarm.y,
			rightforearm.z - rightarm.z,
		]);

		stvck.push([
			righthand.x - rightforearm.x,
			righthand.y - rightforearm.y,
			righthand.z - rightforearm.z,
		]);

		motion_slice.addBack(stvck);

		if (motion_slice.size() > 10) {
			motion_slice.removeFront();
		}

		if (motion_slice.size() === 10) {
			const res = subsequenceDTW(
				motion_slice.toArray(),
				walking_cycle,
				dtwMetric
			);

			// console.log(res);
		}
	}

	function combineEulerAngles(euler1, euler2) {
		const e1 = new THREE.Euler(euler1[0], euler1[1], euler1[2]);
		const e2 = new THREE.Euler(euler2[0], euler2[1], euler2[2]);

		// Convert Euler angles to rotation matrices
		const matrix1 = new THREE.Matrix4().makeRotationFromEuler(e1);
		const matrix2 = new THREE.Matrix4().makeRotationFromEuler(e2);

		// Multiply matrices
		const combinedMatrix = new THREE.Matrix4().multiplyMatrices(
			matrix1,
			matrix2
		);

		// Convert combined matrix back to Euler angles
		const combinedEuler = new THREE.Euler().setFromRotationMatrix(
			combinedMatrix
		);

		return [combinedEuler.x, combinedEuler.y, combinedEuler.z];
	}
</script>

<div class="bg">
	<video
		bind:this={video}
		autoPlay={true}
		width="480"
		height="360"
		style="position: absolute; top:0; left: 0; display: {showVideo
			? 'block'
			: 'none'}"
	>
		<track label="English" kind="captions" default />
	</video>

	<canvas bind:this={canvas} />

	<div class="controls">
		<div>
			{#each motion_data as suffix}
				<button
					on:click={() => {
						playMotion(motionData[suffix]);
					}}>{suffix}</button
				>
			{/each}
		</div>
		<div>
			<button
				on:click={() => {
					(async () => {
						const left_arm_rotation = [];
						const right_arm_rotation = [];

						const left_forearm_rotation = [];
						const right_forearm_rotation = [];

						const left_thigh_rotation = [];
						const left_calf_rotation = [];

						const right_thigh_rotation = [];
						const right_calf_rotation = [];

						for (let i = -19; i <= 30; i++) {
							left_arm_rotation.push([70, 0, i]);
							right_arm_rotation.push([70, 0, i - 11]);

							if (i >= 15) {
								left_forearm_rotation.push([
									0,
									0,
									(i - 15) * 1.5,
								]);
								// console.log('left', (i - 15) * 1.5)
							} else {
								left_forearm_rotation.push([0, 0, 0]);
							}

							if (i - 11 <= -15) {
								right_forearm_rotation.push([
									0,
									0,
									(i + 4) * 1.5,
								]);
								// console.log('right', (i+19)*-1.5)
							} else {
								right_forearm_rotation.push([0, 0, 0]);
							}

							left_thigh_rotation.push(
								combineEulerAngles([0, 0, -3.14], [0, 0, 0])
							);
							right_thigh_rotation.push(
								combineEulerAngles([0, 0, 3.14], [0, 0, 0])
							);
							left_calf_rotation.push([0, 0, 0]);
							right_calf_rotation.push([0, 0, 0]);
						}

						for (let i = 30; i >= -19; i--) {
							left_arm_rotation.push([70, 0, i]);
							right_arm_rotation.push([70, 0, i - 11]);

							if (i >= 15) {
								left_forearm_rotation.push([
									0,
									0,
									(i - 15) * 1.5,
								]);
							} else {
								left_forearm_rotation.push([0, 0, 0]);
							}
							if (i - 11 <= -15) {
								right_forearm_rotation.push([
									0,
									0,
									(i + 4) * 1.5,
								]);
								// console.log('right', (i+4)*1.5, i)
							} else {
								right_forearm_rotation.push([0, 0, 0]);
							}

							left_thigh_rotation.push(
								combineEulerAngles([0, 0, -3.14], [0, 0, 0])
							);
							right_thigh_rotation.push(
								combineEulerAngles([0, 0, 3.14], [0, 0, 0])
							);
							left_calf_rotation.push([0, 0, 0]);
							right_calf_rotation.push([0, 0, 0]);
						}

						const leftarm_positions = [];
						const rightarm_positions = [];
						const leftforearm_positions = [];
						const rightforearm_positions = [];
						const lefthand_positions = [];
						const righthand_positions = [];

						for (let i = 0; i < left_arm_rotation.length; i++) {
							// break
							player1Bones.LeftArm.rotation.set(
								THREE.MathUtils.degToRad(
									left_arm_rotation[i][0]
								),
								THREE.MathUtils.degToRad(
									left_arm_rotation[i][1]
								),
								THREE.MathUtils.degToRad(
									left_arm_rotation[i][2]
								)
							);
							player1Bones.RightArm.rotation.set(
								THREE.MathUtils.degToRad(
									right_arm_rotation[i][0]
								),
								THREE.MathUtils.degToRad(
									right_arm_rotation[i][1]
								),
								THREE.MathUtils.degToRad(
									right_arm_rotation[i][2]
								)
							);

							player1Bones.LeftForeArm.rotation.set(
								THREE.MathUtils.degToRad(
									left_forearm_rotation[i][0]
								),
								THREE.MathUtils.degToRad(
									left_forearm_rotation[i][1]
								),
								THREE.MathUtils.degToRad(
									left_forearm_rotation[i][2]
								)
							);
							player1Bones.RightForeArm.rotation.set(
								THREE.MathUtils.degToRad(
									right_forearm_rotation[i][0]
								),
								THREE.MathUtils.degToRad(
									right_forearm_rotation[i][1]
								),
								THREE.MathUtils.degToRad(
									right_forearm_rotation[i][2]
								)
							);

							const leftarmvec = new THREE.Vector3();
							const rightarmvec = new THREE.Vector3();
							const leftforearmvec = new THREE.Vector3();
							const rightforearmvec = new THREE.Vector3();
							const lefthandvec = new THREE.Vector3();
							const righthandvec = new THREE.Vector3();

							player1Bones.LeftArm.getWorldPosition(leftarmvec);
							player1Bones.RightArm.getWorldPosition(rightarmvec);
							player1Bones.LeftForeArm.getWorldPosition(
								leftforearmvec
							);
							player1Bones.RightForeArm.getWorldPosition(
								rightforearmvec
							);
							player1Bones.LeftHand.getWorldPosition(lefthandvec);
							player1Bones.RightHand.getWorldPosition(
								righthandvec
							);

							leftarm_positions.push(leftarmvec);
							rightarm_positions.push(rightarmvec);
							leftforearm_positions.push(leftforearmvec);
							rightforearm_positions.push(rightforearmvec);
							lefthand_positions.push(lefthandvec);
							righthand_positions.push(righthandvec);

							// move legs

							player1Bones.LeftUpLeg.rotation.set(
								THREE.MathUtils.degToRad(
									left_thigh_rotation[i][0]
								),
								THREE.MathUtils.degToRad(
									left_thigh_rotation[i][1]
								),
								THREE.MathUtils.degToRad(
									left_thigh_rotation[i][2]
								)
							);

							player1Bones.LeftLeg.rotation.set(
								THREE.MathUtils.degToRad(
									left_calf_rotation[i][0]
								),
								THREE.MathUtils.degToRad(
									left_calf_rotation[i][1]
								),
								THREE.MathUtils.degToRad(
									left_calf_rotation[i][2]
								)
							);

							player1Bones.RightUpLeg.rotation.set(
								THREE.MathUtils.degToRad(
									right_thigh_rotation[i][0]
								),
								THREE.MathUtils.degToRad(
									right_thigh_rotation[i][1]
								),
								THREE.MathUtils.degToRad(
									right_thigh_rotation[i][2]
								)
							);

							player1Bones.RightLeg.rotation.set(
								THREE.MathUtils.degToRad(
									right_calf_rotation[i][0]
								),
								THREE.MathUtils.degToRad(
									right_calf_rotation[i][1]
								),
								THREE.MathUtils.degToRad(
									right_calf_rotation[i][2]
								)
							);

							await sleep(20);

							// if (i === left_arm_rotation.length - 1) {
							// 	i = 0;
							// }
						}

						console.log(leftarm_positions);
						console.log(rightarm_positions);
						console.log(leftforearm_positions);
						console.log(rightforearm_positions);
						console.log(lefthand_positions);
						console.log(righthand_positions);
					})();
				}}>walk</button
			>

			{#if runDetector}
				<button
					on:click={() => {
						runDetector = !runDetector;
					}}>stop detector</button
				>
			{:else}
				<button
					on:click={() => {
						runDetector = !runDetector;
					}}>run detector</button
				>
			{/if}

			{#if showVideo}
				<button
					on:click={() => {
						showVideo = !showVideo;
					}}>hide video</button
				>
			{:else}
				<button
					on:click={() => {
						showVideo = !showVideo;
					}}>show video</button
				>
			{/if}
		</div>
	</div>
</div>

<style>
	.bg {
		background-color: #0f2027;
	}

	.controls {
		position: absolute;
		bottom: 10px;
		right: 10px;
	}

	.controls button {
		padding: 10px;
		font-size: 20px;
		text-transform: capitalize;
	}
</style>
