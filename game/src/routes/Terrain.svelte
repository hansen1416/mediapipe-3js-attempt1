<script>
	import { onDestroy, onMount } from "svelte";
	import { GROUND_LEVEL } from "../lib/constants";
	import { loadGLTF, sleep } from "../lib/ropes";
	import ThreeScene from "../lib/ThreeScene";
	import CannonWorld from "../lib/CannonWorld";
	import PoseToRotation from "../lib/PoseToRotation";

	let threeScene, cannonWorld, video, canvas;


	let 
		sceneReady = false;

	let runAnimation = true,
		showVideo = false,
		animationPointer;


	const sceneWidth = document.documentElement.clientWidth;
	const sceneHeight = document.documentElement.clientHeight;

	onMount(() => {
		threeScene = new ThreeScene(canvas, sceneWidth, sceneHeight);

		cannonWorld = new CannonWorld(threeScene.scene);

		sceneReady = true
	});

	onDestroy(() => {
		cancelAnimationFrame(animationPointer);
	});

	// when mannequin, model and camera are erady, start animation loop
	$: if (sceneReady) {
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
