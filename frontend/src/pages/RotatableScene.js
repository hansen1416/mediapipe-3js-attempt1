import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { POSE_LANDMARKS } from "@mediapipe/pose";

import { loadGLTF, posePositionToVector } from "../components/ropes";
import { useLocation } from "react-router-dom";

export default function RotatableScene() {
	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);

	const startAngle = useRef([0, 0]);
	const moveAngle = useRef([0, 0]);

	// TODO use GLBmodel as child component
	// apply rotation to all body parts
	const location = useLocation();

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

	const [BodyPartsList, setBodyPartsList] = useState([]);

	const MODEL_PATH = process.env.PUBLIC_URL + "/models/my.glb";

	useEffect(() => {
		setBodyPartsList(Object.keys(BodyParts.current));

		_scene();

		_camera();

		_light();

		_render();

		containerRef.current.addEventListener("mousedown", rotateStart);

		const containerCurrent = containerRef.current;

		init();

		return () => {
			renderer.current.dispose();
			if (containerCurrent) {
				containerCurrent.removeEventListener("mousedown", rotateStart);
			}
		};
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

	function relativePos(eventObj) {
		// the radius of the sphere
		// used to calculate the angle
		// the smaller, the faster the angle changes
		const radius = 100;

		const box = containerRef.current.getBoundingClientRect();

		const x = eventObj.pageX - box.width / 2;
		const y = eventObj.pageY - box.width / 2;

		return [
			Math.atan(x / radius) - startAngle.current[0],
			Math.atan(y / radius) - startAngle.current[1],
		];
	}

	//跟随鼠标3d转动部分需要用到的函数--------------------------------------------------------开始
	// 旋转开始阶段，计算出鼠标点击时刻的坐标，并由此计算出点击时的空间三维向量，初始化时间和角度，在目标元素上移除事件，在document上绑定事件
	function rotateStart(e) {
		//非常重要，如果没有这一句，会出现鼠标点击抬起无效
		e.preventDefault();
		startAngle.current = relativePos(e);
		// 获得当前已旋转的角度
		// oldAngle = angle;

		// oldTime = new Date().getTime();
		// // 绑定三个事件
		containerRef.current.removeEventListener("mousedown", rotateStart);
		containerRef.current.addEventListener("mousemove", rotate);
		containerRef.current.addEventListener("mouseup", rotateFinish);
	}

	// 旋转函数，计算鼠标经过位置的向量，计算旋转轴，旋转的角度，请求动画，更新每一帧的时间
	function rotate(e) {
		//非常重要，如果没有这一句，会出现鼠标点击抬起无效
		e.preventDefault();
		// 计算鼠标经过轨迹的空间坐标
		moveAngle.current = relativePos(e);

		// figure.current.group.rotation.x = moveAngle.current[1];
		scene.current.rotation.y = moveAngle.current[0];
		// scene.current.rotation.x = moveAngle.current[1];

		renderer.current.render(scene.current, camera.current);
	}

	/**
	 * [rotateFinish 旋转结束，移除document上的两个绑定事件mousemove & mouseup，重新给目标元素绑定事件mousedown，计算初始矩阵，取消动画]
	 * @return {[type]}   [description]
	 */
	function rotateFinish() {
		startAngle.current = moveAngle.current;

		containerRef.current.removeEventListener("mousemove", rotate);
		containerRef.current.removeEventListener("mouseup", rotateFinish);
		containerRef.current.addEventListener("mousedown", rotateStart);
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
		<div className="scene" ref={containerRef}>
			<canvas ref={canvasRef}></canvas>
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
