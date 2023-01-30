import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { clone } from "lodash";

import {
	degreesToRadians,
	loadFBX,
	traverseModel,
	getUpVectors,
	applyTransfer,
	sleep,
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
	const [modelPosition, setmodelPosition] = useState({x:0, y:0, z:0});
	const [modelRotation, setmodelRotation] = useState({x:0, y:0, z:0});

	const allParts = ['torso', 'upperarm_l', 'lowerarm_l', 'upperarm_r', 'lowerarm_r', 'thigh_l', 'calf_l',  'thigh_r', 'calf_r'];
	const [keyParts, setkeyParts] = useState(clone(allParts));

	const allMuscleGroups = ['chest', 'back', 'arms', 'abdominals', 'legs', 'shoulders'];
	const [muscleGroups, setmuscleGroups] = useState([])

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

	useEffect(() => {
		if (model.current) {
			model.current.rotation.set(degreesToRadians(modelRotation.x), degreesToRadians(modelRotation.y), degreesToRadians(modelRotation.z));
		}
	}, [modelRotation]);

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
	function loadAnimation(file_url) {

		loadFBX(file_url)
		.then((result) => {
			model.current = result;

			model.current.position.set(modelPosition.x, modelPosition.y, modelPosition.z);
			model.current.rotation.set(degreesToRadians(modelRotation.x), degreesToRadians(modelRotation.y), degreesToRadians(modelRotation.z));

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
						const q = new THREE.Quaternion(
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
						const q = new THREE.Vector3(
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

					const q = new THREE.Quaternion();
					const v = upVectors[name].clone();

					parts[name].getWorldQuaternion(q);

					v.applyQuaternion(q);
					v.applyMatrix4(matrix);

					tracks[name + ".quaternion"]["states"].push(v);
				}

				await sleep(16);

				// break;
			}

			animation['tracks'] = Object.values(tracks);

			animation['rotation'] = modelRotation;
			animation['position'] = modelPosition;
			animation['key_parts'] = keyParts;
			animation['muscle_groups'] = muscleGroups;

			// todo, use API to save this animation to json file
			console.log(animation["name"], animation);
		
		})();
	}

	function getBasisFromModel(bones) {
		const leftshoulder = new THREE.Vector3();
        
        bones['upperarm_l'].getWorldPosition(leftshoulder);

        const rightshoulder = new THREE.Vector3();
        
        bones['upperarm_r'].getWorldPosition(rightshoulder);

        const pelvis = new THREE.Vector3();
        
        bones['pelvis'].getWorldPosition(pelvis);

		const x_basis = rightshoulder.sub(leftshoulder);
		const y_tmp = pelvis.sub(leftshoulder);
		const z_basis = new THREE.Vector3()
			.crossVectors(x_basis, y_tmp)
			.normalize();

        const y_basis = new THREE.Vector3()
            .crossVectors(x_basis, z_basis)
            .normalize();

		return new THREE.Matrix4().makeBasis(x_basis, y_basis, z_basis).invert()
	}

	return (
		<div className="scene" ref={containerRef}>
			<canvas ref={canvasRef}></canvas>
			<div className="btn-box">
				<div>
					<label>
						file:
						<input
							type={'file'}
							onChange={(e) => {
								loadAnimation(URL.createObjectURL(e.target.files[0]));
							}}
						/>
					</label>
				</div>
				<hr/>
				<div>
					<span>Position: </span>
					{
						['x', 'y', 'z'].map((axis) => {
							return (<label key={axis}>
								{axis}
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
				<hr/>
				<div>
					<span>Rotation: </span>
					{
						['x', 'y', 'z'].map((axis) => {
							return (<label key={axis}>
								{axis}
								<input
									type={'text'}
									value={modelRotation[axis]}
									onChange={(e)=>{
										const tmp = clone(modelRotation);
		
										tmp[axis] = e.target.value;
		
										setmodelRotation(tmp);
									}}
									style={{width: '30px'}}
								/>
							</label>)
						})
					}
				</div>
				<hr/>
				<div>
					{allParts.map((item) => {
						return (
						<div
							key={item}
						>
							<label>
								{item}
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
							</label>
						</div>
						)
					})}
				</div>
				<hr/>
				<div>
					{
						allMuscleGroups.map((item) => {
							return (<div
								key={item}
							>
								<label>
									{item}
									<input 
										type={'checkbox'}
										checked={muscleGroups.indexOf(item) !== -1}
										onChange={(e) => {
											let tmp = clone(muscleGroups)

											if (e.target.checked) {
												tmp.push(item)
											} else {
												tmp = tmp.filter(x => x !== item)
											}

											setmuscleGroups(tmp)
										}}
									/>
								</label>
							</div>)
						})
					}
				</div>
				<hr/>
				<div>
					<button
						onClick={interpretAnimation}
					>
						Interpret Again
					</button>
				</div>
			</div>
		</div>
	);
}
