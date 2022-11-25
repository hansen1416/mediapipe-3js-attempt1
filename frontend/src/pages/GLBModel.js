import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { POSE_LANDMARKS } from "@mediapipe/pose";

import {
	box,
	unitline,
	loadGLTF,
	middlePosition,
	posePositionToVector,
	// quaternionFromVectors,
	// vectorFromPointsMinus,
	// matrixFromPoints,
	quaternionFromPositions,
} from "../components/ropes";
import { Euler } from "three";

export default function GLBModel() {
	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const scene = useRef(null);
	const camera = useRef(null);
	const renderer = useRef(null);

	const startAngle = useRef([0, 0]);
	const moveAngle = useRef([0, 0]);

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

				moveArms(data0);

				// console.log(data.data[0])

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

	// function dot(color, radius) {
	// 	if (!color) {
	// 		color = 0xffffff;
	// 	}

	// 	if (!radius) {
	// 		radius = 0.01;
	// 	}

	// 	return new THREE.Mesh(
	// 		new THREE.SphereGeometry(radius),
	// 		new THREE.MeshBasicMaterial({ color: color })
	// 	);
	// }

	function moveSpine(data) {
		// move the spine start
		const v01 = new THREE.Vector3(-1, 0, 0);
		const v02 = new THREE.Vector3(0.2, 1, 0).normalize();
		const cross01 = new THREE.Vector3().crossVectors(v01, v02).normalize();
		const cross02 = new THREE.Vector3().crossVectors(cross01, v01).normalize();

		const vt1 = posePositionToVector(data[POSE_LANDMARKS["LEFT_HIP"]], data[POSE_LANDMARKS["RIGHT_HIP"]]).normalize();
		const vt2 = posePositionToVector(data[POSE_LANDMARKS["LEFT_SHOULDER"]], data[POSE_LANDMARKS["LEFT_HIP"]]).normalize();

		const cross11 = new THREE.Vector3().crossVectors(vt1, vt2).normalize();
		const cross12 = new THREE.Vector3().crossVectors(cross11, vt1).normalize();

		const q_spine = quaternionFromPositions(v01, cross01, cross02, vt1, cross11, cross12);
		// BodyParts.current["Hips"].applyQuaternion(quaternion);
		BodyParts.current["Hips"].applyQuaternion(q_spine);
		// move the spine end

		// move the left arm start
		BodyParts.current["LeftShoulder"].rotation.set(0, 0, 0);
		BodyParts.current["LeftArm"].rotation.set(0, 0, 0);


		/**
		{
			"isQuaternion": true,
			"_x": -0.09940845909091443,
			"_y": 0.16007904376804566,
			"_z": 0.6337582701603749,
			"_w": 0.7502287071359022
		}
		*/
		const q = new THREE.Quaternion(-0.09940845909091443,0.16007904376804566,0.6337582701603749,0.7502287071359022);

		BodyParts.current["LeftArm"].applyQuaternion(q);

		// move the left arm end
	}

	function moveArms(data) {
		return;
		const v1 = new THREE.Vector3();
		const v2 = new THREE.Vector3();
		const v3 = new THREE.Vector3();
		const v4 = new THREE.Vector3();

		BodyParts.current["LeftShoulder"].getWorldPosition(v1);
		BodyParts.current["LeftArm"].getWorldPosition(v2);
		BodyParts.current["LeftForeArm"].getWorldPosition(v3);
		BodyParts.current["LeftHand"].getWorldPosition(v4);

		const gp = new THREE.Group();

		gp.position.x = 1;
		gp.position.y = 0;
		gp.position.z = 0;

		const b1 = box(0.01);
		const b2 = box(0.01);
		const b3 = box(0.01);
		const b4 = box(0.01);

		b1.position.set(v1.x, v1.y, v1.z);
		b2.position.set(v2.x, v2.y, v2.z);
		b3.position.set(v3.x, v3.y, v3.z);
		b4.position.set(v4.x, v4.y, v4.z);

		// const l1 = unitline(v2, v3);
		// const l2 = unitline(v3, v4);

		// console.log(BodyParts.current["LeftShoulder"].rotation)

		// console.log(BodyParts.current["LeftArm"].rotation)

		// l1.rotation.x = -BodyParts.current["LeftArm"].rotation.y
		// l1.rotation.y = -BodyParts.current["LeftArm"].rotation.z
		// l1.rotation.z = -BodyParts.current["LeftArm"].rotation.x

		// l1.add(l2)

		// l2.position.set(0,0,0)

		// l2.rotation.x = -BodyParts.current["LeftForeArm"].rotation.y
		// l2.rotation.y = -BodyParts.current["LeftForeArm"].rotation.z
		// l2.rotation.z = -BodyParts.current["LeftForeArm"].rotation.x

		const varm = v3.clone().sub(v2).normalize();
		const vfarm = v4.clone().sub(v3).normalize();

		const qs = new THREE.Quaternion().setFromEuler(
			BodyParts.current["LeftShoulder"].rotation
		);

		// console.log(qs);
		// console.log(qs.normalize());
		// console.log(qs.conjugate());

		const varmt = posePositionToVector(
			data[POSE_LANDMARKS["LEFT_ELBOW"]],
			data[POSE_LANDMARKS["LEFT_SHOULDER"]]
		).normalize();

		// console.log(varmt);

		const qt = new THREE.Quaternion().setFromUnitVectors(
			new THREE.Vector3(0, 1, 0),
			varmt
		);
		// const qt = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,1));

		const et = new THREE.Euler().setFromQuaternion(qt);

		// console.log(et);

		BodyParts.current["LeftShoulder"].rotation.set(0, 0, 0);
		BodyParts.current["LeftArm"].rotation.set(0, 0, 0);

		BodyParts.current["LeftArm"].applyQuaternion(qt);

		// const qx = new THREE.Quaternion().multiplyQuaternions(qt, qs.conjugate());

		// console.log(qx);
		// console.log(qx.normalize());

		// const e = new THREE.Euler().setFromQuaternion(qx);

		// console.log(e)

		// // BodyParts.current["LeftArm"].applyQuaternion(qx)
		// BodyParts.current["LeftArm"].rotation.set(e.x, e.y, e.z)

		// console.log(varm, vfarm);

		// const vfarmt = posePositionToVector(data[POSE_LANDMARKS['LEFT_WRIST']], data[POSE_LANDMARKS['LEFT_ELBOW']]).normalize();

		// console.log(varmt, vfarmt);

		// const q1 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0), varmt);

		// // l1.applyQuaternion(q1);

		// const e1 = new THREE.Euler().setFromQuaternion(q1);

		// console.log(e1);

		gp.add(b1);
		gp.add(b2);
		gp.add(b3);
		gp.add(b4);

		// gp.add(l1);
		// gp.add(l2);

		scene.current.add(gp);

		// const p1 = BodyParts.current["LeftArm"].position;
		// const p2 = BodyParts.current["LeftForeArm"].position;
		// const p3 = BodyParts.current["LeftHand"].position;

		// const a1 = new THREE.Vector3(p1.z, p1.y, p1.x);
		// const b1 = new THREE.Vector3(p2.z, p2.y, p2.x);
		// const c1 = new THREE.Vector3(p3.z, p3.y, p3.x);

		// const a2 = new THREE.Vector3(...data[POSE_LANDMARKS["LEFT_SHOULDER"]]);
		// const b2 = new THREE.Vector3(...data[POSE_LANDMARKS["LEFT_ELBOW"]]);
		// const c2 = new THREE.Vector3(...data[POSE_LANDMARKS["LEFT_WRIST"]]);

		// const quaternion = quaternionFromPositions(a1, b1, c1, a2, b2, c2);

		// const e = new THREE.Euler().setFromQuaternion(quaternion);

		// console.log(e);

		// BodyParts.current["LeftArm"].applyQuaternion(quaternion);
		// BodyParts.current["LeftShoulder"].position.x = 1.2;

		// BodyParts.current["LeftArm"].rotation.set(1.29, -0.74, 1.55);
		// BodyParts.current["LeftForeArm"].rotation.set(0, 0, 2.3);

		// BodyParts.current["RightArm"].rotation.set(-1.29, -0.74, -1.55);
		// BodyParts.current["RightForeArm"].rotation.set(0, 0, -2.3);

		// BodyParts.current["LeftForeArm"].position.x = 1;

		// // the arm is originally a vector 1,0,0
		// const o1 = new THREE.Vector3(1, 0, 0);
		// let p11 = data[POSE_LANDMARKS["LEFT_SHOULDER"]];
		// let p12 = data[POSE_LANDMARKS["LEFT_ELBOW"]];
		// p11 = [p11[2], p11[1], p11[0]];
		// p12 = [p12[2], p12[1], p12[0]];
		// const v1 = posePositionToVector(p11, p12);
		// const q1 = quaternionFromVectors(o1, v1);
		// BodyParts.current["LeftArm"].applyQuaternion(q1);
		// // the arm is originally a vector 1,0,0
		// const o3 = new THREE.Vector3(1, 0, 0);
		// let p21 = data[POSE_LANDMARKS["LEFT_ELBOW"]];
		// let p22 = data[POSE_LANDMARKS["LEFT_WRIST"]];
		// p21 = [p21[2], p21[1], p21[0]];
		// p22 = [p22[2], p22[1], p22[0]];
		// const v3 = posePositionToVector(p21, p22);
		// const q3 = quaternionFromVectors(o3, v3);
		// BodyParts.current["LeftForeArm"].applyQuaternion(q3);
		// // the arm is originally a vector 1,0,0
		// const o2 = new THREE.Vector3(-1, 0, 0);
		// const v2 = posePositionToVector(
		// 	data[POSE_LANDMARKS["RIGHT_SHOULDER"]],
		// 	data[POSE_LANDMARKS["RIGHT_ELBOW"]]
		// );
		// const q2 = quaternionFromVectors(o2, v2);
		// BodyParts.current["RightArm"].applyQuaternion(q2);
		// // the arm is originally a vector 1,0,0
		// const o4 = new THREE.Vector3(-1, 0, 0);
		// const v4 = posePositionToVector(
		// 	data[POSE_LANDMARKS["RIGHT_ELBOW"]],
		// 	data[POSE_LANDMARKS["RIGHT_WRIST"]]
		// );
		// const q4 = quaternionFromVectors(o4, v4);
		// BodyParts.current["RightForeArm"].applyQuaternion(q4);
	}

	function experiment() {
		const c1 = new THREE.Vector3(0, 1, 0);
		const c2 = new THREE.Vector3(-0.3, 0, 0.8).normalize();
		const c3 = new THREE.Vector3(-1, 0, 0);
		const c4 = new THREE.Vector3(0.8, 0.3, 0).normalize();

		const angle = c1.angleTo(c2);
		console.log(angle);

		const c12 = new THREE.Vector3().crossVectors(c1, c2);
		// const c21 = new THREE.Vector3().crossVectors(c2, c1);
		console.log(c12);

		const q1 = new THREE.Quaternion().setFromUnitVectors(c1, c3);

		console.log(q1)

		const c34 = c12.applyQuaternion(q1);

		console.log(c34);

		// const q2 = new THREE.Quaternion().setFromAxisAngle(c34, angle);

		// const r = c3.clone().applyQuaternion(q2);

		// console.log(r.normalize())

		// c3.applyQuaternion(cq1);

		// console.log(c3)
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
				<button onClick={experiment}>experiment</button>
			</div>
		</div>
	);
}
