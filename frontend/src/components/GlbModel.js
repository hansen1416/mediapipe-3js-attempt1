import { useEffect, useRef } from "react";

import * as THREE from "three";
// import { Pose } from "@mediapipe/pose";
// import { Camera } from "@mediapipe/camera_utils";

// import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

function dumpObject(obj, lines = [], isLast = true, prefix = "") {
	const localPrefix = isLast ? "└─" : "├─";
	lines.push(
		`${prefix}${prefix ? localPrefix : ""}${obj.name || "*no-name*"} [${
			obj.type
		}]`
	);
	const newPrefix = prefix + (isLast ? "  " : "│ ");
	const lastNdx = obj.children.length - 1;
	obj.children.forEach((child, ndx) => {
		const isLast = ndx === lastNdx;
		dumpObject(child, lines, isLast, newPrefix);
	});
	return lines;
}

export default function GlbModel() {
	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);

	useEffect(() => {
		const backgroundColor = 0x000000;

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

		const hlight = new THREE.AmbientLight(0x404040, 100);
		scene.current.add(hlight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 100);
		directionalLight.position.set(0, 1, 0);
		directionalLight.castShadow = true;
		scene.current.add(directionalLight);

		const light = new THREE.PointLight(0xc4c4c4, 10);
		light.position.set(0, 300, 500);
		scene.current.add(light);

		const light2 = new THREE.PointLight(0xc4c4c4, 10);
		light2.position.set(500, 100, 0);
		scene.current.add(light2);

		const light3 = new THREE.PointLight(0xc4c4c4, 10);
		light3.position.set(0, 100, -500);
		scene.current.add(light3);

		const light4 = new THREE.PointLight(0xc4c4c4, 10);
		light4.position.set(-500, 300, 500);
		scene.current.add(light4);

		// NOT A GOOD EXAMPLE OF HOW TO MAKE A CUBE!
		// Only trying to make it clear most vertices are unique
		const vertices = [
			// front
			{ pos: [-1, -1, 1], norm: [0, 0, 1], uv: [0, 1] }, // 0
			{ pos: [1, -1, 1], norm: [0, 0, 1], uv: [1, 1] }, // 1
			{ pos: [-1, 1, 1], norm: [0, 0, 1], uv: [0, 0] }, // 2
			{ pos: [1, 1, 1], norm: [0, 0, 1], uv: [1, 0] }, // 3
			// right
			{ pos: [1, -1, 1], norm: [1, 0, 0], uv: [0, 1] }, // 4
			{ pos: [1, -1, -1], norm: [1, 0, 0], uv: [1, 1] }, // 5
			{ pos: [1, 1, 1], norm: [1, 0, 0], uv: [0, 0] }, // 6
			{ pos: [1, 1, -1], norm: [1, 0, 0], uv: [1, 0] }, // 7
			// back
			{ pos: [1, -1, -1], norm: [0, 0, -1], uv: [0, 1] }, // 8
			{ pos: [-1, -1, -1], norm: [0, 0, -1], uv: [1, 1] }, // 9
			{ pos: [1, 1, -1], norm: [0, 0, -1], uv: [0, 0] }, // 10
			{ pos: [-1, 1, -1], norm: [0, 0, -1], uv: [1, 0] }, // 11
			// left
			{ pos: [-1, -1, -1], norm: [-1, 0, 0], uv: [0, 1] }, // 12
			{ pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [1, 1] }, // 13
			{ pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [0, 0] }, // 14
			{ pos: [-1, 1, 1], norm: [-1, 0, 0], uv: [1, 0] }, // 15
			// top
			{ pos: [1, 1, -1], norm: [0, 1, 0], uv: [0, 1] }, // 16
			{ pos: [-1, 1, -1], norm: [0, 1, 0], uv: [1, 1] }, // 17
			{ pos: [1, 1, 1], norm: [0, 1, 0], uv: [0, 0] }, // 18
			{ pos: [-1, 1, 1], norm: [0, 1, 0], uv: [1, 0] }, // 19
			// bottom
			{ pos: [1, -1, 1], norm: [0, -1, 0], uv: [0, 1] }, // 20
			{ pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 1] }, // 21
			{ pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 0] }, // 22
			{ pos: [-1, -1, -1], norm: [0, -1, 0], uv: [1, 0] }, // 23
		];
		const numVertices = vertices.length;
		const positionNumComponents = 3;
		const normalNumComponents = 3;
		const uvNumComponents = 2;
		const positions = new Float32Array(numVertices * positionNumComponents);
		const normals = new Float32Array(numVertices * normalNumComponents);
		const uvs = new Float32Array(numVertices * uvNumComponents);
		let posNdx = 0;
		let nrmNdx = 0;
		let uvNdx = 0;
		for (const vertex of vertices) {
			positions.set(vertex.pos, posNdx);
			normals.set(vertex.norm, nrmNdx);
			uvs.set(vertex.uv, uvNdx);
			posNdx += positionNumComponents;
			nrmNdx += normalNumComponents;
			uvNdx += uvNumComponents;
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.BufferAttribute(positions, positionNumComponents)
		);
		geometry.setAttribute(
			"normal",
			new THREE.BufferAttribute(normals, normalNumComponents)
		);
		geometry.setAttribute(
			"uv",
			new THREE.BufferAttribute(uvs, uvNumComponents)
		);

		geometry.setIndex([
			0,
			1,
			2,
			2,
			1,
			3, // front
			4,
			5,
			6,
			6,
			5,
			7, // right
			8,
			9,
			10,
			10,
			9,
			11, // back
			12,
			13,
			14,
			14,
			13,
			15, // left
			16,
			17,
			18,
			18,
			17,
			19, // top
			20,
			21,
			22,
			22,
			21,
			23, // bottom
		]);

		const loader = new THREE.TextureLoader();
		const texture = loader.load(
			"https://r105.threejsfundamentals.org/threejs/resources/images/star.png"
		);

		function makeInstance(geometry, color, x) {
			const material = new THREE.MeshPhongMaterial({
				color,
				map: texture,
			});

			const cube = new THREE.Mesh(geometry, material);
			scene.current.add(cube);

			cube.position.x = x;
			return cube;
		}

		makeInstance(geometry, 0x88ff88, 0);

		camera.current.position.y = 0;
		camera.current.position.x = 0;
		camera.current.position.z = 5;

		camera.current.rotation.y = 0.3;

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
		});

		renderer.current.setSize(viewWidth, viewHeight);

		renderer.current.render(scene.current, camera.current);

		// containerRef.current.addEventListener("mousedown", rotateStart);

		// containerRef.current.addEventListener("click", get3dpos);

		return () => {
			renderer.current.dispose();
		};
		// eslint-disable-next-line
	}, []);

	return (
		<div className="scene" ref={containerRef}>
			<canvas ref={canvasRef}></canvas>
		</div>
	);
}
