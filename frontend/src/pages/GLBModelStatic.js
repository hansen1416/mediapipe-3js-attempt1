import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Slider } from "antd";

import { loadGLTF, dumpObject } from "../components/ropes";

export default function GLBModelStatic() {
	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);

	/**
	 * `Hips` is the ancestor of all obj, move its position, all the others shall follow
	 * `Spine` control entire upper body
	 * `Spine1` control the shoulder,
	 * `Spine2` control the waist,
	 * 
		├─Hips [Bone]
		│ ├─Spine [Bone]
		│ │ └─Spine1 [Bone]
		│ │   └─Spine2 [Bone]
	 *
	 */
	const BodyParts = useRef({
		Hips: null,
		Spine: null,
		Spine1: null,
		Spine2: null,
		Neck: null,
		Head: null,
		LeftShoulder: null,
		LeftArm: null,
		LeftForeArm: null,
		LeftHand: null,
		LeftHandThumb1: null,
		LeftHandThumb2: null,
		LeftHandThumb3: null,
		LeftHandThumb4: null,
		LeftHandIndex1: null,
		LeftHandIndex2: null,
		LeftHandIndex3: null,
		LeftHandIndex4: null,
		LeftHandMiddle1: null,
		LeftHandMiddle2: null,
		LeftHandMiddle3: null,
		LeftHandMiddle4: null,
		LeftHandRing1: null,
		LeftHandRing2: null,
		LeftHandRing3: null,
		LeftHandRing4: null,
		LeftHandPinky1: null,
		LeftHandPinky2: null,
		LeftHandPinky3: null,
		LeftHandPinky4: null,
		RightShoulder: null,
		RightArm: null,
		RightForeArm: null,
		RightHand: null,
		RightHandThumb1: null,
		RightHandThumb2: null,
		RightHandThumb3: null,
		RightHandThumb4: null,
		RightHandIndex1: null,
		RightHandIndex2: null,
		RightHandIndex3: null,
		RightHandIndex4: null,
		RightHandMiddle1: null,
		RightHandMiddle2: null,
		RightHandMiddle3: null,
		RightHandMiddle4: null,
		RightHandRing1: null,
		RightHandRing2: null,
		RightHandRing3: null,
		RightHandRing4: null,
		RightHandPinky1: null,
		RightHandPinky2: null,
		RightHandPinky3: null,
		RightHandPinky4: null,
		LeftUpLeg: null,
		LeftLeg: null,
		LeftFoot: null,
		RightUpLeg: null,
		RightLeg: null,
		RightFoot: null,
	});

	const [BodyPartsList, setBodyPartsList] = useState([]);

	const MODEL_PATH = process.env.PUBLIC_URL + "/models/my.glb";

	useEffect(() => {
		setBodyPartsList(Object.keys(BodyParts.current));

		_scene();

		_camera();

		_light();

		const axesHelper = new THREE.AxesHelper(5);
		scene.current.add(axesHelper);

		_render();

		init();

		return () => {
			renderer.current.dispose();
		};
		// eslint-disable-next-line
	}, []);

	function init() {
		loadGLTF(MODEL_PATH).then((gltf) => {
			const avatar = gltf.scene.children[0];

			console.log(dumpObject(avatar));

			travelModel(avatar);

			avatar.position.set(0, 0, 0);

			scene.current.add(avatar);

			renderer.current.render(scene.current, camera.current);
		});
	}

	function travelModel(model) {
		for (let name in BodyParts.current) {
			if (name === model.name) {
				BodyParts.current[name] = model;
			}
		}

		model.children.forEach((child) => {
			// console.log(child)
			travelModel(child);
		});
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

		camera.current.position.y = 1;
		camera.current.position.x = 0;
		camera.current.position.z = 2;

		// camera.current.rotation.x = -0.1;
	}

	function _light() {
		const color = 0xffffff;
		const amblight = new THREE.AmbientLight(color, 1);
		scene.current.add(amblight);

		const plight = new THREE.PointLight(color, 1);
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
	}

	return (
		<div className="scene" ref={containerRef}>
			<canvas ref={canvasRef}></canvas>
			<div className="right-sider">
				{BodyPartsList.map((name, i1) => {
					return (
						<div key={i1}>
							<span>{name}</span>
							{["x", "y", "z"].map((axis, i2) => {
								return (
									<div key={i2} style={{ display: "flex" }}>
										<div>{axis}</div>
										<div style={{ flexGrow: 1 }}>
											<Slider
												defaultValue={0}
												min={-3.14}
												max={3.14}
												step={0.01}
												onChange={(v) => {
													BodyParts.current[
														name
													].rotation[axis] = v;

													renderer.current.render(
														scene.current,
														camera.current
													);
												}}
											/>
										</div>
										<div>
											<button
												onClick={() => {
													BodyParts.current[
														name
													].rotation[axis] = 0;

													renderer.current.render(
														scene.current,
														camera.current
													);
												}}
											>
												reset
											</button>
										</div>
									</div>
								);
							})}
						</div>
					);
				})}
			</div>
		</div>
	);
}
