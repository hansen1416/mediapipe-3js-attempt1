import { useEffect, useRef } from "react";
import * as THREE from "three";
// import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useLocation } from "react-router-dom";

import FBXPlayer from "../components/FBXPlayer";
import MotionMaker from "../components/MotionMaker";

export default function ThreeJsScene() {
	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const location = useLocation();

	useEffect(() => {
		_scene();

		_light();

		return () => {
			controls.current.dispose();
			renderer.current.dispose();
		};
		// eslint-disable-next-line
	}, []);

	function _scene() {
		const backgroundColor = 0x22244;

		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(backgroundColor);
		// scene.current.fog = new THREE.Fog(backgroundColor, 60, 100);

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

		camera.current.position.set(0, 0, 240);

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
		});

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		renderer.current.setSize(viewWidth, viewHeight);
	}

	function _light() {
		const color = 0xffffff;
		const amblight = new THREE.AmbientLight(color, 1);
		scene.current.add(amblight);

		const plight = new THREE.PointLight(color, 1);
		plight.position.set(5, 5, 2);
		scene.current.add(plight);
	}

	return (
		<div className="scene" ref={containerRef}>
			<canvas ref={canvasRef}></canvas>
			{location.pathname === "/motionmaker" && (
				<MotionMaker
					scene={scene}
					camera={camera}
					renderer={renderer}
					controls={controls}
				/>
			)}
			{location.pathname === "/fbxloader" && (
				<FBXPlayer
					scene={scene}
					camera={camera}
					renderer={renderer}
					controls={controls}
				/>
			)}
		</div>
	);
}
