<script>
	import { onMount } from "svelte";
	import * as THREE from "three";
	import ThreeScene from "../lib/ThreeScene";
	import { loadGLTF, traverseModel, invokeCamera } from "../lib/ropes";

	let threeScene, canvas;
	let player1,
		player2,
		player1Bones = {},
		player2Bones = {};

	const sceneWidth = document.documentElement.clientWidth;
	const sceneHeight = document.documentElement.clientHeight;

	const groundLevel = -100;

	onMount(() => {
		threeScene = new ThreeScene(canvas, sceneWidth, sceneHeight);

		Promise.all([
			loadGLTF("/glb/daneel.glb"),
			loadGLTF("/glb/dors.glb"),
			// loadGLTF(process.env.PUBLIC_URL + "/glb/monster.glb"),
		]).then(([daneel, dors]) => {
			// player1
			const scale = 100;

			player1 = dors.scene.children[0];
			player1.scale.set(scale, scale, scale);
			player1.position.set(0, groundLevel, -sceneWidth / 2);

			traverseModel(player1, player1Bones);

			// poseToRotation = new PoseToRotation(player1Bones);

			threeScene.scene.add(player1);

			// player2
			player2 = daneel.scene.children[0];
			player2.scale.set(scale, scale, scale);
			player2.position.set(0, groundLevel, sceneWidth / 2);
			player2.rotation.set(0, -Math.PI, 0);

			traverseModel(player2, player2Bones);

			threeScene.scene.add(player2);

			// // all models ready
			// setloadingSilhouette(false);
			// // hand is ready for ball mesh
			// handsWaiting = true;
			// handsAvailable = true;
		});

		const animate = function () {
			threeScene.onFrameUpdate();

			requestAnimationFrame(animate);
		};

		animate();
	});
</script>

<div class="bg">
	<canvas bind:this={canvas} />
</div>

<style>
	.bg {
		background-color: #654ea3;
	}
</style>
