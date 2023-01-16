import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { loadFBX, box } from "../../components/ropes";

export default function Sider() {
	const [animationList, setanimationList] = useState([]);

	const sceneInfoList = useRef({});

	const sideSceneRef = useRef(null);
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	function loadAnimationList() {
		return new Promise((resolve) => {
			resolve(["1", "2", "3", "4", "5", "6"]);
		});
	}

	useEffect(() => {
		loadAnimationList().then((data) => {
			setanimationList(data);
		});

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (!animationList || !animationList.length) {
			return;
		}

		const { width, height } = sideSceneRef.current.getBoundingClientRect();

		_scene(width, height);

		Promise.all([
			loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
			loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
			loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
		]).then(([model1, model2, model3]) => {
			model1.position.set(0, 100, 0);

			scene.current.add(model1);
			scene.current.add(model2);
			scene.current.add(model3);

			animate();
		});

		// eslint-disable-next-line
	}, [animationList]);

	function _scene(viewWidth, viewHeight) {
		const backgroundColor = 0x22244;

		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(backgroundColor);

		camera.current = new THREE.OrthographicCamera(
			viewWidth / -2,
			viewWidth / 2,
			viewHeight / 2,
			viewHeight / -2,
			0.1,
			1000
		);

		camera.current.position.set(0, 0, 300);

		{
			const color = 0xffffff;
			const amblight = new THREE.AmbientLight(color, 1);
			scene.current.add(amblight);

			const plight = new THREE.PointLight(color, 1);
			plight.position.set(5, 5, 2);
			scene.current.add(plight);
		}

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
		});

		// controls.current = new OrbitControls(camera.current, canvasRef.current);

		renderer.current.setSize(viewWidth, viewHeight);
	}

	function animate() {
		// if (videoRef.current.readyState >= 2 && counter.current % 6 === 0) {
		// 	(async () => {
		// 		// const timestamp = performance.now();

		// 		const poses = await poseDetector.current.estimatePoses(
		// 			videoRef.current
		// 			// { flipHorizontal: false }
		// 			// timestamp
		// 		);

		// 		console.log(poses);
		// 	})();
		// }

		// controls.current.update();

		renderer.current.render(scene.current, camera.current);

		requestAnimationFrame(animate);
	}

	return (
		<div ref={sideSceneRef} className="sider">
			<canvas ref={canvasRef} />
		</div>
	);
}
