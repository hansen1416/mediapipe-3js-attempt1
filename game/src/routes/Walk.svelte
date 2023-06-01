<script>
	import { onDestroy, onMount } from "svelte";
	import { GROUND_LEVEL } from "../lib/constants";
	import { loadGLTF } from "../lib/ropes";
	import ThreeScene from "../lib/ThreeScene";
	import CannonWorld from "../lib/CannonWorld";
	import PoseToRotation from "../lib/PoseToRotation";

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

	let motionData;

	const sceneWidth = document.documentElement.clientWidth;
	const sceneHeight = document.documentElement.clientHeight;

	onMount(() => {
		threeScene = new ThreeScene(canvas, sceneWidth, sceneHeight);

		cannonWorld = new CannonWorld(threeScene.scene);

		fetch("/motion1.bin")
			.then((response) => response.arrayBuffer())
			.then((buffer) => {
				const arr = new Float32Array(buffer);

				const shape_arr = [];

				for (let i = 0; i < arr.length; i += 3) {
					shape_arr.push({ x: arr[i], y: arr[i + 1], z: arr[i + 2] });
				}

				motionData = [shape_arr];
			})
			.catch((error) => console.error(error));

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

			poseToRotation = new PoseToRotation(player1Bones, 'mdm');

			threeScene.scene.add(player1);

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
			<button on:click={() => {
				for (let i = 0; i < motionData.length; i++) {
					poseToRotation.applyPoseToBone(motionData[i])
				}
			}}>walk</button>

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
