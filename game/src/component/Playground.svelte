<script>
	import { onMount } from "svelte";
	import * as THREE from "three";
	import ThreeScene from "../lib/ThreeScene";

	let threeScene, canvas;

	const sceneWidth = document.documentElement.clientWidth;
	const sceneHeight = document.documentElement.clientHeight;

	onMount(() => {
		threeScene = new ThreeScene(canvas, sceneWidth, sceneHeight);


		const animate = function () {
			

			threeScene.onFrameUpdate();

      requestAnimationFrame(animate);
		};

		animate();
	});
</script>

<canvas bind:this={canvas} />
