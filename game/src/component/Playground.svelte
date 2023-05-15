<script>
	import { onMount } from "svelte";
	import * as THREE from "three";
	import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

	import ThreeScene from "../lib/ThreeScene";
	import CannonWorld from "../lib/CannonWorld";
	import { loadGLTF, traverseModel, invokeCamera } from "../lib/ropes";

	let threeScene, cannonWorld, video, canvas;
	let player1,
		player2,
		player1Bones = {},
		player2Bones = {};

	let cameraReady, mannequinReady, modelReady;

	let runAnimationRef, animationPointer, poseDetectorAvailable, poseDetector;
	let handsWaiting, handsEmptyCounter, handsAvailable, handBallMesh;

	const sceneWidth = document.documentElement.clientWidth;
	const sceneHeight = document.documentElement.clientHeight;

	const groundLevel = -100;

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
			console.log(pose);
		});

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
			cameraReady = true;
			mannequinReady = true;
			modelReady = true;
			// // hand is ready for ball mesh
			// handsWaiting = true;
			// handsAvailable = true;
		});
	});

	function ballMesh() {
		const mesh = new THREE.Mesh(
			new THREE.SphereGeometry(10),
			new THREE.MeshBasicMaterial()
		);
		mesh.castShadow = true;

		return mesh;
	}

	function animate() {
		// ========= captured pose logic

		if (
			runAnimationRef &&
			video &&
			video.readyState >= 2 &&
			poseDetectorAvailable &&
			poseDetector
		) {
			poseDetectorAvailable = false;
			poseDetector.send({ image: video });
		}

		// ========= captured pose logic

		threeScene.onFrameUpdate();

		cannonWorld.onFrameUpdate();

		if (handsWaiting) {
			if (handsEmptyCounter < 60) {
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

			handBallMesh.position.copy(tmpvec);

			threeScene.scene.add(handBallMesh);

			handsAvailable = false;
			handsWaiting = false;
		}

		animationPointer = requestAnimationFrame(animate);
	}

	$: if (cameraReady && mannequinReady && modelReady) {
		animate();
	}
</script>

<div class="bg">
	<video bind:this={video} autoPlay={true} />

	<canvas bind:this={canvas} />
</div>

<style>
	.bg {
		background-color: #654ea3;
	}

	video {
		display: none;
	}
</style>
