import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export function gld_model() {
	// Set our main variables
	let scene,
		renderer,
		camera,
		model, // Our character
		neck, // Reference to the neck bone in the skeleton
		waist, // Reference to the waist bone in the skeleton
		possibleAnims, // Animations found in our file
		mixer, // THREE.js animations mixer
		idle, // Idle, the default state our character returns to
		clock = new THREE.Clock(), // Used for anims, which run to a clock instead of frame rate
		currentlyAnimating = false, // Used to check whether characters neck is being used in another anim
		raycaster = new THREE.Raycaster(); // Used to detect the click on our character

	init();

	function init() {
		const MODEL_PATH =
			process.env.PUBLIC_URL + "/models/stacy_lightweight.glb";
		// const MODEL_PATH =
		// 	process.env.PUBLIC_URL +
		// 	"/models/proportional_low_poly_man__free_download.glb";
		// const MODEL_PATH =
		// 	process.env.PUBLIC_URL + "/models/body_male.glb";

		const canvas = canvasRef.current;
		const backgroundColor = 0x363795;

		// Init the scene
		scene = new THREE.Scene();
		scene.background = new THREE.Color(backgroundColor);
		scene.fog = new THREE.Fog(backgroundColor, 60, 100);

		// Init the renderer
		renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		renderer.shadowMap.enabled = true;
		renderer.setPixelRatio(window.devicePixelRatio);
		document.body.appendChild(renderer.domElement);

		// Add a camera
		camera = new THREE.PerspectiveCamera(
			50,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.z = 30;
		camera.position.x = 0;
		camera.position.y = -3;

		let stacy_txt = new THREE.TextureLoader().load(
			process.env.PUBLIC_URL + "/models/stacy.jpg"
		);
		stacy_txt.flipY = false;

		const stacy_mtl = new THREE.MeshPhongMaterial({
			map: stacy_txt,
			color: 0xffffff,
			// skinning: true,
		});

		var loader = new GLTFLoader();

		loader.load(
			MODEL_PATH,
			function (gltf) {
				model = gltf.scene;
				let fileAnimations = gltf.animations;

				model.traverse((o) => {
					if (o.isMesh) {
						o.castShadow = true;
						o.receiveShadow = true;
						o.material = stacy_mtl;
					}
					// Reference the neck and waist bones
					if (o.isBone && o.name === "mixamorigNeck") {
						neck = o;
					}
					if (o.isBone && o.name === "mixamorigSpine") {
						waist = o;
					}

					if (o.isBone && o.name === "mixamorigLeftArm") {
						// o.position.y = 0;
						// o.position.x = 3;
						// o.position.z = 0;

						o.rotation.z = 0;

						console.log(o);
					}

					if (o.isBone && o.name === "mixamorigRightArm") {
						// o.position.y = 0;
						// o.position.x = 3;
						// o.position.z = 0;

						console.log(o);
					}
				});

				const scaled = 9;

				model.scale.set(scaled, scaled, scaled);
				model.position.y = -11; // the foot was at 0
				model.position.x = 0;
				model.position.z = 0;

				// model.rotate.x = 0;

				scene.add(model);

				// the model loaded

				if (false) {
					mixer = new THREE.AnimationMixer(model);
					let idleAnim = THREE.AnimationClip.findByName(
						fileAnimations,
						"idle"
					);

					idleAnim.tracks.splice(3, 3);
					idleAnim.tracks.splice(9, 3);

					idle = mixer.clipAction(idleAnim);
					idle.play();
				}
			},
			() => {
				// ProgressEvent
				// console.log(xhr);
			},
			function (error) {
				console.error(error);
			}
		);

		// Add lights
		let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
		hemiLight.position.set(0, 50, 0);
		// Add hemisphere light to scene
		scene.add(hemiLight);

		let d = 8.25;
		let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
		dirLight.position.set(-8, 12, 8);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
		dirLight.shadow.camera.near = 0.1;
		dirLight.shadow.camera.far = 1500;
		dirLight.shadow.camera.left = d * -1;
		dirLight.shadow.camera.right = d;
		dirLight.shadow.camera.top = d;
		dirLight.shadow.camera.bottom = d * -1;
		// Add directional Light to scene
		scene.add(dirLight);

		// ===== draw a white floor
		// Floor
		let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
		let floorMaterial = new THREE.MeshPhongMaterial({
			color: 0xeeeeee,
			shininess: 0,
		});

		let floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.rotation.x = -0.5 * Math.PI;
		floor.receiveShadow = true;
		floor.position.y = -11;
		scene.add(floor);
		// ===== draw a white floor
	}

	function update() {
		if (mixer) {
			mixer.update(clock.getDelta());
		}

		if (resizeRendererToDisplaySize(renderer)) {
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		renderer.render(scene, camera);
		requestAnimationFrame(update);
	}

	update();

	function resizeRendererToDisplaySize(renderer) {
		const canvas = renderer.domElement;
		let width = window.innerWidth;
		let height = window.innerHeight;
		let canvasPixelWidth = canvas.width / window.devicePixelRatio;
		let canvasPixelHeight = canvas.height / window.devicePixelRatio;

		const needResize =
			canvasPixelWidth !== width || canvasPixelHeight !== height;
		if (needResize) {
			renderer.setSize(width, height, false);
		}
		return needResize;
	}

	document.addEventListener("mousemove", function (e) {
		return;
		var mousecoords = getMousePos(e);
		if (neck && waist) {
			moveJoint(mousecoords, neck, 50);
			moveJoint(mousecoords, waist, 30);
		}
	});

	function getMousePos(e) {
		return { x: e.clientX, y: e.clientY };
	}

	function moveJoint(mouse, joint, degreeLimit) {
		let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
		joint.rotation.y = degreesToRadians(degrees.x);
		joint.rotation.x = degreesToRadians(degrees.y);
		//   console.log(joint.rotation.x);
	}

	function getMouseDegrees(x, y, degreeLimit) {
		let dx = 0,
			dy = 0,
			xdiff,
			xPercentage,
			ydiff,
			yPercentage;

		let w = { x: window.innerWidth, y: window.innerHeight };

		// Left (Rotates neck left between 0 and -degreeLimit)
		// 1. If cursor is in the left half of screen
		if (x <= w.x / 2) {
			// 2. Get the difference between middle of screen and cursor position
			xdiff = w.x / 2 - x;
			// 3. Find the percentage of that difference (percentage toward edge of screen)
			xPercentage = (xdiff / (w.x / 2)) * 100;
			// 4. Convert that to a percentage of the maximum rotation we allow for the neck
			dx = ((degreeLimit * xPercentage) / 100) * -1;
		}

		// Right (Rotates neck right between 0 and degreeLimit)
		if (x >= w.x / 2) {
			xdiff = x - w.x / 2;
			xPercentage = (xdiff / (w.x / 2)) * 100;
			dx = (degreeLimit * xPercentage) / 100;
		}
		// Up (Rotates neck up between 0 and -degreeLimit)
		if (y <= w.y / 2) {
			ydiff = w.y / 2 - y;
			yPercentage = (ydiff / (w.y / 2)) * 100;
			// Note that I cut degreeLimit in half when she looks up
			dy = ((degreeLimit * 0.5 * yPercentage) / 100) * -1;
		}
		// Down (Rotates neck down between 0 and degreeLimit)
		if (y >= w.y / 2) {
			ydiff = y - w.y / 2;
			yPercentage = (ydiff / (w.y / 2)) * 100;
			dy = (degreeLimit * yPercentage) / 100;
		}
		return { x: dx, y: dy };
	}
}
