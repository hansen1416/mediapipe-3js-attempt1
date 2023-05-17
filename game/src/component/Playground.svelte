<script>
	import { onDestroy, onMount } from "svelte";
	import * as THREE from "three"; // @ts-ignore
	import { cloneDeep } from "lodash";
	import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

	import { loadGLTF, traverseModel, invokeCamera } from "../lib/ropes";
	import ThreeScene from "../lib/ThreeScene";
	import CannonWorld from "../lib/CannonWorld";
	import PoseToRotation from "../lib/PoseToRotation";
	import Toss from "../lib/Toss";

	let threeScene, cannonWorld, video, canvas;
	let player1,
		player1Bones = {};

	// let player2,
	// 	player2Bones = {};

	let cameraReady = false,
		mannequinReady = false,
		modelReady = false;

	let poseDetector, poseDetectorAvailable;

	let runAnimation = true,
		showVideo = false,
		animationPointer;

	let handsEmptyCounter = 0,
		handsWaiting = false,
		handsAvailable = false;

	let handBallMesh;

	let poseToRotation;

	let toss = new Toss();

	let speed_threshold = 5,
		collinear_threshold = 0.1,
		z_threshold = 0.5;

	const sceneWidth = document.documentElement.clientWidth;
	const sceneHeight = document.documentElement.clientHeight;

	const groundLevel = -1;

	const createPoseLandmarker = async () => {
		const vision = await FilesetResolver.forVisionTasks(
			"/tasks-vision/wasm"
		);
		return await PoseLandmarker.createFromOptions(vision, {
			baseOptions: {
				modelAssetPath: `/tasks-vision/pose_landmarker_lite.task`,
				delegate: "GPU",
			},
			runningMode: "VIDEO",
			numPoses: 1,
			minPoseDetectionConfidence: 0.5,
			minPosePresenceConfidence: 0.5,
			minTrackingConfidence: 0.5,
			outputSegmentationMasks: false,
		});
	};

	onMount(() => {
		threeScene = new ThreeScene(canvas, sceneWidth, sceneHeight);

		cannonWorld = new CannonWorld(threeScene.scene, groundLevel);

		invokeCamera(video, () => {
			cameraReady = true;
		});

		createPoseLandmarker().then((pose) => {
			poseDetector = pose;

			poseDetectorAvailable = true;
		});

		cannonWorld.target();

		Promise.all([
			// loadGLTF("/glb/daneel.glb"),
			loadGLTF("/glb/dors.glb"),
			// loadGLTF(process.env.PUBLIC_URL + "/glb/monster.glb"),
		]).then(([dors]) => {
			// player1
			player1 = dors.scene.children[0];
			player1.position.set(0, groundLevel, -10);

			traverseModel(player1, player1Bones);

			poseToRotation = new PoseToRotation(player1Bones);

			threeScene.scene.add(player1);

			// // player2
			// player2 = daneel.scene.children[0];
			// player2.position.set(0, groundLevel, 10);
			// player2.rotation.set(0, -Math.PI, 0);

			// traverseModel(player2, player2Bones);

			// threeScene.scene.add(player2);

			// // all models ready
			cameraReady = true;
			mannequinReady = true;
			modelReady = true;
			// hand is ready for ball mesh
			handsWaiting = true;
			handsAvailable = true;
		});
	});

	onDestroy(() => {
		cancelAnimationFrame(animationPointer);
	});

	function ballMesh() {
		const mesh = new THREE.Mesh(
			new THREE.SphereGeometry(0.1), // @ts-ignore
			new THREE.MeshNormalMaterial()
		);
		mesh.castShadow = true;

		return mesh;
	}

	// when mannequin, model and camera are erady, start animation loop
	$: if (cameraReady && mannequinReady && modelReady) {
		animate();
	}

	function animate() {
		// ========= captured pose logic

		if (
			runAnimation &&
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

		// ========= captured pose logic

		threeScene.onFrameUpdate();

		cannonWorld.onFrameUpdate();

		if (handsWaiting) {
			if (handsEmptyCounter < 2) {
				handsEmptyCounter += 1;
			} else {
				handsAvailable = true;
				handsEmptyCounter = 0;
			}
		}

		if (handsAvailable) {
			// todo add ball to hand

			handBallMesh = ballMesh();

			// console.log("add ball", handBallMesh, player1Bones);

			const tmpvec = new THREE.Vector3();

			player1Bones.RightHand.getWorldPosition(tmpvec);

			// @ts-ignore
			handBallMesh.position.copy(tmpvec);

			threeScene.scene.add(handBallMesh);

			handsAvailable = false;
			handsWaiting = false;
		}

		animationPointer = requestAnimationFrame(animate);
	}

	function onPoseCallback(result) {
		if (result && result.worldLandmarks && result.worldLandmarks[0]) {
			const pose3D = cloneDeep(result.worldLandmarks[0]);

			const width_ratio = 30;
			const height_ratio = (width_ratio * 480) / 640;

			// multiply x,y by differnt factor
			for (let v of pose3D) {
				v["x"] *= width_ratio;
				v["y"] *= -height_ratio;
				v["z"] *= -width_ratio;
			}

			poseToRotation.applyPoseToBone(pose3D);

			toss.getHandsPos(player1Bones);

			if (handsWaiting === false && handBallMesh) {
				const velocity = toss.calculateAngularVelocity(
					false,
					speed_threshold,
					z_threshold,
					collinear_threshold
				);
				// console.log("velocity", velocity);
				if (velocity) {
					// making ball move

					cannonWorld.project(handBallMesh, velocity);

					handsWaiting = true;
					handBallMesh = null;
				} else {
					// let the ball move with hand

					const tmpvec = new THREE.Vector3();

					player1Bones.RightHand.getWorldPosition(tmpvec);

					handBallMesh.position.copy(tmpvec);
				}
			}

			// // move the position of model
			// const pose2D = cloneDeep(result.landmarks[0]);

			// const to_pos = poseToRotation.applyPosition(
			// 	pose2D,
			// 	sceneWidth * 0.6
			// );

			// if (to_pos) {
			// 	player1.position.set(to_pos.x, groundLevel, -sceneWidth / 2);
			// }
		}

		poseDetectorAvailable = true;
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
			<div class="threshold"><span>Threshold</span></div>
			<label
				>Speed: <input
					bind:value={speed_threshold}
					placeholder=""
				/></label
			>
			<label
				>Collinear: <input
					bind:value={collinear_threshold}
					placeholder=""
				/></label
			>
			<label
				>Z weight: <input
					bind:value={z_threshold}
					placeholder=""
				/></label
			>
		</div>
		<div>
			<button
				on:click={() => {
					const mesh = ballMesh();
					// @ts-ignore
					mesh.position.set(0, groundLevel + 2, -10);

					threeScene.scene.add(mesh);

					const direction = new THREE.Vector3(0, 0.1, 2).normalize();
					const speed = 36;

					cannonWorld.project(
						mesh,
						direction.multiplyScalar(speed),
						0.1
					);
				}}>throw</button
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

	.controls .threshold,
	.controls label {
		color: #fff;
	}

	.controls input {
		width: 30px;
		height: 20px;
	}

	.controls button {
		padding: 10px;
		font-size: 20px;
		text-transform: capitalize;
	}
</style>
