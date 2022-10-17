import { useEffect, useRef } from "react";
import "./Home.css";

import * as THREE from "three";
// import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

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
		scene.current = new THREE.Scene();

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

		camera.current.position.z = 5;

		scene.current.add(camera.current);

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
		});
		renderer.current.setSize(window.innerWidth / 2, window.innerHeight / 2);

		let figure = new Figure(scene.current, {
			x: -4,
			y: -2,
			ry: degreesToRadians(35),
		});
		figure.init();

		new THREE.Box3()
			.setFromObject(figure.group)
			.getCenter(figure.group.position)
			.multiplyScalar(-1);

		// direct light
		const lightDirectional = new THREE.DirectionalLight(0xffffff, 1);

		scene.current.add(lightDirectional);

		lightDirectional.position.set(5, 5, 5);

		// env light
		const lightAmbient = new THREE.AmbientLight(0x9eaeff, 0.2);
		scene.current.add(lightAmbient);

		console.log(scene.current.toJSON());

		renderer.current.render(scene.current, camera.current);

		return () => {
			// cancelAnimationFrame(animationframe.current);
			renderer.current.dispose();
			// document.body.removeChild(renderer.current.domElement);
		};
	}, []);

	return (
		<div>
			<canvas ref={canvasRef}></canvas>
		</div>
	);
}
