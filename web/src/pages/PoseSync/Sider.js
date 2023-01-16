import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { loadFBX, box } from "../../components/ropes";

export default function Sider() {
	const [animationList, setanimationList] = useState([]);

	const sceneInfoList = useRef({});

	const container = useRef(null);
	const canvasRef = useRef(null);

	const renderer = useRef(null);

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

		// create main scene
		document.querySelectorAll(".animation-scene").forEach((elem) => {
			sceneInfoList.current[elem.dataset["animation"]] = createScene(elem);
		});

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
			alpha: true,
		});

		const {width, height} = container.current.getBoundingClientRect();

		renderer.current.setSize(width, height);

		renderer.current.setScissorTest(false);
		renderer.current.clear(true, true);
		renderer.current.setScissorTest(true);

		Promise.all([
			loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
		]).then(([model]) => {
			
			for (let i in sceneInfoList.current) {
				const {scene} = sceneInfoList.current[i];
// console.log(scene)
				const b = box(100)

				// scene.add(model.clone())
				scene.add(b)
			}

			animate();
		});

		// eslint-disable-next-line
	}, [animationList]);

	function createScene(elem) {
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x22244);

		const rect = elem.getBoundingClientRect();
		const { width, height } = rect;

		const camera = new THREE.PerspectiveCamera(
			75,
			width / height,
			0.1,
			1000
		);
		camera.position.set(0, 0, 300);
		// camera.lookAt(0, 0, 0);

		const controls = new OrbitControls(camera, elem);

		scene.add(camera);

		{
			const color = 0xffffff;
			const intensity = 1;
			const light = new THREE.DirectionalLight(color, intensity);
			light.position.set(-1, 2, 4);
			camera.add(light);
		}

		return { scene, camera, controls, elem };
	}

	function animate() {
		requestAnimationFrame(animate);

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

		for (let key in sceneInfoList.current) {
			const { scene, camera, elem } = sceneInfoList.current[key];

			// get the viewport relative position of this element
			const { left, top, bottom, width, height } =
				elem.getBoundingClientRect();

			if (bottom < 0 || top > document.documentElement.clientWidth) {
				// continue;
			}

			// camera.aspect = width / height;
			// camera.updateProjectionMatrix();
			// // controls.handleResize();
			// controls.update()

			renderer.current.setScissor(left, top, width, height);
			renderer.current.setViewport(left, top, width, height);

			renderer.current.render(scene, camera);
		}
	}

	return (
		<div
			ref={container}
			className="sider"
		>
			<canvas
				ref={canvasRef}
				style={{zIndex: -1, position: "absolute"}}
			/>
			{animationList.map((name) => {
				return (
					<div
						key={name}
						data-animation={name}
						className="animation-scene"
					></div>
				);
			})}
		</div>
	);
}
