import { useEffect, useRef } from "react";
import * as THREE from "three";
import { POSE_LANDMARKS } from "@mediapipe/pose";

import { loadGLTF, posePositionToVector } from "./ropes";

export default function GLBModel(props) {
	const { scene, renderer, camera } = props;

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
		RightShoulder: null,
		RightArm: null,
		RightForeArm: null,
		RightHand: null,
		LeftUpLeg: null,
		LeftLeg: null,
		LeftFoot: null,
		RightUpLeg: null,
		RightLeg: null,
		RightFoot: null,
	});

	const BodyPartsRotation = useRef([
		[
			"Hips",
			[
				new THREE.Vector3(-1, 0, 0),
				new THREE.Vector3(0.2, 1, 0).normalize(),
			],
			["LEFT_HIP", "RIGHT_HIP", "RIGHT_SHOULDER"],
		],
		["Spine"],
		["Spine1"],
		["Spine2"],
		["Neck"],
		["Head"],
		["LeftShoulder"],
		[
			"LeftArm",
			[new THREE.Vector3(0, 1, 0)],
			["RIGHT_ELBOW", "RIGHT_SHOULDER"],
		],
		[
			"LeftForeArm",
			[new THREE.Vector3(0, 1, 0)],
			["RIGHT_WRIST", "RIGHT_ELBOW"],
		],
		["LeftHand"],
		["RightShoulder"],
		[
			"RightArm",
			[new THREE.Vector3(0, 1, 0)],
			["LEFT_ELBOW", "LEFT_SHOULDER"],
		],
		[
			"RightForeArm",
			[new THREE.Vector3(0, 1, 0)],
			["LEFT_WRIST", "LEFT_ELBOW"],
		],
		["RightHand"],
		[
			"LeftUpLeg",
			[new THREE.Vector3(0, 1, 0)],
			["RIGHT_KNEE", "RIGHT_HIP"],
		],
		[
			"LeftLeg",
			[new THREE.Vector3(0, 1, 0)],
			["RIGHT_ANKLE", "RIGHT_KNEE"],
		],
		[
			"LeftFoot",
			[new THREE.Vector3(0, 1, 0)],
			["RIGHT_FOOT_INDEX", "RIGHT_ANKLE"],
		],
		["RightUpLeg", [new THREE.Vector3(0, 1, 0)], ["LEFT_KNEE", "LEFT_HIP"]],
		["RightLeg", [new THREE.Vector3(0, 1, 0)], ["LEFT_ANKLE", "LEFT_KNEE"]],
		[
			"RightFoot",
			[new THREE.Vector3(0, 1, 0)],
			["LEFT_FOOT_INDEX", "LEFT_ANKLE"],
		],
	]);

	const posedata = useRef([]);
	const poseidx = useRef(0);
	const animationFramePointer = useRef(0);
	const animationStep = useRef(0);
	const speed = useRef(3);

	const eulerOrder = 'XZY';

	useEffect(() => {
		loadGLTF(process.env.PUBLIC_URL + "/models/my.glb").then((gltf) => {
			const avatar = gltf.scene.children[0];

			// console.log(dumpObject(avatar));

			travelModel(avatar);

			avatar.position.set(0, 0, 0);

			scene.current.add(avatar);

			renderer.current.render(scene.current, camera.current);
		});
		// eslint-disable-next-line
	}, []);

	/**
	 * save reference for different body parts
	 * @param {*} model
	 */
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

	function playPose() {
		if (animationStep.current % speed.current === 0) {
			// figure.current.pose_array(posedata.current[poseidx.current]);
			makePose(posedata.current[poseidx.current]);

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

	function makePose(data) {
		for (let i in BodyPartsRotation.current) {
			if (BodyPartsRotation.current[i][1]) {
				if (BodyPartsRotation.current[i][1].length === 2) {
					const vt1 = posePositionToVector(
						data[POSE_LANDMARKS[BodyPartsRotation.current[i][2][0]]],
						data[POSE_LANDMARKS[BodyPartsRotation.current[i][2][1]]]
					).normalize();
					const vt2 = posePositionToVector(
						data[POSE_LANDMARKS[BodyPartsRotation.current[i][2][2]]],
						data[POSE_LANDMARKS[BodyPartsRotation.current[i][2][1]]]
					).normalize();

					rotateBasis(
						BodyPartsRotation.current[i][0],
						BodyPartsRotation.current[i][1],
						[vt1, vt2]
					);
				} else if (BodyPartsRotation.current[i][1].length === 1) {
					const v = posePositionToVector(
						data[POSE_LANDMARKS[BodyPartsRotation.current[i][2][0]]],
						data[POSE_LANDMARKS[BodyPartsRotation.current[i][2][1]]]
					).normalize();

					rotateVector(
						BodyPartsRotation.current[i][0],
						BodyPartsRotation.current[i][1][0],
						v
					);
				}
			}
		}
	}

	function rotateBasis(bodypart_name, from_vectors, to_vectors) {
		const [v01, v02] = from_vectors;

		const cross01 = new THREE.Vector3().crossVectors(v01, v02).normalize();
		const cross02 = new THREE.Vector3()
			.crossVectors(cross01, v01)
			.normalize();

		const [vt1, vt2] = to_vectors;

		const cross11 = new THREE.Vector3().crossVectors(vt1, vt2).normalize();
		const cross12 = new THREE.Vector3()
			.crossVectors(cross11, vt1)
			.normalize();

		const SE0 = new THREE.Matrix4().makeBasis(v01, cross01, cross02);
		const SE1 = new THREE.Matrix4().makeBasis(vt1, cross11, cross12);

		const q_local = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);

		// const q_existing = BodyParts.current[bodypart_name].quaternion.clone();
		// // eliminate the existing rotation
		// q_local.multiply(q_existing.conjugate());

		// BodyParts.current[bodypart_name].applyQuaternion(q_local);

		const e_local = new THREE.Euler().setFromQuaternion(q_local, eulerOrder);

		BodyParts.current[bodypart_name].rotation.set(
			e_local.x,
			e_local.y,
			e_local.z,
			eulerOrder
		);
	}

	function rotateVector(bodypart_name, from_vec_local, to_vec_world) {
		const q_parent_world = new THREE.Quaternion();

		BodyParts.current[bodypart_name].parent.getWorldQuaternion(
			q_parent_world
		);

		const to_vec_local = to_vec_world
			.clone()
			.applyQuaternion(q_parent_world.conjugate());

		const q_local = new THREE.Quaternion().setFromUnitVectors(
			from_vec_local,
			to_vec_local
		);

		// const q_existing = BodyParts.current[bodypart_name].quaternion.clone();
		// // eliminate the existing rotation
		// q_local.multiply(q_existing.conjugate());

		// BodyParts.current[bodypart_name].applyQuaternion(q_local);

		const e_local = new THREE.Euler().setFromQuaternion(q_local, eulerOrder);

		BodyParts.current[bodypart_name].rotation.set(
			e_local.x,
			// e_local.y,
			0,
			e_local.z,
			eulerOrder
		);
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
			</div>
		</div>
	);
}
