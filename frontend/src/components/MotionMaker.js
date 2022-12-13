import { useEffect, useRef } from "react";
import * as THREE from "three";
// import {
// 	AnimationClip,
// 	AnimationMixer,
// 	QuaternionKeyframeTrack,
// 	Quaternion,
// } from "three";

// import { loadGLTF, posePositionToVector } from "./ropes";
import { loadFBX } from "./ropes";
import Figure from "../models/Figure";
// import Abdomen1 from "../models/Abdomen1";
import { MatchManModel } from "../models/MatchManModel";

export default function MotionMaker(props) {
	const { scene, camera, renderer, controls } = props;

	const figure = useRef(null);
	const matchman = new MatchManModel();

	useEffect(() => {
		const modelpath =
			// process.env.PUBLIC_URL + "/fbx/XBot.fbx";
			process.env.PUBLIC_URL + "/fbx/YBot.fbx";

		loadFBX(modelpath).then((model) => {
			figure.current = model;

			figure.current.position.set(0, -50, 0);

			matchman.get_3dmodel().position.set(0, -120, 0);

			matchman.get_3dmodel().scale.set(20, 20, 20);

			// camera.current.position.set(0, 0, 5);

			scene.current.add(figure.current);

			scene.current.add(matchman.get_3dmodel());

			animate();
		});
		// eslint-disable-next-line
	}, []);

	function animate() {
		requestAnimationFrame(animate);

		// trackball controls needs to be updated in the animation loop before it will work
		controls.current.update();

		renderer.current.render(scene.current, camera.current);
	}

	function playAction() {}

	function fetchPose(action_name) {
		fetch(
			process.env.REACT_APP_API_URL +
				"/pose/data?" +
				new URLSearchParams({
					action_name: action_name,
				}),
			{
				method: "GET", // *GET, POST, PUT, DELETE, etc.
				// mode: 'cors', // no-cors, *cors, same-origin
				// cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
				// credentials: 'same-origin', // include, *same-origin, omit
				// headers: {
				// 	"Content-Type": "multipart/form-data",
				// },
				// redirect: 'follow', // manual, *follow, error
				// referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
				// body: formData, // body data type must match "Content-Type" header
			}
		)
			.then((response) => response.json())
			.then((data) => {
				// poseidx.current = 0;
				// animationStep.current = 0;
				// posedata.current = data.data;
				// console.log(data.data);

				const pose_data = data.data[0];

				matchman.pose_array(pose_data);
				// playPose();
			})
			.catch(function (error) {
				console.warn(error);
			});
	}

	return (
		<div>
			<div className="btn-box">
				<button
					onClick={() => {
						playAction();
					}}
				>
					action1
				</button>
				<button
					onClick={() => {
						fetchPose("1500-1600");
					}}
				>
					action2
				</button>
			</div>
		</div>
	);
}
