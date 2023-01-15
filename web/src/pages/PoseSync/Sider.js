import { useEffect } from "react";

import { loadFBX } from "../../components/ropes";

export default function Sider({ scene, animation_name, class_name }) {
	const [animationList, setanimationList] = useState([]);

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
		sceneInfoList.current["main"] = createScene(
			document.getElementById("main_scene")
		);

		document.querySelectorAll("[data-animation]").forEach((elem) => {
			sceneInfoList.current[elem.dataset["animation"]] =
				createScene(elem);
		});

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
			alpha: true,
		});

		renderer.current.setSize(
			document.documentElement.clientWidth,
			document.documentElement.clientHeight
		);

		renderer.current.setScissorTest(false);
		renderer.current.clear(true, true);
		renderer.current.setScissorTest(true);

		loadAnimations(animationList);

		animate();

		// eslint-disable-next-line
	}, [animationList]);

	function createScene(elem) {
		const scene = new THREE.Scene();

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
		controls.noPan = true;

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

	useEffect(() => {
		if (scene) {
			Promise.all([
				loadFBX(process.env.PUBLIC_URL + "/fbx/mannequin.fbx"),
			]).then(([model]) => {
				console.log(model);
				scene.add(model);
			});
		}

		// eslint-disable-next-line
	}, [scene]);

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
			const { scene, camera, controls, elem } =
				sceneInfoList.current[key];

			// get the viewport relative position of this element
			const { left, right, top, bottom, width, height } =
				elem.getBoundingClientRect();

			if (bottom < 0 || top > document.documentElement.clientWidth) {
				continue;
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
		<div className="sider">
			{animationList.map((name) => {
				return (
					// <SiderAnimation
					// 	key={name}
					// 	scene={sceneList[name]}
					// 	animation_name={name}
					// 	class_name="animation-scene"
					// />
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
