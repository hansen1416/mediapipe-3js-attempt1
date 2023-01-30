import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Quaternion, Vector3, Matrix4 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { clone } from "lodash";

import {
	loadFBX,
	traverseModel,
	getUpVectors,
	applyTransfer,
	sleep,
	middlePosition,
	posePointsToVector,
} from "../../components/ropes";

export default function MotionInterpreter() {
	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);
	const controls = useRef(null);

	const animationPointer = useRef(0);

	const model = useRef(null);
	const [animationFilename, setanimationFilename] = useState("punch-walk.fbx");
	const [modelPosition, setmodelPosition] = useState({x:0, y:0, z:0});

	const allParts = ['torso', 'upperarm_l', 'lowerarm_l', 'upperarm_r', 'lowerarm_r', 'thigh_l', 'calf_l',  'thigh_r', 'calf_r']
	const [keyParts, setkeyParts] = useState(clone(allParts))


	useEffect(() => {

		_scene(document.documentElement.clientWidth, document.documentElement.clientHeight);

		setTimeout(() => {
			animate();
		}, 0);

		// interpretAnimation();

		return () => {

			cancelAnimationFrame(animationPointer.current);

			controls.current.dispose();
			renderer.current.dispose();
		};
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (model.current) {
			model.current.position.set(modelPosition.x, modelPosition.y, modelPosition.z);
		}
	}, [modelPosition]);

	function _scene(viewWidth, viewHeight) {
		const backgroundColor = 0x022244;

		scene.current = new THREE.Scene();
		scene.current.background = new THREE.Color(backgroundColor);
		
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

		camera.current.position.set(0, 0, 300);

		{
			const light = new THREE.PointLight(0xffffff, 1);
			// light.position.set(10, 10, 10);
			camera.current.add(light);

			scene.current.add(camera.current);
		}

		renderer.current = new THREE.WebGLRenderer({
			canvas: canvasRef.current,
		});

		controls.current = new OrbitControls(camera.current, canvasRef.current);

		renderer.current.setSize(viewWidth, viewHeight);
	}

	function animate() {

		controls.current.update();

		renderer.current.render(scene.current, camera.current);

		animationPointer.current = requestAnimationFrame(animate);
	}

	/**
	 * read the animation data
	 * add `states` for each body part
	 * `states` is the orientation of a body part at a time
	 */
	function loadAnimation() {

		loadFBX(process.env.PUBLIC_URL + "/anims/" + animationFilename)
		.then((result) => {
			model.current = result;

			model.current.position.set(modelPosition.x, modelPosition.y, modelPosition.z);

			scene.current.add(model.current);

			interpretAnimation();
		});
	}

	function interpretAnimation() {
		const parts = {};
		const upVectors = {};

		// read attributes from the model
		traverseModel(model.current, parts);
		getUpVectors(model.current, upVectors);

		(async () => {

			const animation = model.current.animations[0].toJSON();

			let longestTrack = 0;
			let tracks = {};

			// calculate quaternions and vectors for animation tracks
			for (let item of animation["tracks"]) {
				if (item["type"] === "quaternion") {
					const quaternions = [];
					for (let i = 0; i < item["values"].length; i += 4) {
						const q = new Quaternion(
							item["values"][i],
							item["values"][i + 1],
							item["values"][i + 2],
							item["values"][i + 3]
						);

						quaternions.push(q);
					}

					item["quaternions"] = quaternions;
					item["states"] = [];

					if (quaternions.length > longestTrack) {
						longestTrack = quaternions.length;
					}
				}

				if (item["type"] === "vector") {
					const vectors = [];
					for (let i = 0; i < item["values"].length; i += 3) {
						const q = new Vector3(
							item["values"][i],
							item["values"][i + 1],
							item["values"][i + 2]
						);

						vectors.push(q);
					}

					item["vectors"] = vectors;
				}

				if (
					item["type"] === "quaternion" ||
					(item["type"] === "vector" &&
						item["name"] === "root.position")
				) {
					tracks[item["name"]] = item;
				}
			}

			// play the animation, observe the vectors of differnt parts
			for (let i = 0; i < longestTrack; i++) {
				applyTransfer(parts, tracks, i);

				const matrix = getBasisFromModel(parts);

				for (let name in parts) {
					if (
						tracks[name + ".quaternion"] === undefined &&
						tracks[name + ".quaternion"]["states"] === undefined
					) {
						continue;
					}

					const q = new Quaternion();
					const v = upVectors[name].clone();

					parts[name].getWorldQuaternion(q);

					v.applyQuaternion(q);
					v.applyMatrix4(matrix);

					tracks[name + ".quaternion"]["states"].push(v);
				}

				await sleep(16);

				// break;
			}

			animation['tracks'] = Object.values(tracks)

			// todo, use API to save this animation to json file
			console.log(animation["name"], animation);
		
		})();
	}

	function getBasisFromModel(modelParts) {
		const leftshoulder = new Vector3();
		const rightshoulder = new Vector3();

		const hips = new Vector3();

		// modelParts["mixamorigLeftShoulder"].getWorldPosition(leftshoulder);
		// modelParts["mixamorigRightShoulder"].getWorldPosition(rightshoulder);

		modelParts["upperarm_l"].getWorldPosition(leftshoulder);
		modelParts["upperarm_r"].getWorldPosition(rightshoulder);

		modelParts["pelvis"].getWorldPosition(hips);

		// console.log(leftshoulder, rightshoulder, lefthip, righthip);

		const a = middlePosition(leftshoulder, rightshoulder, false);

		// console.log('a,b', a, b);

		const y_basis = posePointsToVector(hips, a, false).normalize();
		const x_basis = posePointsToVector(leftshoulder, a, false).normalize();
		const z_basis = new Vector3()
			.crossVectors(y_basis, x_basis)
			.normalize();

		const originBasis = new Matrix4().makeBasis(
			new Vector3(1, 0, 0),
			new Vector3(0, -1, 0),
			new Vector3(0, 0, 1)
		);

		return originBasis.multiply(
			new Matrix4().makeBasis(x_basis, y_basis, z_basis).invert()
		);
	}

	return (
		<div className="scene" ref={containerRef}>
			<canvas ref={canvasRef}></canvas>
			<div className="btn-box">
				<div>
					{allParts.map((item) => {
						return (
						<div
							key={item}
						>
							<label>
								<input 
									type={'checkbox'}
									checked={keyParts.indexOf(item) !== -1}
									onChange={(e) => {
										let tmp = clone(keyParts)

										if (e.target.checked) {
											tmp.push(item)
										} else {
											tmp = tmp.filter(x => x !== item)
										}

										setkeyParts(tmp)
									}}
								/>
								{item}
							</label>
						</div>
						)
					})}
				</div>
				<div>
					<label>
						name:
						<input
							type={'text'}
							value={animationFilename}
							onChange={(e) => {
								setanimationFilename(e.target.value)
							}}
						/>
					</label>
				</div>
				<div>
					{
						['x', 'y', 'z'].map((axis) => {
							return (<label key={axis}>
								{axis}:
								<input
									type={'text'}
									value={modelPosition[axis]}
									onChange={(e)=>{
										const tmp = clone(modelPosition);
		
										tmp[axis] = e.target.value;
		
										setmodelPosition(tmp);
									}}
									style={{width: '30px'}}
								/>
							</label>)
						})
					}
				</div>
				<div>
					<button
						onClick={loadAnimation}
					>
						load Animation
					</button>
					<button
						onClick={interpretAnimation}
					>
						Interpret
					</button>
				</div>
			</div>
		</div>
	);
}
