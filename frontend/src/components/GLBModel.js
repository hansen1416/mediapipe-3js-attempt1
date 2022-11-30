import { useEffect, useRef } from "react";
import * as THREE from "three";
import { POSE_LANDMARKS } from "@mediapipe/pose";

import { loadGLTF, posePositionToVector, dumpObject } from "./ropes";

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

	const posedata = useRef([]);
	const poseidx = useRef(0);
	const animationFramePointer = useRef(0);
	const animationStep = useRef(0);
	const speed = useRef(3);

	const eulerOrder = "XZY";

	useEffect(() => {
		loadGLTF(process.env.PUBLIC_URL + "/models/my.glb").then((gltf) => {
			const avatar = gltf.scene.children[0];
			

				// console.log(dumpObject(avatar));
			

			travelModel(avatar);

			avatar.position.set(0, 0, 0);

			scene.current.add(avatar);

			renderer.current.render(scene.current, camera.current);

			fetchPose("800-900");
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
			moveSpine(posedata.current[poseidx.current]);

			moveArmHand(posedata.current[poseidx.current], "Left");
			moveArmHand(posedata.current[poseidx.current], "Right");

			moveLegFoot(posedata.current[poseidx.current], "Left");
			moveLegFoot(posedata.current[poseidx.current], "Right");

			renderer.current.render(scene.current, camera.current);

			poseidx.current += 1;
		}

		animationStep.current += 1;

		if (true || poseidx.current >= posedata.current.length) {
			poseidx.current = 0;
			animationStep.current = 0;

			// animationFramePointer.current = requestAnimationFrame(playPose);
			cancelAnimationFrame(animationFramePointer.current);
		} else {
			animationFramePointer.current = requestAnimationFrame(playPose);
		}
	}

	function moveSpine(data) {
		const v01 = new THREE.Vector3(-1, 0, 0);
		const v02 = new THREE.Vector3(0.2, 1, 0).normalize();

		const cross01 = new THREE.Vector3().crossVectors(v01, v02).normalize();
		const cross02 = new THREE.Vector3()
			.crossVectors(cross01, v01)
			.normalize();

		const vt1 = posePositionToVector(
			data[POSE_LANDMARKS["LEFT_HIP"]],
			data[POSE_LANDMARKS["RIGHT_HIP"]]
		).normalize();
		const vt2 = posePositionToVector(
			data[POSE_LANDMARKS["RIGHT_SHOULDER"]],
			data[POSE_LANDMARKS["RIGHT_HIP"]]
		).normalize();

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

		const e_local = new THREE.Euler().setFromQuaternion(
			q_local,
			eulerOrder
		);

		BodyParts.current["Hips"].rotation.set(
			e_local.x,
			e_local.y,
			e_local.z,
			eulerOrder
		);
	}

	function moveArmHand(data, side = "Right") {
		let data_side = "LEFT_";

		if (side === "Left") {
			data_side = "RIGHT_";
		}

		const v_arm_world = posePositionToVector(
			data[POSE_LANDMARKS[data_side + "ELBOW"]],
			data[POSE_LANDMARKS[data_side + "SHOULDER"]]
		).normalize();

		const q_shoulder_world = new THREE.Quaternion();

		BodyParts.current[side + "Shoulder"].getWorldQuaternion(
			q_shoulder_world
		);

		const v_arm_local = v_arm_world
			.clone()
			.applyQuaternion(q_shoulder_world.conjugate());

		const q_arm_local = new THREE.Quaternion().setFromUnitVectors(
			new THREE.Vector3(0, 1, 0),
			v_arm_local
		);

		// const q_existing = BodyParts.current[bodypart_name].quaternion.clone();
		// // eliminate the existing rotation
		// q_local.multiply(q_existing.conjugate());

		// BodyParts.current[bodypart_name].applyQuaternion(q_local);

		const e_arm_local = new THREE.Euler().setFromQuaternion(
			q_arm_local,
			eulerOrder
		);

		BodyParts.current[side + "Arm"].rotation.set(
			e_arm_local.x,
			// e_local.y,
			0,
			e_arm_local.z,
			eulerOrder
		);

		// start forarm
		const v_forearm_world = posePositionToVector(
			data[POSE_LANDMARKS[data_side + "WRIST"]],
			data[POSE_LANDMARKS[data_side + "ELBOW"]]
		).normalize();

		const q_arm_world = new THREE.Quaternion();

		// Arm is the parent of ForeArm
		BodyParts.current[side + "Arm"].getWorldQuaternion(q_arm_world);

		const v_forearm_local = v_forearm_world
			.clone()
			.applyQuaternion(q_arm_world.conjugate());

		const q_forearm_local = new THREE.Quaternion().setFromUnitVectors(
			new THREE.Vector3(0, 1, 0),
			v_forearm_local
		);

		const e_forearm_local = new THREE.Euler().setFromQuaternion(
			q_forearm_local,
			eulerOrder
		);

		BodyParts.current[side + "ForeArm"].rotation.set(
			e_forearm_local.x,
			// e_forearm_local.y,
			0,
			e_forearm_local.z,
			eulerOrder
		);
	}

	function moveFingers(data, side = "Right") {

	}

	function moveLegFoot(data, side = "Right") {
		let data_side = "LEFT_";

		if (side === "Left") {
			data_side = "RIGHT_";
		}

		const v_thigh_world = posePositionToVector(
			data[POSE_LANDMARKS[data_side + "KNEE"]],
			data[POSE_LANDMARKS[data_side + "HIP"]]
		).normalize();

		const q_hips_world = new THREE.Quaternion();

		BodyParts.current["Hips"].getWorldQuaternion(q_hips_world);

		const v_thigh_local = v_thigh_world
			.clone()
			.applyQuaternion(q_hips_world.conjugate());

		const q_thigh_local = new THREE.Quaternion().setFromUnitVectors(
			new THREE.Vector3(0, 1, 0),
			v_thigh_local
		);

		// const q_existing = BodyParts.current[bodypart_name].quaternion.clone();
		// // eliminate the existing rotation
		// q_local.multiply(q_existing.conjugate());

		// BodyParts.current[bodypart_name].applyQuaternion(q_local);

		const e_thigh_local = new THREE.Euler().setFromQuaternion(
			q_thigh_local,
			eulerOrder
		);

		// try to adjust the angle of thigh
		if (side === 'Left') {
			console.log(e_thigh_local.y);
			console.log(v_thigh_local);
			e_thigh_local.y = -2;
		} else {
			console.log(e_thigh_local.y);
		}

		

		BodyParts.current[side + "UpLeg"].rotation.set(
			e_thigh_local.x,
			e_thigh_local.y,
			e_thigh_local.z,
			eulerOrder
		);

		// start crus

		const v_crus_world = posePositionToVector(
			data[POSE_LANDMARKS[data_side + "ANKLE"]],
			data[POSE_LANDMARKS[data_side + "KNEE"]]
		).normalize();

		const q_thigh_world = new THREE.Quaternion();

		// UpLeg is the parent of Leg
		BodyParts.current[side + "UpLeg"].getWorldQuaternion(q_thigh_world);

		const v_crus_local = v_crus_world
			.clone()
			.applyQuaternion(q_thigh_world.conjugate());

		const q_crus_local = new THREE.Quaternion().setFromUnitVectors(
			new THREE.Vector3(0, 1, 0),
			v_crus_local
		);

		const e_crus_local = new THREE.Euler().setFromQuaternion(
			q_crus_local,
			eulerOrder
		);

		BodyParts.current[side + "Leg"].rotation.set(
			e_crus_local.x,
			// e_crus_local.y,
			0,
			e_crus_local.z,
			eulerOrder
		);

		// start foot

		if (true) {

			// vector approach
			const v_foot_world = posePositionToVector(
				data[POSE_LANDMARKS[data_side + "FOOT_INDEX"]],
				data[POSE_LANDMARKS[data_side + "HEEL"]]
			).normalize();

			const q_crus_world = new THREE.Quaternion();

			BodyParts.current[side + "Leg"].getWorldQuaternion(q_crus_world);

			const v_foot_local = v_foot_world
				.clone()
				.applyQuaternion(q_crus_world.conjugate());

			const q_foot_local = new THREE.Quaternion().setFromUnitVectors(
				new THREE.Vector3(0, 1, 0),
				v_foot_local
			);

			const e_foot_local = new THREE.Euler().setFromQuaternion(
				q_foot_local,
				eulerOrder
			);

			// console.log(v_foot_local);

			BodyParts.current[side + "Foot"].rotation.set(
				e_foot_local.x,
				// e_foot_local.y,
				0,
				e_foot_local.z,
				eulerOrder
			);

		} else {

			// vector basis approach

			// the initial position of a foot,
			// basis1x is heel -> foot_index
			// basis1y is heel -> anckle
			const basis1x = new THREE.Vector3(0, 1, 0);
			const basis1y = new THREE.Vector3(0, 0, 1);
			const basis1z = new THREE.Vector3(1, 0, 0);

			const basis2x = posePositionToVector(
				data[POSE_LANDMARKS[data_side + "FOOT_INDEX"]],
				data[POSE_LANDMARKS[data_side + "HEEL"]]
			).normalize();
			const basis2_vec = posePositionToVector(
				data[POSE_LANDMARKS[data_side + "ANKLE"]],
				data[POSE_LANDMARKS[data_side + "HEEL"]]
			).normalize();
			const basis2z = new THREE.Vector3()
			.crossVectors(basis2x, basis2_vec)
			.normalize();
			const basis2y = new THREE.Vector3().crossVectors(basis2x, basis2z).normalize();

			const SE0 = new THREE.Matrix4().makeBasis(basis1x, basis1y, basis1z);
			const SE1 = new THREE.Matrix4().makeBasis(basis2x, basis2y, basis2z);


			// // try to eliminate the rotation of crus for foot
			const q_crus_world = new THREE.Quaternion();

			BodyParts.current[side + "Leg"].getWorldQuaternion(q_crus_world);

			const SEp = new THREE.Matrix4().makeRotationFromQuaternion(q_crus_world)


			// const SEm = SEp.clone().multiply(SE1.clone().invert())


			const q_foot_local = new THREE.Quaternion().setFromRotationMatrix(
				// SE1.multiply(SE0.invert()).multiply(SEp.invert())
				SE1.multiply(SE0.invert())
			);

			const e_foot_local = new THREE.Euler().setFromQuaternion(
				q_foot_local,
				eulerOrder
			);

			BodyParts.current[side + "Foot"].rotation.set(
				e_foot_local.x,
				e_foot_local.y,
				e_foot_local.z,
				eulerOrder
			);
		}


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
