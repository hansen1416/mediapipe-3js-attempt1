import { useEffect, useRef } from "react";
import "./Home.css";

import * as THREE from "three";
// import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

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

		this.headMaterial = new THREE.MeshBasicMaterial({
			color: 0x44aa88,
		});
		this.bodyMaterial = new THREE.MeshBasicMaterial({
			color: 0x44aa88,
		});

		// this.headMaterial = this.bodyMaterial;

		this.group = new THREE.Group();

		this.group.position.x = this.params.x;
		this.group.position.y = this.params.y;
		this.group.position.z = this.params.z;
		this.group.position.ry = this.params.ry;

		this.group.rotation.x = 0;
		this.group.rotation.y = 0.3;

		scene.add(this.group);
	}

	createBody() {
		const geometry = new THREE.BoxGeometry(1, 1, 1);
		this.body = new THREE.Mesh(geometry, this.bodyMaterial);
		this.group.add(this.body);
	}

	createHead() {
		// Create a new group for the head
		this.head = new THREE.Group();

		// Create the main cube of the head and add to the group
		const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
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

		const height2 = 0.6;
		const geometry2 = new THREE.BoxGeometry(0.25, height2, 0.25);

		for (let i = 0; i < 2; i++) {
			const armGroup = new THREE.Group();
			const arm = new THREE.Mesh(geometry2, this.headMaterial);

			const m = i % 2 === 0 ? 1 : -1;

			armGroup.add(arm);
			this.group.add(armGroup);

			// Translate the arm (not the group) downwards by half the height
			arm.position.y = height2 * -0.5;

			armGroup.position.x = m * 1.5;
			armGroup.position.y = -0.2;

			armGroup.rotation.z = degreesToRadians(40 * m);

			armGroup.rotation.y = degreesToRadians(40 * m);

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

		// console.log("draw");
	}
}

export default function Scene() {
	const canvasRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);

	useEffect(() => {
		const backgroundColor = 0x363795;

		const viewWidth = document.documentElement.clientWidth;
		const viewHeight = document.documentElement.clientHeight;

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
			viewWidth / viewHeight,
			0.1,
			1000
		);

		const axesHelper = new THREE.AxesHelper(5);
		scene.current.add(axesHelper);

		const figure = new Figure(scene.current);

		figure.init();

		camera.current.position.z = 5;
		camera.current.position.y = 0.5;

		// const canvas = ;

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
		});

		// console.log(canvasRef.current);

		renderer.current.setSize(viewWidth, viewHeight);
		// document.body.appendChild(renderer.current.domElement);

		renderer.current.render(scene.current, camera.current);

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
