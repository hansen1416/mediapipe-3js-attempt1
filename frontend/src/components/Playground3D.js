import { useEffect, useRef } from "react";

import * as THREE from "three";
// import { Pose } from "@mediapipe/pose";
// import { Camera } from "@mediapipe/camera_utils";
// import { TextGeometry } from 'https://unpkg.com/three@0.138.3/examples/jsm/geometries/TextGeometry.js';
// import {
// 	FontLoader,
// 	TextGeometry,
// } from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";
import { bufferGeo } from "./ropes";

export default function Playground3D() {
	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);

	// the radius of the sphere
	// used to calculate the angle
	// the smaller, the faster the angle changes
	const radius = 100;

	const startAngle = useRef([0, 0]);
	const moveAngle = useRef([0, 0]);

	/**** positions on the body */
	// shoulder to body x
	const sbx = 1.2;
	// deltoid farx, distance away from body
	const dd_fx = -2.2;
	// upper deltoid far z positive
	const udd_fzp = 1.3;

	// bicep far x negative, away from body
	const bfxg = -1.66;
	// bicep far x negative, close from body
	const bp_fxp = 1.39;
	// bicep far z positive
	const bfzp = 1.46;
	// upper bicep far y negative
	const ubp_fary = -6.0;
	// lower bicep far y negative
	const lbp_fary = -9;
	// lower bicep end positove z
	const lbp_pz = 1;

	useEffect(() => {
		_scene();

		_camera();

		_light();

		const unit_size = 0.4;

		const obj = deltoid(unit_size);
		const obj1 = bicep(unit_size);

		scene.current.add(obj);
		scene.current.add(obj1);

		const axesHelper = new THREE.AxesHelper(3);
		scene.current.add(axesHelper);

		_render();

		containerRef.current.addEventListener("mousedown", rotateStart);

		// containerRef.current.addEventListener("click", get3dpos);

		return () => {
			renderer.current.dispose();

			containerRef.current.removeEventListener("mousedown", rotateStart);
		};
		// eslint-disable-next-line
	}, []);

	function deltoid(u) {
		const vertices = [
			// top of shoulder outside

			{ pos: [0, 0.25, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, 0.25, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, 0, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, 0.25, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, 0, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, 0.25, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },

			// top of shoulder inside

			{ pos: [0, 0.25, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [sbx, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, 0.25, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [sbx, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [sbx, 0.1, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [sbx, 0.1, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [sbx, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, 0.25, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [sbx, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, 0.25, 0], norm: [0, 0, 1], uv: [0, 0] },

			// upper deltoid outside

			{ pos: [0, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -1.4, udd_fzp], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -1.4, udd_fzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, udd_fzp], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-0.8, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, 0.7], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, udd_fzp], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-0.8, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, 0, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, 0.7], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1.7, -1.4, 0.7], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, 0, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [dd_fx, -1.4, 0], norm: [0, 0, 1], uv: [0, 0] },

			// upper deltoid inside, positove z

			{ pos: [-0.8, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -1.4, udd_fzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [sbx, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -1.4, udd_fzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [sbx, -1.4, udd_fzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [sbx, -0.3, 1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -1.4, 1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -2.2, 1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [sbx, -1.4, 1.3], norm: [0, 0, 1], uv: [0, 0] },

			// upper deltoid inside, negative z

			{ pos: [-0.8, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [sbx, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -1.4, -udd_fzp], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -1.4, -udd_fzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [sbx, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [sbx, -1.4, -udd_fzp], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [sbx, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -2.2, -1.1], norm: [0, 0, 1], uv: [0, 0] },

			// middle line of upper deltoid

			{ pos: [-1.4, 0, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, -0.7], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [dd_fx, -1.4, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1.4, 0, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, -0.7], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-0.8, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, -0.7], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-0.8, -0.3, -1], norm: [0, 0, 1], uv: [0, 0] },

			// lower deltoid
			{ pos: [0, -1.4, 1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, 1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -2.2, 1.1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -2.2, 1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, 1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, 1.0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, -2.8, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, 1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, 0.7], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, -2.8, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, 0.7], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [dd_fx, -1.4, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, -2.8, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [dd_fx, -1.4, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.2, -3.6, 0], norm: [0, 0, 1], uv: [0, 0] },

			// lower deltoid middle line

			{ pos: [-1.2, -3.6, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [dd_fx, -1.4, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, -1.0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, -2.8, -1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [dd_fx, -1.4, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, -0.7], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, -2.8, -1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.7, -1.4, -0.7], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -2.2, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, -1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, -2.2, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
		];

		for (let i in vertices) {
			vertices[i]["pos"][0] = u * vertices[i]["pos"][0];
			vertices[i]["pos"][1] = u * vertices[i]["pos"][1];
			vertices[i]["pos"][2] = u * vertices[i]["pos"][2];
		}

		return bufferGeo(0xe0ac69, vertices);
	}

	function bicep(u) {
		const vertices = [
			//  upper bicep, negative x, away from body
			{ pos: [0, -2.2, 1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, ubp_fary, bfzp], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, ubp_fary, bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, ubp_fary, bfzp], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, ubp_fary, bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, ubp_fary, 1.2], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1.4, ubp_fary, 1.2], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.2, -3.6, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1.4, ubp_fary, 1.2], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.2, -3.6, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [bfxg, ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },

			//  upper bicep, positive x, close to body

			{ pos: [0, -2.2, 1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, -2.8, 1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [sbx, -1.4, 1.3], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -2.2, 1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, ubp_fary, bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, -2.8, 1.1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, ubp_fary, bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, ubp_fary, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, -2.8, 1.1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [1, -2.8, 1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, ubp_fary, 1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [bp_fxp, ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [1, -2.8, 1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [bp_fxp, ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [bp_fxp, -2.8, 0], norm: [0, 0, 1], uv: [0, 0] },

			//  upper bicep, positive x, close to body, middle line

			{ pos: [1, -2.8, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [bp_fxp, -2.8, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [bp_fxp, ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [1, -2.8, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [bp_fxp, ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, ubp_fary, -1.0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, ubp_fary, -bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, -2.8, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, ubp_fary, -1.0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -2.2, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, -2.8, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, ubp_fary, -bfzp], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -2.2, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [sbx, -1.4, -1.3], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, -2.8, -1.1], norm: [0, 0, 1], uv: [0, 0] },

			// upper bicep middle line

			{ pos: [bfxg, ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.2, -3.6, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, ubp_fary, -1.2], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1.4, ubp_fary, -1.2], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.2, -3.6, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, -1.0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, ubp_fary, -bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, ubp_fary, -1.2], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, -1.0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, ubp_fary, -bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, ubp_fary, -bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, -1.0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, -2.2, -1.1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, ubp_fary, -bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, -2.8, -1.0], norm: [0, 0, 1], uv: [0, 0] },

			// lower bicep

			{ pos: [0, ubp_fary, bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, ubp_fary, bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, lbp_fary, lbp_pz], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, lbp_fary, lbp_pz], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, ubp_fary, bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, lbp_fary, 1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, ubp_fary, bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, ubp_fary, 1.2], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, lbp_fary, 1], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, lbp_fary, 1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, ubp_fary, 1.2], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, lbp_fary, 0.6], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1.4, lbp_fary, 0.6], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, ubp_fary, 1.2], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [bfxg, ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1.4, lbp_fary, 0.6], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [bfxg, ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, lbp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },

			// lower bicep, positive x, positive z, close to body

			{ pos: [0, ubp_fary, bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, lbp_fary, lbp_pz], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, ubp_fary, 1.0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, lbp_fary, lbp_pz], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, lbp_fary, 0.4], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, ubp_fary, 1.0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [1, lbp_fary, 0.4], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [bp_fxp, ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, ubp_fary, 1.0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [1, lbp_fary, 0.4], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, lbp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [bp_fxp, ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },

			// lower bicep, positive x, negative z, close to body

			{ pos: [1, lbp_fary, -0.4], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [bp_fxp, ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, lbp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [1, lbp_fary, -0.4], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, ubp_fary, -1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [bp_fxp, ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, lbp_fary, -lbp_pz], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, ubp_fary, -1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, lbp_fary, -0.4], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, ubp_fary, -bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, ubp_fary, -1.0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, lbp_fary, -lbp_pz], norm: [0, 0, 1], uv: [0, 0] },

			// lower bicep middle line

			{ pos: [-1.4, lbp_fary, -0.6], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, lbp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [bfxg, ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1.4, lbp_fary, -0.6], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [bfxg, ubp_fary, 0], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, ubp_fary, -1.2], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, lbp_fary, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, lbp_fary, -0.6], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, ubp_fary, -1.2], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [-1, ubp_fary, -bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, lbp_fary, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1.4, ubp_fary, -1.2], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, lbp_fary, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, lbp_fary, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, ubp_fary, -bfzp], norm: [0, 0, 1], uv: [0, 0] },

			{ pos: [0, ubp_fary, -bfzp], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [0, lbp_fary, -1], norm: [0, 0, 1], uv: [0, 0] },
			{ pos: [-1, ubp_fary, -bfzp], norm: [0, 0, 1], uv: [0, 0] },
		];

		for (let i in vertices) {
			vertices[i]["pos"][0] = u * vertices[i]["pos"][0];
			vertices[i]["pos"][1] = u * vertices[i]["pos"][1];
			vertices[i]["pos"][2] = u * vertices[i]["pos"][2];
		}

		return bufferGeo(0xf1c27d, vertices);
	}

	function _scene() {
		const backgroundColor = 0x000000;

		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(backgroundColor);
		scene.current.fog = new THREE.Fog(backgroundColor, 60, 100);
	}

	function _camera() {
		const viewWidth = document.documentElement.clientWidth;
		const viewHeight = document.documentElement.clientHeight;
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

		camera.current.position.y = -2;
		camera.current.position.x = 0;
		camera.current.position.z = 5;
	}

	function _light() {
		const color = 0xffffff;
		const amblight = new THREE.AmbientLight(color, 0.3);
		scene.current.add(amblight);

		const plight = new THREE.PointLight(color, 3);
		plight.position.set(5, 5, 2);
		scene.current.add(plight);
	}

	function _render() {
		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
		});

		const viewWidth = document.documentElement.clientWidth;
		const viewHeight = document.documentElement.clientHeight;

		renderer.current.setSize(viewWidth, viewHeight);

		renderer.current.render(scene.current, camera.current);
	}

	function relativePos(eventObj) {
		const box = containerRef.current.getBoundingClientRect();

		const x = eventObj.pageX - box.width / 2;
		const y = eventObj.pageY - box.width / 2;

		return [
			Math.atan(x / radius) - startAngle.current[0],
			Math.atan(y / radius) - startAngle.current[1],
		];
	}

	//跟随鼠标3d转动部分需要用到的函数--------------------------------------------------------开始
	// 旋转开始阶段，计算出鼠标点击时刻的坐标，并由此计算出点击时的空间三维向量，初始化时间和角度，在目标元素上移除事件，在document上绑定事件
	function rotateStart(e) {
		//非常重要，如果没有这一句，会出现鼠标点击抬起无效
		e.preventDefault();
		startAngle.current = relativePos(e);
		// 获得当前已旋转的角度
		// oldAngle = angle;

		// oldTime = new Date().getTime();
		// // 绑定三个事件
		containerRef.current.removeEventListener("mousedown", rotateStart);
		containerRef.current.addEventListener("mousemove", rotate);
		containerRef.current.addEventListener("mouseup", rotateFinish);
	}

	// 旋转函数，计算鼠标经过位置的向量，计算旋转轴，旋转的角度，请求动画，更新每一帧的时间
	function rotate(e) {
		//非常重要，如果没有这一句，会出现鼠标点击抬起无效
		e.preventDefault();
		// 计算鼠标经过轨迹的空间坐标
		moveAngle.current = relativePos(e);

		// figure.current.group.rotation.x = moveAngle.current[1];
		scene.current.rotation.y = moveAngle.current[0];
		scene.current.rotation.x = moveAngle.current[1];

		// console.log(moveAngle.current, scene.current.rotation.x);

		renderer.current.render(scene.current, camera.current);
	}

	/**
	 * [rotateFinish 旋转结束，移除document上的两个绑定事件mousemove & mouseup，重新给目标元素绑定事件mousedown，计算初始矩阵，取消动画]
	 * @return {[type]}   [description]
	 */
	function rotateFinish() {
		startAngle.current = moveAngle.current;

		containerRef.current.removeEventListener("mousemove", rotate);
		containerRef.current.removeEventListener("mouseup", rotateFinish);
		containerRef.current.addEventListener("mousedown", rotateStart);
	}

	return (
		<div className="scene" ref={containerRef}>
			<canvas ref={canvasRef}></canvas>
		</div>
	);
}
