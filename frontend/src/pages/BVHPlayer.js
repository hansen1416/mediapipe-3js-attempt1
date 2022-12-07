import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { BVHLoader } from "../components/BVHLoader";

export default function BVHPlayer() {
	const skeletonHelper = useRef(null);

	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);

	const mixer = useRef(null);

	const clock = new THREE.Clock();

	const counter = useRef(0);
	const animation = useRef(0);

	useEffect(() => {
		camera.current = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			1,
			1000
		);
		camera.current.position.set(0, 200, 300);

		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(0xeeeeee);

		scene.current.add(new THREE.GridHelper(400, 10));

		// renderer
		renderer.current = new THREE.WebGLRenderer({
			antialias: true,
			canvas: canvasRef.current,
		});

		const viewWidth = document.documentElement.clientWidth;
		const viewHeight = document.documentElement.clientHeight;

		renderer.current.setSize(viewWidth, viewHeight);

		const controls = new OrbitControls(
			camera.current,
			renderer.current.domElement
		);
		controls.minDistance = 300;
		controls.maxDistance = 700;

		// window.addEventListener("resize", onWindowResize);

		animate();

		const loader = new BVHLoader();
		loader.load(
			process.env.PUBLIC_URL + "/models/out.bvh",
			// process.env.PUBLIC_URL + "/models/out1.bvh",
			function (result) {
				skeletonHelper.current = new THREE.SkeletonHelper(
					result.skeleton.bones[0]
				);
				skeletonHelper.current.skeleton = result.skeleton; // allow animation mixer to bind to THREE.SkeletonHelper directly

				const boneContainer = new THREE.Group();
				boneContainer.add(result.skeleton.bones[0]);

				scene.current.add(skeletonHelper.current);
				scene.current.add(boneContainer);

				// camera.current.position.y = 1;
				// camera.current.position.x = 0;
				camera.current.position.z = 80;

				// play animation
				mixer.current = new THREE.AnimationMixer(
					skeletonHelper.current
				);
				mixer.current
					.clipAction(result.clip)
					.setEffectiveWeight(1.0)
					.play();
			}
		);
	}, []);

	function animate() {
		animation.current = requestAnimationFrame(animate);

		if (counter.current % 3 === 0 && counter.current <= 300) {
			const delta = clock.getDelta();

			if (mixer.current) mixer.current.update(delta);
		}

		counter.current += 1;

		renderer.current.render(scene.current, camera.current);
	}

	return (
		<div className="scene" ref={containerRef}>
			<canvas ref={canvasRef}></canvas>
		</div>
	);
}
