import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { Figure } from "../components/figure";
import { tmppose } from "../components/mypose";
import { loadFBX } from "../components/ropes";
import PoseToRotation from "../components/PoseToRotation";

export default function ParticlCloud() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const animationPointer = useRef(0);

	const figure = useRef(null);
	// const fbxmodel = useRef(null);

	useEffect(() => {
		const documentWidth = document.documentElement.clientWidth;
		const documentHeight = document.documentElement.clientHeight;

		_scene(documentWidth, documentHeight);

		animate();

		loadFBX(process.env.PUBLIC_URL + "/Mannequin_Animation.FBX")
			.then
			// (model) => {
			// 	fbxmodel.current = model;
			// 	// scene.current.add(model);

			// 	generateCloud();
			// }
			();

		figure.current = new Figure();

		figure.current.init();

		scene.current.add(figure.current.group);

		generateCloud();

		poseToRotation(tmppose);

		return () => {
			cancelAnimationFrame(animationPointer.current);
		};
	}, []);

	function animate() {
		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	function _scene(viewWidth, viewHeight) {
		const backgroundColor = 0x022244;

		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(backgroundColor);

		camera.current = new THREE.PerspectiveCamera(
			75,
			viewWidth / viewHeight,
			0.1,
			1000
		);

		camera.current.position.set(0, 0, 100);

		{
			const light = new THREE.PointLight(0xffffff, 1);
			// light.position.set(10, 10, 10);
			camera.current.add(light);

			scene.current.add(camera.current);
		}

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
		});

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		renderer.current.setSize(viewWidth, viewHeight);
	}

	function generateCloud() {
		for (let name of figure.current.limbs_arr) {
			figure.current.particleLimb(name);
		}

		// figure.current.rotateLimb(
		// 	"RIGHT_SHOULDER",
		// 	new THREE.Vector3(0.1, -0.5, 0.3).normalize()
		// );

		// figure.current.rotateLimb(
		// 	"RIGHT_ELBOW",
		// 	new THREE.Vector3(0.1, -0.5, 0.3).normalize()
		// );

		// figure.current.setTorsoRotation(
		// 	new THREE.Vector3(-1, 0, 0).normalize()
		// );
	}

	function poseToRotation(posedata) {
		const ptr = new PoseToRotation();

		const {
			TORSO,
			LEFT_SHOULDER,
			LEFT_ELBOW,
			RIGHT_SHOULDER,
			RIGHT_ELBOW,
			LEFT_HIP,
			LEFT_KNEE,
			RIGHT_HIP,
			RIGHT_KNEE,
		} = ptr.getRotations(posedata);

		figure.current.group.setRotationFromMatrix(TORSO);
		figure.current.limbs.LEFT_SHOULDER.group.setRotationFromQuaternion(
			LEFT_SHOULDER
		);
		figure.current.limbs.LEFT_ELBOW.group.setRotationFromQuaternion(
			LEFT_ELBOW
		);
		figure.current.limbs.RIGHT_SHOULDER.group.setRotationFromQuaternion(
			RIGHT_SHOULDER
		);
		figure.current.limbs.RIGHT_ELBOW.group.setRotationFromQuaternion(
			RIGHT_ELBOW
		);
		figure.current.limbs.LEFT_HIP.group.setRotationFromQuaternion(LEFT_HIP);

		figure.current.limbs.LEFT_KNEE.group.setRotationFromQuaternion(
			LEFT_KNEE
		);

		figure.current.limbs.RIGHT_HIP.group.setRotationFromQuaternion(
			RIGHT_HIP
		);

		figure.current.limbs.RIGHT_KNEE.group.setRotationFromQuaternion(
			RIGHT_KNEE
		);
	}

	return (
		<div className="cloud-rove">
			<canvas ref={canvasRef} />
		</div>
	);
}
