import { useEffect, useRef, useState } from "react";
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

	const [BodyPartsRotation, setBodyPartsRotation] = useState({
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

	const MODEL_PATH = process.env.PUBLIC_URL + "/models/my.glb";

	useEffect(() => {
		init();

		return () => {};
		// eslint-disable-next-line
	}, []);

	function init() {
		loadGLTF(MODEL_PATH).then((gltf) => {
			const avatar = gltf.scene.children[0];

			// console.log(dumpObject(avatar));

			travelModel(avatar);

			avatar.position.set(0, 0, 0);

			scene.current.add(avatar);

			renderer.current.render(scene.current, camera.current);
		});
	}

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
				const data0 = data.data[0];

				for (let i in data0) {
					data0[i][0] *= -1;
					data0[i][1] *= -1;
					data0[i][2] *= -1;
				}

				moveSpine(data0);

				renderer.current.render(scene.current, camera.current);
			})
			.catch(function (error) {
				console.log(
					error.message,
					error.response,
					error.request,
					error.config
				);
			});
	}

	function moveSpine(data) {
		//======== move the spine start
		/**
		 * first find the proper quaternion for the spine
		 *
		 * assume the initial basis of a human figure is -1, 0, 0,for right hip, 0,0,0 for left hip, 0.2,1,0 for left shoulder
		 * these 3 points also form a coords basis
		 *
		 * the source of the pose is from mediapose data, using positions of LEFT_HIP,RIGHT_HIP,RIGHT_SHOULDER
		 * these 3 points form a coords basis, note that, in mediapose, left and right are swapped
		 *
		 */
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

		const q_spine = new THREE.Quaternion().setFromRotationMatrix(
			SE1.multiply(SE0.invert())
		);
		// BodyParts.current["Hips"].applyQuaternion(quaternion)
		BodyParts.current["Hips"].applyQuaternion(q_spine);
		//= == == == = move the spine end

		// ---------- move the left arm start

		// BodyParts.current["LeftShoulder"].rotation.y = 1;

		const vec_arm_world = posePositionToVector(
			data[POSE_LANDMARKS["RIGHT_ELBOW"]],
			data[POSE_LANDMARKS["RIGHT_SHOULDER"]]
		).normalize();

		const q_arm_world_shoulder = new THREE.Quaternion();

		BodyParts.current["LeftShoulder"].getWorldQuaternion(
			q_arm_world_shoulder
		);

		const vec_arm_spine = vec_arm_world
			.clone()
			.applyQuaternion(q_arm_world_shoulder);

		const vec_arm_spine_origin = new THREE.Vector3(0, 1, 0);

		const q_arm_spine = new THREE.Quaternion().setFromUnitVectors(
			vec_arm_spine_origin,
			vec_arm_spine
		);

		const q_arm_spine_existing =
			BodyParts.current["LeftArm"].quaternion.clone();
		// eliminate the existing rotation
		q_arm_spine.multiply(q_arm_spine_existing.conjugate());

		BodyParts.current["LeftArm"].applyQuaternion(q_arm_spine);
		// ---------- move the left arm end

		// ------------ rotate left forarm start

		const vec_forearm_world = posePositionToVector(
			data[POSE_LANDMARKS["RIGHT_WRIST"]],
			data[POSE_LANDMARKS["RIGHT_ELBOW"]]
		).normalize();

		const q_arm_world = new THREE.Quaternion();

		BodyParts.current["LeftArm"].getWorldQuaternion(q_arm_world);

		const vec_forearm_arm = vec_forearm_world
			.clone()
			.applyQuaternion(q_arm_world.conjugate());

		const vec_forearm_arm_origin = new THREE.Vector3(0, 1, 0);

		const q_forearm_arm = new THREE.Quaternion().setFromUnitVectors(
			vec_forearm_arm_origin,
			vec_forearm_arm
		);

		const q_forearm_spine_existing =
			BodyParts.current["LeftForeArm"].quaternion.clone();
		// eliminate the existing rotation
		q_forearm_arm.multiply(q_forearm_spine_existing.conjugate());

		BodyParts.current["LeftForeArm"].applyQuaternion(q_forearm_arm);

		// ------------ rotate left forarm end
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
				<button onClick={() => {}}>experiment</button>
			</div>
		</div>
	);
}
