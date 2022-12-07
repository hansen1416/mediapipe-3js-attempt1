import { useEffect, useRef } from "react";
// import * as THREE from "three";
// import { POSE_LANDMARKS } from "@mediapipe/pose";

// import { loadGLTF, posePositionToVector } from "./ropes";
import { loadGLTF } from "./ropes";
import Figure from "../models/Figure";

export default function GLBModel(props) {
	const { scene, renderer, camera } = props;

	const posedata = useRef([]);
	const poseidx = useRef(0);
	const animationFramePointer = useRef(0);
	const animationStep = useRef(0);
	const speed = useRef(3);

	const figure = useRef(null);

	useEffect(() => {
		loadGLTF(process.env.PUBLIC_URL + "/models/my.glb").then((gltf) => {
			const avatar = gltf.scene.children[0];

			// console.log(dumpObject(avatar));

			// travelModel(avatar);

			avatar.position.set(0, 0, 0);

			scene.current.add(avatar);

			figure.current = new Figure(avatar);

			renderer.current.render(scene.current, camera.current);

			// fetchPose("800-900");
		});
		// eslint-disable-next-line
	}, []);

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
				for (let i in data.data) {
					for (let j in data.data[i]) {
						data.data[i][j][0] *= -1;
						data.data[i][j][1] *= -1;
						data.data[i][j][2] *= -1;
					}
				}

				poseidx.current = 0;

				animationStep.current = 0;

				posedata.current = data.data;

				playPose();
			})
			.catch(function (error) {
				console.warn(error);
			});
	}

	function fetchLandmarks(action_name) {
		fetch(
			process.env.REACT_APP_API_URL +
				"/pose/landmarks?" +
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
				for (let i in data.data) {
					for (let j in data.data[i]) {
						data.data[i][j][0] *= -1;
						data.data[i][j][1] *= -1;
						data.data[i][j][2] *= -1;
					}
				}

				poseidx.current = 0;

				animationStep.current = 0;

				posedata.current = data.data;

				playPose();
			})
			.catch(function (error) {
				console.warn(error);
			});
	}

	function playPose() {
		if (animationStep.current % speed.current === 0) {
			// moveSpine(posedata.current[poseidx.current]);

			// moveArmHand(posedata.current[poseidx.current], "Left");
			// moveArmHand(posedata.current[poseidx.current], "Right");

			// moveLegFoot(posedata.current[poseidx.current], "Left");
			// moveLegFoot(posedata.current[poseidx.current], "Right");

			figure.current.makePose(posedata.current[poseidx.current]);

			renderer.current.render(scene.current, camera.current);

			poseidx.current += 1;
		}

		animationStep.current += 1;

		if (poseidx.current >= posedata.current.length) {
			poseidx.current = 0;
			animationStep.current = 0;

			// animationFramePointer.current = requestAnimationFrame(playPose);
			cancelAnimationFrame(animationFramePointer.current);
		} else {
			animationFramePointer.current = requestAnimationFrame(playPose);
		}
	}

	function fetchPoseRotation(rotation_name) {
		fetch(
			process.env.REACT_APP_API_URL +
				"/pose/rotations?" +
				new URLSearchParams({
					rotation_name: rotation_name,
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
				figure.current.makePoseFromRotation(data);

				renderer.current.render(scene.current, camera.current);
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
						fetchPose("800-900");
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
				<button
					onClick={() => {
						fetchPose("2300-2400");
					}}
				>
					action3
				</button>
				<button
					onClick={() => {
						fetchLandmarks("1500-1575");
					}}
				>
					action4
				</button>
				<button
					onClick={() => {
						fetchPoseRotation("out");
					}}
				>
					action5
				</button>
				<button
					onClick={() => {
						fetchPoseRotation("out1");
					}}
				>
					action6
				</button>
			</div>
		</div>
	);
}
