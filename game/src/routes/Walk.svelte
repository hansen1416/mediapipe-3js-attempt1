<script>
	import * as THREE from "three";
	import { onDestroy, onMount } from "svelte";
	import { GROUND_LEVEL } from "../lib/constants";
	import { loadGLTF, sleep } from "../lib/ropes";
	import ThreeScene from "../lib/ThreeScene";
	import CannonWorld from "../lib/CannonWorld";
	import PoseToRotation from "../lib/PoseToRotation";
	import { subsequenceDTW } from "subsequence-dtw";

	let threeScene, cannonWorld, video, canvas;
	let player1,
		player1Bones = {};

	let cameraReady = false,
		mannequinReady = false,
		modelReady = false;

	let runAnimation = true,
		showVideo = false,
		animationPointer;

	let poseToRotation;

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

			poseToRotation = new PoseToRotation(player1Bones, "mdm");

			threeScene.scene.add(player1);

			player1Bones.LeftForeArm.add(new THREE.AxesHelper(5));

			// all models ready
			cameraReady = true;
			mannequinReady = true;
			modelReady = true;
			// hand is ready for ball mesh
		});
	});

	onDestroy(() => {
		cancelAnimationFrame(animationPointer);
	});

	// when mannequin, model and camera are erady, start animation loop
	$: if (mannequinReady) {
		animate();
	}

	function animate() {
		threeScene.onFrameUpdate();

		cannonWorld.onFrameUpdate();

		animationPointer = requestAnimationFrame(animate);
	}

	function playMotion(data) {
		(async () => {
			for (let i = 0; i < data.length; i++) {
				poseToRotation.applyPoseToBone(data[i]);

				await sleep(30);
			}
		})();
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
							
							player1Bones.LeftArm.getWorldPosition(leftarmvec)
							player1Bones.RightArm.getWorldPosition(rightarmvec)
							player1Bones.LeftForeArm.getWorldPosition(leftforearmvec)
							player1Bones.RightForeArm.getWorldPosition(rightforearmvec)
							player1Bones.LeftHand.getWorldPosition(lefthandvec)
							player1Bones.RightHand.getWorldPosition(righthandvec)

							leftarm_positions.push(leftarmvec);
							rightarm_positions.push(rightarmvec);
							leftforearm_positions.push(leftforearmvec);
							rightforearm_positions.push(rightforearmvec);
							lefthand_positions.push(lefthandvec);
							righthand_positions.push(righthandvec);

							await sleep(20);

							// if (i === left_arm_rotation.length - 1) {
							// 	i = 0;
							// }
						}

						console.log(leftarm_positions)
						console.log(rightarm_positions)
						console.log(leftforearm_positions)
						console.log(rightforearm_positions)
						console.log(lefthand_positions)
						console.log(righthand_positions)
					})();
				}}>walk</button
			>

			{#if runAnimation}
				<button
					on:click={() => {
						runAnimation = !runAnimation;
					}}>stop animation</button
				>
			{:else}
				<button
					on:click={() => {
						runAnimation = !runAnimation;
					}}>run animation</button
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
