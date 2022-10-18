import { useEffect, useRef } from "react";
import "./Home.css";

import * as THREE from "three";
// import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const degreesToRadians = (degrees) => {
	return degrees * (Math.PI / 180);
};

class Figure {
	constructor(scene, params) {
		this.params = {
			x: 0,
			y: 0,
			z: 0,
			ry: 0,
			...params,
		};

		this.headHue = 279;
		this.bodyHue = 132;

		this.headMaterial = new THREE.MeshLambertMaterial({
			color: `hsl(${this.headHue}, 30%, 50%`,
		});
		this.bodyMaterial = new THREE.MeshLambertMaterial({
			color: `hsl(${this.bodyHue}, 85%, 50%)`,
		});

		// this.headMaterial = this.bodyMaterial;

		this.group = new THREE.Group();

		this.group.position.x = this.params.x;
		this.group.position.y = this.params.y;
		this.group.position.z = this.params.z;
		this.group.position.ry = this.params.ry;

		scene.add(this.group);
	}

	createBody() {
		const geometry = new THREE.BoxGeometry(1, 1.5, 1);
		this.body = new THREE.Mesh(geometry, this.bodyMaterial);
		this.group.add(this.body);
	}

	createHead() {
		// Create a new group for the head
		this.head = new THREE.Group();

		// Create the main cube of the head and add to the group
		const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);
		const headMain = new THREE.Mesh(geometry, this.headMaterial);
		this.head.add(headMain);

		// Add the head group to the figure
		this.group.add(this.head);

		// Position the head group
		this.head.position.y = 1.65;

		// Add the eyes by calling the function we already made
		this.createEyes();
	}

	createArms() {
		// Set the variable
		const height = 1;
		const geometry = new THREE.BoxGeometry(0.25, height, 0.25);

		for (let i = 0; i < 2; i++) {
			const armGroup = new THREE.Group();
			const arm = new THREE.Mesh(geometry, this.headMaterial);

			const m = i % 2 === 0 ? 1 : -1;

			armGroup.add(arm);
			this.group.add(armGroup);

			// Translate the arm (not the group) downwards by half the height
			arm.position.y = height * -0.5;

			armGroup.position.x = m * 0.8;
			armGroup.position.y = 0.6;

			armGroup.rotation.z = degreesToRadians(40 * m);

			// Helper
			const box = new THREE.BoxHelper(armGroup, 0xffff00);
			this.group.add(box);
		}
	}

	createEyes() {
		const eyes = new THREE.Group();
		const geometry = new THREE.SphereGeometry(0.15, 12, 8);

		// Define the eye material
		const material = new THREE.MeshLambertMaterial({ color: 0x44445c });

		for (let i = 0; i < 2; i++) {
			const eye = new THREE.Mesh(geometry, material);
			const m = i % 2 === 0 ? 1 : -1;

			// Add the eye to the group
			eyes.add(eye);

			// Position the eye
			eye.position.x = 0.36 * m;
		}

		// in createEyes()
		this.head.add(eyes);

		// Move the eyes forwards by half of the head depth - it might be a good idea to create a variable to do this!
		eyes.position.z = 0.7;
	}

	createLegs() {
		const legs = new THREE.Group();
		const geometry = new THREE.BoxGeometry(0.25, 0.4, 0.25);

		for (let i = 0; i < 2; i++) {
			const leg = new THREE.Mesh(geometry, this.headMaterial);
			const m = i % 2 === 0 ? 1 : -1;

			legs.add(leg);
			leg.position.x = m * 0.22;
		}

		this.group.add(legs);
		legs.position.y = -1.15;

		this.body.add(legs);
	}

	init() {
		this.createBody();
		this.createHead();
		this.createArms();
		this.createLegs();
	}
}

export default function Scene() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);

	useEffect(() => {
		const backgroundColor = 0xf1f1f1;

		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(backgroundColor);
		scene.current.fog = new THREE.Fog(backgroundColor, 60, 100);

		/**
		 * The first attribute is the field of view.
		 * FOV is the extent of the scene that is seen on the display at any given moment.
		 * The value is in degrees.
		 *
		 * The second one is the aspect ratio.
		 * You almost always want to use the width of the element divided by the height,
		 * or you'll get the same result as when you play old movies on a widescreen TV
		 * - the image looks squished.
		 *
		 * The next two attributes are the near and far clipping plane.
		 * What that means, is that objects further away from the camera
		 * than the value of far or closer than near won't be rendered.
		 * You don't have to worry about this now,
		 * but you may want to use other values in your apps to get better performance.
		 */
		camera.current = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);

		(function () {
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
				// const canvas = document.querySelector('#c');
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
						});

						model.scale.set(7, 7, 7);
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
				let hemiLight = new THREE.HemisphereLight(
					0xffffff,
					0xffffff,
					0.61
				);
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
		})();

		// var loader = new GLTFLoader();
		// // var loader = new THREE.GLTFLoader();

		// // const model_path = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb';
		// const model_path = process.env.PUBLIC_URL + `/models/stacy_lightweight.glb`;

		// console.log(model_path)

		// loader.load(
		// 	model_path,
		// 	function(gltf) {
		// 	// A lot is going to happen here
		// 		const model = gltf.scene;
		// 		let fileAnimations = gltf.animations;
		// 	console.log(model)
		// 		scene.current.add(model);
		// 	},
		// 	// called while loading is progressing
		// 	function ( xhr ) {

		// 		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

		// 	},
		// 	function(error) {
		// 		console.error(error);
		// 	}
		// );

		// // console.log(scene.current.toJSON());

		// renderer.current.render(scene.current, camera.current);

		return () => {
			// cancelAnimationFrame(animationframe.current);
			// renderer.current.dispose();
			// document.body.removeChild(renderer.current.domElement);
		};
	}, []);

	return (
		<div>
			<canvas ref={canvasRef}></canvas>
		</div>
	);
}
