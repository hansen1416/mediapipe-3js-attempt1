import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Slider } from "antd";

import { loadFBX, traverseModel } from "./ropes";

export default function FBXTunning(props) {
	const { scene, camera, renderer, controls } = props;

	const figure = useRef(null);

	const bodyParts = useRef({});

	const [bodyPartsList, setBodyPartsList] = useState([])

	useEffect(() => {
		const modelpath =
			process.env.PUBLIC_URL + "/fbx/XBot.fbx";
			// process.env.PUBLIC_URL + "/fbx/YBot.fbx";

		loadFBX(modelpath).then((model) => {

			figure.current = model;

			console.log(model)

			figure.current.position.set(0, -100, 0);

			traverseModel(figure.current, bodyParts.current);

			const tmplist = [];

			for (let name in bodyParts.current) {
				tmplist.push(name);
			}

			setBodyPartsList(tmplist)

			scene.current.add(figure.current);

			animate();
		});
	}, []);

	function animate() {
		requestAnimationFrame(animate);

		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		// console.log(figure.current)

		renderer.current.render(scene.current, camera.current);
	}

	return <div>
		<div className="right-sider">
			{bodyPartsList.map((name, i1) => {
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
												bodyParts.current[
													name
												].rotation[axis] = v;
											}}
										/>
									</div>
									<div>
										<button
											onClick={() => {
												bodyParts.current[
													name
												].rotation[axis] = 0;
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
	</div>;
}
